// Sprint 37.H (F69) — Mini chat extrait du ProgrammeCalendarView Sprint 37.F
// pour être intégré dans la fiche post /programme/posts/[postId].
//
// 2-3 tours utilisateur maximum (MAX_CHAT_TURNS = 3). Au-delà, bouton
// "Continuer dans une conversation complète →" qui ouvre /outils/conseiller
// scénario B2 sur ce post.

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { askMiniChat } from '@/app/_actions/ask-mini-chat'

type ChatMessage = { role: 'user' | 'conseiller'; content: string }

const MAX_CHAT_TURNS = 3

type Props = {
  postId: string
}

export function PostMiniChat({ postId }: Props) {
  const router = useRouter()
  const [chatMessages, setChatMessages] = useState<ReadonlyArray<ChatMessage>>([])
  const [chatInput, setChatInput] = useState('')
  const [asking, setAsking] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  const userTurns = chatMessages.filter((m) => m.role === 'user').length
  const chatExhausted = userTurns >= MAX_CHAT_TURNS

  async function handleAsk() {
    if (!chatInput.trim() || asking) return
    if (chatExhausted) {
      router.push(`/outils/conseiller?scenario=B2&post_id=${postId}`)
      return
    }
    const question = chatInput.trim()
    const nextMsgs: ChatMessage[] = [...chatMessages, { role: 'user', content: question }]
    setChatMessages(nextMsgs)
    setChatInput('')
    setAsking(true)
    setChatError(null)
    try {
      const res = await askMiniChat(postId, question)
      if (res.ok) {
        setChatMessages([...nextMsgs, { role: 'conseiller', content: res.text }])
      } else {
        setChatError(res.reason)
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setAsking(false)
    }
  }

  return (
    <section
      aria-label="Discuter de ce post"
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        background: 'rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <h4
        style={{
          margin: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-tertiary-label)',
        }}
      >
        Discuter de ce post
      </h4>

      {chatMessages.length > 0 ? (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {chatMessages.map((m, i) => (
            <li
              key={i}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 13,
                lineHeight: 1.5,
                background: m.role === 'user' ? 'rgba(0, 122, 255, 0.08)' : 'rgba(255, 255, 255, 0.7)',
                border:
                  '1px solid ' +
                  (m.role === 'user' ? 'rgba(0, 122, 255, 0.18)' : 'rgba(0, 0, 0, 0.05)'),
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                color: 'var(--color-label)',
              }}
            >
              {m.content}
            </li>
          ))}
        </ul>
      ) : null}

      {chatError ? (
        <p
          role="alert"
          style={{
            fontSize: 12,
            color: '#C0392B',
            padding: '6px 10px',
            borderRadius: 6,
            background: 'rgba(192, 57, 43, 0.06)',
            margin: 0,
          }}
        >
          {chatError}
        </p>
      ) : null}

      {chatExhausted ? (
        <button
          type="button"
          onClick={() => router.push(`/outils/conseiller?scenario=B2&post_id=${postId}`)}
          className="btn-choice"
          style={{
            padding: '8px 14px',
            background: 'rgba(0, 122, 255, 0.06)',
            borderColor: 'rgba(0, 122, 255, 0.18)',
            color: '#007AFF',
            fontSize: 13,
          }}
        >
          Continuer dans une conversation complète →
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAsk()
              }
            }}
            placeholder="Poser une question rapide…"
            disabled={asking}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleAsk}
            disabled={!chatInput.trim() || asking}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: 13 }}
          >
            {asking ? '…' : 'Envoyer'}
          </button>
        </div>
      )}
    </section>
  )
}
