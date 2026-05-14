// Sprint 37.E (F52) — Section "Chiffres Creative Fair" sur /programme/retombees.
//
// Vocabulaire interne : retombées / chiffres / indicateurs éditoriaux.
// Pas de stats / analytics / KPI / performance.

type AppMetrics = {
  plansCount: number
  postsCount: number
  conversationsCount: number
  libraryDocsCount: number
}

type Props = {
  metrics: AppMetrics
}

export function AppMetricsSection({ metrics }: Props) {
  const cards: ReadonlyArray<{ label: string; value: number; period?: string }> = [
    { label: 'Plans créés', value: metrics.plansCount, period: 'ce mois' },
    { label: 'Posts générés', value: metrics.postsCount, period: 'ce mois' },
    { label: 'Conversations conseiller', value: metrics.conversationsCount, period: 'ce mois' },
    { label: 'Documents bibliothèque', value: metrics.libraryDocsCount },
  ]
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-tertiary-label)',
          margin: 0,
        }}
      >
        Chiffres Creative Fair
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 10,
        }}
      >
        {cards.map((c) => (
          <article
            key={c.label}
            style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--color-label)',
                letterSpacing: '-0.02em',
              }}
            >
              {c.value.toLocaleString('fr-FR')}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-secondary-label)' }}>
              {c.label}
            </span>
            {c.period ? (
              <span style={{ fontSize: 11, color: 'var(--color-tertiary-label)' }}>
                {c.period}
              </span>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
