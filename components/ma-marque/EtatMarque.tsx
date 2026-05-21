// @deprecated Sprint 40 Phase 2B — composant explicitement EXCLU de Phase 2
// par arbitrage Lead amendement §3 (audit visuel Sprint 41 conjointement avec
// BarreFondations).
//
// Sprint 36.B.3 → 36.B.5 — Phrase d'état + barre discrète sous la phrase.
//
// La phrase reste prose tranquille (Pilier 4). La barre ajoutée Sprint 36.B.5
// est anti-gamification : aucun pourcentage écrit, aucune animation au mount.

'use client'

import {
  getPhrase14,
  calculerAggregat,
  type BrandSnapshot14,
} from '@/lib/ma-marque/completude'
import { BarreFondations } from './BarreFondations'

type Props = {
  snapshot: BrandSnapshot14
}

export function EtatMarque({ snapshot }: Props) {
  const phrase = getPhrase14(snapshot)
  const agg = calculerAggregat(snapshot)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 16,
          lineHeight: 1.5,
          letterSpacing: '-0.003em',
          color: '#1C1C1E',
          margin: 0,
          maxWidth: 680,
        }}
      >
        {phrase}
      </p>
      <BarreFondations
        total={agg.total}
        complets={agg.complets}
        partiels={agg.partiels}
        prioritaires={agg.prioritaires}
      />
    </div>
  )
}
