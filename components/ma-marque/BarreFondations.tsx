// Sprint 36.B.5 — Barre de progression discrète sous la phrase d'état.
//
// Doctrine : anti-gamification. Pas de pourcentage. Pas de chiffre dans
// la barre. Pas d'animation au mount. Couleurs : noir Apple + gris.
//
// 2 segments superposés (gauche → droite) :
//   - complets : pleine opacité noire
//   - partiels : noir transparent 0.4 (continue après les complets)
// Le reste laisse voir le background gris.

'use client'

type Props = {
  total: number
  complets: number
  partiels: number
  // prioritaires non utilisé visuellement : on ne marque pas la barre
  // pour ne pas tomber dans la gamification (le point lilas sur les
  // rangs prioritaires suffit). La prop reste acceptée pour cohérence
  // de signature avec le calcul, sans crash.
  prioritaires?: number
}

export function BarreFondations({ total, complets, partiels }: Props) {
  const safeTotal = Math.max(total, 1)
  const widthComplets = Math.max(0, Math.min(complets, safeTotal)) / safeTotal
  const widthPartiels = Math.max(0, Math.min(partiels, safeTotal - complets)) / safeTotal

  return (
    <div
      role="img"
      aria-label={`${complets + partiels} blocs sur ${total} en cours`}
      style={{
        width: '100%',
        height: 6,
        borderRadius: 3,
        background: 'rgba(0,0,0,0.06)',
        marginTop: 12,
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: `${widthComplets * 100}%`,
          height: '100%',
          background: '#1C1C1E',
        }}
      />
      <span
        aria-hidden="true"
        style={{
          width: `${widthPartiels * 100}%`,
          height: '100%',
          background: 'rgba(28,28,30,0.4)',
        }}
      />
    </div>
  )
}
