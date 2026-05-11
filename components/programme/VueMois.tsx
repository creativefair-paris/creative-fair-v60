// Sprint 36.B.1 — Chantier D : Vue Mois (grille 5-6 lignes × 7 colonnes).
// Première case = lundi avant ou égal au 1er du mois.
// Cliquable : remonte le post sélectionné au parent.

'use client'

import { useMemo } from 'react'
import {
  addDays,
  dayLabelShort,
  dayNumber,
  endOfMonthGrid,
  isSameDay,
  monthLabel,
  startOfDay,
  startOfMonthGrid,
  startOfWeek,
} from '@/lib/calendar/dates'
import type { PilierNarratif, PostRow } from '@/types/programme'
import { colorForPilier } from '@/lib/programme/colors'
import { MiniPostCard } from './MiniPostCard'

type VueMoisProps = {
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

export function VueMois({
  posts,
  piliers,
  referenceDate,
  onSelectPost,
}: VueMoisProps) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const ref = useMemo(() => referenceDate ?? new Date(), [referenceDate])

  const cells = useMemo(() => {
    const start = startOfMonthGrid(ref)
    const end = endOfMonthGrid(ref)
    const result: Date[] = []
    let d = start
    while (d <= end) {
      result.push(d)
      d = addDays(d, 1)
    }
    return result
  }, [ref])

  const headerDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        addDays(startOfWeek(ref), i),
      ),
    [ref],
  )

  const refMonth = ref.getMonth()

  return (
    <div className="cfs-vue-mois">
      <h2 className="cfs-vue-mois__title">{monthLabel(ref)}</h2>

      <div className="cfs-vue-mois__weekdays" aria-hidden="true">
        {headerDays.map((d) => (
          <span key={d.toISOString()} className="cfs-vue-mois__weekday">
            {capitalize(dayLabelShort(d))}
          </span>
        ))}
      </div>

      <div className="cfs-vue-mois__grid" role="grid" aria-label="Vue calendaire du mois">
        {cells.map((d) => {
          const dayPosts = postsOnDay(posts, d)
          const isToday = isSameDay(d, today)
          const inMonth = d.getMonth() === refMonth
          const MAX_VISIBLE = 2
          const visible = dayPosts.slice(0, MAX_VISIBLE)
          const extras = dayPosts.length - MAX_VISIBLE

          return (
            <div
              key={d.toISOString()}
              className={`cfs-vue-mois__cell${isToday ? ' is-today' : ''}${
                inMonth ? '' : ' is-outside'
              }`}
              role="gridcell"
            >
              <span className="cfs-vue-mois__cell-num">{dayNumber(d)}</span>
              <div className="cfs-vue-mois__cell-posts">
                {visible.map((post) => (
                  <MiniPostCard
                    key={post.id}
                    post={post}
                    accentColor={colorForPilier(post.pilier_nom, piliers)}
                    variant="mois"
                    onClick={() => onSelectPost(post)}
                  />
                ))}
                {extras > 0 ? (
                  <span className="cfs-vue-mois__more">+{extras}</span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
