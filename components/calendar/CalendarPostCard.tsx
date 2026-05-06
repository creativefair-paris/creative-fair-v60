import Link from 'next/link'

export type PostStatus =
  | 'draft'
  | 'in_progress'
  | 'ready'
  | 'scheduled'
  | 'published'

export type CalendarPost = {
  id: string
  scheduled_for: string | null
  status: PostStatus
  type: string | null
  content: { hook?: string } | null
}

const STATUS_LABEL: Record<PostStatus, string> = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  ready: 'Prêt',
  scheduled: 'Programmé',
  published: 'Publié',
}

function statusStyles(status: PostStatus): {
  border: string
  background: string
  opacity?: number
} {
  switch (status) {
    case 'draft':
      return { border: 'var(--color-border)', background: 'var(--color-surface)' }
    case 'in_progress':
      return { border: '#E07B00', background: 'var(--color-surface)' }
    case 'ready':
      return { border: '#2F7A45', background: 'var(--color-surface)' }
    case 'scheduled':
      return { border: '#2F7A45', background: 'rgba(47, 122, 69, 0.08)' }
    case 'published':
      return {
        border: 'var(--color-border)',
        background: 'var(--color-surface)',
        opacity: 0.6,
      }
  }
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
    default:
      return 'Publication'
  }
}

type Props = {
  post: CalendarPost
}

export function CalendarPostCard({ post }: Props) {
  const styles = statusStyles(post.status)
  const hook = post.content?.hook?.slice(0, 60) ?? ''

  return (
    <Link
      href={`/calendrier/${post.id}`}
      className="block px-2 py-1.5 transition-opacity hover:opacity-90"
      style={{
        backgroundColor: styles.background,
        border: `1px solid ${styles.border}`,
        borderRadius: 'var(--radius-sm, 6px)',
        opacity: styles.opacity,
      }}
    >
      <p
        className="text-[10px] font-medium tracking-wide uppercase"
        style={{
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {typeLabel(post.type)} · {STATUS_LABEL[post.status]}
      </p>
      {hook && (
        <p
          className="text-xs mt-0.5 line-clamp-2"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
        >
          {hook}
        </p>
      )}
    </Link>
  )
}
