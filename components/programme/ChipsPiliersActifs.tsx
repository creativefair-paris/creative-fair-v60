// Sprint 36.B.3 — Chips des piliers actifs en hero /programme.
//
// Une chip par pilier : pastille couleur + nom. La chip du pilier dominant
// de la semaine est rendue légèrement plus opaque (hiérarchie visuelle douce,
// sans badge ni pourcentage).
//
// Couleurs héritées du brand_book.palette si disponible, sinon pastels.

'use client'

import type { PilierNarratif } from '@/types/programme'

type Props = {
  piliers: PilierNarratif[]
  couleurs: readonly string[]
  pilierDominantNom?: string | null
}

export function ChipsPiliersActifs({
  piliers,
  couleurs,
  pilierDominantNom = null,
}: Props) {
  if (piliers.length === 0) return null

  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
      }}
    >
      {piliers.map((p, i) => {
        const couleur = couleurs[i] ?? couleurs[0] ?? '#888'
        const dominant = pilierDominantNom === p.nom
        return (
          <li key={p.nom}>
            <span
              className="glass-thin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                fontWeight: dominant ? 600 : 500,
                color: 'var(--color-label)',
                background: dominant ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
                whiteSpace: 'nowrap',
                transition: 'background 200ms ease',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: couleur,
                }}
              />
              {p.nom}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
