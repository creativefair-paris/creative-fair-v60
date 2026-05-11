// Sprint 36.B — Hero refondu iOS 26 enrichi.
// Phrase intro sobre, arc narratif imposant, chips piliers avec dot accent couleur.
// Server Component. Glass-regular, radius 24px.

import type { PilierNarratif } from '@/types/programme'

type HeroSemaineProps = {
  arcNarratif: string
  piliers: PilierNarratif[]
}

const PILIER_COLOR_VARS = ['var(--pilier-1)', 'var(--pilier-2)', 'var(--pilier-3)'] as const

export function HeroSemaine({ arcNarratif, piliers }: HeroSemaineProps) {
  return (
    <section
      className="glass-regular"
      style={{
        padding: 'var(--space-6) var(--space-5)',
        borderRadius: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-5)',
      }}
    >
      <p
        className="intro-subtle"
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 15,
          lineHeight: 1.4,
          color: 'var(--color-secondary-label)',
          margin: 0,
        }}
      >
        Voici comment Creative Fair a interprété ta marque cette semaine.
      </p>

      <h1
        className="arc-narratif"
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 28,
          lineHeight: 1.2,
          fontWeight: 600,
          letterSpacing: '-0.018em',
          color: 'var(--color-label)',
          margin: 0,
        }}
      >
        {arcNarratif}
      </h1>

      {piliers.length > 0 ? (
        <ul
          className="piliers-chips"
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {piliers.map((pilier, i) => (
            <li key={pilier.nom}>
              <span
                className="glass-thin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 14px',
                  borderRadius: 999,
                  fontFamily: 'var(--font-system)',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--color-label)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    marginRight: 8,
                    background: PILIER_COLOR_VARS[i] ?? PILIER_COLOR_VARS[0],
                  }}
                />
                {pilier.nom}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
