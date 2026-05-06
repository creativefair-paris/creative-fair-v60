'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  CalendarPostCard,
  type CalendarPost,
} from '@/components/calendar/CalendarPostCard'
import { NewPostModal } from '@/components/calendar/NewPostModal'
import {
  addDays,
  dayLabelShort,
  dayNumber,
  endOfDay,
  endOfMonthGrid,
  isSameDay,
  isWeekend,
  isoDate,
  monthLabel,
  startOfDay,
  startOfMonth,
  startOfMonthGrid,
  startOfWeek,
} from '@/lib/calendar/dates'

export type BusinessEventOnDay = {
  date: string
  name: string
}

type View = 'week' | 'month'

type Props = {
  posts: CalendarPost[]
  events: BusinessEventOnDay[]
  initialDate?: string
}

function postsOn(posts: CalendarPost[], day: Date): CalendarPost[] {
  return posts.filter((p) => {
    if (!p.scheduled_for) return false
    const d = new Date(p.scheduled_for)
    return isSameDay(d, day)
  })
}

function eventsOn(events: BusinessEventOnDay[], day: Date): BusinessEventOnDay[] {
  const iso = isoDate(day)
  return events.filter((e) => e.date === iso)
}

export function CalendarView({ posts, events, initialDate }: Props) {
  const [view, setView] = useState<View>('week')
  const [cursor, setCursor] = useState<Date>(
    initialDate ? new Date(initialDate) : new Date(),
  )
  const [modalIso, setModalIso] = useState<string | null>(null)
  const today = useMemo(() => startOfDay(new Date()), [])

  const days = useMemo(() => {
    if (view === 'week') {
      const start = startOfWeek(cursor)
      return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    }
    const start = startOfMonthGrid(cursor)
    const end = endOfMonthGrid(cursor)
    const result: Date[] = []
    let d = start
    while (d <= end) {
      result.push(d)
      d = addDays(d, 1)
    }
    return result
  }, [cursor, view])

  const headerLabel = useMemo(() => {
    if (view === 'month') return monthLabel(cursor)
    const start = startOfWeek(cursor)
    const end = endOfDay(addDays(start, 6))
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(d)
    return `${fmt(start)} → ${fmt(end)}`
  }, [cursor, view])

  function shift(direction: -1 | 1) {
    if (view === 'week') {
      setCursor((c) => addDays(c, 7 * direction))
    } else {
      setCursor((c) => {
        const next = new Date(c)
        next.setMonth(next.getMonth() + direction)
        return next
      })
    }
  }

  function goToday() {
    setCursor(new Date())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2
          className="text-xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          {headerLabel}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shift(-1)}
            className="w-8 h-8 inline-flex items-center justify-center transition-opacity hover:opacity-80"
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              color: 'var(--color-text)',
            }}
            aria-label="Période précédente"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="px-3 h-8 text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Aujourd&rsquo;hui
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            className="w-8 h-8 inline-flex items-center justify-center transition-opacity hover:opacity-80"
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              color: 'var(--color-text)',
            }}
            aria-label="Période suivante"
          >
            <ChevronRight size={16} />
          </button>

          <div
            className="ml-2 inline-flex p-0.5"
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
            }}
          >
            <button
              type="button"
              onClick={() => setView('week')}
              className="px-3 h-7 text-xs font-medium transition-opacity"
              style={{
                backgroundColor:
                  view === 'week' ? 'var(--color-accent)' : 'transparent',
                color:
                  view === 'week'
                    ? 'var(--color-accent-fg)'
                    : 'var(--color-text-muted)',
                borderRadius: 'var(--radius-sm, 6px)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Semaine
            </button>
            <button
              type="button"
              onClick={() => setView('month')}
              className="px-3 h-7 text-xs font-medium transition-opacity"
              style={{
                backgroundColor:
                  view === 'month' ? 'var(--color-accent)' : 'transparent',
                color:
                  view === 'month'
                    ? 'var(--color-accent-fg)'
                    : 'var(--color-text-muted)',
                borderRadius: 'var(--radius-sm, 6px)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Mois
            </button>
          </div>
        </div>
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gridAutoRows: view === 'week' ? 'minmax(280px, auto)' : 'minmax(110px, auto)',
        }}
      >
        {view === 'week' &&
          days.map((d) => (
            <div
              key={`hdr-${d.toISOString()}`}
              className="text-xs uppercase tracking-wide pb-1"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
                gridRow: 'auto',
              }}
            >
              {dayLabelShort(d)} {dayNumber(d)}
            </div>
          ))}

        {view === 'month' &&
          Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i)).map(
            (d) => (
              <div
                key={`hdrm-${i(d)}`}
                className="text-xs uppercase tracking-wide pb-1"
                style={{
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {dayLabelShort(d)}
              </div>
            ),
          )}

        {days.map((d) => {
          const dayPosts = postsOn(posts, d)
          const dayEvents = eventsOn(events, d)
          const isToday = isSameDay(d, today)
          const inCurrentMonth =
            view === 'week' || d.getMonth() === cursor.getMonth()
          const weekend = isWeekend(d)

          return (
            <div
              key={d.toISOString()}
              className="flex flex-col gap-1.5 p-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: isToday
                  ? '1px solid var(--color-accent)'
                  : '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                opacity: inCurrentMonth ? (weekend ? 0.85 : 1) : 0.45,
              }}
            >
              {view === 'month' && (
                <p
                  className="text-xs font-medium"
                  style={{
                    color: isToday ? 'var(--color-accent)' : 'var(--color-text)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {dayNumber(d)}
                </p>
              )}

              {dayEvents.map((e, idx) => (
                <span
                  key={`${e.date}-${idx}`}
                  className="inline-block px-1.5 py-0.5 text-[10px] font-medium truncate"
                  style={{
                    backgroundColor: 'rgba(168, 50, 78, 0.12)',
                    color: 'var(--color-accent)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontFamily: 'var(--font-body)',
                  }}
                  title={e.name}
                >
                  {e.name.slice(0, 20)}
                </span>
              ))}

              {dayPosts.map((p) => (
                <CalendarPostCard key={p.id} post={p} />
              ))}

              <button
                type="button"
                onClick={() => setModalIso(isoDate(d))}
                className="mt-auto inline-flex items-center justify-center gap-1 text-[11px] py-1 transition-opacity hover:opacity-80"
                style={{
                  color: 'var(--color-text-muted)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontFamily: 'var(--font-body)',
                }}
                aria-label={`Créer une publication le ${isoDate(d)}`}
              >
                <Plus size={10} />
                Publication
              </button>
            </div>
          )
        })}
      </div>

      <NewPostModal
        open={modalIso !== null}
        onClose={() => setModalIso(null)}
        scheduledIso={modalIso}
      />
    </div>
  )
}

function i(d: Date): string {
  return d.toISOString()
}
