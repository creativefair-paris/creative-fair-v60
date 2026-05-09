// SUPPRESSION CANDIDATE Sprint 33 — composant legacy déplacé en Sprint 32.5
'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import type { ConversationSummary } from './ConversationsList'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  initialConversationId: string | null
  initialMessages: Message[]
  onConversationCreated: (summary: ConversationSummary) => void
}

export function ConseillerChat({
  initialConversationId,
  initialMessages,
  onConversationCreated,
}: Props) {
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  )
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streaming])

  async function send() {
    const trimmed = input.trim()
    if (!trimmed || streaming) return
    setError(null)

    const next: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setStreaming(true)

    let assistantText = ''
    let nextConversationId = conversationId

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          conversationId,
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Conseiller indisponible.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const pushPartial = (delta: string) => {
        assistantText += delta
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.role === 'assistant') {
            return [...prev.slice(0, -1), { role: 'assistant', content: assistantText }]
          }
          return [...prev, { role: 'assistant', content: assistantText }]
        })
      }

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine.startsWith('data:')) continue
          const payload = trimmedLine.slice('data:'.length).trim()
          if (payload === '[DONE]') continue
          try {
            const parsed = JSON.parse(payload) as {
              text?: string
              conversationId?: string
              error?: string
            }
            if (parsed.error) {
              throw new Error(parsed.error)
            }
            if (parsed.conversationId) {
              nextConversationId = parsed.conversationId
              setConversationId(parsed.conversationId)
            }
            if (parsed.text) {
              pushPartial(parsed.text)
            }
          } catch {
            // ignore parse error of single chunk
          }
        }
      }

      if (!conversationId && nextConversationId) {
        const title = trimmed.slice(0, 60)
        onConversationCreated({
          id: nextConversationId,
          title,
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conseiller indisponible.')
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="flex flex-col h-[70vh] min-h-[480px]">
      <div
        ref={scrollRef}
        className="glass-z2 flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length === 0 && !streaming && (
          <p
            className="text-sm"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Pose ta question. Je connais ta marque et ton calendrier.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className="flex"
            style={{ justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div
              className="max-w-[80%] px-3 py-2 text-sm leading-relaxed whitespace-pre-line"
              style={{
                backgroundColor:
                  m.role === 'user'
                    ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)'
                    : 'var(--color-background)',
                border:
                  m.role === 'user'
                    ? '1px solid var(--color-accent)'
                    : '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p
          className="text-sm mt-2"
          style={{ color: 'var(--color-error)', fontFamily: 'var(--font-body)' }}
        >
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
        className="mt-3 flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void send()
            }
          }}
          rows={2}
          placeholder="Ta question…"
          disabled={streaming}
          className="flex-1 px-3 py-2 text-sm resize-none"
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
          }}
        />
        <button
          type="submit"
          disabled={streaming || input.trim().length === 0}
          className="px-3 py-2 text-sm font-medium inline-flex items-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-fg)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <Send size={14} />
          Envoyer
        </button>
      </form>
    </div>
  )
}
