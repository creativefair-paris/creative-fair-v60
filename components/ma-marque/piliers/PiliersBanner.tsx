// Sprint 36.I Finding 6 — Bannière contextuelle "Piliers narratifs".
//
// Doctrine "Tranquillité du pilote" : tout artefact généré par
// Creative Fair doit avoir un rationnel visible OU un moyen de
// revenir dessus avec le Conseiller. Cette bannière fait les deux.
//
// Dismissable via X. Préférence stockée en localStorage clé
// "piliers-banner-dismissed-v1" (transitoire, pas de migration DB).
//
// TODO Sprint 37 — Le CTA "Reprendre avec le Conseiller" pointe
// pour l'instant vers /outils/conseiller sans pré-sélection des
// piliers. Le flux conversationnel du Sprint 37 branchera un
// contexte pré-rempli (mode "reprise piliers narratifs").

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'piliers-banner-dismissed-v1'

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4 4 L14 14 M14 4 L4 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PiliersBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Sprint 41-secu-compte (C) : pattern d'hydratation client (localStorage
    // inaccessible côté SSR). setState ici est intentionnel — il s'exécute
    // une seule fois au mount, pas en cascade.
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY)
      if (dismissed !== '1') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(true)
      }
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true)
    }
  }, [])

  function handleDismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore — la bannière disparaît juste pour la session courante
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Contexte des piliers"
      className="glass-thin"
      style={{
        borderRadius: 12,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--color-secondary-label)',
            margin: 0,
          }}
        >
          Creative Fair a proposé ces 3 piliers à partir de tes réponses. Ajuste-les ou
          reprends-les avec le Conseiller.
        </p>
        <Link
          href="/outils/conseiller"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            fontWeight: 500,
            color: '#007AFF',
            textDecoration: 'none',
            alignSelf: 'flex-start',
          }}
        >
          Reprendre avec le Conseiller →
        </Link>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Masquer ce message"
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: 14,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--color-tertiary-label)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 200ms ease-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-label)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-tertiary-label)'
        }}
      >
        <CloseIcon />
      </button>
    </div>
  )
}
