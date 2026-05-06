'use client'

import type { PostDraft } from '@/types/post-draft'

type Props = {
  postId: string
  draft: PostDraft
  onDraftChange: (next: PostDraft) => void
}

export function BriefExterne({ postId: _postId, draft: _draft, onDraftChange: _onDraftChange }: Props) {
  return (
    <div className="space-y-3">
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
        className="text-sm leading-relaxed"
        style={{
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Pour les formats que tu confies à un prestataire, on rédige un brief clair que tu peux copier.
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
