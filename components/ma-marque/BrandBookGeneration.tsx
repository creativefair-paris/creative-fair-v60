'use client'

import { useEffect, useState } from 'react'

const PHASES = [
  'Je lis tes réponses…',
  'Je construis ta voix éditoriale…',
  'Je définis tes territoires…',
  'Presque prêt…',
]

export function BrandBookGeneration() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev < PHASES.length - 1 ? prev + 1 : prev))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}
        >
          Génération en cours
        </p>
        <p
          className="text-2xl font-semibold tracking-tight leading-snug"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          {PHASES[phase]}
        </p>

        <div className="space-y-3 pt-6">
          <Skeleton width="40%" />
          <Skeleton width="80%" />
          <Skeleton width="65%" />
          <Skeleton width="90%" />
          <Skeleton width="55%" />
        </div>
      </div>
    </div>
  )
}

function Skeleton({ width }: { width: string }) {
  return (
    <div
      className="h-3 rounded-md animate-pulse mx-auto"
      style={{
        width,
        backgroundColor: 'var(--color-border)',
        borderRadius: 'var(--radius-sm)',
      }}
    />
  )
}
