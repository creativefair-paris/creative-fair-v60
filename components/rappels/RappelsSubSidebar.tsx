// Sprint 43-stable — Sub-sidebar Rappels (filtres rapides)

import Link from 'next/link'
import { Inbox, Calendar, CheckCircle2, Archive } from 'lucide-react'
import type { ReminderSection } from '@/lib/rappels/types'

type Props = {
  activeFilter: 'all' | 'today' | 'week' | 'completed'
  countsBySection: Map<ReminderSection, number>
}

export function RappelsSubSidebar({ activeFilter, countsBySection }: Props) {
  const totalActive = Array.from(countsBySection.values()).reduce((a, b) => a + b, 0)
  const todayCount =
    (countsBySection.get('overdue') ?? 0) + (countsBySection.get('today') ?? 0)
  const weekCount = todayCount + (countsBySection.get('tomorrow') ?? 0) + (countsBySection.get('this-week') ?? 0)

  return (
    <aside className="sub-sidebar glass-z1" aria-label="Filtres Rappels">
      <div className="sub-sidebar__group">
        <h3 className="sub-sidebar__eyebrow">Filtres</h3>
        <Link
          href="/rappels"
          className={`sub-sidebar__item ${activeFilter === 'all' ? 'is-active' : ''}`}
        >
          <Inbox size={16} strokeWidth={1.6} />
          <span>Tous</span>
          <span className="lib-counter">{totalActive}</span>
        </Link>
        <Link
          href="/rappels?filter=today"
          className={`sub-sidebar__item ${activeFilter === 'today' ? 'is-active' : ''}`}
        >
          <Calendar size={16} strokeWidth={1.6} color="var(--blue-cf)" />
          <span>Aujourd&apos;hui</span>
          <span className="lib-counter">{todayCount}</span>
        </Link>
        <Link
          href="/rappels?filter=week"
          className={`sub-sidebar__item ${activeFilter === 'week' ? 'is-active' : ''}`}
        >
          <Calendar size={16} strokeWidth={1.6} color="var(--lilac)" />
          <span>Cette semaine</span>
          <span className="lib-counter">{weekCount}</span>
        </Link>
        <Link
          href="/rappels?filter=completed"
          className={`sub-sidebar__item ${activeFilter === 'completed' ? 'is-active' : ''}`}
        >
          <CheckCircle2 size={16} strokeWidth={1.6} color="var(--mint)" />
          <span>Complétés</span>
        </Link>
      </div>
    </aside>
  )
}
