// Sprint 37.C (F18) — Types du wizard guidé Ma Marque.

// Sprint 37.E (F59) — Wizard Ma Marque ramené à 4 étapes critiques.
// Les 10 autres champs deviennent optionnels et modifiables au fil du
// temps depuis la page native /ma-marque (Sprint 37.D F35a).
export type BrandOnboardingStepIndex = 0 | 1 | 2 | 3

export type BrandOnboardingState =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ABANDONED'
  | 'EXPIRED'

// Schéma libre côté DB, typage côté UI pour valider à l'écriture.
// Sprint 37.E (F59) — Wizard ramené à 4 étapes critiques :
// 0 Identité (nom + description courte)
// 1 Audience cible principale
// 2 Piliers narratifs (3 piliers obligatoires)
// 3 Ton de voix
// Tous les autres champs sont éditables au fil du temps depuis la
// page native /ma-marque (Sprint 37.D F35a).
export type BrandOnboardingResponses = {
  '0'?: { nom: string; description_courte: string }
  '1'?: { audience_principale: string }
  '2'?: { piliers: ReadonlyArray<{ nom: string; description?: string }> }
  '3'?: { ton_adjectifs: ReadonlyArray<string>; ton_texte: string }
}

export type BrandOnboardingSessionRow = {
  id: string
  tenant_id: string
  user_id: string
  current_step: number
  total_steps: number
  responses: BrandOnboardingResponses
  state: BrandOnboardingState
  expires_at: string
  created_at: string
  updated_at: string
  completed_at: string | null
}

// Sprint 37.E (F59) — 4 étapes critiques uniquement.
export const BRAND_ONBOARDING_STEP_LABELS = [
  'Identité marque',
  'Audience cible principale',
  'Piliers narratifs',
  'Ton de voix',
] as const

export const BRAND_ONBOARDING_TOTAL_STEPS = BRAND_ONBOARDING_STEP_LABELS.length

// Sprint 37.E (F59) — toutes les étapes sont critiques V1.
export const CRITICAL_STEP_INDICES: ReadonlyArray<number> = [0, 1, 2, 3]
