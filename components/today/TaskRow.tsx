// Sprint 36.G — Ligne d'une tâche /aujourd-hui (post ou rang).
//
// Rendu : cercle d'état + titre + sous-titre + heure + bouton "..."
// Click ligne → navigue vers /programme/post/[id]
// Click bouton "..." → ouvre ContextMenu (desktop) ou long-press (mobile)

'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StateCircle } from '@/components/ui/state-circles/StateCircle'
import { ContextMenu, type ContextMenuItem } from '@/components/ui/context-menu/ContextMenu'
import { useLongPress } from '@/components/ui/context-menu/use-long-press'
import { shiftPostDate } from '@/app/_actions/shift-post-date'
import type { PostState, TaskPost } from '@/lib/types/post'
import { mapStatutToState, getScheduledAt } from '@/lib/types/post'

type Props = {
  post: TaskPost
  // Affichage compact pour le bloc B "Cette semaine".
  variant?: 'today' | 'week'
}

function heureLisible(heurePrevue: string): string {
  // "HH:MM:SS" → "HHhMM" ou "HHh" si MM=00
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
  // "Titre du post · type"
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

export function TaskRow({ post, variant = 'today' }: Props) {
  const router = useRouter()
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; left: number } | null>(null)
  const [isPending, startTransition] = useTransition()
  const dotsBtnRef = useRef<HTMLButtonElement | null>(null)

  const state = mapStatutToState(post.statut)
  const titre = buildTitle(state, post.heure_prevue)
  const sousTitre = buildSubtitle(post)
  const isPublished = state === 'published'

  const openMenu = useCallback(() => {
    const btn = dotsBtnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setMenuAnchor({ top: rect.bottom + 4, left: Math.max(8, rect.right - 220) })
  }, [])

  const closeMenu = useCallback(() => setMenuAnchor(null), [])

  const onShift = useCallback(
    (days: number) => {
      startTransition(async () => {
        await shiftPostDate(post.id, days)
        // revalidatePath dans la server action invalide /aujourd-hui ;
        // le refresh est implicite au prochain navigate. Forcer ici
        // garantit l'update immédiate à l'écran.
        router.refresh()
      })
    },
    [post.id, router],
  )

  const longPressHandlers = useLongPress(openMenu)

  const items: ContextMenuItem[] = [
    { kind: 'action', label: "Reporter d'1 jour", onActivate: () => onShift(1) },
    { kind: 'action', label: 'Reporter de 2 jours', onActivate: () => onShift(2) },
    { kind: 'action', label: 'Reporter de 3 jours', onActivate: () => onShift(3) },
    { kind: 'action', label: "Avancer d'1 jour", onActivate: () => onShift(-1) },
    { kind: 'action', label: 'Avancer de 2 jours', onActivate: () => onShift(-2) },
    { kind: 'action', label: 'Avancer de 3 jours', onActivate: () => onShift(-3) },
    { kind: 'separator' },
    {
      kind: 'action',
      label: 'Demander au Conseiller',
      onActivate: () =>
        router.push(`/outils/conseiller?context=post_${encodeURIComponent(post.id)}`),
    },
  ]

  return (
    <div
      className="cfs-task-row"
      data-variant={variant}
      data-state={state}
      {...longPressHandlers}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: variant === 'week' ? '10px 8px' : '12px 8px',
        borderRadius: 8,
        cursor: 'pointer',
        opacity: isPublished ? 0.5 : variant === 'week' ? 0.85 : 1,
        position: 'relative',
        transition: 'background-color 120ms ease-out',
      }}
      onClick={(e) => {
        // Ignore clicks on the dots button.
        if ((e.target as HTMLElement).closest('[data-row-dots="true"]')) return
        router.push(`/programme/post/${post.id}`)
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(0,0,0,0.03)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
      }}
    >
      <span style={{ paddingTop: 2 }}>
        <StateCircle state={state} />
      </span>
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
        ) : state === 'ready' ? (
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              fontWeight: 500,
              color: '#007AFF',
              marginTop: 2,
            }}
          >
            Prêt à publier
          </span>
        ) : null}
      </div>

      <button
        ref={dotsBtnRef}
        type="button"
        data-row-dots="true"
        aria-label="Actions sur ce post"
        onClick={(e) => {
          e.stopPropagation()
          if (menuAnchor) closeMenu()
          else openMenu()
        }}
        disabled={isPending}
        style={{
          all: 'unset',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 6,
          cursor: 'pointer',
          color: 'rgba(0,0,0,0.45)',
          flexShrink: 0,
          opacity: isPending ? 0.4 : 1,
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 700, letterSpacing: 1 }}>···</span>
      </button>

      {menuAnchor ? <ContextMenu items={items} onClose={closeMenu} anchor={menuAnchor} /> : null}
    </div>
  )
}

// Note : `getScheduledAt` est importé mais pas encore utilisé directement
// dans ce composant (le serveur fait déjà l'ordering). Conservé pour les
// composants futurs qui voudront comparer un post à un timestamp courant.
export { getScheduledAt }
