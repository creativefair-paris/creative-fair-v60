// Sprint 36.B.2 — Panneau gauche (40%) du Split Brief Ressources.
// 3 propositions sur-mesure (clic = applique toute la config)
// + segmented control photo / vidéo + toggles terrain / studio.

'use client'

import type {
  Ressources,
  CapaciteProduction,
  PropositionRessources,
} from '@/types/ma-marque'

type Props = {
  ressources: Ressources
  propositions: PropositionRessources[]
  onChange: (next: Ressources) => void
}

const CAPACITES: { value: CapaciteProduction; label: string }[] = [
  { value: 'aucune', label: 'Aucune' },
  { value: 'occasionnelle', label: 'Occasionnelle' },
  { value: 'reguliere', label: 'Régulière' },
  { value: 'soutenue', label: 'Soutenue' },
]

function SegmentedControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: CapaciteProduction
  onChange: (next: CapaciteProduction) => void
}) {
  return (
    <fieldset
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        border: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      <legend
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--color-label)',
          padding: 0,
          marginBottom: 4,
        }}
      >
        {label}
      </legend>
      <div
        role="radiogroup"
        className="glass-thin"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 2,
          padding: 4,
          borderRadius: 14,
        }}
      >
        {CAPACITES.map((c) => {
          const actif = c.value === value
          return (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={actif}
              onClick={() => onChange(c.value)}
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: actif ? 'var(--color-label)' : 'transparent',
                color: actif ? 'var(--color-background)' : 'var(--color-secondary-label)',
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                fontWeight: actif ? 600 : 500,
                transition: 'background 180ms ease, color 180ms ease',
              }}
            >
              {c.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="glass-thin"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--color-label)',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 12,
            color: 'var(--color-tertiary-label)',
            marginTop: 2,
          }}
        >
          {description}
        </div>
      </div>
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 44,
          height: 26,
          borderRadius: 13,
          background: value ? '#34C759' : 'rgba(0,0,0,0.15)',
          position: 'relative',
          transition: 'background 220ms ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: value ? 20 : 2,
            width: 22,
            height: 22,
            borderRadius: 11,
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'left 220ms ease',
          }}
        />
      </span>
    </button>
  )
}

export function RessourcesContext({ ressources, propositions, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Propositions sur-mesure */}
      <section
        aria-labelledby="ress-props-title"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
      >
        <h4
          id="ress-props-title"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--color-secondary-label)',
            margin: 0,
          }}
        >
          Trois profils possibles
        </h4>
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
          {propositions.slice(0, 3).map((p, i) => (
            <li key={`${i}-${p.description.slice(0, 16)}`}>
              <button
                type="button"
                onClick={() => onChange({
                  photo: p.hint.photo ?? ressources.photo,
                  video: p.hint.video ?? ressources.video,
                  terrain: p.hint.terrain ?? ressources.terrain,
                  studio: p.hint.studio ?? ressources.studio,
                })}
                className="glass-thin"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-system)',
                  fontSize: 14,
                  color: 'var(--color-label)',
                  lineHeight: 1.35,
                }}
              >
                {p.description}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Capacités à la main */}
      <section
        aria-labelledby="ress-edit-title"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        <h4
          id="ress-edit-title"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--color-secondary-label)',
            margin: 0,
          }}
        >
          Ajuste à ton rythme
        </h4>
        <SegmentedControl
          label="Photo"
          value={ressources.photo}
          onChange={(next) => onChange({ ...ressources, photo: next })}
        />
        <SegmentedControl
          label="Vidéo"
          value={ressources.video}
          onChange={(next) => onChange({ ...ressources, video: next })}
        />
        <Toggle
          label="Terrain"
          description="Boutique, atelier, lieu de production"
          value={ressources.terrain}
          onChange={(next) => onChange({ ...ressources, terrain: next })}
        />
        <Toggle
          label="Studio"
          description="Espace dédié à la captation"
          value={ressources.studio}
          onChange={(next) => onChange({ ...ressources, studio: next })}
        />
      </section>
    </div>
  )
}
