// Sprint 37.E (F39+F40) — Wizard Step 5 : Rythme + Niveau d'engagement.
//
// Fusion de l'ancien "Curseur de risque" + nouveau "Cadence" sur une
// seule étape avec 2 sections côte à côte (ou empilées sur mobile).

'use client'

import { useState } from 'react'
import type {
  Cadence,
  EngagementLevel,
} from '@/lib/programme-creation/types'

type Props = {
  initialCadence: Cadence | null
  initialEngagement: EngagementLevel | null
  onBack: () => void
  onSave: (params: { cadence: Cadence; engagement: EngagementLevel }) => void
  saving?: boolean
}

const CADENCE_OPTIONS: ReadonlyArray<{ value: Cadence; label: string; desc: string }> = [
  { value: 'discreet', label: 'Discret', desc: '1-2 posts par semaine' },
  { value: 'balanced', label: 'Équilibré', desc: '2-4 posts par semaine' },
  { value: 'dense', label: 'Dense', desc: '5-7 posts par semaine' },
]

const ENGAGEMENT_OPTIONS: ReadonlyArray<{ value: EngagementLevel; label: string; desc: string }> = [
  { value: 'prudent', label: 'Prudent', desc: 'On évite les sujets qui clivent.' },
  { value: 'pose', label: 'Posé', desc: 'On prend position calmement.' },
  { value: 'engage', label: 'Engagé', desc: 'On assume les prises de position fortes.' },
]

export function Step5RythmeEngagement({
  initialCadence,
  initialEngagement,
  onBack,
  onSave,
  saving,
}: Props) {
  const [cadence, setCadence] = useState<Cadence | null>(initialCadence ?? 'balanced')
  const [engagement, setEngagement] = useState<EngagementLevel | null>(
    initialEngagement ?? 'pose',
  )

  const canSave = cadence !== null && engagement !== null && !saving

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Rythme et niveau d&apos;engagement</h2>
        <p style={descStyle}>
          Définis ta cadence de publication et le ton éditorial pour cette période.
        </p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={subTitleStyle}>Cadence de publication</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CADENCE_OPTIONS.map((opt) => {
            const sel = cadence === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCadence(opt.value)}
                aria-pressed={sel}
                className="btn-choice"
                style={{
                  flex: 1,
                  minWidth: 140,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                  padding: '12px 14px',
                  textAlign: 'left',
                  background: sel ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
                  borderColor: sel ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</span>
                <span style={{ fontSize: 12, color: 'var(--color-secondary-label)' }}>
                  {opt.desc}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={subTitleStyle}>Niveau d&apos;engagement éditorial</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ENGAGEMENT_OPTIONS.map((opt) => {
            const sel = engagement === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEngagement(opt.value)}
                aria-pressed={sel}
                className="btn-choice"
                style={{
                  flex: 1,
                  minWidth: 140,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                  padding: '12px 14px',
                  textAlign: 'left',
                  background: sel ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
                  borderColor: sel ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</span>
                <span style={{ fontSize: 12, color: 'var(--color-secondary-label)' }}>
                  {opt.desc}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <footer style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={onBack} className="btn-choice btn-choice-sm">
          Retour
        </button>
        <button
          type="button"
          onClick={() => cadence && engagement && onSave({ cadence, engagement })}
          disabled={!canSave}
          className="btn-primary"
        >
          {saving ? 'Enregistrement…' : 'Suivant'}
        </button>
      </footer>
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
const subTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 13,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-tertiary-label)',
  margin: 0,
}
const descStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--color-secondary-label)',
  margin: 0,
}
