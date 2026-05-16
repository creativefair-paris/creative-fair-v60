// Sprint 37.K (F89) — Types partagés pour la feature piliers persistés.

export type PillarRow = {
  id: string
  tenant_id: string
  brand_id: string
  title: string
  description: string
  color_hex: string | null
  position: number
  questions_answers: Record<string, string> | null
  generation_model: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export type PillarLite = {
  id: string
  title: string
  description: string
  position: number
}

// Sprint 37.K (F89) — Soft cap V1. Au-dessus de 7, l'UI bloque les ajouts.
// Entre 5 et 7, l'UI montre un warning "réfléchis avant d'ajouter".
export const PILLARS_SOFT_CAP_WARN = 5
export const PILLARS_HARD_CAP = 7
