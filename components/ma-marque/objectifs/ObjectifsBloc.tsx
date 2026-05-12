// Sprint 36.B.2 — Bloc Objectifs sur la page Ma Marque.
// Tile cliquable → Split Brief plein écran avec reorder ↑↓.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SplitBrief } from '@/components/split-brief/SplitBrief'
import { ObjectifsContext } from './ObjectifsContext'
import { ObjectifsPreview } from './ObjectifsPreview'
import type { Objectif, PropositionObjectif } from '@/types/ma-marque'

type Props = {
  initialObjectifs: Objectif[]
}

const INTRO =
  "Fixe le cap de cette saison. L'ordre dans lequel tu les places détermine ce qui passe en premier."

const PROPOSITIONS_FALLBACK: PropositionObjectif[] = [
  { label: 'Faire connaître mon savoir-faire', priorite_suggeree: 1 },
  { label: 'Fidéliser ma communauté actuelle', priorite_suggeree: 2 },
  { label: 'Tester un nouveau format de contenu', priorite_suggeree: 3 },
]

function nouvelId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `o_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function ObjectifsBloc({ initialObjectifs }: Props) {
  const [objectifs, setObjectifs] = useState<Objectif[]>(initialObjectifs)
  const [open, setOpen] = useState(false)
  const [propositions, setPropositions] =
    useState<PropositionObjectif[]>(PROPOSITIONS_FALLBACK)
  const fetchedRef = useRef(false)
  const savingRef = useRef(false)

  // Fetch propositions sur-mesure au premier open (silent swap)
  useEffect(() => {
    if (!open || fetchedRef.current) return
    fetchedRef.current = true
    const ctrl = new AbortController()
    void (async () => {
      try {
        const res = await fetch('/api/ma-marque/propositions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bloc: 'objectifs' }),
          signal: ctrl.signal,
        })
        if (!res.ok) return
        const data = (await res.json()) as {
          propositions?: PropositionObjectif[]
          error?: string
        }
        if (data.error) return
        if (Array.isArray(data.propositions) && data.propositions.length > 0) {
          setPropositions(data.propositions.slice(0, 3))
        }
      } catch {
        // Silent swap doctrine
      }
    })()
    return () => ctrl.abort()
  }, [open])

  const persister = useCallback(async (next: Objectif[]) => {
    if (savingRef.current) return
    savingRef.current = true
    try {
      await fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'objectifs', value: next }),
      })
    } catch (err) {
      console.warn('[objectifs] persistance échouée:', err)
    } finally {
      savingRef.current = false
    }
  }, [])

  const handleAdd = useCallback(
    (o: Omit<Objectif, 'id'>) => {
      setObjectifs((prev) => {
        const next = [...prev, { ...o, id: nouvelId() }]
        void persister(next)
        return next
      })
    },
    [persister],
  )

  const handleRemove = useCallback(
    (id: string) => {
      setObjectifs((prev) => {
        const next = prev.filter((o) => o.id !== id)
        void persister(next)
        return next
      })
    },
    [persister],
  )

  const handleMove = useCallback(
    (id: string, direction: 'up' | 'down') => {
      setObjectifs((prev) => {
        const idx = prev.findIndex((o) => o.id === id)
        if (idx === -1) return prev
        const target = direction === 'up' ? idx - 1 : idx + 1
        if (target < 0 || target >= prev.length) return prev
        const next = [...prev]
        const [item] = next.splice(idx, 1)
        next.splice(target, 0, item!)
        void persister(next)
        return next
      })
    },
    [persister],
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le cap de saison"
        className="glass-regular"
        style={{
          textAlign: 'left',
          border: 'none',
          cursor: 'pointer',
          padding: 'var(--space-5)',
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          width: '100%',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: '-0.015em',
              color: 'var(--color-label)',
              margin: 0,
            }}
          >
            Cap de saison
          </h2>
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              color: 'var(--color-tertiary-label)',
            }}
          >
            {objectifs.length === 0
              ? 'Aucun cap encore'
              : `${objectifs.length} objectif${objectifs.length === 1 ? '' : 's'}`}
          </span>
        </header>

        {objectifs.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 15,
              lineHeight: 1.4,
              color: 'var(--color-secondary-label)',
              margin: 0,
            }}
          >
            Ce qui compte vraiment cette saison. Trois caps suffisent, le reste suit.
          </p>
        ) : (
          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {objectifs.slice(0, 3).map((o, i) => (
              <li
                key={o.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontFamily: 'var(--font-system)',
                  fontSize: 14,
                  color: 'var(--color-label)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 20,
                    fontSize: 12,
                    color: 'var(--color-tertiary-label)',
                  }}
                >
                  {i + 1}.
                </span>
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {o.label}
                </span>
              </li>
            ))}
            {objectifs.length > 3 ? (
              <li
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  color: 'var(--color-tertiary-label)',
                  marginLeft: 30,
                }}
              >
                +{objectifs.length - 3}
              </li>
            ) : null}
          </ol>
        )}
      </button>

      {open ? (
        <SplitBrief
          intro={INTRO}
          context={
            <ObjectifsContext
              objectifs={objectifs}
              propositions={propositions}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onMove={handleMove}
            />
          }
          preview={<ObjectifsPreview objectifs={objectifs} />}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}
