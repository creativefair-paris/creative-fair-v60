// Sprint 36.G — Loader server-side de /aujourd-hui (refonte V3 "tranquillité du pilote").
//
// Charge :
//   * Profile + tenant + brand (auth + filet ensureProfile)
//   * Alertes actives du tenant (Zone Critique)
//   * Posts du jour (Bloc A "Aujourd'hui")
//   * Posts du reste de la semaine (Bloc B "Cette semaine")
//   * Stats semaine (Bloc 2 État Programme)
//   * brand.questions_answered (Bloc 3 État Ma Marque)
//   * Daily signal mock (Bloc C)
//
// Pas de pourcentage chiffré. Pas de gamification. Chiffres bruts.

import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from '@/lib/calendar/dates'
import { ensureProfile } from '@/app/_actions/ensure-profile'
import { catchUpOverduePosts } from '@/app/_actions/catch-up-overdue-posts'
import { SUGGESTED_SIGNAL_MOCK } from '@/lib/mocks/daily-signal'
import type { TaskPost, PostStatutDB } from '@/lib/types/post'
import type { Alert } from '@/components/today/CriticalBanner'
import type { DailySignal } from '@/components/today/SuggestedSignal'

export type WeekStats = {
  total: number  // posts cette semaine, tous statuts confondus
  ready: number  // statut 'genere'
  todo: number   // statut 'planifie'
}

export type AujourdhuiData =
  | { authenticated: false }
  | { authenticated: true; redirect: string }
  | {
      authenticated: true
      redirect?: undefined
      prenom: string
      todayISO: string  // ISO datetime du jour Paris
      alerts: Alert[]
      postsToday: TaskPost[]
      postsWeek: TaskPost[]  // hors today, ordonnés par date_prevue, heure_prevue
      weekStats: WeekStats
      questionsAnswered: number  // brands.questions_answered (0..14)
      dailySignal: DailySignal | null
    }

export async function loadAujourdhuiData(): Promise<AujourdhuiData> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { authenticated: false }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id, prenom')
    .eq('id', user.id)
    .maybeSingle()
  const profile = rawProfile as { tenant_id?: string | null; prenom?: string | null } | null
  let tenantId = profile?.tenant_id ?? null

  // Filet ensureProfile (cf. Sprint 36.C.2).
  if (!tenantId) {
    const provision = await ensureProfile()
    if (provision.ok) {
      tenantId = provision.tenantId
    } else {
      console.warn(`[load-data] ensureProfile failed for ${user.id}: ${provision.reason}`)
      return { authenticated: true, redirect: '/onboarding/analyse-marque' }
    }
  }

  const brand = await getBrandByTenantId(supabase, tenantId)
  if (!brand || brand.brand_book_status !== 'complete') {
    return { authenticated: true, redirect: '/onboarding/analyse-marque' }
  }

  // ── Catch-up des posts en retard (Sprint 36.H Finding 7) ──────────────
  // On exécute AVANT le SELECT principal pour que les posts catch-up
  // apparaissent dans postsToday/postsWeek avec leur nouvelle date_prevue.
  // Idempotent : un post déjà reporté (reported_from NOT NULL) est exclu.
  await catchUpOverduePosts()

  // ── Bornes temporelles ───────────────────────────────────────────────────
  const today = new Date()
  const dayStart = startOfDay(today)
  const dayEnd = endOfDay(today)
  const weekStart = startOfWeek(today)
  const weekEnd = endOfWeek(today)

  // ── Posts d'aujourd'hui ─────────────────────────────────────────────────
  const { data: rawPostsToday } = await supabase
    .from('posts')
    .select('id, titre, heure_prevue, type_contenu, pilier_nom, date_prevue, statut, reported_from')
    .eq('brand_id', brand.id)
    .gte('date_prevue', dayStart.toISOString().slice(0, 10))
    .lte('date_prevue', dayEnd.toISOString().slice(0, 10))
    .order('heure_prevue', { ascending: true })

  const postsToday: TaskPost[] = ((rawPostsToday as unknown as TaskPost[] | null) ?? []).map((p) => ({
    id: p.id,
    titre: p.titre ?? '',
    heure_prevue: p.heure_prevue ?? '09:00:00',
    type_contenu: p.type_contenu ?? '',
    pilier_nom: p.pilier_nom ?? '',
    date_prevue: p.date_prevue ?? '',
    statut: (p.statut as PostStatutDB) ?? 'planifie',
    reported_from: p.reported_from ?? null,
  }))

  // ── Posts du reste de la semaine (hors today) ────────────────────────────
  const tomorrowISO = new Date(dayEnd.getTime() + 1000).toISOString().slice(0, 10)
  const { data: rawPostsWeek } = await supabase
    .from('posts')
    .select('id, titre, date_prevue, type_contenu, pilier_nom, statut, heure_prevue, reported_from')
    .eq('brand_id', brand.id)
    .gte('date_prevue', tomorrowISO)
    .lte('date_prevue', weekEnd.toISOString().slice(0, 10))
    .order('date_prevue', { ascending: true })
    .order('heure_prevue', { ascending: true })

  const postsWeek: TaskPost[] = ((rawPostsWeek as unknown as TaskPost[] | null) ?? []).map((p) => ({
    id: p.id,
    titre: p.titre ?? '',
    heure_prevue: p.heure_prevue ?? '09:00:00',
    type_contenu: p.type_contenu ?? '',
    pilier_nom: p.pilier_nom ?? '',
    date_prevue: p.date_prevue ?? '',
    statut: (p.statut as PostStatutDB) ?? 'planifie',
    reported_from: p.reported_from ?? null,
  }))

  // ── Stats semaine (Bloc 2 — chiffres bruts, pas de %) ──────────────────
  // Comptage tous statuts sur la semaine entière.
  const { data: rawPostsAllWeek } = await supabase
    .from('posts')
    .select('statut')
    .eq('brand_id', brand.id)
    .gte('date_prevue', weekStart.toISOString().slice(0, 10))
    .lte('date_prevue', weekEnd.toISOString().slice(0, 10))
  const allWeek = (rawPostsAllWeek as Array<{ statut: string | null }> | null) ?? []

  const weekStats: WeekStats = {
    total: allWeek.length,
    ready: allWeek.filter((p) => p.statut === 'genere').length,
    todo: allWeek.filter((p) => p.statut === 'planifie').length,
  }

  // ── Alertes actives (Zone Critique) ──────────────────────────────────────
  const { data: rawAlerts } = await supabase
    .from('alerts')
    .select('id, severity, message, source, resolved_at, created_at')
    .is('resolved_at', null)
    .order('created_at', { ascending: false })
  const alerts: Alert[] = ((rawAlerts as Array<{
    id: string
    severity: string
    message: string
    source: string
  }> | null) ?? [])
    .filter((a) => a.severity === 'critical' || a.severity === 'warning')
    .map((a) => ({
      id: a.id,
      severity: a.severity as 'critical' | 'warning',
      message: a.message,
      source: a.source,
    }))

  // ── brand.questions_answered (Bloc 3 — affiché si < 14) ──────────────────
  const { data: rawQA } = await supabase
    .from('brands')
    .select('questions_answered')
    .eq('id', brand.id)
    .maybeSingle()
  const questionsAnswered =
    (rawQA as { questions_answered?: number | null } | null)?.questions_answered ?? 0

  // ── Prénom ───────────────────────────────────────────────────────────────
  const prenom =
    profile?.prenom && profile.prenom.trim().length > 0
      ? profile.prenom
      : (user.email?.split('@')[0] ?? 'toi')

  return {
    authenticated: true,
    prenom,
    todayISO: today.toISOString(),
    alerts,
    postsToday,
    postsWeek,
    weekStats,
    questionsAnswered,
    dailySignal: SUGGESTED_SIGNAL_MOCK,
  }
}
