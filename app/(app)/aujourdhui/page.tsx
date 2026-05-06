import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getBrandIdForCurrentUser } from '@/lib/supabase/brands'
import { CoachingCard, type DailyCoaching } from '@/components/aujourdhui/CoachingCard'
import { CoachingGenerator } from '@/components/aujourdhui/CoachingGenerator'
import { NextAction } from '@/components/aujourdhui/NextAction'

type TenantRow = { name: string }
type PostRow = { id: string }

function formatFrenchDate(d: Date): string {
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function todayIsoDate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default async function AujourdhuiPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const ids = await getBrandIdForCurrentUser(supabase)

  let tenant: TenantRow | null = null
  let coaching: DailyCoaching | null = null
  let todayPost: PostRow | null = null

  if (ids) {
    const { data: rawTenant } = await supabase
      .from('tenants')
      .select('name')
      .eq('id', ids.tenantId)
      .maybeSingle()
    tenant = rawTenant as TenantRow | null

    const today = todayIsoDate()

    const { data: rawCoaching } = await supabase
      .from('daily_coaching')
      .select('id, date, content, business_context, read_at')
      .eq('brand_id', ids.brandId)
      .eq('date', today)
      .maybeSingle()
    coaching = rawCoaching as DailyCoaching | null

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const { data: rawPost } = await supabase
      .from('posts')
      .select('id')
      .eq('brand_id', ids.brandId)
      .gte('scheduled_for', startOfDay.toISOString())
      .lte('scheduled_for', endOfDay.toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .maybeSingle()
    todayPost = rawPost as PostRow | null
  }

  const dateLabel = formatFrenchDate(new Date())
  const tenantLabel = tenant?.name ?? 'Creative Fair'

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-2xl mx-auto w-full space-y-12">
        <header className="space-y-1">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
          >
            {tenantLabel}
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            {dateLabel}
          </h1>
        </header>

        {coaching ? (
          <CoachingCard coaching={coaching} />
        ) : (
          <CoachingGenerator autoGenerate />
        )}

        <NextAction
          hasPostToday={Boolean(todayPost)}
          todayPostId={todayPost?.id ?? null}
        />
      </div>
    </main>
  )
}
