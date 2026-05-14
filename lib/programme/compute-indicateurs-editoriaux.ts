// Sprint 37.H (F73 — Section 2) — Indicateurs éditoriaux calculés
// déterministiquement à partir du programme. Pas de Anthropic.
//
// Vocabulaire : "Indicateurs éditoriaux", "équilibre", "diversité",
// "densité", "couverture". JAMAIS performance/KPI/metrics.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { BusinessCalendar } from '@/types/business-calendar'

export type IndicateurStatus = 'aligned' | 'partial' | 'imbalanced'

export interface IndicateursEditoriaux {
  equilibre_piliers: {
    label: string
    repartition: ReadonlyArray<{ pilier: string; count: number; pct: number }>
    ecart_pct: number
    status: IndicateurStatus
  }
  diversite_formats: {
    label: string
    used: ReadonlyArray<string>
    total_canoniques: number
    status: IndicateurStatus
  }
  densite_hebdo: {
    label: string
    posts_par_semaine: number
    cadence_attendue: string | null
    status: IndicateurStatus
  }
  couverture_events: {
    label: string
    events_total: number
    events_anticipes: number
    status: IndicateurStatus
  }
}

type ProgrammeRow = {
  id: string
  brand_id: string
  date_debut: string | null
  date_fin: string | null
  context_generation: unknown
}

type PostRow = {
  format: string | null
  pilier_nom: string | null
  date_prevue: string | null
}

const FORMATS_CANONIQUES_TOTAL = 6

export async function computeIndicateursEditoriaux(
  admin: SupabaseClient,
  programmeId: string,
): Promise<IndicateursEditoriaux | null> {
  const { data: rawProg } = await admin
    .from('programmes')
    .select('id, brand_id, date_debut, date_fin, context_generation')
    .eq('id', programmeId)
    .maybeSingle()
  const programme = rawProg as ProgrammeRow | null
  if (!programme) return null

  const { data: rawPosts } = await admin
    .from('posts')
    .select('format, pilier_nom, date_prevue')
    .eq('programme_id', programmeId)
  const posts = (rawPosts as PostRow[] | null) ?? []

  // Brand business_calendar.
  const { data: rawBrand } = await admin
    .from('brands')
    .select('business_calendar')
    .eq('id', programme.brand_id)
    .maybeSingle()
  const cal =
    (rawBrand as { business_calendar?: BusinessCalendar | null } | null)?.business_calendar ?? null

  // 1. Équilibre piliers.
  const piliersCount = new Map<string, number>()
  for (const p of posts) {
    if (!p.pilier_nom) continue
    piliersCount.set(p.pilier_nom, (piliersCount.get(p.pilier_nom) ?? 0) + 1)
  }
  const total = posts.length || 1
  const repartition = Array.from(piliersCount.entries())
    .map(([pilier, count]) => ({
      pilier,
      count,
      pct: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
  const pcts = repartition.map((r) => r.pct)
  const ecart = pcts.length > 1 ? Math.max(...pcts) - Math.min(...pcts) : 0
  const equilibreStatus: IndicateurStatus =
    repartition.length === 0 ? 'partial' : ecart <= 25 ? 'aligned' : 'imbalanced'

  // 2. Diversité formats.
  const formatsUsed = Array.from(new Set(posts.map((p) => p.format).filter((f): f is string => Boolean(f))))
  const diversiteStatus: IndicateurStatus =
    formatsUsed.length === 0 ? 'partial' : formatsUsed.length >= 4 ? 'aligned' : 'partial'

  // 3. Densité hebdo.
  const start = programme.date_debut ? new Date(programme.date_debut) : null
  const end = programme.date_fin ? new Date(programme.date_fin) : null
  const dureeSemaines =
    start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / (7 * 86400000))) : 1
  const postsParSemaine = parseFloat((posts.length / dureeSemaines).toFixed(1))

  const wizardCadence = (() => {
    const ctx = programme.context_generation
    if (!ctx || typeof ctx !== 'object') return null
    const w = (ctx as { wizardResponses?: unknown }).wizardResponses
    if (!w || typeof w !== 'object') return null
    return (w as Record<string, unknown>)['5']
      ? ((w as Record<string, { cadence?: string }>)['5']?.cadence ?? null)
      : null
  })()

  const expectedRange = (() => {
    switch (wizardCadence) {
      case 'discreet':
        return { min: 1, max: 2 }
      case 'dense':
        return { min: 5, max: 7 }
      case 'balanced':
      default:
        return { min: 2, max: 4 }
    }
  })()
  let densiteStatus: IndicateurStatus = 'aligned'
  if (postsParSemaine < expectedRange.min - 0.5) densiteStatus = 'partial'
  else if (postsParSemaine > expectedRange.max + 0.5) densiteStatus = 'imbalanced'

  // 4. Couverture events.
  const startMs = start?.getTime() ?? -Infinity
  const endMs = end?.getTime() ?? Infinity
  const inWindow = (iso: string | null | undefined): boolean => {
    if (!iso) return false
    const t = new Date(iso).getTime()
    return !Number.isNaN(t) && t >= startMs && t <= endMs
  }
  let eventsTotal = 0
  let eventsAnticipes = 0
  if (cal) {
    for (const l of cal.upcomingLaunches ?? []) {
      if (inWindow(l.date)) eventsTotal += 1
    }
    for (const e of cal.industryEvents ?? []) {
      if (inWindow(e.date)) eventsTotal += 1
    }
  }
  // V1 simplifiée : on considère un event anticipé s'il existe au moins
  // 1 post dans la fenêtre [event - 7j ; event + 1j].
  if (cal && eventsTotal > 0) {
    const eventDates: number[] = []
    for (const l of cal.upcomingLaunches ?? []) {
      if (inWindow(l.date)) eventDates.push(new Date(l.date).getTime())
    }
    for (const e of cal.industryEvents ?? []) {
      if (inWindow(e.date)) eventDates.push(new Date(e.date).getTime())
    }
    for (const eventTs of eventDates) {
      const windowStart = eventTs - 7 * 86400000
      const windowEnd = eventTs + 86400000
      const hasPostInWindow = posts.some((p) => {
        if (!p.date_prevue) return false
        const t = new Date(p.date_prevue).getTime()
        return t >= windowStart && t <= windowEnd
      })
      if (hasPostInWindow) eventsAnticipes += 1
    }
  }
  const couvertureStatus: IndicateurStatus =
    eventsTotal === 0
      ? 'aligned'
      : eventsAnticipes === eventsTotal
        ? 'aligned'
        : eventsAnticipes >= eventsTotal / 2
          ? 'partial'
          : 'imbalanced'

  return {
    equilibre_piliers: {
      label: 'Équilibre des piliers',
      repartition,
      ecart_pct: ecart,
      status: equilibreStatus,
    },
    diversite_formats: {
      label: 'Diversité des formats',
      used: formatsUsed,
      total_canoniques: FORMATS_CANONIQUES_TOTAL,
      status: diversiteStatus,
    },
    densite_hebdo: {
      label: 'Densité hebdomadaire',
      posts_par_semaine: postsParSemaine,
      cadence_attendue: wizardCadence,
      status: densiteStatus,
    },
    couverture_events: {
      label: 'Couverture des events business',
      events_total: eventsTotal,
      events_anticipes: eventsAnticipes,
      status: couvertureStatus,
    },
  }
}
