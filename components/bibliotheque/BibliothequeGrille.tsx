// Sprint 43-stable — Grille 4:5 Bibliothèque format Instagram.
// Doctrine 01-ARCHITECTURE.md §1 (format 4:5 publications passées) + §3.2.

type BibliothequeItem = {
  id: string
  title: string
  pillarLabel: string | null
  pillarColor: string
  date: string
  caption?: string | null
  visualGradient?: string
}

type Props = {
  items: ReadonlyArray<BibliothequeItem>
}

export function BibliothequeGrille({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="empty-state glass-z1">
        <h2 className="empty-state__title">Ta bibliothèque est vide</h2>
        <p>
          Tes publications passées apparaissent ici automatiquement, dès qu&apos;elles sont
          publiées ou archivées.
        </p>
      </div>
    )
  }

  return (
    <div className="bibliotheque-grille">
      {items.map((item) => (
        <article key={item.id} className="bib-item">
          <div
            className="bib-item__visual"
            style={{
              background:
                item.visualGradient ??
                `linear-gradient(135deg, ${item.pillarColor}, rgba(255,255,255,0.4))`,
            }}
            aria-hidden="true"
          />
          <div className="bib-item__meta">
            <div className="bib-item__top">
              {item.pillarLabel ? (
                <span className="bib-item__pillar">
                  <span
                    className="bib-item__pillar-dot"
                    style={{ background: item.pillarColor }}
                    aria-hidden="true"
                  />
                  {item.pillarLabel}
                </span>
              ) : null}
              <span className="bib-item__date">{item.date}</span>
            </div>
            <p className="bib-item__caption">
              {item.caption ?? item.title}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}

export type { BibliothequeItem }
