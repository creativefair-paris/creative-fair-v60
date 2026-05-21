// Sprint 43-stable — Piliers actifs (trimestre en cours)

type Pilier = {
  id: string
  label: string
  count: number
  color: string
}

type Props = {
  piliers: ReadonlyArray<Pilier>
}

export function MonProgrammePiliers({ piliers }: Props) {
  return (
    <section className="mp-section">
      <div className="mp-eyebrow">Piliers actifs · trimestre en cours</div>
      <div className="mp-piliers">
        {piliers.map((p) => (
          <div key={p.id} className="mp-pilier" style={{ borderColor: p.color }}>
            <span className="mp-pilier-dot" style={{ background: p.color }} aria-hidden="true" />
            <span className="mp-pilier-label">{p.label}</span>
            <span className="mp-pilier-count">
              {p.count} {p.count === 1 ? 'publication' : 'publications'}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
