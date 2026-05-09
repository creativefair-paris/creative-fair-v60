// Sprint 33 — NavigationBar iOS large title (§7.3 large-title)
import type { ReactNode } from 'react'

type NavigationBarProps = {
  title: string
  trailing?: ReactNode
}

export function NavigationBar({ title, trailing }: NavigationBarProps) {
  return (
    <header className="cfs-navbar">
      <h1 className="cfs-navbar__title">{title}</h1>
      {trailing != null ? <div>{trailing}</div> : null}
    </header>
  )
}
