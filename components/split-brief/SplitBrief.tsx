// Sprint 36.B — Pattern Split Brief signature Creative Fair.
// Plein écran 40/60, immersif, sans NavigationBar, sortie par croix.
// Réutilisable Sprint 36.C+ (cards posts, sous-blocs Ma Marque).

'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type SplitBriefProps = {
  intro: string
  context: ReactNode
  preview: ReactNode
  onClose: () => void
}

const MIN_VIEWPORT = 1200

export function SplitBrief({ intro, context, preview, onClose }: SplitBriefProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const introId = 'split-brief-intro'

  // Focus initial sur la croix au montage.
  useEffect(() => {
    closeBtnRef.current?.focus()
  }, [])

  // Escape ferme.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Focus trap minimal : tab cyclique dans l'overlay.
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    function onKeyTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !overlay) return
      const focusables = overlay.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    overlay.addEventListener('keydown', onKeyTab)
    return () => overlay.removeEventListener('keydown', onKeyTab)
  }, [])

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={introId}
      className="split-brief-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'var(--color-background)',
        overflow: 'auto',
      }}
    >
      {/* 6 halos identiques page programme */}
      <div className="split-brief-halos" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div className="bg-halo bg-halo-1" aria-hidden="true" />
        <div className="bg-halo bg-halo-2" aria-hidden="true" />
        <div className="bg-halo bg-halo-3" aria-hidden="true" />
        <div className="bg-halo bg-halo-4" aria-hidden="true" />
        <div className="bg-halo bg-halo-5" aria-hidden="true" />
        <div className="bg-halo bg-halo-6" aria-hidden="true" />
      </div>

      <button
        ref={closeBtnRef}
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="split-brief-close glass-thin"
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          width: 44,
          height: 44,
          borderRadius: 22,
          border: 'none',
          cursor: 'pointer',
          zIndex: 1001,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-label)',
          transition: 'background-color 200ms ease',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 4 L14 14 M14 4 L4 14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <ResponsiveGate>
        <div
          className="split-brief-grid"
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '40% 60%',
            gap: 40,
            padding: '80px 60px 60px 60px',
            minHeight: '100vh',
            boxSizing: 'border-box',
          }}
        >
          <aside
            className="split-brief-context"
            style={{
              paddingRight: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <p
              id={introId}
              className="split-brief-intro"
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 17,
                lineHeight: 1.4,
                fontWeight: 500,
                color: 'var(--color-label)',
                margin: 0,
                marginBottom: 32,
              }}
            >
              {intro}
            </p>
            {context}
          </aside>

          <section
            className="split-brief-preview"
            style={{
              paddingLeft: 20,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {preview}
          </section>
        </div>
      </ResponsiveGate>
    </div>
  )
}

// Gate viewport : Split Brief desktop-first (>= 1200px).
// Sous le seuil : message sobre, pas de tentative mobile (reporté Sprint 37+).
function ResponsiveGate({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="split-brief-desktop-only">{children}</div>
      <div
        className="split-brief-mobile-notice"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'none',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 17,
            lineHeight: 1.4,
            color: 'var(--color-secondary-label)',
            maxWidth: 360,
          }}
        >
          Creative Fair fonctionne mieux sur écran large.
        </p>
      </div>
      <style>{`
        @media (max-width: ${MIN_VIEWPORT - 1}px) {
          .split-brief-desktop-only { display: none; }
          .split-brief-mobile-notice { display: flex !important; }
        }
      `}</style>
    </>
  )
}
