import Link from 'next/link'

type Props = {
  title?: string
  body?: string
}

export function EmptyStateBrand({
  title = 'Crée ta marque pour commencer',
  body = 'Toutes les fonctionnalités personnalisées seront disponibles dès que ton identité de marque est définie.',
}: Props) {
  return (
    <section className="glass-z2 px-8 py-10 space-y-4">
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h2>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        {body}
      </p>
      <Link
        href="/ma-marque/onboarding"
        className="inline-flex items-center px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-accent-fg)',
          borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Créer ma marque
      </Link>
    </section>
  )
}
