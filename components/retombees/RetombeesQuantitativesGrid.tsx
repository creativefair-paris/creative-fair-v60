// Sprint 37.C (Chantier 5) — Grille des indicateurs éditoriaux.
//
// Affiche les dernières valeurs de chaque metric_type avec date de
// renseignement. Bouton "Mettre à jour mes chiffres" déclenche le
// scénario A8 (Renseigner mes chiffres).
//
// Vocabulaire : "indicateurs éditoriaux" / "chiffres" / "retombées".
// JAMAIS : stats, analytics, KPI, métriques, performance.

'use client'

import Link from 'next/link'

type MetricRow = {
  metric_type: string
  value: number
  recorded_at: string
}

const LABELS: Record<string, string> = {
  followers_count: 'Followers actuels',
  engagement_rate_pct: 'Engagement moyen',
  dm_clients_qualifies_per_month: 'DM clients qualifiés',
  presse_mentions_per_month: 'Mentions presse',
  comments_qualifies_per_month: 'Commentaires qualifiés',
  collaborations_demands_per_month: 'Demandes de collaborations',
  newsletter_subscribers: 'Abonnés newsletter',
  site_visits_per_month: 'Visites site',
}

const SUFFIXES: Record<string, string> = {
  followers_count: '',
  engagement_rate_pct: ' %',
  dm_clients_qualifies_per_month: ' / mois',
  presse_mentions_per_month: ' / mois',
  comments_qualifies_per_month: ' / mois',
  collaborations_demands_per_month: ' / mois',
  newsletter_subscribers: '',
  site_visits_per_month: ' / mois',
}

const ORDER: ReadonlyArray<string> = [
  'followers_count',
  'engagement_rate_pct',
  'dm_clients_qualifies_per_month',
  'presse_mentions_per_month',
  'comments_qualifies_per_month',
  'collaborations_demands_per_month',
  'newsletter_subscribers',
  'site_visits_per_month',
]

export function RetombeesQuantitativesGrid({
  latestByType,
}: {
  latestByType: Record<string, MetricRow>
}) {
  const hasAny = Object.keys(latestByType).length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {hasAny ? (
        <div
          className="glass-thin"
          style={{
            borderRadius: 14,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          {ORDER.filter((t) => latestByType[t]).map((type, i, arr) => {
            const m = latestByType[type]
            if (!m) return null
            return (
              <div
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderBottom:
                    i < arr.length - 1
                      ? '1px solid rgba(0, 0, 0, 0.04)'
                      : 'none',
                  gap: 16,
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontFamily: 'var(--font-system)',
                    fontSize: 14,
                    color: 'var(--color-secondary-label)',
                  }}
                >
                  {LABELS[type] ?? type}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--color-label)',
                    minWidth: 80,
                    textAlign: 'right',
                  }}
                >
                  {formatValue(m.value)}
                  {SUFFIXES[type] ?? ''}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 12,
                    color: 'var(--color-tertiary-label)',
                    minWidth: 120,
                    textAlign: 'right',
                  }}
                >
                  Renseigné le {formatDateFr(m.recorded_at)}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div
          className="glass-thin"
          style={{
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            color: 'var(--color-secondary-label)',
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          Aucun chiffre renseigné. Le conseiller peut t’aider à les poser
          en quelques minutes.
        </div>
      )}

      <div>
        <Link
          href="/outils/conseiller?scenario=A8"
          className="btn-primary"
          style={{
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Mettre à jour mes chiffres →
        </Link>
      </div>
    </div>
  )
}

function formatValue(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString('fr-FR')
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
}

function formatDateFr(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const mois = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
  ]
  return `${d.getDate()} ${mois[d.getMonth()]}`
}
