// Sprint 37.B (F12) — État d'attente verbalisé.
//
// Cycle bouclant à travers les phrases du scénario, pulse opacité
// 0.5 → 1 → 0.5, fade-out 200ms quand fini. Respecte
// prefers-reduced-motion.

'use client'

import { useEffect, useState } from 'react'
import { WAITING_CYCLE_MS, WAITING_STATES } from '@/lib/conseiller/waiting-states'
import type { ScenarioType } from '@/lib/conseiller/types'

type Props = {
  scenarioType: ScenarioType
  // Si false, le composant fade-out (200ms) puis disparaît du DOM.
  visible: boolean
}

export function WaitingState({ scenarioType, visible }: Props) {
  const phrases = WAITING_STATES[scenarioType] ?? WAITING_STATES['E-divers']
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(visible)

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => setMounted(false), 220)
      return () => clearTimeout(t)
    }
    setMounted(true)
    return undefined
  }, [visible])

  useEffect(() => {
    if (!visible) return
    if (phrases.length <= 1) return
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length)
    }, WAITING_CYCLE_MS)
    return () => clearInterval(t)
  }, [visible, phrases.length])

  if (!mounted) return null

  return (
    <p
      role="status"
      aria-live="polite"
      className="waiting-state"
      style={{
        margin: 0,
        opacity: visible ? undefined : 0,
        transition: 'opacity 200ms ease-out',
      }}
    >
      {phrases[index]}
    </p>
  )
}
