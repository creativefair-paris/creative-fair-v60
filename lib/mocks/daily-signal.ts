// Sprint 36.G → 36.H — Mock V1 du signal du jour pour Bloc C.
//
// Sprint 36.H Finding 8 : ajout de ctaLabel + ctaContext pour CTA
// spécifique au signal. Le composant SuggestedSignal consomme ces
// champs sans connaître le territoire.

import type { DailySignal } from '@/components/today/SuggestedSignal'

export const SUGGESTED_SIGNAL_MOCK: DailySignal | null = {
  signalId: 'mock-veille-001',
  territory: 'SIGNAL DE VEILLE',
  message: 'Ami Paris a lancé une capsule maison dimanche soir.',
  ctaLabel: 'Et nous ?',
  ctaContext:
    "Ami Paris a lancé une capsule maison dimanche soir. Et nous, qu'est-ce qu'on fait ?",
}
