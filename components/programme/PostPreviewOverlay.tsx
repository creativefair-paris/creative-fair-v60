// Sprint 37.I (F74+F75+F76) — Bulle preview overlay réutilisable.
//
// Apple-style modal :
// - Backdrop rgba(0, 0, 0, 0.4) clickable → ferme
// - Card centrée 480px, max-height 85vh scrollable
// - Bouton X en haut à droite
// - Escape ferme
// - Click sur card ne ferme PAS (stopPropagation)
// - Réutilise PostMiniChat (Sprint 37.H F69) pour la conversation

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { PostMiniChat } from './PostMiniChat'

export type OverlayPost = {
  id: string
  date_prevue: string | null
  format: string | null
  structure_type: string | null
  pilier_nom: string | null
  objectif_editorial: string | null
  angle: string | null
  titre: string | null
}

type Props = {
  post: OverlayPost | null
  onClose: () => void
}

const FORMAT_COLOR: Record<string, string> = {
  anecdote: '#007AFF',
  produit: '#34C759',
  evenement: '#FF9500',
  coulisses: '#AF52DE',
  manifeste: '#FF3B30',
  question: '#5856D6',
}
const FORMAT_LABEL: Record<string, string> = {
  anecdote: 'Anecdote',
  produit: 'Produit',
  evenement: 'Événement',
  coulisses: 'Coulisses',
  manifeste: 'Manifeste',
  question: 'Question',
}

function formatLongFr(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const jours = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ]
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`
}

export function PostPreviewOverlay({ post, onClose }: Props) {
  useEffect(() => {
    if (!post) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    // Lock scroll body pour éviter le shift visible.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [post, onClose])

  if (!post) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-preview-overlay-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'cfs-overlay-fade-in 220ms ease-out',
      }}
    >
      <article
        onClick={(e) => e.stopPropagation()}
        className="glass-regular"
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: 18,
          padding: '24px 26px',
          background: 'rgba(251, 250, 247, 0.98)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.16)',
          position: 'relative',
          animation: 'cfs-overlay-card-in 220ms cubic-bezier(0.32, 0.72, 0, 1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la preview"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: 16,
            border: 'none',
            background: 'rgba(120, 120, 128, 0.12)',
            color: 'var(--color-label)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <header style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {post.format ? (
              <span
                style={{
                  padding: '3px 9px',
                  borderRadius: 6,
                  fontFamily: 'var(--font-system)',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#FFFFFF',
                  background: FORMAT_COLOR[post.format] ?? '#8E8E93',
                }}
              >
                {FORMAT_LABEL[post.format] ?? post.format}
              </span>
            ) : null}
            {post.structure_type ? (
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--color-secondary-label)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                }}
              >
                {post.structure_type}
              </span>
            ) : null}
            {post.date_prevue ? (
              <span style={{ fontSize: 12, color: 'var(--color-tertiary-label)' }}>
                {formatLongFr(post.date_prevue)}
              </span>
            ) : null}
          </div>
          <h2
            id="post-preview-overlay-title"
            style={{
              margin: 0,
              fontFamily: 'var(--font-system)',
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--color-label)',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}
          >
            {post.objectif_editorial ?? post.titre ?? 'Post sans titre'}
          </h2>
        </header>

        {post.angle ? (
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'rgba(0, 0, 0, 0.75)' }}>
            {post.angle}
          </p>
        ) : null}

        {post.pilier_nom ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              alignSelf: 'flex-start',
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(0, 122, 255, 0.08)',
              border: '1px solid rgba(0, 122, 255, 0.18)',
              color: '#007AFF',
            }}
          >
            Pilier : {post.pilier_nom}
          </span>
        ) : null}

        <PostMiniChat postId={post.id} />

        <footer style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link
            href={`/programme/posts/${post.id}`}
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Éditer ce post →
          </Link>
        </footer>

        <style>{`
          @keyframes cfs-overlay-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes cfs-overlay-card-in {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
          @media (prefers-reduced-motion: reduce) {
            [role="dialog"], [role="dialog"] > * { animation: none !important; }
          }
        `}</style>
      </article>
    </div>
  )
}
