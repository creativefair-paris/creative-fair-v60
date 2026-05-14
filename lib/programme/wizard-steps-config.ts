// Sprint 37.G (F68) — Config partagée des étapes du wizard programme.
//
// Source unique de vérité pour les étapes wizard A1, consommée à la fois
// par le wizard immersif (components/conseiller/WizardImmersiveSheet) et
// la page native (components/programme-create/ProgrammeCreateForm).
//
// Évite le drift constaté Sprint 37.D → 37.F où la page native gardait
// les 7 étapes initiales tandis que le wizard immersif avait évolué à 9.

export type WizardStepId =
  | 'period'
  | 'mix_mode'
  | 'ancres'
  | 'sensitive'
  | 'definir_piliers'
  | 'rythme_engagement'
  | 'objectifs'
  | 'formats'
  | 'confirmation'

export type WizardStepResponseKey =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'

export interface WizardStepConfig {
  id: WizardStepId
  title: string
  hint?: string
  responseKey: WizardStepResponseKey
  // Conditionnel : si false retourné, l'étape est skip.
  conditional?: (ctx: { hasPiliers: boolean }) => boolean
}

export const PROGRAMME_WIZARD_STEPS: ReadonlyArray<WizardStepConfig> = [
  {
    id: 'period',
    title: 'Sur quelle période veux-tu construire ce plan ?',
    responseKey: '0',
  },
  {
    id: 'mix_mode',
    title: 'Comment veux-tu construire ce programme ?',
    hint: '100% Creative Fair (rapide, efficace) ou mixé avec contenu externe (complexe, ultra efficace).',
    responseKey: '1',
  },
  {
    id: 'ancres',
    title: 'As-tu des événements business sur cette période ?',
    responseKey: '2',
  },
  {
    id: 'sensitive',
    title: 'Y a-t-il un sujet sensible à éviter sur cette période ?',
    responseKey: '3',
  },
  {
    id: 'definir_piliers',
    title: 'Définissons tes piliers narratifs',
    hint: '3 thématiques qui structurent tout ce que tu raconteras.',
    responseKey: '4',
    conditional: ({ hasPiliers }) => !hasPiliers,
  },
  {
    id: 'rythme_engagement',
    title: "Rythme et niveau d'engagement",
    hint: "À quelle cadence veux-tu publier, et avec quel niveau d'engagement face aux sujets sensibles ?",
    responseKey: '5',
  },
  {
    id: 'objectifs',
    title: 'Tes objectifs sur cette période',
    hint: 'Choisis ou rédige tes objectifs éditorial et business.',
    responseKey: '6',
  },
  {
    id: 'formats',
    title: 'Quels formats dominants ?',
    hint: 'Choisis 1 à 3 formats. Le conseiller adaptera la répartition.',
    responseKey: '7',
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    responseKey: '8',
  },
]

export function getStepsForBrand(ctx: { hasPiliers: boolean }): ReadonlyArray<WizardStepConfig> {
  return PROGRAMME_WIZARD_STEPS.filter(
    (step) => !step.conditional || step.conditional(ctx),
  )
}

// Helper : trouve le label d'une étape par id.
export function getStepLabel(id: WizardStepId): string {
  const step = PROGRAMME_WIZARD_STEPS.find((s) => s.id === id)
  return step?.title ?? id
}
