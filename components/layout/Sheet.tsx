// Sprint 33 §8.6 — Sheet glass-thick (pattern iOS sheet)
'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

type SheetProps = {
  open: boolean
  title?: string
  onDismiss?: () => void
  children?: ReactNode
}

export function Sheet({ open, title, onDismiss, children }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onDismiss])

  if (!open) return null
  return (
    <>
      <div
        className="cfs-sheet-backdrop"
        onClick={onDismiss}
        aria-hidden="true"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="cfs-sheet glass-thick"
      >
        {title != null ? <h2 className="text-title-2">{title}</h2> : null}
        <div>{children}</div>
      </section>
    </>
  )
}
