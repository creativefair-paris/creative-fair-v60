// Sprint 43-stable — Heatmap éditoriale 30 jours (Mon Programme)
// Doctrine 00-CONCEPT.md §5 promesse 6.

import Link from 'next/link'

type Cell = {
  day: number
  pilierColor?: string
  isToday?: boolean
  hasStack?: boolean
}

type LegendItem = {
  label: string
  color: string
}

type Props = {
  cells: ReadonlyArray<Cell>
  legend: ReadonlyArray<LegendItem>
}

export function MonProgrammeHeatmap({ cells, legend }: Props) {
  return (
    <section className="mp-section">
      <div className="mp-eyebrow">Calendrier éditorial · 30 jours</div>
      <div className="mp-cal glass-z2">
        <div className="mp-cal-grid" aria-label="30 prochains jours, code couleur par pilier">
          {cells.map((cell, i) => (
            <div
              key={i}
              className={`mp-cal-cell ${cell.isToday ? 'is-today' : ''} ${cell.hasStack ? 'has-stack' : ''}`}
              style={cell.pilierColor ? { background: cell.pilierColor } : undefined}
            >
              {cell.day > 0 ? cell.day : ''}
            </div>
          ))}
        </div>

        <div className="mp-cal-legend">
          {legend.map((item) => (
            <span key={item.label} className="mp-cal-legend-item">
              <span className="mp-cal-legend-dot" style={{ background: item.color }} aria-hidden="true" />
              {item.label}
            </span>
          ))}
        </div>

        <Link className="mp-cal-cta" href="/calendrier">
          Ouvrir dans Calendrier →
        </Link>
      </div>
    </section>
  )
}
