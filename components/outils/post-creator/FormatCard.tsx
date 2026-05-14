// Sprint 37.H (F72) — Card de format dans le Hub Post Creator.
//
// 4 formats supportés : Anecdote / Produit / Événement / Manifeste
// 2 formats à venir : Question / Coulisses (disabled, badge BIENTÔT)

import Link from 'next/link'
import type { CanonicalFormat } from '@/lib/programme-creation/types'

const FORMAT_COLOR: Record<CanonicalFormat, string> = {
  anecdote: '#007AFF',
  produit: '#34C759',
  evenement: '#FF9500',
  coulisses: '#AF52DE',
  manifeste: '#FF3B30',
  question: '#5856D6',
}

type Props = {
  format: CanonicalFormat
  label: string
  href?: string
  disabled?: boolean
  description?: string
}

export function FormatCard({ format, label, href, disabled, description }: Props) {
  const inner = (
    <div
      className={`cfs-format-card${disabled ? ' is-disabled' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 12,
        background: disabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        transition: 'background 180ms ease-out, transform 180ms ease-out',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontFamily: 'var(--font-system)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#FFFFFF',
              background: FORMAT_COLOR[format],
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {label}
          </span>
          {disabled ? (
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-tertiary-label)',
                background: 'rgba(0, 0, 0, 0.05)',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              Bientôt
            </span>
          ) : null}
        </div>
        {description ? (
          <span style={{ fontSize: 12, color: 'var(--color-secondary-label)', lineHeight: 1.4 }}>
            {description}
          </span>
        ) : null}
      </div>
      {!disabled ? (
        <span
          aria-hidden="true"
          style={{
            fontSize: 14,
            color: 'var(--color-tertiary-label)',
            flexShrink: 0,
          }}
        >
          →
        </span>
      ) : null}
      <style>{`
        .cfs-format-card:not(.is-disabled):hover {
          background: rgba(255, 255, 255, 0.85) !important;
          transform: translateY(-1px);
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-format-card { transition: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  )

  if (disabled || !href) {
    return (
      <div aria-disabled="true" style={{ cursor: 'not-allowed' }}>
        {inner}
      </div>
    )
  }
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {inner}
    </Link>
  )
}
