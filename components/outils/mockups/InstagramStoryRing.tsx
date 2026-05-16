// Sprint 37.L (F86.3) — Story ring Instagram avec gradient conique canonique.
//
// Halo STATIQUE (zéro animation). Gradient conique 5 couleurs depuis 12h sens
// horaire, jaune → orange → rose → violet → bleu → retour jaune.
// Ring blanc intérieur 1.5px obligatoire pour détachement visuel entre halo
// et avatar (pattern iOS Instagram mai 2026).

import type { CSSProperties, ReactNode } from 'react'

type Size = 'sm' | 'md' | 'lg'

type Props = {
  size?: Size
  children?: ReactNode
  // Override sources avatar si besoin (image carrée ronded via border-radius).
  avatarUrl?: string
}

const DIMS: Record<Size, { outer: number; ringWidth: number; whiteWidth: number }> = {
  sm: { outer: 28, ringWidth: 2.5, whiteWidth: 1.5 },
  md: { outer: 32, ringWidth: 3, whiteWidth: 1.5 },
  lg: { outer: 40, ringWidth: 4, whiteWidth: 1.5 },
}

export function InstagramStoryRing({ size = 'md', children, avatarUrl }: Props) {
  const { outer, ringWidth, whiteWidth } = DIMS[size]

  const ringStyle: CSSProperties = {
    width: outer,
    height: outer,
    borderRadius: '50%',
    padding: ringWidth,
    // Gradient conique 5 couleurs Instagram canonique (mai 2026).
    background:
      'conic-gradient(from 0deg, #FEDA77, #F58529, #DD2A7B, #8134AF, #515BD4, #FEDA77)',
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
    padding: whiteWidth,
    background: '#FFFFFF',
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const avatarStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Fallback gradient pastel signature CF si pas d'avatarUrl.
    background: avatarUrl
      ? 'transparent'
      : 'linear-gradient(135deg, #FBFAF7 0%, #E8DFD0 100%)',
  }

  return (
    <span aria-hidden="true" style={ringStyle}>
      <span style={whiteRingStyle}>
        <span style={avatarStyle}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            children
          )}
        </span>
      </span>
    </span>
  )
}
