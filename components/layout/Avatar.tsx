// Sprint 36.B.1 — Avatar cercle (initiale ou photo).
// Server-safe (rendu pur, pas d'interactivité).
import type { CSSProperties } from 'react'

type AvatarProps = {
  prenom: string
  photoUrl?: string
  size?: number
}

export function Avatar({ prenom, photoUrl, size = 44 }: AvatarProps) {
  const initial = (prenom?.[0] ?? '?').toUpperCase()
  const fontSize = Math.round(size * 0.4)

  const baseStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={prenom}
        className="cfs-avatar-img"
        style={{ ...baseStyle, objectFit: 'cover' }}
      />
    )
  }

  return (
    <span
      className="cfs-avatar-initial glass-thin"
      aria-hidden="true"
      style={{
        ...baseStyle,
        fontFamily: 'var(--font-system)',
        fontSize,
        fontWeight: 600,
        color: 'var(--color-label)',
        letterSpacing: '-0.012em',
      }}
    >
      {initial}
    </span>
  )
}
