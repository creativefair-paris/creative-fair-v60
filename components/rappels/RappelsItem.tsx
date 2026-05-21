// Sprint 43-stable — Ligne Rappel individuelle (style Apple Reminders)
// Doctrine 00-CONCEPT.md §3 "Apple Reminders pour la sobriété des tâches".

import { completeRappel } from '@/app/_actions/rappels/complete-rappel'
import { deleteRappel } from '@/app/_actions/rappels/delete-rappel'
import type { Reminder } from '@/lib/rappels/types'

type Props = {
  reminder: Reminder
}

function formatDueAt(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function RappelsItem({ reminder }: Props) {
  const isCompleted = reminder.completed_at !== null
  const dueLabel = formatDueAt(reminder.due_at)
  const isOverdue = reminder.section === 'overdue'

  return (
    <li className={`rappels-item ${isCompleted ? 'is-completed' : ''} ${isOverdue ? 'is-overdue' : ''}`}>
      <form action={completeRappel}>
        <input type="hidden" name="id" value={reminder.id} />
        <input type="hidden" name="completed" value={isCompleted ? '0' : '1'} />
        <button
          type="submit"
          className={`rappels-check ${isCompleted ? 'is-checked' : ''}`}
          aria-label={isCompleted ? 'Marquer non fait' : 'Marquer fait'}
        />
      </form>

      <div className="rappels-body">
        <div className="rappels-title">{reminder.title}</div>
        {dueLabel ? (
          <div className="rappels-due">
            {isOverdue ? '⚠ ' : ''}
            {dueLabel}
          </div>
        ) : null}
        {reminder.notes ? <div className="rappels-notes">{reminder.notes}</div> : null}
      </div>

      <form action={deleteRappel} className="rappels-actions">
        <input type="hidden" name="id" value={reminder.id} />
        <button type="submit" className="rappels-delete" aria-label="Supprimer">
          ×
        </button>
      </form>
    </li>
  )
}
