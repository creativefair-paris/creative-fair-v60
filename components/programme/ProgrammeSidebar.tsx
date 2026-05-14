// Sprint 37.F (F61) — Sidebar Split Brief pour /programme/*.
//
// Pattern unifié avec /outils (Sprint 37.C F22) : 2 sections (PILOTER +
// ACTIONS RAPIDES). Les items "Piloter" sont des routes Next.js, les
// "Actions rapides" sont des actions (ouvrent une sheet conseiller).

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Compass, TrendingUp, RefreshCw } from 'lucide-react'

export type ProgrammeSidebarActiveItem =
  | 'calendrier'
  | 'strategie'
  | 'retombees'
  | 'create'
  | null

type Props = {
  activeItem: ProgrammeSidebarActiveItem
}

export function ProgrammeSidebar({ activeItem }: Props) {
  const [, setOpenSheet] = useState<'A7' | 'E1' | null>(null)

  function openAction(scenario: 'A7' | 'E1') {
    // V1 simple : redirige vers /outils/conseiller avec le scenario en query.
    // Sprint 37.F+ : ouvrir une vraie sheet inline.
    setOpenSheet(scenario)
    window.location.href = `/outils/conseiller?scenario=${scenario}`
  }

  return (
    <nav aria-label="Sections Mon Programme" className="cfs-programme-sidebar">
      <Section title="Piloter">
        <RouteItem
          href="/programme"
          label="Calendrier"
          icon={<Calendar size={18} strokeWidth={1.6} aria-hidden="true" />}
          active={activeItem === 'calendrier'}
        />
        <RouteItem
          href="/programme/strategie"
          label="Stratégie"
          icon={<Compass size={18} strokeWidth={1.6} aria-hidden="true" />}
          active={activeItem === 'strategie'}
        />
        <RouteItem
          href="/programme/retombees"
          label="Retombées"
          icon={<TrendingUp size={18} strokeWidth={1.6} aria-hidden="true" />}
          active={activeItem === 'retombees'}
        />
        <RouteItem
          href="/programme/create"
          label="Refaire un programme"
          subtitle="Annule le programme en cours"
          icon={<RefreshCw size={18} strokeWidth={1.6} aria-hidden="true" />}
          active={activeItem === 'create'}
        />
      </Section>

      <Section title="Actions rapides">
        <ActionItem label="Faire le point" onClick={() => openAction('A7')} />
        <ActionItem label="Préparer ma réunion" onClick={() => openAction('E1')} />
      </Section>

      <style>{`
        .cfs-programme-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
      `}</style>
    </nav>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-tertiary-label)',
          opacity: 0.5,
          margin: '0 0 6px 4px',
        }}
      >
        {title}
      </h3>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {children}
      </ul>
    </div>
  )
}

function RouteItem({
  href,
  label,
  subtitle,
  icon,
  active,
}: {
  href: string
  label: string
  subtitle?: string
  icon?: React.ReactNode
  active: boolean
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '12px 14px',
          borderRadius: 10,
          textDecoration: 'none',
          color: active ? '#007AFF' : 'var(--color-label)',
          background: active ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
          transition: 'background-color 180ms ease-out',
        }}
        className="cfs-sidebar-link"
      >
        {icon ? (
          <span
            aria-hidden="true"
            style={{
              flexShrink: 0,
              color: active ? '#007AFF' : 'var(--color-secondary-label)',
              marginTop: 1,
            }}
          >
            {icon}
          </span>
        ) : null}
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.35,
            }}
          >
            {label}
          </span>
          {subtitle ? (
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 12,
                color: 'var(--color-tertiary-label)',
                lineHeight: 1.35,
              }}
            >
              {subtitle}
            </span>
          ) : null}
        </span>
      </Link>
      <style>{`
        .cfs-sidebar-link:hover {
          background-color: rgba(0, 0, 0, 0.03) !important;
        }
      `}</style>
    </li>
  )
}

function ActionItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '12px 14px',
          borderRadius: 10,
          border: 'none',
          background: 'transparent',
          color: 'var(--color-label)',
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background-color 180ms ease-out',
        }}
        className="cfs-sidebar-action"
      >
        {label}
      </button>
      <style>{`
        .cfs-sidebar-action:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }
      `}</style>
    </li>
  )
}
