// Sprint 36.B.1 → 36.I — Bulle déployée depuis l'avatar.
// 3 destinations (Mon Programme / Ma Marque / Mes Outils) — pas de Conseiller
// dans le menu (accessible via bouton flottant Header existant).
//
// Sprint 36.I Finding 9 : la toggle "Programme / Outils" entre les
// sections du menu était redondante avec les liens "Mon Programme" et
// "Mes Outils" déjà présents juste au-dessus. Subtraction.
//
// Déconnexion → onLogout (Sheet confirmation géré par le parent).
'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar } from './Avatar'

type UserMenuBubbleProps = {
  prenom: string
  photoUrl?: string
  nomMarque: string
  onClose: () => void
  onLogout: () => void
}

export function UserMenuBubble({
  prenom,
  photoUrl,
  nomMarque,
  onClose,
  onLogout,
}: UserMenuBubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Click extérieur + Escape → close
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const node = containerRef.current
      if (!node) return
      if (node.contains(event.target as Node)) return
      onClose()
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  function isActive(href: string): boolean {
    if (!pathname) return false
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const navItems: Array<{ href: string; label: string }> = [
    { href: '/programme', label: 'Mon Programme' },
    { href: '/ma-marque', label: 'Ma Marque' },
    { href: '/outils', label: 'Mes Outils' },
  ]

  return (
    <div
      ref={containerRef}
      role="menu"
      aria-label="Menu utilisateur"
      className="cfs-user-menu-bubble"
    >
      <div className="cfs-user-menu-header">
        <Avatar prenom={prenom} photoUrl={photoUrl} size={48} />
        <div className="cfs-user-menu-identity">
          <p className="cfs-user-menu-prenom">{prenom}</p>
          <p className="cfs-user-menu-marque">{nomMarque}</p>
        </div>
      </div>

      <div className="cfs-user-menu-divider" aria-hidden="true" />

      <nav className="cfs-user-menu-nav" aria-label="Destinations">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`cfs-user-menu-item${isActive(item.href) ? ' is-active' : ''}`}
            onClick={onClose}
            role="menuitem"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="cfs-user-menu-divider" aria-hidden="true" />

      <div className="cfs-user-menu-actions">
        <Link
          href="/compte"
          className="cfs-user-menu-item cfs-user-menu-action"
          onClick={onClose}
          role="menuitem"
        >
          Mon compte
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="cfs-user-menu-item cfs-user-menu-action cfs-user-menu-destructive"
          role="menuitem"
        >
          Déconnexion
        </button>
      </div>
    </div>
  )
}
