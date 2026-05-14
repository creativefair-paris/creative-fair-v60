// Sprint 37.E (F47+F53) — Server action : génère les 4-6 explications
// pédagogiques post-génération du plan.

'use server'

import Anthropic, { APIError } from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { extractJsonFromText } from '@/lib/programme/generation'
import { A1_PEDAGOGY_PROMPT } from '@/lib/conseiller/scenarios/A1-pedagogy-prompt'

const MODELS_CASCADE = ['claude-opus-4-5', 'claude-opus-4-1', 'claude-sonnet-4-5'] as const
const MAX_TOKENS = 1024
const TEMPERATURE = 0.65
const TIMEOUT_MS = 45_000

export type PedagogyExplanation = {
  title: string
  content: string
}

export type PedagogyResult =
  | { ok: true; explanations: ReadonlyArray<PedagogyExplanation> }
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
            { type: 'text', text: A1_PEDAGOGY_PROMPT, cache_control: { type: 'ephemeral' } },
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
      if (!is404) {
        const message = err instanceof Error ? err.message : String(err)
        throw new Error(message)
      }
    }
  }
  throw new Error('cascade modèles épuisée')
}

function validateExplanations(json: unknown): ReadonlyArray<PedagogyExplanation> {
  if (!json || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  if (!Array.isArray(obj.explanations)) return []
  const out: PedagogyExplanation[] = []
  for (const raw of obj.explanations) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    if (typeof r.title !== 'string' || typeof r.content !== 'string') continue
    out.push({ title: r.title.slice(0, 100), content: r.content.slice(0, 500) })
  }
  return out
}

export async function generatePedagogyExplanations(
  programmeId: string,
): Promise<PedagogyResult> {
  const t0 = Date.now()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const admin = createAdmin() as unknown as SupabaseClient
  console.info('[pedagogy] start', { programmeId })

  const { data: rawProg } = await admin
    .from('programmes')
    .select('id, tenant_id, brand_id, date_debut, date_fin, arc_narratif, context_generation')
    .eq('id', programmeId)
    .maybeSingle()
  const programme = rawProg as {
    id: string
    tenant_id: string
    brand_id: string
    date_debut: string | null
    date_fin: string | null
    arc_narratif: unknown
    context_generation: unknown
  } | null
  if (!programme) return { ok: false, reason: 'Programme introuvable' }

  const { data: rawPosts } = await admin
    .from('posts')
    .select('format, structure_type, pilier_nom, objectif_editorial')
    .eq('programme_id', programmeId)
  const posts = (rawPosts as Array<{
    format: string | null
    structure_type: string | null
    pilier_nom: string | null
    objectif_editorial: string | null
  }> | null) ?? []

  const { data: rawBrand } = await admin
    .from('brands')
    .select('name, secteur, ton, singularite, piliers_narratifs')
    .eq('id', programme.brand_id)
    .maybeSingle()
  const brand = rawBrand as {
    name: string | null
    secteur: string | null
    ton: string | null
    singularite: string | null
    piliers_narratifs: unknown
  } | null

  const piliers = Array.isArray(brand?.piliers_narratifs)
    ? brand!.piliers_narratifs
        .map((p) => (p && typeof p === 'object' && 'nom' in p ? (p as { nom: string }).nom : null))
        .filter(Boolean)
    : []

  const wizardResponses =
    programme.context_generation && typeof programme.context_generation === 'object'
      ? ((programme.context_generation as { wizardResponses?: unknown }).wizardResponses ?? null)
      : null

  const userPrompt = `CONTEXTE :

Marque : ${brand?.name ?? 'inconnue'}
Secteur : ${brand?.secteur ?? '—'}
Singularité : ${brand?.singularite ?? '—'}
Ton : ${brand?.ton ?? '—'}
Piliers : ${piliers.join(', ') || '(non posés)'}

Plan généré : ${posts.length} posts, du ${programme.date_debut ?? '?'} au ${programme.date_fin ?? '?'}.
Répartition formats : ${countBy(posts.map((p) => p.format))}
Répartition piliers : ${countBy(posts.map((p) => p.pilier_nom))}

Réponses wizard (extraits) :
${JSON.stringify(wizardResponses, null, 2).slice(0, 1500)}

Maintenant produis le JSON pédagogique selon le schéma exact.`

  let rawText: string
  try {
    rawText = await callAnthropic(userPrompt)
    console.info('[pedagogy] anthropic_response', { ms: Date.now() - t0, length: rawText.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Anthropic injoignable'
    console.error('[pedagogy] anthropic_failed', { ms: Date.now() - t0, message })
    return { ok: false, reason: message }
  }
  const cleaned = extractJsonFromText(rawText)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('[pedagogy] invalid_json', { raw: rawText.slice(0, 500) })
    return { ok: false, reason: 'Réponse pédagogique mal formée' }
  }
  const explanations = validateExplanations(parsed)
  if (explanations.length === 0) {
    return { ok: false, reason: 'Aucune explication produite' }
  }
  console.info('[pedagogy] done', { ms: Date.now() - t0, count: explanations.length })
  return { ok: true, explanations }
}

function countBy(arr: ReadonlyArray<string | null>): string {
  const counts = new Map<string, number>()
  for (const v of arr) {
    if (!v) continue
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([k, n]) => `${k}=${n}`)
    .join(', ') || '(aucun)'
}
