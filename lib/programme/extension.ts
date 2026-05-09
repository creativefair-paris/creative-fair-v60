// Extension du programme (semaine/trimestre) — implémentation Sprint 35

export type ExtensionContext = {
  programmeId: string
  tenantId: string
  periode: 'semaine' | 'trimestre'
}

export type ExtendedProgramme = {
  arcNarratif: { semaines: Array<{ theme: string; posts: unknown[] }> }
}

export async function etendreProgramme(_ctx: ExtensionContext): Promise<ExtendedProgramme> {
  throw new Error('etendreProgramme: implémentation Sprint 35')
}
