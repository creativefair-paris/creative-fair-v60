// Sprint 37.D (F28) — Mockups spécifiques par outil dans la preview de
// /outils. Chaque outil a son propre mini-rendu CSS qui évoque le
// contenu concret (pas de plage vide générique).
//
// Dimensions : ~280-320px de large, ~180-220px de haut.

import type { ReactNode } from 'react'
import { InstagramIOSMockup } from './mockups/InstagramIOSMockup'
// Sprint 40 Phase 2B — import ConseillerIPhoneMockup retiré (Bloc 9 :
// concept Conseiller standalone dégagé, fusionné dans Messages V2.0).

type ToolMockupProps = {
  toolType:
    | 'bibliotheque'
    | 'post-creator'
    | 'moodboard'
    | 'variations'
    | 'reviews'
    | 'generic'
}

export function ToolMockup({ toolType }: ToolMockupProps) {
  switch (toolType) {
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

// Sprint 40 Phase 2B — fonction ConseillerMockup retirée (Bloc 9).

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

// Sprint 37.M (F86.3) — Câblage complet des props CF pour aligner sur la
// capture iOS référence (Le Monde 'L'asthme une maladie banalisée…') :
// hasStory false par défaut (pas de halo dans la ref), 8 slides carousel,
// caption longue pour déclencher la troncature "… plus".
function PostCreatorMockup() {
  return (
    <InstagramIOSMockup
      username="creativefair.paris"
      isVerified={true}
      hasStory={false}
      timestamp="4 h"
      hasCarousel={true}
      slidesCount={8}
      activeSlide={0}
      likes={330}
      comments={2}
      reposts={11}
      caption="L'histoire derrière ta création préférée, racontée avec les mots que tu n'oses pas dire en public mais qui résonnent."
      showTranslateButton={false}
      size="md"
    />
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
