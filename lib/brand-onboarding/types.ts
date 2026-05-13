// Sprint 37.C (F18) — Types du wizard guidé Ma Marque.

export type BrandOnboardingStepIndex =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13

export type BrandOnboardingState =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ABANDONED'
  | 'EXPIRED'

// Schéma libre côté DB, typage côté UI pour valider à l'écriture.
// Chaque step persiste un objet sous sa clé string.
export type BrandOnboardingResponses = {
  '0'?: { nom: string; description_courte: string }
  '1'?: { positionnement: string }
  '2'?: { promesse: string }
  '3'?: { audience_principale: string }
  '4'?: { audience_secondaire: string }
  '5'?: { piliers: ReadonlyArray<{ nom: string; description?: string }> }
  '6'?: { ton_adjectifs: ReadonlyArray<string>; ton_texte: string }
  '7'?: { vocabulaire_privilegier: ReadonlyArray<string> }
  '8'?: { vocabulaire_eviter: ReadonlyArray<string> }
  '9'?: { references: ReadonlyArray<string> }
  '10'?: { style_visuel: string }
  '11'?: { sources_autorisees: ReadonlyArray<string> }
  '12'?: { sources_interdites: ReadonlyArray<string> }
  '13'?: { chiffres_renseignes: boolean }
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

export const BRAND_ONBOARDING_STEP_LABELS = [
  'Identité marque',
  'Positionnement',
  'Promesse',
  'Audience cible principale',
  'Audience secondaire',
  'Piliers narratifs',
  'Ton de voix',
  'Vocabulaire à privilégier',
  'Vocabulaire à éviter',
  'Références culturelles',
  'Style visuel',
  'Sources autorisées',
  'Sources interdites',
  'Chiffres initiaux',
] as const

export const BRAND_ONBOARDING_TOTAL_STEPS = BRAND_ONBOARDING_STEP_LABELS.length

// Index des étapes critiques pour le jalon "marque" (F26). Si ces
// étapes sont posées (4 sur 14), le pilote a passé le jalon.
export const CRITICAL_STEP_INDICES: ReadonlyArray<number> = [0, 1, 3, 5]
