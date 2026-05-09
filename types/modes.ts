// Types modes (Mode 1 Programme / Mode 2 Outils) — Sprint 32.5

export type Mode = 'programme' | 'outils'

export type ModeContext = {
  mode: Mode
  brandId: string
  tenantId: string
}
