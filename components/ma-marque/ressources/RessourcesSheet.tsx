// Sprint 36.B.3 — Sheet "Ressources de production" wrappée dans SheetMaMarque.
//
// Patches Sprint 36.B.3 :
//   - Phrase causale sous le hero ("Si tu n'as pas de vidéo, le programme n'en demandera pas").
//   - 3 profils en chips de pré-sélection au-dessus des sliders fins.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SheetMaMarque } from '@/components/ma-marque/SheetMaMarque'
import { RessourcesContext } from './RessourcesContext'
import { RessourcesPreview } from './RessourcesPreview'
import {
  RESSOURCES_VIDES,
  type Ressources,
  type PropositionRessources,
} from '@/types/ma-marque'
import type { BlocId } from '@/lib/ma-marque/completude'

type Props = {
  initialRessources: Ressources | null
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
}

const INTRO =
  "Dis ce que tu peux produire chaque semaine, à ton rythme. Le programme s'y adapte — pas l'inverse."

const CAUSAL =
  "Ces choix conditionnent ce que Creative Fair te proposera. Si tu n'as pas de vidéo, le programme n'en demandera pas."

// Sprint 36.B.3 — 3 profils figés en chips de pré-sélection.
const PROFILS: { id: string; label: string; preset: Ressources }[] = [
  {
    id: 'leger',
    label: 'Léger',
    preset: { photo: 'occasionnelle', video: 'aucune', terrain: false, studio: false },
  },
  {
    id: 'regulier',
    label: 'Régulier',
    preset: { photo: 'reguliere', video: 'occasionnelle', terrain: true, studio: false },
  },
  {
    id: 'soutenu',
    label: 'Soutenu',
    preset: { photo: 'soutenue', video: 'reguliere', terrain: true, studio: true },
  },
]

const FALLBACK_PROPOSITIONS: PropositionRessources[] = PROFILS.map((p) => ({
  description: `Profil ${p.label.toLowerCase()}`,
  hint: p.preset,
}))

function normaliser(r: Ressources): Ressources {
  return {
    photo: r.photo ?? 'aucune',
    video: r.video ?? 'aucune',
    terrain: r.terrain ?? false,
    studio: r.studio ?? false,
  }
}

function memeProfil(r: Ressources, preset: Ressources): boolean {
  return (
    r.photo === preset.photo &&
    r.video === preset.video &&
    r.terrain === preset.terrain &&
    r.studio === preset.studio
  )
}

export function RessourcesSheet({ initialRessources, onClose, onAllerVers }: Props) {
  const [ressources, setRessources] = useState<Ressources>(
    normaliser(initialRessources ?? RESSOURCES_VIDES),
  )
  const persistRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (persistRef.current) clearTimeout(persistRef.current)
    }
  }, [])

  const persister = useCallback((next: Ressources) => {
    if (persistRef.current) clearTimeout(persistRef.current)
    persistRef.current = setTimeout(() => {
      void fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'ressources', value: next }),
      }).catch((err) => console.warn('[ressources] persistance échouée:', err))
    }, 300)
  }, [])

  function handleChange(next: Ressources) {
    setRessources(next)
    persister(next)
  }

  function appliquerProfil(preset: Ressources) {
    handleChange(preset)
  }

  return (
    <SheetMaMarque
      layout="split"
      title="Ressources de production"
      bloc="ressources"
      intro={INTRO}
      onClose={onClose}
      {...(onAllerVers ? { onAllerVers } : {})}
      context={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Patch 2.3.A — phrase causale */}
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--color-secondary-label)',
              margin: 0,
            }}
          >
            {CAUSAL}
          </p>

          {/* Patch 2.3.B — 3 profils chips */}
          <section
            aria-labelledby="ress-profils-title"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
          >
            <h4
              id="ress-profils-title"
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-secondary-label)',
                margin: 0,
              }}
            >
              Pose un profil pour démarrer
            </h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PROFILS.map((p) => {
                const actif = memeProfil(ressources, p.preset)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => appliquerProfil(p.preset)}
                    aria-pressed={actif}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 20,
                      border: 'none',
                      cursor: 'pointer',
                      background: actif ? 'var(--color-label)' : 'rgba(0,0,0,0.04)',
                      color: actif
                        ? 'var(--color-background)'
                        : 'var(--color-secondary-label)',
                      fontFamily: 'var(--font-system)',
                      fontSize: 14,
                      fontWeight: actif ? 600 : 500,
                      transition: 'background 160ms ease, color 160ms ease',
                    }}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Sliders fins — réutilise RessourcesContext (masquage propositions doublonnées) */}
          <RessourcesContext
            ressources={ressources}
            propositions={FALLBACK_PROPOSITIONS}
            onChange={handleChange}
            hidePropositions
          />
        </div>
      }
      preview={<RessourcesPreview ressources={ressources} />}
    />
  )
}
