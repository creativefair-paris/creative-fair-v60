// Sprint 36.B.2 — État de complétude Ma Marque + phrase contextuelle dynamique.
//
// Utilisé par la page Ma Marque pour afficher en tête une phrase humaine qui
// reflète l'état réel des 4 blocs (Pilier 4 : aspirational storytelling).
//
// Pas de score numérique exposé à l'utilisateur — c'est une jauge interne
// qui pilote uniquement le ton de la phrase.

import type {
  MomentBusiness,
  Objectif,
  Ressources,
} from '@/types/ma-marque'
import { ressourcesEstVide } from '@/types/ma-marque'
import type { PilierNarratif } from '@/types/programme'

export type EtatMarque = 'initial' | 'demarrage' | 'consolide' | 'complet'

export type Bloc = 'piliers' | 'objectifs' | 'calendrier' | 'ressources'

export type BrandSnapshot = {
  calendrierBusiness: MomentBusiness[]
  objectifs: Objectif[]
  ressources: Ressources | null
  piliersNarratifs: PilierNarratif[]
}

// Ordre de priorité de suggestion (du plus fondamental au plus optionnel).
// Quand on doit suggérer "le prochain bloc à remplir", on prend le premier
// non-rempli dans cet ordre.
const ORDRE_SUGGESTION: Bloc[] = ['piliers', 'objectifs', 'calendrier', 'ressources']

function blocRempli(bloc: Bloc, snap: BrandSnapshot): boolean {
  switch (bloc) {
    case 'piliers':
      return Array.isArray(snap.piliersNarratifs) && snap.piliersNarratifs.length >= 1
    case 'objectifs':
      return Array.isArray(snap.objectifs) && snap.objectifs.length >= 1
    case 'calendrier':
      return Array.isArray(snap.calendrierBusiness) && snap.calendrierBusiness.length >= 1
    case 'ressources':
      return !ressourcesEstVide(snap.ressources)
  }
}

export function compterBlocsRemplis(snap: BrandSnapshot): number {
  return ORDRE_SUGGESTION.reduce((n, bloc) => n + (blocRempli(bloc, snap) ? 1 : 0), 0)
}

export function getEtatMarque(snap: BrandSnapshot): EtatMarque {
  const remplis = compterBlocsRemplis(snap)
  if (remplis === 0) return 'initial'
  if (remplis <= 2) return 'demarrage'
  if (remplis === 3) return 'consolide'
  return 'complet'
}

export function prochainBlocASuggerer(snap: BrandSnapshot): Bloc | null {
  for (const bloc of ORDRE_SUGGESTION) {
    if (!blocRempli(bloc, snap)) return bloc
  }
  return null
}

const LIBELLE_BLOC: Record<Bloc, string> = {
  piliers: 'les piliers narratifs',
  objectifs: 'le cap de saison',
  calendrier: 'le calendrier business',
  ressources: 'tes ressources de production',
}

// Phrase contextuelle — narration humaine, Pilier 4.
// Pas de jargon, pas de pourcentages, pas de "X/4". On parle à un humain.
export function getPhraseContextuelle(snap: BrandSnapshot): string {
  const etat = getEtatMarque(snap)
  const prochain = prochainBlocASuggerer(snap)

  switch (etat) {
    case 'initial':
      return "Pose d'abord les bases de ta marque. Sans repères, ton programme tire à l'aveugle."

    case 'demarrage':
      if (prochain) {
        return `Bon début. Continue à poser le cadre — ${LIBELLE_BLOC[prochain]} reste à définir.`
      }
      return 'Bon début. Continue à poser le cadre.'

    case 'consolide':
      if (prochain) {
        return `Ta marque est presque cadrée. Plus qu'un dernier bloc — ${LIBELLE_BLOC[prochain]} — pour que tout s'articule.`
      }
      return 'Ta marque est presque cadrée.'

    case 'complet':
      return 'Ta marque est en place. Le programme peut maintenant être taillé à ta mesure.'
  }
}
