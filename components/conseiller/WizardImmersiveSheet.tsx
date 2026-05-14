// Sprint 37.B (F16) — Sheet immersive du wizard A1.
//
// Mode fullscreen 100vw × 100vh (pas la marge 16px habituelle de la
// ConseillerSheet). border-radius 0. Header sticky avec pastille +
// titre + indicateur "N / 7" + croix. WizardProgressBar 3px sous le
// header. Body = StepN selon current_step. Footer géré par chaque
// step (boutons Retour / Suivant).
//
// Au clic croix : ExitConfirmDialog. Anti-paternaliste : la session
// reste IN_PROGRESS (responses persistées au pas-à-pas), sortie autorisée.

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardProgressBar } from './WizardProgressBar'
import { ExitConfirmDialog } from './ExitConfirmDialog'
import { Step1Period } from './wizard-steps/Step1Period'
import { Step2BusinessAnchors } from './wizard-steps/Step2BusinessAnchors'
import { Step3SensitiveTopics } from './wizard-steps/Step3SensitiveTopics'
import { Step4Pillars } from './wizard-steps/Step4Pillars'
import { Step5RiskCursor } from './wizard-steps/Step5RiskCursor'
import { Step6Objectifs } from './wizard-steps/Step6Objectifs'
import { Step7Formats } from './wizard-steps/Step7Formats'
import { Step7Confirmation } from './wizard-steps/Step7Confirmation'
import {
  updateProgrammeCreationSessionStep,
  completeProgrammeCreationSession,
} from '@/app/_actions/wizard-session'
import { generatePlanFromWizardSession } from '@/app/_actions/generate-plan-from-wizard'
import {
  WIZARD_TOTAL_STEPS,
  type CanonicalFormat,
  type ObjectifEditorial,
  type RiskCursor,
  type WizardResponses,
  type WizardSessionRow,
  type WizardStepIndex,
  type WizardSuggestion,
} from '@/lib/programme-creation/types'

type PilierLite = { id: string; nom: string }

type Props = {
  session: WizardSessionRow
  // Catalogue des piliers du pilote (depuis brand.piliers_narratifs).
  pillarsCatalog: ReadonlyArray<PilierLite>
  // Suggestions pré-remplies pour Step 2 (ancres business).
  businessAnchorSuggestions: ReadonlyArray<WizardSuggestion>
  // Sprint 37.C (F19) — suggestions pour l'étape 6 Objectifs éditoriaux.
  objectifsSuggestions?: ReadonlyArray<ObjectifEditorial>
  onClose: () => void
}

export function WizardImmersiveSheet({
  session: initialSession,
  pillarsCatalog,
  businessAnchorSuggestions,
  objectifsSuggestions = [],
  onClose,
}: Props) {
  const router = useRouter()
  const [session, setSession] = useState<WizardSessionRow>(initialSession)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Esc → confirm exit
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
    async <K extends keyof WizardResponses>(
      stepIndex: WizardStepIndex,
      key: K,
      value: WizardResponses[K],
    ) => {
      setSaving(true)
      setError(null)
      try {
        const response = value as WizardResponses[keyof WizardResponses]
        const result = await updateProgrammeCreationSessionStep({
          sessionId: session.id,
          stepIndex,
          response,
          advance: true,
        })
        if (!result.ok) {
          setError(result.reason)
          return
        }
        // discard key (used only for typing convenience)
        void key
        setSession(result.session)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setSaving(false)
      }
    },
    [session.id],
  )

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    setError(null)
    // Sprint 37.E (F37) — timeout fallback client. Si après 85s la server
    // action ne répond pas (kill infra, network drop, etc.), on force
    // l'arrêt du spinner et on affiche un message clair plutôt que de
    // laisser le pilote bloqué indéfiniment.
    const watchdog = setTimeout(() => {
      setError(
        "La génération prend plus de temps que prévu. Réessaie dans quelques secondes ou contacte le support.",
      )
      setGenerating(false)
      console.error('[wizard] handleGenerate watchdog timeout (85s)')
    }, 85_000)
    try {
      console.info('[wizard] handleGenerate start', { sessionId: session.id })
      // Sprint 37.D (F34+F36) — pipeline complet :
      // (1) appelle Anthropic + parse JSON + insert programme/posts
      const genRes = await generatePlanFromWizardSession(session.id)
      console.info('[wizard] generatePlan resolved', { ok: genRes.ok })
      if (!genRes.ok) {
        setError(genRes.reason)
        return
      }
      // (2) marque la session COMPLETED
      const result = await completeProgrammeCreationSession(session.id)
      if (!result.ok) {
        setError(result.reason ?? 'Échec de la finalisation de la session')
        return
      }
      // (3) redirige vers /programme avec newPlan en query param
      router.push(`/programme?newPlan=${genRes.programmeId}`)
      onClose()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de générer le plan. Réessaie dans quelques secondes.',
      )
      console.error('[wizard] generate plan failed:', err)
    } finally {
      clearTimeout(watchdog)
      setGenerating(false)
    }
  }, [session.id, router, onClose])

  // Compteur de réponses pour l'ExitConfirmDialog.
  const stepsAnswered = Object.keys(session.responses ?? {}).length

  const currentStep = session.current_step as WizardStepIndex

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-immersive-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(251, 250, 247, 0.98)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        animation: 'cfs-wizard-in 280ms ease-out',
      }}
    >
      {/* Header sticky : croix gauche + titre centre + step indicator */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '18px 22px',
          background: 'rgba(251, 250, 247, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <button
          type="button"
          onClick={() => setShowExitDialog(true)}
          aria-label="Fermer le wizard"
          style={{
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
          }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 4 L14 14 M14 4 L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-system)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-tertiary-label)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: '#007AFF',
                display: 'inline-block',
              }}
            />
            Création de plan
          </span>
          <h1
            id="wizard-immersive-title"
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--color-label)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Création de ton programme
          </h1>
        </div>
        <span
          style={{
            flexShrink: 0,
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-tertiary-label)',
            fontVariantNumeric: 'tabular-nums',
            minWidth: 60,
            textAlign: 'right',
          }}
        >
          {currentStep + 1} / {WIZARD_TOTAL_STEPS}
        </span>
      </header>

      <WizardProgressBar currentStep={currentStep} totalSteps={WIZARD_TOTAL_STEPS} />

      <main
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '32px 24px 48px 24px',
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {generating ? (
            <section
              role="status"
              aria-live="polite"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                padding: '60px 20px',
                textAlign: 'center',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '3px solid rgba(0, 122, 255, 0.15)',
                  borderTopColor: '#007AFF',
                  animation: 'cfs-spin 800ms linear infinite',
                }}
              />
              <p
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--color-label)',
                  margin: 0,
                  maxWidth: 320,
                  lineHeight: 1.5,
                }}
              >
                Je construis ton plan. Ça peut prendre 30 secondes.
              </p>
              <style>{`
                @keyframes cfs-spin { to { transform: rotate(360deg); } }
                @media (prefers-reduced-motion: reduce) {
                  [role="status"] span { animation: none !important; }
                }
              `}</style>
            </section>
          ) : null}

          {!generating && error ? (
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

          {!generating ? renderStep({
            session,
            pillarsCatalog,
            businessAnchorSuggestions,
            objectifsSuggestions,
            currentStep,
            saving,
            generating,
            onBack: goBack,
            onSavePeriod: (params) =>
              saveStep(0, '0', { period_start: params.start, period_end: params.end }),
            onSaveAnchors: (anchors) => saveStep(1, '1', { business_anchors: anchors }),
            onSaveSensitive: (topics) => saveStep(2, '2', { sensitive_topics: topics }),
            onSavePillars: (pillars) => saveStep(3, '3', { pillars }),
            onSaveRisk: (cursor) => saveStep(4, '4', { risk_cursor: cursor }),
            // Sprint 37.C (F19) — Étape 5 = Objectifs éditoriaux.
            onSaveObjectifs: (objectifs) =>
              saveStep(5, '5', { objectifs_editoriaux: objectifs }),
            // Sprint 37.D (F29) — 1-3 formats canoniques en multi-select.
            onSaveFormats: (formats) => saveStep(6, '6', { formats }),
            onGenerate: handleGenerate,
          }) : null}
        </div>
      </main>

      <ExitConfirmDialog
        open={showExitDialog}
        stepsAnswered={stepsAnswered}
        totalSteps={WIZARD_TOTAL_STEPS}
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

type RenderStepArgs = {
  session: WizardSessionRow
  pillarsCatalog: ReadonlyArray<PilierLite>
  businessAnchorSuggestions: ReadonlyArray<WizardSuggestion>
  objectifsSuggestions: ReadonlyArray<ObjectifEditorial>
  currentStep: WizardStepIndex
  saving: boolean
  generating: boolean
  onBack: () => void
  onSavePeriod: (params: { start: string; end: string }) => void
  onSaveAnchors: (anchors: string[]) => void
  onSaveSensitive: (topics: string) => void
  onSavePillars: (pillars: Record<string, number>) => void
  onSaveRisk: (cursor: RiskCursor) => void
  onSaveObjectifs: (objectifs: ReadonlyArray<ObjectifEditorial>) => void
  onSaveFormats: (formats: ReadonlyArray<CanonicalFormat>) => void
  onGenerate: () => void
}

function renderStep(args: RenderStepArgs) {
  const r = args.session.responses ?? {}
  switch (args.currentStep) {
    case 0:
      return (
        <Step1Period
          initialStart={r['0']?.period_start ?? ''}
          initialEnd={r['0']?.period_end ?? ''}
          onSave={args.onSavePeriod}
          saving={args.saving}
        />
      )
    case 1:
      return (
        <Step2BusinessAnchors
          suggestions={args.businessAnchorSuggestions}
          initialAnchors={r['1']?.business_anchors ?? []}
          onBack={args.onBack}
          onSave={args.onSaveAnchors}
          saving={args.saving}
        />
      )
    case 2:
      return (
        <Step3SensitiveTopics
          initialTopics={r['2']?.sensitive_topics ?? ''}
          onBack={args.onBack}
          onSave={args.onSaveSensitive}
          saving={args.saving}
        />
      )
    case 3:
      return (
        <Step4Pillars
          piliers={args.pillarsCatalog}
          initialWeights={r['3']?.pillars ?? {}}
          onBack={args.onBack}
          onSave={args.onSavePillars}
          saving={args.saving}
        />
      )
    case 4:
      return (
        <Step5RiskCursor
          initial={r['4']?.risk_cursor ?? null}
          onBack={args.onBack}
          onSave={args.onSaveRisk}
          saving={args.saving}
        />
      )
    case 5:
      // Sprint 37.C (F19) — nouvelle étape Objectifs éditoriaux.
      return (
        <Step6Objectifs
          initial={r['5']?.objectifs_editoriaux ?? []}
          suggestions={args.objectifsSuggestions}
          onBack={args.onBack}
          onSave={args.onSaveObjectifs}
          saving={args.saving}
        />
      )
    case 6: {
      // Sprint 37.D (F29) — Step7Formats. On lit 'formats' (nouveau) ou
      // legacy 'format' single (compat IN_PROGRESS sessions ancien wizard).
      const raw = r['6']
      let initialFormats: ReadonlyArray<CanonicalFormat> = []
      if (raw && 'formats' in raw && Array.isArray(raw.formats)) {
        initialFormats = raw.formats
      }
      return (
        <Step7Formats
          initial={initialFormats}
          onBack={args.onBack}
          onSave={args.onSaveFormats}
          saving={args.saving}
        />
      )
    }
    case 7:
      return (
        <Step7Confirmation
          responses={r}
          pillarsCatalog={args.pillarsCatalog}
          onBack={args.onBack}
          onGenerate={args.onGenerate}
          generating={args.generating}
        />
      )
    default:
      return null
  }
}
