// Sprint 37 (Lot 5) — Mock interface modération.
//
// V1 : pas d'API Meta intégrée. On affiche une liste figée de DM et
// commentaires pour permettre au pilote de tester le flux "Affiner
// avec le conseiller" → scénario B5 (modération quotidienne, doc 09
// §5 groupe B). Sprint 38 branchera l'API Meta DM + comments.
//
// Le mock vit ici (pas en JSON dans /lib/mocks) parce qu'il est
// scope-conseiller et qu'il doit pouvoir être supprimé d'un seul
// fichier dans Sprint 38.

export type ModerationItemKind = 'dm' | 'comment'

export type ModerationItem = {
  id: string
  kind: ModerationItemKind
  // Auteur visible (handle Instagram ou pseudonyme).
  author: string
  // Texte reçu.
  text: string
  // Quand reçu (ISO).
  received_at: string
  // Indicateur de sensibilité côté mock — utilisé pour amorcer le
  // tri visuel. Sprint 38 calculera ça côté server via signaux.
  sensitivity: 'neutral' | 'commercial' | 'sensitive'
}

// Données mockées — formulations sobres, pas de dramatisation,
// vocabulaire de la doctrine (pas "user", "audience", etc.).
export const MODERATION_MOCK_ITEMS: ReadonlyArray<ModerationItem> = [
  {
    id: 'mock-dm-001',
    kind: 'dm',
    author: '@helene.morel',
    text: "Bonjour, est-ce que vous prenez encore des commandes pour début juillet ? Merci.",
    received_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // -30 min
    sensitivity: 'commercial',
  },
  {
    id: 'mock-comment-002',
    kind: 'comment',
    author: '@studio.demeret',
    text: "Magnifique. Vous proposez des pièces sur mesure ?",
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // -3h
    sensitivity: 'commercial',
  },
  {
    id: 'mock-dm-003',
    kind: 'dm',
    author: '@anonyme_72',
    text: "Vos prix sont indécents par rapport à la qualité que je vois.",
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // -8h
    sensitivity: 'sensitive',
  },
  {
    id: 'mock-comment-004',
    kind: 'comment',
    author: '@laurent.b',
    text: "Bravo pour la galerie hier soir.",
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // -24h
    sensitivity: 'neutral',
  },
  {
    id: 'mock-comment-005',
    kind: 'comment',
    author: '@noah.collective',
    text: "Hello, on serait intéressés pour une collab pop-up sur Paris. Vous êtes joignables où ?",
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // -36h
    sensitivity: 'commercial',
  },
]

export function relativeTimeFr(iso: string, now: Date = new Date()): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diffMin = Math.round((now.getTime() - d.getTime()) / 60000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH} h`
  const diffD = Math.round(diffH / 24)
  return `il y a ${diffD} j`
}
