// Sprint 37.F (F38) — Slider de plage pour les chiffres dans le scénario A8.
//
// Au lieu de demander au pilote de taper un nombre, on lui propose un
// slider avec des stops adaptés au metric_type. Confirme la valeur en
// 1 clic sans bagarre saisie clavier.

'use client'

import { useState } from 'react'

export type MetricType =
  | 'followers_count'
  | 'engagement_rate_pct'
  | 'dm_clients_qualifies_per_month'
  | 'presse_mentions_per_month'
  | 'comments_qualifies_per_month'
  | 'collaborations_demands_per_month'
  | 'newsletter_subscribers'
  | 'site_visits_per_month'

type Config = {
  stops: ReadonlyArray<number>
  format: (v: number) => string
  suffix: string
  label: string
}

const METRIC_RANGES: Record<MetricType, Config> = {
  followers_count: {
    stops: [0, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000],
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()),
    suffix: 'followers',
    label: 'Followers actuels',
  },
  engagement_rate_pct: {
    stops: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 7, 10, 15],
    format: (v) => `${v}%`,
    suffix: "d'engagement",
    label: 'Engagement moyen',
  },
  dm_clients_qualifies_per_month: {
    stops: [0, 1, 2, 5, 10, 20, 50, 100],
    format: (v) => v.toString(),
    suffix: 'DM clients / mois',
    label: 'DM clients qualifiés',
  },
  presse_mentions_per_month: {
    stops: [0, 1, 2, 3, 5, 10, 20, 50],
    format: (v) => v.toString(),
    suffix: 'mentions presse / mois',
    label: 'Mentions presse',
  },
  comments_qualifies_per_month: {
    stops: [0, 5, 10, 25, 50, 100, 250, 500],
    format: (v) => v.toString(),
    suffix: 'commentaires qualifiés / mois',
    label: 'Commentaires qualifiés',
  },
  collaborations_demands_per_month: {
    stops: [0, 1, 2, 5, 10, 20, 50],
    format: (v) => v.toString(),
    suffix: 'demandes de collab / mois',
    label: 'Demandes de collaborations',
  },
  newsletter_subscribers: {
    stops: [0, 100, 500, 1000, 5000, 10000, 50000, 100000],
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()),
    suffix: 'abonnés',
    label: 'Abonnés newsletter',
  },
  site_visits_per_month: {
    stops: [0, 500, 1000, 5000, 10000, 50000, 100000, 500000],
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()),
    suffix: 'visites / mois',
    label: 'Visites site',
  },
}

type Props = {
  metricType: MetricType
  initialValue?: number
  onSubmit: (value: number) => void
  disabled?: boolean
}

export function MetricSlider({ metricType, initialValue, onSubmit, disabled }: Props) {
  const config = METRIC_RANGES[metricType]
  const stops = config.stops

  const initialIndex = ((): number => {
    if (initialValue == null) return Math.floor(stops.length / 2)
    const idx = stops.findIndex((s) => s >= initialValue)
    return idx === -1 ? Math.floor(stops.length / 2) : idx
  })()

  const [index, setIndex] = useState(initialIndex)
  const value = stops[index] ?? 0

  return (
    <section
      aria-label={`Renseigner ${config.label}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '16px 18px',
        borderRadius: 14,
        background: 'rgba(0, 122, 255, 0.04)',
        border: '1px solid rgba(0, 122, 255, 0.15)',
      }}
    >
      <h4
        style={{
          margin: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-tertiary-label)',
        }}
      >
        {config.label}
      </h4>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-label)',
            letterSpacing: '-0.02em',
          }}
        >
          {config.format(value)}
        </span>
        <span style={{ fontSize: 13, color: 'var(--color-secondary-label)' }}>
          {config.suffix}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={stops.length - 1}
        step={1}
        value={index}
        onChange={(e) => setIndex(parseInt(e.target.value, 10))}
        disabled={disabled}
        aria-label={`Slider ${config.label}`}
        style={{ width: '100%', accentColor: '#007AFF' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-tertiary-label)' }}>
        <span>{config.format(stops[0] ?? 0)}</span>
        <span>{config.format(stops[stops.length - 1] ?? 0)}</span>
      </div>

      <button
        type="button"
        onClick={() => onSubmit(value)}
        disabled={disabled}
        className="btn-primary"
        style={{ alignSelf: 'flex-start' }}
      >
        Confirmer {config.format(value)}
      </button>
    </section>
  )
}
