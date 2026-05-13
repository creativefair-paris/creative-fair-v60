// Sprint 37.C (F18) — Trigger client pour le wizard guidé Ma Marque.
//
// Détecte le query param `?onboarding=true` ou la prop `autoOpen`, gère
// la reprise d'une session IN_PROGRESS via mini-sheet de choix (cf.
// ResumeChoiceSheet utilisé Sprint 37.B F14), et monte la
// BrandOnboardingSheet.

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  createBrandOnboardingSession,
  getResumableBrandOnboardingSession,
} from '@/app/_actions/brand-onboarding'
import { BrandOnboardingSheet } from './BrandOnboardingSheet'
import type { BrandOnboardingSessionRow } from '@/lib/brand-onboarding/types'

type Phase =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'resume-choice'; resumable: BrandOnboardingSessionRow }
  | { kind: 'sheet'; session: BrandOnboardingSessionRow }

export function BrandOnboardingTrigger({
  autoOpen = false,
}: {
  autoOpen?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const triggered = autoOpen || searchParams?.get('onboarding') === 'true'

  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })

  const cleanUrl = useCallback(() => {
    // Retire le query param de l'URL sans recharger.
    router.replace('/ma-marque')
  }, [router])

  const close = useCallback(() => {
    setPhase({ kind: 'idle' })
    cleanUrl()
  }, [cleanUrl])

  const startNew = useCallback(async () => {
    setPhase({ kind: 'loading' })
    const res = await createBrandOnboardingSession()
    if (res.ok) {
      setPhase({ kind: 'sheet', session: res.session })
    } else {
      setPhase({ kind: 'idle' })
    }
  }, [])

  useEffect(() => {
    if (!triggered || phase.kind !== 'idle') return
    let cancelled = false
    ;(async () => {
      setPhase({ kind: 'loading' })
      const resumable = await getResumableBrandOnboardingSession()
      if (cancelled) return
      if (resumable) {
        setPhase({ kind: 'resume-choice', resumable })
      } else {
        const res = await createBrandOnboardingSession()
        if (cancelled) return
        if (res.ok) {
          setPhase({ kind: 'sheet', session: res.session })
        } else {
          setPhase({ kind: 'idle' })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [triggered, phase.kind])

  if (phase.kind === 'sheet') {
    return <BrandOnboardingSheet session={phase.session} onClose={close} />
  }

  if (phase.kind === 'resume-choice') {
    return (
      <ResumeChoiceMiniSheet
        currentStep={phase.resumable.current_step}
        totalSteps={phase.resumable.total_steps}
        onResume={() => setPhase({ kind: 'sheet', session: phase.resumable })}
        onStartNew={startNew}
        onDismiss={close}
      />
    )
  }

  return null
}

function ResumeChoiceMiniSheet({
  currentStep,
  totalSteps,
  onResume,
  onStartNew,
  onDismiss,
}: {
  currentStep: number
  totalSteps: number
  onResume: () => void
  onStartNew: () => void
  onDismiss: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-onboarding-title"
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
          id="resume-onboarding-title"
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
          Tu as déjà commencé
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
          Tu en es à l'étape {currentStep + 1} sur {totalSteps}. Tu veux reprendre où tu en étais ou tout recommencer ?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <button
            type="button"
            onClick={onResume}
            className="btn-primary"
            style={{ alignSelf: 'stretch', textAlign: 'center' }}
          >
            Reprendre où j’en étais (étape {currentStep + 1} sur {totalSteps})
          </button>
          <button
            type="button"
            onClick={onStartNew}
            className="btn-choice"
            style={{ alignSelf: 'stretch' }}
          >
            Recommencer un nouvel onboarding
          </button>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              alignSelf: 'center',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-secondary-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Plus tard
          </button>
        </div>
      </section>
    </div>
  )
}
