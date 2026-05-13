// Sprint 35 → 36.I — Catalogue Outils.
//
// Sprint 36.I Finding 8 : refonte en 40/60 (liste à gauche, fiche à
// droite). Pattern aligné sur le reste de l'app (Split Brief
// canonique). Le clic sur un item met à jour la fiche, la navigation
// se fait via le CTA "Ouvrir [Nom]" de la fiche.

'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { SplitBrief } from '@/components/layouts/SplitBrief'

type Outil = {
  id: string
  title: string
  description: string
  href: string
  ctaLabel: string
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
    description:
      'Rédige et programme tes publications Instagram. Chaque post part d’un de tes piliers narratifs.',
    href: '/outils/post-creator',
    ctaLabel: 'Ouvrir Post Creator',
    icon: <PencilIcon />,
  },
  {
    id: 'moodboard',
    title: 'Moodboard',
    description:
      'Génère des images d’ambiance qui collent à l’univers visuel de ta marque.',
    href: '/outils/moodboard',
    ctaLabel: 'Ouvrir Moodboard',
    icon: <ImageStackIcon />,
  },
  {
    id: 'variations',
    title: 'Variations',
    description:
      'Décline une image en 6 angles différents — utile pour tester des variantes avant publication.',
    href: '/outils/variations',
    ctaLabel: 'Ouvrir Variations',
    icon: <GridIcon />,
  },
  {
    id: 'reviews',
    title: 'Reviews',
    description:
      'Vérifie un post avant publication. Fact-check du texte, crédits du visuel.',
    href: '/outils/reviews',
    ctaLabel: 'Ouvrir Reviews',
    icon: <StarIcon />,
  },
  {
    id: 'messages',
    title: 'Messages',
    description:
      'Gère tes DM clients et commentaires Instagram avec le conseiller. Cet outil arrive bientôt.',
    href: '/outils/messages',
    ctaLabel: 'Ouvrir Messages',
    icon: <BubbleIcon />,
  },
  {
    id: 'conseiller',
    title: 'Conseiller',
    description:
      'Ton assistant éditorial disponible en continu. Pour affiner un pilier, recadrer un post, ou ajuster ton programme.',
    href: '/outils/conseiller',
    ctaLabel: 'Ouvrir le Conseiller',
    icon: <BubbleIcon />,
  },
] as const

export function CatalogueOutils() {
  const [selectedId, setSelectedId] = useState<string>(OUTILS[0]!.id)
  const selected = OUTILS.find((o) => o.id === selectedId) ?? OUTILS[0]!

  return (
    <SplitBrief
      mobileOrder="left-first"
      leftColumn={
        <ul
          role="list"
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {OUTILS.map((outil) => {
            const isSelected = outil.id === selectedId
            return (
              <li key={outil.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(outil.id)}
                  aria-pressed={isSelected}
                  className={isSelected ? 'glass-thin cfs-outil-row cfs-outil-row-selected' : 'cfs-outil-row'}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: 'none',
                    background: isSelected ? undefined : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'inherit',
                    fontFamily: 'var(--font-system)',
                    transition: 'background-color 200ms ease-out',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: 'var(--color-system-blue)',
                      border: '1px solid var(--color-separator)',
                      background: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {outil.icon}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 15,
                      fontWeight: 500,
                      color: 'var(--color-label)',
                    }}
                  >
                    {outil.title}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      color: 'var(--color-tertiary-label)',
                      display: 'flex',
                      flexShrink: 0,
                    }}
                  >
                    <ChevronRight />
                  </span>
                </button>
              </li>
            )
          })}

          <style>{`
            .cfs-outil-row:hover:not(.cfs-outil-row-selected) {
              background-color: rgba(0,0,0,0.03);
            }
            @media (prefers-reduced-motion: reduce) {
              .cfs-outil-row { transition: none !important; }
            }
          `}</style>
        </ul>
      }
      rightColumn={
        <article
          className="glass-thin"
          style={{
            borderRadius: 16,
            padding: '24px 26px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: 'var(--color-label)',
              margin: 0,
            }}
          >
            {selected.title}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 15,
              lineHeight: 1.55,
              color: 'var(--color-secondary-label)',
              margin: 0,
            }}
          >
            {selected.description}
          </p>
          <Link
            href={selected.href}
            style={{
              alignSelf: 'flex-start',
              marginTop: 4,
              padding: '10px 20px',
              borderRadius: 22,
              background: 'var(--color-label)',
              color: 'var(--color-background)',
              textDecoration: 'none',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {selected.ctaLabel}
          </Link>
        </article>
      }
    />
  )
}
