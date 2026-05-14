// Sprint 37.F (F48) — Vue Calendrier de /programme.
//
// Sous-split horizontal dans la preview du ProgrammeSplitShell :
// calendrier à gauche (groupé par semaine, posts en rangées par jour)
// + preview du post sélectionné à droite avec mini chat 2-3 tours.

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarViewSwitcher,
  type CalendarViewKind,
} from './CalendarViewSwitcher'

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

  // Sprint 37.G (F64) — Toggle 3 vues (Semaine / Mois / Liste) avec
  // persistance localStorage.
  const [viewKind, setViewKind] = useState<CalendarViewKind>('week')
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('cf:calendar-view')
    if (stored === 'week' || stored === 'month' || stored === 'list') {
      setViewKind(stored)
    }
  }, [])
  function changeView(next: CalendarViewKind) {
    setViewKind(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cf:calendar-view', next)
    }
  }

  // Sprint 37.H (F69) — Plus de state selectedPostId / chatMessages.
  // Le clic sur un post navigue directement vers /programme/posts/[postId].
  // Le mini chat (composant PostMiniChat) a été déplacé dans la fiche post.
  function selectPost(p: PostRow) {
    router.push(`/programme/posts/${p.id}`)
  }

  return (
    <div className="cfs-calendar-view">
      {/* Sprint 37.H (F70) — Titre 'Calendrier' + sous-titre période retirés
          (redondants : breadcrumb + toggle suffisent comme repères). */}
      <header style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <CalendarViewSwitcher active={viewKind} onChange={changeView} />
      </header>

      {/* Sprint 37.H (F69) — Calendrier plein écran, plus de sous-split.
          Le clic sur un post navigue vers /programme/posts/[postId] (fiche post). */}
      <div className="cfs-calendar-full">
        {viewKind === 'month' ? (
          <MonthGrid posts={posts} onSelect={selectPost} />
        ) : viewKind === 'list' ? (
          <FlatList posts={posts} onSelect={selectPost} />
        ) : weeks.length === 0 ? (
          <p style={{ padding: '24px 16px', fontSize: 13, color: 'var(--color-secondary-label)', margin: 0 }}>
            Aucun post planifié.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {weeks.map((w) => (
              <section key={w.startIso}>
                <h3 className="cfs-calendar-week-label">
                  Semaine du {formatShortFr(w.startIso)}
                </h3>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {w.posts.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => selectPost(p)}
                        className="cfs-calendar-day-btn"
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
                              fontSize: 14,
                              fontWeight: 500,
                              color: 'var(--color-label)',
                            }}
                          >
                            {p.objectif_editorial ?? p.titre ?? 'Post sans titre'}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          style={{
                            flexShrink: 0,
                            color: 'var(--color-tertiary-label)',
                            fontSize: 14,
                            paddingRight: 4,
                          }}
                        >
                          →
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

      </div>

      <style>{`
        /* Sprint 37.H (F69) — Calendrier plein écran. Plus de sous-split. */
        .cfs-calendar-full {
          width: 100%;
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
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          text-align: left;
          transition: background-color 180ms ease-out, border-color 180ms ease-out, transform 180ms ease-out;
        }
        .cfs-calendar-day-btn:hover {
          background-color: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.08);
          transform: translateX(2px);
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-calendar-day-btn { transition: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  )
}

// Sprint 37.G (F64) — Vue Mois : grille 7 colonnes × 5-6 lignes.

type DayCell = {
  iso: string
  dayNumber: number
  isCurrentMonth: boolean
  posts: ReadonlyArray<PostRow>
}

function buildMonthGrid(posts: ReadonlyArray<PostRow>): {
  monthLabel: string
  days: ReadonlyArray<DayCell>
} {
  // On dérive le mois à afficher du premier post.
  const ref = posts.find((p) => p.date_prevue)?.date_prevue
  const refDate = ref ? new Date(`${ref}T00:00:00`) : new Date()
  const year = refDate.getFullYear()
  const month = refDate.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  // Padding début : recule jusqu'au lundi précédent (lun = 0).
  const dayOfWeekFirst = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(start.getDate() - dayOfWeekFirst)
  // Padding fin : avance jusqu'au dimanche suivant.
  const dayOfWeekLast = (last.getDay() + 6) % 7
  const end = new Date(last)
  end.setDate(end.getDate() + (6 - dayOfWeekLast))

  const postsByIso = new Map<string, PostRow[]>()
  for (const p of posts) {
    if (!p.date_prevue) continue
    if (!postsByIso.has(p.date_prevue)) postsByIso.set(p.date_prevue, [])
    postsByIso.get(p.date_prevue)!.push(p)
  }

  const days: DayCell[] = []
  const cursor = new Date(start)
  while (cursor.getTime() <= end.getTime()) {
    const iso = isoDate(cursor)
    days.push({
      iso,
      dayNumber: cursor.getDate(),
      isCurrentMonth: cursor.getMonth() === month,
      posts: postsByIso.get(iso) ?? [],
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ]
  return { monthLabel: `${monthNames[month] ?? ''} ${year}`, days }
}

function MonthGrid({
  posts,
  onSelect,
}: {
  posts: ReadonlyArray<PostRow>
  onSelect: (p: PostRow) => void
}) {
  const grid = useMemo(() => buildMonthGrid(posts), [posts])
  if (posts.length === 0) {
    return (
      <p style={{ padding: '24px 16px', fontSize: 13, color: 'var(--color-secondary-label)', margin: 0 }}>
        Aucun post planifié.
      </p>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3
        style={{
          margin: '0 0 4px 4px',
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-label)',
        }}
      >
        {grid.monthLabel}
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          fontFamily: 'var(--font-system)',
        }}
      >
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div
            key={`${d}-${i}`}
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textAlign: 'center',
              color: 'var(--color-tertiary-label)',
              padding: '4px 0',
            }}
          >
            {d}
          </div>
        ))}
        {grid.days.map((day) => (
          <div
            key={day.iso}
            style={{
              minHeight: 56,
              padding: '4px 4px 4px 6px',
              borderRadius: 6,
              border: '1px solid rgba(0, 0, 0, 0.04)',
              background: day.isCurrentMonth ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
              opacity: day.isCurrentMonth ? 1 : 0.4,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-secondary-label)' }}>
              {day.dayNumber}
            </span>
            {day.posts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p)}
                title={p.objectif_editorial ?? p.titre ?? ''}
                style={{
                  width: '100%',
                  padding: '3px 6px',
                  borderRadius: 4,
                  border: 'none',
                  background: p.format ? `${FORMAT_COLOR[p.format] ?? '#8E8E93'}33` : '#D1D1D6',
                  color: 'var(--color-label)',
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {(p.format ?? '').slice(0, 3).toUpperCase()}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Sprint 37.G (F64) — Vue Liste : listing chronologique vertical.

function FlatList({
  posts,
  onSelect,
}: {
  posts: ReadonlyArray<PostRow>
  onSelect: (p: PostRow) => void
}) {
  const sorted = useMemo(
    () =>
      [...posts]
        .filter((p) => p.date_prevue)
        .sort((a, b) => (a.date_prevue ?? '').localeCompare(b.date_prevue ?? '')),
    [posts],
  )
  if (sorted.length === 0) {
    return (
      <p style={{ padding: '24px 16px', fontSize: 13, color: 'var(--color-secondary-label)', margin: 0 }}>
        Aucun post planifié.
      </p>
    )
  }
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map((p) => {
        return (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p)}
              style={{
                width: '100%',
                display: 'flex',
                gap: 14,
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid rgba(0, 0, 0, 0.04)',
                background: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 56,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderRight: '1px solid rgba(0, 0, 0, 0.06)',
                  paddingRight: 12,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-tertiary-label)' }}>
                  {(() => {
                    const d = new Date(`${p.date_prevue}T00:00:00`)
                    const days = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM']
                    return days[d.getDay()] ?? ''
                  })()}
                </span>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-label)', letterSpacing: '-0.02em' }}>
                  {p.date_prevue ? new Date(`${p.date_prevue}T00:00:00`).getDate() : '—'}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {p.format ? (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 5,
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#FFFFFF',
                        background: FORMAT_COLOR[p.format] ?? '#8E8E93',
                      }}
                    >
                      {FORMAT_LABEL[p.format] ?? p.format}
                    </span>
                  ) : null}
                  {p.structure_type ? (
                    <span style={{ fontSize: 11, color: 'var(--color-tertiary-label)' }}>
                      {p.structure_type}
                    </span>
                  ) : null}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--color-label)',
                    lineHeight: 1.35,
                  }}
                >
                  {p.objectif_editorial ?? p.titre ?? 'Post sans titre'}
                </span>
                {p.pilier_nom ? (
                  <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-tertiary-label)' }}>
                    Pilier : {p.pilier_nom}
                  </span>
                ) : null}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
