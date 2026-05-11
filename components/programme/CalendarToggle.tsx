// Sprint 36.B.1 — Segmented control 2 segments (Semaine / Mois).
// Patch : retrait du segment Timeline (la vue cards verticales a disparu).

'use client'

export type ViewMode = 'semaine' | 'mois'

type CalendarToggleProps = {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

const SEGMENTS: Array<{ value: ViewMode; label: string }> = [
  { value: 'semaine', label: 'Semaine' },
  { value: 'mois', label: 'Mois' },
]

export function CalendarToggle({ value, onChange }: CalendarToggleProps) {
  return (
    <div
      className="cfs-calendar-toggle glass-thin"
      role="tablist"
      aria-label="Vue du programme"
    >
      {SEGMENTS.map((seg) => {
        const isActive = seg.value === value
        return (
          <button
            key={seg.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(seg.value)}
            className={`cfs-calendar-toggle__segment${isActive ? ' is-active' : ''}`}
          >
            {seg.label}
          </button>
        )
      })}
    </div>
  )
}
