import Link from 'next/link'

type Props = {
  hasPostToday: boolean
  todayPostId: string | null
}

export function NextAction({ hasPostToday, todayPostId }: Props) {
  const message = hasPostToday
    ? 'Tu as une publication prévue aujourd\u2019hui.'
    : 'Rien de pr\u00e9vu aujourd\u2019hui \u2014 l\u2019occasion de préparer la semaine.'

  const ctaLabel = hasPostToday ? 'Voir la publication' : 'Planifier une publication'
  const ctaHref =
    hasPostToday && todayPostId
      ? `/calendrier/${todayPostId}`
      : '/calendrier'

  return (
    <section className="space-y-4">
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
      >
        {message}
      </p>

      <Link
        href={ctaHref}
        className="inline-flex items-center px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-accent-fg)',
          borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {ctaLabel}
      </Link>

    </section>
  )
}
