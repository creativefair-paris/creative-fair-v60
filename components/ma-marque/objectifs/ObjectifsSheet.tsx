// Sprint 36.B.3 — Sheet "Cap de saison" (Objectifs) wrappée dans SheetMaMarque.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SheetMaMarque } from '@/components/ma-marque/SheetMaMarque'
import { ObjectifsContext } from './ObjectifsContext'
import { ObjectifsPreview } from './ObjectifsPreview'
import type { Objectif, PropositionObjectif } from '@/types/ma-marque'
import type { BlocId } from '@/lib/ma-marque/completude'

type Props = {
  initialObjectifs: Objectif[]
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
}

const INTRO =
  "Fixe le cap de cette saison. L'ordre dans lequel tu les places détermine ce qui passe en premier."

const PROPOSITIONS_FALLBACK: PropositionObjectif[] = [
  { label: 'Faire connaître mon savoir-faire', priorite_suggeree: 1 },
  { label: 'Fidéliser ma communauté actuelle', priorite_suggeree: 2 },
  { label: 'Tester un nouveau format de contenu', priorite_suggeree: 3 },
]

const MAX_OBJECTIFS = 12

function nouvelId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `o_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function ObjectifsSheet({ initialObjectifs, onClose, onAllerVers }: Props) {
  const [objectifs, setObjectifs] = useState<Objectif[]>(initialObjectifs ?? [])
  const [propositions, setPropositions] =
    useState<PropositionObjectif[]>(PROPOSITIONS_FALLBACK)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
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
        // silent swap
      }
    })()
    return () => ctrl.abort()
  }, [])

  const persister = useCallback((next: Objectif[]) => {
    void fetch('/api/brand/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: 'objectifs', value: next }),
    }).catch((err) => console.warn('[objectifs] persistance échouée:', err))
  }, [])

  function handleAdd(o: Omit<Objectif, 'id'>) {
    setObjectifs((prev) => {
      if (prev.length >= MAX_OBJECTIFS) return prev
      const next = [...prev, { id: nouvelId(), ...o }]
      persister(next)
      return next
    })
  }

  function handleRemove(id: string) {
    setObjectifs((prev) => {
      const next = prev.filter((o) => o.id !== id)
      persister(next)
      return next
    })
  }

  function handleMove(id: string, direction: 'up' | 'down') {
    setObjectifs((prev) => {
      const i = prev.findIndex((o) => o.id === id)
      if (i < 0) return prev
      const j = direction === 'up' ? i - 1 : i + 1
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(i, 1)
      next.splice(j, 0, moved!)
      persister(next)
      return next
    })
  }

  return (
    <SheetMaMarque
      layout="split"
      title="Cap de saison"
      bloc="cap-saison"
      intro={INTRO}
      onClose={onClose}
      {...(onAllerVers ? { onAllerVers } : {})}
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
    />
  )
}
