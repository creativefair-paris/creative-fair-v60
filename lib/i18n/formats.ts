// Sprint 37.J (F85) — Dictionnaire i18n FR/EN des 6 formats canoniques.
//
// V1 reste française : tous les composants UI utilisent le getter `.fr`
// (équivalent à la valeur précédemment hardcodée). Le slug interne reste
// inchangé (Anecdote / Produit / Événement / Coulisses / Manifeste /
// Question) — c'est l'identifiant DB stable, pas un label affiché.
//
// Préparation Sprint 39+ migration internationale : ajouter un locale
// param (depuis Accept-Language ou préférence pilote) au getter et tout
// composant qui affiche un label de format basculera EN automatiquement.

export type FormatSlug =
  | 'anecdote'
  | 'produit'
  | 'evenement'
  | 'manifeste'
  | 'question'
  | 'coulisses'

export type Locale = 'fr' | 'en'

export const FORMAT_LABELS: Record<FormatSlug, Record<Locale, string>> = {
  anecdote: { fr: 'Anecdote', en: 'Anecdote' },
  produit: { fr: 'Produit', en: 'Product' },
  evenement: { fr: 'Événement', en: 'Event' },
  manifeste: { fr: 'Manifeste', en: 'Manifesto' },
  question: { fr: 'Question', en: 'Question' },
  // Terme anglais consacré (pluriel) pour "Behind the Scenes".
  coulisses: { fr: 'Coulisses', en: 'Behind the Scenes' },
}

export const FORMAT_DESCRIPTIONS: Record<FormatSlug, Record<Locale, string>> = {
  anecdote: {
    fr: 'Raconter une histoire qui sert un pilier.',
    en: 'Tell a story that serves a pillar.',
  },
  produit: {
    fr: 'Mettre en avant une création avec son histoire.',
    en: 'Showcase a creation with its story.',
  },
  evenement: {
    fr: 'Annoncer une date qui compte.',
    en: 'Announce a date that matters.',
  },
  manifeste: {
    fr: 'Affirmer une position forte.',
    en: 'Assert a strong position.',
  },
  question: {
    fr: 'Faire réagir la communauté.',
    en: 'Engage the community.',
  },
  coulisses: {
    fr: "Montrer le geste, l'atelier, la fabrication.",
    en: 'Show the craft, the workshop, the making.',
  },
}

// Couleurs SF Apple — réutilisables partout (badges, pastilles, icônes,
// border-left de calendrier). Centralisation pour cohérence post-F82.
export const FORMAT_COLORS: Record<FormatSlug, string> = {
  anecdote: '#007AFF',
  produit: '#34C759',
  evenement: '#FF9500',
  manifeste: '#FF3B30',
  question: '#5856D6',
  coulisses: '#AF52DE',
}

// Helpers de résolution selon la locale active.
export function getFormatLabel(format: FormatSlug, locale: Locale = 'fr'): string {
  return FORMAT_LABELS[format][locale]
}

export function getFormatDescription(format: FormatSlug, locale: Locale = 'fr'): string {
  return FORMAT_DESCRIPTIONS[format][locale]
}

export function getFormatColor(format: FormatSlug): string {
  return FORMAT_COLORS[format]
}
