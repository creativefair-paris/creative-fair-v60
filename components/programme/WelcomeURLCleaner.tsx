// Sprint 36.B — Retire le param ?welcome=true de l'URL après le premier rendu.
// Empêche que l'animation séquentielle se rejoue à chaque refresh.

'use client'

import { useEffect } from 'react'

export function WelcomeURLCleaner() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (url.searchParams.has('welcome')) {
      url.searchParams.delete('welcome')
      const cleanPath = `${url.pathname}${url.search}${url.hash}`
      window.history.replaceState(null, '', cleanPath)
    }
  }, [])
  return null
}
