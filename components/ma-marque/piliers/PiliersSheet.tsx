// Sprint 36.B.3 — Sheet "Piliers narratifs" wrappée dans SheetMaMarque.
//
// Patches Sprint 36.B.3 :
//   - Palette par défaut héritée du brand_book.palette (3 premières couleurs),
//     sinon pastels PASTELS_DEFAUT (Sable / Brume / Ardoise).
//   - Preview dédoublonnée : pas de description répétée à droite.

'use client'

import { useCallback, useRef, useState } from 'react'
import { SheetMaMarque } from '@/components/ma-marque/SheetMaMarque'
import { PiliersBanner } from './PiliersBanner'
import { PiliersContext } from './PiliersContext'
import { PiliersPreview } from './PiliersPreview'
import { SubSheetPilier } from './SubSheetPilier'
import { PASTELS_DEFAUT, type BrandBook, type PilierEditable } from '@/types/ma-marque'
import type { PilierNarratif } from '@/types/programme'
import type { BlocId } from '@/lib/ma-marque/completude'

type Props = {
  initialPiliers: PilierNarratif[]
  brandBook: BrandBook | null
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
}

const INTRO =
  'Tes 3 piliers narratifs. Ajuste-les si besoin, ou repars de zéro — Creative Fair les recalcule à partir de ta marque actuelle.'

function nouvelId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function avecIds(piliers: PilierNarratif[]): PilierEditable[] {
  return piliers.map((p) => {
    const editable: PilierEditable = {
      id: nouvelId(),
      nom: p.nom,
      description: p.description,
      ratio_suggere: p.ratio_suggere,
    }
    if (p.mots_cles && p.mots_cles.length > 0) editable.mots_cles = [...p.mots_cles]
    if (p.couleur) editable.couleur = p.couleur
    return editable
  })
}

function sansIds(piliers: PilierEditable[]): PilierNarratif[] {
  return piliers.map((p) => {
    const out: PilierNarratif = {
      nom: p.nom,
      description: p.description,
      ratio_suggere: p.ratio_suggere,
    }
    if (p.mots_cles && p.mots_cles.length > 0) out.mots_cles = [...p.mots_cles]
    if (p.couleur) out.couleur = p.couleur
    return out
  })
}

// Sprint 36.B.3 — palette héritée du brand_book ou pastels par défaut.
function paletteHeritee(brandBook: BrandBook | null): string[] {
  if (brandBook && brandBook.palette.length >= 3) {
    return brandBook.palette.slice(0, 3).map((c) => c.hex)
  }
  return PASTELS_DEFAUT.map((c) => c.hex)
}

export function PiliersSheet({ initialPiliers, brandBook, onClose, onAllerVers }: Props) {
  const [piliers, setPiliers] = useState<PilierEditable[]>(avecIds(initialPiliers))
  const [regenerationEnCours, setRegenerationEnCours] = useState(false)
  const [erreurRegeneration, setErreurRegeneration] = useState<string | null>(null)
  // Sprint 36.C — id du pilier ouvert dans la sub-sheet d'affinage (null = aucune).
  const [pilierAffineId, setPilierAffineId] = useState<string | null>(null)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const couleurs = paletteHeritee(brandBook)

  const persister = useCallback((next: PilierEditable[]) => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      const payload = sansIds(next)
      void fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'piliers_narratifs', value: payload }),
      }).catch((err) => console.warn('[piliers] persistance échouée:', err))
    }, 500)
  }, [])

  const handleUpdate = useCallback(
    (id: string, patch: Partial<Omit<PilierEditable, 'id'>>) => {
      setPiliers((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
        const valide = next.length === 3 && next.every((p) => p.nom.trim().length > 0)
        if (valide) persister(next)
        return next
      })
    },
    [persister],
  )

  const handleRegenerer = useCallback(async () => {
    if (regenerationEnCours) return
    setRegenerationEnCours(true)
    setErreurRegeneration(null)
    try {
      const res = await fetch('/api/ma-marque/regenerer-piliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const detail = (data as { detail?: string }).detail ?? 'Régénération indisponible.'
        setErreurRegeneration(detail)
        return
      }
      const data = (await res.json()) as { piliers?: PilierNarratif[] }
      if (!Array.isArray(data.piliers) || data.piliers.length !== 3) {
        setErreurRegeneration('Réponse inattendue. Réessaie dans un instant.')
        return
      }
      setPiliers(avecIds(data.piliers))
    } catch (err) {
      console.warn('[piliers] régénération échouée:', err)
      setErreurRegeneration('Connexion impossible. Réessaie dans un instant.')
    } finally {
      setRegenerationEnCours(false)
    }
  }, [regenerationEnCours])

  // Sprint 36.C — Gestion sub-sheet d'affinage individuel.
  const handleAffiner = useCallback((id: string) => {
    setPilierAffineId(id)
  }, [])

  const handleSubSheetSave = useCallback(
    (updated: PilierEditable) => {
      setPiliers((prev) => {
        const next = prev.map((p) => (p.id === updated.id ? { ...updated } : p))
        const valide = next.length === 3 && next.every((q) => q.nom.trim().length > 0)
        if (valide) persister(next)
        return next
      })
    },
    [persister],
  )

  const pilierAffine = pilierAffineId
    ? piliers.find((p) => p.id === pilierAffineId) ?? null
    : null
  const pilierAffineIndex = pilierAffine
    ? piliers.findIndex((p) => p.id === pilierAffine.id)
    : -1
  const couleurAffine =
    pilierAffineIndex >= 0
      ? (couleurs[pilierAffineIndex] ?? couleurs[0] ?? '#007AFF')
      : '#007AFF'

  return (
    <>
      <SheetMaMarque
        layout="split"
        title="Piliers narratifs"
        bloc="piliers"
        intro={INTRO}
        onClose={onClose}
        {...(onAllerVers ? { onAllerVers } : {})}
        context={
          <>
            <PiliersBanner />
            <PiliersContext
              piliers={piliers}
              onUpdate={handleUpdate}
              onRegenerer={handleRegenerer}
              regenerationEnCours={regenerationEnCours}
              erreurRegeneration={erreurRegeneration}
              couleurs={couleurs}
              onAffiner={handleAffiner}
            />
          </>
        }
        preview={<PiliersPreview piliers={piliers} couleurs={couleurs} />}
      />
      {pilierAffine ? (
        <SubSheetPilier
          pilier={pilierAffine}
          couleur={couleurAffine}
          onSave={handleSubSheetSave}
          onClose={() => setPilierAffineId(null)}
        />
      ) : null}
    </>
  )
}
