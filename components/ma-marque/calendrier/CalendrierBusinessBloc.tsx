// Sprint 36.B.2 — Bloc Calendrier business sur la page Ma Marque.
// Tile cliquable → ouvre Split Brief plein écran 40/60.
// État local optimiste, persistance via PATCH /api/brand/update.
// Doctrine swap silencieux (Q2) : propositions génériques affichées immédiatement,
// remplacées en silence si l'IA répond avant que l'utilisateur clique.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SplitBrief } from '@/components/split-brief/SplitBrief'
import { CalendrierContext } from './CalendrierContext'
import { CalendrierPreview, TYPE_COULEURS } from './CalendrierPreview'
import type { MomentBusiness, PropositionCalendrier } from '@/types/ma-marque'

type Props = {
  initialMoments: MomentBusiness[]
}

const INTRO =
  'Mets sur la carte les rendez-vous qui rythment ton année — un lancement, une saison forte, une opération à laquelle tu tiens. Ce sont eux qui guideront ton programme.'

// Propositions affichées immédiatement à l'ouverture du brief.
// Remplacées silencieusement (Q2) si l'API répond à temps.
const PROPOSITIONS_FALLBACK: PropositionCalendrier[] = [
  { titre: 'Temps fort de saison', type: 'saison' },
  { titre: 'Lancement à venir', type: 'lancement' },
  { titre: 'Opération phare', type: 'operation' },
]

function nouvelId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback minimaliste (navigateurs très anciens — improbable mais sûr)
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function CalendrierBusinessBloc({ initialMoments }: Props) {
  const [moments, setMoments] = useState<MomentBusiness[]>(initialMoments)
  const [open, setOpen] = useState(false)
  const [propositions, setPropositions] =
    useState<PropositionCalendrier[]>(PROPOSITIONS_FALLBACK)
  const fetchedRef = useRef(false)
  const savingRef = useRef(false)

  // Fetch propositions au premier open (silent swap si succès)
  useEffect(() => {
    if (!open || fetchedRef.current) return
    fetchedRef.current = true
    const ctrl = new AbortController()
    void (async () => {
      try {
        const res = await fetch('/api/ma-marque/propositions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bloc: 'calendrier' }),
          signal: ctrl.signal,
        })
        if (!res.ok) return
        const data = (await res.json()) as {
          propositions?: PropositionCalendrier[]
          error?: string
        }
        if (data.error) return
        if (Array.isArray(data.propositions) && data.propositions.length > 0) {
          setPropositions(data.propositions.slice(0, 3))
        }
      } catch {
        // Silent swap doctrine — on garde le fallback générique
      }
    })()
    return () => ctrl.abort()
  }, [open])

  const persister = useCallback(async (next: MomentBusiness[]) => {
    if (savingRef.current) return
    savingRef.current = true
    try {
      await fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'calendrier_business', value: next }),
      })
    } catch (err) {
      console.warn('[calendrier] persistance échouée:', err)
    } finally {
      savingRef.current = false
    }
  }, [])

  const handleAdd = useCallback(
    (m: Omit<MomentBusiness, 'id'>) => {
      setMoments((prev) => {
        const next = [...prev, { ...m, id: nouvelId() }]
        void persister(next)
        return next
      })
    },
    [persister],
  )

  const handleRemove = useCallback(
    (id: string) => {
      setMoments((prev) => {
        const next = prev.filter((m) => m.id !== id)
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
        aria-label="Ouvrir le calendrier business"
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
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
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
            Calendrier business
          </h2>
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              color: 'var(--color-tertiary-label)',
            }}
          >
            {moments.length === 0
              ? 'Aucun moment encore'
              : `${moments.length} moment${moments.length === 1 ? '' : 's'}`}
          </span>
        </header>

        {moments.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 15,
              lineHeight: 1.4,
              color: 'var(--color-secondary-label)',
              margin: 0,
            }}
          >
            Les rendez-vous qui rythment ton année — lancements, événements, opérations, saisons.
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {moments.slice(0, 5).map((m) => (
              <li
                key={m.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.6)',
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  color: 'var(--color-label)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: TYPE_COULEURS[m.type],
                  }}
                />
                {m.titre}
              </li>
            ))}
            {moments.length > 5 ? (
              <li
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  color: 'var(--color-tertiary-label)',
                  alignSelf: 'center',
                }}
              >
                +{moments.length - 5}
              </li>
            ) : null}
          </ul>
        )}
      </button>

      {open ? (
        <SplitBrief
          intro={INTRO}
          context={
            <CalendrierContext
              moments={moments}
              propositions={propositions}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
          }
          preview={<CalendrierPreview moments={moments} />}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}
