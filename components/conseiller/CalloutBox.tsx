// Sprint 37.B (F11) — Primitive CalloutBox.
//
// 3 variants : recommendation (bleu #007AFF) / warning (orange
// #FF9500) / info (gris). Bord gauche 3px coloré, fond translucide.
// Tokens dans app/globals.css (.callout-box).

import type { ReactNode } from 'react'

type Props = {
  variant: 'recommendation' | 'warning' | 'info'
  title?: string
  children: ReactNode
}

export function CalloutBox({ variant, title, children }: Props) {
  return (
    <div className="callout-box" data-variant={variant}>
      <div className="callout-box__body">
        {title ? <span className="callout-box__title">{title}</span> : null}
        <div className="callout-box__content">{children}</div>
      </div>
    </div>
  )
}
