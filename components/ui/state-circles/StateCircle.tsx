// Sprint 36.G — Cercle d'état pour les tâches /aujourd-hui (pattern Things 3).
//
// 4 états visuels canoniques :
//   * todo      : cercle vide, contour gris iOS
//   * ready     : cercle plein bleu iOS
//   * published : cercle plein bleu iOS avec check blanc inscrit
//   * alert     : cercle plein orange iOS avec '!' blanc

import type { PostState } from '@/lib/types/post'

type Props = {
  state: PostState
  size?: number // px, défaut 20
}

const COLOR_BORDER_TODO = '#C7C7CC' // gris iOS séparateur
const COLOR_FILL_READY = '#007AFF' // bleu iOS accent
const COLOR_FILL_ALERT = '#FF9500' // orange iOS warning

export function StateCircle({ state, size = 20 }: Props) {
  const stroke = size * 0.075

  if (state === 'todo') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        aria-hidden="true"
        style={{ flexShrink: 0, transition: 'all 250ms ease-out' }}
      >
        <circle
          cx="10"
          cy="10"
          r="9"
          fill="none"
          stroke={COLOR_BORDER_TODO}
          strokeWidth={stroke * 10}
        />
      </svg>
    )
  }

  if (state === 'ready') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        aria-hidden="true"
        style={{ flexShrink: 0, transition: 'all 250ms ease-out' }}
      >
        <circle cx="10" cy="10" r="10" fill={COLOR_FILL_READY} />
      </svg>
    )
  }

  if (state === 'published') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        aria-hidden="true"
        style={{ flexShrink: 0, transition: 'all 250ms ease-out' }}
      >
        <circle cx="10" cy="10" r="10" fill={COLOR_FILL_READY} />
        <path
          d="M5.5 10.2 L8.6 13.2 L14.5 7"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // alert
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      style={{ flexShrink: 0, transition: 'all 250ms ease-out' }}
    >
      <circle cx="10" cy="10" r="10" fill={COLOR_FILL_ALERT} />
      <path
        d="M10 5 L10 11"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="14" r="1" fill="#FFFFFF" />
    </svg>
  )
}
