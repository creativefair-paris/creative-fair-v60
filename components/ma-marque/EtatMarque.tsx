// Sprint 36.B.3 — Phrase d'état dynamique en hero de /ma-marque.
// Prose tranquille, gris foncé, 16px, sans CTA, sans badge.
// La phrase change selon le nombre de blocs remplis (sur 14).

'use client'

import { getPhrase14, type BrandSnapshot14 } from '@/lib/ma-marque/completude'

type Props = {
  snapshot: BrandSnapshot14
}

export function EtatMarque({ snapshot }: Props) {
  const phrase = getPhrase14(snapshot)

  return (
    <p
      style={{
        fontFamily: 'var(--font-system)',
        fontSize: 16,
        lineHeight: 1.5,
        letterSpacing: '-0.003em',
        color: 'var(--color-label)',
        margin: 0,
        maxWidth: 680,
      }}
    >
      {phrase}
    </p>
  )
}
