// Sprint 36.B.3 — Groupe de rangs Ma Marque (pattern iOS Settings).
// Titre small caps + container Liquid Glass arrondi.

'use client'

import { Children, cloneElement, isValidElement, type ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
}

export function MarqueGroup({ title, children }: Props) {
  const items = Children.toArray(children).filter(isValidElement)
  const count = items.length

  return (
    <section
      aria-labelledby={`group-${title.toLowerCase().replace(/\s+/g, '-')}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginTop: 'var(--space-5)',
      }}
    >
      <h3
        id={`group-${title.toLowerCase().replace(/\s+/g, '-')}`}
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-tertiary-label)',
          margin: 0,
          padding: '0 var(--space-4)',
        }}
      >
        {title}
      </h3>
      <div
        className="glass-thin"
        style={{
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {items.map((child, i) => {
          if (!isValidElement<{ isLast?: boolean }>(child)) return child
          return cloneElement(child, { isLast: i === count - 1 })
        })}
      </div>
    </section>
  )
}
