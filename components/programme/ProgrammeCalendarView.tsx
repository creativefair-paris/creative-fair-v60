// Sprint 37.F (F48) — Vue Calendrier de /programme.
//
// Sous-split horizontal dans la preview du ProgrammeSplitShell :
// calendrier à gauche (groupé par semaine, posts en rangées par jour)
// + preview du post sélectionné à droite avec mini chat 2-3 tours.

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { askMiniChat } from '@/app/_actions/ask-mini-chat'

type PostRow = {
  id: string
  date_prevue: string | null
  format: string | null
  structure_type: string | null
  pilier_nom: string | null
  objectif_editorial: string | null
  angle: string | null
  titre: string | null
  statut: string | null
}

type Props = {
  posts: ReadonlyArray<PostRow>
  programmeDateDebut: string | null
  programmeDateFin: string | null
}

const FORMAT_COLOR: Record<string, string> = {
  anecdote: '#007AFF',
  produit: '#34C759',
  evenement: '#FF9500',
  coulisses: '#AF52DE',
  manifeste: '#FF3B30',
  question: '#5856D6',
}
const FORMAT_LABEL: Record<string, string> = {
  anecdote: 'Anecdote',
  produit: 'Produit',
  evenement: 'Événement',
  coulisses: 'Coulisses',
  manifeste: 'Manifeste',
  question: 'Question',
}

type ChatMessage = { role: 'user' | 'conseiller'; content: string }

const MAX_CHAT_TURNS = 3

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day + 6) % 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatShortFr(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `${d.getDate()} ${mois[d.getMonth()]}`
}

type Week = { startIso: string; posts: ReadonlyArray<PostRow> }

function groupByWeek(posts: ReadonlyArray<PostRow>): ReadonlyArray<Week> {
  const map = new Map<string, PostRow[]>()
  for (const p of posts) {
    if (!p.date_prevue) continue
    const d = new Date(`${p.date_prevue}T00:00:00`)
    if (Number.isNaN(d.getTime())) continue
    const key = isoDate(startOfWeek(d))
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([startIso, postsArr]) => ({
      startIso,
      posts: postsArr.sort((a, b) =>
        (a.date_prevue ?? '').localeCompare(b.date_prevue ?? ''),
      ),
    }))
}

export function ProgrammeCalendarView({
  posts,
  programmeDateDebut,
  programmeDateFin,
}: Props) {
  const router = useRouter()
  const weeks = useMemo(() => groupByWeek(posts), [posts])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    posts[0]?.id ?? null,
  )
  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedPostId) ?? null,
    [posts, selectedPostId],
  )

  const [chatMessages, setChatMessages] = useState<ReadonlyArray<ChatMessage>>([])
  const [chatInput, setChatInput] = useState('')
  const [asking, setAsking] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  function selectPost(p: PostRow) {
    setSelectedPostId(p.id)
    setChatMessages([])
    setChatInput('')
    setChatError(null)
  }

  const userTurns = chatMessages.filter((m) => m.role === 'user').length
  const chatExhausted = userTurns >= MAX_CHAT_TURNS

  async function handleAsk() {
    if (!selectedPost || !chatInput.trim() || asking) return
    if (chatExhausted) {
      router.push(`/outils/conseiller?scenario=B2&post_id=${selectedPost.id}`)
      return
    }
    const question = chatInput.trim()
    const nextMsgs: ChatMessage[] = [
      ...chatMessages,
      { role: 'user', content: question },
    ]
    setChatMessages(nextMsgs)
    setChatInput('')
    setAsking(true)
    setChatError(null)
    try {
      const res = await askMiniChat(selectedPost.id, question)
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
    <div className="cfs-calendar-view">
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
        <h2
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: 'var(--color-label)',
            margin: 0,
          }}
        >
          Calendrier
        </h2>
        {programmeDateDebut && programmeDateFin ? (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-secondary-label)' }}>
            Du {formatShortFr(programmeDateDebut)} au {formatShortFr(programmeDateFin)} ·{' '}
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        ) : null}
      </header>

      <div className="cfs-calendar-grid">
        <aside className="cfs-calendar-list">
          {weeks.length === 0 ? (
            <p style={{ padding: '24px 16px', fontSize: 13, color: 'var(--color-secondary-label)', margin: 0 }}>
              Aucun post planifié.
            </p>
          ) : (
            weeks.map((w) => (
              <section key={w.startIso}>
                <h3 className="cfs-calendar-week-label">
                  Semaine du {formatShortFr(w.startIso)}
                </h3>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {w.posts.map((p) => {
                    const isSel = p.id === selectedPostId
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => selectPost(p)}
                          aria-current={isSel ? 'true' : undefined}
                          className={`cfs-calendar-day-btn${isSel ? ' is-selected' : ''}`}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              flexShrink: 0,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              background: p.format ? FORMAT_COLOR[p.format] ?? '#8E8E93' : '#D1D1D6',
                              marginTop: 6,
                            }}
                          />
                          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, color: 'var(--color-tertiary-label)' }}>
                              {p.date_prevue ? formatShortFr(p.date_prevue) : '—'}
                              {p.format ? ` · ${FORMAT_LABEL[p.format] ?? p.format}` : ''}
                            </span>
                            <span
                              style={{
                                fontFamily: 'var(--font-system)',
                                fontSize: 13,
                                fontWeight: 500,
                                color: 'var(--color-label)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2,
                              }}
                            >
                              {p.objectif_editorial ?? p.titre ?? 'Post sans titre'}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))
          )}
        </aside>

        <section className="cfs-calendar-preview">
          {!selectedPost ? (
            <p style={{ fontSize: 13, color: 'var(--color-secondary-label)', padding: '40px 20px', textAlign: 'center' }}>
              Sélectionne un post dans le calendrier pour voir son détail.
            </p>
          ) : (
            <article style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <header style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {selectedPost.format ? (
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: 6,
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#FFFFFF',
                      background: FORMAT_COLOR[selectedPost.format] ?? '#8E8E93',
                    }}
                  >
                    {FORMAT_LABEL[selectedPost.format] ?? selectedPost.format}
                  </span>
                ) : null}
                {selectedPost.structure_type ? (
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--color-secondary-label)',
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(0, 0, 0, 0.04)',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {selectedPost.structure_type}
                  </span>
                ) : null}
                {selectedPost.date_prevue ? (
                  <span style={{ fontSize: 12, color: 'var(--color-tertiary-label)' }}>
                    {formatShortFr(selectedPost.date_prevue)}
                  </span>
                ) : null}
              </header>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-system)',
                    fontSize: 17,
                    fontWeight: 600,
                    color: 'var(--color-label)',
                    lineHeight: 1.3,
                  }}
                >
                  {selectedPost.objectif_editorial ?? selectedPost.titre ?? 'Post sans titre'}
                </h3>
                {selectedPost.angle ? (
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'rgba(0, 0, 0, 0.75)' }}>
                    {selectedPost.angle}
                  </p>
                ) : null}
                {selectedPost.pilier_nom ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--color-tertiary-label)',
                      marginTop: 4,
                    }}
                  >
                    Pilier : {selectedPost.pilier_nom}
                  </span>
                ) : null}
              </div>

              <section
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
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {chatMessages.map((m, i) => (
                      <li
                        key={i}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 10,
                          fontSize: 13,
                          lineHeight: 1.5,
                          background: m.role === 'user' ? 'rgba(0, 122, 255, 0.08)' : 'rgba(255, 255, 255, 0.7)',
                          border: '1px solid ' + (m.role === 'user' ? 'rgba(0, 122, 255, 0.18)' : 'rgba(0, 0, 0, 0.05)'),
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
                    onClick={() =>
                      router.push(`/outils/conseiller?scenario=B2&post_id=${selectedPost.id}`)
                    }
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

              <footer style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link
                  href={`/programme/posts/${selectedPost.id}`}
                  className="btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  Éditer ce post →
                </Link>
              </footer>
            </article>
          )}
        </section>
      </div>

      <style>{`
        .cfs-calendar-grid {
          display: grid;
          grid-template-columns: 38% 62%;
          gap: 18px;
          align-items: start;
        }
        .cfs-calendar-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 720px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .cfs-calendar-week-label {
          margin: 0 0 6px 4px;
          font-family: var(--font-system);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-tertiary-label);
        }
        .cfs-calendar-day-btn {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          text-align: left;
          transition: background-color 180ms ease-out, border-color 180ms ease-out;
        }
        .cfs-calendar-day-btn:hover:not(.is-selected) {
          background-color: rgba(0, 0, 0, 0.03);
        }
        .cfs-calendar-day-btn.is-selected {
          background-color: rgba(0, 122, 255, 0.08);
          border-color: rgba(0, 122, 255, 0.2);
        }
        .cfs-calendar-preview {
          padding: 20px 22px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 24px;
        }
        @media (max-width: 900px) {
          .cfs-calendar-grid {
            grid-template-columns: 1fr;
          }
          .cfs-calendar-list {
            max-height: none;
          }
          .cfs-calendar-preview {
            position: static;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-calendar-day-btn { transition: none !important; }
        }
      `}</style>
    </div>
  )
}
