import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getBrandIdForCurrentUser } from '@/lib/supabase/brands'
import { CoachingCard, type DailyCoaching } from '@/components/aujourdhui/CoachingCard'
import { CoachingGenerator } from '@/components/aujourdhui/CoachingGenerator'
import { NextAction } from '@/components/aujourdhui/NextAction'
import { ContextualSuggestion } from '@/components/ui/ContextualSuggestion'

type PostRow = { id: string }
type BrandStatusRow = { brand_book_status: 'incomplete' | 'complete' }

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

  let coaching: DailyCoaching | null = null
  let todayPost: PostRow | null = null
  let brandStatus: BrandStatusRow | null = null
  let upcomingPostsCount = 0

  if (ids) {
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

    const { data: rawBrandStatus } = await supabase
      .from('brands')
      .select('brand_book_status')
      .eq('id', ids.brandId)
      .maybeSingle()
    brandStatus = rawBrandStatus as BrandStatusRow | null

    const sevenDays = new Date()
    sevenDays.setDate(sevenDays.getDate() + 7)
    const { count } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', ids.brandId)
      .gte('scheduled_for', new Date().toISOString())
      .lte('scheduled_for', sevenDays.toISOString())
    upcomingPostsCount = count ?? 0
  }

  const dateLabel = formatFrenchDate(new Date())

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-2xl mx-auto w-full space-y-12">
        <header>
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

        {brandStatus?.brand_book_status === 'incomplete' && (
          <ContextualSuggestion
            title="Ton brand book n'est pas complet"
            body="Tant qu'il est partiel, le coaching et les suggestions restent génériques. Cinq minutes pour le compléter."
            ctaLabel="Compléter mon brand book"
            ctaHref="/ma-marque/brand-book"
            storageKey="suggestion:brand-book-incomplete"
          />
        )}

        {brandStatus?.brand_book_status === 'complete' &&
          upcomingPostsCount === 0 && (
            <ContextualSuggestion
              title="Aucune publication prévue cette semaine"
              body="Tu peux générer des idées à partir de ton calendrier business depuis le calendrier."
              ctaLabel="Voir mes suggestions"
              ctaHref="/calendrier"
              storageKey="suggestion:no-upcoming-7d"
            />
          )}
      </div>
    </main>
  )
}
