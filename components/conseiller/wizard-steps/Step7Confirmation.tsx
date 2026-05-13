// Sprint 37.B (F16) — Wizard Step 7 : Confirmation (récap + génération).
//
// Affiche un récap des 6 réponses précédentes en sections + bouton
// final "Générer mon plan". Au clic : completeProgrammeCreationSession
// puis trigger de la génération du programme via la flow existante.

'use client'

import type {
  RiskCursor,
  DominantFormat,
  WizardResponses,
} from '@/lib/programme-creation/types'

const RISK_LABEL: Record<RiskCursor, string> = {
  safe: 'Safe',
  moderate: 'Modéré',
  risky: 'Risqué',
}
const FORMAT_LABEL: Record<DominantFormat, string> = {
  carousel: 'Carrousel',
  reel: 'Reel',
  post: 'Post unique',
  mix: 'Mix',
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
  const period = responses['0']
  const anchors = responses['1']?.business_anchors ?? []
  const sensitive = responses['2']?.sensitive_topics ?? ''
  const pillars = responses['3']?.pillars ?? {}
  const risk = responses['4']?.risk_cursor
  // Sprint 37.C (F19) — réponse étape 5 = objectifs ; format passe à idx 6.
  const objectifs = responses['5']?.objectifs_editoriaux ?? []
  const format = responses['6']?.format

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
          label="Ancres business"
          value={anchors.length > 0 ? anchors.join(' · ') : 'Aucune ancre renseignée'}
        />
        <RecapRow
          label="Sujet sensible à éviter"
          value={sensitive.trim().length > 0 ? sensitive : 'Aucun'}
        />
        <RecapRow
          label="Piliers mobilisés"
          value={
            Object.keys(pillars).length > 0
              ? Object.entries(pillars)
                  .map(([id, w]) => {
                    const p = pillarsCatalog.find((c) => c.id === id)
                    return `${p?.nom ?? id} (${w}%)`
                  })
                  .join(' · ')
              : 'Choix laissé au conseiller'
          }
        />
        <RecapRow label="Curseur de risque" value={risk ? RISK_LABEL[risk] : '—'} />
        <RecapRow
          label="Objectifs éditoriaux"
          value={
            objectifs.length > 0
              ? objectifs.map((o) => o.value).join(' · ')
              : 'Aucun objectif renseigné'
          }
        />
        <RecapRow label="Format dominant" value={format ? FORMAT_LABEL[format] : '—'} />
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
