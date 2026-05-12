// Sprint 36.B.2 — Bloc Piliers narratifs sur la page Ma Marque.
// Tile cliquable → Split Brief : édition manuelle + régénération via Claude Opus.

'use client'

import { useCallback, useRef, useState } from 'react'
import { SplitBrief } from '@/components/split-brief/SplitBrief'
import { PiliersContext } from './PiliersContext'
import { PiliersPreview } from './PiliersPreview'
import type { PilierEditable } from '@/types/ma-marque'
import type { PilierNarratif } from '@/types/programme'

type Props = {
  initialPiliers: PilierNarratif[]
}

const INTRO =
  'Tes 3 piliers narratifs. Ajuste-les si besoin, ou repars de zéro — Creative Fair les recalcule à partir de ta marque actuelle.'

const PILIER_COULEURS = ['#007AFF', '#AF52DE', '#FF9500'] as const

function nouvelId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function avecIds(piliers: PilierNarratif[]): PilierEditable[] {
  return piliers.map((p) => ({
    id: nouvelId(),
    nom: p.nom,
    description: p.description,
    ratio_suggere: p.ratio_suggere,
  }))
}

function sansIds(piliers: PilierEditable[]): PilierNarratif[] {
  return piliers.map((p) => ({
    nom: p.nom,
    description: p.description,
    ratio_suggere: p.ratio_suggere,
  }))
}

export function PiliersBloc({ initialPiliers }: Props) {
  const [piliers, setPiliers] = useState<PilierEditable[]>(avecIds(initialPiliers))
  const [open, setOpen] = useState(false)
  const [regenerationEnCours, setRegenerationEnCours] = useState(false)
  const [erreurRegeneration, setErreurRegeneration] = useState<string | null>(null)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Persistance débouncée — chaque keystroke ne déclenche pas un PATCH.
  const persister = useCallback((next: PilierEditable[]) => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      const payload = sansIds(next)
      void fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'piliers_narratifs', value: payload }),
      }).catch((err) => {
        console.warn('[piliers] persistance échouée:', err)
      })
    }, 500)
  }, [])

  const handleUpdate = useCallback(
    (id: string, patch: Partial<Omit<PilierEditable, 'id'>>) => {
      setPiliers((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
        // On ne persiste que si la structure reste valide (les 3 piliers avec nom non vide)
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
      // Pas de PATCH à faire : le serveur a déjà persisté.
    } catch (err) {
      console.warn('[piliers] régénération échouée:', err)
      setErreurRegeneration('Connexion impossible. Réessaie dans un instant.')
    } finally {
      setRegenerationEnCours(false)
    }
  }, [regenerationEnCours])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir tes piliers narratifs"
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
            Piliers narratifs
          </h2>
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              color: 'var(--color-tertiary-label)',
            }}
          >
            {piliers.length === 0 ? 'Non définis' : '3 piliers'}
          </span>
        </header>

        {piliers.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 15,
              lineHeight: 1.4,
              color: 'var(--color-secondary-label)',
              margin: 0,
            }}
          >
            Les 3 angles signature de ta marque. Définis automatiquement à l&apos;analyse.
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
            {piliers.map((p, i) => (
              <li
                key={p.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
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
                    background: PILIER_COULEURS[i] ?? PILIER_COULEURS[0],
                  }}
                />
                {p.nom}
              </li>
            ))}
          </ul>
        )}
      </button>

      {open ? (
        <SplitBrief
          intro={INTRO}
          context={
            <PiliersContext
              piliers={piliers}
              onUpdate={handleUpdate}
              onRegenerer={handleRegenerer}
              regenerationEnCours={regenerationEnCours}
              erreurRegeneration={erreurRegeneration}
            />
          }
          preview={<PiliersPreview piliers={piliers} />}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}
