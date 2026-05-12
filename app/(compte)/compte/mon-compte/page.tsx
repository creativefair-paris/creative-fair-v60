// Sprint 34 → 36.B.5 — Stub Mon compte avec PageHeader unifié.
import { PageHeader } from '@/components/layout/PageHeader'

export default function MonComptePage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <PageHeader title="Mon compte" />
      <section
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 15,
            lineHeight: 1.6,
            color: 'rgba(0,0,0,0.55)',
            margin: 0,
            maxWidth: 480,
          }}
        >
          Page en construction.
        </p>
      </section>
    </main>
  )
}
