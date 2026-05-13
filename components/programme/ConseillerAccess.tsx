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
import { ConseillerSheet } from '@/components/conseiller/ConseillerSheet'
import { runConseillerTurn } from '@/app/_actions/run-conseiller-turn'
import { PeriodSelectionSheet, type PublicationFrequency } from './PeriodSelectionSheet'
import type { ConseillerContext, ScenarioType } from '@/lib/conseiller/types'

type Props = {
  currentProgrammeEnd?: string | null // YYYY-MM-DD
  publicationFrequency?: PublicationFrequency | null
  // Auto-ouvre la PeriodSelectionSheet au mount si true (cas
  // ?action=create-plan venant du mini-onboarding du conseiller).
  autoOpenCreatePlan?: boolean
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
}: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: 'closed' })

  // Auto-ouverture depuis ?action=create-plan.
  useEffect(() => {
    if (!autoOpenCreatePlan) return
    setPhase({ kind: 'period', followScenario: 'A1' })
  }, [autoOpenCreatePlan])

  const daysLeft = currentProgrammeEnd ? daysUntil(currentProgrammeEnd) : null
  const showRegenerationBanner =
    daysLeft !== null && daysLeft > 0 && daysLeft < 14

  function openCreatePlan() {
    setPhase({ kind: 'period', followScenario: 'A1' })
  }

  function openRegeneration() {
    setPhase({ kind: 'period', followScenario: 'A2' })
  }

  function openBilan() {
    setPhase({
      kind: 'sheet',
      scenarioType: 'A7',
      headerLabel: 'Faire le point',
      context: {},
    })
  }

  function openReunion() {
    setPhase({
      kind: 'sheet',
      scenarioType: 'E1',
      headerLabel: 'Préparer ma réunion',
      context: {},
    })
  }

  function handlePeriodConfirm(params: { start: string; end: string }) {
    if (phase.kind !== 'period') return
    setPhase({
      kind: 'sheet',
      scenarioType: phase.followScenario,
      headerLabel:
        phase.followScenario === 'A1' ? 'Création de plan' : 'Régénération de plan',
      context: { period_start: params.start, period_end: params.end },
    })
  }

  function handleClose() {
    setPhase({ kind: 'closed' })
  }

  return (
    <>
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

        {/* CTA primaire dominant */}
        <button
          type="button"
          onClick={openCreatePlan}
          className="glass-regular cfs-conseiller-cta-primary"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8,
            padding: '20px 24px',
            borderRadius: 16,
            border: 'none',
            background: 'rgba(31, 73, 55, 0.04)',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'var(--font-system)',
            color: 'var(--color-label)',
            transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-accent)',
            }}
          >
            Avec le conseiller
          </span>
          <span style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>
            Créer mon prochain plan sur mesure
          </span>
          <span
            style={{
              fontSize: 13,
              color: 'var(--color-secondary-label)',
              lineHeight: 1.45,
            }}
          >
            Tu choisis la période, le conseiller construit avec toi un plan
            aligné sur tes piliers et ton calendrier business.
          </span>
        </button>

        {/* CTAs secondaires */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={openBilan}
            className="cfs-conseiller-cta-secondary"
            style={{
              flex: 1,
              minWidth: 220,
              padding: '12px 18px',
              borderRadius: 12,
              border: '1px solid var(--color-separator)',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--font-system)',
              color: 'var(--color-label)',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              transition: 'background-color 200ms ease-out',
            }}
          >
            <span>Faire le point</span>
            <span
              style={{
                fontSize: 12,
                color: 'var(--color-tertiary-label)',
                fontWeight: 400,
              }}
            >
              Bilan exportable pour la direction
            </span>
          </button>
          <button
            type="button"
            onClick={openReunion}
            className="cfs-conseiller-cta-secondary"
            style={{
              flex: 1,
              minWidth: 220,
              padding: '12px 18px',
              borderRadius: 12,
              border: '1px solid var(--color-separator)',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--font-system)',
              color: 'var(--color-label)',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              transition: 'background-color 200ms ease-out',
            }}
          >
            <span>Préparer ma réunion</span>
            <span
              style={{
                fontSize: 12,
                color: 'var(--color-tertiary-label)',
                fontWeight: 400,
              }}
            >
              3 réponses prêtes à parler
            </span>
          </button>
        </div>

        <style>{`
          .cfs-conseiller-cta-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.10);
          }
          .cfs-conseiller-cta-secondary:hover {
            background-color: rgba(0,0,0,0.03);
          }
          @media (prefers-reduced-motion: reduce) {
            .cfs-conseiller-cta-primary,
            .cfs-conseiller-cta-secondary {
              transition: none !important;
              transform: none !important;
            }
          }
        `}</style>
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
    </>
  )
}
