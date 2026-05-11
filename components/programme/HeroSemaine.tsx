// Sprint 36.A — Hero "Cette semaine" (Chantier D.5)
// Server Component. Glass-regular, arc narratif + 3 chips piliers.

import type { PilierNarratif } from '@/types/programme'

type HeroSemaineProps = {
  arcNarratif: string
  piliers: PilierNarratif[]
}

export function HeroSemaine({ arcNarratif, piliers }: HeroSemaineProps) {
  return (
    <section
      className="glass-regular"
      style={{
        padding: 'var(--space-6) var(--space-5)',
        borderRadius: 'var(--radius-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-5)',
      }}
    >
      <span
        className="text-caption-1"
        style={{
          color: 'var(--color-secondary-label)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Cette semaine
      </span>

      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 20,
          lineHeight: 1.35,
          fontWeight: 600,
          letterSpacing: '-0.015em',
          color: 'var(--color-label)',
          margin: 0,
        }}
      >
        {arcNarratif}
      </p>

      {piliers.length > 0 ? (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          {piliers.map((pilier) => (
            <li key={pilier.nom}>
              <span
                className="glass-thin text-subheadline"
                style={{
                  display: 'inline-block',
                  padding: '4px 10px 5px',
                  borderRadius: 999,
                  color: 'var(--color-label)',
                  whiteSpace: 'nowrap',
                }}
              >
                {pilier.nom}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
