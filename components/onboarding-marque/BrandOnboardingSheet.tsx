// Sprint 37.C (F18) — Wizard guidé Ma Marque (14 étapes).
//
// Pattern hérité du WizardImmersiveSheet (F16) : sheet immersive
// fullscreen, header sticky avec croix + titre + indicateur "N / 14",
// barre de progression, footer Retour / Suivant géré par chaque step.
//
// Au clic croix : ExitConfirmDialog. La session reste IN_PROGRESS si
// le pilote sort sans valider (responses persistées au pas-à-pas).

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardProgressBar } from '@/components/conseiller/WizardProgressBar'
import { ExitConfirmDialog } from '@/components/conseiller/ExitConfirmDialog'
import {
  updateBrandOnboardingStep,
  completeBrandOnboarding,
} from '@/app/_actions/brand-onboarding'
import {
  BRAND_ONBOARDING_TOTAL_STEPS,
  BRAND_ONBOARDING_STEP_LABELS,
  CRITICAL_STEP_INDICES,
  type BrandOnboardingResponses,
  type BrandOnboardingSessionRow,
  type BrandOnboardingStepIndex,
} from '@/lib/brand-onboarding/types'
import { BrandOnboardingStep } from './BrandOnboardingStep'

type Props = {
  session: BrandOnboardingSessionRow
  onClose: () => void
}

export function BrandOnboardingSheet({ session: initial, onClose }: Props) {
  const router = useRouter()
  const [session, setSession] = useState<BrandOnboardingSessionRow>(initial)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowExitDialog(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const goBack = useCallback(() => {
    setSession((s) => ({ ...s, current_step: Math.max(0, s.current_step - 1) }))
  }, [])

  const saveStep = useCallback(
    async <K extends keyof BrandOnboardingResponses>(
      stepIndex: number,
      key: K,
      response: BrandOnboardingResponses[K],
    ) => {
      setSaving(true)
      setError(null)
      try {
        const res = await updateBrandOnboardingStep({
          sessionId: session.id,
          stepIndex,
          response,
          advanceToNext: true,
        })
        if (!res.ok) {
          setError(res.reason)
          return
        }
        setSession(res.session)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setSaving(false)
      }
    },
    [session.id],
  )

  const handleComplete = useCallback(async () => {
    setSaving(true)
    try {
      await completeBrandOnboarding({ sessionId: session.id })
      router.push('/ma-marque')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setSaving(false)
    }
  }, [session.id, router, onClose])

  // Compteur de réponses pour l'ExitConfirmDialog.
  const stepsAnswered = Object.keys(session.responses ?? {}).length

  // Détection mode "partiel-completable" : les fondations critiques
  // (idx 0, 1, 3, 5 par défaut) sont posées → on propose à l'utilisateur
  // de sortir + sauvegarder partiellement.
  const criticalAnswered = CRITICAL_STEP_INDICES.every(
    (idx) => session.responses && (session.responses as Record<string, unknown>)[String(idx)],
  )

  const currentStep = session.current_step as BrandOnboardingStepIndex

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-onboarding-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        // Sprint 37.J (F83) — Background crème uniforme + halos signature
        // Creative Fair (rose+lilas+bleu+orange pastels) injectés DANS le
        // wizard pour qu'ils soient visibles malgré le z-index 1200.
        // Sprint 37.I (F81) gradient plat est conservé en fallback derrière
        // les halos via une couleur de fond crème.
        background: '#FBFAF7',
        overflow: 'hidden',
        animation: 'cfs-wizard-in 280ms ease-out',
      }}
    >
      {/* Sprint 37.J (F83) — Halos signature Creative Fair injectés DANS
          le wizard. Les classes .bg-halo-1..6 sont définies dans
          styles/liquid-glass.css (position: fixed, z-index: 0). Le contenu
          ci-dessous a z-index: 1 ou 2 pour passer au-dessus. */}
      <div className="bg-halo bg-halo-1" aria-hidden="true" />
      <div className="bg-halo bg-halo-2" aria-hidden="true" />
      <div className="bg-halo bg-halo-3" aria-hidden="true" />
      <div className="bg-halo bg-halo-4" aria-hidden="true" />
      <div className="bg-halo bg-halo-5" aria-hidden="true" />
      <div className="bg-halo bg-halo-6" aria-hidden="true" />
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '18px 22px',
          // Sprint 37.I (F81) — Header semi-translucide sur le gradient
          // (rgba blanc-cassé léger + blur subtle pour effet liquid glass).
          background: 'rgba(251, 250, 247, 0.85)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <button
          type="button"
          onClick={() => setShowExitDialog(true)}
          aria-label="Fermer l'onboarding"
          style={closeBtnStyle}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 4 L14 14 M14 4 L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={subTitleStyle}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 4, background: '#5856D6', display: 'inline-block' }} />
            Ma Marque
          </span>
          <h1 id="brand-onboarding-title" style={titleStyle}>
            {BRAND_ONBOARDING_STEP_LABELS[currentStep]}
          </h1>
        </div>
        <span
          aria-live="polite"
          style={{
            flexShrink: 0,
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: 'var(--color-tertiary-label)',
            minWidth: 56,
            textAlign: 'right',
          }}
        >
          {currentStep + 1} / {BRAND_ONBOARDING_TOTAL_STEPS}
        </span>
      </header>

      <WizardProgressBar
        currentStep={currentStep}
        totalSteps={BRAND_ONBOARDING_TOTAL_STEPS}
      />

      <main
        style={{
          // Sprint 37.J (F83) — position: relative + zIndex: 1 pour passer
          // au-dessus des halos signature (z-index: 0).
          position: 'relative',
          zIndex: 1,
          flex: 1,
          overflowY: 'auto',
          padding: '40px 28px 80px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 640 }}>
          {error ? (
            <p
              role="alert"
              style={{
                marginBottom: 16,
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                color: '#C0392B',
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(192, 57, 43, 0.06)',
              }}
            >
              {error}
            </p>
          ) : null}

          <BrandOnboardingStep
            stepIndex={currentStep}
            responses={session.responses}
            saving={saving}
            isLastStep={currentStep === BRAND_ONBOARDING_TOTAL_STEPS - 1}
            criticalAnswered={criticalAnswered}
            onBack={goBack}
            onSave={(idx, key, value) =>
              saveStep(
                idx,
                key as keyof BrandOnboardingResponses,
                value as BrandOnboardingResponses[keyof BrandOnboardingResponses],
              )
            }
            onComplete={handleComplete}
          />
        </div>
      </main>

      <ExitConfirmDialog
        open={showExitDialog}
        stepsAnswered={stepsAnswered}
        totalSteps={BRAND_ONBOARDING_TOTAL_STEPS}
        onResumeLater={() => {
          setShowExitDialog(false)
          onClose()
        }}
        onContinue={() => setShowExitDialog(false)}
      />

      <style>{`
        @keyframes cfs-wizard-in {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

const closeBtnStyle: React.CSSProperties = {
  flexShrink: 0,
  width: 32,
  height: 32,
  borderRadius: 16,
  border: 'none',
  background: 'rgba(120, 120, 128, 0.12)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-label)',
}

const subTitleStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-tertiary-label)',
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--color-label)',
  margin: 0,
  lineHeight: 1.3,
}
