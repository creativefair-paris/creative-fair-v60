// Sprint 36.B.2 — Bloc Ressources sur la page Ma Marque.
// Tile cliquable → Split Brief pour ajuster capacités de production hebdomadaires.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SplitBrief } from '@/components/split-brief/SplitBrief'
import { RessourcesContext } from './RessourcesContext'
import { RessourcesPreview } from './RessourcesPreview'
import type {
  Ressources,
  CapaciteProduction,
  PropositionRessources,
} from '@/types/ma-marque'
import { RESSOURCES_VIDES, ressourcesEstVide } from '@/types/ma-marque'

type Props = {
  initialRessources: Ressources
}

const INTRO =
  "Dis ce que tu peux produire chaque semaine, à ton rythme. Le programme s'y adapte — pas l'inverse."

const PROPOSITIONS_FALLBACK: PropositionRessources[] = [
  {
    description: 'Production légère : quelques photos par mois, vidéo rare, pas de cadre dédié.',
    hint: { photo: 'occasionnelle', video: 'aucune', terrain: false, studio: false },
  },
  {
    description: 'Production régulière : photos chaque semaine, vidéo de temps en temps, terrain disponible.',
    hint: { photo: 'reguliere', video: 'occasionnelle', terrain: true, studio: false },
  },
  {
    description: 'Production soutenue : photos quotidiennes, vidéos régulières, terrain et studio.',
    hint: { photo: 'soutenue', video: 'reguliere', terrain: true, studio: true },
  },
]

const NIVEAU_LABEL: Record<CapaciteProduction, string> = {
  aucune: 'Aucune',
  occasionnelle: 'Occasionnelle',
  reguliere: 'Régulière',
  soutenue: 'Soutenue',
}

function resume(r: Ressources): string {
  const bits: string[] = []
  if (r.photo !== 'aucune') bits.push(`Photo ${NIVEAU_LABEL[r.photo].toLowerCase()}`)
  if (r.video !== 'aucune') bits.push(`Vidéo ${NIVEAU_LABEL[r.video].toLowerCase()}`)
  if (r.terrain) bits.push('Terrain')
  if (r.studio) bits.push('Studio')
  return bits.join(' · ')
}

export function RessourcesBloc({ initialRessources }: Props) {
  const [ressources, setRessources] = useState<Ressources>(
    initialRessources ?? RESSOURCES_VIDES,
  )
  const [open, setOpen] = useState(false)
  const [propositions, setPropositions] =
    useState<PropositionRessources[]>(PROPOSITIONS_FALLBACK)
  const fetchedRef = useRef(false)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch propositions sur-mesure au premier open
  useEffect(() => {
    if (!open || fetchedRef.current) return
    fetchedRef.current = true
    const ctrl = new AbortController()
    void (async () => {
      try {
        const res = await fetch('/api/ma-marque/propositions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bloc: 'ressources' }),
          signal: ctrl.signal,
        })
        if (!res.ok) return
        const data = (await res.json()) as {
          propositions?: PropositionRessources[]
          error?: string
        }
        if (data.error) return
        if (Array.isArray(data.propositions) && data.propositions.length > 0) {
          setPropositions(data.propositions.slice(0, 3))
        }
      } catch {
        // Silent swap
      }
    })()
    return () => ctrl.abort()
  }, [open])

  // Persistance débouncée (300ms) — utile car les toggles peuvent enchaîner vite.
  const persister = useCallback((next: Ressources) => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      void fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'ressources', value: next }),
      }).catch((err) => {
        console.warn('[ressources] persistance échouée:', err)
      })
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    }
  }, [])

  const handleChange = useCallback(
    (next: Ressources) => {
      setRessources(next)
      persister(next)
    },
    [persister],
  )

  const vide = ressourcesEstVide(ressources)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir tes ressources de production"
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
            Ressources
          </h2>
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              color: 'var(--color-tertiary-label)',
            }}
          >
            {vide ? 'Non renseigné' : 'Renseigné'}
          </span>
        </header>

        {vide ? (
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 15,
              lineHeight: 1.4,
              color: 'var(--color-secondary-label)',
              margin: 0,
            }}
          >
            Ce que tu peux produire chaque semaine — photo, vidéo, terrain, studio.
          </p>
        ) : (
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              lineHeight: 1.4,
              color: 'var(--color-label)',
              margin: 0,
            }}
          >
            {resume(ressources)}
          </p>
        )}
      </button>

      {open ? (
        <SplitBrief
          intro={INTRO}
          context={
            <RessourcesContext
              ressources={ressources}
              propositions={propositions}
              onChange={handleChange}
            />
          }
          preview={<RessourcesPreview ressources={ressources} />}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}
