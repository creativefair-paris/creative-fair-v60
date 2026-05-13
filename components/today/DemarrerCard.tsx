// Sprint 37.A (F10) — Carte "Démarrer" premier usage /aujourd-hui.
//
// Décision Apple Cupertino salve 4 — Marcus.
// Affichée seulement pendant les 7 premiers jours du tenant. Au 8ème
// jour, la card disparaît automatiquement (pas de bouton "Ignorer"
// — anti-friction Apple).

import Link from 'next/link'

export type DemarrerStep = {
  label: string
  href: string
  description: string
}

type Props = {
  steps: ReadonlyArray<DemarrerStep>
}

export function DemarrerCard({ steps }: Props) {
  if (steps.length === 0) return null

  return (
    <section
      className="glass-regular"
      aria-label="Démarrer cette semaine"
      style={{
        borderRadius: 16,
        padding: '20px 22px',
        border: '1px solid rgba(0, 122, 255, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <header>
        <h2
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 17,
            fontWeight: 600,
            lineHeight: 1.4,
            color: '#000000',
            margin: 0,
          }}
        >
          Démarrer cette semaine
        </h2>
      </header>

      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {steps.map((step, i) => (
          <li key={i}>
            <Link
              href={step.href}
              className="cfs-demarrer-step"
              style={{
                display: 'flex',
                gap: 14,
                padding: '12px 14px',
                borderRadius: 12,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background-color 180ms ease-out',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  background: 'rgba(0, 122, 255, 0.12)',
                  color: '#007AFF',
                  fontFamily: 'var(--font-system)',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2,
                }}
              >
                {i + 1}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--color-label)',
                    lineHeight: 1.4,
                  }}
                >
                  {step.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    color: 'var(--color-secondary-label)',
                    lineHeight: 1.5,
                  }}
                >
                  {step.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <style>{`
        .cfs-demarrer-step:hover {
          background-color: rgba(0, 122, 255, 0.05);
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-demarrer-step { transition: none !important; }
        }
      `}</style>
    </section>
  )
}
