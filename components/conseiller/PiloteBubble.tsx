// Sprint 37 → 37.A (F1+F2) — Bulle pilote (anatomie doc 09 §8 +
// décisions Apple Cupertino salve 4 — Hiroshi).
//
// Alignée à droite. Fond bleu très léger rgba(0, 122, 255, 0.06) +
// backdrop-filter blur(10px). Padding 12/16. Border-radius 16 avec
// coin bas-droite plus serré (4px) — bubble pattern iOS Messages.

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
        padding: '6px 0',
      }}
    >
      <article
        style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: '16px 16px 4px 16px',
          background: 'rgba(0, 122, 255, 0.06)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
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
