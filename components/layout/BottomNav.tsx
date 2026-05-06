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

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 h-16 flex items-center justify-around px-2 z-40"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-opacity hover:opacity-70"
            style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            aria-label={label}
          >
            <Icon size={20} />
          </Link>
        )
      })}
    </nav>
  )
}
