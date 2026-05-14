// Sprint 37.E (F57) — EmptyState générique réutilisable.

import type { ReactNode } from 'react'

type Props = {
  icon?: ReactNode
  title: string
  description?: string
  cta?: { label: string; href?: string; onClick?: () => void }
}

export function EmptyState({ icon, title, description, cta }: Props) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '40px 24px',
        textAlign: 'center',
        borderRadius: 14,
        background: 'rgba(255, 255, 255, 0.5)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
      }}
    >
      {icon ? (
        <span
          aria-hidden="true"
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            background: 'rgba(0, 0, 0, 0.04)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-tertiary-label)',
          }}
        >
          {icon}
        </span>
      ) : null}
      <h3
        style={{
          margin: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--color-label)',
          maxWidth: 420,
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>
      {description ? (
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--color-secondary-label)',
            maxWidth: 480,
          }}
        >
          {description}
        </p>
      ) : null}
      {cta ? (
        cta.href ? (
          <a href={cta.href} className="btn-primary" style={{ textDecoration: 'none', marginTop: 6 }}>
            {cta.label}
          </a>
        ) : (
          <button type="button" onClick={cta.onClick} className="btn-primary" style={{ marginTop: 6 }}>
            {cta.label}
          </button>
        )
      ) : null}
    </section>
  )
}
