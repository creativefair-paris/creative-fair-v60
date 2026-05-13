// Sprint 37.B (F16) — Wizard Step 3 : Sujets sensibles.

'use client'

import { useState } from 'react'

type Props = {
  initialTopics: string
  onBack: () => void
  onSave: (topics: string) => void
  saving?: boolean
}

export function Step3SensitiveTopics({
  initialTopics,
  onBack,
  onSave,
  saving,
}: Props) {
  const [value, setValue] = useState(initialTopics)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>
          Y a-t-il un sujet sensible à éviter ce mois-ci ?
        </h2>
        <p style={descStyle}>
          Le conseiller n&apos;abordera pas ce sujet dans le plan. Tu peux laisser
          vide si rien de particulier.
        </p>
      </header>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Une thématique sensible, un sujet d&apos;actualité à éviter, etc."
        rows={4}
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

      <footer style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={onBack} className="btn-choice btn-choice-sm">
          Retour
        </button>
        <button
          type="button"
          onClick={() => onSave(value)}
          disabled={saving}
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
