// Sprint 36.B.3 — Complétude Ma Marque à 14 blocs.
// Pilote la phrase contextuelle en hero et l'état (empty/partial/complete)
// affiché par chaque rang.
//
// Doctrine : pas de pourcentage chiffré global, jamais. Score qualitatif
// uniquement ("Trois prioritaires pour aller plus loin").

import type {
  MomentBusiness,
  Objectif,
  Ressources,
  Benchmark,
  Canaux,
  BrandBook,
} from '@/types/ma-marque'
import {
  ressourcesEstVide,
  canauxEstVide,
  brandBookEstVide,
  canauxActifs,
  canauxNormaliser,
  brandBookNormaliser,
} from '@/types/ma-marque'
import type { PilierNarratif } from '@/types/programme'

export type BlocId =
  | 'nom'
  | 'secteur'
  | 'voix'
  | 'singularite'
  | 'cible'
  | 'piliers'
  | 'cap-saison'
  | 'univers-refuse'
  | 'benchmarks'
  | 'calendrier-business'
  | 'ressources'
  | 'canaux'
  | 'brand-book'
  | 'archives'

export const BLOCS_ORDRE: BlocId[] = [
  'nom',
  'secteur',
  'voix',
  'singularite',
  'cible',
  'piliers',
  'cap-saison',
  'univers-refuse',
  'benchmarks',
  'calendrier-business',
  'ressources',
  'canaux',
  'brand-book',
  'archives',
]

export const BLOCS_LABELS: Record<BlocId, string> = {
  'nom': 'Nom',
  'secteur': 'Secteur',
  'voix': 'Voix',
  'singularite': 'Singularité',
  'cible': 'Cible précise',
  'piliers': 'Piliers narratifs',
  'cap-saison': 'Cap de saison',
  'univers-refuse': 'Univers refusé',
  'benchmarks': 'Benchmarks revendiqués',
  'calendrier-business': 'Calendrier business',
  'ressources': 'Ressources de production',
  'canaux': 'Canaux activés',
  'brand-book': 'Brand book et charte visuelle',
  'archives': 'Archives et uploads',
}

// 3 blocs explicitement marqués prioritaires côté UX (point lilas).
export const BLOCS_PRIORITAIRES: BlocId[] = [
  'cible',
  'univers-refuse',
  'brand-book',
]

export type BrandSnapshot14 = {
  nom: string
  secteur: string
  ton: string
  singularite: string
  cible: string
  piliers: PilierNarratif[]
  // capSaison = synthèse texte (legacy). objectifs = liste éditable.
  capSaison: string
  objectifs: Objectif[]
  universRefuse: string
  benchmarks: Benchmark[]
  calendrierBusiness: MomentBusiness[]
  ressources: Ressources | null
  canaux: Canaux | null
  brandBook: BrandBook | null
  archivesCount: number
}

export type BlocState = 'empty' | 'partial' | 'complete'

function texteEstVide(s: string | null | undefined): boolean {
  return !s || s.trim().length === 0
}

function texteEstPartiel(s: string | null | undefined): boolean {
  if (texteEstVide(s)) return false
  return s!.trim().length < 12 // un seul mot ne suffit pas
}

export function etatDuBloc(bloc: BlocId, snap: BrandSnapshot14): BlocState {
  switch (bloc) {
    case 'nom':
      return texteEstVide(snap.nom) ? 'empty' : 'complete'
    case 'secteur':
      return texteEstVide(snap.secteur) ? 'empty' : 'complete'
    case 'voix':
      return texteEstVide(snap.ton)
        ? 'empty'
        : texteEstPartiel(snap.ton)
          ? 'partial'
          : 'complete'
    case 'singularite':
      return texteEstVide(snap.singularite)
        ? 'empty'
        : texteEstPartiel(snap.singularite)
          ? 'partial'
          : 'complete'
    case 'cible':
      return texteEstVide(snap.cible)
        ? 'empty'
        : snap.cible.trim().length < 40
          ? 'partial'
          : 'complete'
    case 'piliers':
      return snap.piliers.length === 0
        ? 'empty'
        : snap.piliers.length < 3
          ? 'partial'
          : 'complete'
    case 'cap-saison':
      // "Cap de saison" = synthèse texte OU au moins un objectif posé.
      if (snap.objectifs.length === 0 && texteEstVide(snap.capSaison)) return 'empty'
      if (snap.objectifs.length === 1) return 'partial'
      return 'complete'
    case 'univers-refuse':
      return texteEstVide(snap.universRefuse) ? 'empty' : 'complete'
    case 'benchmarks':
      return snap.benchmarks.length === 0
        ? 'empty'
        : snap.benchmarks.length < 3
          ? 'partial'
          : 'complete'
    case 'calendrier-business':
      return snap.calendrierBusiness.length === 0
        ? 'empty'
        : snap.calendrierBusiness.length < 3
          ? 'partial'
          : 'complete'
    case 'ressources':
      return ressourcesEstVide(snap.ressources) ? 'empty' : 'complete'
    case 'canaux':
      return canauxEstVide(snap.canaux)
        ? 'empty'
        : canauxActifs(canauxNormaliser(snap.canaux)).length < 2
          ? 'partial'
          : 'complete'
    case 'brand-book': {
      if (brandBookEstVide(snap.brandBook)) return 'empty'
      const b = brandBookNormaliser(snap.brandBook)
      const aPalette = b.palette.length > 0
      const aLogo = b.logo_url.length > 0
      const aTypo = b.typo.principale.length > 0
      const score = [aPalette, aLogo, aTypo].filter(Boolean).length
      return score >= 3 ? 'complete' : 'partial'
    }
    case 'archives':
      return snap.archivesCount === 0
        ? 'empty'
        : snap.archivesCount < 3
          ? 'partial'
          : 'complete'
  }
}

export function compterRemplis(snap: BrandSnapshot14): number {
  return BLOCS_ORDRE.reduce((n, bloc) => {
    const e = etatDuBloc(bloc, snap)
    return n + (e === 'complete' || e === 'partial' ? 1 : 0)
  }, 0)
}

// Phrase contextuelle en hero — narration humaine, jamais de pourcentage global.
// Le compteur N/14 est lisible (pas un score gamifié), aligné sur le spec.
export function getPhrase14(snap: BrandSnapshot14): string {
  const n = compterRemplis(snap)
  if (n === 0) {
    return "Ta marque attend ses premières fondations."
  }
  if (n <= 4) {
    return `Bon début. ${n} fondations posées sur 14.`
  }
  if (n <= 9) {
    return `${n} fondations posées sur 14. Trois prioritaires pour aller plus loin.`
  }
  if (n <= 13) {
    return `${n} sur 14. Encore un effort pour boucler la marque.`
  }
  return 'Ta marque est complète. Creative Fair peut tirer le meilleur.'
}

// Pour le rang Piliers : résumé "3 piliers définis" / "Aucun pilier encore".
export function resumePiliers(piliers: PilierNarratif[]): string {
  if (piliers.length === 0) return 'Aucun pilier encore'
  if (piliers.length === 1) return '1 pilier défini'
  return `${piliers.length} piliers définis`
}

// Pour le rang Canaux : "LinkedIn et Newsletter actifs" / "Aucun canal actif".
export function resumeCanaux(c: Canaux | null | undefined): string {
  if (!c) return 'Aucun canal actif'
  const n = canauxNormaliser(c)
  const actifs = canauxActifs(n)
  if (actifs.length === 0) return 'Aucun canal actif'
  const labels: Record<string, string> = {
    linkedin: 'LinkedIn',
    newsletter: 'Newsletter',
    site: 'Site web',
    gmb: 'Google My Business',
  }
  if (actifs.length === 1) return `${labels[actifs[0]!]} actif`
  if (actifs.length === 2) return `${labels[actifs[0]!]} et ${labels[actifs[1]!]} actifs`
  return `${actifs.length} canaux actifs`
}

// Pour le rang Brand book : "Palette et logo posés" / "À renseigner".
export function resumeBrandBook(b: BrandBook | null | undefined): string {
  if (brandBookEstVide(b)) return 'À renseigner'
  const n = brandBookNormaliser(b)
  const morceaux: string[] = []
  if (n.palette.length > 0) morceaux.push('palette')
  if (n.logo_url) morceaux.push('logo')
  if (n.typo.principale) morceaux.push('typo')
  if (n.dos.length + n.donts.length > 0) morceaux.push('exemples')
  if (morceaux.length === 0) return 'À renseigner'
  // "Palette et logo posés" pour 2, sinon "Palette, logo et typo posés".
  if (morceaux.length === 1) return `${cap(morceaux[0]!)} posée`
  if (morceaux.length === 2) return `${cap(morceaux[0]!)} et ${morceaux[1]} posés`
  const debut = morceaux.slice(0, -1).join(', ')
  return `${cap(debut)} et ${morceaux[morceaux.length - 1]} posés`
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Pour le rang Calendrier business : "5 moments cette année" / "Pas encore de moment".
export function resumeCalendrier(moments: MomentBusiness[]): string {
  if (moments.length === 0) return "Pas encore de moment"
  if (moments.length === 1) return '1 moment cette année'
  return `${moments.length} moments cette année`
}

// Pour le rang Objectifs (cap de saison, utilisé en summary aussi).
export function resumeObjectifs(objectifs: Objectif[]): string {
  if (objectifs.length === 0) return 'Aucun cap encore'
  if (objectifs.length === 1) return `1 objectif posé`
  return `${objectifs.length} objectifs posés`
}

export function resumeBenchmarks(b: Benchmark[]): string {
  if (b.length === 0) return 'Non renseigné'
  if (b.length === 1) return '1 marque citée'
  return `${b.length} marques citées`
}

export function resumeArchives(n: number): string {
  if (n === 0) return 'Aucune archive'
  if (n === 1) return '1 élément archivé'
  return `${n} éléments archivés`
}

export function resumeRessources(r: Ressources | null | undefined): string {
  if (ressourcesEstVide(r)) return 'Non renseigné'
  const photo = r!.photo ?? 'aucune'
  const video = r!.video ?? 'aucune'
  const terrain = r!.terrain ?? false
  const studio = r!.studio ?? false
  const niveaux: Record<string, string> = {
    aucune: 'aucune',
    occasionnelle: 'occasionnelle',
    reguliere: 'régulière',
    soutenue: 'soutenue',
  }
  const bits: string[] = []
  if (photo !== 'aucune') bits.push(`Photo ${niveaux[photo]}`)
  if (video !== 'aucune') bits.push(`Vidéo ${niveaux[video]}`)
  if (terrain) bits.push('Terrain')
  if (studio) bits.push('Studio')
  return bits.length === 0 ? 'Non renseigné' : bits.join(' · ')
}
