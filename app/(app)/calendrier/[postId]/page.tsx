import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DeletePostButton } from '@/components/calendar/DeletePostButton'

type PostRow = {
  id: string
  scheduled_for: string | null
  status: 'draft' | 'in_progress' | 'ready' | 'scheduled' | 'published'
  type: string | null
  channel: string | null
  business_event_id: string | null
  content: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

const STATUS_LABEL: Record<PostRow['status'], string> = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  ready: 'Prêt à programmer',
  scheduled: 'Programmé',
  published: 'Publié',
}

function typeLabel(type: string | null): string {
  switch (type) {
    case 'anecdote_live':
      return 'Anecdote live'
    case 'anecdote_custom':
      return 'Anecdote'
    case 'reels':
      return 'Reels'
    case 'story':
      return 'Format éphémère'
    case 'newsletter':
      return 'Newsletter'
    case 'unsupported':
      return 'Format à briefer'
    default:
      return 'Publication'
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Non planifié'
  const d = new Date(iso)
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

type Params = { postId: string }

export default async function PostDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { postId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawPost } = await supabase
    .from('posts')
    .select(
      'id, scheduled_for, status, type, channel, business_event_id, content, created_at, updated_at',
    )
    .eq('id', postId)
    .maybeSingle()

  const post = rawPost as PostRow | null
  if (!post) notFound()

  const content = post.content ?? {}
  const hook = (content.hook as string | undefined) ?? null
  const angle = (content.angle as string | undefined) ?? null
  const caption = (content.caption as string | undefined) ?? null

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-2xl mx-auto w-full space-y-8">
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

        <header className="space-y-2">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
          >
            {typeLabel(post.type)} · {STATUS_LABEL[post.status]}
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            {hook ?? 'Publication sans hook'}
          </h1>
          <p
            className="text-sm"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {formatDate(post.scheduled_for)}
          </p>
        </header>

        {angle && (
          <section className="space-y-2">
            <p
              className="text-xs uppercase tracking-wide"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Angle
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {angle}
            </p>
          </section>
        )}

        {caption && (
          <section className="space-y-2">
            <p
              className="text-xs uppercase tracking-wide"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Légende
            </p>
            <p
              className="text-sm leading-relaxed whitespace-pre-line"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {caption}
            </p>
          </section>
        )}

        <div className="flex items-center justify-between pt-4 flex-wrap gap-4">
          <Link
            href={`/post-creator/${post.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-fg)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Éditer
            <ArrowRight size={14} />
          </Link>

          <DeletePostButton postId={post.id} />
        </div>
      </div>
    </main>
  )
}
