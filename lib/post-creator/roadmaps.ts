// Sprint 37.H (F72) — Roadmaps par format Post Creator.
//
// V1 : structure de la roadmap visible (phases), pas implémentation.
// L'expérience interactive complète arrive Sprint 38+.

export type RoadmapStep = {
  id: string
  label: string
  description: string
}

export type RoadmapFormat = 'anecdote' | 'produit' | 'evenement' | 'manifeste'

export const ROADMAPS: Record<RoadmapFormat, ReadonlyArray<RoadmapStep>> = {
  anecdote: [
    {
      id: 'theme',
      label: 'Choisir le thème',
      description: 'Quel pilier mobiliser ? Quel angle ?',
    },
    {
      id: 'sourcing',
      label: 'Rechercher les sources',
      description: 'Vérifier les faits, croiser les archives.',
    },
    {
      id: 'structure',
      label: 'Construire le carrousel',
      description: '5-7 slides, narration en arc.',
    },
    {
      id: 'visuel',
      label: 'Visuel et typographie',
      description: 'Cohérence avec la signature de la marque.',
    },
    {
      id: 'caption',
      label: 'Caption Instagram',
      description: 'Court, sans punchline forcée.',
    },
    {
      id: 'programmation',
      label: 'Programmer la publication',
      description: 'Date, heure, hashtags légers.',
    },
  ],
  produit: [
    {
      id: 'creation',
      label: 'Choisir la création',
      description: 'Quelle pièce ? Pourquoi celle-ci, maintenant ?',
    },
    {
      id: 'storytelling',
      label: "Trouver l'angle narratif",
      description: 'Histoire derrière la création.',
    },
    {
      id: 'photo',
      label: 'Photo et mise en scène',
      description: 'Setup, lumière, contexte.',
    },
    {
      id: 'caption',
      label: 'Caption Instagram',
      description: 'Présenter sans vendre.',
    },
    {
      id: 'programmation',
      label: 'Programmer',
      description: 'Date, hashtags, mentions.',
    },
  ],
  evenement: [
    {
      id: 'event_info',
      label: "Définir l'event",
      description: 'Date, lieu, audience cible.',
    },
    {
      id: 'narrative',
      label: 'Construire le récit',
      description: 'Pourquoi cet event compte pour ta marque.',
    },
    {
      id: 'teaser',
      label: 'Créer le teaser',
      description: "Photo ou carrousel d'annonce.",
    },
    {
      id: 'jour_j',
      label: 'Plan jour J',
      description: 'Stories, posts en temps réel.',
    },
    {
      id: 'retombees',
      label: 'Retombées post-event',
      description: 'Carrousel bilan, témoignages.',
    },
  ],
  manifeste: [
    {
      id: 'position',
      label: 'Définir la position',
      description: 'Sur quoi tu prends position ? Pourquoi maintenant ?',
    },
    {
      id: 'structure',
      label: 'Structurer le texte',
      description: 'Court, lapidaire, sans nuance excessive.',
    },
    {
      id: 'visuel',
      label: 'Visuel minimal',
      description: 'Typographique, sans surcharge.',
    },
    {
      id: 'audience',
      label: 'Anticiper les réactions',
      description: 'Qui va aimer ? Qui peut critiquer ?',
    },
    {
      id: 'programmation',
      label: 'Programmer',
      description: 'Pas le vendredi soir. Pas le lundi matin.',
    },
  ],
}

export const FORMAT_LABELS: Record<RoadmapFormat, string> = {
  anecdote: 'Anecdote',
  produit: 'Produit',
  evenement: 'Événement',
  manifeste: 'Manifeste',
}

export const FORMAT_COLORS: Record<RoadmapFormat, string> = {
  anecdote: '#007AFF',
  produit: '#34C759',
  evenement: '#FF9500',
  manifeste: '#FF3B30',
}
