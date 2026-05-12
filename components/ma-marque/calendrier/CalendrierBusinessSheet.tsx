// Sprint 36.B.3 — Sheet "Calendrier business" wrappée dans SheetMaMarque.
// Logique de propositions IA + state + persistance, sans tile (la tile est MarqueRow).

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SheetMaMarque } from '@/components/ma-marque/SheetMaMarque'
import { CalendrierContext } from './CalendrierContext'
import { CalendrierPreview } from './CalendrierPreview'
import type { MomentBusiness, PropositionCalendrier } from '@/types/ma-marque'
import type { PilierNarratif } from '@/types/programme'
import type { BlocId } from '@/lib/ma-marque/completude'

type Props = {
  initialMoments: MomentBusiness[]
  piliers: PilierNarratif[]
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
}

const INTRO =
  'Mets sur la carte les rendez-vous qui rythment ton année — un lancement, une saison forte, une opération à laquelle tu tiens. Ce sont eux qui guideront ton programme.'

const PROPOSITIONS_FALLBACK: PropositionCalendrier[] = [
  { titre: 'Temps fort de saison', type: 'saison' },
  { titre: 'Lancement à venir', type: 'lancement' },
  { titre: 'Opération phare', type: 'operation' },
]

function nouvelId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function CalendrierBusinessSheet({
  initialMoments,
  piliers,
  onClose,
  onAllerVers,
}: Props) {
  const [moments, setMoments] = useState<MomentBusiness[]>(initialMoments ?? [])
  const [propositions, setPropositions] =
    useState<PropositionCalendrier[]>(PROPOSITIONS_FALLBACK)
  const fetchedRef = useRef(false)

  // Fetch propositions sur-mesure (silent swap Q2)
  useEffect(() => {
    if (fetchedRef.current) return
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
        // silent swap
      }
    })()
    return () => ctrl.abort()
  }, [])

  const persister = useCallback((next: MomentBusiness[]) => {
    void fetch('/api/brand/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: 'calendrier_business', value: next }),
    }).catch((err) => console.warn('[calendrier] persistance échouée:', err))
  }, [])

  const handleAdd = useCallback(
    (m: Omit<MomentBusiness, 'id'>) => {
      setMoments((prev) => {
        const next = [...prev, { id: nouvelId(), ...m }]
        persister(next)
        return next
      })
    },
    [persister],
  )

  const handleRemove = useCallback(
    (id: string) => {
      setMoments((prev) => {
        const next = prev.filter((m) => m.id !== id)
        persister(next)
        return next
      })
    },
    [persister],
  )

  return (
    <SheetMaMarque
      layout="split"
      title="Calendrier business"
      bloc="calendrier-business"
      intro={INTRO}
      onClose={onClose}
      {...(onAllerVers ? { onAllerVers } : {})}
      context={
        <CalendrierContext
          moments={moments}
          propositions={propositions}
          piliers={piliers}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      }
      preview={<CalendrierPreview moments={moments} />}
    />
  )
}
