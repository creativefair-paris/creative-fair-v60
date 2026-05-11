// Sprint 36.B — Card timeline refondue iOS 26.
// Non-cliquable (Sprint 36.C ajoutera l'ouverture en Split Brief).
// Bordure latérale colorée selon le pilier. L'angle complet est retiré.

import type { PostRow } from '@/types/programme'

type PostCardProps = {
  post: Pick<PostRow, 'id' | 'jour' | 'heure_prevue' | 'type_contenu' | 'pilier_nom' | 'titre'>
  accentColor: string
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

export function PostCard({ post, accentColor }: PostCardProps) {
  return (
    <article
      className="post-card glass-thin"
      style={{
        padding: 24,
        borderRadius: 24,
        marginBottom: 16,
        borderLeft: `4px solid ${accentColor}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        className="post-header"
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          fontWeight: 400,
          color: 'var(--color-secondary-label)',
          marginBottom: 12,
        }}
      >
        {capitalize(post.jour)} · {formatHeure(post.heure_prevue)}
      </header>

      <h3
        className="post-titre"
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 17,
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: '-0.012em',
          color: 'var(--color-label)',
          margin: 0,
          marginBottom: 8,
        }}
      >
        {post.titre}
      </h3>

      <p
        className="post-meta"
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          color: 'var(--color-secondary-label)',
          margin: 0,
        }}
      >
        {TYPE_LABELS[post.type_contenu]} · {post.pilier_nom}
      </p>
    </article>
  )
}
