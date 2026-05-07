'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import {
  CreditsIndicator,
  type CreditsByFeature,
} from '@/components/layout/CreditsIndicator'

type Props = {
  firstName: string
  email: string
  creditsTotal?: number
  creditsByFeature?: CreditsByFeature
  brandComplete?: boolean
}

const EMPTY_CREDITS: CreditsByFeature = {
  coaching: 0,
  generation: 0,
  brief: 0,
  brand_book: 0,
  conseiller: 0,
}

export function Header({
  firstName,
  email,
  creditsTotal = 0,
  creditsByFeature = EMPTY_CREDITS,
  brandComplete = false,
}: Props) {
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

  const initials = firstName.slice(0, 2).toUpperCase()

  return (
    <header
      className="glass-bar h-14 flex items-center justify-between px-4 shrink-0 sticky top-0 z-30"
    >
      <span
        className="text-sm font-semibold tracking-tight"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
      >
        Creative Fair
      </span>

      <div className="flex items-center gap-4">
        {brandComplete && creditsTotal > 0 && (
          <CreditsIndicator
            totalThisMonth={creditsTotal}
            byFeature={creditsByFeature}
          />
        )}

        <Link
          href="/conseiller"
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Conseiller IA"
        >
          <MessageCircle size={18} />
        </Link>

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-fg)',
              fontFamily: 'var(--font-body)',
            }}
            aria-label="Mon compte"
          >
            {initials}
          </button>

          {open && (
            <div
              className="glass-z3 glass-pop-in absolute right-0 top-10 w-52 py-1 z-50"
            >
              <div
                className="px-4 py-2 border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
                >
                  {firstName}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  {email}
                </p>
              </div>
              <Link
                href="/mon-compte"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm transition-colors hover:opacity-70"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
              >
                Mon compte
              </Link>
              <a
                href="/logout"
                className="block px-4 py-2 text-sm transition-colors hover:opacity-70"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
              >
                Se déconnecter
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
