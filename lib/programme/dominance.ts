// Sprint 36.B.3 — Calcul du pilier dominant d'une fenêtre temporelle.
//
// Compte les posts par pilier dans la fenêtre, retourne le plus représenté.
// Si égalité parfaite ou 0 post : retourne null (la chip dominante n'est pas
// affichée — pas de fausse hiérarchie).

import type { PilierNarratif, PostRow } from '@/types/programme'

export type DominanceResult = {
  pilier: PilierNarratif
  count: number
}

function dansLaFenetre(post: PostRow, debut: Date, fin: Date): boolean {
  if (!post.date_prevue) return false
  const t = new Date(post.date_prevue).getTime()
  if (Number.isNaN(t)) return false
  return t >= debut.getTime() && t <= fin.getTime()
}

export function pilierDominantSemaine(
  posts: PostRow[],
  piliers: PilierNarratif[],
  fenetre: { debut: Date; fin: Date },
): DominanceResult | null {
  if (piliers.length === 0 || posts.length === 0) return null

  const counts = new Map<string, number>()
  for (const p of posts) {
    if (!dansLaFenetre(p, fenetre.debut, fenetre.fin)) continue
    counts.set(p.pilier_nom, (counts.get(p.pilier_nom) ?? 0) + 1)
  }

  if (counts.size === 0) return null

  let bestNom: string | null = null
  let bestCount = 0
  let tie = false
  for (const [nom, count] of counts.entries()) {
    if (count > bestCount) {
      bestCount = count
      bestNom = nom
      tie = false
    } else if (count === bestCount) {
      tie = true
    }
  }

  if (tie || bestNom === null) return null
  const pilier = piliers.find((p) => p.nom === bestNom)
  if (!pilier) return null
  return { pilier, count: bestCount }
}

// Numéro de semaine ISO (1-53). Sert au sous-titre "Semaine N — pilier dominant".
export function numeroSemaineISO(d: Date): number {
  // Algorithme ISO 8601.
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = target.getUTCDay() === 0 ? 7 : target.getUTCDay()
  target.setUTCDate(target.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return weekNo
}
