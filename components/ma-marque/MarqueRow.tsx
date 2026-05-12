// Sprint 36.B.3 — Rang cliquable d'un bloc Ma Marque (pattern iOS Settings).
//
// Layout : label gauche · summary centre tronqué · chevron droite.
// Hairline 1px en bas (sauf dernier de groupe, géré par MarqueGroup).
// Pas de pourcentage, pas de badge. Score qualitatif via state.

'use client'

import type { ReactNode } from 'react'

export type MarqueRowState = 'empty' | 'partial' | 'complete'

type Props = {
  label: string
  summary: string
  state: MarqueRowState
  priority?: boolean
  isLast?: boolean
  selected?: boolean
  onClick: () => void
  icon?: ReactNode
}

// Chevron iOS minimal — pas de lib icônes.
function Chevron() {
  return (
    <svg
      aria-hidden="true"
      width="8"
      height="14"
      viewBox="0 0 8 14"
      style={{ flexShrink: 0, opacity: 0.45 }}
    >
      <path
        d="M1 1l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MarqueRow({
  label,
  summary,
  state,
  priority = false,
  isLast = false,
  selected = false,
  onClick,
  icon,
}: Props) {
  const summaryDim = state === 'empty'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ouvrir ${label}`}
      aria-current={selected ? 'true' : undefined}
      className={`cfs-marque-row${selected ? ' is-selected' : ''}`}
      style={{
        all: 'unset',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: '0 20px',
        minHeight: 56,
        width: '100%',
        cursor: 'pointer',
        color: '#1C1C1E',
        background: selected ? 'rgba(0,0,0,0.05)' : 'transparent',
        borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.06)',
        transition: 'background 100ms ease',
      }}
    >
      {/* Point lilas priorité — 6px */}
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 6,
          height: 6,
          borderRadius: 3,
          background: priority ? '#AF7AE0' : 'transparent',
          marginRight: priority ? 0 : -6,
        }}
      />

      {icon ? (
        <span aria-hidden="true" style={{ flexShrink: 0, display: 'inline-flex' }}>
          {icon}
        </span>
      ) : null}

      <span
        style={{
          flexShrink: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: '-0.005em',
          color: 'var(--color-label)',
        }}
      >
        {label}
      </span>

      <span
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: 'right',
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          color: summaryDim ? 'var(--color-tertiary-label)' : 'var(--color-secondary-label)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {summary}
      </span>

      <Chevron />

      <style jsx>{`
        @media (max-width: 640px) {
          button {
            min-height: 56px !important;
          }
        }
      `}</style>
    </button>
  )
}
