// SUPPRESSION CANDIDATE Sprint 33 — composant legacy déplacé en Sprint 32.5
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check } from 'lucide-react'
import type { PostDraft } from '@/types/post-draft'

type Props = {
  postId: string
  draft: PostDraft
  onDraftChange: (next: PostDraft) => void
}

type Format = 'reels' | 'story' | 'newsletter'

const FORMATS: { id: Format; label: string; description: string }[] = [
  { id: 'reels', label: 'Reels', description: 'Vidéo verticale courte (15-60s).' },
  { id: 'story', label: 'Format éphémère', description: 'Visuel ou vidéo qui disparaît en 24h.' },
  { id: 'newsletter', label: 'Newsletter', description: 'Email envoyé à ta liste.' },
]

export function BriefExterne({ postId, draft, onDraftChange }: Props) {
  const router = useRouter()
  const [format, setFormat] = useState<Format>(draft.briefFormat ?? 'reels')
  const [prompt, setPrompt] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    draft.brief ? 'ready' : 'idle',
  )
  const [brief, setBrief] = useState<string>(draft.brief ?? '')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function generate() {
    if (prompt.trim().length < 10) {
      setError('Décris ce que tu veux briefer en quelques phrases.')
      return
    }
    setStatus('loading')
    setError(null)
    try {
      const res = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, format, prompt }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Génération impossible.')
      }
      const data = (await res.json()) as { brief: string; draft: PostDraft }
      setBrief(data.brief)
      onDraftChange(data.draft)
      setStatus('ready')
      router.refresh()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Génération impossible.')
    }
  }

  async function copyBrief() {
    if (!brief) return
    try {
      await navigator.clipboard.writeText(brief)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Impossible de copier dans le presse-papier.')
    }
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
          Brief externe
        </h2>
        <p
          className="text-sm"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Pour les formats que tu confies à un prestataire. On rédige un brief structuré que tu peux copier directement.
        </p>
      </div>

      <div className="space-y-2">
        <p
          className="text-xs uppercase tracking-wide"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Format
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {FORMATS.map((f) => {
            const active = format === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id)}
                className="text-left px-3 py-2 transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: active
                    ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)'
                    : 'var(--color-surface)',
                  border: active
                    ? '1px solid var(--color-accent)'
                    : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  {f.label}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {f.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p
          className="text-xs uppercase tracking-wide"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Ton intention
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="Décris ce que tu veux que ce format raconte. Ce qui s'est passé, qui parle, ce qu'on doit comprendre."
          className="w-full px-3 py-2 text-sm"
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      {error && (
        <p
          className="text-sm"
          style={{ color: '#9B2828', fontFamily: 'var(--font-body)' }}
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={generate}
        disabled={status === 'loading'}
        className="px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-accent-fg)',
          borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {status === 'loading'
          ? 'Je rédige ton brief…'
          : brief
            ? 'Régénérer le brief'
            : 'Générer le brief'}
      </button>

      {brief && status !== 'loading' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p
              className="text-xs uppercase tracking-wide"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Brief généré
            </p>
            <button
              type="button"
              onClick={copyBrief}
              className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
          <pre
            className="glass-z1 text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              padding: '12px 14px',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {brief}
          </pre>
        </div>
      )}
    </div>
  )
}
