// Sprint 37 → 37.A (F1+F2) — Bulle conseiller (anatomie doc 09 §8 +
// décisions Apple Cupertino salve 4 — Hiroshi).
//
// Pas d'avatar (anti-personnification IA). Point bleu 4px en haut à
// gauche, pulse 1.5s ease-in-out infinite.
//
// Bulle :
//   - Fond rgba(255, 255, 255, 0.65) + backdrop-filter blur(20px)
//   - padding 16/20, border-radius 16
//   - font 400 15/1.6 system-ui (line-height 1.6 obligatoire)
//   - p+p margin-top 12px (spacing entre paragraphes)
//
// Bulle longue → split visuel sur "\n\n---\n\n" (pattern Messages).

'use client'

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  // Si true, le point bleu pulse (utilisé pendant THINKING_n pour
  // signaler le travail en cours sans verrou visuel).
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
        padding: '8px 0',
      }}
    >
      <span
        aria-hidden="true"
        className={
          pulsing
            ? 'dot-conseiller dot-conseiller--pulse'
            : 'dot-conseiller'
        }
        style={{
          flexShrink: 0,
          width: 8,
          height: 8,
          borderRadius: 4,
          background: '#007AFF',
          marginTop: 22,
        }}
      />
      <div
        className="bulle-conseiller"
        style={{
          flex: 1,
          minWidth: 0,
          color: 'var(--color-label)',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 16,
          border: '1px solid rgba(0, 0, 0, 0.04)',
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes pulse-blue {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1.0; transform: scale(1.15); }
        }
        .dot-conseiller--pulse {
          animation: pulse-blue 1.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .dot-conseiller--pulse { animation: none !important; }
        }
      `}</style>
    </article>
  )
}

// ── Helper : split visuel d'une bulle longue ─────────────────────────────
// Si le texte contient des "\n\n---\n\n", on rend plusieurs
// ConseillerBubble successives. Pattern Apple Messages.
export function ConseillerBubblesFromText({
  text,
  trailing,
}: {
  text: string
  trailing?: ReactNode
}) {
  const parts = text
    .split(/\n\n-{3,}\n\n/g)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  return (
    <>
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1
        return (
          <ConseillerBubble key={i}>
            {renderParagraphs(part)}
            {isLast && trailing ? trailing : null}
          </ConseillerBubble>
        )
      })}
    </>
  )
}

// Convertit "para1\n\npara2\n\npara3" en <p>para1</p><p>para2</p>...
function renderParagraphs(text: string): ReactNode {
  const paragraphs = text.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean)
  if (paragraphs.length === 1) {
    return <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{paragraphs[0]}</p>
  }
  return paragraphs.map((p, i) => (
    <p key={i} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
      {p}
    </p>
  ))
}
