// Sprint 36.B.1 — Pill action réutilisable (glass-thin).
// Sert pour les chips actions sur Mon Programme.
'use client'

import Link from 'next/link'
import type { ReactNode, MouseEvent } from 'react'

type ChipActionProps = {
  label: string
  href?: string
  onClick?: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  icon?: ReactNode
}

export function ChipAction({ label, href, onClick, icon }: ChipActionProps) {
  const content = (
    <>
      {icon != null ? <span className="cfs-chip-action__icon">{icon}</span> : null}
      <span className="cfs-chip-action__label">{label}</span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="cfs-chip-action glass-thin"
        onClick={onClick}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className="cfs-chip-action glass-thin"
      onClick={onClick}
    >
      {content}
    </button>
  )
}
