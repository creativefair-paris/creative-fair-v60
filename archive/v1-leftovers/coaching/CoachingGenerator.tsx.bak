// SUPPRESSION CANDIDATE Sprint 33 — composant legacy déplacé en Sprint 32.5
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PHRASES = [
  'Je lis ton calendrier business…',
  'Je relis ta voix de marque…',
  'Je prépare ton coaching du jour…',
]

type Status = 'idle' | 'loading' | 'error' | 'no_brand'

type Props = {
  autoGenerate?: boolean
}

export function CoachingGenerator({ autoGenerate = true }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(autoGenerate ? 'loading' : 'idle')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (status !== 'loading') return
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % PHRASES.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [status])

  useEffect(() => {
    if (!autoGenerate) return
    if (startedRef.current) return
    startedRef.current = true
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate])

  async function run() {
    setStatus('loading')
    setErrorMessage(null)
    try {
      const res = await fetch('/api/ai/coaching', { method: 'POST' })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        // Structural condition — no brand row exists. Layout guard should
        // have caught this; handle here as a safety net.
        if (res.status === 400 && data?.error?.includes('No brand')) {
          setStatus('no_brand')
          return
        }
        throw new Error(data?.error ?? 'Génération impossible.')
      }
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Génération impossible.'
      setErrorMessage(message)
      setStatus('error')
    }
  }

  if (status === 'loading') {
    return (
      <section
        className="glass-z2 px-8 py-10 space-y-4 animate-pulse"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className="h-3 w-24 rounded"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <div
          className="h-3 w-full rounded"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <div
          className="h-3 w-5/6 rounded"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <div
          className="h-3 w-4/6 rounded"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <p
          className="text-sm pt-4 transition-opacity duration-[420ms]"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          {PHRASES[phraseIndex]}
        </p>
      </section>
    )
  }

  if (status === 'no_brand') {
    return (
      <section
        className="glass-z2 px-8 py-10 space-y-4"
      >
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Pour commencer, crée ta marque
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          Le coaching personnalisé sera disponible dès que ton identité de marque est définie.
        </p>
        <Link
          href="/onboarding/analyse-marque"
          className="inline-flex items-center px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-fg)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Créer ma marque
        </Link>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section
        className="glass-z2 px-8 py-10 space-y-4"
      >
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Le coaching n&rsquo;a pas pu être généré
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          {errorMessage}
        </p>
        <button
          type="button"
          onClick={() => void run()}
          className="inline-flex items-center px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-fg)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Réessayer
        </button>
      </section>
    )
  }

  return (
    <section
      className="rounded-2xl px-8 py-10 space-y-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
      >
        Ton coaching du jour est en préparation
      </h2>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Il arrivera chaque matin à 8h.
      </p>
      <button
        type="button"
        onClick={() => void run()}
        className="text-sm font-medium underline transition-opacity hover:opacity-80"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
      >
        Générer maintenant
      </button>
    </section>
  )
}
