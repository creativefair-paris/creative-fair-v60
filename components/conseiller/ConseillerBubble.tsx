// Sprint 37 (Lot 2) — Bulle conseiller (anatomie doc 09 §8).
//
// Pas d'avatar (anti-personnification IA). Point bleu 4px (8px en
// pratique pour lisibilité, cohérent avec le tooltip illustration
// mini-onboarding) en haut à gauche. Pulsant via animation CSS (250ms
// ease-out, doctrine d'animation §00-CONCEPT).
//
// Texte aligné à gauche. Pas de contenant visuel agressif (pas de
// bordure, pas de fond bleu façon WhatsApp). Discrétion.

'use client'

import type { ReactNode } from 'react'

type Props = {
  // Children = contenu rich (titre, options, porte de sortie textuelle).
  // Pour message simple, passer une string.
  children: ReactNode
  // Si true, le point bleu pulse (utilisé pendant THINKING_n pour signaler
  // le travail en cours sans verrou visuel).
  pulsing?: boolean
}

export function ConseillerBubble({ children, pulsing = false }: Props) {
  return (
    <article
      className="cfs-conseiller-bubble"
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        padding: '14px 4px',
      }}
    >
      <span
        aria-hidden="true"
        className={pulsing ? 'cfs-conseiller-dot cfs-conseiller-dot-pulse' : 'cfs-conseiller-dot'}
        style={{
          flexShrink: 0,
          width: 8,
          height: 8,
          borderRadius: 4,
          background: '#007AFF',
          marginTop: 6,
        }}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--color-label)',
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes cfs-conseiller-dot-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(0, 122, 255, 0);
            transform: scale(1.15);
          }
        }
        .cfs-conseiller-dot-pulse {
          animation: cfs-conseiller-dot-pulse 1.6s ease-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-conseiller-dot-pulse { animation: none !important; }
        }
      `}</style>
    </article>
  )
}
