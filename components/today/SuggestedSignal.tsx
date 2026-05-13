// Sprint 36.G — Bloc C "Suggéré pour toi" (mocké en V1).
//
// Si signal null : retourne null. Le composant est prêt pour brancher
// un vrai endpoint au sprint futur sans refacto.

'use client'

import Link from 'next/link'

export type DailySignal = {
  signalId: string
  territory: string
  message: string
}

type Props = {
  signal: DailySignal | null
}

export function SuggestedSignal({ signal }: Props) {
  if (!signal) return null

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
        href={`/outils/conseiller?context=signal_${encodeURIComponent(signal.signalId)}`}
        style={{
          marginTop: 4,
          fontSize: 13,
          fontWeight: 500,
          color: '#007AFF',
          textDecoration: 'none',
          alignSelf: 'flex-start',
        }}
      >
        Demander au Conseiller →
      </Link>
    </section>
  )
}
