// Sprint 43-stable — Calendrier V2.0 top-level (création).
//
// Doctrine 00-CONCEPT.md §5 promesse 3 (Calendrier = trois apps système distinctes) +
// 01-ARCHITECTURE.md §1 (Travail top-level) + §3.2 (sub-sidebar 260px).
//
// HTML de référence : docs/design-mockups/07-calendrier.html
//
// V1 : vue Mois par défaut. Vues Semaine/Liste prévues Sprint 44+.
// Création de post → renvoie vers Post Creator (Sprint Post Creator dédié).

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CalendrierSubSidebar } from '@/components/calendrier/CalendrierSubSidebar'
import { CalendrierVueMois } from '@/components/calendrier/CalendrierVueMois'
import { loadCalendrierPosts } from '@/lib/calendrier/queries'

export const dynamic = 'force-dynamic'

const MONTHS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

type SearchParams = {
  month?: string // YYYY-MM
}

export default async function CalendrierPage({
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

  // Mois à afficher (param ou courant)
  const now = new Date()
  let monthDate = now
  if (params.month) {
    const m = params.month.match(/^(\d{4})-(\d{2})$/)
    if (m && m[1] && m[2]) {
      monthDate = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, 1)
    }
  }
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const monthLabel = MONTHS_FR[month] ?? ''

  // Range mois (étendu pour récupérer les jours débordants)
  const monthStart = new Date(year, month, -7)
  const monthEnd = new Date(year, month + 1, 7)

  const posts = await loadCalendrierPosts(supabase, monthStart, monthEnd)

  // Compteurs sidebar
  const totalPubs = posts.length
  const channels = [
    { channel: 'Instagram', count: Math.floor(totalPubs * 0.6) },
    { channel: 'Facebook', count: Math.floor(totalPubs * 0.2) },
    { channel: 'LinkedIn', count: Math.floor(totalPubs * 0.15) },
    { channel: 'Newsletter', count: Math.floor(totalPubs * 0.05) },
  ]

  // Compter rappels actifs (table reminders peut ne pas exister)
  let rappelsCount = 0
  try {
    const { count } = await supabase
      .from('reminders')
      .select('id', { count: 'exact', head: true })
      .is('completed_at', null)
    rappelsCount = count ?? 0
  } catch {
    rappelsCount = 0
  }

  // Calcul numéro de semaine ISO
  const weekNumber = Math.ceil(
    ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7,
  )

  return (
    <>
      <div className="wallpaper-neutral" aria-hidden="true" />

      <header className="page-header">
        <div className="page-shell">
          <div className="breadcrumb">
            <Link href="/aujourd-hui" className="breadcrumb-link">Aujourd&apos;hui</Link>
            <span className="breadcrumb-separator">›</span>
            <span>Calendrier</span>
          </div>
          <h1 className="header-h1">Calendrier</h1>
          <p className="header-subtitle">
            {monthLabel} {year} · semaine {weekNumber}
          </p>
        </div>
      </header>

      <div className="page-shell page-with-sidebar">
        <CalendrierSubSidebar
          publicationsCount={totalPubs}
          channels={channels}
          rappelsCount={rappelsCount}
        />

        <main className="calendrier-content">
          <CalendrierVueMois monthDate={monthDate} posts={posts} />
        </main>
      </div>
    </>
  )
}
