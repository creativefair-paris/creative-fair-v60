'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export type ConversationSummary = {
  id: string
  title: string
  updatedAt: string
}

type Props = {
  conversations: ConversationSummary[]
  activeId: string | null
  onSelect: (id: string | null) => void
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const oneDay = 24 * 60 * 60 * 1000
  if (diffMs < oneDay && d.getDate() === now.getDate()) {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  }
  if (diffMs < 7 * oneDay) {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d)
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(d)
}

export function ConversationsList({ conversations, activeId, onSelect }: Props) {
  const router = useRouter()
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p
          className="text-xs uppercase tracking-wide"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Conversations
        </p>
        <button
          type="button"
          onClick={() => {
            onSelect(null)
            router.refresh()
          }}
          className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
          style={{
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <Plus size={14} />
          Nouvelle
        </button>
      </div>

      {conversations.length === 0 ? (
        <p
          className="text-sm"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Pas encore de conversation.
        </p>
      ) : (
        <ul className="space-y-1">
          {conversations.map((c) => {
            const active = c.id === activeId
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className="w-full text-left px-3 py-2 transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: active
                      ? 'rgba(168, 50, 78, 0.10)'
                      : 'transparent',
                    border: active
                      ? '1px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {c.title}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {formatRelative(c.updatedAt)}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
