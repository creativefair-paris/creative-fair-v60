// Sprint 36.G — Mock V1 du signal du jour pour le Bloc C "Suggéré pour toi".
//
// En V1, aucun endpoint serveur n'alimente ce bloc. Le mock est rendu
// si SUGGESTED_SIGNAL_MOCK est exporté non-null. Sprint futur branchera
// un vrai endpoint sans refacto du composant <SuggestedSignal>.

import type { DailySignal } from '@/components/today/SuggestedSignal'

export const SUGGESTED_SIGNAL_MOCK: DailySignal | null = {
  signalId: 'mock-veille-001',
  territory: 'SIGNAL DE VEILLE',
  message: 'Ami Paris a lancé une capsule maison dimanche soir.',
}
