// Sprint 37.A (F8) — /outils/reviews split brief 40/60.
//
// Liste reviews (gauche) + preview (droite) + bouton "Vérifier un post".
// Pattern aligné sur ConseillerHistory (Lot 3).

'use client'

import { useMemo, useState } from 'react'
import { SplitBrief } from '@/components/layouts/SplitBrief'
import { ReviewSheet } from './ReviewSheet'
import { ReviewPreview } from './ReviewPreview'
import type { ReviewRow, ReviewState } from '@/lib/reviews/types'

type Props = {
  reviews: ReadonlyArray<ReviewRow>
}

function stateBadgeClass(state: ReviewState): string {
  switch (state) {
    case 'PENDING':
      return 'status-badge status-badge--pending'
    case 'COMPLETED':
      return 'status-badge status-badge--published'
    case 'ARCHIVED':
    default:
      return 'status-badge status-badge--archived'
  }
}

function stateLabel(state: ReviewState): string {
  switch (state) {
    case 'PENDING':
      return 'en cours'
    case 'COMPLETED':
      return 'vérifié'
    case 'ARCHIVED':
    default:
      return 'archivé'
  }
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 60) return diffMin <= 1 ? "à l'instant" : `il y a ${diffMin} min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH} h`
  const diffD = Math.round(diffH / 24)
  if (diffD < 7) return `il y a ${diffD} j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

export function ReviewsHistory({ reviews }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    reviews[0]?.id ?? null,
  )
  const [sheetOpen, setSheetOpen] = useState(false)

  const selected = useMemo(
    () => reviews.find((r) => r.id === selectedId) ?? null,
    [reviews, selectedId],
  )

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 0 20px 0',
        }}
      >
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="btn-primary"
        >
          Vérifier un post
        </button>
      </div>

      <SplitBrief
        mobileOrder="left-first"
        leftColumn={
          reviews.length === 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                color: 'var(--color-secondary-label)',
                margin: 0,
                padding: '12px 4px',
                lineHeight: 1.5,
              }}
            >
              Aucune review pour l&apos;instant. Démarre avec le bouton &laquo;&nbsp;Vérifier un post&nbsp;&raquo;.
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {reviews.map((r) => {
                const isSelected = r.id === selectedId
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      aria-pressed={isSelected}
                      className={
                        isSelected
                          ? 'glass-thin cfs-review-row cfs-review-row-selected'
                          : 'cfs-review-row'
                      }
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: 'none',
                        background: isSelected ? undefined : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'var(--font-system)',
                        transition: 'background-color 200ms ease-out',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--color-label)',
                          lineHeight: 1.35,
                        }}
                      >
                        {r.title ?? 'Review sans titre'}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 12,
                          color: 'var(--color-tertiary-label)',
                        }}
                      >
                        <span className={stateBadgeClass(r.state)}>
                          {stateLabel(r.state)}
                        </span>
                        <span>{formatRelativeDate(r.created_at)}</span>
                      </span>
                    </button>
                  </li>
                )
              })}

              <style>{`
                .cfs-review-row:hover:not(.cfs-review-row-selected) {
                  background-color: rgba(0, 0, 0, 0.03);
                }
                @media (prefers-reduced-motion: reduce) {
                  .cfs-review-row { transition: none !important; }
                }
              `}</style>
            </ul>
          )
        }
        rightColumn={
          selected ? (
            <ReviewPreview review={selected} />
          ) : (
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
              Sélectionne une review ou démarre-en une nouvelle avec le bouton
              &laquo;&nbsp;Vérifier un post&nbsp;&raquo;.
            </article>
          )
        }
      />

      <ReviewSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={(id) => setSelectedId(id)}
      />
    </>
  )
}
