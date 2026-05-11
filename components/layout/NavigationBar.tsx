// Sprint 33 — NavigationBar iOS large title (§7.3 large-title)
// Sprint 36.B.1 — Ajout props showBackButton + backHref.
// Le `trailing` reste accepté pour usage transitoire (Chantier B remplace
// par UserMenuTrigger systématique).
import type { ReactNode } from 'react'
import { BackButton } from './BackButton'

type NavigationBarProps = {
  title: string
  trailing?: ReactNode
  showBackButton?: boolean
  backHref?: string
}

export function NavigationBar({
  title,
  trailing,
  showBackButton = false,
  backHref,
}: NavigationBarProps) {
  return (
    <header className="cfs-navbar">
      <div className="cfs-navbar__leading">
        {showBackButton ? <BackButton href={backHref} /> : null}
        <h1 className="cfs-navbar__title">{title}</h1>
      </div>
      {trailing != null ? <div className="cfs-navbar__trailing">{trailing}</div> : null}
    </header>
  )
}
