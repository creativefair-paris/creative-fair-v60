// Sprint 37.E (F44) — Alerte affichée en haut de /programme/create
// quand le jalon "marque" n'est pas atteint. Le conseiller pourra
// proposer un plan, mais il sera moins ajusté à l'identité de la
// marque. Anti-paternalisme : on permet de continuer.

'use client'

import { useState } from 'react'
import Link from 'next/link'

export function MarqueIncompleteWarning() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <section
      role="region"
      aria-label="Marque incomplète"
      style={{
        padding: '14px 18px',
        borderRadius: 12,
        background: 'rgba(255, 149, 0, 0.06)',
        border: '1px solid rgba(255, 149, 0, 0.25)',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: 12,
          background: '#FF9500',
          color: '#FFFFFF',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 14,
          marginTop: 2,
        }}
      >
        !
      </span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <strong
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-label)',
          }}
        >
          Ta marque n&apos;est pas complètement définie
        </strong>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            lineHeight: 1.5,
            color: 'rgba(0, 0, 0, 0.7)',
          }}
        >
          Tes piliers narratifs ne sont pas posés. Le conseiller pourra te proposer un plan, mais il sera moins ajusté à ton identité.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
          <Link
            href="/ma-marque?onboarding=true"
            className="btn-primary"
            style={{ textDecoration: 'none', fontSize: 13, padding: '6px 14px' }}
          >
            Compléter Ma Marque d&apos;abord
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-secondary-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Continuer quand même
          </button>
        </div>
      </div>
    </section>
  )
}
