// Sprint 36.B.1 — Chantier D : Sheet de détail post (lecture seule).
// Affiche les infos d'un post au clic depuis VueSemaine ou VueMois.
// Pas d'édition Sprint 36.B.1 — uniquement bouton Fermer.

'use client'

import { Sheet } from '@/components/layout/Sheet'
import type { PostRow } from '@/types/programme'

type PostDetailSheetProps = {
  open: boolean
  post: PostRow | null
  accentColor?: string
  onClose: () => void
}

const TYPE_LABELS: Record<PostRow['type_contenu'], string> = {
  photo: 'Photo',
  carousel: 'Carousel',
  video: 'Vidéo',
  texte: 'Texte',
}

function formatHeure(heure: string): string {
  return heure.slice(0, 5)
}

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function PostDetailSheet({
  open,
  post,
  accentColor,
  onClose,
}: PostDetailSheetProps) {
  return (
    <Sheet open={open && post != null} title={post?.titre ?? ''} onDismiss={onClose}>
      {post ? (
        <div className="cfs-post-detail">
          <div
            className="cfs-post-detail__meta"
            style={accentColor ? { borderLeftColor: accentColor } : undefined}
          >
            <span className="cfs-post-detail__date">{formatDate(post.date_prevue)}</span>
            <span className="cfs-post-detail__heure">{formatHeure(post.heure_prevue)}</span>
          </div>

          <dl className="cfs-post-detail__fields">
            <div className="cfs-post-detail__field">
              <dt>Pilier</dt>
              <dd>{post.pilier_nom}</dd>
            </div>
            <div className="cfs-post-detail__field">
              <dt>Format</dt>
              <dd>{TYPE_LABELS[post.type_contenu]}</dd>
            </div>
            {post.angle ? (
              <div className="cfs-post-detail__field">
                <dt>Angle</dt>
                <dd>{post.angle}</dd>
              </div>
            ) : null}
          </dl>

          <div className="cfs-post-detail__actions">
            <button
              type="button"
              onClick={onClose}
              className="cfs-post-detail__btn glass-thin"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </Sheet>
  )
}
