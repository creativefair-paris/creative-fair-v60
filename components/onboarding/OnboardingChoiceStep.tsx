// Sprint 37 (Lot 1) — Step "choix" pour onboarding amendé.
//
// Cohérent visuellement avec OnboardingStep (texte) : même titre H1,
// même padding, Liquid Glass niveau 1 sur chaque option. Options
// empilées verticalement (mobile/desktop, pas de grille horizontale
// qui casse sur mobile). Option sélectionnée = anneau accent + fond
// crème renforcé.
//
// Sert pour les 2 nouvelles questions doctrinales (doc 09 §2-3) :
//   * "Tu pilotes une marque ou c'est la tienne ?" — 2 options
//   * "À quel rythme tu publies ?" — 3 options (avec sous-titre)

'use client'

import { useId } from 'react'

export type OnboardingChoiceOption = {
  value: string
  label: string
  sublabel?: string
}

type Props = {
  question: string
  options: ReadonlyArray<OnboardingChoiceOption>
  value: string | null
  onChange: (next: string) => void
}

export function OnboardingChoiceStep({ question, options, value, onChange }: Props) {
  const groupId = useId()

  return (
    <div
      role="radiogroup"
      aria-labelledby={`${groupId}-label`}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
    >
      <h2
        id={`${groupId}-label`}
        className="text-title-1"
        style={{
          color: 'var(--color-label)',
          fontWeight: 600,
          lineHeight: 1.2,
          margin: 0,
        }}
      >
        {question}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {options.map((opt) => {
          const selected = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className="cfs-onboarding-choice"
              data-selected={selected ? 'true' : 'false'}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 'var(--radius-medium)',
                border: selected
                  ? '1px solid var(--color-accent)'
                  : '1px solid var(--color-separator)',
                backgroundColor: selected
                  ? 'rgba(31, 73, 55, 0.06)'
                  : 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-system)',
                color: 'var(--color-label)',
                transition:
                  'border-color var(--duration-fast) var(--ease-out-quart), background-color var(--duration-fast) var(--ease-out-quart)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 500 }}>{opt.label}</span>
              {opt.sublabel ? (
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--color-secondary-label)',
                    lineHeight: 1.4,
                  }}
                >
                  {opt.sublabel}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
