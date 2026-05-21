// Sprint 37.C (F26) — Hook réutilisable pour gérer un dialogue de
// friction de jalon.
//
// Usage côté client :
//   const guard = useJalonGuard({ requiredJalon: 'programme', currentJalon })
//   <button onClick={(e) => { if (!guard.canProceed) { e.preventDefault(); guard.openGuard() } else navigate(...) }} />
//   {guard.dialog}
//
// L'appelant décide quoi faire de "Continuer quand même" via onContinue.

'use client'

import { useCallback, useState, type ReactElement } from 'react'
import {
  JalonGuardDialog,
  type JalonGuardKind,
} from '@/components/jalons/JalonGuardDialog'
import type { JalonState } from '@/lib/jalons/check-jalons'

type UseJalonGuardOptions = {
  requiredJalon: JalonState
  currentJalon: JalonState
  // Route vers la destination de réparation (ex: '/ma-marque?onboarding=true').
  primaryHref: string
  // Action à exécuter quand le pilote clique sur "Continuer quand même".
  onContinueAnyway: () => void
}

const JALON_ORDER: ReadonlyArray<JalonState> = ['marque', 'programme', 'production']

function jalonIndex(j: JalonState): number {
  return JALON_ORDER.indexOf(j)
}

export function useJalonGuard(options: UseJalonGuardOptions) {
  const [isOpen, setIsOpen] = useState(false)

  const canProceed = jalonIndex(options.currentJalon) >= jalonIndex(options.requiredJalon)

  const openGuard = useCallback(() => setIsOpen(true), [])
  const closeGuard = useCallback(() => setIsOpen(false), [])

  const handleContinueAnyway = useCallback(() => {
    setIsOpen(false)
    options.onContinueAnyway()
  }, [options])

  const guardKind: JalonGuardKind =
    options.requiredJalon === 'production' ? 'programme' : 'marque'

  const dialog: ReactElement = (
    <JalonGuardDialog
      open={isOpen}
      kind={guardKind}
      onDismiss={closeGuard}
      onContinueAnyway={handleContinueAnyway}
      primaryHref={options.primaryHref}
    />
  )

  return { canProceed, openGuard, closeGuard, dialog }
}
