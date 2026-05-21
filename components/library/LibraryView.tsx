// Sprint 37.A (F9.UI) — Bibliothèque V1 — split brief 40/60.
//
// Gauche : recherche + segmented control + liste filtrée.
// Droite : preview de l'item sélectionné (LibraryPreview, F9.4)
//          ou état vide.

'use client'

import { useMemo, useState } from 'react'
import { SplitBrief } from '@/components/layouts/SplitBrief'
import { LibraryUploadSheet } from './LibraryUploadSheet'
import { LibraryPreview } from './LibraryPreview'
import {
  categoryLabel,
  statusBadgeClass,
  statusLabel,
  tabLabel,
  type LibraryItem,
  type LibraryTab,
} from '@/lib/library/types'

type Props = {
  items: ReadonlyArray<LibraryItem>
}

// Sprint 40 Phase 2B — tab 'conversation' retiré (Bloc 1-9 Conseiller V1 dégagé,
// plus de conversations Conseiller indexées dans la bibliothèque).
const TABS: ReadonlyArray<LibraryTab> = [
  'all',
  'brand-book',
  'document',
  'post',
  'review',
  'programme',
]

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

export function LibraryView({ items }: Props) {
  const [tab, setTab] = useState<LibraryTab>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((it) => {
      if (tab !== 'all' && it.category !== tab) return false
      if (q.length === 0) return true
      return it.searchIndex.includes(q) || it.title.toLowerCase().includes(q)
    })
  }, [items, tab, query])

  const selected = useMemo(
    () => items.find((it) => it.id === selectedId) ?? null,
    [items, selectedId],
  )

  return (
    <>
      {items.length === 0 && query.trim().length === 0 ? (
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--color-secondary-label)',
            margin: '0 0 20px 0',
          }}
        >
          Tout ce que tu as, en un seul endroit.
        </p>
      ) : null}

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
          Ajouter un document
        </button>
      </div>

      <SplitBrief
        mobileOrder="left-first"
        leftColumn={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-tertiary-label)',
                  pointerEvents: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M20 20 L16.5 16.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher dans la Bibliothèque"
                aria-label="Rechercher dans la Bibliothèque"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 10,
                  border: '1px solid var(--color-separator)',
                  background: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: 'var(--font-system)',
                  fontSize: 14,
                  color: 'var(--color-label)',
                  outline: 'none',
                }}
              />
            </div>

            <div className="segmented-control" role="tablist" aria-label="Filtre catégorie">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                >
                  {tabLabel(t)}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 14,
                  color: 'var(--color-secondary-label)',
                  margin: '8px 4px',
                }}
              >
                {query.trim().length > 0
                  ? `Aucun résultat pour "${query}".`
                  : "Aucun élément dans cette catégorie."}
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
                {filtered.map((it) => {
                  const isSelected = it.id === selectedId
                  return (
                    <li key={`${it.category}-${it.id}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(it.id)}
                        aria-pressed={isSelected}
                        className={
                          isSelected
                            ? 'glass-thin cfs-lib-row cfs-lib-row-selected'
                            : 'cfs-lib-row'
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
                          {it.title}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap',
                            fontSize: 12,
                            color: 'var(--color-tertiary-label)',
                          }}
                        >
                          <span className={statusBadgeClass(it.status)}>
                            {statusLabel(it.status)}
                          </span>
                          <span>{categoryLabel(it.category)}</span>
                          <span>· {formatRelativeDate(it.date)}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}

                <style>{`
                  .cfs-lib-row:hover:not(.cfs-lib-row-selected) {
                    background-color: rgba(0, 0, 0, 0.03);
                  }
                  @media (prefers-reduced-motion: reduce) {
                    .cfs-lib-row { transition: none !important; }
                  }
                `}</style>
              </ul>
            )}
          </div>
        }
        rightColumn={
          selected ? (
            <LibraryPreview item={selected} />
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
              Sélectionne un item pour le prévisualiser.
            </article>
          )
        }
      />

      <LibraryUploadSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}
