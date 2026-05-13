// Sprint 37.B (F15) — /outils refondu en Apple Settings macOS pattern.
//
// Sections (titre small caps + rangées séparées) :
//   - Principaux : Conseiller (héros, fond Liquid Glass subtle) + Bibliothèque
//   - Posts : Post Creator + Reviews
//   - Images : Moodboard + Variations
//   - À venir : Messages + Emailing + Reels (grisés, badge "Bientôt")
//
// Au clic sur une rangée active : sheet preview avec 3 sections
// (Description / À quoi ça ressemble / Action concrète).

'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'

// ── Icônes ───────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 3.5L20.5 7.5L8 20H4V16L16.5 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ImageStackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 4H19C20.1 4 21 4.9 21 6V18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3L14.5 9L21 9.5L16 14L17.5 20.5L12 17L6.5 20.5L8 14L3 9.5L9.5 9L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function BubbleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 12C21 16.4 17.2 20 12.5 20C11 20 9.7 19.7 8.5 19L4 20L5.2 16.4C4.4 15.2 4 13.8 4 12.3C4 7.9 7.8 4.3 12.5 4.3C17.2 4.3 21 7.9 21 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4 L4 20 L8 18 L12 20 L16 18 L20 20 L20 4 L16 6 L12 4 L8 6 L4 4 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 4 L12 20" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 7 L12 13 L21 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 8 L16 12 L10 16 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
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

const PRINCIPAUX: ReadonlyArray<Outil> = [
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
      'Tout ce que tu as, en un seul endroit. Brand book, posts publiés, conversations conseiller, reviews, programmes — accessibles depuis une seule vue avec recherche et filtres.',
    href: '/outils/bibliotheque',
    ctaLabel: 'Voir mes documents',
    icon: <BookIcon />,
    available: true,
  },
]

const POSTS: ReadonlyArray<Outil> = [
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

const IMAGES: ReadonlyArray<Outil> = [
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
]

const A_VENIR: ReadonlyArray<Outil> = [
  {
    id: 'messages',
    title: 'Messages',
    shortDescription: 'DM et commentaires Instagram.',
    longDescription:
      'Gère tes DM clients et commentaires Instagram avec le conseiller, sans quitter Creative Fair.',
    href: '/outils/messages',
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
]

// ── Composant principal ──────────────────────────────────────────────────

export function OutilsSettings() {
  const [previewId, setPreviewId] = useState<string | null>(null)

  const allOutils = [...PRINCIPAUX, ...POSTS, ...IMAGES]
  const preview = previewId ? allOutils.find((o) => o.id === previewId) ?? null : null

  return (
    <>
      <Section title="Principaux" outils={PRINCIPAUX} onOpenPreview={setPreviewId} />
      <Section title="Posts" outils={POSTS} onOpenPreview={setPreviewId} />
      <Section title="Images" outils={IMAGES} onOpenPreview={setPreviewId} />
      <Section title="À venir" outils={A_VENIR} onOpenPreview={null} />

      {preview ? (
        <ToolPreviewSheet outil={preview} onClose={() => setPreviewId(null)} />
      ) : null}
    </>
  )
}

// ── Section ──────────────────────────────────────────────────────────────

function Section({
  title,
  outils,
  onOpenPreview,
}: {
  title: string
  outils: ReadonlyArray<Outil>
  onOpenPreview: ((id: string) => void) | null
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-tertiary-label)',
          margin: '0 0 8px 4px',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        {outils.map((outil, i) => (
          <Row
            key={outil.id}
            outil={outil}
            divider={i < outils.length - 1}
            onOpenPreview={onOpenPreview}
          />
        ))}
      </div>
    </section>
  )
}

// ── Rangée ───────────────────────────────────────────────────────────────

function Row({
  outil,
  divider,
  onOpenPreview,
}: {
  outil: Outil
  divider: boolean
  onOpenPreview: ((id: string) => void) | null
}) {
  const isHero = outil.hero === true
  const isActive = outil.available

  const handleClick = () => {
    if (!isActive || !onOpenPreview) return
    onOpenPreview(outil.id)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isActive}
      aria-label={`${outil.title} — ${outil.shortDescription}`}
      className={`cfs-outils-row${isHero ? ' cfs-outils-row-hero' : ''}${isActive ? '' : ' cfs-outils-row-disabled'}`}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 20px',
        border: 'none',
        background: 'transparent',
        cursor: isActive ? 'pointer' : 'not-allowed',
        textAlign: 'left',
        fontFamily: 'var(--font-system)',
        color: 'inherit',
        borderBottom: divider ? '1px solid rgba(0, 0, 0, 0.04)' : 'none',
        transition: 'background-color 180ms ease-out',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 9,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isActive ? '#007AFF' : 'rgba(0, 0, 0, 0.3)',
          background: isHero ? 'rgba(0, 122, 255, 0.08)' : 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        {outil.icon}
      </span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--color-label)',
          }}
        >
          {outil.title}
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
        <span
          style={{
            fontSize: 13,
            color: 'var(--color-secondary-label)',
            lineHeight: 1.4,
          }}
        >
          {outil.shortDescription}
        </span>
      </span>
      {isActive ? (
        <span
          aria-hidden="true"
          style={{
            color: 'var(--color-tertiary-label)',
            flexShrink: 0,
            display: 'inline-flex',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : null}

      <style>{`
        .cfs-outils-row:hover:not(:disabled):not(.cfs-outils-row-disabled) {
          background-color: rgba(0, 0, 0, 0.02);
        }
        .cfs-outils-row-hero {
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.04), rgba(88, 86, 214, 0.04));
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .cfs-outils-row-hero:hover {
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.07), rgba(88, 86, 214, 0.07)) !important;
        }
        .cfs-outils-row-disabled { opacity: 0.5; }
        @media (prefers-reduced-motion: reduce) {
          .cfs-outils-row { transition: none !important; }
        }
      `}</style>
    </button>
  )
}

// ── Sheet preview ───────────────────────────────────────────────────────

function ToolPreviewSheet({ outil, onClose }: { outil: Outil; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tool-preview-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.18)',
        }}
      />
      <section
        className="glass-regular"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 560,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 20,
          padding: '28px 28px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          background: 'rgba(251, 250, 247, 0.96)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.12)',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#007AFF',
              background: 'rgba(0, 122, 255, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            {outil.icon}
          </span>
          <h2
            id="tool-preview-title"
            style={{
              flex: 1,
              fontFamily: 'var(--font-system)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-label)',
              margin: 0,
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            {outil.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la prévisualisation"
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: 16,
              border: 'none',
              background: 'rgba(120, 120, 128, 0.12)',
              color: 'var(--color-label)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M4 4 L14 14 M14 4 L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={previewSectionHeaderStyle}>Description</h3>
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--color-label)',
              margin: 0,
            }}
          >
            {outil.longDescription}
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={previewSectionHeaderStyle}>À quoi ça ressemble</h3>
          <MockupPlaceholder outil={outil} />
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={previewSectionHeaderStyle}>Action concrète</h3>
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
        </section>
      </section>
    </div>
  )
}

const previewSectionHeaderStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-tertiary-label)',
  margin: 0,
}

// ── Mockup placeholder ──────────────────────────────────────────────────
// V1 : pas d'images réelles. Placeholder CSS stylisé Apple-grade qui
// évoque le contenu de l'outil sans le mimer servilement.

function MockupPlaceholder({ outil }: { outil: Outil }) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: 12,
        border: '1px solid rgba(0, 0, 0, 0.05)',
        background: `linear-gradient(135deg, rgba(0, 122, 255, 0.04), rgba(88, 86, 214, 0.03))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#007AFF',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        }}
      >
        <span style={{ transform: 'scale(1.8)' }}>{outil.icon}</span>
      </span>
    </div>
  )
}
