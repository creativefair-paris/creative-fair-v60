// Sprint 36.B.3 — Sheet "Benchmarks revendiqués".
// 3 marques regardées, pas pour les copier mais pour situer le niveau.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SheetMaMarque } from '@/components/ma-marque/SheetMaMarque'
import type { Benchmark } from '@/types/ma-marque'
import type { BlocId } from '@/lib/ma-marque/completude'

type Props = {
  initialValue: Benchmark[]
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
}

const INTRO =
  "Trois marques que tu regardes. Pas pour les copier — pour situer ton niveau d'exigence."

const MAX_ITEMS = 3
const RAISON_MAX = 200

function nouvelId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function SheetBenchmarks({ initialValue, onClose, onAllerVers }: Props) {
  const [items, setItems] = useState<Benchmark[]>(initialValue ?? [])
  const persistRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (persistRef.current) clearTimeout(persistRef.current)
    }
  }, [])

  const persister = useCallback((next: Benchmark[]) => {
    if (persistRef.current) clearTimeout(persistRef.current)
    persistRef.current = setTimeout(() => {
      void fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'benchmarks', value: next }),
      }).catch((err) => {
        console.warn('[benchmarks] persistance échouée:', err)
      })
    }, 500)
  }, [])

  function update(id: string, patch: Partial<Omit<Benchmark, 'id'>>) {
    setItems((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
      const tousValides = next.every((b) => b.nom.trim().length > 0)
      if (tousValides) persister(next)
      return next
    })
  }

  function ajouter() {
    if (items.length >= MAX_ITEMS) return
    setItems((prev) => [...prev, { id: nouvelId(), nom: '', raison: '' }])
  }

  function supprimer(id: string) {
    setItems((prev) => {
      const next = prev.filter((b) => b.id !== id)
      persister(next)
      return next
    })
  }

  return (
    <SheetMaMarque
      layout="split"
      title="Benchmarks revendiqués"
      bloc="benchmarks"
      intro={INTRO}
      onClose={onClose}
      {...(onAllerVers ? { onAllerVers } : {})}
      context={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            {items.map((b, i) => (
              <li
                key={b.id}
                className="glass-thin"
                style={{
                  borderRadius: 16,
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--color-tertiary-label)',
                    }}
                  >
                    Marque {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => supprimer(b.id)}
                    aria-label={`Retirer la marque ${i + 1}`}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: 'var(--color-tertiary-label)',
                    }}
                  >
                    Retirer
                  </button>
                </div>
                <input
                  type="text"
                  value={b.nom}
                  onChange={(e) => update(b.id, { nom: e.target.value })}
                  placeholder="Nom de la marque"
                  maxLength={80}
                  aria-label={`Nom de la marque ${i + 1}`}
                  style={{
                    padding: '6px 0',
                    border: 'none',
                    background: 'transparent',
                    fontFamily: 'var(--font-system)',
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--color-label)',
                    outline: 'none',
                    letterSpacing: '-0.005em',
                  }}
                />
                <textarea
                  value={b.raison}
                  onChange={(e) => update(b.id, { raison: e.target.value.slice(0, RAISON_MAX) })}
                  placeholder="Pourquoi tu la regardes"
                  rows={2}
                  maxLength={RAISON_MAX}
                  aria-label={`Raison ${i + 1}`}
                  style={{
                    padding: '6px 0',
                    border: 'none',
                    background: 'transparent',
                    fontFamily: 'var(--font-system)',
                    fontSize: 14,
                    lineHeight: 1.4,
                    color: 'var(--color-secondary-label)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </li>
            ))}
          </ul>

          {items.length < MAX_ITEMS ? (
            <button
              type="button"
              onClick={ajouter}
              className="glass-thin"
              style={{
                padding: '10px 18px',
                borderRadius: 22,
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-label)',
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                fontWeight: 500,
                alignSelf: 'flex-start',
              }}
            >
              Ajouter une marque
            </button>
          ) : null}
        </div>
      }
      preview={
        <article
          className="glass-regular"
          style={{
            borderRadius: 24,
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-tertiary-label)',
              margin: 0,
            }}
          >
            Niveau d&apos;exigence
          </h3>
          {items.length === 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 15,
                lineHeight: 1.5,
                color: 'var(--color-secondary-label)',
                margin: 0,
              }}
            >
              Ajoute 3 marques qui t&apos;inspirent. Creative Fair s&apos;en servira pour
              repérer les bons signaux culturels pour toi.
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              {items.map((b) => (
                <li key={b.id}>
                  <div
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 17,
                      fontWeight: 600,
                      color: 'var(--color-label)',
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {b.nom.trim().length > 0 ? b.nom : '—'}
                  </div>
                  {b.raison.trim().length > 0 ? (
                    <div
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 14,
                        lineHeight: 1.45,
                        color: 'var(--color-secondary-label)',
                        marginTop: 4,
                      }}
                    >
                      {b.raison}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </article>
      }
    />
  )
}
