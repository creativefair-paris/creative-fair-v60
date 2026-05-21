// Sprint 43-stable — Vue Mois Calendrier
// Grille 7 colonnes × 5-6 lignes, cellules avec mini-cards posts

type CalendarPost = {
  id: string
  date: string // YYYY-MM-DD
  title: string
  pillarColor: string
  hour?: string | null
}

type Props = {
  monthDate: Date
  posts: ReadonlyArray<CalendarPost>
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function buildMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Lundi = 0 dans notre grille
  const firstWeekday = (firstDay.getDay() + 6) % 7
  const daysInMonth = lastDay.getDate()

  const cells: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean }> = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Cellules avant le 1er
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    cells.push({ date: d, isCurrentMonth: false, isToday: false })
  }
  // Jours du mois
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
    })
  }
  // Cellules après le dernier jour (jusqu'à 35 ou 42 cases)
  const totalCells = cells.length <= 35 ? 35 : 42
  let nextDay = 1
  while (cells.length < totalCells) {
    cells.push({
      date: new Date(year, month + 1, nextDay),
      isCurrentMonth: false,
      isToday: false,
    })
    nextDay++
  }
  return cells
}

export function CalendrierVueMois({ monthDate, posts }: Props) {
  const cells = buildMonthGrid(monthDate)
  const postsByDate = new Map<string, CalendarPost[]>()
  for (const p of posts) {
    const list = postsByDate.get(p.date) ?? []
    list.push(p)
    postsByDate.set(p.date, list)
  }

  return (
    <div className="cal-vue-mois glass-z2">
      <div className="cal-vue-mois__header">
        {WEEKDAYS.map((d) => (
          <div key={d} className="cal-weekday-h">
            {d}
          </div>
        ))}
      </div>
      <div className="cal-vue-mois__grid">
        {cells.map((cell, i) => {
          const iso = cell.date.toISOString().slice(0, 10)
          const dayPosts = postsByDate.get(iso) ?? []
          return (
            <div
              key={i}
              className={`cal-day-cell ${cell.isCurrentMonth ? '' : 'is-other-month'} ${cell.isToday ? 'is-today' : ''}`}
            >
              <div className="cal-day-number">{cell.date.getDate()}</div>
              <div className="cal-day-posts">
                {dayPosts.slice(0, 2).map((p) => (
                  <div key={p.id} className="cal-day-post-card">
                    <span
                      className="cal-day-post-dot"
                      style={{ background: p.pillarColor }}
                      aria-hidden="true"
                    />
                    <span className="cal-day-post-title">{p.title}</span>
                  </div>
                ))}
                {dayPosts.length > 2 ? (
                  <div className="cal-day-more">+{dayPosts.length - 2}</div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export type { CalendarPost }
