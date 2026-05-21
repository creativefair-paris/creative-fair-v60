// Sprint 37.C (F26) — Dialogue Apple-style de friction explicite quand
// le pilote tente d'accéder à un CTA d'un jalon supérieur sans avoir
// atteint les jalons précédents.
//
// Anti-paternalisme : pas de hard-block. On guide, on ne force pas.
// Boutons : "Poser ma marque d'abord →" (CTA primaire) / "Continuer
// quand même" (lien secondaire).

'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export type JalonGuardKind = 'marque' | 'programme'

type JalonGuardDialogProps = {
  open: boolean
  kind: JalonGuardKind
  onContinueAnyway: () => void
  onDismiss: () => void
  // Lien CTA primaire (route vers la destination de réparation).
  primaryHref: string
}

const CONTENT: Record<JalonGuardKind, { title: string; body: string; primaryLabel: string }> = {
  marque: {
    title: "Tu n'as pas encore posé ta marque",
    body:
      "Le conseiller ne pourra pas créer un plan vraiment adapté sans connaître tes piliers narratifs et ton audience.",
    primaryLabel: 'Poser ma marque d’abord →',
  },
  programme: {
    title: "Tu n'as pas encore créé ton programme",
    body:
      "Le conseiller ne pourra pas adapter le post à ta marque sans plan éditorial en cours.",
    primaryLabel: 'Créer mon programme d’abord →',
  },
}

export function JalonGuardDialog({
  open,
  kind,
  onContinueAnyway,
  onDismiss,
  primaryHref,
}: JalonGuardDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onDismiss])

  if (!open) return null

  const { title, body, primaryLabel } = CONTENT[kind]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="jalon-guard-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={onDismiss}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.22)',
        }}
      />
      <section
        ref={dialogRef}
        className="glass-regular"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 440,
          width: '100%',
          borderRadius: 18,
          padding: '28px 28px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'rgba(251, 250, 247, 0.96)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.18)',
        }}
      >
        <h2
          id="jalon-guard-title"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 19,
            fontWeight: 700,
            color: 'var(--color-label)',
            margin: 0,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            lineHeight: 1.55,
            color: 'var(--color-secondary-label)',
            margin: 0,
          }}
        >
          {body}
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginTop: 8,
          }}
        >
          <Link
            href={primaryHref}
            className="btn-primary"
            style={{
              alignSelf: 'stretch',
              textAlign: 'center',
              textDecoration: 'none',
            }}
            onClick={onDismiss}
          >
            {primaryLabel}
          </Link>
          <button
            type="button"
            onClick={onContinueAnyway}
            style={{
              alignSelf: 'center',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-secondary-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Continuer quand même
          </button>
        </div>
      </section>
    </div>
  )
}
