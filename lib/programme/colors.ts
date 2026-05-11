// Sprint 36.B.1 — Chantier D : helper couleur pilier (pure function).
// Source unique de vérité pour la palette pilier (var(--pilier-1..3)).

import type { PilierNarratif } from '@/types/programme'

export const PILIER_COLOR_VARS = [
  'var(--pilier-1)',
  'var(--pilier-2)',
  'var(--pilier-3)',
] as const

export function colorForPilier(
  pilierNom: string,
  piliers: Pick<PilierNarratif, 'nom'>[],
): string {
  const idx = piliers.findIndex((p) => p.nom === pilierNom)
  return PILIER_COLOR_VARS[idx] ?? PILIER_COLOR_VARS[0]
}
