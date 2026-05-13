// Sprint 36.G → 36.H — Pastille de statut (Things 3 simplifié).
//
// Sprint 36.G v1 utilisait des cercles 20px qui ressemblaient à des
// cases à cocher (suggérant à tort une action user). Sprint 36.H
// redesign : petits points 8×8 px non-interactifs, position à gauche
// du titre comme indicateur d'état (pas une cible cliquable).
//
// 4 états :
//   * todo      : point gris clair #C7C7CC
//   * ready     : point bleu iOS #007AFF
//   * published : icône check ✓ (la ligne entière reçoit opacity 0.5
//                 + strikethrough — géré dans TaskRow)
//   * alert     : point orange iOS #FF9500

import type { PostState } from '@/lib/types/post'

type Props = {
  state: PostState
  size?: number // diamètre point en px, défaut 8
}

const COLOR_TODO = '#C7C7CC'
const COLOR_READY = '#007AFF'
const COLOR_ALERT = '#FF9500'
const COLOR_PUBLISHED = 'rgba(0,0,0,0.45)'

export function StateCircle({ state, size = 8 }: Props) {
  if (state === 'published') {
    // Check ✓ inline, taille proportionnée au reste du contenu.
    return (
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 14,
          height: 14,
          flexShrink: 0,
          color: COLOR_PUBLISHED,
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1,
          transition: 'color 250ms ease-out',
        }}
      >
        ✓
      </span>
    )
  }

  const color =
    state === 'ready' ? COLOR_READY
      : state === 'alert' ? COLOR_ALERT
      : COLOR_TODO

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: size / 2,
        background: color,
        // Sprint 36.I Finding 2 — léger anneau pour augmenter la
        // visibilité de la pastille sur fond clair (surtout l'état todo
        // gris #C7C7CC qui se perdait).
        boxShadow: '0 0 0 1px rgba(0,0,0,0.10)',
        flexShrink: 0,
        transition: 'background 250ms ease-out',
      }}
    />
  )
}
