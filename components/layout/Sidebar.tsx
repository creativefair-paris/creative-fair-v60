'use client'

import { Sun, Calendar, Bookmark, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/aujourdhui', icon: Sun, label: "Aujourd'hui" },
  { href: '/calendrier', icon: Calendar, label: 'Calendrier' },
  { href: '/ma-marque', icon: Bookmark, label: 'Ma marque' },
  { href: '/conseiller', icon: MessageCircle, label: 'Conseiller' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex flex-col w-[220px] shrink-0 py-4 px-3 gap-1"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:opacity-80"
            style={{
              backgroundColor: active ? 'var(--color-accent)' : 'transparent',
              color: active ? 'var(--color-accent-fg)' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </aside>
  )
}
