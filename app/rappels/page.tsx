// Sprint 43-stable — Page Rappels V2.0 top-level (création).
//
// Doctrine 00-CONCEPT.md §3 (Apple Reminders sobriété) + §5 promesse 3 +
// 01-ARCHITECTURE.md §1 (Travail top-level) + §3.2 (sub-sidebar 260px).
//
// HTML de référence : docs/design-mockups/08-rappels.html
// Migration SQL : supabase/migrations/027_reminders.sql

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RappelsSubSidebar } from '@/components/rappels/RappelsSubSidebar'
import { RappelsInputNouveau } from '@/components/rappels/RappelsInputNouveau'
import { RappelsListe } from '@/components/rappels/RappelsListe'
import { loadReminders } from '@/lib/rappels/queries'
import type { ReminderSection } from '@/lib/rappels/types'

export const dynamic = 'force-dynamic'

type SearchParams = {
  filter?: string
}

export default async function RappelsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Charge les rappels groupés par section (table peut ne pas être migrée localement)
  let bySection = new Map<ReminderSection, import('@/lib/rappels/types').Reminder[]>()
  try {
    const result = await loadReminders(supabase)
    bySection = result.bySection
  } catch {
    // Table reminders pas encore migrée — empty state
    bySection = new Map()
  }

  const countsBySection = new Map<ReminderSection, number>()
  for (const [section, list] of bySection.entries()) {
    countsBySection.set(section, list.length)
  }

  const filter = (params.filter ?? 'all') as 'all' | 'today' | 'week' | 'completed'

  return (
    <>
      <div className="wallpaper-neutral" aria-hidden="true" />

      <header className="page-header">
        <div className="page-shell">
          <div className="breadcrumb">
            <Link href="/aujourd-hui" className="breadcrumb-link">Aujourd&apos;hui</Link>
            <span className="breadcrumb-separator">›</span>
            <span>Rappels</span>
          </div>
          <h1 className="header-h1">Rappels</h1>
          <p className="header-subtitle">Tes tâches à faire, organisées par échéance.</p>
        </div>
      </header>

      <div className="page-shell page-with-sidebar">
        <RappelsSubSidebar activeFilter={filter} countsBySection={countsBySection} />

        <main className="rappels-content">
          <RappelsInputNouveau />
          <RappelsListe bySection={bySection} />
        </main>
      </div>
    </>
  )
}
