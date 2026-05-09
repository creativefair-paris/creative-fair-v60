// Génération du programme initial 1 mois — implémentation Sprint 35

export type GenerationContext = {
  brandId: string
  tenantId: string
  contextAnswers: Record<string, unknown>
}

export type GeneratedProgramme = {
  arcNarratif: { semaines: Array<{ theme: string; posts: unknown[] }> }
}

export async function genererProgramme(_ctx: GenerationContext): Promise<GeneratedProgramme> {
  throw new Error('genererProgramme: implémentation Sprint 35')
}
