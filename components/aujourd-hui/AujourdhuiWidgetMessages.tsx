// Sprint 43-stable — Widget Messages sur Aujourd'hui

import Link from 'next/link'

type Conversation = {
  id: string
  participant: string
  preview: string
  time: string
  unread?: boolean
}

type Props = {
  conversations: ReadonlyArray<Conversation>
}

export function AujourdhuiWidgetMessages({ conversations }: Props) {
  return (
    <Link href="/messages" className="widget-link" aria-label="Ouvrir Messages">
      <article className="widget glass-z2" aria-label="Messages">
        <header className="widget-msg-header">
          <h2 className="widget-msg-title">Messages</h2>
        </header>
        <ul className="widget-msg-list">
          {conversations.length === 0 ? (
            <li className="widget-msg-empty">Aucun message récent.</li>
          ) : (
            conversations.slice(0, 3).map((conv) => (
              <li key={conv.id} className="widget-msg-item">
                <div className="widget-msg-row">
                  <span className="widget-msg-name">{conv.participant}</span>
                  <span className="widget-msg-time">{conv.time}</span>
                </div>
                <p className="widget-msg-preview">{conv.preview}</p>
              </li>
            ))
          )}
        </ul>
      </article>
    </Link>
  )
}
