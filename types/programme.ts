// Types programme — Sprint 32.5
// Source : §15.8 Cahier des charges v2.0

export type ProgrammePeriode = 'semaine' | 'mois' | 'trimestre'

export type ProgrammeStatus = 'active' | 'archived'

export type ArcNarratifSemaine = {
  theme: string
  posts: unknown[]
}

export type ArcNarratif = {
  semaines: ArcNarratifSemaine[]
}

export type Programme = {
  id: string
  brandId: string
  tenantId: string
  periode: ProgrammePeriode
  arcNarratif: ArcNarratif
  contextGeneration: Record<string, unknown>
  status: ProgrammeStatus
  createdAt: string
  updatedAt: string
}
