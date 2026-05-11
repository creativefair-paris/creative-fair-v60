// Sprint 36.B.1 — Chantier D : Vue Semaine (7 colonnes lundi → dimanche).
// Affiche le jour, le numéro, et les MiniPostCard du jour.
// Cliquable : remonte le post sélectionné au parent.

'use client'

import { useMemo } from 'react'
import {
  addDays,
  dayLabelShort,
  dayNumber,
  isSameDay,
  startOfDay,
  startOfWeek,
} from '@/lib/calendar/dates'
import type { PilierNarratif, PostRow } from '@/types/programme'
import { colorForPilier } from '@/lib/programme/colors'
import { MiniPostCard } from './MiniPostCard'

type VueSemaineProps = {
  posts: PostRow[]
  piliers: PilierNarratif[]
  referenceDate?: Date
  onSelectPost: (post: PostRow) => void
}

function postsOnDay(posts: PostRow[], day: Date): PostRow[] {
  return posts
    .filter((p) => {
      if (!p.date_prevue) return false
      const d = new Date(p.date_prevue)
      return isSameDay(d, day)
    })
    .sort((a, b) => a.heure_prevue.localeCompare(b.heure_prevue))
}

function capitalize(s: string): string {
  return s.length > 0 ? s[0]!.toUpperCase() + s.slice(1) : s
}

export function VueSemaine({
  posts,
  piliers,
  referenceDate,
  onSelectPost,
}: VueSemaineProps) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const days = useMemo(() => {
    const ref = referenceDate ?? new Date()
    const start = startOfWeek(ref)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [referenceDate])

  return (
    <div className="cfs-vue-semaine" role="grid" aria-label="Vue calendaire de la semaine">
      {days.map((d) => {
        const dayPosts = postsOnDay(posts, d)
        const isToday = isSameDay(d, today)

        return (
          <div
            key={d.toISOString()}
            className={`cfs-vue-semaine__col${isToday ? ' is-today' : ''}`}
            role="gridcell"
          >
            <div className="cfs-vue-semaine__header">
              <span className="cfs-vue-semaine__day-label">
                {capitalize(dayLabelShort(d))}
              </span>
              <span className="cfs-vue-semaine__day-number">{dayNumber(d)}</span>
            </div>
            <div className="cfs-vue-semaine__posts">
              {dayPosts.length === 0 ? (
                <span className="cfs-vue-semaine__empty" aria-hidden="true">
                  —
                </span>
              ) : (
                dayPosts.map((post) => (
                  <MiniPostCard
                    key={post.id}
                    post={post}
                    accentColor={colorForPilier(post.pilier_nom, piliers)}
                    variant="semaine"
                    onClick={() => onSelectPost(post)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
