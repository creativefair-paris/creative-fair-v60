// Sprint 37.E (F45) — Wizard Step 2 : Mix 100% CF ou externe.
//
// V1 : on stocke le choix dans responses.mix_mode. L'implémentation
// complète du mode 'mixed' (intégration de contenus externes au plan)
// est différée Sprint 38+.

'use client'

import { useState } from 'react'
import type { MixMode } from '@/lib/programme-creation/types'

type Props = {
  initial: MixMode | null
  onBack: () => void
  onSave: (mode: MixMode) => void
  saving?: boolean
}

const OPTIONS: ReadonlyArray<{
  value: MixMode
  title: string
  badge: string
  description: string
}> = [
  {
    value: 'full_cf',
    title: '100% Creative Fair',
    badge: 'Rapide et efficace',
    description:
      'Le conseiller génère tout le programme à partir de ta marque et ta bibliothèque. Tu peux modifier chaque post après.',
  },
  {
    value: 'mixed',
    title: 'Mix avec contenu externe',
    badge: 'Complexe mais ultra efficace',
    description:
      "Tu intègres tes propres créations (off-app) dans le programme. Le conseiller s'adapte à ce que tu apportes.",
  },
]

export function Step2MixMode({ initial, onBack, onSave, saving }: Props) {
  const [value, setValue] = useState<MixMode | null>(initial)
  const canSave = value !== null && !saving

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Comment veux-tu construire ce programme ?</h2>
        <p style={descStyle}>
          Tu peux changer d&apos;avis à n&apos;importe quel moment depuis Mon Programme.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }} className="cfs-mix-grid">
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue(opt.value)}
              aria-pressed={isSelected}
              className="btn-choice"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 8,
                padding: '16px 18px',
                textAlign: 'left',
                background: isSelected ? 'rgba(0, 122, 255, 0.08)' : 'rgba(255, 255, 255, 0.6)',
                borderColor: isSelected ? 'rgba(0, 122, 255, 0.3)' : 'rgba(0, 0, 0, 0.06)',
                boxShadow: isSelected ? '0 0 0 1px rgba(0, 122, 255, 0.2)' : 'none',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#007AFF',
                }}
              >
                {opt.badge}
              </span>
              <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-label)' }}>
                {opt.title}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(0, 0, 0, 0.7)' }}>
                {opt.description}
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
          onClick={() => value && onSave(value)}
          disabled={!canSave}
          className="btn-primary"
        >
          {saving ? 'Enregistrement…' : 'Suivant'}
        </button>
      </footer>

      <style>{`
        @media (max-width: 560px) {
          .cfs-mix-grid { grid-template-columns: 1fr !important; }
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
