// Sprint 35 → 36.I → 37.A — Catalogue Outils.
//
// Sprint 37.A (décision Apple Cupertino salve 4 — Marcus) : hiérarchie
// "Conseiller héros". Refonte en CSS Grid 2 colonnes. Conseiller occupe
// les 2 colonnes en première ligne (carte plus généreuse, Liquid Glass
// niveau 2). Les autres outils tiennent en 1 colonne chacun (Liquid
// Glass niveau 1).
//
// Plus de preview au clic : chaque carte est un lien direct vers la
// page de l'outil (simplification + alignement avec décision Marcus
// "le Conseiller est le héros V1").

import Link from 'next/link'
import type { ReactNode } from 'react'

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

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4 L4 20 L8 18 L12 20 L16 18 L20 20 L20 4 L16 6 L12 4 L8 6 L4 4 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 4 L12 20"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  )
}

// Conseiller = héros V1 (décision Marcus salve 4). Toujours en tête.
const HERO: Outil = {
  id: 'conseiller',
  title: 'Conseiller',
  description:
    "Ton assistant éditorial disponible en continu. Pour affiner un pilier, recadrer un post, trancher une opportunité, ou préparer ta réunion.",
  href: '/outils/conseiller',
  ctaLabel: 'Ouvrir le Conseiller',
  icon: <BubbleIcon />,
}

const OUTILS: readonly Outil[] = [
  {
    id: 'bibliotheque',
    title: 'Bibliothèque',
    description:
      'Tout ce que tu as, en un seul endroit. Brand book, posts publiés, conversations, reviews, programmes.',
    href: '/outils/bibliotheque',
    ctaLabel: 'Ouvrir la Bibliothèque',
    icon: <BookIcon />,
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
      'Décline une image en 6 angles différents pour tester des variantes avant publication.',
    href: '/outils/variations',
    ctaLabel: 'Ouvrir Variations',
    icon: <GridIcon />,
  },
] as const

export function CatalogueOutils() {
  return (
    <div className="cfs-outils-grid">
      {/* Carte héros — Conseiller (occupe les 2 colonnes en ligne 1). */}
      <Link
        href={HERO.href}
        className="glass-regular cfs-outils-card cfs-outils-card-hero"
      >
        <span aria-hidden="true" className="cfs-outils-icon cfs-outils-icon-hero">
          {HERO.icon}
        </span>
        <span className="cfs-outils-card-body">
          <span className="cfs-outils-title cfs-outils-title-hero">{HERO.title}</span>
          <span className="cfs-outils-description">{HERO.description}</span>
        </span>
      </Link>

      {/* Cartes 1-col pour les autres outils. */}
      {OUTILS.map((outil) => (
        <Link
          key={outil.id}
          href={outil.href}
          className="glass-thin cfs-outils-card"
        >
          <span aria-hidden="true" className="cfs-outils-icon">
            {outil.icon}
          </span>
          <span className="cfs-outils-card-body">
            <span className="cfs-outils-title">{outil.title}</span>
            <span className="cfs-outils-description">{outil.description}</span>
          </span>
        </Link>
      ))}

      <style>{`
        .cfs-outils-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          width: 100%;
        }
        .cfs-outils-card {
          display: flex;
          gap: 14px;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          text-decoration: none;
          color: inherit;
          transition: background-color 180ms ease-out, transform 180ms ease-out;
        }
        .cfs-outils-card:hover {
          transform: translateY(-1px);
        }
        .cfs-outils-card-hero {
          grid-column: 1 / -1;
          padding: 24px;
          gap: 18px;
          border-radius: 16px;
          border-color: rgba(0, 122, 255, 0.18);
        }
        .cfs-outils-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #007AFF;
          border: 1px solid var(--color-separator);
          background: rgba(255, 255, 255, 0.6);
        }
        .cfs-outils-icon-hero {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(0, 122, 255, 0.08);
          border-color: rgba(0, 122, 255, 0.2);
        }
        .cfs-outils-card-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }
        .cfs-outils-title {
          font-family: var(--font-system);
          font-size: 16px;
          font-weight: 600;
          color: var(--color-label);
          line-height: 1.3;
        }
        .cfs-outils-title-hero {
          font-size: 20px;
        }
        .cfs-outils-description {
          font-family: var(--font-system);
          font-size: 13px;
          line-height: 1.5;
          color: var(--color-secondary-label);
        }
        @media (max-width: 768px) {
          .cfs-outils-grid {
            grid-template-columns: 1fr;
          }
          .cfs-outils-card-hero {
            grid-column: 1 / -1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-outils-card { transition: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  )
}
