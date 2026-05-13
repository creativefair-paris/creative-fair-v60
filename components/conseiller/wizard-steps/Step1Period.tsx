// Sprint 37.B (F16) — Wizard Step 1 : Période.
//
// Note : la création de la session passe par createProgrammeCreationSession
// qui pré-remplit le step 0 (Period). En pratique, le wizard saute
// directement au step 1 (Ancres) après le PeriodSelectionSheet. Mais
// si on entre dans le wizard via "Reprendre", le step 0 peut redevenir
// éditable — d'où ce composant.

'use client'

import { useState } from 'react'

type Props = {
  initialStart: string
  initialEnd: string
  onSave: (params: { start: string; end: string }) => void
  saving?: boolean
}

export function Step1Period({ initialStart, initialEnd, onSave, saving }: Props) {
  const [start, setStart] = useState(initialStart)
  const [end, setEnd] = useState(initialEnd)

  const canSave =
    start.length > 0 &&
    end.length > 0 &&
    new Date(start).getTime() < new Date(end).getTime()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Sur quelle période veux-tu construire ce plan ?</h2>
        <p style={descStyle}>
          Choisis tes dates de début et de fin. Le conseiller construit ensuite avec toi.
        </p>
      </header>

      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={labelStyle}>Date de début</span>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={labelStyle}>Date de fin</span>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            style={inputStyle}
          />
        </label>
      </div>

      <footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => onSave({ start, end })}
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
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-tertiary-label)',
}
const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--color-separator)',
  fontFamily: 'var(--font-system)',
  fontSize: 15,
  color: 'var(--color-label)',
  background: 'rgba(255, 255, 255, 0.6)',
  outline: 'none',
}
