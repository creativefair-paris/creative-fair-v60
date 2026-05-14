// Sprint 37.B (F16) — Types partagés pour le wizard immersif A1.
// Sprint 37.E — Refonte wizard (F39+F40+F42+F43+F44+F45+F46).
//
// Structure V3 (8 étapes fixes + 1 étape conditionnelle insérée après
// Sujets sensibles si piliers de la marque vides — F46) :
//   0  Période
//   1  Mix CF / externe              (F45 nouveau)
//   2  Ancres business
//   3  Sujets sensibles
//   4  Définir tes piliers           (F46 conditionnel, sinon skip)
//   5  Rythme + niveau d'engagement  (F39+F40 fusion)
//   6  Objectifs éditorial + business (F42+F43 fusion)
//   7  Formats dominants
//   8  Confirmation

export type WizardStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type WizardState =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ABANDONED'
  | 'EXPIRED'

// Sprint 37.E (F39) — "Niveau d'engagement" remplace "Curseur de risque".
export type EngagementLevel = 'prudent' | 'pose' | 'engage'

// Sprint 37.E (F40) — Cadence de publication (alignée curseur fréquence).
export type Cadence = 'discreet' | 'balanced' | 'dense'

// Sprint 37.E (F45) — Mode de construction du programme.
export type MixMode = 'full_cf' | 'mixed'

// Legacy retenu pour compat lecture sessions IN_PROGRESS ancien wizard.
export type RiskCursor = 'safe' | 'moderate' | 'risky'

// Sprint 37.D (F29) — Les 6 formats canoniques de Creative Fair V1.
export type CanonicalFormat =
  | 'anecdote'
  | 'produit'
  | 'evenement'
  | 'coulisses'
  | 'manifeste'
  | 'question'

// Legacy retenu pour compat lecture sessions IN_PROGRESS.
export type DominantFormat = 'carousel' | 'reel' | 'post' | 'mix'

// Sprint 37.C (F19) — type des objectifs éditoriaux.
export type ObjectifEditorial = {
  value: string
  type: 'qualitatif' | 'quantitatif'
  source: 'pilier_principal' | 'calendar' | 'current_rhythm' | 'current_metrics' | 'custom'
}

// Sprint 37.E (F42+F43) — Combo objectif éditorial + objectif business.
export type ObjectifBusiness = {
  value: string
  source: 'preset' | 'custom'
}

// Sprint 37.E — Pilier défini à la volée (F46 conditionnel).
export type PilierLite = { id: string; nom: string }

// Réponses indexées par stepIndex string (JSONB).
export type WizardResponses = {
  '0'?: { period_start: string; period_end: string }
  // Sprint 37.E (F45) — étape 1 = Mix CF/externe.
  '1'?: { mix_mode: MixMode }
  // Étape 2 = Ancres business (était '1' dans l'ancien wizard).
  '2'?: { business_anchors: string[] }
  // Étape 3 = Sujets sensibles (était '2').
  '3'?: { sensitive_topics: string }
  // Étape 4 = Définir tes piliers (F46 conditionnel).
  '4'?: { piliers_definis: ReadonlyArray<PilierLite>; skipped?: boolean }
  // Sprint 37.E (F39+F40) — étape 5 = Rythme + niveau d'engagement.
  '5'?: { cadence: Cadence; engagement: EngagementLevel }
  // Sprint 37.E (F42+F43) — étape 6 = Objectifs éditorial + business.
  '6'?: { objectif_editorial?: ObjectifEditorial; objectif_business?: ObjectifBusiness }
  // Sprint 37.D (F29) — étape 7 = Formats canoniques 1-3.
  '7'?: { formats: ReadonlyArray<CanonicalFormat> } | { format: DominantFormat }
}

export type WizardSessionRow = {
  id: string
  tenant_id: string
  user_id: string
  conseiller_conversation_id: string | null
  current_step: number
  total_steps: number
  responses: WizardResponses
  state: WizardState
  expires_at: string
  created_at: string
  updated_at: string
  completed_at: string | null
}

export type WizardSuggestion = {
  value: string
  source: 'calendar' | 'external' | 'history'
}

export type WizardSuggestionsPayload = {
  suggestions: ReadonlyArray<WizardSuggestion>
}

// Sprint 37.E — Labels actualisés.
export const WIZARD_STEP_LABELS = [
  'Période',
  'Mode de construction',
  'Ancres business',
  'Sujets sensibles',
  'Définir tes piliers',
  'Rythme et engagement',
  'Tes objectifs',
  'Formats dominants',
  'Confirmation',
] as const

export const WIZARD_TOTAL_STEPS = WIZARD_STEP_LABELS.length
