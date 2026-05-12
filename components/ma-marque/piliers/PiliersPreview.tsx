// Sprint 36.B.2 — Panneau droit (60%) du Split Brief Piliers narratifs.
// SVG disc 320×320 : 3 secteurs proportionnels au ratio_suggere de chaque pilier.

'use client'

import type { PilierEditable } from '@/types/ma-marque'

type Props = {
  piliers: PilierEditable[]
}

// Couleurs signature des piliers (cohérent avec styles/liquid-glass.css)
const PILIER_COULEURS = ['#007AFF', '#AF52DE', '#FF9500'] as const

const TAILLE = 320
const RAYON = 140
const CENTRE = TAILLE / 2

function polarToCartesian(angleRad: number, rayon: number) {
  // Angle 0 = haut (12h), sens horaire
  return {
    x: CENTRE + rayon * Math.sin(angleRad),
    y: CENTRE - rayon * Math.cos(angleRad),
  }
}

function arcPath(angleDebut: number, angleFin: number): string {
  if (angleFin - angleDebut >= Math.PI * 2 - 0.0001) {
    // Cercle complet — décrit en 2 arcs pour rester valide.
    const p1 = polarToCartesian(0, RAYON)
    const p2 = polarToCartesian(Math.PI, RAYON)
    return `M ${CENTRE} ${CENTRE} L ${p1.x} ${p1.y} A ${RAYON} ${RAYON} 0 0 1 ${p2.x} ${p2.y} A ${RAYON} ${RAYON} 0 0 1 ${p1.x} ${p1.y} Z`
  }
  const debut = polarToCartesian(angleDebut, RAYON)
  const fin = polarToCartesian(angleFin, RAYON)
  const largeArc = angleFin - angleDebut > Math.PI ? 1 : 0
  return `M ${CENTRE} ${CENTRE} L ${debut.x} ${debut.y} A ${RAYON} ${RAYON} 0 ${largeArc} 1 ${fin.x} ${fin.y} Z`
}

function normaliserRatios(piliers: PilierEditable[]): number[] {
  const total = piliers.reduce((s, p) => s + Math.max(0, p.ratio_suggere), 0)
  if (total <= 0) {
    // Tous à zéro → équipartition pour rester lisible
    return piliers.map(() => 1 / piliers.length)
  }
  return piliers.map((p) => Math.max(0, p.ratio_suggere) / total)
}

export function PiliersPreview({ piliers }: Props) {
  const ratios = normaliserRatios(piliers)
  // Reduce pour éviter reassignment d'une variable locale après render
  // (react-hooks/immutability).
  const secteurs = piliers.reduce<
    Array<{
      p: PilierEditable
      debut: number
      fin: number
      ratio: number
      index: number
    }>
  >((acc, p, i) => {
    const debut = acc.length === 0 ? 0 : acc[acc.length - 1]!.fin
    const fin = debut + ratios[i]! * Math.PI * 2
    acc.push({ p, debut, fin, ratio: ratios[i]!, index: i })
    return acc
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        alignItems: 'center',
      }}
    >
      <header style={{ alignSelf: 'flex-start' }}>
        <h3
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.015em',
            color: 'var(--color-label)',
            margin: 0,
          }}
        >
          Tes 3 piliers narratifs
        </h3>
      </header>

      <svg
        width={TAILLE}
        height={TAILLE}
        viewBox={`0 0 ${TAILLE} ${TAILLE}`}
        role="img"
        aria-label="Répartition narrative des 3 piliers"
        style={{ marginTop: 'var(--space-3)' }}
      >
        {secteurs.map((s) => (
          <path
            key={s.p.id}
            d={arcPath(s.debut, s.fin)}
            fill={PILIER_COULEURS[s.index] ?? PILIER_COULEURS[0]}
            opacity={0.92}
            stroke="var(--color-background)"
            strokeWidth={2}
          />
        ))}
        {/* Cercle central blanc pour effet "donut" subtil */}
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={48}
          fill="var(--color-background)"
        />
      </svg>

      {/* Légende */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-3)',
        }}
      >
        {secteurs.map((s) => (
          <li
            key={s.p.id}
            className="glass-thin"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 16,
              borderLeft: `4px solid ${PILIER_COULEURS[s.index] ?? PILIER_COULEURS[0]}`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--color-label)',
                  letterSpacing: '-0.005em',
                }}
              >
                {s.p.nom}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  lineHeight: 1.4,
                  color: 'var(--color-secondary-label)',
                  marginTop: 2,
                }}
              >
                {s.p.description}
              </div>
            </div>
            <span
              style={{
                flexShrink: 0,
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-tertiary-label)',
                paddingTop: 2,
              }}
            >
              {Math.round(s.ratio * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
