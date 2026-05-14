// Sprint 37.G (F38) — Wiring du MetricSlider dans le scénario A8 du conseiller.
//
// Affiché au-dessus du textarea ConseillerSheet uniquement quand
// scenarioType === 'A8'. Chips cliquables → ouvre un MetricSlider inline →
// confirmer envoie le texte formaté comme message utilisateur.

'use client'

import { useState } from 'react'
import { MetricSlider, type MetricType } from './MetricSlider'

const METRIC_LABELS: Record<MetricType, string> = {
  followers_count: 'Followers',
  engagement_rate_pct: 'Engagement',
  dm_clients_qualifies_per_month: 'DM clients',
  presse_mentions_per_month: 'Mentions presse',
  comments_qualifies_per_month: 'Commentaires',
  collaborations_demands_per_month: 'Demandes collab',
  newsletter_subscribers: 'Newsletter',
  site_visits_per_month: 'Visites site',
}

const METRIC_PHRASE: Record<MetricType, (v: string) => string> = {
  followers_count: (v) => `J'ai ${v} followers.`,
  engagement_rate_pct: (v) => `Mon taux d'engagement moyen est de ${v}.`,
  dm_clients_qualifies_per_month: (v) => `Je reçois environ ${v} DM clients qualifiés par mois.`,
  presse_mentions_per_month: (v) => `J'ai environ ${v} mentions presse par mois.`,
  comments_qualifies_per_month: (v) => `Je reçois environ ${v} commentaires qualifiés par mois.`,
  collaborations_demands_per_month: (v) => `J'ai environ ${v} demandes de collaboration par mois.`,
  newsletter_subscribers: (v) => `J'ai ${v} abonnés à ma newsletter.`,
  site_visits_per_month: (v) => `Mon site reçoit environ ${v} visites par mois.`,
}

// 6 metric_types principaux dans l'ordre du sub-prompt A8 (Sprint 37.C).
const A8_ORDER: ReadonlyArray<MetricType> = [
  'followers_count',
  'engagement_rate_pct',
  'dm_clients_qualifies_per_month',
  'presse_mentions_per_month',
  'comments_qualifies_per_month',
  'collaborations_demands_per_month',
]

// Helper : récupère le label formaté du slider sans son JSX (pour le message).
function formatMetricForPhrase(metric: MetricType, value: number): string {
  switch (metric) {
    case 'followers_count':
    case 'newsletter_subscribers':
    case 'site_visits_per_month':
      return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)
    case 'engagement_rate_pct':
      return `${value}%`
    default:
      return String(value)
  }
}

type Props = {
  // Callback qui envoie un message comme si le pilote l'avait tapé.
  onSubmit: (message: string) => void
}

export function QuickMetricsRow({ onSubmit }: Props) {
  const [openMetric, setOpenMetric] = useState<MetricType | null>(null)
  const [submitted, setSubmitted] = useState<ReadonlySet<MetricType>>(new Set())

  function handleConfirm(metric: MetricType, value: number) {
    const formatted = formatMetricForPhrase(metric, value)
    const phrase = METRIC_PHRASE[metric](formatted)
    onSubmit(phrase)
    setSubmitted((prev) => {
      const next = new Set(prev)
      next.add(metric)
      return next
    })
    setOpenMetric(null)
  }

  const remaining = A8_ORDER.filter((m) => !submitted.has(m))
  if (remaining.length === 0) return null

  return (
    <section
      aria-label="Renseigner mes chiffres en 1 clic"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '12px 14px',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        background: 'rgba(0, 122, 255, 0.03)',
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
        Renseigner en 1 clic
      </h4>

      {openMetric ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MetricSlider
            metricType={openMetric}
            onSubmit={(value) => handleConfirm(openMetric, value)}
          />
          <button
            type="button"
            onClick={() => setOpenMetric(null)}
            style={{
              alignSelf: 'flex-start',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-secondary-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              padding: 0,
            }}
          >
            Annuler
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {remaining.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setOpenMetric(m)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid rgba(0, 122, 255, 0.18)',
                background: 'rgba(0, 122, 255, 0.06)',
                color: '#007AFF',
                fontFamily: 'var(--font-system)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              + {METRIC_LABELS[m]}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
