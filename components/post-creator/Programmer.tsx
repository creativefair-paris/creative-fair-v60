'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Download, Share2 } from 'lucide-react'
import { schedulePost } from '@/lib/posts/actions'
import type { PostDraft } from '@/types/post-draft'

type Tab = 'recap' | 'download' | 'multichannel'

type Props = {
  postId: string
  draft: PostDraft
  initialScheduledFor: string | null
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'recap', label: 'Récap' },
  { id: 'download', label: 'Télécharger' },
  { id: 'multichannel', label: 'Multi-canal' },
]

function defaultDateTimeLocal(initial: string | null): string {
  const base = initial ? new Date(initial) : nextMorning()
  const y = base.getFullYear()
  const m = String(base.getMonth() + 1).padStart(2, '0')
  const d = String(base.getDate()).padStart(2, '0')
  const h = String(base.getHours()).padStart(2, '0')
  const min = String(base.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

function nextMorning(): Date {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(9, 0, 0, 0)
  return d
}

export function Programmer({ postId, draft, initialScheduledFor }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('recap')
  const [datetime, setDatetime] = useState<string>(
    defaultDateTimeLocal(initialScheduledFor),
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  function programmer() {
    setError(null)
    const iso = new Date(datetime).toISOString()
    if (Number.isNaN(new Date(iso).getTime())) {
      setError('Date invalide.')
      return
    }
    startTransition(async () => {
      try {
        await schedulePost(postId, iso)
        setConfirmed(true)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Programmation impossible.')
      }
    })
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{
            color: 'var(--color-text)',
            fontFamily: 'var(--font-display)',
          }}
        >
          Programmer
        </h2>
        <p
          className="text-sm"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Choisis quand cette publication doit partir, prépare-la pour téléchargement, ou prévois un format multi-canal.
        </p>
      </div>

      <nav
        className="flex items-center gap-1 p-1"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex-1 px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: active ? 'var(--color-background)' : 'transparent',
                color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                border: active ? '1px solid var(--color-border)' : '1px solid transparent',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </nav>

      {tab === 'recap' && (
        <div className="space-y-4">
          <div
            className="rounded-xl px-4 py-4 space-y-3"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
            }}
          >
            {draft.hook && (
              <div>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  Hook
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
                >
                  {draft.hook}
                </p>
              </div>
            )}
            {draft.angle && (
              <div>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  Angle
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
                >
                  {draft.angle}
                </p>
              </div>
            )}
            {draft.caption && (
              <div>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  Légende
                </p>
                <p
                  className="text-sm whitespace-pre-line"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
                >
                  {draft.caption}
                </p>
              </div>
            )}
            {draft.brief && !draft.caption && (
              <div>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  Brief
                </p>
                <p
                  className="text-sm whitespace-pre-line"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
                >
                  {draft.brief}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="text-xs uppercase tracking-wide block"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
              htmlFor="schedule-datetime"
            >
              Date et heure de publication
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar size={16} style={{ color: 'var(--color-text-muted)' }} />
              <input
                id="schedule-datetime"
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="px-3 py-2 text-sm"
                style={{
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>
          </div>

          {error && (
            <p
              className="text-sm"
              style={{ color: '#9B2828', fontFamily: 'var(--font-body)' }}
            >
              {error}
            </p>
          )}

          {confirmed ? (
            <p
              className="text-sm"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
            >
              Publication programmée. Tu la retrouves dans ton calendrier.
            </p>
          ) : (
            <button
              type="button"
              onClick={programmer}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-fg)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {isPending ? 'Je programme…' : 'Programmer cette publication'}
            </button>
          )}
        </div>
      )}

      {tab === 'download' && (
        <div
          className="rounded-xl px-4 py-6 space-y-2"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div className="flex items-center gap-2">
            <Download size={16} style={{ color: 'var(--color-text-muted)' }} />
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
            >
              Téléchargement des assets
            </p>
          </div>
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Disponible bientôt.
          </p>
        </div>
      )}

      {tab === 'multichannel' && (
        <div
          className="rounded-xl px-4 py-6 space-y-2"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div className="flex items-center gap-2">
            <Share2 size={16} style={{ color: 'var(--color-text-muted)' }} />
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
            >
              Diffusion multi-canal
            </p>
          </div>
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Disponible bientôt.
          </p>
        </div>
      )}
    </section>
  )
}
