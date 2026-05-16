// Sprint 37.M (F86.3) — Story ring Instagram avec hasStory toggle.
//
// Défaut hasStory=false : juste un contour gris fin 1px #DBDBDB (état
// "pas de story active", correspond à la capture Le Monde référence).
// Si hasStory=true : halo conique 5 couleurs Instagram VIVES (pas pastels)
// + ring blanc intérieur 1.5px pour détachement halo/avatar.
//
// Couleurs canoniques Instagram (mai 2026) :
//   #FEDA77 jaune vif → #F58529 orange vif → #DD2A7B rose magenta
//   → #8134AF violet → #515BD4 bleu indigo → retour jaune
// Aucun opacity, aucun mix-blend-mode : couleurs pleines.
//
// STATIQUE : zéro animation.

import type { CSSProperties, ReactNode } from 'react'

type Size = 'sm' | 'md' | 'lg'

type Props = {
  size?: Size | number
  hasStory?: boolean
  children?: ReactNode
  avatarUrl?: string
}

const NAMED_SIZES: Record<Size, number> = {
  sm: 28,
  md: 32,
  lg: 40,
}

function resolveSize(size: Size | number): number {
  return typeof size === 'number' ? size : NAMED_SIZES[size]
}

export function InstagramStoryRing({ size = 'md', hasStory = false, children, avatarUrl }: Props) {
  const dim = resolveSize(size)

  const avatarInner: ReactNode = avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl}
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : (
    children
  )

  // ─── Cas 1 : pas de story → contour gris très fin, pas de halo ──────
  // Sprint 37.N (F86.3) — Contour allégé de #DBDBDB à #F0F0F0
  // (presque imperceptible) + fond crème par défaut. Cohérent avec
  // l'adoucissement du DefaultBrandAvatar (rollback saturation 37.M).
  if (!hasStory) {
    const noStoryStyle: CSSProperties = {
      width: dim,
      height: dim,
      borderRadius: '50%',
      border: '1px solid #F0F0F0',
      overflow: 'hidden',
      boxSizing: 'border-box',
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: avatarUrl ? 'transparent' : '#FBFAF7',
    }
    return (
      <span aria-hidden="true" style={noStoryStyle}>
        {avatarInner}
      </span>
    )
  }

  // ─── Cas 2 : story active → halo conique vif + ring blanc 1.5px ─────
  const ringWidth = dim >= 40 ? 4 : 3
  const innerWhite = 1.5

  const ringStyle: CSSProperties = {
    width: dim,
    height: dim,
    borderRadius: '50%',
    padding: ringWidth,
    background:
      'conic-gradient(from 0deg, #FEDA77 0%, #F58529 20%, #DD2A7B 45%, #8134AF 70%, #515BD4 95%, #FEDA77 100%)',
    boxSizing: 'border-box',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  const whiteRingStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    padding: innerWhite,
    background: '#FFFFFF',
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  const avatarShellStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: avatarUrl ? 'transparent' : '#FFFFFF',
  }
  return (
    <span aria-hidden="true" style={ringStyle}>
      <span style={whiteRingStyle}>
        <span style={avatarShellStyle}>{avatarInner}</span>
      </span>
    </span>
  )
}
