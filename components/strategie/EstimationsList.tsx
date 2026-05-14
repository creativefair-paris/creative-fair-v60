// Sprint 37.H (F73 — Section 3) — Liste des résultats anticipés.
//
// Chaque card affiche : label + avant + fourchette après (min/max) +
// fourchette évolution % (min/max).
//
// Vocabulaire : "Résultats anticipés", "Fourchettes", "Estimations
// indicatives". JAMAIS performance / KPI / metrics / growth.

import type { EstimationItem } from '@/app/_actions/estimate-programme-outcomes'

type Props = {
  estimations: ReadonlyArray<EstimationItem>
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
    return value.toString()
  }
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
}

export function EstimationsList({ estimations }: Props) {
  if (estimations.length === 0) return null
  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 10,
      }}
    >
      {estimations.map((e) => (
        <li
          key={e.metric_type}
          style={{
            padding: '16px 18px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-tertiary-label)',
            }}
          >
            {e.label}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                color: 'var(--color-secondary-label)',
              }}
            >
              {formatNumber(e.avant)} →
            </span>
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--color-label)',
                letterSpacing: '-0.015em',
              }}
            >
              {formatNumber(e.apres_min)}–{formatNumber(e.apres_max)}
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              color: 'var(--color-secondary-label)',
            }}
          >
            Évolution estimée : +{e.evolution_pct_min}% à +{e.evolution_pct_max}%
          </span>
        </li>
      ))}
    </ul>
  )
}
