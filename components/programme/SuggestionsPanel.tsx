// SUPPRESSION CANDIDATE Sprint 33 — composant legacy déplacé en Sprint 32.5
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import type { Suggestion } from '@/types/suggestion'
import { createPost } from '@/lib/posts/actions'

const PHRASES = [
  'J\u2019analyse ton calendrier business…',
  'Je relie tes événements à ta voix…',
  'Je trouve les angles qui te ressemblent…',
]

type Status = 'idle' | 'loading' | 'ready' | 'error'

const TYPE_LABEL: Record<Suggestion['postType'], string> = {
  anecdote_live: 'Anecdote live',
  anecdote_custom: 'Anecdote',
  story: 'Format éphémère',
  reels: 'Reels',
}

export function SuggestionsPanel() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isPending, startTransition] = useTransition()

  async function load() {
    setStatus('loading')
    setError(null)
    setPhraseIndex(0)

    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % PHRASES.length)
    }, 3500)

    try {
      const res = await fetch('/api/ai/business-suggest', { method: 'POST' })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(data?.error ?? 'Génération impossible.')
      }
      const data = (await res.json()) as { suggestions: Suggestion[] }
      setSuggestions(data.suggestions)
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Génération impossible.')
      setStatus('error')
    } finally {
      clearInterval(interval)
    }
  }

  function onCreatePost(s: Suggestion) {
    startTransition(async () => {
      const initialContent = {
        hook: s.hook,
        angle: s.angle,
        rationale: s.rationale,
        eventName: s.eventName,
      }
      const { id } = await createPost({
        type: s.postType === 'story' || s.postType === 'reels' ? 'unsupported' : s.postType,
        scheduledFor: new Date(`${s.recommendedDate}T09:00:00`).toISOString(),
        initialContent,
        redirectAfter: undefined,
      })
      router.push(`/post-creator/${id}`)
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2
            className="text-base font-semibold tracking-tight"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Suggestions pour ce mois
          </h2>
          <p
            className="text-xs"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Angles alignés sur ton calendrier business
          </p>
        </div>

        {status === 'idle' && (
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-fg)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Sparkles size={14} />
            Voir les suggestions
          </button>
        )}

        {(status === 'ready' || status === 'error') && (
          <button
            type="button"
            onClick={load}
            className="text-xs underline transition-opacity hover:opacity-80"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Régénérer
          </button>
        )}
      </div>

      {status === 'loading' && (
        <div
          className="glass-z1 px-6 py-8 space-y-3 animate-pulse"
          aria-busy="true"
          aria-live="polite"
        >
          <div
            className="h-3 w-2/3 rounded"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
          <div
            className="h-3 w-1/2 rounded"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
          <p
            className="text-sm pt-3"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {PHRASES[phraseIndex]}
          </p>
        </div>
      )}

      {status === 'error' && (
        <p
          className="text-sm"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {error}
        </p>
      )}

      {status === 'ready' && (
        <ul className="space-y-3">
          {suggestions.map((s, idx) => (
            <li
              key={`${s.eventName}-${idx}`}
              className="glass-z1 px-5 py-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <p
                    className="text-[10px] font-medium tracking-wide uppercase"
                    style={{
                      color: 'var(--color-accent)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {TYPE_LABEL[s.postType]} · {s.eventName}
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {s.hook}
                  </p>
                </div>
                <p
                  className="text-xs whitespace-nowrap"
                  style={{
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {s.recommendedDate}
                </p>
              </div>

              <p
                className="text-xs leading-relaxed"
                style={{
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {s.angle}
              </p>

              <p
                className="text-xs leading-relaxed italic"
                style={{
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {s.rationale}
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => onCreatePost(s)}
                  disabled={isPending}
                  className="text-xs font-medium underline transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Créer cette publication
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
