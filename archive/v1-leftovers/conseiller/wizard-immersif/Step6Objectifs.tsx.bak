// Sprint 37.C (F19) — Wizard Step 6 : Objectifs éditoriaux.
//
// Question : "Quel est ton objectif éditorial principal sur cette période ?"
// Multi-select 1-2 objectifs maximum (sinon dispersion). Labels source
// affichés en small caps : DEPUIS TON PILIER PRINCIPAL, DEPUIS TON
// CALENDRIER, INDICATEUR ÉDITORIAL, RYTHME ACTUEL. Champ libre alternatif
// autorisé.

'use client'

import { useState } from 'react'
import type { ObjectifEditorial } from '@/lib/programme-creation/types'

type Props = {
  initial: ReadonlyArray<ObjectifEditorial>
  // Suggestions construites côté serveur depuis :
  //  - brand.piliers_narratifs (pilier_principal)
  //  - brand.business_calendar (calendar)
  //  - publication_frequency (current_rhythm)
  //  - brand_metrics (current_metrics)
  suggestions: ReadonlyArray<ObjectifEditorial>
  onBack: () => void
  onSave: (value: ReadonlyArray<ObjectifEditorial>) => void
  saving?: boolean
}

const MAX_SELECT = 2

const SOURCE_LABEL: Record<ObjectifEditorial['source'], string> = {
  pilier_principal: 'Depuis ton pilier principal',
  calendar: 'Depuis ton calendrier',
  current_rhythm: 'Rythme actuel',
  current_metrics: 'Indicateur éditorial',
  custom: 'Réponse libre',
}

export function Step6Objectifs({
  initial,
  suggestions,
  onBack,
  onSave,
  saving,
}: Props) {
  const [selected, setSelected] = useState<ReadonlyArray<ObjectifEditorial>>(initial)
  const [freeText, setFreeText] = useState('')

  function toggle(s: ObjectifEditorial) {
    const exists = selected.some((o) => o.value === s.value)
    if (exists) {
      setSelected(selected.filter((o) => o.value !== s.value))
    } else if (selected.length < MAX_SELECT) {
      setSelected([...selected, s])
    }
  }

  function addFreeText() {
    const trimmed = freeText.trim()
    if (!trimmed) return
    if (selected.length >= MAX_SELECT) return
    if (selected.some((o) => o.value === trimmed)) return
    setSelected([
      ...selected,
      { value: trimmed, type: 'qualitatif', source: 'custom' },
    ])
    setFreeText('')
  }

  const canContinue = selected.length > 0 && !saving

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Quel est ton objectif éditorial principal sur cette période ?</h2>
        <p style={descStyle}>
          Choisis 1 ou 2 objectifs maximum. Plus, et tu te disperses.
        </p>
      </header>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {suggestions.map((s, i) => {
          const isSelected = selected.some((o) => o.value === s.value)
          const isDisabled = !isSelected && selected.length >= MAX_SELECT
          return (
            <li key={`${s.value}-${i}`}>
              <button
                type="button"
                onClick={() => toggle(s)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                className="btn-choice"
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                  textAlign: 'left',
                  background: isSelected
                    ? 'rgba(0, 122, 255, 0.16)'
                    : 'rgba(0, 122, 255, 0.06)',
                  borderColor: isSelected
                    ? 'rgba(0, 122, 255, 0.5)'
                    : 'rgba(0, 122, 255, 0.18)',
                  padding: '12px 16px',
                  opacity: isDisabled ? 0.5 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--color-label)',
                  }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-tertiary-label)',
                  }}
                >
                  {SOURCE_LABEL[s.source]}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Autre objectif (ex. Affirmer notre voix sur tel sujet)"
          disabled={selected.length >= MAX_SELECT}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            background: 'rgba(255, 255, 255, 0.6)',
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            color: 'var(--color-label)',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addFreeText()
            }
          }}
        />
        <button
          type="button"
          onClick={addFreeText}
          disabled={!freeText.trim() || selected.length >= MAX_SELECT}
          className="btn-choice"
          style={{ padding: '10px 14px' }}
        >
          Ajouter
        </button>
      </div>

      <footer style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <button type="button" onClick={onBack} className="btn-choice" disabled={saving}>
          Retour
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={!canContinue}
          onClick={() => onSave(selected)}
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
