// Sprint 43-stable — Types Rappels

export type ReminderRow = {
  id: string
  tenant_id: string
  user_id: string
  title: string
  notes: string | null
  due_at: string | null
  completed_at: string | null
  source_post_id: string | null
  source_conversation_id: string | null
  created_at: string
  updated_at: string
}

export type ReminderSection = 'overdue' | 'today' | 'tomorrow' | 'this-week' | 'later' | 'no-date'

export type Reminder = {
  id: string
  title: string
  notes: string | null
  due_at: string | null
  completed_at: string | null
  section: ReminderSection
}
