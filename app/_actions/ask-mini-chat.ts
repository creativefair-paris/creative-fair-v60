// Sprint 37.F (F48) — Server action : mini-chat sur un post du calendrier.
//
// Tour court (2-4 phrases max), pair senior, tutoiement. Au-delà de 2-3
// tours côté UI, on bascule vers /outils/conseiller scénario B2.

'use server'

import Anthropic, { APIError } from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

const MODELS_CASCADE = ['claude-opus-4-5', 'claude-opus-4-1', 'claude-sonnet-4-5'] as const
const MAX_TOKENS = 384
const TEMPERATURE = 0.7
const TIMEOUT_MS = 30_000

const SYSTEM_PROMPT_MINI_CHAT = `Tu réponds à une question rapide d'un pilote sur un post de son programme éditorial.

Posture :
- Pair senior. Pas de flatterie. Du factuel.
- Tutoiement par défaut.
- 2 à 4 phrases courtes. Pas plus.
- Vocabulaire interdit : stats, analytics, dashboard, performance, growth, KPI, métrique.
- "Conseiller" en minuscule.
- Pas de markdown, pas de bullets, pas d'emoji.
- Pas de tiret long.

Si la question demande de RÉÉCRIRE COMPLÈTEMENT le post ou DÉCLENCHE UN BESOIN
DE CONVERSATION COMPLÈTE, suggère explicitement de basculer :
  "Pour ça, on bascule en discussion plus large →"
`

export type AskMiniChatResult =
  | { ok: true; text: string }
  | { ok: false; reason: string }

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function callAnthropic(userPrompt: string): Promise<string> {
  for (const model of MODELS_CASCADE) {
    try {
      const response = await anthropicClient.messages.create(
        {
          model,
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE,
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT_MINI_CHAT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: userPrompt }],
        },
        { timeout: TIMEOUT_MS },
      )
      return response.content
        .filter((b) => b.type === 'text')
        .map((b) => ('text' in b ? b.text : ''))
        .join('')
        .trim()
    } catch (err) {
      const is404 = err instanceof APIError && err.status === 404
      if (!is404) throw err instanceof Error ? err : new Error(String(err))
    }
  }
  throw new Error('cascade modèles épuisée')
}

export async function askMiniChat(
  postId: string,
  question: string,
): Promise<AskMiniChatResult> {
  if (!question.trim()) return { ok: false, reason: 'Question vide' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const admin = createAdmin() as unknown as SupabaseClient

  const { data: rawPost } = await admin
    .from('posts')
    .select('format, structure_type, pilier_nom, objectif_editorial, angle, date_prevue, tenant_id, brand_id')
    .eq('id', postId)
    .maybeSingle()
  const post = rawPost as {
    format: string | null
    structure_type: string | null
    pilier_nom: string | null
    objectif_editorial: string | null
    angle: string | null
    date_prevue: string | null
    tenant_id: string
    brand_id: string
  } | null
  if (!post) return { ok: false, reason: 'Post introuvable' }

  const { data: rawBrand } = await admin
    .from('brands')
    .select('name, ton, singularite')
    .eq('id', post.brand_id)
    .maybeSingle()
  const brand = rawBrand as {
    name: string | null
    ton: string | null
    singularite: string | null
  } | null

  const userPrompt = `CONTEXTE POST :
- Format : ${post.format ?? '—'}
- Type structurel : ${post.structure_type ?? '—'}
- Pilier mobilisé : ${post.pilier_nom ?? '—'}
- Date prévue : ${post.date_prevue ?? '—'}
- Objectif éditorial : ${post.objectif_editorial ?? '—'}
- Idée éditoriale : ${post.angle ?? '—'}

CONTEXTE MARQUE :
- Nom : ${brand?.name ?? 'inconnue'}
- Ton : ${brand?.ton ?? '—'}
- Singularité : ${brand?.singularite ?? '—'}

QUESTION DU PILOTE :
"${question.trim()}"

Réponds en 2-4 phrases.`

  try {
    const text = await callAnthropic(userPrompt)
    return { ok: true, text }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Anthropic injoignable'
    console.error('[mini-chat] failed', { message })
    return { ok: false, reason: message }
  }
}
