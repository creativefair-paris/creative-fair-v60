// Sprint 36.B.1 — Chantier D : carte compacte pour grille calendrier.
// Glass-thin, bordure latérale couleur pilier, cliquable (ouvre PostDetailSheet).

'use client'

import type { PostRow } from '@/types/programme'

type MiniPostCardProps = {
  post: Pick<PostRow, 'id' | 'titre' | 'heure_prevue' | 'pilier_nom' | 'type_contenu'>
  accentColor: string
  variant?: 'semaine' | 'mois'
  onClick?: () => void
}

function formatHeure(heure: string): string {
  return heure.slice(0, 5)
}

const TYPE_LABELS: Record<PostRow['type_contenu'], string> = {
  photo: 'Photo',
  carousel: 'Carousel',
  video: 'Vidéo',
  texte: 'Texte',
}

export function MiniPostCard({
  post,
  accentColor,
  variant = 'semaine',
  onClick,
}: MiniPostCardProps) {
  if (variant === 'mois') {
    // Mois : version ultra-compacte (dot + heure + 1ère ligne titre tronqué)
    return (
      <button
        type="button"
        onClick={onClick}
        className="cfs-mini-post cfs-mini-post--mois glass-thin"
        aria-label={`${post.titre} à ${formatHeure(post.heure_prevue)}`}
        style={{ borderLeftColor: accentColor }}
      >
        <span className="cfs-mini-post__heure">{formatHeure(post.heure_prevue)}</span>
        <span className="cfs-mini-post__titre">{post.titre}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="cfs-mini-post cfs-mini-post--semaine glass-thin"
      aria-label={`${post.titre} à ${formatHeure(post.heure_prevue)}`}
      style={{ borderLeftColor: accentColor }}
    >
      <span className="cfs-mini-post__heure">{formatHeure(post.heure_prevue)}</span>
      <span className="cfs-mini-post__titre">{post.titre}</span>
      <span className="cfs-mini-post__type">{TYPE_LABELS[post.type_contenu]}</span>
    </button>
  )
}
