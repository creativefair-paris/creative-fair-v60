// Sprint 37.I (F76.list) — Vue Liste : sous-split 50/50.
//
// Gauche : listing chronologique des posts (sélection au clic).
// Droite : colonne preview permanente (fiche du post sélectionné + PostMiniChat).
// Pas de bulle overlay en Liste — la colonne preview reste affichée.

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { PostMiniChat } from './PostMiniChat'
import type { OverlayPost } from './PostPreviewOverlay'

const FORMAT_COLOR: Record<string, string> = {
  anecdote: '#007AFF',
  produit: '#34C759',
  evenement: '#FF9500',
  coulisses: '#AF52DE',
  manifeste: '#FF3B30',
  question: '#5856D6',
}
const FORMAT_LABEL: Record<string, string> = {
  anecdote: 'Anecdote',
  produit: 'Produit',
  evenement: 'Événement',
  coulisses: 'Coulisses',
  manifeste: 'Manifeste',
  question: 'Question',
}

type Props = {
  posts: ReadonlyArray<OverlayPost>
}

function formatShortFr(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `${d.getDate()} ${mois[d.getMonth()]}`
}

function dayShortFr(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  const jours = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM']
  return jours[d.getDay()] ?? ''
}

export function CalendarListView({ posts }: Props) {
  const sorted = useMemo(
    () =>
      [...posts]
        .filter((p) => p.date_prevue)
        .sort((a, b) => (a.date_prevue ?? '').localeCompare(b.date_prevue ?? '')),
    [posts],
  )

  const [selectedId, setSelectedId] = useState<string | null>(sorted[0]?.id ?? null)
  const selected = useMemo(
    () => sorted.find((p) => p.id === selectedId) ?? null,
    [sorted, selectedId],
  )

  if (sorted.length === 0) {
    return (
      <p style={{ padding: '24px 16px', fontSize: 13, color: 'var(--color-secondary-label)', margin: 0 }}>
        Aucun post planifié.
      </p>
    )
  }

  return (
    <div className="cfs-cal-list">
      <aside className="cfs-cal-list-col">
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.map((p) => {
            const isSel = p.id === selectedId
            const color = p.format ? FORMAT_COLOR[p.format] ?? '#8E8E93' : '#D1D1D6'
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  aria-current={isSel ? 'true' : undefined}
                  className={`cfs-cal-list-item${isSel ? ' is-selected' : ''}`}
                >
                  <div className="cfs-cal-list-item-date">
                    <span className="cfs-cal-list-item-day">
                      {p.date_prevue ? dayShortFr(p.date_prevue) : ''}
                    </span>
                    <span className="cfs-cal-list-item-num">
                      {p.date_prevue ? new Date(`${p.date_prevue}T00:00:00`).getDate() : '—'}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {p.format ? (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 5,
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#FFFFFF',
                            background: color,
                          }}
                        >
                          {FORMAT_LABEL[p.format] ?? p.format}
                        </span>
                      ) : null}
                      {p.structure_type ? (
                        <span style={{ fontSize: 11, color: 'var(--color-tertiary-label)' }}>
                          {p.structure_type}
                        </span>
                      ) : null}
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--color-label)',
                        lineHeight: 1.35,
                      }}
                    >
                      {p.objectif_editorial ?? p.titre ?? 'Post sans titre'}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <section className="cfs-cal-list-preview">
        {!selected ? (
          <p style={{ fontSize: 13, color: 'var(--color-secondary-label)', padding: '40px 20px', textAlign: 'center', margin: 0 }}>
            Sélectionne un post pour voir son détail.
          </p>
        ) : (
          <article style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {selected.format ? (
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: 6,
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#FFFFFF',
                      background: FORMAT_COLOR[selected.format] ?? '#8E8E93',
                    }}
                  >
                    {FORMAT_LABEL[selected.format] ?? selected.format}
                  </span>
                ) : null}
                {selected.date_prevue ? (
                  <span style={{ fontSize: 12, color: 'var(--color-tertiary-label)' }}>
                    {formatShortFr(selected.date_prevue)}
                  </span>
                ) : null}
              </div>
              <h3
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-system)',
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--color-label)',
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                }}
              >
                {selected.objectif_editorial ?? selected.titre ?? 'Post sans titre'}
              </h3>
            </header>

            {selected.angle ? (
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'rgba(0, 0, 0, 0.75)' }}>
                {selected.angle}
              </p>
            ) : null}

            {selected.pilier_nom ? (
              <span
                style={{
                  alignSelf: 'flex-start',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(0, 122, 255, 0.08)',
                  border: '1px solid rgba(0, 122, 255, 0.18)',
                  color: '#007AFF',
                }}
              >
                Pilier : {selected.pilier_nom}
              </span>
            ) : null}

            <PostMiniChat postId={selected.id} />

            <Link
              href={`/programme/posts/${selected.id}`}
              className="btn-primary"
              style={{ alignSelf: 'flex-start', textDecoration: 'none' }}
            >
              Éditer ce post →
            </Link>
          </article>
        )}
      </section>

      <style>{`
        .cfs-cal-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          align-items: start;
        }
        .cfs-cal-list-col {
          max-height: 720px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .cfs-cal-list-item {
          width: 100%;
          display: flex;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          text-align: left;
          transition: background-color 180ms ease-out, border-color 180ms ease-out;
        }
        .cfs-cal-list-item:hover:not(.is-selected) {
          background-color: rgba(0, 0, 0, 0.03);
        }
        .cfs-cal-list-item.is-selected {
          background-color: rgba(0, 122, 255, 0.08);
          border-color: rgba(0, 122, 255, 0.2);
        }
        .cfs-cal-list-item-date {
          flex-shrink: 0;
          width: 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-right: 8px;
          border-right: 1px solid rgba(0, 0, 0, 0.06);
        }
        .cfs-cal-list-item-day {
          font-family: var(--font-system);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-tertiary-label);
        }
        .cfs-cal-list-item-num {
          font-family: var(--font-system);
          font-size: 18px;
          font-weight: 700;
          color: var(--color-label);
          letter-spacing: -0.02em;
        }
        .cfs-cal-list-preview {
          padding: 20px 22px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 24px;
        }
        @media (max-width: 900px) {
          .cfs-cal-list {
            grid-template-columns: 1fr;
          }
          .cfs-cal-list-col {
            max-height: none;
          }
          .cfs-cal-list-preview {
            position: static;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-cal-list-item { transition: none !important; }
        }
      `}</style>
    </div>
  )
}
