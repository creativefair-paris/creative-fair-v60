// Sprint 37.I (F74) — Vraie vue Calendrier hebdomadaire grid 7 colonnes.
// Sprint 37.J (F84) — Refonte style Apple Calendar :
// - Pas d'heures sur les cartes posts (juste label format + objectif)
// - Cellules transparentes (les halos signature passent à travers)
// - Lignes fines rgba(0,0,0,0.04) entre colonnes au lieu de bordures opaques
// - Header jour : LUN (11px uppercase letter-spacing 0.6) + numéro 17px bold
// - Boutons nav circulaires SF Apple
//
// Lundi → Dimanche. Navigation flèches '‹' / '›'.

'use client'

import { useMemo, useState } from 'react'
import { FORMAT_COLORS, FORMAT_LABELS, type FormatSlug } from '@/lib/i18n/formats'
import type { OverlayPost } from './PostPreviewOverlay'

const DAYS_FR = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'] as const

type Props = {
  posts: ReadonlyArray<OverlayPost>
  onSelectPost: (post: OverlayPost) => void
  refDate?: Date
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day + 6) % 7
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
function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1) + '…'
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
    <div className="cal-w-apple">
      <header className="cal-w-apple__header">
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="cal-w-apple__nav-btn"
          aria-label="Semaine précédente"
        >
          ‹
        </button>
        <h3 className="cal-w-apple__label">
          Semaine du {formatShortFr(weekStart)} au {formatShortFr(weekEnd)} {weekEnd.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="cal-w-apple__nav-btn"
          aria-label="Semaine suivante"
        >
          ›
        </button>
      </header>

      <div className="cal-w-apple__grid">
        {weekDays.map((day, idx) => (
          <div
            key={day.iso}
            className={`cal-w-apple__day${idx > 0 ? ' has-divider' : ''}`}
          >
            <div className="cal-w-apple__day-header">
              <span className="cal-w-apple__day-label">{day.dayLabel}</span>
              <span className="cal-w-apple__day-number">{day.dayNumber}</span>
            </div>
            <div className="cal-w-apple__day-posts">
              {day.posts.length === 0 ? (
                <span className="cal-w-apple__empty" aria-hidden="true">—</span>
              ) : (
                day.posts.map((post) => {
                  const fmt = post.format as FormatSlug | null
                  const color = fmt && FORMAT_COLORS[fmt] ? FORMAT_COLORS[fmt] : '#8E8E93'
                  const formatLabel = fmt && FORMAT_LABELS[fmt] ? FORMAT_LABELS[fmt].fr : (post.format ?? '').toUpperCase()
                  const title = post.objectif_editorial ?? post.titre ?? 'Post sans titre'
                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => onSelectPost(post)}
                      className="cal-w-apple__post"
                      style={{ '--format-color': color } as React.CSSProperties}
                      title={title}
                    >
                      <span className="cal-w-apple__post-format">{formatLabel}</span>
                      <span className="cal-w-apple__post-title">{truncate(title, 60)}</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .cal-w-apple {
          width: 100%;
        }
        .cal-w-apple__header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .cal-w-apple__nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.06);
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui;
          font-size: 16px;
          font-weight: 600;
          line-height: 1;
          color: rgba(0, 0, 0, 0.55);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 180ms cubic-bezier(0.32, 0.72, 0, 1),
                      transform 180ms;
        }
        .cal-w-apple__nav-btn:hover {
          background: rgba(255, 255, 255, 0.85);
          transform: scale(1.05);
        }
        .cal-w-apple__label {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.3;
          color: rgba(0, 0, 0, 0.7);
          letter-spacing: -0.2px;
          margin: 0;
        }
        /* Grille Apple Calendar : cellules transparentes pour laisser passer les halos */
        .cal-w-apple__grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: transparent;
        }
        .cal-w-apple__day {
          padding: 14px 8px;
          background: transparent;
          min-height: 220px;
          position: relative;
        }
        /* Lignes fines entre colonnes (Apple Calendar style) */
        .cal-w-apple__day.has-divider::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 1px;
          background: rgba(0, 0, 0, 0.05);
        }
        .cal-w-apple__day-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 12px;
        }
        .cal-w-apple__day-label {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui;
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: rgba(0, 0, 0, 0.4);
        }
        .cal-w-apple__day-number {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui;
          font-size: 17px;
          font-weight: 600;
          line-height: 1;
          color: rgba(0, 0, 0, 0.85);
          letter-spacing: -0.3px;
        }
        .cal-w-apple__day-posts {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cal-w-apple__empty {
          text-align: center;
          font-family: -apple-system, system-ui;
          font-size: 14px;
          line-height: 1;
          color: rgba(0, 0, 0, 0.2);
          padding-top: 24px;
        }
        /* Carte post Apple Calendar : pas d'heure, juste format + titre court + border-left */
        .cal-w-apple__post {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 8px 10px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: none;
          border-left: 3px solid var(--format-color, #8E8E93);
          border-radius: 7px;
          cursor: pointer;
          width: 100%;
          transition: transform 180ms cubic-bezier(0.32, 0.72, 0, 1),
                      background 180ms,
                      box-shadow 180ms;
        }
        .cal-w-apple__post:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
        }
        .cal-w-apple__post-format {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui;
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: var(--format-color, #8E8E93);
          margin-bottom: 3px;
        }
        .cal-w-apple__post-title {
          font-family: -apple-system, system-ui;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.35;
          color: rgba(0, 0, 0, 0.85);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .cal-w-apple__grid {
            grid-template-columns: 1fr;
          }
          .cal-w-apple__day {
            min-height: auto;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          }
          .cal-w-apple__day.has-divider::before {
            display: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cal-w-apple__post, .cal-w-apple__nav-btn { transition: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  )
}
