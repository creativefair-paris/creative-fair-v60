// Sprint 37.B (F16) — Wizard Step 4 : Piliers à mobiliser.
//
// Checkboxes pré-cochées sur les 3 piliers du brand book + slider de
// poids 0-100% par pilier sélectionné. La somme n'a pas besoin de
// faire 100% — c'est un indice de pondération.

'use client'

import { useState } from 'react'

type Pilier = {
  id: string
  nom: string
  description?: string
}

type Props = {
  piliers: ReadonlyArray<Pilier>
  initialWeights: Record<string, number>
  onBack: () => void
  onSave: (weights: Record<string, number>) => void
  saving?: boolean
}

export function Step4Pillars({
  piliers,
  initialWeights,
  onBack,
  onSave,
  saving,
}: Props) {
  // Si aucun poids fourni, on initialise à 33% chacun.
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    if (Object.keys(initialWeights).length > 0) return { ...initialWeights }
    const defaults: Record<string, number> = {}
    piliers.forEach((p) => {
      defaults[p.id] = 33
    })
    return defaults
  })

  function updateWeight(id: string, value: number) {
    setWeights((prev) => ({ ...prev, [id]: value }))
  }

  function toggle(id: string) {
    setWeights((prev) => {
      const next = { ...prev }
      if (id in next) {
        delete next[id]
      } else {
        next[id] = 33
      }
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Quels piliers veux-tu mettre en avant ?</h2>
        <p style={descStyle}>
          Coche les piliers à mobiliser et ajuste leur poids. La somme
          n&apos;a pas besoin de faire 100%.
        </p>
      </header>

      {piliers.length === 0 ? (
        <p style={{ ...descStyle, color: 'var(--color-tertiary-label)' }}>
          Tes piliers narratifs ne sont pas encore posés. Tu peux passer
          cette étape ; le conseiller te proposera des piliers dans la
          suite.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {piliers.map((p) => {
            const enabled = p.id in weights
            const weight = weights[p.id] ?? 0
            return (
              <li
                key={p.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: `1px solid ${enabled ? 'rgba(0, 122, 255, 0.3)' : 'var(--color-separator)'}`,
                  background: enabled ? 'rgba(0, 122, 255, 0.05)' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggle(p.id)}
                    style={{ width: 18, height: 18 }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 15,
                      fontWeight: 500,
                      color: 'var(--color-label)',
                    }}
                  >
                    {p.nom}
                  </span>
                </label>
                {enabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={weight}
                      onChange={(e) => updateWeight(p.id, Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 13,
                        color: 'var(--color-secondary-label)',
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 40,
                        textAlign: 'right',
                      }}
                    >
                      {weight}%
                    </span>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      <footer style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={onBack} className="btn-choice btn-choice-sm">
          Retour
        </button>
        <button
          type="button"
          onClick={() => onSave(weights)}
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
