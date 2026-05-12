// Sprint 36.B.2 — Types des 4 blocs Ma Marque (calendrier, objectifs, ressources, piliers).
// Source unique de vérité pour le front, les endpoints et les validations IA.

export type MomentBusinessType = 'lancement' | 'evenement' | 'operation' | 'saison'

export type MomentBusiness = {
  id: string
  titre: string
  date_debut: string // ISO YYYY-MM-DD
  date_fin?: string
  type: MomentBusinessType
}

export type Objectif = {
  id: string
  label: string
  priorite: 1 | 2 | 3 // 1 = prioritaire (ordre dans la liste = priorité)
}

export type CapaciteProduction = 'aucune' | 'occasionnelle' | 'reguliere' | 'soutenue'

export type Ressources = {
  photo: CapaciteProduction
  video: CapaciteProduction
  terrain: boolean
  studio: boolean
}

export type PilierEditable = {
  id: string
  nom: string
  description: string
  ratio_suggere: number // 0 à 1
}

// Propositions retournées par /api/ma-marque/propositions
export type PropositionCalendrier = {
  titre: string
  type: MomentBusinessType
}

export type PropositionObjectif = {
  label: string
  priorite_suggeree: 1 | 2 | 3
}

export type PropositionRessources = {
  description: string
  hint: Partial<Ressources>
}

export type PropositionsResponse<T> =
  | { propositions: T[]; error?: never }
  | { propositions: T[]; error: 'timeout' | 'api_failed' | 'invalid_response' }

// Helpers vides (utilisés pour défauts UI + comparaisons "bloc vide")

export const RESSOURCES_VIDES: Ressources = {
  photo: 'aucune',
  video: 'aucune',
  terrain: false,
  studio: false,
}

export function ressourcesEstVide(r: Ressources | null | undefined): boolean {
  if (!r) return true
  return (
    r.photo === 'aucune' &&
    r.video === 'aucune' &&
    !r.terrain &&
    !r.studio
  )
}
