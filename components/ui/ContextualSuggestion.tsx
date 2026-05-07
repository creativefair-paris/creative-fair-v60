'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'

type Props = {
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
  storageKey?: string
}

export function ContextualSuggestion({
  title,
  body,
  ctaLabel,
  ctaHref,
  storageKey,
}: Props) {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !storageKey) return false
    return window.localStorage.getItem(storageKey) === 'dismissed'
  })

  if (dismissed) return null

  function dismiss() {
    if (storageKey && typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, 'dismissed')
    }
    setDismissed(true)
  }

  return (
    <aside
      className="px-4 py-3 flex items-start gap-4"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-accent) 6%, transparent)',
        border: '1px solid var(--color-accent)',
        borderRadius: 'var(--radius)',
      }}
    >
      <div className="flex-1 space-y-1">
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
        >
          {title}
        </p>
        <p
          className="text-sm"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {body}
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1 text-sm font-medium pt-1 transition-opacity hover:opacity-80"
          style={{
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {ctaLabel}
          <ArrowRight size={14} />
        </Link>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Masquer"
        className="transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <X size={16} />
      </button>
    </aside>
  )
}
