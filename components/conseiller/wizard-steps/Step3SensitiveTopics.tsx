// Sprint 37.B (F16) — Wizard Step 3 : Sujets sensibles.
// Sprint 37.D (F33) — Boutons-choix génériques + bouton "Préciser".

'use client'

import { useState } from 'react'

type Props = {
  initialTopics: string
  onBack: () => void
  onSave: (topics: string) => void
  saving?: boolean
}

const QUICK_CHOICES: ReadonlyArray<string> = [
  'Aucun sujet sensible',
  'Sujet politique en cours',
  'Crise interne récente',
  'Concurrent à éviter',
]

export function Step3SensitiveTopics({
  initialTopics,
  onBack,
  onSave,
  saving,
}: Props) {
  // On détecte si initialTopics correspond à un choix rapide.
  const presetMatch = QUICK_CHOICES.find((c) => c === initialTopics) ?? null
  const [selectedChoice, setSelectedChoice] = useState<string | null>(presetMatch)
  const [customMode, setCustomMode] = useState<boolean>(
    presetMatch === null && initialTopics.trim().length > 0,
  )
  const [customValue, setCustomValue] = useState(presetMatch ? '' : initialTopics)

  function handleQuickSelect(choice: string) {
    setSelectedChoice(choice)
    setCustomMode(false)
    setCustomValue('')
  }

  const canSave = selectedChoice !== null || (customMode && customValue.trim().length > 0)
  const valueToSave = customMode ? customValue.trim() : (selectedChoice ?? '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>
          Y a-t-il un sujet sensible à éviter ce mois-ci ?
        </h2>
        <p style={descStyle}>
          Le conseiller n&apos;abordera pas ce sujet dans le plan.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {QUICK_CHOICES.map((c) => {
          const isSelected = !customMode && selectedChoice === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => handleQuickSelect(c)}
              aria-pressed={isSelected}
              className="btn-choice"
              style={{
                textAlign: 'left',
                padding: '12px 16px',
                background: isSelected ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
                borderColor: isSelected ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
              }}
            >
              {c}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => {
            setCustomMode(true)
            setSelectedChoice(null)
          }}
          aria-pressed={customMode}
          className="btn-choice"
          style={{
            textAlign: 'left',
            padding: '12px 16px',
            background: customMode ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
            borderColor: customMode ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
          }}
        >
          Préciser →
        </button>
      </div>

      {customMode ? (
        <textarea
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="Une thématique sensible, un sujet d'actualité à éviter, etc."
          rows={3}
          style={{
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px solid var(--color-separator)',
            fontFamily: 'var(--font-system)',
            fontSize: 15,
            lineHeight: 1.5,
            color: 'var(--color-label)',
            background: 'rgba(255, 255, 255, 0.6)',
            resize: 'vertical',
            outline: 'none',
          }}
        />
      ) : null}

      <footer style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={onBack} className="btn-choice btn-choice-sm">
          Retour
        </button>
        <button
          type="button"
          onClick={() => onSave(valueToSave)}
          disabled={!canSave || saving}
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
