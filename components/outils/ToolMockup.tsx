// Sprint 37.D (F28) — Mockups spécifiques par outil dans la preview de
// /outils. Chaque outil a son propre mini-rendu CSS qui évoque le
// contenu concret (pas de plage vide générique).
//
// Dimensions : ~280-320px de large, ~180-220px de haut.

import type { ReactNode } from 'react'

type ToolMockupProps = {
  toolType:
    | 'conseiller'
    | 'bibliotheque'
    | 'post-creator'
    | 'moodboard'
    | 'variations'
    | 'reviews'
    | 'generic'
}

export function ToolMockup({ toolType }: ToolMockupProps) {
  switch (toolType) {
    case 'conseiller':
      return <ConseillerMockup />
    case 'bibliotheque':
      return <BibliothequeMockup />
    case 'post-creator':
      return <PostCreatorMockup />
    case 'moodboard':
      return <MoodboardMockup />
    case 'variations':
      return <VariationsMockup />
    case 'reviews':
      return <ReviewsMockup />
    default:
      return <GenericMockup />
  }
}

// ── Conseiller ───────────────────────────────────────────────────────────

function ConseillerMockup() {
  return (
    <MockupShell>
      <div
        style={{
          padding: '14px 14px',
          background: 'rgba(0, 122, 255, 0.06)',
          borderRadius: 12,
          border: '1px solid rgba(0, 122, 255, 0.12)',
          marginBottom: 10,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            width: 8,
            height: 8,
            borderRadius: 4,
            background: '#007AFF',
            marginTop: 4,
          }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-system)',
            fontSize: 12,
            lineHeight: 1.5,
            color: 'var(--color-label)',
          }}
        >
          Pour ton plan du 23 jan au 5 mars, je propose 12 posts répartis sur 6 semaines…
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          'Anecdote sourcée — pilier détail',
          'Coulisses — pilier accident',
          'Manifeste — pilier querelles',
        ].map((c) => (
          <span
            key={c}
            style={{
              padding: '8px 12px',
              border: '1px solid rgba(0, 122, 255, 0.18)',
              borderRadius: 8,
              fontFamily: 'var(--font-system)',
              fontSize: 11,
              fontWeight: 500,
              color: '#007AFF',
              background: 'rgba(0, 122, 255, 0.06)',
              textAlign: 'left',
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </MockupShell>
  )
}

// ── Bibliothèque ─────────────────────────────────────────────────────────

function BibliothequeMockup() {
  return (
    <MockupShell>
      <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: 10, height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Brand book.pdf', 'Programme janv.', 'Posts publiés', 'Reviews'].map((t, i) => (
            <span
              key={t}
              style={{
                padding: '6px 8px',
                borderRadius: 6,
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                color: i === 1 ? '#007AFF' : 'var(--color-secondary-label)',
                background: i === 1 ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
                fontWeight: i === 1 ? 600 : 400,
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.03)',
            borderRadius: 8,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600 }}>Programme janv.</span>
          <span style={{ fontSize: 10, color: 'var(--color-secondary-label)' }}>12 posts · 6 sem.</span>
          <div style={{ flex: 1, marginTop: 4, background: 'rgba(0, 122, 255, 0.05)', borderRadius: 4 }} />
        </div>
      </div>
    </MockupShell>
  )
}

// ── Post Creator ─────────────────────────────────────────────────────────

const FORMAT_PREVIEWS: ReadonlyArray<{ label: string; color: string; desc: string }> = [
  { label: 'Anecdote', color: '#007AFF', desc: 'Carrousel 5 slides' },
  { label: 'Produit', color: '#34C759', desc: 'Photo unique' },
  { label: 'Coulisses', color: '#AF52DE', desc: 'Reel 20s' },
]

// Sprint 37.I (F79) — Vrai mockup Instagram iOS 2026 (refonte F71).
// Spécificités iOS 2026 vs Android :
// - Format 4:5 portrait (pas 1:1 carré)
// - Story ring dégradé orange→rose→violet (#F58529→#DD2A7B→#8134AF)
// - Font SF Pro
// - Icons SF Symbols style thin outline (PAS emoji)
// - Séparateurs subtils 1px rgba(0,0,0,0.04)
function PostCreatorMockup() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        maxWidth: 300,
        background: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header iOS : story ring + nom + ⋯ */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          gap: 10,
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Story ring dégradé Instagram official */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            padding: 2,
            background:
              'linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)',
            flexShrink: 0,
            display: 'flex',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#FFFFFF',
              padding: 2,
              display: 'flex',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FBFAF7 0%, #C9B898 100%)',
              }}
            />
          </div>
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#000000',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}
        >
          tamarque.paris
        </span>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: 'rgba(0, 0, 0, 0.85)',
            letterSpacing: 2,
            lineHeight: 1,
          }}
        >
          ⋯
        </span>
      </header>

      {/* Image 4:5 portrait — pas 1:1 carré */}
      <div
        style={{
          aspectRatio: '4 / 5',
          background:
            'linear-gradient(135deg, #FBFAF7 0%, #E8DFD0 30%, #C9B898 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 64,
            height: 64,
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        />
      </div>

      {/* Row icons SF Symbols style thin outline */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px 6px',
          gap: 16,
          color: '#000',
        }}
      >
        {/* Heart outline */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {/* Comment outline */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        {/* Direct paper plane */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        {/* Bookmark à droite */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginLeft: 'auto' }}
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      {/* Caption iOS pattern */}
      <div style={{ padding: '2px 12px 12px', color: '#000' }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
          }}
        >
          <span style={{ fontWeight: 600 }}>tamarque.paris</span>{' '}
          <span style={{ fontWeight: 400 }}>L&apos;histoire derrière ta création préférée…</span>
        </p>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 11,
            color: 'rgba(60, 60, 67, 0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Il y a 2 h
        </p>
      </div>
    </div>
  )
}

// ── Moodboard ────────────────────────────────────────────────────────────

const MOODBOARD_SWATCHES: ReadonlyArray<string> = [
  'linear-gradient(135deg, #BDD7EE, #6FA8DC)',
  'linear-gradient(135deg, #D9EAD3, #93C47D)',
  'linear-gradient(135deg, #FCE5CD, #F6B26B)',
  'linear-gradient(135deg, #D9D2E9, #B4A7D6)',
  'linear-gradient(135deg, #EAD1DC, #C27BA0)',
  'linear-gradient(135deg, #CFE2F3, #6FA8DC)',
  'linear-gradient(135deg, #FFF2CC, #FFD966)',
  'linear-gradient(135deg, #D0E0E3, #76A5AF)',
  'linear-gradient(135deg, #FCE5CD, #E69138)',
]

function MoodboardMockup() {
  return (
    <MockupShell>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, height: '100%' }}>
        {MOODBOARD_SWATCHES.map((bg, i) => (
          <div
            key={i}
            style={{
              borderRadius: 6,
              background: bg,
              aspectRatio: '1 / 1',
            }}
          />
        ))}
      </div>
    </MockupShell>
  )
}

// ── Variations ───────────────────────────────────────────────────────────

function VariationsMockup() {
  return (
    <MockupShell>
      <div style={{ display: 'flex', gap: 10, height: '100%' }}>
        <div
          style={{
            flex: '0 0 40%',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #BDD7EE, #6FA8DC)',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              bottom: 4,
              left: 4,
              fontSize: 9,
              fontWeight: 600,
              padding: '2px 6px',
              background: 'rgba(255, 255, 255, 0.85)',
              borderRadius: 4,
              color: 'var(--color-secondary-label)',
            }}
          >
            Source
          </span>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {[
            'linear-gradient(135deg, #BDD7EE, #4F86C6)',
            'linear-gradient(135deg, #A3C5E3, #5B95D0)',
            'linear-gradient(135deg, #CFE2F3, #80B4DD)',
            'linear-gradient(135deg, #B9D3EC, #5E8DBE)',
          ].map((bg, i) => (
            <div key={i} style={{ borderRadius: 6, background: bg }} />
          ))}
        </div>
      </div>
    </MockupShell>
  )
}

// ── Reviews ──────────────────────────────────────────────────────────────

function ReviewsMockup() {
  return (
    <MockupShell>
      <p
        style={{
          margin: '0 0 8px 0',
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--color-tertiary-label)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Fact-check
      </p>
      <div
        style={{
          padding: 10,
          borderRadius: 8,
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: 'rgba(255, 255, 255, 0.6)',
          marginBottom: 8,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-system)',
            fontSize: 11,
            color: 'var(--color-label)',
            fontStyle: 'italic',
          }}
        >
          « Margiela a délavé ses jeans en 1989 »
        </p>
      </div>
      <div
        style={{
          padding: '8px 10px',
          borderRadius: 8,
          background: 'rgba(52, 199, 89, 0.08)',
          border: '1px solid rgba(52, 199, 89, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            borderRadius: 9,
            background: '#34C759',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          ✓
        </span>
        <span
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--color-label)',
          }}
        >
          Sourçable — archive Le Monde, 1989
        </span>
      </div>
    </MockupShell>
  )
}

// ── Generic fallback ─────────────────────────────────────────────────────

function GenericMockup() {
  return (
    <MockupShell>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-tertiary-label)',
          fontSize: 11,
        }}
      >
        Aperçu disponible bientôt
      </div>
    </MockupShell>
  )
}

// ── Shell ────────────────────────────────────────────────────────────────

function MockupShell({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        maxWidth: 320,
        height: 200,
        padding: 14,
        borderRadius: 14,
        border: '1px solid rgba(0, 0, 0, 0.06)',
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}
