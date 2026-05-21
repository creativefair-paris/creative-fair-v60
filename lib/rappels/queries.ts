// Sprint 43-stable — Queries Rappels
// Doctrine 04-MULTI_TENANT.md : RLS auto via createClient(), pas createAdmin.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Reminder, ReminderRow, ReminderSection } from './types'

function getSection(dueAt: string | null, completed: boolean): ReminderSection {
  if (completed) return 'no-date' // les complétés ne s'affichent pas par défaut
  if (!dueAt) return 'no-date'
  const due = new Date(dueAt)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dueDayStart = new Date(due.getFullYear(), due.getMonth(), due.getDate())

  if (dueDayStart.getTime() < today.getTime()) return 'overdue'
  if (dueDayStart.getTime() === today.getTime()) return 'today'
  if (dueDayStart.getTime() === tomorrow.getTime()) return 'tomorrow'

  const j7 = new Date(today)
  j7.setDate(j7.getDate() + 7)
  if (dueDayStart.getTime() <= j7.getTime()) return 'this-week'
  return 'later'
}

export async function loadReminders(supabase: SupabaseClient): Promise<{
  bySection: Map<ReminderSection, Reminder[]>
  total: number
}> {
  const { data } = await supabase
    .from('reminders')
    .select('id, title, notes, due_at, completed_at')
    .is('completed_at', null)
    .order('due_at', { ascending: true, nullsFirst: false })
    .limit(200)

  const rows = (data as Pick<
    ReminderRow,
    'id' | 'title' | 'notes' | 'due_at' | 'completed_at'
  >[] | null) ?? []

  const bySection = new Map<ReminderSection, Reminder[]>()
  for (const row of rows) {
    const section = getSection(row.due_at, row.completed_at !== null)
    const reminder: Reminder = {
      id: row.id,
      title: row.title,
      notes: row.notes,
      due_at: row.due_at,
      completed_at: row.completed_at,
      section,
    }
    const list = bySection.get(section) ?? []
    list.push(reminder)
    bySection.set(section, list)
  }

  return { bySection, total: rows.length }
}

export const SECTION_LABELS: Record<ReminderSection, string> = {
  overdue: 'En retard',
  today: "Aujourd'hui",
  tomorrow: 'Demain',
  'this-week': 'Cette semaine',
  later: 'Plus tard',
  'no-date': 'Sans date',
}

export const SECTION_ORDER: ReadonlyArray<ReminderSection> = [
  'overdue',
  'today',
  'tomorrow',
  'this-week',
  'later',
  'no-date',
]
