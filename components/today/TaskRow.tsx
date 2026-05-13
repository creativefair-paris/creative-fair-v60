// Sprint 36.G → 36.H — Ligne d'une tâche /aujourd-hui.
//
// Sprint 36.H Finding 6 : suppression du menu contextuel (boutons "..."
// avec 6 actions reporter/avancer). Remplacé par un lien latent
// "Demander →" à droite, opacity 0.4 au repos, 0.8 au hover de la ligne.
//
// Sprint 36.H Finding 4 : pastille statut redesignée 8px (cf. StateCircle),
// gap pastille-titre 12px, ligne sans cherche-d'action visuelle.
//
// Sprint 36.H Finding 7 : label "Reporté de N jours" sous le sous-titre
// si reported_from NOT NULL.

'use client'

import { useRouter } from 'next/navigation'
import { StateCircle } from '@/components/ui/state-circles/StateCircle'
import type { PostState, TaskPost } from '@/lib/types/post'
import { mapStatutToState } from '@/lib/types/post'
import { reportedLabel } from '@/lib/aujourd-hui/dates-fr'

type Props = {
  post: TaskPost
  // Affichage compact pour le bloc B "Cette semaine".
  variant?: 'today' | 'week'
  // Pour le calcul du label "Reporté de N jours" — passé par le parent.
  today?: Date
}

function heureLisible(heurePrevue: string): string {
  const [hRaw, mRaw] = heurePrevue.split(':')
  const h = Number(hRaw ?? 0)
  const m = Number(mRaw ?? 0)
  if (!Number.isFinite(h)) return ''
  if (!m || m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}

function buildTitle(state: PostState, heurePrevue: string): string {
  const h = heureLisible(heurePrevue)
  if (state === 'todo') return `Préparer le post de ${h}`
  if (state === 'ready') return `Prêt à publier · ${h}`
  if (state === 'published') return `Publié à ${h}`
  return `Publication échouée · ${h}`
}

function buildSubtitle(post: TaskPost): string {
  const tipoFr =
    post.type_contenu === 'photo' ? 'photo'
      : post.type_contenu === 'carousel' ? 'carrousel'
      : post.type_contenu === 'video' ? 'vidéo'
      : post.type_contenu === 'texte' ? 'texte'
      : post.type_contenu
  if (post.titre && post.titre.trim().length > 0) {
    return `${post.titre} · ${tipoFr}`
  }
  return tipoFr
}

export function TaskRow({ post, variant = 'today', today }: Props) {
  const router = useRouter()
  const state = mapStatutToState(post.statut)
  const titre = buildTitle(state, post.heure_prevue)
  const sousTitre = buildSubtitle(post)
  const isPublished = state === 'published'

  const reported = today
    ? reportedLabel(post.reported_from, post.date_prevue, today)
    : null

  return (
    <div
      className="cfs-task-row"
      data-variant={variant}
      data-state={state}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: variant === 'week' ? '10px 8px' : '12px 8px',
        borderRadius: 8,
        cursor: 'pointer',
        opacity: isPublished ? 0.5 : variant === 'week' ? 0.85 : 1,
        position: 'relative',
        transition: 'background-color 200ms ease-out',
      }}
      onClick={(e) => {
        // Ignore clicks on the conseiller link.
        if ((e.target as HTMLElement).closest('[data-conseiller-link="true"]')) return
        router.push(`/programme/post/${post.id}`)
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(0,0,0,0.02)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
      }}
    >
      <StateCircle state={state} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 15,
            fontWeight: 600,
            color: '#1C1C1E',
            lineHeight: 1.35,
            textDecoration: isPublished ? 'line-through' : 'none',
          }}
        >
          {titre}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(0,0,0,0.55)',
            lineHeight: 1.4,
          }}
        >
          {sousTitre}
        </span>
        {state === 'alert' ? (
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              fontWeight: 600,
              color: '#FF9500',
              marginTop: 2,
            }}
          >
            Publication échouée · Action requise
          </span>
        ) : null}
        {reported ? (
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              fontStyle: 'italic',
              color: 'rgba(0,0,0,0.55)',
              opacity: 0.85,
              marginTop: 2,
            }}
          >
            {reported}
          </span>
        ) : null}
      </div>

      {/* Sprint 36.H Finding 6 — lien latent vers Conseiller.
          Opacity 0.4 par défaut, 0.8 quand la ligne est hovered.
          Sur mobile, toujours visible (CSS @media). */}
      <a
        href={`/outils/conseiller?context=post_${encodeURIComponent(post.id)}`}
        data-conseiller-link="true"
        className="cfs-task-conseiller-link"
        onClick={(e) => {
          // Empêche la navigation parent vers /programme/post/<id>.
          e.stopPropagation()
        }}
        aria-label="Demander au Conseiller à propos de ce post"
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          fontWeight: 500,
          color: '#007AFF',
          textDecoration: 'none',
          flexShrink: 0,
          padding: '4px 6px',
          opacity: 0.4,
          transition: 'opacity 200ms ease-out',
        }}
      >
        Demander →
      </a>
    </div>
  )
}
