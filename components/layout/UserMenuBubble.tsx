// Sprint 37.C (F27) — Polish popover nav.
// - Icônes Lucide React devant chaque item
// - 3 sections séparées par dividers : destinations app / compte / déconnexion
// - Raccourcis clavier affichés à droite (⌘1, ⌘2, ⌘3, ⌘,)
// - Active state : background rgba(0, 122, 255, 0.06), color #007AFF
// - Box-shadow Apple renforcée, border-radius 14px
//
// Sprint 36.B.1 → 36.I (historique) — Bulle déployée depuis l'avatar.
'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Aperture, LayoutGrid, User, LogOut } from 'lucide-react'
import { Avatar } from './Avatar'

type UserMenuBubbleProps = {
  prenom: string
  photoUrl?: string
  nomMarque: string
  onClose: () => void
  onLogout: () => void
}

const SHORTCUT_KEY = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform) ? '⌘' : 'Ctrl'

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

  const destinations = [
    { href: '/programme', label: 'Mon Programme', icon: Calendar, shortcut: '1' },
    { href: '/ma-marque', label: 'Ma Marque', icon: Aperture, shortcut: '2' },
    { href: '/outils', label: 'Mes Outils', icon: LayoutGrid, shortcut: '3' },
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

      {/* Section 1 — Destinations app */}
      <nav className="cfs-user-menu-nav" aria-label="Destinations">
        {destinations.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`cfs-user-menu-item cfs-menu-row${active ? ' is-active' : ''}`}
              onClick={onClose}
              role="menuitem"
            >
              <Icon size={18} strokeWidth={1.6} aria-hidden="true" className="cfs-menu-icon" />
              <span className="cfs-menu-label">{item.label}</span>
              <span className="cfs-menu-shortcut" aria-hidden="true">
                {SHORTCUT_KEY}{item.shortcut}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="cfs-user-menu-divider" aria-hidden="true" />

      {/* Section 2 — Compte */}
      <div className="cfs-user-menu-actions">
        <Link
          href="/compte"
          className={`cfs-user-menu-item cfs-user-menu-action cfs-menu-row${isActive('/compte') ? ' is-active' : ''}`}
          onClick={onClose}
          role="menuitem"
        >
          <User size={18} strokeWidth={1.6} aria-hidden="true" className="cfs-menu-icon" />
          <span className="cfs-menu-label">Mon compte</span>
          <span className="cfs-menu-shortcut" aria-hidden="true">{SHORTCUT_KEY},</span>
        </Link>
      </div>

      <div className="cfs-user-menu-divider" aria-hidden="true" />

      {/* Section 3 — Déconnexion */}
      <div className="cfs-user-menu-actions">
        <button
          type="button"
          onClick={onLogout}
          className="cfs-user-menu-item cfs-user-menu-action cfs-user-menu-destructive cfs-menu-row"
          role="menuitem"
        >
          <LogOut size={18} strokeWidth={1.6} aria-hidden="true" className="cfs-menu-icon" />
          <span className="cfs-menu-label">Déconnexion</span>
        </button>
      </div>
    </div>
  )
}
