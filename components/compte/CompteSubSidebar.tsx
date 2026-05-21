// Sprint 43-stable — Sub-sidebar Compte (style iOS Settings)
// Doctrine 01-ARCHITECTURE.md §3.2

import Link from 'next/link'
import { User, Briefcase, Bell, Eye, Shield, CreditCard, HelpCircle } from 'lucide-react'

type Section = 'profil' | 'marques' | 'notifications' | 'apparence' | 'securite' | 'plan'

type Props = {
  active: Section
  userName: string
  userEmail: string
}

const SECTIONS: ReadonlyArray<{
  key: Section
  label: string
  icon: typeof User
  color?: string
}> = [
  { key: 'profil', label: 'Profil', icon: User, color: 'var(--text-primary)' },
  { key: 'marques', label: 'Marques', icon: Briefcase, color: 'var(--lilac)' },
  { key: 'notifications', label: 'Notifications', icon: Bell, color: 'var(--orange)' },
  { key: 'apparence', label: 'Apparence', icon: Eye, color: 'var(--indigo)' },
  { key: 'securite', label: 'Sécurité', icon: Shield, color: 'var(--mint)' },
  { key: 'plan', label: 'Plan et facturation', icon: CreditCard, color: 'var(--rose)' },
]

export function CompteSubSidebar({ active, userName, userEmail }: Props) {
  return (
    <aside className="sa-sidebar glass-z1" aria-label="Navigation Compte">
      <div className="sa-id-card">
        <div className="sa-id-avatar">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="sa-id-body">
          <div className="sa-id-name">{userName}</div>
          <div className="sa-id-mail">{userEmail}</div>
        </div>
      </div>

      <nav className="sa-side-section">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.key}
              href={`/compte?section=${s.key}`}
              className={`sa-nav-item ${active === s.key ? 'is-active' : ''}`}
            >
              <span className="sa-nav-icon" style={{ color: s.color }}>
                <Icon size={16} strokeWidth={1.6} />
              </span>
              {s.label}
            </Link>
          )
        })}
      </nav>

      <div className="sa-side-bottom">
        <Link href="/aide" className="sa-nav-item">
          <span className="sa-nav-icon">
            <HelpCircle size={16} strokeWidth={1.6} />
          </span>
          Aide
        </Link>
      </div>
    </aside>
  )
}

export type { Section as CompteSection }
