// Sprint 34 → 36.B.4 — Stub Mon compte avec breadcrumb.
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export default function MonComptePage() {
  return (
    <section style={{ padding: '24px var(--space-5) var(--space-12)' }}>
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
        <Breadcrumb items={["Aujourd'hui", 'Mon compte']} />
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
          Mon compte
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 15,
            lineHeight: 1.6,
            color: 'rgba(0,0,0,0.55)',
            margin: '16px 0 0 0',
            maxWidth: 480,
          }}
        >
          Page en construction.
        </p>
      </div>
    </section>
  )
}
