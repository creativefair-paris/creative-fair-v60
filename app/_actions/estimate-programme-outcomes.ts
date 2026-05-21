// Sprint 37.H (F73 — Section 3) — Server action : estime l'évolution
// des chiffres marque sur la période du programme. Fourchettes obligatoires.

'use server'

import Anthropic, { APIError } from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { extractJsonFromText } from '@/lib/programme/generation'
import {
  SYSTEM_PROMPT_STRATEGIE_ESTIMATIONS,
  buildStrategieEstimationsUserPrompt,
} from '@/lib/programme/strategie-estimations-prompt'

const MODELS_CASCADE = ['claude-opus-4-5', 'claude-opus-4-1', 'claude-sonnet-4-5'] as const
const MAX_TOKENS = 1024
const TEMPERATURE = 0.55
const TIMEOUT_MS = 45_000

export type EstimationItem = {
  metric_type: string
  label: string
  avant: number
  apres_min: number
  apres_max: number
  evolution_pct_min: number
  evolution_pct_max: number
}

export type EstimationsResult =
  | {
      ok: true
      estimations: ReadonlyArray<EstimationItem>
      warning: string
      limites: string
    }
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
              text: SYSTEM_PROMPT_STRATEGIE_ESTIMATIONS,
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

function validateEstimations(json: unknown): {
  estimations: ReadonlyArray<EstimationItem>
  warning: string
  limites: string
} | null {
  if (!json || typeof json !== 'object') return null
  const obj = json as Record<string, unknown>
  if (!Array.isArray(obj.estimations)) return null
  if (typeof obj.warning !== 'string' || obj.warning.trim().length === 0) return null
  if (typeof obj.limites !== 'string' || obj.limites.trim().length === 0) return null

  const out: EstimationItem[] = []
  for (const raw of obj.estimations) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    if (typeof r.metric_type !== 'string' || typeof r.label !== 'string') continue
    const toNum = (v: unknown) =>
      typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN
    const avant = toNum(r.avant)
    const apres_min = toNum(r.apres_min)
    const apres_max = toNum(r.apres_max)
    const evolution_pct_min = toNum(r.evolution_pct_min)
    const evolution_pct_max = toNum(r.evolution_pct_max)
    if ([avant, apres_min, apres_max, evolution_pct_min, evolution_pct_max].some((n) => Number.isNaN(n))) continue
    // Rule : doit être une fourchette (min < max), sinon on saute.
    if (apres_min >= apres_max) continue
    // Rule : évolution conservatrice <= 20% V1.
    if (Math.abs(evolution_pct_max) > 20) continue
    out.push({
      metric_type: r.metric_type,
      label: r.label.slice(0, 60),
      avant,
      apres_min,
      apres_max,
      evolution_pct_min,
      evolution_pct_max,
    })
  }
  return {
    estimations: out.slice(0, 6),
    warning: obj.warning.slice(0, 300),
    limites: obj.limites.slice(0, 300),
  }
}

export async function estimateProgrammeOutcomes(programmeId: string): Promise<EstimationsResult> {
  const t0 = Date.now()
  // Sprint 41-secu-compte (A) : tenant context obligatoire.
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
  const userTenantId = (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!userTenantId) return { ok: false, reason: 'Tenant non provisionné' }

  const admin = createAdmin() as unknown as SupabaseClient

  const { data: rawProg } = await admin
    .from('programmes')
    .select('id, tenant_id, brand_id, date_debut, date_fin')
    .eq('id', programmeId)
    .eq('tenant_id', userTenantId)
    .maybeSingle()
  const programme = rawProg as {
    id: string
    tenant_id: string
    brand_id: string
    date_debut: string | null
    date_fin: string | null
  } | null
  if (!programme) return { ok: false, reason: 'Programme introuvable' }

  const { data: rawBrand } = await admin
    .from('brands')
    .select('name')
    .eq('id', programme.brand_id)
    .maybeSingle()
  const brand = rawBrand as { name: string | null } | null

  // Chiffres marque (brand_metrics, latest per type).
  const { data: rawMetrics } = await admin
    .from('brand_metrics')
    .select('metric_type, value, recorded_at')
    .eq('tenant_id', programme.tenant_id)
    .order('recorded_at', { ascending: false })
    .limit(50)
  const metricsAll = (rawMetrics as Array<{ metric_type: string; value: number; recorded_at: string }> | null) ?? []
  const latestByType = new Map<string, { metric_type: string; value: number; recorded_at: string }>()
  for (const m of metricsAll) if (!latestByType.has(m.metric_type)) latestByType.set(m.metric_type, m)
  const metrics = Array.from(latestByType.values())

  if (metrics.length === 0) {
    return {
      ok: true,
      estimations: [],
      warning:
        "Pas de chiffres de référence pour le moment. Renseigne tes chiffres marque pour activer les estimations.",
      limites: '',
    }
  }

  // Count posts du programme.
  const { count: postsCount } = await admin
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('programme_id', programmeId)

  // Retombées récentes 90j.
  const ninetyDaysAgoIso = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)
  const { data: rawRetombees } = await admin
    .from('posts')
    .select('date_prevue, retombees')
    .eq('brand_id', programme.brand_id)
    .not('retombees', 'is', null)
    .gte('date_prevue', ninetyDaysAgoIso)
    .order('date_prevue', { ascending: false })
    .limit(20)
  const retombees =
    (rawRetombees as Array<{ date_prevue: string | null; retombees: string | null }> | null) ?? []

  console.info('[estimations] start', { programmeId, metricsCount: metrics.length })

  const userPrompt = buildStrategieEstimationsUserPrompt({
    brand: { name: brand?.name ?? null },
    programme: {
      date_debut: programme.date_debut,
      date_fin: programme.date_fin,
      posts_count: postsCount ?? 0,
    },
    metrics,
    retombees,
  })

  let rawText: string
  try {
    rawText = await callAnthropic(userPrompt)
    console.info('[estimations] anthropic_response', { ms: Date.now() - t0 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Anthropic injoignable'
    console.error('[estimations] anthropic_failed', { message })
    return { ok: false, reason: message }
  }
  const cleaned = extractJsonFromText(rawText)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('[estimations] invalid_json', { raw: rawText.slice(0, 300) })
    return { ok: false, reason: 'Réponse mal formée' }
  }
  const validated = validateEstimations(parsed)
  if (!validated) {
    return { ok: false, reason: 'Estimations invalides (fourchettes manquantes ou >20%)' }
  }
  console.info('[estimations] done', { ms: Date.now() - t0, count: validated.estimations.length })
  return {
    ok: true,
    estimations: validated.estimations,
    warning: validated.warning,
    limites: validated.limites,
  }
}
