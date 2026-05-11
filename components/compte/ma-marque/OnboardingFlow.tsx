// DEPRECATED — remplacé par components/onboarding/OnboardingFlow.tsx (Sprint 34).
// Conservé temporairement pour éviter des imports cassés. Suppression au Sprint 36+.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandBookGeneration } from './BrandBookGeneration'

const QUESTIONS = [
  {
    id: 'identity',
    label: "Comment s'appelle ta marque et qu'est-ce qu'elle fait ?",
    placeholder: 'En 2 ou 3 phrases.',
  },
  {
    id: 'audience',
    label: "À qui s'adresse-t-elle ?",
    placeholder: 'Décris ton public en 2 ou 3 phrases.',
  },
  {
    id: 'voice',
    label:
      'Comment tu décrirais sa voix ? Formelle, chaleureuse, poétique, directe ?',
    placeholder: '2 ou 3 phrases pour cerner le ton.',
  },
] as const

type Step = 0 | 1 | 2

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [answers, setAnswers] = useState<Record<string, string>>({
    identity: '',
    audience: '',
    voice: '',
  })
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const current = QUESTIONS[step]
  const value = answers[current.id] ?? ''
  const canContinue = value.trim().length > 0

  function next() {
    if (!canContinue) return
    if (step < 2) {
      setStep((step + 1) as Step)
    } else {
      submit()
    }
  }

  function back() {
    if (step > 0) setStep((step - 1) as Step)
  }

  async function submit() {
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/brand-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }

      router.push('/ma-marque/brand-book')
      router.refresh()
    } catch (err) {
      setGenerating(false)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  if (generating) return <BrandBookGeneration />

  return (
    <div className="min-h-[60vh] flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
        <p
          className="text-xs tracking-widest mb-6"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          {step + 1} / {QUESTIONS.length}
        </p>

        <h2
          className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight mb-6"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          {current.label}
        </h2>

        <textarea
          value={value}
          onChange={(e) =>
            setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }))
          }
          placeholder={current.placeholder}
          rows={5}
          autoFocus
          className="w-full px-4 py-3 text-base rounded-xl outline-none resize-none"
          style={{
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            borderRadius: 'var(--radius)',
          }}
        />

        {error && (
          <p
            className="mt-4 text-sm"
            style={{ color: 'var(--color-error)', fontFamily: 'var(--font-body)' }}
          >
            {error}
          </p>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="text-sm transition-opacity hover:opacity-70 disabled:opacity-30"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Retour
          </button>

          <button
            type="button"
            onClick={next}
            disabled={!canContinue}
            className="px-5 py-2.5 text-sm font-medium rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-fg)',
              fontFamily: 'var(--font-body)',
              borderRadius: 'var(--radius)',
            }}
          >
            {step === 2 ? 'Générer mon brand book' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  )
}
