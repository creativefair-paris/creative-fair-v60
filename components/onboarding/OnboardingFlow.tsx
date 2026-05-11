// Sprint 34 — Flux onboarding 10 questions (cahier §3.1)
// 3 blocs séquentiels : Identité (3) / Calendrier business (4) / Objectifs (3).
// À la fin, appel /api/ai/brand-book avec les 3 réponses du Bloc 1.
// Les 7 autres réponses sont persistées en localStorage pour consommation
// par Sprint 35 (programme) et 36 (calendrier business).
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { OnboardingProgress } from './OnboardingProgress'
import { OnboardingStep } from './OnboardingStep'

type Question = {
  id: string
  bloc: 'identity' | 'calendar' | 'objectives'
  prompt: string
  placeholder: string
  multiline: boolean
}

const QUESTIONS: readonly Question[] = [
  // Bloc 1 — Identité
  {
    id: 'identity',
    bloc: 'identity',
    prompt: 'Comment s\u2019appelle ta marque et qu\u2019est-ce qu\u2019elle fait ?',
    placeholder: 'Deux ou trois phrases.',
    multiline: true,
  },
  {
    id: 'audience',
    bloc: 'identity',
    prompt: 'À qui s\u2019adresse-t-elle ?',
    placeholder: 'Décris les personnes que tu veux toucher.',
    multiline: true,
  },
  {
    id: 'voice',
    bloc: 'identity',
    prompt: 'Comment décrirais-tu sa voix ?',
    placeholder: 'Formelle, chaleureuse, poétique, directe…',
    multiline: true,
  },
  // Bloc 2 — Calendrier business
  {
    id: 'recurring_events',
    bloc: 'calendar',
    prompt: 'Quels sont tes événements récurrents ?',
    placeholder: 'Lancements, ventes, saisonnalité…',
    multiline: true,
  },
  {
    id: 'planning_horizon',
    bloc: 'calendar',
    prompt: 'Sur combien de mois veux-tu planifier ?',
    placeholder: 'Un nombre, ou une période.',
    multiline: false,
  },
  {
    id: 'frequency',
    bloc: 'calendar',
    prompt: 'À quelle fréquence publies-tu ?',
    placeholder: '3 par semaine, 5 par semaine, quotidien…',
    multiline: false,
  },
  {
    id: 'best_slots',
    bloc: 'calendar',
    prompt: 'Quels jours et heures fonctionnent le mieux pour les tiens ?',
    placeholder: 'Mardi 18h, dimanche matin…',
    multiline: true,
  },
  // Bloc 3 — Objectifs
  {
    id: 'main_goal',
    bloc: 'objectives',
    prompt: 'Quel est ton objectif principal pour les 3 prochains mois ?',
    placeholder: 'Une phrase suffit.',
    multiline: true,
  },
  {
    id: 'content_priorities',
    bloc: 'objectives',
    prompt: 'Quelles sont tes 3 priorités de contenu ?',
    placeholder: 'Notoriété, vente, communauté…',
    multiline: true,
  },
  {
    id: 'dominant_tone',
    bloc: 'objectives',
    prompt: 'Quel ton dominant pour cette période ?',
    placeholder: 'Intime, expert, festif…',
    multiline: false,
  },
] as const

const TOTAL = QUESTIONS.length
const LOCAL_KEY = 'cfs.onboarding.answers.v1'

type Answers = Record<string, string>

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(() => {
    const seed: Answers = {}
    for (const q of QUESTIONS) seed[q.id] = ''
    return seed
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const current = useMemo(() => QUESTIONS[step], [step])
  const value = current ? (answers[current.id] ?? '') : ''
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
    setSubmitting(true)
    setError(null)
    try {
      // Persister localement les 10 réponses pour les sprints suivants.
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCAL_KEY, JSON.stringify(answers))
      }
      // Appel API existant — accepte identity/audience/voice (Bloc 1).
      const payload = {
        identity: answers['identity'] ?? '',
        audience: answers['audience'] ?? '',
        voice: answers['voice'] ?? '',
      }
      const res = await fetch('/api/ai/brand-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }
      router.push('/')
      router.refresh()
    } catch (err) {
      setSubmitting(false)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  if (submitting) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <p className="text-title-2" style={{ textAlign: 'center' }}>
          Nous préparons ta marque
        </p>
        <p className="text-callout" style={{ color: 'var(--color-secondary-label)' }}>
          Quelques secondes.
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
          aria-label="Retour à l\u2019étape précédente"
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
