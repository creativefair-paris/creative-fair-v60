'use client'

import type { PostDraft } from '@/types/post-draft'

type Props = {
  postId: string
  draft: PostDraft
  onDraftChange: (next: PostDraft) => void
}

export function AnecdoteCustom({ postId: _postId, draft: _draft, onDraftChange: _onDraftChange }: Props) {
  return (
    <div className="space-y-3">
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{
          color: 'var(--color-text)',
          fontFamily: 'var(--font-display)',
        }}
      >
        Anecdote
      </h2>
      <p
        className="text-sm leading-relaxed"
        style={{
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Tu nous racontes ton histoire, on construit la publication avec toi en six étapes.
      </p>
      <p
        className="text-xs"
        style={{
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Disponible bientôt.
      </p>
    </div>
  )
}
