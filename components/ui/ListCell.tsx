// Sprint 33 §8.5 — List-style cell (Apple-strict, pattern iOS Settings).
// Sprint 35 — Extension `description` pour catalogue Outils (§5.1 réinterprété
// en liste iOS native plutôt qu'en grid de cards).
import type { ReactNode } from 'react'

type ListCellProps = {
  leading?: ReactNode
  title: string
  description?: ReactNode
  value?: ReactNode
  trailing?: ReactNode
}

export function ListCell({ leading, title, description, value, trailing }: ListCellProps) {
  return (
    <div className="cfs-list-cell" role="listitem">
      {leading != null ? <div aria-hidden="true">{leading}</div> : null}
      <div className="cfs-list-cell__content">
        <span className="cfs-list-cell__title">{title}</span>
        {description != null ? (
          <span className="cfs-list-cell__description">{description}</span>
        ) : null}
      </div>
      {value != null ? <span className="cfs-list-cell__value">{value}</span> : null}
      {trailing != null ? <div>{trailing}</div> : null}
    </div>
  )
}
