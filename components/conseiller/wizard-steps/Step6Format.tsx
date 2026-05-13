// Sprint 37.B (F16) — Wizard Step 6 : Format dominant des posts.

'use client'

import { useState } from 'react'
import type { DominantFormat } from '@/lib/programme-creation/types'

type Props = {
  initial: DominantFormat | null
  onBack: () => void
  onSave: (value: DominantFormat) => void
  saving?: boolean
}

const OPTIONS: ReadonlyArray<{ value: DominantFormat; label: string; description: string }> = [
  {
    value: 'carousel',
    label: 'Carrousel',
    description: 'Pour des séries, des démonstrations, des "avant / après".',
  },
  {
    value: 'reel',
    label: 'Reel',
    description: 'Vidéos courtes verticales. Pour les coulisses et le mouvement.',
  },
  {
    value: 'post',
    label: 'Post unique',
    description: 'Une image, une caption. Le plus dépouillé.',
  },
  {
    value: 'mix',
    label: 'Mix',
    description: 'Le conseiller varie selon le pilier mobilisé.',
  },
]

export function Step6Format({ initial, onBack, onSave, saving }: Props) {
  const [value, setValue] = useState<DominantFormat | null>(initial)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Quel format dominant pour les posts ?</h2>
        <p style={descStyle}>
          Le conseiller pondère le format selon ton choix. Tu peux toujours
          ajuster post par post après.
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
                <span style={{ fontSize: 13, color: 'var(--color-secondary-label)', lineHeight: 1.5 }}>
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
