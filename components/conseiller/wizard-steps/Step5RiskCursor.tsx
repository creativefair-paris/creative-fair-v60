// Sprint 37.B (F16) — Wizard Step 5 : Curseur de risque éditorial.

'use client'

import { useState } from 'react'
import type { RiskCursor } from '@/lib/programme-creation/types'

type Props = {
  initial: RiskCursor | null
  onBack: () => void
  onSave: (value: RiskCursor) => void
  saving?: boolean
}

const OPTIONS: ReadonlyArray<{ value: RiskCursor; label: string; description: string }> = [
  {
    value: 'safe',
    label: 'Safe',
    description: 'Tu restes sur ton territoire signature. Pas de prise de risque éditoriale.',
  },
  {
    value: 'moderate',
    label: 'Modéré',
    description: '1 à 2 posts qui sortent légèrement de ton confort. Le reste reste tenu.',
  },
  {
    value: 'risky',
    label: 'Risqué',
    description: '3 ou 4 posts en exploration plus libre. Pour tester un nouvel angle.',
  },
]

export function Step5RiskCursor({ initial, onBack, onSave, saving }: Props) {
  const [value, setValue] = useState<RiskCursor | null>(initial)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Quel curseur de risque éditorial pour ce mois ?</h2>
        <p style={descStyle}>
          Le conseiller adapte le pourcentage de posts hors zone de confort.
        </p>
      </header>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.value
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => setValue(opt.value)}
                aria-pressed={isSelected}
                className="btn-choice"
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  textAlign: 'left',
                  background: isSelected ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
                  borderColor: isSelected ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
                  padding: '14px 18px',
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600 }}>{opt.label}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 400,
                    color: 'var(--color-secondary-label)',
                    lineHeight: 1.5,
                  }}
                >
                  {opt.description}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <footer style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={onBack} className="btn-choice btn-choice-sm">
          Retour
        </button>
        <button
          type="button"
          onClick={() => value && onSave(value)}
          disabled={value === null || saving}
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
const descStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--color-secondary-label)',
  margin: 0,
}
