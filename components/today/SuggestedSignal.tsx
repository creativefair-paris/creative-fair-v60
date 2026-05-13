// Sprint 36.G → 36.H — Bloc C "Suggéré pour toi".
//
// Sprint 36.H Finding 8 : le CTA est désormais spécifique au signal
// (ctaLabel + ctaContext sur le type DailySignal). Le composant reste
// agnostique du backend — il consomme ce qu'on lui passe.
//
// Sprint 36.I Finding 3 — DEPRECATED en V1 : plus rendu nulle part.
// Le mock daily-signal a été supprimé car il mentait à toutes les
// marques. Le composant est conservé tel quel — il sera réutilisé
// Sprint 37 quand les Task Forces produiront de vrais signaux.

'use client'

import Link from 'next/link'

export type DailySignalTerritory =
  | 'SIGNAL DE VEILLE'
  | 'INSIGHT ÉDITORIAL'
  | 'OPPORTUNITÉ CULTURELLE'

export type DailySignal = {
  signalId: string
  territory: DailySignalTerritory
  message: string
  // Sprint 36.H Finding 8 — CTA spécifique au signal.
  ctaLabel: string
  ctaContext: string  // pré-fill conseiller
}

type Props = {
  signal: DailySignal | null
}

export function SuggestedSignal({ signal }: Props) {
  if (!signal) return null

  const href = `/outils/conseiller?context=${encodeURIComponent(signal.ctaContext)}`

  return (
    <section
      className="glass-thin"
      style={{
        borderRadius: 14,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontFamily: 'var(--font-system)',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'rgba(0,0,0,0.55)',
        }}
      >
        {signal.territory}
      </span>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#1C1C1E' }}>
        {signal.message}
      </p>
      <Link
        href={href}
        style={{
          marginTop: 4,
          fontSize: 13,
          fontWeight: 500,
          color: '#007AFF',
          textDecoration: 'none',
          alignSelf: 'flex-start',
        }}
      >
        {signal.ctaLabel} →
      </Link>
    </section>
  )
}
