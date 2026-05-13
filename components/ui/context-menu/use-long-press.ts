// Sprint 36.G — Hook long-press mobile sans dépendance externe.
//
// touchstart démarre un timer 500ms. touchmove ou touchend l'annule.
// Si le timer expire sans interruption → onLongPress() est appelé.
//
// Pas de gestion de pointer events unifié — le hook est volontairement
// minimaliste (mobile uniquement, desktop utilise le bouton "..." en dur).

'use client'

import { useCallback, useRef } from 'react'

type Handlers = {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: () => void
  onTouchEnd: () => void
  onTouchCancel: () => void
}

const LONG_PRESS_MS = 500

export function useLongPress(onLongPress: () => void): Handlers {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const onTouchStart = useCallback(() => {
    clear()
    timerRef.current = setTimeout(() => {
      onLongPress()
      timerRef.current = null
    }, LONG_PRESS_MS)
  }, [clear, onLongPress])

  return {
    onTouchStart,
    onTouchMove: clear,
    onTouchEnd: clear,
    onTouchCancel: clear,
  }
}
