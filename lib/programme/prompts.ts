// Prompts LLM pour génération du programme — squelette Sprint 35

export type PromptInputs = {
  brand: { name: string; positioning?: string }
  contextAnswers: Record<string, unknown>
  periode: 'semaine' | 'mois' | 'trimestre'
}

export function promptArcNarratif(_inputs: PromptInputs): string {
  throw new Error('promptArcNarratif: implémentation Sprint 35')
}

export function promptPostFromArc(_inputs: PromptInputs & { semaineTheme: string }): string {
  throw new Error('promptPostFromArc: implémentation Sprint 35')
}
