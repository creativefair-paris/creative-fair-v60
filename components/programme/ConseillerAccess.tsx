// Sprint 37 (Lot 4) — Voies d'accès au conseiller depuis /programme.
//
// 4 entrées (doc 09 §8 + fiche d'exécution) :
//   1. CTA primaire dominant "Créer mon prochain plan sur mesure" (A1).
//   2. Bannière auto régénération si programme actuel <14 jours de
//      la fin → "Préparer le prochain" (A2).
//   3. CTA secondaire "Faire le point" (A7).
//   4. CTA secondaire "Préparer ma réunion" (E1).
//
// Hiérarchie /programme (décision Apple #48) : UN SEUL CTA primaire
// visible. Les 3 autres entrées sont secondaires (taille réduite,
// position secondaire). Pas de foire à boutons.
//
// Toutes les routes passent par la même ConseillerSheet (modèle
// unifié décision #49). Pour A1 et A2, on insère d'abord la
// PeriodSelectionSheet pour choisir date_start + date_end.

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConseillerSheet } from '@/components/conseiller/ConseillerSheet'
import { ResumeChoiceSheet } from '@/components/conseiller/ResumeChoiceSheet'
import { WizardImmersiveSheet } from '@/components/conseiller/WizardImmersiveSheet'
import { runConseillerTurn } from '@/app/_actions/run-conseiller-turn'
import {
  findResumableSession,
  type ResumableMatch,
} from '@/app/_actions/find-resumable-session'
import { createProgrammeCreationSession } from '@/app/_actions/wizard-session'
import { PeriodSelectionSheet, type PublicationFrequency } from './PeriodSelectionSheet'
import { JalonGuardDialog } from '@/components/jalons/JalonGuardDialog'
import type { ConseillerContext, ScenarioType } from '@/lib/conseiller/types'
import { scenarioLabel } from '@/lib/conseiller/queries'
import type {
  WizardSessionRow,
  WizardSuggestion,
} from '@/lib/programme-creation/types'

type PilierLite = { id: string; nom: string }

type Props = {
  currentProgrammeEnd?: string | null // YYYY-MM-DD
  publicationFrequency?: PublicationFrequency | null
  // Auto-ouvre la PeriodSelectionSheet au mount si true (cas
  // ?action=create-plan venant du mini-onboarding du conseiller).
  autoOpenCreatePlan?: boolean
  // Sprint 37.B (F16) — catalogue de piliers + suggestions pour le
  // wizard immersif. Alimenté par le Server Component parent
  // (/programme/page.tsx) qui les fetch depuis brand_book.
  pillarsCatalog?: ReadonlyArray<PilierLite>
  businessAnchorSuggestions?: ReadonlyArray<WizardSuggestion>
  // Sprint 37.C (F26) — guard de jalon : si false, le wizard A1 ne
  // s'ouvre pas tant que les fondations critiques ne sont pas posées.
  // Un dialogue de friction propose au pilote de poser sa marque
  // d'abord, avec option "Continuer quand même".
  marqueComplete?: boolean
}

type Phase =
  | { kind: 'closed' }
  | { kind: 'period'; followScenario: 'A1' | 'A2' }
  | {
      kind: 'sheet'
      scenarioType: ScenarioType
      headerLabel: string
      context: ConseillerContext
    }
  // Sprint 37.B (F16) — wizard immersif fullscreen pour A1.
  | {
      kind: 'wizard'
      session: WizardSessionRow
    }
  // Sprint 37.B (F14) — mini-sheet "Tu as déjà commencé sur ce sujet"
  // affichée quand findResumableSession() retourne un match.
  | {
      kind: 'resume-choice'
      match: ResumableMatch
      // Configuration de la sheet à ouvrir si le pilote choisit "Nouvelle".
      newScenario: ScenarioType
      newHeaderLabel: string
      newContext: ConseillerContext
    }

function daysUntil(iso: string): number | null {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((d.getTime() - t0.getTime()) / 86400000)
}

export function ConseillerAccess({
  currentProgrammeEnd,
  publicationFrequency,
  autoOpenCreatePlan = false,
  pillarsCatalog = [],
  businessAnchorSuggestions = [],
  marqueComplete = true,
}: Props) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>({ kind: 'closed' })
  // Sprint 37.C (F26) — dialogue de friction si jalon "marque" non-atteint.
  const [jalonGuardOpen, setJalonGuardOpen] = useState(false)

  // Auto-ouverture depuis ?action=create-plan.
  useEffect(() => {
    if (!autoOpenCreatePlan) return
    if (!marqueComplete) {
      setJalonGuardOpen(true)
      return
    }
    setPhase({ kind: 'period', followScenario: 'A1' })
  }, [autoOpenCreatePlan, marqueComplete])

  const daysLeft = currentProgrammeEnd ? daysUntil(currentProgrammeEnd) : null
  const showRegenerationBanner =
    daysLeft !== null && daysLeft > 0 && daysLeft < 14

  function openCreatePlan() {
    if (!marqueComplete) {
      setJalonGuardOpen(true)
      return
    }
    // Sprint 37.D (F35b) — Le CTA "Créer mon plan" renvoie maintenant
    // vers la page native /programme/create. Le wizard immersif reste
    // accessible depuis là via "Préfère discuter avec le conseiller →".
    router.push('/programme/create')
  }

  function openRegeneration() {
    setPhase({ kind: 'period', followScenario: 'A2' })
  }

  // Helper : avant d'ouvrir une sheet, on cherche une session reprenable.
  // Si match → mini-sheet de choix (F14). Sinon → sheet directement.
  async function openWithResumeCheck(
    scenarioType: ScenarioType,
    headerLabel: string,
    context: ConseillerContext,
  ) {
    const match = await findResumableSession({ scenarioType, context })
    if (match) {
      setPhase({
        kind: 'resume-choice',
        match,
        newScenario: scenarioType,
        newHeaderLabel: headerLabel,
        newContext: context,
      })
    } else {
      setPhase({ kind: 'sheet', scenarioType, headerLabel, context })
    }
  }

  function openBilan() {
    void openWithResumeCheck('A7', 'Faire le point', {})
  }

  function openReunion() {
    void openWithResumeCheck('E1', 'Préparer ma réunion', {})
  }

  // Resume choice handlers (Sprint 37.B F14).
  function handleResume() {
    if (phase.kind !== 'resume-choice') return
    const session = phase.match.session
    setPhase({
      kind: 'sheet',
      scenarioType: session.scenario_type,
      headerLabel: `${scenarioLabel(session.scenario_type)} (reprise)`,
      context: {
        ...(session.context ?? {}),
        continued_from: session.id,
      },
    })
  }

  function handleNewFromResumeChoice() {
    if (phase.kind !== 'resume-choice') return
    setPhase({
      kind: 'sheet',
      scenarioType: phase.newScenario,
      headerLabel: phase.newHeaderLabel,
      context: phase.newContext,
    })
  }

  async function handlePeriodConfirm(params: { start: string; end: string }) {
    if (phase.kind !== 'period') return
    // Sprint 37.B (F16) — pour A1, on ouvre le wizard immersif
    // (création de la session DB en premier). Pour A2 (régénération),
    // on garde le flow ConseillerSheet classique.
    if (phase.followScenario === 'A1') {
      const result = await createProgrammeCreationSession({
        periodStart: params.start,
        periodEnd: params.end,
      })
      if (result.ok) {
        setPhase({ kind: 'wizard', session: result.session })
      } else {
        // Fallback : si la création échoue (réseau, etc.), on tombe sur
        // la sheet classique pour ne pas bloquer le pilote.
        setPhase({
          kind: 'sheet',
          scenarioType: 'A1',
          headerLabel: 'Création de plan',
          context: { period_start: params.start, period_end: params.end },
        })
      }
      return
    }
    setPhase({
      kind: 'sheet',
      scenarioType: phase.followScenario,
      headerLabel: 'Régénération de plan',
      context: { period_start: params.start, period_end: params.end },
    })
  }

  function handleClose() {
    setPhase({ kind: 'closed' })
  }

  return (
    <>
      {/* Sprint 37.C (F26) — JalonGuardDialog (lazy-imported inline). */}
      <JalonGuardDialog
        open={jalonGuardOpen}
        kind="marque"
        primaryHref="/ma-marque?onboarding=true"
        onDismiss={() => setJalonGuardOpen(false)}
        onContinueAnyway={() => {
          setJalonGuardOpen(false)
          setPhase({ kind: 'period', followScenario: 'A1' })
        }}
      />
      <section
        aria-label="Voies d'accès au conseiller"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Bannière auto régénération <14j */}
        {showRegenerationBanner ? (
          <div
            role="region"
            aria-label="Régénération de plan recommandée"
            className="glass-thin"
            style={{
              borderRadius: 14,
              padding: '14px 18px',
              border: '1px solid rgba(0, 122, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <strong
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-system)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--color-label)',
                  marginBottom: 2,
                }}
              >
                Ton plan actuel se termine bientôt.
              </strong>
              <span
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  color: 'var(--color-secondary-label)',
                  lineHeight: 1.4,
                }}
              >
                Encore {daysLeft} jour{daysLeft! > 1 ? 's' : ''} avant la fin.
                Préparer le prochain ?
              </span>
            </div>
            <button
              type="button"
              onClick={openRegeneration}
              style={{
                padding: '8px 16px',
                borderRadius: 18,
                border: 'none',
                background: '#007AFF',
                color: '#FFFFFF',
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Préparer le prochain
            </button>
          </div>
        ) : null}

        {/* Sprint 37.G (F63) — CTAs primary + 2 secondaires retirés.
            Désormais redondants avec la ProgrammeSidebar Sprint 37.F :
            - 'Créer mon prochain plan sur mesure' → sidebar 'Refaire un programme'
            - 'Faire le point' → sidebar Actions Rapides
            - 'Préparer ma réunion' → sidebar Actions Rapides
            Seule la bannière régénération <14j est préservée (info contextuelle).
            Les helpers openCreatePlan/openBilan/openReunion restent disponibles
            pour les voies d'accès autres (auto-open via ?action=create-plan,
            par exemple). */}
      </section>

      {phase.kind === 'period' ? (
        <PeriodSelectionSheet
          open
          onClose={handleClose}
          currentProgrammeEnd={currentProgrammeEnd ?? null}
          publicationFrequency={publicationFrequency ?? null}
          onConfirm={handlePeriodConfirm}
        />
      ) : null}

      {phase.kind === 'sheet' ? (
        <ConseillerSheet
          open
          onClose={handleClose}
          scenarioType={phase.scenarioType}
          headerLabel={phase.headerLabel}
          initialContext={phase.context}
          onSendMessage={runConseillerTurn}
        />
      ) : null}

      {phase.kind === 'resume-choice' ? (
        <ResumeChoiceSheet
          open
          match={phase.match}
          onResume={handleResume}
          onNew={handleNewFromResumeChoice}
          onClose={handleClose}
        />
      ) : null}

      {phase.kind === 'wizard' ? (
        <WizardImmersiveSheet
          session={phase.session}
          pillarsCatalog={pillarsCatalog}
          businessAnchorSuggestions={businessAnchorSuggestions}
          onClose={handleClose}
        />
      ) : null}
    </>
  )
}
