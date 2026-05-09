// State Mode 1 (Programme) / Mode 2 (Outils) — implémentation Sprint 34

export type Mode = 'programme' | 'outils'

export type ModeState = {
  mode: Mode
  setMode: (mode: Mode) => void
}

export function getInitialMode(): Mode {
  return 'programme'
}
