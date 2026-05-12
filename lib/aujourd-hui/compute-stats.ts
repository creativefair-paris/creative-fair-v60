// Sprint 36.C — Calculs Pattern A (Apple Health style) pour la home.
// Chiffres factuels uniquement, jamais de pourcentage global ni gamification.

import { getISOWeek, getISOWeekYear } from './dates-fr'

type MinimalPost = {
  date_prevue: string | null
  pilier_nom?: string | null
}

// Compte le nombre de semaines ISO uniques pendant lesquelles au moins
// un post a été publié. Source de vérité : tableau de posts statut='publie'.
export function computeSemainesTenues(postsPublished: MinimalPost[]): number {
  if (postsPublished.length === 0) return 0
  const seen = new Set<string>()
  for (const p of postsPublished) {
    if (!p.date_prevue) continue
    const d = new Date(p.date_prevue)
    if (Number.isNaN(d.getTime())) continue
    seen.add(`${getISOWeekYear(d)}-${getISOWeek(d)}`)
  }
  return seen.size
}

// "Programme tenu cette semaine" = aucun post en retard (statut='planifie'
// avec date_prevue < today). V1 simplifié : true par défaut quand aucune
// donnée publiée encore (pas d'angoisse à l'arrivée).
export function computeProgrammeTenuCetteSemaine(
  postsCetteSemaine: { statut: string; date_prevue: string | null }[],
  today: Date,
): boolean {
  // Un seul critère pour V1 : aucun post 'planifie' dont la date est passée.
  for (const p of postsCetteSemaine) {
    if (p.statut !== 'planifie') continue
    if (!p.date_prevue) continue
    const d = new Date(p.date_prevue)
    if (Number.isNaN(d.getTime())) continue
    if (d.getTime() < today.getTime()) return false
  }
  return true
}

// Nombre de piliers narratifs distincts utilisés sur une période donnée.
export function compterPiliersDistincts(posts: MinimalPost[]): number {
  const seen = new Set<string>()
  for (const p of posts) {
    if (p.pilier_nom && p.pilier_nom.trim().length > 0) seen.add(p.pilier_nom)
  }
  return seen.size
}
