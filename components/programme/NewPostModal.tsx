// SUPPRESSION CANDIDATE Sprint 33 — composant legacy déplacé en Sprint 32.5
'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, PenSquare, FileText, X } from 'lucide-react'
import { createPost } from '@/lib/posts/actions'

type Choice = 'anecdote_live' | 'anecdote_custom' | 'unsupported'

type Option = {
  choice: Choice
  title: string
  description: string
  Icon: typeof Zap
}

const OPTIONS: Option[] = [
  {
    choice: 'anecdote_live',
    title: 'Anecdote live',
    description: 'À partir de l\u2019actualité d\u2019aujourd\u2019hui',
    Icon: Zap,
  },
  {
    choice: 'anecdote_custom',
    title: 'Anecdote',
    description: 'À partir d\u2019un sujet de ton choix',
    Icon: PenSquare,
  },
  {
    choice: 'unsupported',
    title: 'Format non supporté',
    description: 'Reels, format éphémère, newsletter — je te prépare un brief',
    Icon: FileText,
  },
]

type Props = {
  open: boolean
  onClose: () => void
  scheduledIso?: string | null
}

export function NewPostModal({ open, onClose, scheduledIso }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function pick(choice: Choice) {
    startTransition(async () => {
      const scheduled = scheduledIso
        ? new Date(`${scheduledIso}T09:00:00`).toISOString()
        : null
      const { id } = await createPost({
        type: choice,
        scheduledFor: scheduled,
      })
      onClose()
      router.push(`/post-creator/${id}`)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-z3 glass-pop-in w-full md:max-w-md md:mx-4 px-6 py-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p
            className="text-sm font-medium"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Quel format aujourd&rsquo;hui ?
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 inline-flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <ul className="space-y-2">
          {OPTIONS.map(({ choice, title, description, Icon }) => (
            <li key={choice}>
              <button
                type="button"
                onClick={() => pick(choice)}
                disabled={isPending}
                className="w-full flex items-start gap-3 px-4 py-3 text-left transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--color-background)',
                }}
              >
                <span
                  className="w-9 h-9 inline-flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--color-text)',
                  }}
                >
                  <Icon size={16} />
                </span>
                <span className="flex-1 min-w-0 space-y-0.5">
                  <span
                    className="block text-sm font-medium"
                    style={{
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {title}
                  </span>
                  <span
                    className="block text-xs leading-relaxed"
                    style={{
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
