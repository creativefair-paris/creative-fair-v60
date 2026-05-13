// Sprint 37 (Lot 2) — Bulle pilote (anatomie doc 09 §8).
//
// Alignée à droite, plus discrète que la bulle conseiller. Fond très
// léger crème via Liquid Glass niveau 1. Pas de couleur agressive style
// WhatsApp.

'use client'

type Props = {
  content: string
}

export function PiloteBubble({ content }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '8px 4px',
      }}
    >
      <article
        className="glass-thin"
        style={{
          maxWidth: '80%',
          padding: '10px 14px',
          borderRadius: 14,
          border: '1px solid var(--color-separator)',
          fontFamily: 'var(--font-system)',
          fontSize: 15,
          lineHeight: 1.5,
          color: 'var(--color-label)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
      </article>
    </div>
  )
}
