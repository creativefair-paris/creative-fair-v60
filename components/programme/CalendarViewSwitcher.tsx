// Sprint 37.G (F64) — Toggle segmented control iOS pour les 3 vues du
// calendrier : Semaine / Mois / Liste.

'use client'

export type CalendarViewKind = 'week' | 'month' | 'list'

type Props = {
  active: CalendarViewKind
  onChange: (next: CalendarViewKind) => void
}

const OPTIONS: ReadonlyArray<{ id: CalendarViewKind; label: string }> = [
  { id: 'week', label: 'Semaine' },
  { id: 'month', label: 'Mois' },
  { id: 'list', label: 'Liste' },
]

export function CalendarViewSwitcher({ active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Type de vue calendrier"
      style={{
        display: 'inline-flex',
        background: 'rgba(120, 120, 128, 0.08)',
        borderRadius: 10,
        padding: 2,
        gap: 2,
      }}
    >
      {OPTIONS.map((opt) => {
        const isActive = active === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            style={{
              padding: '6px 16px',
              background: isActive ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.7)',
              cursor: 'pointer',
              boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'background 180ms ease-out, color 180ms ease-out',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
