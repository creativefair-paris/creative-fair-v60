// Sprint 37.B (F12) — États d'attente verbalisés par scénario.
//
// Décision TF Cupertino salve 5 — Sarah. À l'ouverture de la sheet,
// 3-5 secondes de blanc total avant la première bulle. On verbalise
// ce que fait le conseiller, en cycle bouclant + pulse opacité, avec
// fade-out 200ms dès que le vrai stream commence.

import type { ScenarioType } from './types'

export const WAITING_STATES: Record<ScenarioType, ReadonlyArray<string>> = {
  A1: [
    'Je lis ton brand book…',
    'Je consulte tes piliers narratifs…',
    'Je regarde ton calendrier business…',
    'Je mêle tout ça pour te proposer un plan adapté…',
  ],
  A2: [
    'Je regarde les retombées du programme en cours…',
    "Je consulte ce qui a marché et ce qui a peiné…",
    'Je prépare une régénération adaptée…',
  ],
  A7: [
    'Je consolide les retombées du trimestre…',
    'Je prépare ta synthèse exportable…',
  ],
  B2: [
    'Je regarde tes derniers posts…',
    'Je consulte ton pilier mobilisé…',
    'Je cherche 3 angles qui signent ta marque…',
  ],
  B4: [
    'Je regarde ton rythme de la semaine…',
    'Je pèse silence vs publication…',
  ],
  B5: [
    'Je vérifie le compte qui contacte…',
    'Je prépare 3 versions de réponse calibrées…',
  ],
  C3a: [
    "Je qualifie l'ampleur…",
    'Je vérifie sur quels comptes ça circule…',
    'Je regarde si tu as déjà répondu à ce type de situation…',
  ],
  C3b: [
    'Je vérifie ton calendrier de publication…',
    'Je regarde les alternatives possibles…',
  ],
  D6: [
    'Je décrypte le benchmark cité…',
    'Je cherche ce qui pourrait signer ta marque sur ce terrain…',
  ],
  D8: [
    'Je consulte ton positionnement…',
    "Je regarde si l'opportunité sert ta signature…",
  ],
  D9: [
    'Je vérifie qui te contacte…',
    'Je regarde leur cohérence avec ta marque…',
  ],
  E1: [
    'Je consolide cette semaine…',
    'Je prépare 3 réponses prêtes à parler…',
  ],
  'E-divers': [
    'Je regarde ta question…',
    'Je consulte ton contexte marque…',
  ],
}

// Timer-guard : si après 15s aucun token n'a été reçu, on bascule en
// ERROR_TIMEOUT (état persisté DB).
export const WAITING_TIMEOUT_MS = 15_000

// Cadence de cycle entre 2 phrases d'attente (côté UI).
export const WAITING_CYCLE_MS = 1_800
