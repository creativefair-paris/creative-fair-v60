// Sprint 37.I (F74) — Vraie vue Calendrier hebdomadaire grid 7 colonnes.
//
// Lundi → Dimanche. Navigation flèches '‹ Semaine précédente' / 'Semaine
// suivante ›' qui décale weekStart de ±7 jours. Cartes posts placées dans
// la colonne du jour avec border-left coloré par format.

'use client'

import { useMemo, useState } from 'react'
import type { OverlayPost } from './PostPreviewOverlay'

const DAYS_FR = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'] as const

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
  // Date de référence pour calculer la première semaine affichée (default = today).
  refDate?: Date
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=dim, 1=lun, ...
  const diff = (day + 6) % 7 // lundi = 0
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatShortFr(d: Date): string {
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `${d.getDate()} ${mois[d.getMonth()]}`
}

export function CalendarWeekView({ posts, onSelectPost, refDate }: Props) {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(refDate ?? new Date()))

  const weekDays = useMemo(() => {
    const postsByDate = new Map<string, OverlayPost[]>()
    for (const p of posts) {
      if (!p.date_prevue) continue
      if (!postsByDate.has(p.date_prevue)) postsByDate.set(p.date_prevue, [])
      postsByDate.get(p.date_prevue)!.push(p)
    }
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i)
      const iso = isoDate(date)
      return {
        date,
        iso,
        dayLabel: DAYS_FR[i],
        dayNumber: date.getDate(),
        posts: postsByDate.get(iso) ?? [],
      }
    })
  }, [weekStart, posts])

  const weekEnd = addDays(weekStart, 6)

  return (
    <div className="cfs-cal-week">
      <header className="cfs-cal-week-header">
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="cfs-cal-week-nav"
          aria-label="Semaine précédente"
        >
          ‹ Semaine précédente
        </button>
        <h3 className="cfs-cal-week-label">
          Semaine du {formatShortFr(weekStart)} au {formatShortFr(weekEnd)} {weekEnd.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="cfs-cal-week-nav"
          aria-label="Semaine suivante"
        >
          Semaine suivante ›
        </button>
      </header>

      <div className="cfs-cal-week-grid">
        {weekDays.map((day) => (
          <div key={day.iso} className="cfs-cal-week-day">
            <div className="cfs-cal-week-day-header">
              <span className="cfs-cal-week-day-label">{day.dayLabel}</span>
              <span className="cfs-cal-week-day-number">{day.dayNumber}</span>
            </div>
            <div className="cfs-cal-week-day-posts">
              {day.posts.length === 0 ? (
                <span className="cfs-cal-week-empty" aria-hidden="true">—</span>
              ) : (
                day.posts.map((post) => {
                  const color = post.format ? FORMAT_COLOR[post.format] ?? '#8E8E93' : '#D1D1D6'
                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => onSelectPost(post)}
                      className="cfs-cal-week-post"
                      style={{ borderLeftColor: color }}
                      title={post.objectif_editorial ?? post.titre ?? ''}
                    >
                      <span className="cfs-cal-week-post-format" style={{ color }}>
                        {(post.format ?? '').toUpperCase()}
                      </span>
                      {post.structure_type ? (
                        <span className="cfs-cal-week-post-structure">{post.structure_type}</span>
                      ) : null}
                      {post.objectif_editorial ? (
                        <span className="cfs-cal-week-post-obj">{post.objectif_editorial}</span>
                      ) : null}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .cfs-cal-week {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cfs-cal-week-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cfs-cal-week-nav {
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
        .cfs-cal-week-nav:hover {
          background: rgba(255, 255, 255, 0.9);
        }
        .cfs-cal-week-label {
          margin: 0;
          font-family: var(--font-system);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-label);
          letter-spacing: -0.01em;
        }
        .cfs-cal-week-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          align-items: stretch;
        }
        .cfs-cal-week-day {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-height: 160px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 10px;
        }
        .cfs-cal-week-day-header {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 2px 6px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }
        .cfs-cal-week-day-label {
          font-family: var(--font-system);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-tertiary-label);
        }
        .cfs-cal-week-day-number {
          font-family: var(--font-system);
          font-size: 18px;
          font-weight: 700;
          color: var(--color-label);
          letter-spacing: -0.02em;
        }
        .cfs-cal-week-day-posts {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .cfs-cal-week-empty {
          font-size: 11px;
          color: var(--color-tertiary-label);
          text-align: center;
          padding-top: 12px;
        }
        .cfs-cal-week-post {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          border-left: 3px solid #8E8E93;
          background: rgba(255, 255, 255, 0.85);
          text-align: left;
          cursor: pointer;
          transition: transform 180ms ease-out, box-shadow 180ms ease-out;
          font-family: var(--font-system);
        }
        .cfs-cal-week-post:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }
        .cfs-cal-week-post-format {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .cfs-cal-week-post-structure {
          font-size: 10px;
          color: var(--color-tertiary-label);
        }
        .cfs-cal-week-post-obj {
          font-size: 11px;
          font-weight: 500;
          color: var(--color-label);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
        @media (max-width: 900px) {
          .cfs-cal-week-grid {
            grid-template-columns: 1fr;
          }
          .cfs-cal-week-day {
            min-height: auto;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-cal-week-post, .cfs-cal-week-nav { transition: none !important; }
        }
      `}</style>
    </div>
  )
}
