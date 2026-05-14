// Sprint 37.B (F16) — Wizard Step 7 : Confirmation (récap + génération).
//
// Affiche un récap des 6 réponses précédentes en sections + bouton
// final "Générer mon plan". Au clic : completeProgrammeCreationSession
// puis trigger de la génération du programme via la flow existante.

'use client'

import type {
  Cadence,
  CanonicalFormat,
  EngagementLevel,
  MixMode,
  WizardResponses,
} from '@/lib/programme-creation/types'

const MIX_MODE_LABEL: Record<MixMode, string> = {
  full_cf: '100% Creative Fair',
  mixed: 'Mix avec contenu externe',
}
const CADENCE_LABEL: Record<Cadence, string> = {
  discreet: 'Discret (1-2/sem)',
  balanced: 'Équilibré (2-4/sem)',
  dense: 'Dense (5-7/sem)',
}
const ENGAGEMENT_LABEL: Record<EngagementLevel, string> = {
  prudent: 'Prudent',
  pose: 'Posé',
  engage: 'Engagé',
}
const CANONICAL_FORMAT_LABEL: Record<CanonicalFormat, string> = {
  anecdote: 'Anecdote',
  produit: 'Produit',
  evenement: 'Événement',
  coulisses: 'Coulisses',
  manifeste: 'Manifeste',
  question: 'Question',
}

type PilierLite = { id: string; nom: string }

type Props = {
  responses: WizardResponses
  pillarsCatalog: ReadonlyArray<PilierLite>
  onBack: () => void
  onGenerate: () => void
  generating?: boolean
}

export function Step7Confirmation({
  responses,
  pillarsCatalog,
  onBack,
  onGenerate,
  generating,
}: Props) {
  // Sprint 37.E — Nouvelle structure 9 étapes.
  const period = responses['0']
  const mixMode = responses['1']?.mix_mode
  const anchors = responses['2']?.business_anchors ?? []
  const sensitive = responses['3']?.sensitive_topics ?? ''
  // Step 4 (Définir piliers) : skip V1 (F46 différé).
  const rythme = responses['5']
  const objectifs6 = responses['6']
  const formatsRaw = responses['7']
  const formats: ReadonlyArray<CanonicalFormat> =
    formatsRaw && 'formats' in formatsRaw && Array.isArray(formatsRaw.formats)
      ? formatsRaw.formats
      : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Voici le brief que je vais transformer en plan</h2>
        <p style={descStyle}>
          Vérifie que tout est bon. Tu peux revenir en arrière pour ajuster.
        </p>
      </header>

      <dl style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: 0 }}>
        <RecapRow label="Période" value={period ? `${period.period_start} → ${period.period_end}` : '—'} />
        <RecapRow
          label="Mode de construction"
          value={mixMode ? MIX_MODE_LABEL[mixMode] : '—'}
        />
        <RecapRow
          label="Ancres business"
          value={anchors.length > 0 ? anchors.join(' · ') : 'Aucune ancre renseignée'}
        />
        <RecapRow
          label="Sujet sensible à éviter"
          value={sensitive.trim().length > 0 ? sensitive : 'Aucun'}
        />
        <RecapRow
          label="Rythme"
          value={rythme?.cadence ? CADENCE_LABEL[rythme.cadence] : '—'}
        />
        <RecapRow
          label="Niveau d’engagement"
          value={rythme?.engagement ? ENGAGEMENT_LABEL[rythme.engagement] : '—'}
        />
        <RecapRow
          label="Objectif éditorial"
          value={objectifs6?.objectif_editorial?.value ?? 'Aucun'}
        />
        <RecapRow
          label="Objectif business"
          value={objectifs6?.objectif_business?.value ?? 'Aucun'}
        />
        <RecapRow
          label="Formats dominants"
          value={
            formats.length > 0
              ? formats.map((f) => CANONICAL_FORMAT_LABEL[f]).join(' · ')
              : 'Choix laissé au conseiller'
          }
        />
      </dl>

      <footer style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onBack}
          className="btn-choice btn-choice-sm"
          disabled={generating}
        >
          Retour
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? 'Génération…' : 'Générer mon plan'}
        </button>
      </footer>
    </div>
  )
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '12px 14px',
        borderRadius: 12,
        background: 'rgba(0, 0, 0, 0.03)',
      }}
    >
      <dt
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-tertiary-label)',
          margin: 0,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          color: 'var(--color-label)',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {value}
      </dd>
    </div>
  )
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--color-label)',
  margin: 0,
  letterSpacing: '-0.01em',
  lineHeight: 1.3,
}
const descStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--color-secondary-label)',
  margin: 0,
}
