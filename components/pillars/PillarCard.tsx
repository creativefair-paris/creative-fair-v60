// Sprint 37.K (F89) — Carte pilier (lecture + edit + archive).
//
// 260px de large, glass blur. Affiche title (truncate 2 lignes) + description
// (truncate 3 lignes). Click → onEdit. Bouton archive (poubelle) en hover.

'use client'

import type { PillarRow } from '@/lib/pillars/types'

type Props = {
  pillar: PillarRow
  onEdit: (pillar: PillarRow) => void
  onArchive: (pillar: PillarRow) => void
  disabled?: boolean
}

export function PillarCard({ pillar, onEdit, onArchive, disabled }: Props) {
  const accent = pillar.color_hex ?? 'rgba(0, 122, 255, 0.18)'

  return (
    <article
      className="cfp-card"
      style={{
        flex: '0 0 260px',
        minHeight: 180,
        padding: 16,
        borderRadius: 14,
        border: '1px solid rgba(0, 0, 0, 0.06)',
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 200ms',
      }}
      onClick={() => {
        if (!disabled) onEdit(pillar)
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit(pillar)
        }
      }}
    >
      {/* Bandeau couleur en tête */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          background: accent,
        }}
      />

      <h3
        style={{
          margin: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--color-label)',
          letterSpacing: '-0.01em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {pillar.title}
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          lineHeight: 1.45,
          color: 'var(--color-secondary-label)',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {pillar.description}
      </p>

      <button
        type="button"
        aria-label="Archiver ce pilier"
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) onArchive(pillar)
        }}
        disabled={disabled}
        style={{
          alignSelf: 'flex-end',
          marginTop: 4,
          padding: '4px 10px',
          fontSize: 11,
          fontFamily: 'var(--font-system)',
          color: 'var(--color-tertiary-label)',
          background: 'transparent',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 6,
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        Archiver
      </button>
    </article>
  )
}

// Sprint 37.K (F89) — Carte dashed "+" pour déclencher le wizard.
type AddCardProps = {
  onClick: () => void
  disabled?: boolean
  label?: string
}

export function PillarAddCard({ onClick, disabled, label }: AddCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Ajouter un pilier"
      style={{
        flex: '0 0 260px',
        minHeight: 180,
        padding: 16,
        borderRadius: 14,
        border: '1.5px dashed rgba(0, 0, 0, 0.18)',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        fontFamily: 'var(--font-system)',
        color: 'var(--color-secondary-label)',
        transition: 'background 200ms, border-color 200ms',
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        e.currentTarget.style.background = 'rgba(0, 122, 255, 0.04)'
        e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.35)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.18)'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: 28,
          lineHeight: 1,
          fontWeight: 300,
          color: 'var(--color-secondary-label)',
        }}
      >
        +
      </span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label ?? 'Ajouter un pilier'}</span>
    </button>
  )
}
