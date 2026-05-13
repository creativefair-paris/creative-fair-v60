// Sprint 37.A (F1+F2) — Palette de pastilles colorées par scénario.
//
// Décision Apple Cupertino salve 4 — Hiroshi. La pastille de 8px
// rendue dans le header sticky de la ConseillerSheet signale
// visuellement le territoire du scénario en cours :
//
// - A1 / A2 / A7    → bleu       (génération / bilans)
// - B2 / B4 / B5    → indigo     (production quotidienne)
// - C3a / C3b       → orange     (imprévus défavorables)
// - D6 / D8 / D9    → violet     (opportunités)
// - E1 / E-divers   → gris       (réunion / quotidien)

import type { ScenarioType } from './types'

export type ScenarioFamily = 'A' | 'B' | 'C' | 'D' | 'E'

export type ScenarioVisual = {
  family: ScenarioFamily
  color: string
  shortLabel: string
}

const PALETTE: Record<ScenarioType, ScenarioVisual> = {
  A1: { family: 'A', color: '#007AFF', shortLabel: 'Création de plan' },
  A2: { family: 'A', color: '#007AFF', shortLabel: 'Régénération' },
  A7: { family: 'A', color: '#007AFF', shortLabel: 'Bilan' },
  B2: { family: 'B', color: '#5856D6', shortLabel: 'Affiner un post' },
  B4: { family: 'B', color: '#5856D6', shortLabel: 'Week-end' },
  B5: { family: 'B', color: '#5856D6', shortLabel: 'Modération' },
  C3a: { family: 'C', color: '#FF9500', shortLabel: 'Bad buzz' },
  C3b: { family: 'C', color: '#FF9500', shortLabel: 'Imprévu' },
  D6: { family: 'D', color: '#AF52DE', shortLabel: 'Idée direction' },
  D8: { family: 'D', color: '#AF52DE', shortLabel: 'Opportunité business' },
  D9: { family: 'D', color: '#AF52DE', shortLabel: 'Opportunité visibilité' },
  E1: { family: 'E', color: 'rgba(0, 0, 0, 0.5)', shortLabel: 'Réunion' },
  'E-divers': { family: 'E', color: 'rgba(0, 0, 0, 0.5)', shortLabel: 'Question ouverte' },
  // Sprint 37.C — A8 partage la famille A (génération/bilans, bleu).
  A8: { family: 'A', color: '#007AFF', shortLabel: 'Mes chiffres' },
}

export function scenarioVisual(type: ScenarioType): ScenarioVisual {
  return PALETTE[type]
}
