// Sprint 36.G — Bloc B "Cette semaine" (colonne droite, collapsible).
//
// État par défaut :
//   * Lundi avant midi : déplié
//   * Autres jours : replié
//
// Posts regroupés par jour ("Jeudi 14", "Vendredi 15", etc.).
// Mêmes états Things 3 que Bloc A, opacity 0.85 pour discrétion.

'use client'

import { useState } from 'react'
import { TaskRow } from './TaskRow'
import type { TaskPost } from '@/lib/types/post'

type Props = {
  posts: TaskPost[]
  // Décision de l'état initial calculée serveur-side (déterministe).
  initialOpen: boolean
  // CTA fin de semaine (vendredi >= 16h) géré server-side.
  showWeekendCta?: boolean
  // ISO du jour pour le calcul du label "Reporté de N jours".
  todayISO?: string
}

const NOMS_JOURS_FR: Record<number, string> = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
}

function jourLabel(dateISO: string): string {
  const d = new Date(`${dateISO}T12:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  return `${NOMS_JOURS_FR[d.getDay()]} ${d.getDate()}`
}

function groupByDay(posts: TaskPost[]): Array<{ key: string; label: string; items: TaskPost[] }> {
  const map = new Map<string, TaskPost[]>()
  for (const p of posts) {
    const key = p.date_prevue
    const arr = map.get(key) ?? []
    arr.push(p)
    map.set(key, arr)
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: jourLabel(key),
    items,
  }))
}

export function BlocCetteSemaine({ posts, initialOpen, showWeekendCta = false, todayISO }: Props) {
  const [open, setOpen] = useState(initialOpen)
  const groups = groupByDay(posts)
  const hasContent = groups.length > 0
  const today = todayISO ? new Date(todayISO) : undefined

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="cfs-bloc-cette-semaine-body"
        style={{
          all: 'unset',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 0',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 12,
            transition: 'transform 200ms ease-out',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            color: 'rgba(0,0,0,0.55)',
            fontSize: 11,
          }}
        >
          ▶
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: '#1C1C1E',
            margin: 0,
          }}
        >
          Cette semaine
        </h2>
        {!open && hasContent ? (
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              color: 'rgba(0,0,0,0.45)',
              marginLeft: 4,
            }}
          >
            · {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
        ) : null}
      </button>

      {open ? (
        <div id="cfs-bloc-cette-semaine-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {hasContent ? (
            groups.map((g) => (
              <div key={g.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'rgba(0,0,0,0.45)',
                    paddingLeft: 8,
                  }}
                >
                  {g.label}
                </span>
                {g.items.map((p) => (
                  <TaskRow key={p.id} post={p} variant="week" {...(today ? { today } : {})} />
                ))}
              </div>
            ))
          ) : (
            <p
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                color: 'rgba(0,0,0,0.55)',
                margin: '4px 0 0 8px',
              }}
            >
              Rien d&apos;autre cette semaine.
            </p>
          )}

          {showWeekendCta ? (
            <a
              href="/programme"
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                fontWeight: 500,
                color: '#007AFF',
                textDecoration: 'none',
                paddingLeft: 8,
                marginTop: 4,
              }}
            >
              Vois ta semaine dans Mon Programme →
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
