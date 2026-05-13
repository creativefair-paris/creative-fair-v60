// Sprint 37 (Lot 3) — Page /outils/conseiller en mode historique.
//
// Doc 09 §8 (décision Apple #49) : la page dédiée n'est jamais un
// point d'entrée principal. C'est une liste lecture seule des
// conversations passées + un bouton "Nouvelle question" qui ouvre la
// sheet (scénario E-divers).
//
// Layout :
//   * En-tête : titre + CTA "Nouvelle question" aligné droite
//   * Split Brief 40/60 (mobile = stack vertical, liste d'abord)
//   * Gauche : conversations groupées par date (pattern Things 3)
//   * Droite : conversation sélectionnée en lecture seule, ou état vide

'use client'

import { useState } from 'react'
import { SplitBrief } from '@/components/layouts/SplitBrief'
import { ConseillerBubble } from './ConseillerBubble'
import { PiloteBubble } from './PiloteBubble'
import { ConseillerSheet, createStubSendMessage } from './ConseillerSheet'
import {
  deriveTitleFromConversation,
  scenarioLabel,
  groupConversationsByDate,
  type ConversationGroup,
} from '@/lib/conseiller/queries'
import type { ConseillerConversation } from '@/lib/conseiller/types'

type Props = {
  conversations: ReadonlyArray<ConseillerConversation>
}

function formatTimeShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(d)
}

export function ConseillerHistory({ conversations }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null,
  )
  const [sheetOpen, setSheetOpen] = useState(false)

  const groups: ConversationGroup[] = groupConversationsByDate(conversations)
  const selected = conversations.find((c) => c.id === selectedId) ?? null

  function handleNewQuestion() {
    setSheetOpen(true)
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 0 20px 0',
        }}
      >
        <button
          type="button"
          onClick={handleNewQuestion}
          style={{
            padding: '10px 20px',
            borderRadius: 22,
            border: 'none',
            background: 'var(--color-label)',
            color: 'var(--color-background)',
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Nouvelle question
        </button>
      </div>

      <SplitBrief
        mobileOrder="left-first"
        leftColumn={
          conversations.length === 0 ? (
            <EmptyList />
          ) : (
            <nav aria-label="Conversations passées">
              {groups.map((group) => (
                <section key={group.key} style={{ marginBottom: 20 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--color-tertiary-label)',
                      margin: '0 0 8px 4px',
                    }}
                  >
                    {group.label}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {group.items.map((conv) => {
                      const isSelected = conv.id === selectedId
                      const title = deriveTitleFromConversation(conv)
                      const scenario = scenarioLabel(conv.scenario_type)
                      return (
                        <li key={conv.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(conv.id)}
                            aria-pressed={isSelected}
                            className={
                              isSelected
                                ? 'glass-thin cfs-conv-row cfs-conv-row-selected'
                                : 'cfs-conv-row'
                            }
                            style={{
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                              padding: '10px 12px',
                              borderRadius: 10,
                              border: 'none',
                              background: isSelected ? undefined : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontFamily: 'var(--font-system)',
                              transition: 'background-color 200ms ease-out',
                            }}
                          >
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: 'var(--color-label)',
                                lineHeight: 1.35,
                              }}
                            >
                              {title}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                color: 'var(--color-tertiary-label)',
                                lineHeight: 1.3,
                              }}
                            >
                              {scenario} · {formatTimeShort(conv.created_at)}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}

              <style>{`
                .cfs-conv-row:hover:not(.cfs-conv-row-selected) {
                  background-color: rgba(0, 0, 0, 0.03);
                }
                @media (prefers-reduced-motion: reduce) {
                  .cfs-conv-row { transition: none !important; }
                }
              `}</style>
            </nav>
          )
        }
        rightColumn={
          selected ? (
            <ReadOnlyConversation conv={selected} />
          ) : (
            <EmptyPreview onNew={handleNewQuestion} />
          )
        }
      />

      <ConseillerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        scenarioType="E-divers"
        headerLabel="Nouvelle question"
        onSendMessage={createStubSendMessage()}
      />
    </>
  )
}

function EmptyList() {
  return (
    <p
      style={{
        fontFamily: 'var(--font-system)',
        fontSize: 14,
        color: 'var(--color-secondary-label)',
        margin: 0,
        padding: '12px 4px',
        lineHeight: 1.5,
      }}
    >
      Aucune conversation pour l'instant. Démarre-en une avec le bouton
      "Nouvelle question".
    </p>
  )
}

function EmptyPreview({ onNew }: { onNew: () => void }) {
  return (
    <article
      className="glass-thin"
      style={{
        borderRadius: 16,
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        textAlign: 'left',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--color-label)',
          margin: 0,
        }}
      >
        Sélectionne une conversation passée ou commence une nouvelle question.
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          color: 'var(--color-secondary-label)',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Le conseiller connaît ta marque, tes piliers, ton calendrier. Sollicite-le
        pour préparer une réunion, affiner un post, ou trancher une opportunité.
      </p>
      <button
        type="button"
        onClick={onNew}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 20px',
          borderRadius: 22,
          border: 'none',
          background: 'var(--color-label)',
          color: 'var(--color-background)',
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Nouvelle question
      </button>
    </article>
  )
}

function ReadOnlyConversation({ conv }: { conv: ConseillerConversation }) {
  const title = deriveTitleFromConversation(conv)
  const scenario = scenarioLabel(conv.scenario_type)
  return (
    <article
      className="glass-thin"
      style={{
        borderRadius: 16,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-tertiary-label)',
          }}
        >
          {scenario}
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-label)',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>
      </header>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          marginTop: 8,
        }}
      >
        {conv.messages.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              color: 'var(--color-secondary-label)',
              margin: 0,
            }}
          >
            Conversation vide.
          </p>
        ) : (
          conv.messages.map((m, i) =>
            m.role === 'user' ? (
              <PiloteBubble key={i} content={m.content} />
            ) : (
              <ConseillerBubble key={i}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
              </ConseillerBubble>
            ),
          )
        )}
      </div>

      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 12,
          color: 'var(--color-tertiary-label)',
          margin: '12px 0 0 0',
          fontStyle: 'italic',
        }}
      >
        Conversation en lecture seule. Pour une nouvelle question, clique sur
        "Nouvelle question" en haut.
      </p>
    </article>
  )
}
