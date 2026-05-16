// Sprint 37.K (F89) — Server actions Sonnet 4.6 du wizard piliers.
//
// Deux étapes :
//   1. generatePillarQuestions(brandId)
//      → 5 questions guidées dynamiques pour creuser un nouveau pilier.
//   2. generatePillarPropositions(brandId, questionsAnswers)
//      → 3 propositions { title, description } basées sur les réponses.
//
// Modèle : claude-sonnet-4-6 (V1, pas de cascade — coût/latence acceptables
// sur ce flow user-initiated court).
//
// Pattern emprunté à app/_actions/propose-piliers.ts (Sprint 37.F F46).

'use server'

import Anthropic, { APIError } from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { extractJsonFromText } from '@/lib/programme/generation'
import {
  SYSTEM_PROMPT_PILLAR_QUESTIONS,
  SYSTEM_PROMPT_PILLAR_PROPOSITIONS,
  buildPillarQuestionsUserPrompt,
  buildPillarPropositionsUserPrompt,
} from '@/lib/pillars/prompts'

const MODELS_CASCADE = ['claude-sonnet-4-6', 'claude-sonnet-4-5'] as const
const MAX_TOKENS = 1024
const TEMPERATURE = 0.7
const TIMEOUT_MS = 30_000

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<{ text: string; model: string }> {
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
              text: systemPrompt,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: userPrompt }],
        },
        { timeout: TIMEOUT_MS },
      )
      const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => ('text' in b ? b.text : ''))
        .join('')
        .trim()
      return { text, model }
    } catch (err) {
      const is404 = err instanceof APIError && err.status === 404
      if (!is404) throw err instanceof Error ? err : new Error(String(err))
    }
  }
  throw new Error('cascade modèles épuisée')
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers : charge brand + piliers existants (RLS via tenant_id du profil)
// ─────────────────────────────────────────────────────────────────────────

type BrandContext = {
  brand: {
    id: string
    name: string | null
    secteur: string | null
    ton: string | null
    singularite: string | null
    positionnement: string | null
    audience_principale: string | null
  }
  existingPillars: ReadonlyArray<{ title: string; description: string }>
}

async function loadBrandContext(
  admin: SupabaseClient,
  tenantId: string,
  brandId: string,
): Promise<BrandContext | null> {
  const { data: rawBrand } = await admin
    .from('brands')
    .select('id, name, secteur, ton, singularite, positionnement, audience_principale')
    .eq('id', brandId)
    .eq('tenant_id', tenantId)
    .maybeSingle()
  const brand = rawBrand as BrandContext['brand'] | null
  if (!brand) return null

  const { data: rawPillars } = await admin
    .from('pillars')
    .select('title, description')
    .eq('brand_id', brandId)
    .eq('tenant_id', tenantId)
    .is('archived_at', null)
    .order('position', { ascending: true })
  const existingPillars =
    (rawPillars as Array<{ title: string; description: string }> | null) ?? []

  return { brand, existingPillars }
}

// ─────────────────────────────────────────────────────────────────────────
// Étape 1 — generatePillarQuestions
// ─────────────────────────────────────────────────────────────────────────

export type PillarQuestion = {
  id: string
  label: string
  placeholder: string
}

export type GeneratePillarQuestionsResult =
  | { ok: true; questions: ReadonlyArray<PillarQuestion> }
  | { ok: false; reason: string }

function validateQuestions(json: unknown): ReadonlyArray<PillarQuestion> {
  if (!json || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  if (!Array.isArray(obj.questions)) return []
  const out: PillarQuestion[] = []
  for (const q of obj.questions) {
    if (!q || typeof q !== 'object') continue
    const o = q as Record<string, unknown>
    const id = typeof o.id === 'string' ? o.id.trim() : ''
    const label = typeof o.label === 'string' ? o.label.trim() : ''
    const placeholder = typeof o.placeholder === 'string' ? o.placeholder.trim() : ''
    if (id && label) {
      out.push({ id, label: label.slice(0, 200), placeholder: placeholder.slice(0, 120) })
    }
  }
  return out.slice(0, 5)
}

export async function generatePillarQuestions(
  brandId: string,
): Promise<GeneratePillarQuestionsResult> {
  const t0 = Date.now()
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
  const tenantId = (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) return { ok: false, reason: 'Tenant non provisionné' }

  const admin = createAdmin() as unknown as SupabaseClient
  const ctx = await loadBrandContext(admin, tenantId, brandId)
  if (!ctx) return { ok: false, reason: 'Marque introuvable' }

  console.info('[pillar-wizard] questions_start', { tenantId, brandId })

  const userPrompt = buildPillarQuestionsUserPrompt({
    brand: ctx.brand,
    existingPillars: ctx.existingPillars,
  })

  let rawText: string
  try {
    const res = await callAnthropic(SYSTEM_PROMPT_PILLAR_QUESTIONS, userPrompt)
    rawText = res.text
    console.info('[pillar-wizard] questions_response', { ms: Date.now() - t0, model: res.model })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'API Anthropic injoignable'
    console.error('[pillar-wizard] questions_failed', { message })
    return { ok: false, reason: message }
  }

  const cleaned = extractJsonFromText(rawText)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('[pillar-wizard] questions_invalid_json', { raw: rawText.slice(0, 300) })
    return { ok: false, reason: 'Réponse mal formée' }
  }
  const questions = validateQuestions(parsed)
  if (questions.length !== 5) {
    console.error('[pillar-wizard] questions_wrong_count', { count: questions.length })
    return { ok: false, reason: `Attendu 5 questions, reçu ${questions.length}` }
  }
  return { ok: true, questions }
}

// ─────────────────────────────────────────────────────────────────────────
// Étape 2 — generatePillarPropositions
// ─────────────────────────────────────────────────────────────────────────

export type PillarProposition = {
  title: string
  description: string
}

export type GeneratePillarPropositionsResult =
  | { ok: true; propositions: ReadonlyArray<PillarProposition> }
  | { ok: false; reason: string }

export type QuestionAnswer = {
  label: string
  answer: string
}

function validatePropositions(json: unknown): ReadonlyArray<PillarProposition> {
  if (!json || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  if (!Array.isArray(obj.propositions)) return []
  const out: PillarProposition[] = []
  for (const p of obj.propositions) {
    if (!p || typeof p !== 'object') continue
    const o = p as Record<string, unknown>
    const title = typeof o.title === 'string' ? o.title.trim() : ''
    const description = typeof o.description === 'string' ? o.description.trim() : ''
    if (title && description) {
      out.push({
        title: title.slice(0, 50),
        description: description.slice(0, 500),
      })
    }
  }
  return out.slice(0, 3)
}

export async function generatePillarPropositions(
  brandId: string,
  questionsAnswers: ReadonlyArray<QuestionAnswer>,
): Promise<GeneratePillarPropositionsResult> {
  const t0 = Date.now()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  // Filtre les réponses non vides.
  const filtered = questionsAnswers
    .map((qa) => ({ label: qa.label.trim(), answer: qa.answer.trim() }))
    .filter((qa) => qa.label.length > 0 && qa.answer.length > 0)
  if (filtered.length < 1) {
    return { ok: false, reason: 'Au moins une réponse est nécessaire' }
  }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) return { ok: false, reason: 'Tenant non provisionné' }

  const admin = createAdmin() as unknown as SupabaseClient
  const ctx = await loadBrandContext(admin, tenantId, brandId)
  if (!ctx) return { ok: false, reason: 'Marque introuvable' }

  console.info('[pillar-wizard] propositions_start', {
    tenantId,
    brandId,
    nAnswers: filtered.length,
  })

  const userPrompt = buildPillarPropositionsUserPrompt({
    brand: ctx.brand,
    existingPillars: ctx.existingPillars,
    questionsAnswers: filtered,
  })

  let rawText: string
  try {
    const res = await callAnthropic(SYSTEM_PROMPT_PILLAR_PROPOSITIONS, userPrompt)
    rawText = res.text
    console.info('[pillar-wizard] propositions_response', { ms: Date.now() - t0, model: res.model })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'API Anthropic injoignable'
    console.error('[pillar-wizard] propositions_failed', { message })
    return { ok: false, reason: message }
  }

  const cleaned = extractJsonFromText(rawText)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('[pillar-wizard] propositions_invalid_json', { raw: rawText.slice(0, 300) })
    return { ok: false, reason: 'Réponse mal formée' }
  }
  const propositions = validatePropositions(parsed)
  if (propositions.length !== 3) {
    console.error('[pillar-wizard] propositions_wrong_count', { count: propositions.length })
    return { ok: false, reason: `Attendu 3 propositions, reçu ${propositions.length}` }
  }
  return { ok: true, propositions }
}
