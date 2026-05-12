// Sprint 36.B.3 — Wrapper unifié de toutes les sheets Ma Marque.
//
// Remplace SplitBrief pour les sheets de Ma Marque : ajoute breadcrumb,
// titre H1 qui matche le label du rang, footer avec workflow inter-blocs.
//
// Deux layouts :
//   - "split"    : 40/60 (context + preview) — sheets riches.
//   - "centered" : layout étroit centré — sheets texte simple.
//
// Doctrine : viewport ≥ 1200px requis, fallback message sobre sinon.

'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import {
  BLOCS_LABELS,
  BLOCS_ORDRE,
  type BlocId,
} from '@/lib/ma-marque/completude'

const MIN_VIEWPORT = 1200

type BaseProps = {
  title: string
  bloc: BlocId
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
  intro?: string
}

type SplitProps = BaseProps & {
  layout: 'split'
  context: ReactNode
  preview: ReactNode
}

type CenteredProps = BaseProps & {
  layout: 'centered'
  children: ReactNode
}

type Props = SplitProps | CenteredProps

function blocSuivantId(bloc: BlocId): BlocId | null {
  const i = BLOCS_ORDRE.indexOf(bloc)
  if (i < 0 || i >= BLOCS_ORDRE.length - 1) return null
  return BLOCS_ORDRE[i + 1] ?? null
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4 4 L14 14 M14 4 L4 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SheetMaMarque(props: Props) {
  const { title, bloc, onClose, onAllerVers, intro } = props
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const titleId = `sheet-marque-title-${bloc}`

  const suivant = blocSuivantId(bloc)
  const suivantLabel = suivant ? BLOCS_LABELS[suivant] : null

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

  // Focus trap minimal.
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

  function handleContinuer() {
    if (suivant && onAllerVers) {
      onAllerVers(suivant)
    } else {
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="sheet-ma-marque-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'var(--color-background)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 6 halos identiques pages signature */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div className="bg-halo bg-halo-1" aria-hidden="true" />
        <div className="bg-halo bg-halo-2" aria-hidden="true" />
        <div className="bg-halo bg-halo-3" aria-hidden="true" />
        <div className="bg-halo bg-halo-4" aria-hidden="true" />
        <div className="bg-halo bg-halo-5" aria-hidden="true" />
        <div className="bg-halo bg-halo-6" aria-hidden="true" />
      </div>

      {/* Header : breadcrumb + titre + croix */}
      <header
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '24px 60px 0 60px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 24,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <nav
            aria-label="Fil d'Ariane"
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              color: 'var(--color-tertiary-label)',
              marginBottom: 8,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                all: 'unset',
                cursor: 'pointer',
                color: 'var(--color-tertiary-label)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-label)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-tertiary-label)'
              }}
            >
              Ma Marque
            </button>
            <span aria-hidden="true" style={{ margin: '0 8px', opacity: 0.5 }}>
              ›
            </span>
            <span style={{ color: 'var(--color-secondary-label)' }}>{title}</span>
          </nav>
          <h1
            id={titleId}
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--color-label)',
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="glass-thin"
          autoFocus
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: 22,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-label)',
            transition: 'background-color 200ms ease',
          }}
        >
          <CloseIcon />
        </button>
      </header>

      {/* Body — desktop only */}
      <div
        className="sheet-ma-marque-body-wrapper"
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          zIndex: 1,
          overflow: 'auto',
        }}
      >
        <div className="sheet-ma-marque-desktop-only">
          {props.layout === 'split' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '40% 60%',
                gap: 40,
                padding: '32px 60px 32px 60px',
                minHeight: '100%',
                boxSizing: 'border-box',
              }}
            >
              <aside
                style={{
                  paddingRight: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                }}
              >
                {intro ? (
                  <p
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 17,
                      lineHeight: 1.45,
                      fontWeight: 500,
                      color: 'var(--color-label)',
                      margin: 0,
                      marginBottom: 12,
                    }}
                  >
                    {intro}
                  </p>
                ) : null}
                {props.context}
              </aside>
              <section
                style={{
                  paddingLeft: 20,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {props.preview}
              </section>
            </div>
          ) : (
            <div
              style={{
                maxWidth: 680,
                margin: '0 auto',
                padding: '32px 32px 32px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              {intro ? (
                <p
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 17,
                    lineHeight: 1.45,
                    fontWeight: 500,
                    color: 'var(--color-label)',
                    margin: 0,
                    marginBottom: 12,
                  }}
                >
                  {intro}
                </p>
              ) : null}
              {props.children}
            </div>
          )}
        </div>

        <div
          className="sheet-ma-marque-mobile-notice"
          style={{
            display: 'none',
            minHeight: '100%',
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
      </div>

      {/* Footer fixe : Retour + Continuer / Terminé */}
      <footer
        style={{
          position: 'relative',
          zIndex: 2,
          borderTop: '1px solid rgba(0,0,0,0.06)',
          padding: '16px 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '10px 18px',
            borderRadius: 22,
            border: 'none',
            background: 'transparent',
            color: 'var(--color-secondary-label)',
            cursor: 'pointer',
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Retour à Ma Marque
        </button>

        <button
          type="button"
          onClick={handleContinuer}
          style={{
            padding: '10px 18px',
            borderRadius: 22,
            border: 'none',
            background: 'var(--color-label)',
            color: 'var(--color-background)',
            cursor: 'pointer',
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {suivant && onAllerVers ? `Continuer vers ${suivantLabel}` : 'Terminé'}
        </button>
      </footer>

      <style>{`
        @media (max-width: ${MIN_VIEWPORT - 1}px) {
          .sheet-ma-marque-desktop-only { display: none; }
          .sheet-ma-marque-mobile-notice { display: flex !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sheet-ma-marque-overlay * { transition: none !important; }
        }
      `}</style>
    </div>
  )
}
