// SUPPRESSION CANDIDATE Sprint 33 — composant legacy déplacé en Sprint 32.5
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { PostDraft, PostStatus, PostType } from '@/types/post-draft'
import { ContextColumn } from './ContextColumn'
import { PreviewIOS } from './PreviewIOS'
import { Programmer } from './Programmer'

type Mode = 'edit' | 'programmer'

type Props = {
  postId: string
  initialType: PostType | null
  initialDraft: PostDraft
  initialStatus: PostStatus
  initialScheduledFor: string | null
  brandName?: string
}

export function PostCreatorLayout({
  postId,
  initialType,
  initialDraft,
  initialStatus,
  initialScheduledFor,
  brandName,
}: Props) {
  const [draft, setDraft] = useState<PostDraft>(initialDraft)
  const [mode, setMode] = useState<Mode>(
    initialStatus === 'ready' || initialStatus === 'scheduled' ? 'programmer' : 'edit',
  )

  const canProgrammer =
    initialStatus === 'ready' ||
    initialStatus === 'scheduled' ||
    Boolean(draft.hook) ||
    Boolean(draft.brief)

  return (
    <main
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link
            href="/calendrier"
            className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <ArrowLeft size={14} />
            Retour au calendrier
          </Link>

          {canProgrammer && (
            <div
              className="glass-z1 flex items-center gap-1 p-1"
            >
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
                style={{
                  backgroundColor:
                    mode === 'edit' ? 'var(--color-background)' : 'transparent',
                  color:
                    mode === 'edit'
                      ? 'var(--color-text)'
                      : 'var(--color-text-muted)',
                  border:
                    mode === 'edit'
                      ? '1px solid var(--color-border)'
                      : '1px solid transparent',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Éditer
              </button>
              <button
                type="button"
                onClick={() => setMode('programmer')}
                className="px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
                style={{
                  backgroundColor:
                    mode === 'programmer' ? 'var(--color-background)' : 'transparent',
                  color:
                    mode === 'programmer'
                      ? 'var(--color-text)'
                      : 'var(--color-text-muted)',
                  border:
                    mode === 'programmer'
                      ? '1px solid var(--color-border)'
                      : '1px solid transparent',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Programmer
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            {mode === 'edit' ? (
              <ContextColumn
                postId={postId}
                initialType={initialType}
                draft={draft}
                onDraftChange={setDraft}
              />
            ) : (
              <Programmer
                postId={postId}
                draft={draft}
                initialScheduledFor={initialScheduledFor}
              />
            )}
          </section>

          <aside className="lg:sticky lg:top-10 lg:self-start">
            <PreviewIOS draft={draft} brandName={brandName} />
          </aside>
        </div>
      </div>
    </main>
  )
}
