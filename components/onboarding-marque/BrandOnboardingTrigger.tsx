// Sprint 37.C (F18) — Trigger client pour le wizard guidé Ma Marque.
//
// Détecte le query param `?onboarding=true` ou la prop `autoOpen`, gère
// la reprise d'une session IN_PROGRESS via mini-sheet de choix (cf.
// ResumeChoiceSheet utilisé Sprint 37.B F14), et monte la
// BrandOnboardingSheet.

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Sprint 37.F (F60a) — Event-based trigger en complément du URL param.
// Dispatché par BrandOnboardingHeaderCta au clic pour forcer le re-render
// du trigger même si useSearchParams n'est pas réactif (cas observé en
// production sur certains setups Vercel + force-dynamic).
const OPEN_EVENT = 'cfs-open-brand-onboarding'
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
  // Sprint 37.F (F60a) — état event-based en complément du URL param.
  const [eventTriggered, setEventTriggered] = useState(false)
  const triggered =
    autoOpen || eventTriggered || searchParams?.get('onboarding') === 'true'

  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })

  // Sprint 37.F (F60a) — Listener CustomEvent pour ouverture programmatique.
  // Sprint 37.G (F67) — deps vidées (mount-only). Évite remove/re-add à chaque
  // changement de phase qui pouvait manquer des events pendant la transition.
  useEffect(() => {
    function handleOpen() {
      console.info('[onboarding] event received')
      setEventTriggered(true)
    }
    window.addEventListener(OPEN_EVENT, handleOpen)
    return () => window.removeEventListener(OPEN_EVENT, handleOpen)
  }, [])

  const cleanUrl = useCallback(() => {
    // Retire le query param de l'URL sans recharger.
    router.replace('/ma-marque')
  }, [router])

  const close = useCallback(() => {
    setPhase({ kind: 'idle' })
    setEventTriggered(false)
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

  // Sprint 37.G (F67) — Cause exacte du blocage en 'loading' identifiée :
  // l'effet listait `phase.kind` dans ses deps. Quand on appelait
  // `setPhase('loading')` au début de l'IIFE async, le phase changeait,
  // les deps changeaient, React appelait le cleanup de l'effet précédent
  // (cancelled = true). L'IIFE async terminait, voyait cancelled === true,
  // et n'appelait jamais setPhase('sheet'). Phase restait bloqué en
  // 'loading' pour toujours.
  //
  // Fix : retirer phase.kind des deps. Le guard `phase.kind !== 'idle'`
  // au début (lu via closure) suffit à empêcher la double-exécution.
  // L'effet ne se re-fire QUE quand `triggered` change → cleanup unique
  // au moment du démontage → cancelled reste false jusqu'au bout de l'IIFE.
  useEffect(() => {
    if (!triggered || phase.kind !== 'idle') return
    let cancelled = false
    ;(async () => {
      console.info('[onboarding] trigger fired, loading…')
      setPhase({ kind: 'loading' })

      console.info('[onboarding] before_resumable')
      const resumable = await getResumableBrandOnboardingSession()
      console.info('[onboarding] server_returned', { resumable: !!resumable })
      if (cancelled) {
        console.warn('[onboarding] cancelled after resumable check')
        return
      }

      if (resumable) {
        console.info('[onboarding] phase_set_to_resume', { id: resumable.id })
        setPhase({ kind: 'resume-choice', resumable })
        return
      }

      console.info('[onboarding] before_create')
      const res = await createBrandOnboardingSession()
      if (cancelled) {
        console.warn('[onboarding] cancelled after create')
        return
      }
      if (res.ok) {
        console.info('[onboarding] phase_set_to_sheet', { id: res.session.id })
        setPhase({ kind: 'sheet', session: res.session })
      } else {
        console.error('[onboarding] create_session_failed', { reason: res.reason })
        setPhase({ kind: 'idle' })
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggered])

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
