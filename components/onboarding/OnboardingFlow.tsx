// Sprint 36.A — Flux inversé Marcus : 4 questions essentielles avant le premier wow.
// Time-to-Wow visé < 4 min. Aucune décision imposée avant la timeline.
// Écran d'attente narratif sobre pendant la génération Creative Fair (15-45 s).
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { OnboardingProgress } from './OnboardingProgress'
import { OnboardingStep } from './OnboardingStep'

type Question = {
  id: 'nom' | 'secteur' | 'ton' | 'singularite'
  prompt: string
  placeholder: string
  multiline: boolean
  maxLength: number
  rows?: number
}

const QUESTIONS: readonly Question[] = [
  {
    id: 'nom',
    prompt: 'Quel est le nom de ta marque ?',
    placeholder: '',
    multiline: false,
    maxLength: 80,
  },
  {
    id: 'secteur',
    prompt: 'Dans quel secteur évolue ta marque ?',
    placeholder: 'Joaillerie contemporaine, café de spécialité, hôtellerie haut de gamme…',
    multiline: false,
    maxLength: 120,
  },
  {
    id: 'ton',
    prompt: 'Comment ta marque s\u2019exprime-t-elle ?',
    placeholder: 'Avec retenue et précision, en privilégiant le mot juste plutôt que l\u2019effet…',
    multiline: true,
    maxLength: 280,
    rows: 3,
  },
  {
    id: 'singularite',
    prompt: 'Qu\u2019est-ce qui rend ta marque unique ?',
    placeholder:
      'Notre savoir-faire transmis depuis trois générations, ou notre approche radicale d\u2019un secteur saturé…',
    multiline: true,
    maxLength: 400,
    rows: 4,
  },
] as const

const TOTAL = QUESTIONS.length

type Answers = Record<Question['id'], string>

type Status = 'editing' | 'submitting' | 'error'

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({
    nom: '',
    secteur: '',
    ton: '',
    singularite: '',
  })
  const [status, setStatus] = useState<Status>('editing')
  const [error, setError] = useState<string | null>(null)

  const current = useMemo(() => QUESTIONS[step], [step])
  const value = current ? answers[current.id] : ''
  const canContinue = value.trim().length > 0
  const isLast = step === TOTAL - 1

  if (!current) return null

  function updateAnswer(next: string) {
    setAnswers((prev) => ({ ...prev, [current!.id]: next }))
  }

  function goBack() {
    if (step > 0) setStep(step - 1)
  }

  async function goNext() {
    if (!canContinue) return
    if (!isLast) {
      setStep(step + 1)
      return
    }
    await submit()
  }

  async function submit() {
    setStatus('submitting')
    setError(null)
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }
      // Succès : redirect direct vers /programme avec flag welcome.
      // Le composant WelcomeURLCleaner retire le param après animation pour
      // qu'un refresh ultérieur ne rejoue pas la séquence d'arrivée.
      router.push('/programme?welcome=true')
      router.refresh()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  if (status === 'submitting') {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          textAlign: 'center',
          maxWidth: 560,
          margin: '0 auto',
        }}
      >
        <div className="bg-halo-pulse" aria-hidden="true" />
        <h1
          className="text-large-title"
          style={{ color: 'var(--color-label)', margin: 0, fontWeight: 700 }}
        >
          Nous préparons ton programme.
        </h1>
        <p
          className="text-body"
          style={{ color: 'var(--color-secondary-label)', margin: 0 }}
        >
          Creative Fair structure ta semaine éditoriale.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8)',
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
      }}
    >
      <OnboardingProgress current={step + 1} total={TOTAL} />

      <OnboardingStep
        question={current.prompt}
        value={value}
        onChange={updateAnswer}
        multiline={current.multiline}
        placeholder={current.placeholder}
        maxLength={current.maxLength}
        rows={current.rows}
      />

      {error != null ? (
        <p className="text-footnote" style={{ color: 'var(--color-system-red)' }}>
          {error}
        </p>
      ) : null}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <Button
          variant="secondary"
          onClick={goBack}
          disabled={step === 0}
          aria-label="Étape précédente"
        >
          retour
        </Button>
        <Button onClick={goNext} disabled={!canContinue}>
          {isLast ? 'terminer' : 'suivant'}
        </Button>
      </div>
    </div>
  )
}
