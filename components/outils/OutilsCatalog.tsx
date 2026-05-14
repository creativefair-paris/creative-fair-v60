// Sprint 37.C (F22 + F23) — /outils en 2 colonnes (catalogue + preview toujours visible).
//
// Layout Split Brief : sidebar gauche (36%) catalogue par section,
// preview droite (64%) toujours visible. Au chargement, Conseiller
// sélectionné par défaut.
//
// Sections (F23 reclassification) :
//   - Piloter : Conseiller (héros), Bibliothèque
//   - Créer : Post Creator, Moodboard, Variations, Reviews
//   - À venir : Messages, Emailing, Reels, Films
//
// Pattern Apple Settings : rangées séparées par hover subtle, pas par bloc visuel.
// Items "À venir" disabled avec badge "Bientôt".

'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'

// ── Icônes ───────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 3.5L20.5 7.5L8 20H4V16L16.5 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ImageStackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 4H19C20.1 4 21 4.9 21 6V18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3L14.5 9L21 9.5L16 14L17.5 20.5L12 17L6.5 20.5L8 14L3 9.5L9.5 9L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function BubbleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 12C21 16.4 17.2 20 12.5 20C11 20 9.7 19.7 8.5 19L4 20L5.2 16.4C4.4 15.2 4 13.8 4 12.3C4 7.9 7.8 4.3 12.5 4.3C17.2 4.3 21 7.9 21 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4 L4 20 L8 18 L12 20 L16 18 L20 20 L20 4 L16 6 L12 4 L8 6 L4 4 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 4 L12 20" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 7 L12 13 L21 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 8 L16 12 L10 16 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function FilmIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9H21M3 15H21M8 4V20M16 4V20" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
function MegaphoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9V15L6 16L12 21V3L6 8L3 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M16 8C17.5 9.5 17.5 14.5 16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 5C22 8 22 16 19 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// ── Données ──────────────────────────────────────────────────────────────

type Outil = {
  id: string
  title: string
  shortDescription: string
  longDescription: string
  href: string
  ctaLabel: string
  icon: ReactNode
  hero?: boolean
  available: boolean
}

const PILOTER: ReadonlyArray<Outil> = [
  {
    id: 'conseiller',
    title: 'Conseiller',
    shortDescription: 'Ton assistant éditorial disponible en continu.',
    longDescription:
      "Ton assistant éditorial disponible en continu. Pour affiner un pilier, recadrer un post, trancher une opportunité, ou préparer ta réunion.",
    href: '/outils/conseiller',
    ctaLabel: 'Poser une question',
    icon: <BubbleIcon />,
    hero: true,
    available: true,
  },
  {
    id: 'bibliotheque',
    title: 'Bibliothèque',
    shortDescription: 'Tout ce que tu as, en un seul endroit.',
    longDescription:
      'Tout ce que tu as, en un seul endroit. Brand book, posts publiés, conversations conseiller, reviews, programmes, accessibles depuis une seule vue avec recherche et filtres.',
    href: '/outils/bibliotheque',
    ctaLabel: 'Voir mes documents',
    icon: <BookIcon />,
    available: true,
  },
]

const CREER: ReadonlyArray<Outil> = [
  {
    id: 'post-creator',
    title: 'Post Creator',
    shortDescription: 'Rédige et programme tes publications.',
    longDescription:
      'Rédige et programme tes publications Instagram. Chaque post part d’un de tes piliers narratifs et garde la voix de ta marque.',
    href: '/outils/post-creator',
    ctaLabel: 'Créer un post',
    icon: <PencilIcon />,
    available: true,
  },
  {
    id: 'moodboard',
    title: 'Moodboard',
    shortDescription: "Images d'ambiance qui collent à ton univers.",
    longDescription:
      'Génère des images d’ambiance qui collent à l’univers visuel de ta marque, pour cadrer un photographe ou poser une direction artistique.',
    href: '/outils/moodboard',
    ctaLabel: 'Générer un moodboard',
    icon: <ImageStackIcon />,
    available: true,
  },
  {
    id: 'variations',
    title: 'Variations',
    shortDescription: 'Décline une image en 6 angles.',
    longDescription:
      'Décline une image en 6 angles différents pour tester des variantes avant publication.',
    href: '/outils/variations',
    ctaLabel: 'Décliner une image',
    icon: <GridIcon />,
    available: true,
  },
  {
    id: 'reviews',
    title: 'Reviews',
    shortDescription: 'Vérifie un post avant publication.',
    longDescription:
      'Vérifie un post avant publication. Fact-check du texte (TF Éditorial Magazine) et identification des crédits du visuel (TF Archives & Mémoire).',
    href: '/outils/reviews',
    ctaLabel: 'Vérifier un post',
    icon: <StarIcon />,
    available: true,
  },
]

const A_VENIR: ReadonlyArray<Outil> = [
  {
    id: 'messages',
    title: 'Messages',
    shortDescription: 'DM et commentaires Instagram.',
    longDescription:
      'Gère tes DM clients et commentaires Instagram avec le conseiller, sans quitter Creative Fair.',
    href: '#',
    ctaLabel: '',
    icon: <BubbleIcon />,
    available: false,
  },
  {
    id: 'emailing',
    title: 'Emailing',
    shortDescription: 'Newsletters et emails de marque.',
    longDescription:
      'Rédige et programme tes newsletters et emails de marque, alignés sur tes piliers narratifs.',
    href: '#',
    ctaLabel: '',
    icon: <MailIcon />,
    available: false,
  },
  {
    id: 'reels',
    title: 'Reels',
    shortDescription: 'Scripts et storyboards Reels.',
    longDescription:
      'Génère des scripts et storyboards Reels alignés sur ta signature éditoriale.',
    href: '#',
    ctaLabel: '',
    icon: <PlayIcon />,
    available: false,
  },
  {
    id: 'films',
    title: 'Films',
    shortDescription: 'Films de marque format long.',
    longDescription:
      'Co-construis tes films de marque format long. Brief, structure narrative, repérage références.',
    href: '#',
    ctaLabel: '',
    icon: <FilmIcon />,
    available: false,
  },
  {
    id: 'ads',
    title: 'Ads',
    shortDescription: 'Campagnes paid social et performance.',
    longDescription:
      'Conçois et pilote tes campagnes paid social (Meta Ads). A/B test, ciblage, audience saving, lookalike. Sub-prompt TF Ads (Sofia P.) avec garde-fous d’intégrité de marque.',
    href: '#',
    ctaLabel: '',
    icon: <MegaphoneIcon />,
    available: false,
  },
]

const ALL_OUTILS: ReadonlyArray<Outil> = [...PILOTER, ...CREER, ...A_VENIR]

// ── Composant principal ──────────────────────────────────────────────────

export function OutilsCatalog() {
  // Au chargement : Conseiller sélectionné par défaut.
  const [selectedId, setSelectedId] = useState<string>('conseiller')
  const selected: Outil = ALL_OUTILS.find((o) => o.id === selectedId) ?? PILOTER[0]!

  return (
    <div className="cfs-outils-catalog">
      <aside className="cfs-outils-sidebar" aria-label="Catalogue des outils">
        <CatalogSection
          title="Piloter"
          outils={PILOTER}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <CatalogSection
          title="Créer"
          outils={CREER}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <CatalogSection
          title="À venir"
          outils={A_VENIR}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </aside>

      <section className="cfs-outils-preview" aria-live="polite">
        <OutilPreview outil={selected} />
      </section>

      <style>{`
        .cfs-outils-catalog {
          display: grid;
          grid-template-columns: 36% 64%;
          gap: 32px;
          align-items: start;
        }
        .cfs-outils-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .cfs-outils-preview {
          position: sticky;
          top: 24px;
        }
        @media (max-width: 900px) {
          .cfs-outils-catalog {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .cfs-outils-preview {
            position: static;
          }
        }
      `}</style>
    </div>
  )
}

// ── Section sidebar ──────────────────────────────────────────────────────

function CatalogSection({
  title,
  outils,
  selectedId,
  onSelect,
}: {
  title: string
  outils: ReadonlyArray<Outil>
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h2
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
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {outils.map((outil) => (
          <CatalogRow
            key={outil.id}
            outil={outil}
            selected={outil.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

// ── Rangée sidebar ───────────────────────────────────────────────────────

function CatalogRow({
  outil,
  selected,
  onSelect,
}: {
  outil: Outil
  selected: boolean
  onSelect: (id: string) => void
}) {
  const isActive = outil.available
  const isHero = outil.hero === true

  return (
    <button
      type="button"
      onClick={() => isActive && onSelect(outil.id)}
      disabled={!isActive}
      aria-current={selected ? 'true' : undefined}
      className={`cfs-catalog-row${selected ? ' is-selected' : ''}${isHero ? ' is-hero' : ''}${isActive ? '' : ' is-disabled'}`}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        border: 'none',
        background: 'transparent',
        cursor: isActive ? 'pointer' : 'not-allowed',
        textAlign: 'left',
        fontFamily: 'var(--font-system)',
        color: 'inherit',
        borderRadius: 10,
        transition: 'background-color 180ms ease-out, color 180ms ease-out',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: 7,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: selected ? '#007AFF' : isActive ? 'var(--color-secondary-label)' : 'rgba(0, 0, 0, 0.3)',
          transition: 'color 180ms ease-out',
        }}
      >
        {outil.icon}
      </span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: selected ? '#007AFF' : 'var(--color-label)',
            transition: 'color 180ms ease-out',
          }}
        >
          {outil.title}
        </span>
        {!isActive ? (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-tertiary-label)',
              background: 'rgba(0, 0, 0, 0.05)',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            Bientôt
          </span>
        ) : null}
      </span>

      <style>{`
        .cfs-catalog-row:hover:not(:disabled):not(.is-selected) {
          background-color: rgba(0, 0, 0, 0.03);
        }
        .cfs-catalog-row.is-selected {
          background-color: rgba(0, 122, 255, 0.08);
        }
        .cfs-catalog-row.is-hero:not(.is-selected) {
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.06), rgba(88, 86, 214, 0.04));
        }
        .cfs-catalog-row.is-hero:hover:not(:disabled):not(.is-selected) {
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.09), rgba(88, 86, 214, 0.07));
        }
        .cfs-catalog-row.is-disabled {
          opacity: 0.4;
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-catalog-row { transition: none !important; }
        }
      `}</style>
    </button>
  )
}

// ── Preview ──────────────────────────────────────────────────────────────

function OutilPreview({ outil }: { outil: Outil }) {
  return (
    <article
      className="glass-regular"
      style={{
        borderRadius: 20,
        padding: '32px 32px 28px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        background: 'rgba(251, 250, 247, 0.7)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            width: 48,
            height: 48,
            borderRadius: 12,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#007AFF',
            background: 'rgba(0, 122, 255, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <span style={{ transform: 'scale(1.2)' }}>{outil.icon}</span>
        </span>
        <h2
          style={{
            flex: 1,
            fontFamily: 'var(--font-system)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--color-label)',
            margin: 0,
            letterSpacing: '-0.015em',
            lineHeight: 1.2,
          }}
        >
          {outil.title}
        </h2>
      </header>

      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--color-label)',
          margin: 0,
        }}
      >
        {outil.longDescription}
      </p>

      <MockupPlaceholder outil={outil} />

      {outil.available ? (
        <Link
          href={outil.href}
          className="btn-primary"
          style={{
            alignSelf: 'flex-start',
            textDecoration: 'none',
          }}
        >
          {outil.ctaLabel}
        </Link>
      ) : (
        <span
          style={{
            alignSelf: 'flex-start',
            fontSize: 13,
            color: 'var(--color-tertiary-label)',
            fontStyle: 'italic',
          }}
        >
          Bientôt disponible dans Creative Fair.
        </span>
      )}
    </article>
  )
}

// ── Mockup placeholder ──────────────────────────────────────────────────

function MockupPlaceholder({ outil }: { outil: Outil }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: 14,
        border: '1px solid rgba(0, 0, 0, 0.05)',
        background: `linear-gradient(135deg, rgba(0, 122, 255, 0.05), rgba(88, 86, 214, 0.03))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          width: 96,
          height: 96,
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#007AFF',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        }}
      >
        <span style={{ transform: 'scale(2.2)' }}>{outil.icon}</span>
      </span>
    </div>
  )
}
