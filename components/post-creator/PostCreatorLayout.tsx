'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { PostDraft, PostType } from '@/types/post-draft'
import { ContextColumn } from './ContextColumn'
import { PreviewIOS } from './PreviewIOS'

type Props = {
  postId: string
  initialType: PostType | null
  initialDraft: PostDraft
  brandName?: string
}

export function PostCreatorLayout({ postId, initialType, initialDraft, brandName }: Props) {
  const [draft, setDraft] = useState<PostDraft>(initialDraft)

  return (
    <main
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-6xl mx-auto w-full space-y-8">
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

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <ContextColumn
              postId={postId}
              initialType={initialType}
              draft={draft}
              onDraftChange={setDraft}
            />
          </section>

          <aside className="lg:sticky lg:top-10 lg:self-start">
            <PreviewIOS draft={draft} brandName={brandName} />
          </aside>
        </div>
      </div>
    </main>
  )
}
