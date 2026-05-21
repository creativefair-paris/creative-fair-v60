// Sprint 37.B (F16) — SuggestionPicker réutilisé par les steps 2 et 3.
//
// Affiche une liste de suggestions cochables (multi-select) + un champ
// texte libre pour ajouter une réponse non listée. Chaque suggestion
// affiche son label de source ("Depuis ton calendrier business",
// "Suggestion externe", "Depuis ton historique") sous le texte.

'use client'

import { useState } from 'react'
import type { WizardSuggestion } from '@/lib/programme-creation/types'

type Props = {
  suggestions: ReadonlyArray<WizardSuggestion>
  selected: ReadonlyArray<string>
  onSelectedChange: (next: string[]) => void
  freeTextPlaceholder?: string
  freeText: string
  onFreeTextChange: (next: string) => void
}

const SOURCE_LABEL: Record<WizardSuggestion['source'], string> = {
  calendar: 'Depuis ton calendrier business',
  external: 'Suggestion externe',
  history: 'Depuis ton historique',
}

export function SuggestionPicker({
  suggestions,
  selected,
  onSelectedChange,
  freeTextPlaceholder,
  freeText,
  onFreeTextChange,
}: Props) {
  const [, setVersion] = useState(0)

  function toggle(value: string) {
    if (selected.includes(value)) {
      onSelectedChange(selected.filter((v) => v !== value))
    } else {
      onSelectedChange([...selected, value])
    }
    setVersion((v) => v + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {suggestions.map((s, i) => {
          const isSelected = selected.includes(s.value)
          return (
            <li key={`${s.value}-${i}`}>
              <button
                type="button"
                onClick={() => toggle(s.value)}
                aria-pressed={isSelected}
                className={isSelected ? 'btn-choice' : 'btn-choice'}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  textAlign: 'left',
                  background: isSelected
                    ? 'rgba(0, 122, 255, 0.16)'
                    : 'rgba(0, 122, 255, 0.06)',
                  borderColor: isSelected
                    ? 'rgba(0, 122, 255, 0.5)'
                    : 'rgba(0, 122, 255, 0.18)',
                  padding: '12px 16px',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `1.5px solid ${isSelected ? '#007AFF' : 'rgba(0, 122, 255, 0.4)'}`,
                    background: isSelected ? '#007AFF' : 'transparent',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2,
                  }}
                >
                  {isSelected ? (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6 L5 9 L10 3" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-label)' }}>
                    {s.value}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'var(--color-tertiary-label)',
                    }}
                  >
                    {SOURCE_LABEL[s.source]}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
        <span
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--color-tertiary-label)',
          }}
        >
          Autre (à préciser)
        </span>
        <textarea
          value={freeText}
          onChange={(e) => onFreeTextChange(e.target.value)}
          placeholder={freeTextPlaceholder ?? 'Décris en quelques mots'}
          rows={2}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid var(--color-separator)',
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--color-label)',
            background: 'rgba(255, 255, 255, 0.6)',
            resize: 'vertical',
            outline: 'none',
          }}
        />
      </label>
    </div>
  )
}
