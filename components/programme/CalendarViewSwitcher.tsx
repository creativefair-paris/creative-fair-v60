// Sprint 37.G (F64) — Toggle 3 vues du calendrier (Semaine / Mois / Liste).
// Sprint 37.J (F84) — Refonte en vrai Segmented Control Apple iOS :
// background gris natif iOS rgba(120,120,128,0.12), padding 2px, option
// active en blanc avec box-shadow + bold, transition cubic-bezier Apple.

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
      className="ios-segmented"
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
            className={`ios-segmented__opt${isActive ? ' is-active' : ''}`}
          >
            {opt.label}
          </button>
        )
      })}

      <style>{`
        .ios-segmented {
          display: inline-flex;
          background: rgba(120, 120, 128, 0.12);
          padding: 2px;
          border-radius: 9px;
          gap: 0;
        }
        .ios-segmented__opt {
          background: transparent;
          border: none;
          padding: 6px 16px;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.2;
          letter-spacing: -0.1px;
          color: rgba(0, 0, 0, 0.85);
          cursor: pointer;
          border-radius: 7px;
          transition: background 200ms cubic-bezier(0.32, 0.72, 0, 1),
                      color 200ms,
                      box-shadow 200ms;
        }
        .ios-segmented__opt:not(.is-active):hover {
          color: rgba(0, 0, 0, 0.65);
        }
        .ios-segmented__opt.is-active {
          background: #FFFFFF;
          color: rgba(0, 0, 0, 0.95);
          font-weight: 600;
          box-shadow:
            0 3px 8px rgba(0, 0, 0, 0.04),
            0 1px 2px rgba(0, 0, 0, 0.06);
        }
        @media (prefers-reduced-motion: reduce) {
          .ios-segmented__opt { transition: none !important; }
        }
      `}</style>
    </div>
  )
}
