import Link from 'next/link'

type Props = {
  hasPostToday: boolean
  todayPostId: string | null
}

export function NextAction({ hasPostToday, todayPostId }: Props) {
  const message = hasPostToday
    ? 'Tu as une publication prévue aujourd\u2019hui. Prête à la finaliser ?'
    : 'Tu n\u2019as rien planifié aujourd\u2019hui. Envie de préparer demain ?'

  const ctaLabel = hasPostToday ? 'Voir la publication' : 'Ouvrir mon calendrier'
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

      <p
        className="text-xs pt-2"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        En toute tranquillité — tu avances à ton rythme.
      </p>
    </section>
  )
}
