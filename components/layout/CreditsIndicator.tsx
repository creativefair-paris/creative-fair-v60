'use client'

import { useEffect, useRef, useState } from 'react'

export type CreditsByFeature = {
  coaching: number
  generation: number
  brief: number
  brand_book: number
  conseiller: number
}

type Props = {
  totalThisMonth: number
  byFeature: CreditsByFeature
}

const FEATURE_LABELS: Record<keyof CreditsByFeature, string> = {
  coaching: 'Coaching',
  generation: 'Génération',
  brief: 'Brief',
  brand_book: 'Brand book',
  conseiller: 'Conseiller',
}

export function CreditsIndicator({ totalThisMonth, byFeature }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs transition-opacity hover:opacity-80"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        aria-label="Crédits utilisés ce mois"
      >
        {totalThisMonth} crédits ce mois
      </button>

      {open && (
        <div
          className="absolute right-0 top-7 w-56 rounded-xl py-1 z-50 shadow-lg"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div
            className="px-4 py-2 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p
              className="text-xs"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Détail du mois
            </p>
          </div>
          <ul className="py-1">
            {(Object.keys(FEATURE_LABELS) as Array<keyof CreditsByFeature>).map(
              (key) => (
                <li
                  key={key}
                  className="flex items-center justify-between px-4 py-1.5"
                >
                  <span
                    className="text-xs"
                    style={{
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {FEATURE_LABELS[key]}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {byFeature[key]}
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
