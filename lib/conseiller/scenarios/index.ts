// Sprint 37 (Lot 6) — Index des 13 sub-prompts scénarios.
//
// Sélecteur central utilisé par la server action runConseillerTurn().

import { A1_SUBPROMPT } from './A1'
import { A2_SUBPROMPT } from './A2'
import { A7_SUBPROMPT } from './A7'
import { B2_SUBPROMPT } from './B2'
import { B4_SUBPROMPT } from './B4'
import { B5_SUBPROMPT } from './B5'
import { C3A_SUBPROMPT } from './C3a'
import { C3B_SUBPROMPT } from './C3b'
import { D6_SUBPROMPT } from './D6'
import { D8_SUBPROMPT } from './D8'
import { D9_SUBPROMPT } from './D9'
import { E1_SUBPROMPT } from './E1'
import { E_DIVERS_SUBPROMPT } from './E-divers'
import type { ScenarioType } from '../types'

export function getScenarioSubPrompt(scenario: ScenarioType): string {
  switch (scenario) {
    case 'A1':
      return A1_SUBPROMPT
    case 'A2':
      return A2_SUBPROMPT
    case 'A7':
      return A7_SUBPROMPT
    case 'B2':
      return B2_SUBPROMPT
    case 'B4':
      return B4_SUBPROMPT
    case 'B5':
      return B5_SUBPROMPT
    case 'C3a':
      return C3A_SUBPROMPT
    case 'C3b':
      return C3B_SUBPROMPT
    case 'D6':
      return D6_SUBPROMPT
    case 'D8':
      return D8_SUBPROMPT
    case 'D9':
      return D9_SUBPROMPT
    case 'E1':
      return E1_SUBPROMPT
    case 'E-divers':
      return E_DIVERS_SUBPROMPT
  }
}
