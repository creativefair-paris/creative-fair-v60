// Sprint 43-stable — Catalogue Hélène M. + 12 Experts (données statiques V1).
// Doctrine 02-EXPERTS.md §2 + §3 (tableau des 12 Experts + LLM par rôle).
// 10-SACRED.md "13 personnages canoniques, pas un de plus".

export type ExpertModel = 'opus-4.7' | 'sonnet-4.6'

export type Expert = {
  id: string
  name: string
  initial: string
  domain: string
  description: string
  llm: ExpertModel
  pinned?: boolean
  color: string
}

export const HELENE: Expert = {
  id: 'helene',
  name: 'Hélène M.',
  initial: 'H',
  domain: 'Orchestratrice',
  description:
    "Ton interlocutrice principale. Elle suit toutes tes conversations et orchestre la Roadmap d'Aujourd'hui.",
  llm: 'opus-4.7',
  pinned: true,
  color: '#1C1C1E',
}

export const EXPERTS: ReadonlyArray<Expert> = [
  {
    id: 'sofia-p',
    name: 'Sofia P.',
    initial: 'S',
    domain: 'Ads & paid social',
    description: 'Performance chiffrée, opérationnelle. Sans détour.',
    llm: 'sonnet-4.6',
    color: '#007AFF',
  },
  {
    id: 'lea-z',
    name: 'Léa Z.',
    initial: 'L',
    domain: 'Influence Premium',
    description: 'Réseau KOL signés ≥50K. Contractuelle, méfiante sur les conflits d\'image.',
    llm: 'opus-4.7',
    color: '#A78BFA',
  },
  {
    id: 'capucine-v',
    name: 'Capucine V.',
    initial: 'C',
    domain: 'Communauté & Micro-Influence',
    description: 'Communauté chaude, échange produit. Référence Walk In Paris.',
    llm: 'sonnet-4.6',
    color: '#F472B6',
  },
  {
    id: 'jonas-k',
    name: 'Jonas K.',
    initial: 'J',
    domain: 'Coups & Viralité',
    description: 'Stratège des coups, prudent. Référence Jacquemus champ de lavande.',
    llm: 'opus-4.7',
    color: '#FB923C',
  },
  {
    id: 'albane-r',
    name: 'Albane R.',
    initial: 'A',
    domain: 'Éditorial Magazine',
    description: 'Documentée, citationnelle, lente à se prononcer. Référence Le Monde M Magazine.',
    llm: 'opus-4.7',
    color: '#6366F1',
  },
  {
    id: 'marc-d',
    name: 'Marc D.',
    initial: 'M',
    domain: 'Veille concurrentielle',
    description: 'Veille fine, signaux faibles, jamais alarmiste.',
    llm: 'sonnet-4.6',
    color: '#10B981',
  },
  {
    id: 'ines-b',
    name: 'Inès B.',
    initial: 'I',
    domain: 'Ops social media',
    description: 'Opérationnelle, productivité, gain de temps.',
    llm: 'sonnet-4.6',
    color: '#0EA5E9',
  },
  {
    id: 'sebastien-l',
    name: 'Sébastien L.',
    initial: 'S',
    domain: 'Analytics éditoriale interne',
    description: 'Lecture qualitative, refus des vanity metrics.',
    llm: 'sonnet-4.6',
    color: '#737373',
  },
  {
    id: 'valentine-d',
    name: 'Valentine D.',
    initial: 'V',
    domain: 'Crise & opportunités imprévues',
    description: 'Sang-froid absolu, ne réagit jamais à chaud.',
    llm: 'opus-4.7',
    color: '#FF3B30',
  },
  {
    id: 'antoine-f',
    name: 'Antoine F.',
    initial: 'A',
    domain: 'Création Visuelle premium',
    description: 'Visuel, direct, peu de mots, beaucoup d\'exemples. Référence Hermès Métiers, Aman.',
    llm: 'opus-4.7',
    color: '#1C1C1E',
  },
  {
    id: 'camille-o',
    name: 'Camille O.',
    initial: 'C',
    domain: 'Channels adjacents',
    description: 'LinkedIn, Newsletter, Site, GMB. Refus des canaux non maîtrisés en V1.',
    llm: 'sonnet-4.6',
    color: '#8B5CF6',
  },
  {
    id: 'elise-m',
    name: 'Élise M.',
    initial: 'É',
    domain: 'Archives & Mémoire',
    description: "Archiviste rigoureuse. Refus absolu d'inventer.",
    llm: 'opus-4.7',
    color: '#D97706',
  },
]

export const ALL_PARTICIPANTS: ReadonlyArray<Expert> = [HELENE, ...EXPERTS]

export function getExpertById(id: string): Expert | null {
  return ALL_PARTICIPANTS.find((e) => e.id === id) ?? null
}
