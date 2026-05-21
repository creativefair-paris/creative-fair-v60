// Sprint 37.H (F73 — Section 1) — Server action : genère l'intention
// éditoriale du conseiller pour chaque event business du programme.

'use server'

import Anthropic, { APIError } from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { extractJsonFromText } from '@/lib/programme/generation'
import {
  SYSTEM_PROMPT_STRATEGIE_EVENTS,
  buildStrategieEventsUserPrompt,
} from '@/lib/programme/strategie-events-intention-prompt'
import type { BusinessCalendar } from '@/types/business-calendar'

const MODELS_CASCADE = ['claude-opus-4-5', 'claude-opus-4-1', 'claude-sonnet-4-5'] as const
const MAX_TOKENS = 2048
const TEMPERATURE = 0.65
const TIMEOUT_MS = 45_000

export type EventIntention = {
  event_name: string
  event_date: string
  pourquoi_couvrir: string
  facteurs: ReadonlyArray<string>
  comment_couvert: string
}

export type StrategieEventsResult =
  | { ok: true; events: ReadonlyArray<EventIntention> }
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
              text: SYSTEM_PROMPT_STRATEGIE_EVENTS,
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

function validateEvents(json: unknown): ReadonlyArray<EventIntention> {
  if (!json || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  if (!Array.isArray(obj.events)) return []
  const out: EventIntention[] = []
  for (const raw of obj.events) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    if (typeof r.event_name !== 'string' || typeof r.event_date !== 'string') continue
    if (typeof r.pourquoi_couvrir !== 'string') continue
    if (typeof r.comment_couvert !== 'string') continue
    const facteurs = Array.isArray(r.facteurs)
      ? r.facteurs.filter((f): f is string => typeof f === 'string').slice(0, 5)
      : []
    out.push({
      event_name: r.event_name.slice(0, 100),
      event_date: r.event_date.slice(0, 10),
      pourquoi_couvrir: r.pourquoi_couvrir.slice(0, 300),
      facteurs,
      comment_couvert: r.comment_couvert.slice(0, 200),
    })
  }
  return out
}

export async function generateStrategieEventsIntention(
  programmeId: string,
): Promise<StrategieEventsResult> {
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

  // Charge le programme + brand + business_calendar (filtre tenant_id).
  const { data: rawProg } = await admin
    .from('programmes')
    .select('id, tenant_id, brand_id, date_debut, date_fin, context_generation')
    .eq('id', programmeId)
    .eq('tenant_id', userTenantId)
    .maybeSingle()
  const programme = rawProg as {
    id: string
    tenant_id: string
    brand_id: string
    date_debut: string | null
    date_fin: string | null
    context_generation: unknown
  } | null
  if (!programme) return { ok: false, reason: 'Programme introuvable' }

  const { data: rawBrand } = await admin
    .from('brands')
    .select('name, piliers_narratifs, business_calendar')
    .eq('id', programme.brand_id)
    .eq('tenant_id', userTenantId)
    .maybeSingle()
  const brand = rawBrand as {
    name: string | null
    piliers_narratifs: unknown
    business_calendar: unknown
  } | null

  const piliers = Array.isArray(brand?.piliers_narratifs)
    ? brand!.piliers_narratifs
        .map((p) => (typeof p === 'string' ? p : p && typeof p === 'object' && 'nom' in p ? String((p as { nom: unknown }).nom) : ''))
        .filter((s) => s.trim().length > 0)
    : []

  // Filtre les events sur la période.
  const cal = (brand?.business_calendar ?? null) as BusinessCalendar | null
  const start = programme.date_debut ? new Date(programme.date_debut).getTime() : -Infinity
  const end = programme.date_fin ? new Date(programme.date_fin).getTime() : Infinity
  const inPeriod = (iso: string | null | undefined): boolean => {
    if (!iso) return false
    const t = new Date(iso).getTime()
    if (Number.isNaN(t)) return false
    return t >= start && t <= end
  }
  const events: Array<{ name: string; date: string; type?: string }> = []
  if (cal) {
    for (const l of cal.upcomingLaunches ?? []) {
      if (inPeriod(l.date)) events.push({ name: l.name, date: l.date, type: l.type ?? undefined })
    }
    for (const e of cal.industryEvents ?? []) {
      if (inPeriod(e.date)) events.push({ name: e.name, date: e.date, type: 'event_industrie' })
    }
  }

  if (events.length === 0) {
    return { ok: true, events: [] }
  }

  // Sprint 37.H — Sécurité contexte : max 6 events pour limiter la latence.
  const eventsCapped = events.slice(0, 6)

  // Lecture des réponses wizard depuis context_generation (Sprint 37.D F34).
  const wizardResponses = (() => {
    const ctx = programme.context_generation
    if (!ctx || typeof ctx !== 'object') return null
    const w = (ctx as { wizardResponses?: unknown }).wizardResponses
    if (!w || typeof w !== 'object') return null
    const r = w as Record<string, unknown>
    const eng = (r['5'] as { engagement?: string } | undefined)?.engagement ?? null
    const cad = (r['5'] as { cadence?: string } | undefined)?.cadence ?? null
    const objEdito = (() => {
      const o6 = r['6'] as { objectif_editorial?: { value?: string } } | undefined
      return o6?.objectif_editorial?.value ?? null
    })()
    const objBiz = (() => {
      const o6 = r['6'] as { objectif_business?: { value?: string } } | undefined
      return o6?.objectif_business?.value ?? null
    })()
    return {
      engagement: eng,
      cadence: cad,
      objectif_editorial: objEdito,
      objectif_business: objBiz,
    }
  })()

  console.info('[strategie-events] start', { programmeId, eventsCount: eventsCapped.length })

  const userPrompt = buildStrategieEventsUserPrompt({
    brand: { name: brand?.name ?? null, piliers },
    programme: { date_debut: programme.date_debut, date_fin: programme.date_fin },
    events: eventsCapped,
    wizardResponses,
  })

  let rawText: string
  try {
    rawText = await callAnthropic(userPrompt)
    console.info('[strategie-events] anthropic_response', { ms: Date.now() - t0, length: rawText.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Anthropic injoignable'
    console.error('[strategie-events] anthropic_failed', { message })
    return { ok: false, reason: message }
  }
  const cleaned = extractJsonFromText(rawText)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('[strategie-events] invalid_json', { raw: rawText.slice(0, 300) })
    return { ok: false, reason: 'Réponse mal formée' }
  }
  const out = validateEvents(parsed)
  console.info('[strategie-events] done', { ms: Date.now() - t0, count: out.length })
  return { ok: true, events: out }
}
