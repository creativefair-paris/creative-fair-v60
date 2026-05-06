'use client'

import { useState, type ReactNode } from 'react'

type Tab = 'theme' | 'brand-book' | 'business-calendar' | 'users'

type Props = {
  themeContent: ReactNode
  brandBookContent: ReactNode
  businessCalendarContent: ReactNode
  usersContent: ReactNode
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'theme', label: 'Thème' },
  { id: 'brand-book', label: 'Brand book' },
  { id: 'business-calendar', label: 'Calendrier business' },
  { id: 'users', label: 'Utilisateurs' },
]

export function TenantTabs({
  themeContent,
  brandBookContent,
  businessCalendarContent,
  usersContent,
}: Props) {
  const [active, setActive] = useState<Tab>('theme')

  return (
    <div>
      <div
        className="flex items-center gap-1 mb-8 pb-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className="px-4 py-2 text-sm rounded-md transition-colors"
            style={{
              backgroundColor:
                active === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: active === tab.id ? '#E8E6E1' : '#A8A39A',
              fontWeight: active === tab.id ? 500 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {active === 'theme' && themeContent}
        {active === 'brand-book' && brandBookContent}
        {active === 'business-calendar' && businessCalendarContent}
        {active === 'users' && usersContent}
      </div>
    </div>
  )
}
