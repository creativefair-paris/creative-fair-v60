// Stub Sprint 32.5 — finalisation Sprint 33 (§8.6 Sheet glass-thick iOS)
import type { ReactNode } from 'react'

type SheetProps = {
  open: boolean
  title?: string
  children?: ReactNode
}

export function Sheet({ open, title, children }: SheetProps) {
  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" aria-label={title}>
      {title != null ? <h2>{title}</h2> : null}
      {children}
    </div>
  )
}
