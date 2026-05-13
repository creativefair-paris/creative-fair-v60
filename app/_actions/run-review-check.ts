// Sprint 37.A (F8) — Server action runReviewCheck.
//
// Consulte TF Éditorial Magazine + Archives & Mémoire en mode
// fact-check via Anthropic Opus 4.7 (claude-opus-4-5). Renvoie un
// payload structuré (fact-check + crédit visuel + crédit prêt à
// coller) et persiste sur la row reviews.
//
// Pas de streaming V1 (cohérent avec runConseillerTurn). Le client
// affiche un état PENDING le temps de l'attente.

'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import { buildReviewsSystemPrompt } from '@/lib/reviews/system-prompt'
import { FACT_CHECK_POST_SUBPROMPT } from '@/lib/reviews/scenarios/fact-check-post'
import { CREDIT_VISUAL_ONLY_SUBPROMPT } from '@/lib/reviews/scenarios/credit-visual-only'
import type {
  FactCheckItem,
  ReviewPayload,
  VisualCredit,
} from '@/lib/reviews/types'

const MIN_TEXT_LENGTH = 50

export type RunReviewInput = {
  reviewId: string
}

export type RunReviewOutput =
  | { ok: true; payload: ReviewPayload }
  | { ok: false; reason: string }

function getAnthropicClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  return new Anthropic({ apiKey: key })
}

function fallbackPayload(postText: string, visual: string | null): ReviewPayload {
  // Hors-ligne : renvoie un payload "à vérifier" sur le texte + crédit
  // inconnu sur le visuel. Permet de tester le squelette UI sans API.
  const sentences =
    postText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8)
      .slice(0, 3) ?? []
  const factCheck: FactCheckItem[] = sentences.map((s) => ({
    statement: s,
    status: 'a_verifier' as const,
    suggested_source:
      'Mode hors-ligne (pas de clé Anthropic). Branche la clé pour activer le fact-check réel.',
  }))
  const credit: VisualCredit = {
    auteur: 'inconnu',
    archive: 'inconnu',
    annee: 'inconnu',
    licence: 'inconnu',
    alternative: visual
      ? 'Mode hors-ligne. Branche la clé Anthropic pour identification visuelle.'
      : 'Aucun visuel fourni.',
  }
  return {
    fact_check: factCheck,
    visual_credit: credit,
    ready_to_paste_credit: '© Source inconnue / inconnu / inconnu / inconnu',
  }
}

function tryParseJSON(text: string): ReviewPayload | null {
  // Extrait le premier bloc JSON valide de la réponse (tolérant aux
  // balises markdown ```json ... ```).
  const cleaned = text
    .replace(/^```(?:json)?\s*/, '')
    .replace(/```\s*$/, '')
    .trim()
  try {
    const parsed = JSON.parse(cleaned) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const p = parsed as Record<string, unknown>
    const factCheck = Array.isArray(p['fact_check']) ? p['fact_check'] : []
    const visualCredit =
      p['visual_credit'] && typeof p['visual_credit'] === 'object'
        ? (p['visual_credit'] as VisualCredit)
        : null
    const ready =
      typeof p['ready_to_paste_credit'] === 'string'
        ? p['ready_to_paste_credit']
        : ''
    return {
      fact_check: factCheck as FactCheckItem[],
      visual_credit: visualCredit,
      ready_to_paste_credit: ready,
    }
  } catch {
    return null
  }
}

export async function runReviewCheck(
  input: RunReviewInput,
): Promise<RunReviewOutput> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId =
    (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) return { ok: false, reason: 'Tenant non provisionné' }

  // Load review row (RLS appliquée).
  const { data: rawReview, error: loadErr } = await supabase
    .from('reviews')
    .select('id, post_text, visual_url, visual_uploaded_path, state')
    .eq('id', input.reviewId)
    .maybeSingle()
  if (loadErr || !rawReview) {
    return { ok: false, reason: 'Review introuvable' }
  }
  const review = rawReview as {
    id: string
    post_text: string | null
    visual_url: string | null
    visual_uploaded_path: string | null
    state: string
  }

  const postText = (review.post_text ?? '').trim()
  const visualRef = review.visual_url ?? review.visual_uploaded_path ?? null

  // Sélection du sub-prompt selon présence de texte.
  const subPrompt =
    postText.length >= MIN_TEXT_LENGTH
      ? FACT_CHECK_POST_SUBPROMPT
      : CREDIT_VISUAL_ONLY_SUBPROMPT

  const systemPrompt = buildReviewsSystemPrompt({ scenarioSubPrompt: subPrompt })

  const userPayloadText = [
    postText.length > 0 ? `Texte du post à vérifier :\n${postText}` : null,
    visualRef ? `Référence visuel : ${visualRef}` : null,
  ]
    .filter(Boolean)
    .join('\n\n')

  // Appel Anthropic + fallback hors-ligne.
  const anthropic = getAnthropicClient()
  let payload: ReviewPayload
  if (anthropic) {
    try {
      const completion = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userPayloadText }],
      })
      const content = completion.content[0]
      const text = content && content.type === 'text' ? content.text : ''
      const parsed = tryParseJSON(text)
      payload = parsed ?? fallbackPayload(postText, visualRef)
    } catch (err) {
      console.warn('[runReviewCheck] Anthropic call failed:', err)
      payload = fallbackPayload(postText, visualRef)
    }
  } else {
    payload = fallbackPayload(postText, visualRef)
  }

  // Persistance.
  const admin = createAdmin()
  const adminReviews = admin as unknown as {
    from: (t: 'reviews') => {
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{
          error: { message: string } | null
        }>
      }
    }
  }
  const { error: updErr } = await adminReviews
    .from('reviews')
    .update({
      fact_check_payload: payload.fact_check,
      visual_credit_payload: payload.visual_credit,
      ready_to_paste_credit: payload.ready_to_paste_credit,
      state: 'COMPLETED',
    })
    .eq('id', review.id)
  if (updErr) {
    return { ok: false, reason: `Persist failed: ${updErr.message}` }
  }

  return { ok: true, payload }
}
