// Sprint 36.B.7 — Wrapper client pour le sticky scroll-aware PageHeader.
//
// PageHeader est un Server Component (charge user meta côté serveur).
// Ce wrapper Client Component porte uniquement la détection du scroll
// et applique `data-scrolled` sur le <header> pour déclencher l'état verre.
//
// Architecture : PageHeader (server) → PageHeaderStickyWrapper (client)
//   Le server component passe le contenu (breadcrumb + row) en children.
//   Le client component n'a pas besoin de connaître la structure interne.

'use client'

import { useState, useEffect, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function PageHeaderStickyWrapper({ children }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    // État initial : au cas où la page est chargée avec un scroll déjà actif.
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    // cfs-page-header : outer sticky bar, pleine largeur, porte le fond glass.
    // cfs-page-header-inner : container 1200px centré, porte le contenu et
    //   sert d'ancrage (position:relative) pour UserMenuBubble (position:absolute).
    <header className="cfs-page-header" data-scrolled={scrolled}>
      <div className="cfs-page-header-inner">
        {children}
      </div>
    </header>
  )
}
