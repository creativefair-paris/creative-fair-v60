// Sprint 43-stable — Widget Calendrier sur Aujourd'hui
// Doctrine 01-ARCHITECTURE.md §3.1 (densité α stricte minimale)

import Link from 'next/link'

type Event = {
  id: string
  time: string
  title: string
  pillarColor?: string
}

type Props = {
  dayNumber: number
  weekday: string
  month: string
  events: ReadonlyArray<Event>
}

const WEEKDAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const

export function AujourdhuiWidgetCalendrier({ dayNumber, weekday, month, events }: Props) {
  // Bande de 7 jours autour du jour courant
  const startDay = dayNumber - 4
  return (
    <Link href="/calendrier" className="widget-link" aria-label="Ouvrir Calendrier">
      <article className="widget glass-z2" aria-label="Calendrier">
        <header className="widget-cal-header">
          <span className="widget-cal-day-number">{dayNumber}</span>
          <div>
            <div className="widget-cal-weekday">{weekday}</div>
            <div className="widget-cal-month">{month}</div>
          </div>
        </header>

        <div className="widget-cal-strip">
          {WEEKDAY_LETTERS.map((letter, i) => {
            const num = startDay + i
            const isActive = num === dayNumber
            return (
              <div key={i} className={`widget-cal-strip-day ${isActive ? 'is-active' : ''}`}>
                <span className="widget-cal-strip-letter">{letter}</span>
                <span className="widget-cal-strip-num">{num > 0 ? num : ''}</span>
              </div>
            )
          })}
        </div>

        <ul className="widget-cal-events">
          {events.length === 0 ? (
            <li className="widget-cal-empty">Rien de prévu aujourd&apos;hui.</li>
          ) : (
            events.slice(0, 2).map((event) => (
              <li key={event.id} className="widget-cal-event">
                <span
                  className="widget-cal-event-dot"
                  style={{ background: event.pillarColor ?? 'var(--blue-cf)' }}
                  aria-hidden="true"
                />
                <div>
                  <div className="widget-cal-event-time">{event.time}</div>
                  <div className="widget-cal-event-title">{event.title}</div>
                </div>
              </li>
            ))
          )}
        </ul>
      </article>
    </Link>
  )
}
