// Sprint 43-stable — Pane gauche Messages : liste conversations + bouton Carnet

import Link from 'next/link'
import { Pin, Users } from 'lucide-react'
import { HELENE, getExpertById } from '@/lib/messages/experts'
import type { ConversationSummary } from '@/lib/messages/seed-conversation'

type Props = {
  conversations: ReadonlyArray<ConversationSummary>
  activeConversationId: string
}

export function MessagesListePane({ conversations, activeConversationId }: Props) {
  const pinned = conversations.find((c) => c.participantId === HELENE.id)
  const others = conversations.filter((c) => c.participantId !== HELENE.id)

  return (
    <aside className="ms-pane-list glass-z1" aria-label="Conversations">
      <div className="ms-pane-list-header">
        <h2 className="ms-pane-title">Messages</h2>
      </div>

      {pinned ? (
        <div className="ms-pane-section">
          <div className="ms-pane-eyebrow">
            <Pin size={11} strokeWidth={2} />
            Épinglée
          </div>
          <ConversationRow
            conversation={pinned}
            isActive={pinned.id === activeConversationId}
            expertColor={HELENE.color}
            expertInitial={HELENE.initial}
          />
        </div>
      ) : null}

      <div className="ms-pane-section">
        <div className="ms-pane-eyebrow">Conversations</div>
        {others.map((conv) => {
          const expert = getExpertById(conv.participantId)
          return (
            <ConversationRow
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              expertColor={expert?.color ?? 'var(--text-secondary)'}
              expertInitial={expert?.initial ?? '?'}
            />
          )
        })}
      </div>

      <Link href="/messages?carnet=1" className="ms-pane-carnet-btn">
        <Users size={16} strokeWidth={1.6} />
        Voir tous les contacts
      </Link>
    </aside>
  )
}

function ConversationRow({
  conversation,
  isActive,
  expertColor,
  expertInitial,
}: {
  conversation: ConversationSummary
  isActive: boolean
  expertColor: string
  expertInitial: string
}) {
  return (
    <Link
      href={`/messages?conv=${conversation.id}`}
      className={`ms-conv-row ${isActive ? 'is-active' : ''}`}
    >
      <span className="ms-conv-avatar" style={{ background: expertColor }}>
        {expertInitial}
      </span>
      <div className="ms-conv-body">
        <div className="ms-conv-row-top">
          <span className="ms-conv-name">{conversation.participantName}</span>
          <span className="ms-conv-time">{conversation.time}</span>
        </div>
        <p className="ms-conv-preview">
          {conversation.preview}
          {conversation.unread ? <span className="ms-conv-dot" aria-label="non lu" /> : null}
        </p>
      </div>
    </Link>
  )
}
