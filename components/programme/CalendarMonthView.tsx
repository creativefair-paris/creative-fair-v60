// Sprint 37.I (F75) — Vraie vue Calendrier mensuel grid 7×5-6.
//
// Lundi → Dimanche en header. Cellules = jours du mois avec mini-pastilles
// posts. Navigation flèches '‹ Mois précédent' / 'Mois suivant ›'.
// Clic sur post → bulle preview overlay (gestion parent).

'use client'

import { useMemo, useState } from 'react'
import type { OverlayPost } from './PostPreviewOverlay'

const DAYS_FR = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'] as const

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const FORMAT_COLOR: Record<string, string> = {
  anecdote: '#007AFF',
  produit: '#34C759',
  evenement: '#FF9500',
  coulisses: '#AF52DE',
  manifeste: '#FF3B30',
  question: '#5856D6',
}

type Props = {
  posts: ReadonlyArray<OverlayPost>
  onSelectPost: (post: OverlayPost) => void
  refDate?: Date
}

type DayCell = {
  iso: string
  date: Date
  dayNumber: number
  isCurrentMonth: boolean
  posts: ReadonlyArray<OverlayPost>
}

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildMonthGrid(
  year: number,
  month: number,
  posts: ReadonlyArray<OverlayPost>,
): ReadonlyArray<DayCell> {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  // Padding début : recule jusqu'au lundi précédent.
  const dayOfWeekFirst = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(start.getDate() - dayOfWeekFirst)
  // Padding fin : avance jusqu'au dimanche suivant.
  const dayOfWeekLast = (last.getDay() + 6) % 7
  const end = new Date(last)
  end.setDate(end.getDate() + (6 - dayOfWeekLast))

  const postsByIso = new Map<string, OverlayPost[]>()
  for (const p of posts) {
    if (!p.date_prevue) continue
    if (!postsByIso.has(p.date_prevue)) postsByIso.set(p.date_prevue, [])
    postsByIso.get(p.date_prevue)!.push(p)
  }

  const cells: DayCell[] = []
  const cursor = new Date(start)
  while (cursor.getTime() <= end.getTime()) {
    const iso = isoDate(cursor)
    cells.push({
      iso,
      date: new Date(cursor),
      dayNumber: cursor.getDate(),
      isCurrentMonth: cursor.getMonth() === month,
      posts: postsByIso.get(iso) ?? [],
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return cells
}

export function CalendarMonthView({ posts, onSelectPost, refDate }: Props) {
  const initial = refDate ?? (posts.find((p) => p.date_prevue)?.date_prevue
    ? new Date(`${posts.find((p) => p.date_prevue)!.date_prevue!}T00:00:00`)
    : new Date())
  const [year, setYear] = useState(initial.getFullYear())
  const [month, setMonth] = useState(initial.getMonth())

  const cells = useMemo(() => buildMonthGrid(year, month, posts), [year, month, posts])

  function prevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  return (
    <div className="cfs-cal-month">
      <header className="cfs-cal-month-header">
        <button type="button" onClick={prevMonth} className="cfs-cal-month-nav" aria-label="Mois précédent">
          ‹ Mois précédent
        </button>
        <h3 className="cfs-cal-month-label">
          {MONTHS_FR[month]} {year}
        </h3>
        <button type="button" onClick={nextMonth} className="cfs-cal-month-nav" aria-label="Mois suivant">
          Mois suivant ›
        </button>
      </header>

      <div className="cfs-cal-month-grid">
        {DAYS_FR.map((d) => (
          <div key={d} className="cfs-cal-month-daylabel">{d}</div>
        ))}
        {cells.map((cell) => (
          <div
            key={cell.iso}
            className={`cfs-cal-month-cell${cell.isCurrentMonth ? '' : ' is-other-month'}`}
          >
            <span className="cfs-cal-month-cell-day">{cell.dayNumber}</span>
            <div className="cfs-cal-month-cell-posts">
              {cell.posts.map((post) => {
                const color = post.format ? FORMAT_COLOR[post.format] ?? '#8E8E93' : '#D1D1D6'
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => onSelectPost(post)}
                    className="cfs-cal-month-post"
                    style={{ background: `${color}1F`, color: color, borderColor: `${color}44` }}
                    title={post.objectif_editorial ?? post.titre ?? ''}
                  >
                    {(post.format ?? '').slice(0, 3).toUpperCase()}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .cfs-cal-month {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cfs-cal-month-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cfs-cal-month-nav {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.6);
          font-family: var(--font-system);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-label);
          cursor: pointer;
          transition: background 180ms ease-out;
        }
        .cfs-cal-month-nav:hover {
          background: rgba(255, 255, 255, 0.9);
        }
        .cfs-cal-month-label {
          margin: 0;
          font-family: var(--font-system);
          font-size: 16px;
          font-weight: 600;
          color: var(--color-label);
          letter-spacing: -0.01em;
        }
        .cfs-cal-month-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .cfs-cal-month-daylabel {
          text-align: center;
          padding: 6px 0;
          font-family: var(--font-system);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-tertiary-label);
        }
        .cfs-cal-month-cell {
          min-height: 80px;
          padding: 4px 6px;
          border-radius: 6px;
          /* Sprint 37.J (F84) — Cellules transparentes pour laisser passer
             les halos signature. Bordure subtile uniquement. */
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cfs-cal-month-cell.is-other-month {
          opacity: 0.35;
          background: transparent;
          border-color: rgba(0, 0, 0, 0.02);
        }
        .cfs-cal-month-cell-day {
          font-family: var(--font-system);
          font-size: 12px;
          font-weight: 600;
          color: var(--color-secondary-label);
        }
        .cfs-cal-month-cell-posts {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cfs-cal-month-post {
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid;
          font-family: var(--font-system);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          text-align: left;
          transition: transform 180ms ease-out;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cfs-cal-month-post:hover {
          transform: scale(1.02);
        }
        @media (max-width: 900px) {
          .cfs-cal-month-cell {
            min-height: 60px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-cal-month-post, .cfs-cal-month-nav { transition: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  )
}
