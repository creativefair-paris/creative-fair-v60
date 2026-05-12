// Sprint 36.C — Loader server-side de la home /aujourd-hui.
//
// Charge les 4 sections en un passage : posts du jour, posts semaine,
// stats Pattern A (cette semaine / depuis le début), blocs Ma Marque
// prioritaires non remplis, brouillons (stub V1).
//
// Tous les chiffres viennent de la DB réelle. Pas de placeholder.
// Si Floriane vient d'arriver : 0 partout, c'est honnête.

import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from '@/lib/calendar/dates'
import { computeSemainesTenues, computeProgrammeTenuCetteSemaine, compterPiliersDistincts } from './compute-stats'
import { etatDuBloc, BLOCS_ORDRE, BLOCS_PRIORITAIRES, BLOCS_LABELS, type BrandSnapshot14, type BlocId } from '@/lib/ma-marque/completude'
import type {
  MomentBusiness,
  Objectif,
  Ressources,
  Benchmark,
  Canaux,
  BrandBook,
} from '@/types/ma-marque'
import type { PilierNarratif } from '@/types/programme'

// ── Types renvoyés au front ──────────────────────────────────────────────────

export type PostTodayItem = {
  id: string
  titre: string
  heure_prevue: string
  type_contenu: string
  pilier_nom: string
}

export type PostWeekItem = {
  id: string
  date_prevue: string
  titre: string
  type_contenu: string
  pilier_nom: string
}

export type BlocPrioritaire = {
  id: BlocId
  actionLabel: string
  contextLabel: string
}

export type StatsWeek = {
  postsPublies: number
  piliersTravailles: number
  programmeTenu: boolean
}

export type StatsTotal = {
  postsTotal: number
  semainesTenues: number
  fondations: number // sur 14
}

export type ProgressionSemaine = {
  total: number
  complets: number
}

export type AujourdhuiData =
  | { authenticated: false }
  | { authenticated: true; redirect: string }
  | {
      authenticated: true
      redirect?: undefined
      prenom: string
      todayDate: string // ISO du jour (UTC, calculé serveur Paris)
      postsToday: PostTodayItem[]
      postsWeek: PostWeekItem[]
      blocsPrioritaires: BlocPrioritaire[]
      statsWeek: StatsWeek
      statsTotal: StatsTotal
      progressionSemaine: ProgressionSemaine
      drafts: never[] // stub V1, sera typé Sprint 37
    }

// ── asXxx helpers (rétro-compat lecture brand) ───────────────────────────────

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}
function asObjet<T>(v: unknown): T | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  return v as T
}
function asRessources(v: unknown): Ressources | null {
  const o = asObjet<Record<string, unknown>>(v)
  if (!o) return null
  if (typeof o.photo !== 'string' || typeof o.video !== 'string') return null
  return o as unknown as Ressources
}

// ── Loader principal ─────────────────────────────────────────────────────────

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
  const tenantId = profile?.tenant_id ?? null
  if (!tenantId) {
    return { authenticated: true, redirect: '/onboarding/analyse-marque' }
  }

  const brand = await getBrandByTenantId(supabase, tenantId)
  if (!brand || brand.brand_book_status !== 'complete') {
    return { authenticated: true, redirect: '/onboarding/analyse-marque' }
  }

  // Lecture brand étendue pour le snapshot 14 blocs.
  const { data: rawExtras } = await supabase
    .from('brands')
    .select(
      'id, name, secteur, ton, singularite, cible, univers_refuse, piliers_narratifs, calendrier_business, objectifs, ressources, benchmarks, canaux, brand_book',
    )
    .eq('id', brand.id)
    .maybeSingle()
  const extras = rawExtras as
    | {
        id: string
        name?: string | null
        secteur?: string | null
        ton?: string | null
        singularite?: string | null
        cible?: string | null
        univers_refuse?: string | null
        piliers_narratifs?: unknown
        calendrier_business?: unknown
        objectifs?: unknown
        ressources?: unknown
        benchmarks?: unknown
        canaux?: unknown
        brand_book?: unknown
      }
    | null

  // Archives count via admin (RLS gérée serveur). Best-effort.
  let archivesCount = 0
  try {
    const admin = createAdmin()
    const adminTyped = admin as unknown as {
      from: (t: string) => {
        select: (cols: string, opts?: { count?: 'exact'; head?: boolean }) => {
          eq: (col: string, val: string) => Promise<{ count: number | null }>
        }
      }
    }
    const { count } = await adminTyped
      .from('brand_archives')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brand.id)
    archivesCount = count ?? 0
  } catch {
    archivesCount = 0
  }

  const snapshot: BrandSnapshot14 = {
    nom: extras?.name ?? brand.name ?? '',
    secteur: extras?.secteur ?? '',
    ton: extras?.ton ?? '',
    singularite: extras?.singularite ?? '',
    cible: extras?.cible ?? '',
    piliers: asArray<PilierNarratif>(extras?.piliers_narratifs),
    capSaison: '',
    objectifs: asArray<Objectif>(extras?.objectifs),
    universRefuse: extras?.univers_refuse ?? '',
    benchmarks: asArray<Benchmark>(extras?.benchmarks),
    calendrierBusiness: asArray<MomentBusiness>(extras?.calendrier_business),
    ressources: asRessources(extras?.ressources),
    canaux: asObjet<Canaux>(extras?.canaux),
    brandBook: asObjet<BrandBook>(extras?.brand_book),
    archivesCount,
  }

  // ── Posts d'aujourd'hui ────────────────────────────────────────────────────
  // statut='planifie' = "à préparer". date_prevue dans la journée.
  const today = new Date()
  const dayStart = startOfDay(today)
  const dayEnd = endOfDay(today)
  const weekStart = startOfWeek(today)
  const weekEnd = endOfWeek(today)

  const { data: rawPostsToday } = await supabase
    .from('posts')
    .select('id, titre, heure_prevue, type_contenu, pilier_nom, date_prevue, statut')
    .eq('brand_id', brand.id)
    .eq('statut', 'planifie')
    .gte('date_prevue', dayStart.toISOString())
    .lte('date_prevue', dayEnd.toISOString())
    .order('heure_prevue', { ascending: true })

  const postsToday: PostTodayItem[] = ((rawPostsToday as unknown as Array<{
    id: string
    titre: string
    heure_prevue: string
    type_contenu: string
    pilier_nom: string
  }> | null) ?? []).map((p) => ({
    id: p.id,
    titre: p.titre ?? '',
    heure_prevue: p.heure_prevue ?? '',
    type_contenu: p.type_contenu ?? '',
    pilier_nom: p.pilier_nom ?? '',
  }))

  // ── Posts de la semaine (hors today) ──────────────────────────────────────
  const { data: rawPostsWeek } = await supabase
    .from('posts')
    .select('id, titre, date_prevue, type_contenu, pilier_nom, statut, heure_prevue')
    .eq('brand_id', brand.id)
    .eq('statut', 'planifie')
    .gt('date_prevue', dayEnd.toISOString())
    .lte('date_prevue', weekEnd.toISOString())
    .order('date_prevue', { ascending: true })

  const postsWeek: PostWeekItem[] = ((rawPostsWeek as unknown as Array<{
    id: string
    titre: string
    date_prevue: string
    type_contenu: string
    pilier_nom: string
  }> | null) ?? []).map((p) => ({
    id: p.id,
    titre: p.titre ?? '',
    date_prevue: p.date_prevue ?? '',
    type_contenu: p.type_contenu ?? '',
    pilier_nom: p.pilier_nom ?? '',
  }))

  // ── Blocs Ma Marque prioritaires non remplis ──────────────────────────────
  const blocsPrioritaires: BlocPrioritaire[] = []
  for (const blocId of BLOCS_ORDRE) {
    if (!BLOCS_PRIORITAIRES.includes(blocId)) continue
    const etat = etatDuBloc(blocId, snapshot)
    if (etat === 'complete') continue
    blocsPrioritaires.push({
      id: blocId,
      actionLabel: `Compléter « ${BLOCS_LABELS[blocId]} »`,
      contextLabel: 'Bloc prioritaire de Ma Marque',
    })
    if (blocsPrioritaires.length >= 3) break
  }

  // ── Stats cette semaine ───────────────────────────────────────────────────
  const { data: rawPostsWeekPublished } = await supabase
    .from('posts')
    .select('id, pilier_nom, date_prevue, statut')
    .eq('brand_id', brand.id)
    .eq('statut', 'publie')
    .gte('date_prevue', weekStart.toISOString())
    .lte('date_prevue', weekEnd.toISOString())

  const weekPublished = (rawPostsWeekPublished as Array<{ pilier_nom: string | null; date_prevue: string | null; statut: string }> | null) ?? []

  const { data: rawPostsWeekAll } = await supabase
    .from('posts')
    .select('statut, date_prevue')
    .eq('brand_id', brand.id)
    .gte('date_prevue', weekStart.toISOString())
    .lte('date_prevue', weekEnd.toISOString())
  const weekAll = (rawPostsWeekAll as Array<{ statut: string; date_prevue: string | null }> | null) ?? []

  const statsWeek: StatsWeek = {
    postsPublies: weekPublished.length,
    piliersTravailles: compterPiliersDistincts(weekPublished),
    programmeTenu: computeProgrammeTenuCetteSemaine(weekAll, today),
  }

  // ── Stats depuis le début ─────────────────────────────────────────────────
  const { count: countTotal } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brand.id)
    .eq('statut', 'publie')

  const { data: rawAllPublished } = await supabase
    .from('posts')
    .select('date_prevue')
    .eq('brand_id', brand.id)
    .eq('statut', 'publie')
  const allPublished = (rawAllPublished as Array<{ date_prevue: string | null }> | null) ?? []

  const fondationsCount = BLOCS_ORDRE.filter((id) => etatDuBloc(id, snapshot) === 'complete').length

  const statsTotal: StatsTotal = {
    postsTotal: countTotal ?? 0,
    semainesTenues: computeSemainesTenues(allPublished),
    fondations: fondationsCount,
  }

  // ── Progression semaine (pour la barre) ──────────────────────────────────
  const progressionSemaine: ProgressionSemaine = {
    total: postsToday.length + postsWeek.length + blocsPrioritaires.length,
    complets: weekPublished.length,
  }

  // ── Prénom pour l'affichage (futur usage : "Bonjour, Floriane") ───────────
  const prenom =
    profile?.prenom && profile.prenom.trim().length > 0
      ? profile.prenom
      : (user.email?.split('@')[0] ?? 'toi')

  return {
    authenticated: true,
    prenom,
    todayDate: today.toISOString(),
    postsToday,
    postsWeek,
    blocsPrioritaires,
    statsWeek,
    statsTotal,
    progressionSemaine,
    drafts: [],
  }
}
