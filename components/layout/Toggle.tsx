// Sprint 33 §8.7 — Toggle segmented control (Programme / Outils)
'use client'

type ToggleProps = {
  value: 'programme' | 'outils'
  onChange?: (value: 'programme' | 'outils') => void
}

const SEGMENTS = [
  { id: 'programme' as const, label: 'Programme' },
  { id: 'outils' as const, label: 'Outils' },
]

export function Toggle({ value, onChange }: ToggleProps) {
  return (
    <div role="tablist" aria-label="Mode" className="cfs-toggle glass-thin">
      {SEGMENTS.map((segment) => {
        const selected = value === segment.id
        return (
          <button
            key={segment.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className="cfs-toggle__segment"
            onClick={() => onChange?.(segment.id)}
          >
            {segment.label}
          </button>
        )
      })}
    </div>
  )
}
