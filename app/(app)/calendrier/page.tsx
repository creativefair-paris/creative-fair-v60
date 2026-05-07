import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getBrandIdForCurrentUser, getBrandByTenantId } from '@/lib/supabase/brands'
import { CalendarView, type BusinessEventOnDay } from '@/components/calendar/CalendarView'
import { SuggestionsPanel } from '@/components/calendar/SuggestionsPanel'
import type { CalendarPost, PostStatus } from '@/components/calendar/CalendarPostCard'
import type { BusinessCalendar } from '@/types/business-calendar'

type PostRow = {
  id: string
  scheduled_for: string | null
  status: PostStatus
  type: string | null
  content: { hook?: string } | null
}

function eventsFromCalendar(
  calendar: BusinessCalendar | null,
  windowStart: Date,
  windowEnd: Date,
): BusinessEventOnDay[] {
  if (!calendar) return []
  const events: BusinessEventOnDay[] = []

  const inWindow = (iso: string) => {
    const d = new Date(iso)
    return d >= windowStart && d <= windowEnd
  }

  for (const l of calendar.upcomingLaunches ?? []) {
    if (l.date && inWindow(l.date)) events.push({ date: l.date, name: l.name })
  }
  for (const e of calendar.industryEvents ?? []) {
    if (e.date && inWindow(e.date)) events.push({ date: e.date, name: e.name })
  }
  for (const r of calendar.recurringEvents ?? []) {
    if (r.nextDate && inWindow(r.nextDate)) {
      events.push({ date: r.nextDate, name: r.name })
    }
  }

  return events
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const ctx = await getBrandIdForCurrentUser(supabase)
  if (!ctx) {
    return (
      <main
        className="min-h-screen px-6 py-12"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="max-w-4xl mx-auto w-full">
          <p
            className="text-sm"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Crée d&rsquo;abord ta marque pour accéder au calendrier.
          </p>
          <Link
            href="/ma-marque"
            className="inline-flex items-center mt-4 px-4 py-2 text-sm font-medium"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-fg)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Aller à ma marque
          </Link>
        </div>
      </main>
    )
  }

  const now = new Date()
  const windowStart = new Date(now)
  windowStart.setDate(windowStart.getDate() - 7)
  windowStart.setHours(0, 0, 0, 0)

  const windowEnd = new Date(now)
  windowEnd.setDate(windowEnd.getDate() + 60)
  windowEnd.setHours(23, 59, 59, 999)

  const { data: rawPosts } = await supabase
    .from('posts')
    .select('id, scheduled_for, status, type, content')
    .eq('brand_id', ctx.brandId)
    .gte('scheduled_for', windowStart.toISOString())
    .lte('scheduled_for', windowEnd.toISOString())
    .order('scheduled_for', { ascending: true })

  const posts = ((rawPosts as PostRow[] | null) ?? []) as CalendarPost[]

  const brand = await getBrandByTenantId(supabase, ctx.tenantId)
  const businessCalendar = (brand?.business_calendar ?? null) as BusinessCalendar | null
  const events = eventsFromCalendar(businessCalendar, windowStart, windowEnd)

  const noUpcomingPost = posts.every(
    (p) => !p.scheduled_for || new Date(p.scheduled_for) < now,
  )

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <header className="space-y-1">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
          >
            Calendrier
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            Tes publications à venir
          </h1>
        </header>

        <CalendarView posts={posts} events={events} />

        <SuggestionsPanel />

        {noUpcomingPost && (
          <section
            className="glass-z1 px-5 py-4 space-y-3"
          >
            <p
              className="text-sm leading-relaxed"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Aucune publication planifiée. Commence par renseigner ton calendrier
              business pour que l&rsquo;IA suggère des angles.
            </p>
            <Link
              href="/ma-marque/business-calendar"
              className="inline-flex items-center text-sm font-medium underline"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
            >
              Voir mon calendrier business
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}
