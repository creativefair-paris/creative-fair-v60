// Sprint 37.A (F8) — Preview d'une review (colonne droite split brief).
//
// Affiche les 3 sections du brief :
//   1. Fact-check texte (array statement + status)
//   2. Crédit visuel (auteur, archive, année, licence, alternative)
//   3. Crédit prêt à coller avec bouton Copier

'use client'

import { useCallback, useState } from 'react'
import type {
  FactCheckItem,
  ReviewRow,
  VisualCredit,
} from '@/lib/reviews/types'

type Props = {
  review: ReviewRow
}

function statusBadgeClass(status: FactCheckItem['status']): string {
  switch (status) {
    case 'sourcable':
      return 'status-badge status-badge--published'
    case 'a_verifier':
      return 'status-badge status-badge--draft'
    case 'non_sourcable':
    default:
      return 'status-badge status-badge--archived'
  }
}

function statusLabel(status: FactCheckItem['status']): string {
  switch (status) {
    case 'sourcable':
      return 'sourçable'
    case 'a_verifier':
      return 'à vérifier'
    case 'non_sourcable':
    default:
      return 'non sourçable'
  }
}

export function ReviewPreview({ review }: Props) {
  const [copied, setCopied] = useState(false)

  const factCheck = Array.isArray(review.fact_check_payload)
    ? (review.fact_check_payload as FactCheckItem[])
    : []
  const credit =
    review.visual_credit_payload && typeof review.visual_credit_payload === 'object'
      ? (review.visual_credit_payload as VisualCredit)
      : null

  const handleCopy = useCallback(async () => {
    if (!review.ready_to_paste_credit) return
    try {
      await navigator.clipboard.writeText(review.ready_to_paste_credit)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }, [review.ready_to_paste_credit])

  if (review.state === 'PENDING') {
    return (
      <article
        className="glass-thin"
        style={{
          borderRadius: 16,
          padding: '24px 26px',
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          color: 'var(--color-secondary-label)',
        }}
      >
        Reviews est en train de vérifier ce post…
      </article>
    )
  }

  return (
    <article
      className="glass-thin"
      style={{
        borderRadius: 16,
        padding: '24px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <header>
        <h2
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--color-label)',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {review.title ?? 'Review sans titre'}
        </h2>
      </header>

      <section>
        <h3 style={sectionHeaderStyle}>Fact-check texte</h3>
        {factCheck.length === 0 ? (
          <p style={emptyStyle}>Pas d&apos;affirmation à vérifier dans ce post.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {factCheck.map((item, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <span className={statusBadgeClass(item.status)}>
                  {statusLabel(item.status)}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-system)',
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: 'var(--color-label)',
                  }}
                >
                  {item.statement}
                </p>
                {item.suggested_source ? (
                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-system)',
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: 'var(--color-tertiary-label)',
                    }}
                  >
                    Source : {item.suggested_source}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 style={sectionHeaderStyle}>Crédit visuel</h3>
        {credit ? (
          <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 16px', margin: 0 }}>
            <dt style={dtStyle}>Auteur</dt>
            <dd style={ddStyle}>{credit.auteur}</dd>
            <dt style={dtStyle}>Archive</dt>
            <dd style={ddStyle}>{credit.archive}</dd>
            <dt style={dtStyle}>Année</dt>
            <dd style={ddStyle}>{credit.annee}</dd>
            <dt style={dtStyle}>Licence</dt>
            <dd style={ddStyle}>{credit.licence}</dd>
            {credit.alternative ? (
              <>
                <dt style={dtStyle}>Alternative</dt>
                <dd style={ddStyle}>{credit.alternative}</dd>
              </>
            ) : null}
          </dl>
        ) : (
          <p style={emptyStyle}>Pas de visuel à créditer.</p>
        )}
      </section>

      {review.ready_to_paste_credit ? (
        <section>
          <h3 style={sectionHeaderStyle}>Crédit prêt à coller</h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(0, 0, 0, 0.04)',
              flexWrap: 'wrap',
            }}
          >
            <code
              style={{
                fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                fontSize: 13,
                color: 'var(--color-label)',
                flex: 1,
                minWidth: 0,
                wordBreak: 'break-word',
              }}
            >
              {review.ready_to_paste_credit}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="btn-choice btn-choice-sm"
            >
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
        </section>
      ) : null}
    </article>
  )
}

const sectionHeaderStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-tertiary-label)',
  margin: '0 0 10px 0',
}

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  color: 'var(--color-secondary-label)',
  margin: 0,
}

const dtStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-tertiary-label)',
}

const ddStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  color: 'var(--color-label)',
  margin: 0,
}
