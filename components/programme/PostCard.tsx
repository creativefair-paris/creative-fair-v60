// Sprint 36.A — Card timeline post (Chantier D.6)
// Server Component. Non-cliquable Sprint 36.A (page détail = Sprint 37).

import type { PostRow } from '@/types/programme'

type PostCardProps = {
  post: Pick<PostRow, 'id' | 'jour' | 'heure_prevue' | 'type_contenu' | 'pilier_nom' | 'titre' | 'angle'>
}

const TYPE_LABELS: Record<PostRow['type_contenu'], string> = {
  photo: 'Photo',
  carousel: 'Carousel',
  video: 'Vidéo',
  texte: 'Texte',
}

function formatHeure(heure: string): string {
  // "09:00:00" -> "09:00"
  return heure.slice(0, 5)
}

function capitalize(s: string): string {
  return s.length > 0 ? s[0]!.toUpperCase() + s.slice(1) : s
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article
      className="glass-thin"
      style={{
        padding: 20,
        borderRadius: 'var(--radius-2)',
        marginBottom: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <header
        className="text-footnote"
        style={{
          color: 'var(--color-secondary-label)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span>{capitalize(post.jour)}</span>
        <span aria-hidden="true">·</span>
        <span>{formatHeure(post.heure_prevue)}</span>
        <span aria-hidden="true">·</span>
        <span>{TYPE_LABELS[post.type_contenu]}</span>
      </header>

      <span
        className="glass-thin text-subheadline"
        style={{
          alignSelf: 'flex-start',
          padding: '4px 10px 5px',
          borderRadius: 999,
          color: 'var(--color-label)',
          backgroundColor: 'rgba(255, 255, 255, 0.45)',
        }}
      >
        {post.pilier_nom}
      </span>

      <h3
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: '-0.012em',
          color: 'var(--color-label)',
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {post.titre}
      </h3>

      <p
        className="text-subheadline"
        style={{
          color: 'var(--color-secondary-label)',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {post.angle}
      </p>
    </article>
  )
}
