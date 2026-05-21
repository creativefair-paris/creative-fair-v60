// Sprint 43-stable — Conversation mockée Hélène ↔ Floriane.
// Service réel = Sprint 41-prompts dédié.
// Doctrine 02-EXPERTS.md §1-2 (Hélène orchestratrice).

export type ConversationMessage = {
  id: string
  role: 'user' | 'expert'
  expertId?: string
  content: string
  time: string
}

export const SEED_HELENE_CONVERSATION: ReadonlyArray<ConversationMessage> = [
  {
    id: 'm-1',
    role: 'expert',
    expertId: 'helene',
    content:
      "Bonjour. J'ai préparé ta roadmap du jour. Trois étapes principales : préparer la publication de 15h, faire un point sur la série Manifeste, et tu as un rappel ce matin pour briefer le photographe.",
    time: '8h12',
  },
  {
    id: 'm-2',
    role: 'user',
    content: "Merci. On peut commencer par le brief photographe ? Antoine peut nous aider sur la direction ?",
    time: '8h45',
  },
  {
    id: 'm-3',
    role: 'expert',
    expertId: 'helene',
    content:
      "Oui, je consulte Antoine en arrière-plan. Pour la capsule « Mains » de juin, il propose de cadrer sur le geste plutôt que sur le produit fini. Ambiance Hermès Métiers. Tu veux que je formalise un brief écrit ?",
    time: '8h47',
  },
]

// Liste des conversations dans la pane gauche (V1 mockée)
export type ConversationSummary = {
  id: string
  participantId: string
  participantName: string
  preview: string
  time: string
  unread?: boolean
  pinned?: boolean
}

export const SEED_CONVERSATIONS: ReadonlyArray<ConversationSummary> = [
  {
    id: 'conv-helene',
    participantId: 'helene',
    participantName: 'Hélène M.',
    preview: 'Oui, je consulte Antoine en arrière-plan…',
    time: '8h47',
    pinned: true,
    unread: false,
  },
  {
    id: 'conv-albane',
    participantId: 'albane-r',
    participantName: 'Albane R.',
    preview: 'Sur la série Manifeste, j\'ai cinq pistes de phrasing.',
    time: 'hier',
    unread: true,
  },
  {
    id: 'conv-antoine',
    participantId: 'antoine-f',
    participantName: 'Antoine F.',
    preview: 'Référence visuelle pour ta capsule mains ↘',
    time: '14 mai',
  },
]
