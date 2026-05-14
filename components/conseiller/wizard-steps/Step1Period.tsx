// Sprint 37.B (F16) — Wizard Step 1 : Période.
// Sprint 37.D (F33) — Quick options + custom toggle.
//
// Boutons-choix : 2 semaines, 1 mois, 6 semaines, 2 mois, 3 mois.
// Option "Préciser des dates" qui ouvre les pickers natifs.

'use client'

import { useState } from 'react'

type Props = {
  initialStart: string
  initialEnd: string
  onSave: (params: { start: string; end: string }) => void
  saving?: boolean
}

const QUICK_OPTIONS: ReadonlyArray<{ value: string; label: string; weeks: number }> = [
  { value: '2w', label: '2 semaines', weeks: 2 },
  { value: '1m', label: '1 mois', weeks: 4 },
  { value: '6w', label: '6 semaines', weeks: 6 },
  { value: '2m', label: '2 mois', weeks: 8 },
  { value: '3m', label: '3 mois', weeks: 12 },
]

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function Step1Period({ initialStart, initialEnd, onSave, saving }: Props) {
  const [mode, setMode] = useState<'quick' | 'custom'>(
    initialStart || initialEnd ? 'custom' : 'quick',
  )
  const [quickValue, setQuickValue] = useState<string | null>(null)
  const [start, setStart] = useState(initialStart)
  const [end, setEnd] = useState(initialEnd)

  function handleQuickSelect(opt: typeof QUICK_OPTIONS[number]) {
    setQuickValue(opt.value)
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + opt.weeks * 7)
    setStart(isoDate(today))
    setEnd(isoDate(endDate))
  }

  function handleCustomMode() {
    setMode('custom')
    setQuickValue(null)
  }

  const canSave =
    start.length > 0 &&
    end.length > 0 &&
    new Date(start).getTime() < new Date(end).getTime()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Sur quelle période veux-tu construire ce plan ?</h2>
        <p style={descStyle}>
          Choisis une durée rapide ou précise des dates.
        </p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {QUICK_OPTIONS.map((opt) => {
          const selected = mode === 'quick' && quickValue === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setMode('quick')
                handleQuickSelect(opt)
              }}
              aria-pressed={selected}
              className="btn-choice"
              style={{
                padding: '10px 16px',
                background: selected ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
                borderColor: selected ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
              }}
            >
              {opt.label}
            </button>
          )
        })}
        <button
          type="button"
          onClick={handleCustomMode}
          aria-pressed={mode === 'custom'}
          className="btn-choice"
          style={{
            padding: '10px 16px',
            background: mode === 'custom' ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
            borderColor: mode === 'custom' ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
          }}
        >
          Préciser des dates →
        </button>
      </div>

      {mode === 'custom' ? (
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
      ) : null}

      {mode === 'quick' && start && end ? (
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: 'var(--color-secondary-label)',
            margin: 0,
          }}
        >
          Du {start} au {end}.
        </p>
      ) : null}

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
