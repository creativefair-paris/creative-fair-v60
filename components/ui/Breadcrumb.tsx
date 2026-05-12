// Sprint 36.B.4 — Patch 4 : fil d'Ariane des pages mères.
//
// Affiche "Aujourd'hui › Page". Le segment "Aujourd'hui" est cliquable
// et pointe vers la racine. Le segment courant n'est pas cliquable.

import Link from 'next/link'
import type { CSSProperties } from 'react'

// Pour l'instant, /aujourd-hui n'existe pas — on pointe vers /programme.
// Quand la home /aujourd-hui sera créée, basculer ici.
const HOME_HREF = '/programme'

type Crumb = { label: string; href?: string }

type Props = {
  items: ReadonlyArray<string | Crumb>
  style?: CSSProperties
}

function normaliser(items: ReadonlyArray<string | Crumb>): Crumb[] {
  const out: Crumb[] = []
  for (let i = 0; i < items.length; i++) {
    const raw = items[i]!
    const crumb: Crumb = typeof raw === 'string' ? { label: raw } : { ...raw }
    if (i === 0 && !crumb.href) crumb.href = HOME_HREF
    out.push(crumb)
  }
  return out
}

export function Breadcrumb({ items, style }: Props) {
  const crumbs = normaliser(items)
  const dernierIndex = crumbs.length - 1

  return (
    <nav
      aria-label="Fil d'Ariane"
      style={{
        fontFamily: 'var(--font-system)',
        fontSize: 12,
        fontWeight: 400,
        letterSpacing: '0.01em',
        color: 'rgba(0,0,0,0.4)',
        marginBottom: 4,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0,
        ...style,
      }}
    >
      {crumbs.map((c, i) => {
        const dernier = i === dernierIndex
        const node = c.href && !dernier ? (
          <Link
            href={c.href}
            style={{
              color: 'rgba(0,0,0,0.4)',
              textDecoration: 'none',
              transition: 'color 150ms ease',
            }}
            className="cfs-breadcrumb-link"
          >
            {c.label}
          </Link>
        ) : (
          <span style={{ color: dernier ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.4)' }}>
            {c.label}
          </span>
        )
        return (
          <span key={`${c.label}-${i}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {node}
            {!dernier ? (
              <span
                aria-hidden="true"
                style={{
                  margin: '0 8px',
                  color: 'rgba(0,0,0,0.25)',
                }}
              >
                ›
              </span>
            ) : null}
          </span>
        )
      })}
    </nav>
  )
}
