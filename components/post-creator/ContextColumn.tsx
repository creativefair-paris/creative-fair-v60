'use client'

import { useState } from 'react'
import type { PostDraft, PostType } from '@/types/post-draft'
import { AnecdoteLive } from './AnecdoteLive'
import { AnecdoteCustom } from './AnecdoteCustom'
import { BriefExterne } from './BriefExterne'

type Tab = 'anecdote_live' | 'anecdote_custom' | 'brief'

type Props = {
  postId: string
  initialType: PostType | null
  draft: PostDraft
  onDraftChange: (next: PostDraft) => void
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'anecdote_live', label: 'Anecdote live' },
  { id: 'anecdote_custom', label: 'Anecdote' },
  { id: 'brief', label: 'Brief externe' },
]

function tabFromType(type: PostType | null): Tab {
  if (type === 'anecdote_custom') return 'anecdote_custom'
  if (type === 'reels' || type === 'story' || type === 'newsletter' || type === 'unsupported') {
    return 'brief'
  }
  return 'anecdote_live'
}

export function ContextColumn({ postId, initialType, draft, onDraftChange }: Props) {
  const [tab, setTab] = useState<Tab>(tabFromType(initialType))

  return (
    <div className="space-y-6">
      <nav
        className="glass-z1 flex items-center gap-1 p-1"
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

      <div>
        {tab === 'anecdote_live' && (
          <AnecdoteLive
            postId={postId}
            draft={draft}
            onDraftChange={onDraftChange}
          />
        )}
        {tab === 'anecdote_custom' && (
          <AnecdoteCustom
            postId={postId}
            draft={draft}
            onDraftChange={onDraftChange}
          />
        )}
        {tab === 'brief' && (
          <BriefExterne
            postId={postId}
            draft={draft}
            onDraftChange={onDraftChange}
          />
        )}
      </div>
    </div>
  )
}
