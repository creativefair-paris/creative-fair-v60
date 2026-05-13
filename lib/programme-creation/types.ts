// Sprint 37.B (F16) — Types partagés pour le wizard immersif A1.

export type WizardStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type WizardState =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ABANDONED'
  | 'EXPIRED'

export type RiskCursor = 'safe' | 'moderate' | 'risky'
export type DominantFormat = 'carousel' | 'reel' | 'post' | 'mix'

// Réponses indexées par stepIndex (string pour la sérialisation JSONB).
// Schéma libre côté DB, typage côté UI pour valider à l'écriture.
export type WizardResponses = {
  '0'?: { period_start: string; period_end: string }
  '1'?: { business_anchors: string[] }
  '2'?: { sensitive_topics: string }
  '3'?: { pillars: Record<string, number> }
  '4'?: { risk_cursor: RiskCursor }
  '5'?: { format: DominantFormat }
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
  'Format préféré',
  'Confirmation',
] as const

export const WIZARD_TOTAL_STEPS = WIZARD_STEP_LABELS.length
