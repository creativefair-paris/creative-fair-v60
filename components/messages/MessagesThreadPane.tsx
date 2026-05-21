// Sprint 43-stable — Pane droite Messages : conversation style iMessage
// Doctrine 02-EXPERTS.md §4 + bandeau "Hélène écoute toujours" §4.3

import { Eye, Paperclip, Send } from 'lucide-react'
import { getExpertById, HELENE } from '@/lib/messages/experts'
import type { ConversationMessage } from '@/lib/messages/seed-conversation'

type Props = {
  expertId: string
  messages: ReadonlyArray<ConversationMessage>
  showHeleneListens: boolean
}

export function MessagesThreadPane({ expertId, messages, showHeleneListens }: Props) {
  const expert = getExpertById(expertId)
  if (!expert) {
    return (
      <main className="ms-pane-thread glass-z1">
        <div className="empty-state">
          <p>Aucune conversation sélectionnée.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="ms-pane-thread glass-z1" aria-label={`Conversation avec ${expert.name}`}>
      <header className="ms-thread-header">
        <div className="ms-thread-avatar" style={{ background: expert.color }}>
          {expert.initial}
        </div>
        <div className="ms-thread-info">
          <div className="ms-thread-name">{expert.name}</div>
          <div className="ms-thread-domain">{expert.domain}</div>
        </div>
      </header>

      {showHeleneListens ? (
        <div className="ms-helene-banner" role="status">
          <Eye size={14} strokeWidth={1.6} />
          <span>Hélène écoute toujours</span>
        </div>
      ) : null}

      <div className="ms-thread-body">
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="ms-bubble-row is-user">
                <div className="ms-bubble is-user">
                  <p>{msg.content}</p>
                  <span className="ms-bubble-time">{msg.time}</span>
                </div>
              </div>
            )
          }
          const speaker = msg.expertId ? getExpertById(msg.expertId) ?? HELENE : HELENE
          return (
            <div key={msg.id} className="ms-bubble-row is-expert">
              <span className="ms-bubble-avatar" style={{ background: speaker.color }}>
                {speaker.initial}
              </span>
              <div className="ms-bubble is-expert">
                <p>{msg.content}</p>
                <span className="ms-bubble-time">
                  {speaker.name} · {msg.time}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <footer className="ms-input-bar">
        <button className="ms-input-attach" aria-label="Joindre">
          <Paperclip size={18} strokeWidth={1.6} />
        </button>
        <input
          type="text"
          placeholder="Service Hélène en cours de configuration"
          className="ms-input-field"
          disabled
          aria-describedby="ms-input-help"
        />
        <button className="ms-input-send" aria-label="Envoyer" disabled>
          <Send size={18} strokeWidth={1.6} />
        </button>
      </footer>
    </main>
  )
}
