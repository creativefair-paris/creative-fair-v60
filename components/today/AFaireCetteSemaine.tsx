// Sprint 37.A (F7) — Bloc "À faire cette semaine" sur /aujourd-hui.
//
// Titre exact (copy Sarah salve 4) : "À faire cette semaine".
// Max 3 cards dynamiques. Si 0 suggestion → bloc non rendu du tout
// (anti-friction Apple, pas de "Aucune suggestion pour le moment").
//
// Cards :
//   - Liquid Glass niveau 1 : rgba(255, 255, 255, 0.55) + blur(10px)
//   - Border-radius 14, padding 16
//   - Hover : background rgba(255, 255, 255, 0.75) + translateY(-1px)
//   - Entièrement cliquables — pas de bouton "Voir →" séparé
//   - Pas d'emoji, pas de gradient agressif, pas de CTA explicite

import Link from 'next/link'
import type { Suggestion } from '@/lib/aujourd-hui/suggestions'

type Props = {
  suggestions: ReadonlyArray<Suggestion>
}

export function AFaireCetteSemaine({ suggestions }: Props) {
  if (suggestions.length === 0) return null

  return (
    <section
      aria-label="À faire cette semaine"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: 'var(--color-label)',
          margin: 0,
          padding: '6px 0',
        }}
      >
        À faire cette semaine
      </h2>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {suggestions.map((s, i) => (
          <li key={i}>
            <Link
              href={s.href}
              className="cfs-a-faire-card"
              style={{
                display: 'block',
                padding: '16px 18px',
                borderRadius: 14,
                border: '1px solid rgba(0, 0, 0, 0.05)',
                background: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(10px) saturate(160%)',
                WebkitBackdropFilter: 'blur(10px) saturate(160%)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background-color 180ms ease-out, transform 180ms ease-out',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-system)',
                  fontSize: 15,
                  lineHeight: 1.4,
                  fontWeight: 500,
                  color: '#000000',
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'rgba(0, 0, 0, 0.6)',
                }}
              >
                {s.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <style>{`
        .cfs-a-faire-card:hover {
          background-color: rgba(255, 255, 255, 0.75) !important;
          transform: translateY(-1px);
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-a-faire-card { transition: none !important; transform: none !important; }
        }
      `}</style>
    </section>
  )
}
