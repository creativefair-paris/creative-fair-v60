// Sprint 35 → 36.B.4 — Stub Conseiller (Pilier 6 strict : titre seul).
// L'intégration v1 ou refonte Apple-strict est en attente Sprint 36.
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export default function ConseillerPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '24px var(--space-5) var(--space-12)' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 1080,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Breadcrumb items={["Aujourd'hui", 'Conseiller']} />
        <h1
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#1C1C1E',
            margin: 0,
          }}
        >
          Conseiller
        </h1>
      </div>
    </main>
  )
}
