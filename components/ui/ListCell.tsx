// Sprint 33 §8.5 — List-style cell (Apple-strict, pattern iOS Settings)
import type { ReactNode } from 'react'

type ListCellProps = {
  leading?: ReactNode
  title: string
  value?: ReactNode
  trailing?: ReactNode
}

export function ListCell({ leading, title, value, trailing }: ListCellProps) {
  return (
    <div className="cfs-list-cell" role="listitem">
      {leading != null ? <div aria-hidden="true">{leading}</div> : null}
      <span className="cfs-list-cell__title">{title}</span>
      {value != null ? <span className="cfs-list-cell__value">{value}</span> : null}
      {trailing != null ? <div>{trailing}</div> : null}
    </div>
  )
}
