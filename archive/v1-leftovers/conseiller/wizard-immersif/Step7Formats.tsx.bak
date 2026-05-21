// Sprint 37.D (F29) — Wizard Step 7 : Formats canoniques dominants.
//
// Multi-select 1-3 formats parmi les 6 canoniques. Pastille colorée +
// description courte. Pas de champ libre (les 6 sont exhaustifs V1).

'use client'

import { useState } from 'react'
import type { CanonicalFormat } from '@/lib/programme-creation/types'

type Props = {
  initial: ReadonlyArray<CanonicalFormat>
  onBack: () => void
  onSave: (value: ReadonlyArray<CanonicalFormat>) => void
  saving?: boolean
}

const FORMATS: ReadonlyArray<{
  value: CanonicalFormat
  label: string
  description: string
  example: string
  color: string
}> = [
  {
    value: 'anecdote',
    label: 'Anecdote',
    description: 'Raconter une histoire qui sert un pilier.',
    example: 'Ex. "Comment le logo Nike a failli ne jamais exister."',
    color: '#007AFF',
  },
  {
    value: 'produit',
    label: 'Produit',
    description: 'Mettre en avant une création avec son histoire.',
    example: 'Ex. "Cette pièce est née d\'un accident d\'atelier en 1984."',
    color: '#34C759',
  },
  {
    value: 'evenement',
    label: 'Événement',
    description: 'Annoncer une date qui compte.',
    example: 'Ex. "Vernissage galerie Maillol jeudi 7 mars, 18h."',
    color: '#FF9500',
  },
  {
    value: 'coulisses',
    label: 'Coulisses',
    description: 'Montrer le geste, l\'atelier, la fabrication.',
    example: 'Ex. Reel 20s d\'un sertissage à la main.',
    color: '#AF52DE',
  },
  {
    value: 'manifeste',
    label: 'Manifeste',
    description: 'Affirmer une position forte.',
    example: 'Ex. "Pourquoi on refuse les pierres synthétiques."',
    color: '#FF3B30',
  },
  {
    value: 'question',
    label: 'Question',
    description: 'Faire réagir la communauté.',
    example: 'Ex. "Quelle pièce d\'archives tu aimerais voir relancée ?"',
    color: '#5856D6',
  },
]

const MAX_SELECT = 3

export function Step7Formats({ initial, onBack, onSave, saving }: Props) {
  const [selected, setSelected] = useState<ReadonlyArray<CanonicalFormat>>(initial)

  function toggle(f: CanonicalFormat) {
    if (selected.includes(f)) {
      setSelected(selected.filter((x) => x !== f))
    } else if (selected.length < MAX_SELECT) {
      setSelected([...selected, f])
    }
  }

  const canSave = selected.length > 0 && !saving

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Quels formats dominants pour cette période ?</h2>
        <p style={descStyle}>
          Choisis 1 à 3 formats. Le conseiller adaptera la répartition.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
        className="cfs-formats-grid"
      >
        {FORMATS.map((f) => {
          const isSelected = selected.includes(f.value)
          const isDisabled = !isSelected && selected.length >= MAX_SELECT
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => toggle(f.value)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={`format-card${isSelected ? ' is-selected' : ''}`}
              style={{
                background: isSelected
                  ? 'rgba(0, 122, 255, 0.06)'
                  : 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                border: isSelected
                  ? '1px solid rgba(0, 122, 255, 0.3)'
                  : '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: 14,
                padding: 16,
                textAlign: 'left',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 180ms ease-out',
                opacity: isDisabled ? 0.5 : 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxShadow: isSelected
                  ? '0 0 0 1px rgba(0, 122, 255, 0.2)'
                  : 'none',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontFamily: 'var(--font-system)',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#FFFFFF',
                  background: f.color,
                }}
              >
                {f.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'rgba(0, 0, 0, 0.7)',
                }}
              >
                {f.description}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 11,
                  lineHeight: 1.45,
                  color: 'var(--color-tertiary-label)',
                  fontStyle: 'italic',
                  marginTop: 2,
                }}
              >
                {f.example}
              </span>
            </button>
          )
        })}
      </div>

      <footer style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={onBack} className="btn-choice btn-choice-sm">
          Retour
        </button>
        <button
          type="button"
          onClick={() => onSave(selected)}
          disabled={!canSave}
          className="btn-primary"
        >
          {saving ? 'Enregistrement…' : 'Suivant'}
        </button>
      </footer>

      <style>{`
        @media (max-width: 560px) {
          .cfs-formats-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .format-card { transition: none !important; }
        }
      `}</style>
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
