// Sprint 35 — Catalogue Outils (cahier §5.1 réinterprété en liste iOS native).
// Server Component. Pas de state ni d'interaction au-delà de la navigation.

import Link from 'next/link'
import type { ReactNode } from 'react'
import { ListCell } from '@/components/ui/ListCell'

type Outil = {
  id: string
  title: string
  description: string
  href: string
  icon: ReactNode
}

function PencilIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16.5 3.5L20.5 7.5L8 20H4V16L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ImageStackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 4H19C20.1 4 21 4.9 21 6V18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3L14.5 9L21 9.5L16 14L17.5 20.5L12 17L6.5 20.5L8 14L3 9.5L9.5 9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BubbleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12C21 16.4183 17.1944 20 12.5 20C11.0532 20 9.69039 19.6555 8.5 19.0492L4 20L5.18 16.4C4.43 15.2 4 13.8 4 12.3C4 7.88172 7.80558 4.3 12.5 4.3C17.1944 4.3 21 7.88172 21 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const OUTILS: readonly Outil[] = [
  {
    id: 'post-creator',
    title: 'Post Creator',
    description: 'Rédige et programme tes publications Instagram.',
    href: '/outils/post-creator',
    icon: <PencilIcon />,
  },
  {
    id: 'moodboard',
    title: 'Moodboard',
    description: 'Génère des images d\u2019ambiance pour ta marque.',
    href: '/outils/moodboard',
    icon: <ImageStackIcon />,
  },
  {
    id: 'variations',
    title: 'Variations',
    description: 'Décline une image en 6 angles différents.',
    href: '/outils/variations',
    icon: <GridIcon />,
  },
  {
    id: 'reviews',
    title: 'Reviews',
    description: 'Analyse et répond à tes avis clients.',
    href: '/outils/reviews',
    icon: <StarIcon />,
  },
  {
    id: 'conseiller',
    title: 'Conseiller',
    description: 'Ton assistant éditorial disponible 24h/24.',
    href: '/outils/conseiller',
    icon: <BubbleIcon />,
  },
] as const

export function CatalogueOutils() {
  return (
    <div
      role="list"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      {OUTILS.map((outil) => (
        <Link
          key={outil.id}
          href={outil.href}
          className="cfs-outil-link"
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
          }}
        >
          <ListCell
            leading={
              <div
                className="glass-thin"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-system-blue)',
                  border: '1px solid var(--color-separator)',
                }}
              >
                {outil.icon}
              </div>
            }
            title={outil.title}
            description={outil.description}
            trailing={
              <span
                aria-hidden="true"
                style={{ color: 'var(--color-tertiary-label)', display: 'flex' }}
              >
                <ChevronRight />
              </span>
            }
          />
        </Link>
      ))}
    </div>
  )
}
