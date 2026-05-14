// Sprint 37.H (F73 — Section 1) — Card d'intention pour un event business.
//
// Affiche le RAISONNEMENT du conseiller, pas la liste des posts :
// - Pourquoi couvrir
// - Facteurs pris en compte (3-5 lignes)
// - Comment c'est couvert (référence calendrier sans détailler)

import type { EventIntention } from '@/app/_actions/strategie-events-intention'

type Props = {
  event: EventIntention
}

function formatDateFr(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ]
  return `${d.getDate()} ${mois[d.getMonth()]}`
}

export function EventIntentionCard({ event }: Props) {
  return (
    <article
      className="glass-thin"
      style={{
        padding: '20px 22px',
        borderRadius: 14,
        border: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span aria-hidden="true" style={{ color: '#FF9500', fontSize: 16 }}>◆</span>
        <h4
          style={{
            margin: 0,
            fontFamily: 'var(--font-system)',
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--color-label)',
            letterSpacing: '-0.01em',
          }}
        >
          {event.event_name}
        </h4>
        <span style={{ fontSize: 13, color: 'var(--color-tertiary-label)' }}>
          {formatDateFr(event.event_date)}
        </span>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={subTitleStyle}>Pourquoi le couvrir</span>
        <p style={paraStyle}>{event.pourquoi_couvrir}</p>
      </section>

      {event.facteurs.length > 0 ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={subTitleStyle}>Facteurs pris en compte</span>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {event.facteurs.map((f, i) => (
              <li
                key={i}
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: 'rgba(0, 0, 0, 0.75)',
                  paddingLeft: 12,
                  position: 'relative',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    color: 'var(--color-tertiary-label)',
                  }}
                >
                  ·
                </span>
                {f}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={subTitleStyle}>Comment c&apos;est couvert</span>
        <p style={paraStyle}>{event.comment_couvert}</p>
      </section>
    </article>
  )
}

const subTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-tertiary-label)',
}

const paraStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--color-label)',
}
