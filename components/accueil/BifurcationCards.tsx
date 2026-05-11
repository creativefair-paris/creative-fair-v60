// Sprint 34 — Cards bifurcation Programme / Outils (cahier §2.x)
'use client'

import Link from 'next/link'

type Destination = {
  href: '/programme' | '/outils'
  title: string
  description: string
  cta: string
}

const DESTINATIONS: readonly Destination[] = [
  {
    href: '/programme',
    title: 'Mon Programme',
    description: 'Ton plan éditorial sur mesure, généré et piloté par l\u2019IA.',
    cta: 'commencer',
  },
  {
    href: '/outils',
    title: 'Mes Outils',
    description: 'Crée, explore et publie librement avec l\u2019IA.',
    cta: 'explorer',
  },
] as const

export function BifurcationCards() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
        width: '100%',
        maxWidth: 720,
      }}
    >
      {DESTINATIONS.map((dest) => (
        <Link
          key={dest.href}
          href={dest.href}
          className="glass-regular cfs-bifurcation-card"
          style={{
            flex: '1 1 280px',
            minWidth: 280,
            maxWidth: 340,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            padding: 32,
            borderRadius: 24,
            border: '1px solid var(--color-separator)',
            textDecoration: 'none',
            color: 'var(--color-label)',
            transition:
              'box-shadow var(--duration-medium) var(--ease-out-quart), transform var(--duration-fast) var(--ease-out-quart)',
          }}
        >
          <h2 className="text-title-2" style={{ fontWeight: 600 }}>
            {dest.title}
          </h2>
          <p
            className="text-callout"
            style={{ color: 'var(--color-secondary-label)', flex: 1 }}
          >
            {dest.description}
          </p>
          <span
            className="text-headline"
            style={{
              marginTop: 'var(--space-2)',
              color: 'var(--color-system-blue)',
            }}
          >
            {dest.cta}
          </span>
        </Link>
      ))}
    </div>
  )
}
