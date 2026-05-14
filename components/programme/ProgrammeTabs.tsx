// Sprint 37.E (F50) — Toggle segmented control en haut de /programme/*.
// 3 onglets : Programme actuel / Retombées / Refaire un programme.

import Link from 'next/link'

type Tab = { id: string; label: string; href: string }

const TABS: ReadonlyArray<Tab> = [
  { id: 'current', label: 'Programme actuel', href: '/programme' },
  { id: 'retombees', label: 'Retombées', href: '/programme/retombees' },
  { id: 'create', label: 'Refaire un programme', href: '/programme/create' },
]

type Props = {
  activeTab: Tab['id']
}

export function ProgrammeTabs({ activeTab }: Props) {
  return (
    <nav
      role="tablist"
      aria-label="Sections Mon Programme"
      style={{
        display: 'inline-flex',
        padding: 3,
        gap: 2,
        background: 'rgba(0, 0, 0, 0.04)',
        borderRadius: 10,
        marginBottom: 20,
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            style={{
              padding: '7px 14px',
              borderRadius: 7,
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--color-label)' : 'var(--color-secondary-label)',
              textDecoration: 'none',
              background: isActive ? '#FFFFFF' : 'transparent',
              boxShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
              transition: 'background-color 150ms ease-out',
            }}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
