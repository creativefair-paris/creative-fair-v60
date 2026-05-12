// Sprint 34 → 36.B.5 — Stub Mon compte avec PageHeader unifié.
import { PageHeader } from '@/components/layout/PageHeader'

export default function MonComptePage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <PageHeader title="Mon compte" />
      {/* Sprint 36.B.8 — cfs-page-container homogénéise l'alignement 1200px/24px. */}
      <section className="cfs-page-container">
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
