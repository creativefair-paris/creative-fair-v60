// Sprint 35 — Toggle navigant Programme ↔ Outils.
// Glue client minimale autour du Toggle Sprint 33 (cahier §2.2).
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Toggle } from './Toggle'

export function ProgrammeOutilsToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const value: 'programme' | 'outils' = pathname?.startsWith('/outils')
    ? 'outils'
    : 'programme'

  function handleChange(next: 'programme' | 'outils') {
    if (next === value) return
    router.push(next === 'programme' ? '/programme' : '/outils')
  }

  return <Toggle value={value} onChange={handleChange} />
}
