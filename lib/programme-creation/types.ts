// Sprint 37.B (F16) — Types partagés pour le wizard immersif A1.

// Sprint 37.C (F19) — passage à 8 étapes : ajout d'une étape Objectifs
// éditoriaux entre Curseur de risque (idx 4) et Format préféré.
export type WizardStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export type WizardState =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ABANDONED'
  | 'EXPIRED'

export type RiskCursor = 'safe' | 'moderate' | 'risky'

// Sprint 37.D (F29) — Les 6 formats canoniques de Creative Fair V1.
// Vocabulaire EXACT (TF Communication, Hélène M.). Ce sont des intentions
// éditoriales, pas des types structurels (qui restent carrousel/photo/reel
// gérés dans posts.structure_type).
export type CanonicalFormat =
  | 'anecdote'
  | 'produit'
  | 'evenement'
  | 'coulisses'
  | 'manifeste'
  | 'question'

// Legacy type retained for backwards compat. À retirer Sprint 38+.
export type DominantFormat = 'carousel' | 'reel' | 'post' | 'mix'

// Sprint 37.C (F19) — type des objectifs éditoriaux (multi-select 1-2).
export type ObjectifEditorial = {
  value: string
  type: 'qualitatif' | 'quantitatif'
  source: 'pilier_principal' | 'calendar' | 'current_rhythm' | 'current_metrics' | 'custom'
}

// Réponses indexées par stepIndex (string pour la sérialisation JSONB).
// Schéma libre côté DB, typage côté UI pour valider à l'écriture.
export type WizardResponses = {
  '0'?: { period_start: string; period_end: string }
  '1'?: { business_anchors: string[] }
  '2'?: { sensitive_topics: string }
  '3'?: { pillars: Record<string, number> }
  '4'?: { risk_cursor: RiskCursor }
  // Sprint 37.C (F19) — nouvelle étape Objectifs éditoriaux.
  '5'?: { objectifs_editoriaux: ReadonlyArray<ObjectifEditorial> }
  // Sprint 37.D (F29) — l'étape 7 (idx 6) prend désormais 1 à 3 formats
  // canoniques en multi-select. Le legacy "format: DominantFormat" reste
  // accepté en lecture pour les sessions anciennes (compat IN_PROGRESS).
  '6'?: { formats: ReadonlyArray<CanonicalFormat> } | { format: DominantFormat }
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

// Suggestion pré-remplie pour les steps 2 (anchors) et 3 (sensitive).
export type WizardSuggestion = {
  value: string
  source: 'calendar' | 'external' | 'history'
}

export type WizardSuggestionsPayload = {
  suggestions: ReadonlyArray<WizardSuggestion>
}

export const WIZARD_STEP_LABELS = [
  'Période',
  'Ancres business',
  'Sujets sensibles',
  'Piliers à mobiliser',
  'Curseur de risque',
  'Objectifs éditoriaux',
  'Format préféré',
  'Confirmation',
] as const

export const WIZARD_TOTAL_STEPS = WIZARD_STEP_LABELS.length
