// Sprint 43-stable — Liste sectionnée des rappels (style Apple Reminders).

import { RappelsItem } from './RappelsItem'
import { SECTION_LABELS, SECTION_ORDER } from '@/lib/rappels/queries'
import type { Reminder, ReminderSection } from '@/lib/rappels/types'

type Props = {
  bySection: Map<ReminderSection, Reminder[]>
}

export function RappelsListe({ bySection }: Props) {
  const total = Array.from(bySection.values()).reduce((acc, list) => acc + list.length, 0)

  if (total === 0) {
    return (
      <div className="empty-state glass-z1">
        <h2 className="empty-state__title">Aucun rappel</h2>
        <p>
          Hélène te préviendra quand quelque chose mérite ton attention. Tu peux aussi en
          ajouter manuellement depuis l&apos;input ci-dessus.
        </p>
      </div>
    )
  }

  return (
    <div className="rappels-sections">
      {SECTION_ORDER.map((section) => {
        const list = bySection.get(section)
        if (!list || list.length === 0) return null
        return (
          <section key={section} className="rappels-section">
            <h2
              className={`rappels-section-title ${section === 'overdue' ? 'is-overdue' : ''}`}
            >
              {SECTION_LABELS[section]}
              <span className="rappels-section-count">{list.length}</span>
            </h2>
            <ul className="rappels-list">
              {list.map((r) => (
                <RappelsItem key={r.id} reminder={r} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
