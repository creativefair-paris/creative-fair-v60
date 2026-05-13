// Sprint 36.H — Report automatique des posts en retard.
//
// Appelé au chargement de /aujourd-hui (server component) AVANT le fetch
// des posts à afficher. Logique :
//   1. SELECT posts.statut='planifie' && reported_from IS NULL &&
//      (date_prevue + heure_prevue) < now()
//   2. Pour chacun : décale date_prevue de N jours pour qu'il ne soit
//      plus en retard, set reported_from = now()
//   3. Marque les posts comme reportés → exclus des prochains catch-up
//      (anti-boucle)
//
// Garde anti-récursion : max 30 jours de catch-up d'un coup (si gap > 30,
// on déplace de 30 jours et on logge). Évite un loop infini si la base
// contient des posts de 2024 oubliés.
//
// NOTE statut : la spec écrivait 'draft', mais la colonne live est
// `posts.statut` (FR) avec valeurs 'planifie' | 'genere' | 'publie' |
// 'archive'. Le pendant doctrinal de 'draft' est 'planifie'. Le mapping
// est cohérent avec lib/types/post.ts (Sprint 36.G).

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'

const MAX_CATCH_UP_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

type Result = {
  ok: boolean
  reported: string[]  // UUIDs reportés ce passage
}

type OverduePost = {
  id: string
  date_prevue: string  // YYYY-MM-DD
  heure_prevue: string // HH:MM:SS
}

export async function catchUpOverduePosts(): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reported: [] }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) return { ok: false, reported: [] }

  const admin = createAdmin()
  const adminTyped = admin as unknown as {
    from: (t: 'posts') => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            is: (col: string, val: null) => Promise<{
              data: OverduePost[] | null
              error: { message: string } | null
            }>
          }
        }
      }
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  }

  // 1. SELECT candidats : tenant + 'planifie' + reported_from IS NULL.
  // Le filtre temporel (date_prevue + heure_prevue) < now() est fait en
  // JavaScript pour éviter un raw SQL — volume des posts par tenant en
  // V1 négligeable (< 100 actifs).
  const { data: rawCandidates } = await adminTyped
    .from('posts')
    .select('id, date_prevue, heure_prevue')
    .eq('tenant_id', tenantId)
    .eq('statut', 'planifie')
    .is('reported_from', null)

  const candidates = (rawCandidates ?? []) as OverduePost[]
  if (candidates.length === 0) return { ok: true, reported: [] }

  const now = new Date()
  const reportedIds: string[] = []

  for (const post of candidates) {
    const scheduledAt = new Date(`${post.date_prevue}T${post.heure_prevue}`)
    if (Number.isNaN(scheduledAt.getTime())) continue
    if (scheduledAt.getTime() >= now.getTime()) continue // pas en retard

    // Calcul du nombre de jours à ajouter pour que le post soit demain
    // par rapport au moment présent (ou aujourd'hui si la garde max bloque).
    const lateDays = Math.ceil((now.getTime() - scheduledAt.getTime()) / MS_PER_DAY)
    const daysToAdd = Math.max(1, Math.min(MAX_CATCH_UP_DAYS, lateDays))

    const current = new Date(`${post.date_prevue}T00:00:00`)
    current.setDate(current.getDate() + daysToAdd)
    const newDatePrevue = current.toISOString().slice(0, 10)

    const { error } = await adminTyped
      .from('posts')
      .update({
        date_prevue: newDatePrevue,
        reported_from: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', post.id)

    if (!error) reportedIds.push(post.id)

    if (lateDays > MAX_CATCH_UP_DAYS) {
      console.warn(
        `[catch-up] post ${post.id} était en retard de ${lateDays} jours, ` +
        `déplacé de ${MAX_CATCH_UP_DAYS} jours uniquement (garde anti-runaway).`,
      )
    }
  }

  return { ok: true, reported: reportedIds }
}
