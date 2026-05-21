// Sprint 43-stable — Sidebar globale Aujourd'hui (8 destinations + 2 icônes système)
// Doctrine 01-ARCHITECTURE.md §2.1 — visible uniquement sur Aujourd'hui.

import Link from 'next/link'
import {
  Calendar,
  CheckCircle,
  BookOpen,
  MessageCircle,
  Compass,
  PenTool,
  LayoutGrid,
  User,
  HelpCircle,
} from 'lucide-react'

type SidebarItem = {
  href: string
  icon: typeof Calendar
  label: string
  color?: string
}

const TRAVAIL: ReadonlyArray<SidebarItem> = [
  { href: '/calendrier', icon: Calendar, label: 'Calendrier', color: '#FF3B30' },
  { href: '/rappels', icon: CheckCircle, label: 'Rappels', color: '#007AFF' },
  { href: '/bibliotheque', icon: BookOpen, label: 'Bibliothèque' },
  { href: '/messages', icon: MessageCircle, label: 'Messages', color: '#10B981' },
]

const EDITORIAL: ReadonlyArray<SidebarItem> = [
  { href: '/programme', icon: Compass, label: 'Mon Programme' },
  { href: '/ma-marque', icon: PenTool, label: 'Ma Marque' },
  { href: '/outils', icon: LayoutGrid, label: 'Mes Outils' },
]

const SYSTEME: ReadonlyArray<SidebarItem> = [
  { href: '/compte', icon: User, label: 'Compte' },
  { href: '/aide', icon: HelpCircle, label: 'Aide' },
]

export function AujourdhuiSidebar() {
  return (
    <aside className="aujourd-hui-sidebar glass-z1" aria-label="Navigation principale">
      <div className="sidebar-section">
        <h3 className="sub-sidebar__eyebrow">Travail</h3>
        <ul className="sidebar-list">
          {TRAVAIL.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link href={item.href} className="sidebar-row">
                  <Icon size={18} strokeWidth={1.6} color={item.color ?? '#1C1C1E'} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="sidebar-section">
        <h3 className="sub-sidebar__eyebrow">Éditorial</h3>
        <ul className="sidebar-list">
          {EDITORIAL.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link href={item.href} className="sidebar-row">
                  <Icon size={18} strokeWidth={1.6} color={item.color ?? '#1C1C1E'} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="sidebar-section sidebar-system">
        {SYSTEME.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="sidebar-icon-only" aria-label={item.label}>
              <Icon size={20} strokeWidth={1.6} color="#1C1C1E" />
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
