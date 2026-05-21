// Sprint 36.A → 37 — Flux d'onboarding.
//
// Sprint 36.A : 4 questions essentielles sur la marque avant le premier wow.
// Sprint 37 Lot 1 (doctrine doc 09 §2-3, décisions Apple #40 + #36) :
//   * Ajoute 2 questions doctrinales après les 4 questions marque :
//       - Persona pilote ("tu pilotes / c'est la tienne")
//       - Curseur fréquence ("discret / équilibré / dense")
//   * Après submit réussi, on n'enchaîne plus directement sur /aujourd-hui :
//     on affiche la mini-onboarding du conseiller (3 écrans skippables),
//     qui décide elle-même de la destination de sortie.

'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { OnboardingProgress } from './OnboardingProgress'
import { OnboardingStep } from './OnboardingStep'
import {
  OnboardingChoiceStep,
  type OnboardingChoiceOption,
} from './OnboardingChoiceStep'
// Sprint 40 Phase 2B — import ConseillerIntro retiré (Bloc 16 proposed-deletions).

type TextQuestion = {
  kind: 'text'
  id: 'nom' | 'secteur' | 'ton' | 'singularite'
  prompt: string
  placeholder: string
  multiline: boolean
  maxLength: number
  rows?: number
}

type ChoiceQuestion = {
  kind: 'choice'
  id: 'pilot_role' | 'publication_frequency'
  prompt: string
  options: ReadonlyArray<OnboardingChoiceOption>
}

type Question = TextQuestion | ChoiceQuestion

const TEXT_QUESTIONS: ReadonlyArray<TextQuestion> = [
  {
    kind: 'text',
    id: 'nom',
    prompt: 'Quel est le nom de ta marque ?',
    placeholder: '',
    multiline: false,
    maxLength: 80,
  },
  {
    kind: 'text',
    id: 'secteur',
    prompt: 'Dans quel secteur évolue ta marque ?',
    placeholder: 'Joaillerie contemporaine, café de spécialité, hôtellerie haut de gamme…',
    multiline: false,
    maxLength: 120,
  },
  {
    kind: 'text',
    id: 'ton',
    prompt: "Comment ta marque s’exprime-t-elle ?",
    placeholder:
      "Avec retenue et précision, en privilégiant le mot juste plutôt que l’effet…",
    multiline: true,
    maxLength: 280,
    rows: 3,
  },
  {
    kind: 'text',
    id: 'singularite',
    prompt: "Qu’est-ce qui rend ta marque unique ?",
    placeholder:
      "Notre savoir-faire transmis depuis trois générations, ou notre approche radicale d’un secteur saturé…",
    multiline: true,
    maxLength: 400,
    rows: 4,
  },
]

const CHOICE_QUESTIONS: ReadonlyArray<ChoiceQuestion> = [
  {
    kind: 'choice',
    id: 'pilot_role',
    // Formulation textuelle actée Apple salve 2 (décision Lead #40).
    prompt:
      "Tu pilotes une marque (responsable comm, freelance) ou c'est la tienne (fondateur·rice) ?",
    options: [
      {
        value: 'pilots',
        label: 'Je pilote une marque',
        sublabel: 'Responsable comm, freelance.',
      },
      {
        value: 'owns',
        label: "C'est ma marque",
        sublabel: 'Fondateur·rice.',
      },
    ],
  },
  {
    kind: 'choice',
    id: 'publication_frequency',
    // Doctrine doc 09 §3.
    prompt: 'À quel rythme tu publies ?',
    options: [
      {
        value: 'discreet',
        label: 'Discret',
        sublabel: '1 à 2 posts par semaine. Marques ultra premium.',
      },
      {
        value: 'balanced',
        label: 'Équilibré',
        sublabel: '2 à 4 posts par semaine. Marques établies premium.',
      },
      {
        value: 'dense',
        label: 'Dense',
        sublabel: '5 à 7 posts par semaine. Secteurs à forte cadence.',
      },
    ],
  },
]

const QUESTIONS: ReadonlyArray<Question> = [...TEXT_QUESTIONS, ...CHOICE_QUESTIONS]
const TOTAL = QUESTIONS.length

type Answers = {
  nom: string
  secteur: string
  ton: string
  singularite: string
  pilot_role: string | null
  publication_frequency: string | null
}

type Status = 'editing' | 'submitting' | 'intro' | 'error'

export function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({
    nom: '',
    secteur: '',
    ton: '',
    singularite: '',
    pilot_role: null,
    publication_frequency: null,
  })
  const [status, setStatus] = useState<Status>('editing')
  const [error, setError] = useState<string | null>(null)

  const current = useMemo(() => QUESTIONS[step], [step])
  const isLast = step === TOTAL - 1

  if (!current) return null

  const canContinue =
    current.kind === 'text'
      ? answers[current.id].trim().length > 0
      : answers[current.id] !== null

  function updateText(id: TextQuestion['id'], next: string) {
    setAnswers((prev) => ({ ...prev, [id]: next }))
  }

  function updateChoice(id: ChoiceQuestion['id'], next: string) {
    setAnswers((prev) => ({ ...prev, [id]: next }))
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
      // Sprint 40 Phase 2B — mini-onboarding du conseiller dégagé (Bloc 16).
      // Bascule directe sur /aujourd-hui après onboarding marque.
      window.location.href = '/aujourd-hui'
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  // Sprint 40 Phase 2B — branche status === 'intro' retirée (ConseillerIntro dégagé).

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

      {current.kind === 'text' ? (
        <OnboardingStep
          question={current.prompt}
          value={answers[current.id]}
          onChange={(next) => updateText(current.id, next)}
          multiline={current.multiline}
          placeholder={current.placeholder}
          maxLength={current.maxLength}
          {...(current.rows !== undefined ? { rows: current.rows } : {})}
        />
      ) : (
        <OnboardingChoiceStep
          question={current.prompt}
          options={current.options}
          value={answers[current.id]}
          onChange={(next) => updateChoice(current.id, next)}
        />
      )}

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
