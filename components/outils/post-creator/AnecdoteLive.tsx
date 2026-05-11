// SUPPRESSION CANDIDATE Sprint 36 — composant legacy déplacé en Sprint 32.5
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PostDraft } from '@/types/post-draft'

type Props = {
  postId: string
  draft: PostDraft
  onDraftChange: (next: PostDraft) => void
}

type StepStatus = 'pending' | 'loading' | 'done'

type Step = {
  id: 1 | 2 | 3 | 4 | 5 | 6
  title: string
  loadingPhrase: string
}

const STEPS: Step[] = [
  { id: 1, title: 'Actualité', loadingPhrase: 'Je cherche ce qui se passe aujourd\u2019hui…' },
  { id: 2, title: 'Angle', loadingPhrase: 'Je trouve l\u2019angle qui te ressemble…' },
  { id: 3, title: 'Hook', loadingPhrase: 'Je construis l\u2019accroche…' },
  { id: 4, title: 'Slides', loadingPhrase: 'Je rédige les slides…' },
  { id: 5, title: 'Légende', loadingPhrase: 'Je finalise la légende…' },
  { id: 6, title: 'Finalisation', loadingPhrase: 'Ta publication est prête.' },
]

type StepResult =
  | { kind: 'choices'; options: string[]; selected?: string }
  | { kind: 'text'; value: string }
  | { kind: 'list'; items: string[] }

type State = {
  current: 1 | 2 | 3 | 4 | 5 | 6
  status: StepStatus
  results: Partial<Record<Step['id'], StepResult>>
  error: string | null
}

export function AnecdoteLive({ postId, draft, onDraftChange }: Props) {
  const router = useRouter()
  const [state, setState] = useState<State>({
    current: 1,
    status: 'pending',
    results: {},
    error: null,
  })

  async function runStep(stepId: Step['id'], userInput?: string) {
    setState((s) => ({ ...s, status: 'loading', error: null }))
    try {
      const res = await fetch('/api/ai/post-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          step: stepId,
          type: 'anecdote_live',
          userInput,
          draft,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(data?.error ?? 'Génération impossible.')
      }
      const data = (await res.json()) as {
        result: StepResult
        draft: PostDraft
      }
      onDraftChange(data.draft)
      setState((s) => {
        const isAutoAdvance =
          data.result.kind === 'choices' || stepId === 6
        return {
          ...s,
          results: { ...s.results, [stepId]: data.result },
          status: isAutoAdvance ? 'done' : 'pending',
          current:
            stepId < 6
              ? ((stepId + 1) as State['current'])
              : (6 as State['current']),
        }
      })
      if (stepId === 6) router.refresh()
    } catch (err) {
      setState((s) => ({
        ...s,
        status: 'pending',
        error: err instanceof Error ? err.message : 'Génération impossible.',
      }))
    }
  }

  function chooseOption(stepId: Step['id'], value: string) {
    setState((s) => {
      const prev = s.results[stepId]
      if (prev?.kind !== 'choices') return s
      return {
        ...s,
        results: {
          ...s.results,
          [stepId]: { ...prev, selected: value },
        },
      }
    })
    void runStep((stepId + 1) as Step['id'], value)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{
            color: 'var(--color-text)',
            fontFamily: 'var(--font-display)',
          }}
        >
          Anecdote live
        </h2>
        <p
          className="text-sm"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Six étapes guidées. Tu valides à chaque étape.
        </p>
      </div>

      {state.error && (
        <p
          className="text-sm"
          style={{ color: 'var(--color-error)', fontFamily: 'var(--font-body)' }}
        >
          {state.error}
        </p>
      )}

      <ol className="space-y-4">
        {STEPS.map((step) => {
          const isCurrent = state.current === step.id
          const isPast = state.current > step.id
          const result = state.results[step.id]

          return (
            <li
              key={step.id}
              className="glass-z1 px-4 py-3 space-y-3"
              style={{ opacity: !isCurrent && !isPast ? 0.45 : 1 }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{
                    color: isCurrent
                      ? 'var(--color-accent)'
                      : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Étape {step.id} · {step.title}
                </p>
              </div>

              {isCurrent && state.status === 'pending' && !result && (
                <button
                  type="button"
                  onClick={() => runStep(step.id)}
                  className="px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accent-fg)',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {step.id === 1 ? 'Lancer' : 'Continuer'}
                </button>
              )}

              {isCurrent && state.status === 'loading' && (
                <div className="space-y-2 animate-pulse">
                  <div
                    className="h-3 w-3/4 rounded"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  />
                  <div
                    className="h-3 w-2/3 rounded"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  />
                  <p
                    className="text-xs pt-1"
                    style={{
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {step.loadingPhrase}
                  </p>
                </div>
              )}

              {result?.kind === 'choices' && (
                <ul className="space-y-2">
                  {result.options.map((opt, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => chooseOption(step.id, opt)}
                        className="w-full text-left px-3 py-2 text-sm transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor:
                            result.selected === opt
                              ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)'
                              : 'var(--color-background)',
                          border:
                            result.selected === opt
                              ? '1px solid var(--color-accent)'
                              : '1px solid var(--color-border)',
                          borderRadius: 'var(--radius)',
                          color: 'var(--color-text)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {result?.kind === 'text' && (
                <p
                  className="text-sm leading-relaxed whitespace-pre-line"
                  style={{
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {result.value}
                </p>
              )}

              {result?.kind === 'list' && (
                <ul className="space-y-1.5">
                  {result.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm leading-relaxed"
                      style={{
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <span
                        className="font-medium"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {i + 1}.
                      </span>{' '}
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
