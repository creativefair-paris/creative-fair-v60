// SUPPRESSION CANDIDATE Sprint 36 — composant legacy déplacé en Sprint 32.5
'use client'

import { useMemo, useState } from 'react'
import { ConversationsList, type ConversationSummary } from './ConversationsList'
import { ConseillerChat } from './ConseillerChat'
import { EmptyStateBrand } from '@/components/ui/EmptyStateBrand'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type ConversationFull = ConversationSummary & {
  messages: Message[]
}

type Props = {
  initial: ConversationFull[]
  brandBookComplete?: boolean
}

export function ConseillerLayout({ initial, brandBookComplete = false }: Props) {
  const [conversations, setConversations] = useState<ConversationFull[]>(initial)
  const [activeId, setActiveId] = useState<string | null>(initial[0]?.id ?? null)

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  )

  return (
    <main
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <header className="space-y-1">
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Conseiller
          </h1>
          <p
            className="text-sm"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Une conversation continue qui connaît ta marque et ton calendrier.
          </p>
        </header>

        {!brandBookComplete ? (
          <EmptyStateBrand
            title="Configure ta marque pour activer le Conseiller"
            body="Le Conseiller connaît ta voix, tes valeurs et ton calendrier business. Définis ta marque pour en profiter pleinement."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside>
              <ConversationsList
                conversations={conversations}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </aside>

            <section className="min-w-0">
              <ConseillerChat
                key={activeId ?? 'new'}
                initialConversationId={activeId}
                initialMessages={active?.messages ?? []}
                onConversationCreated={(summary) => {
                  setConversations((prev) => [
                    { ...summary, messages: [] },
                    ...prev,
                  ])
                  setActiveId(summary.id)
                }}
              />
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
