// Sprint 36.C — Sub-sheet d'édition individuelle d'un pilier.
//
// S'ouvre par-dessus la sheet "Piliers narratifs" (z-index supérieur).
// Layout : single-column compact (le 40/60 split brief est gardé pour la
// sheet parente, ici on reste lisible et focalisé sur un seul pilier).
//
// Édition : nom, description, mots-clés (chips), part du programme (slider).
// Côté droit : propositions de 3 posts qui pourraient incarner le pilier,
// régénérables via /api/brand/pilier-propositions (Claude Opus cascade).
//
// Persistance : on émet onSave(updatedPilier) — le parent PiliersSheet met
// à jour sa state piliers + appelle son own persister (PATCH /api/brand/update).

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PilierEditable } from '@/types/ma-marque'

type Proposition = {
  titre_court: string
  teaser: string
  type_contenu: 'photo' | 'carrousel' | 'reel' | 'video'
}

type Props = {
  pilier: PilierEditable
  couleur: string
  onSave: (updated: PilierEditable) => void
  onClose: () => void
}

export function SubSheetPilier({ pilier, couleur, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<PilierEditable>(() => ({
    ...pilier,
    mots_cles: pilier.mots_cles ?? [],
  }))
  const [motCleInput, setMotCleInput] = useState('')
  const [propositions, setPropositions] = useState<Proposition[]>([])
  const [loadingPropositions, setLoadingPropositions] = useState(false)
  const [erreurPropositions, setErreurPropositions] = useState<string | null>(null)

  const cardRef = useRef<HTMLDivElement | null>(null)

  // Échap pour fermer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Focus initial.
  useEffect(() => {
    cardRef.current?.querySelector<HTMLInputElement>('input[name="pilier-nom"]')?.focus()
  }, [])

  const handleMotsClesEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        const value = motCleInput.trim()
        if (value.length === 0) return
        const current = draft.mots_cles ?? []
        if (current.includes(value) || current.length >= 5) {
          setMotCleInput('')
          return
        }
        setDraft({ ...draft, mots_cles: [...current, value.slice(0, 30)] })
        setMotCleInput('')
      }
    },
    [draft, motCleInput],
  )

  const removeMotCle = useCallback(
    (m: string) => {
      setDraft({
        ...draft,
        mots_cles: (draft.mots_cles ?? []).filter((x) => x !== m),
      })
    },
    [draft],
  )

  const regenererPropositions = useCallback(async () => {
    if (loadingPropositions) return
    if (draft.nom.trim().length === 0) {
      setErreurPropositions('Donne un nom au pilier avant de générer.')
      return
    }
    setLoadingPropositions(true)
    setErreurPropositions(null)
    try {
      const res = await fetch('/api/brand/pilier-propositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilier: {
            nom: draft.nom,
            description: draft.description,
            mots_cles: draft.mots_cles ?? [],
          },
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { detail?: string }
        setErreurPropositions(data.detail ?? 'Génération indisponible.')
        return
      }
      const data = (await res.json()) as { propositions?: Proposition[] }
      if (!Array.isArray(data.propositions) || data.propositions.length !== 3) {
        setErreurPropositions('Réponse inattendue. Réessaie dans un instant.')
        return
      }
      setPropositions(data.propositions)
    } catch (err) {
      console.warn('[pilier-propositions] échec:', err)
      setErreurPropositions('Connexion impossible. Réessaie dans un instant.')
    } finally {
      setLoadingPropositions(false)
    }
  }, [draft, loadingPropositions])

  const handleSave = useCallback(() => {
    const updated: PilierEditable = {
      ...draft,
      nom: draft.nom.trim().slice(0, 60),
      description: draft.description.trim().slice(0, 200),
    }
    if ((updated.mots_cles?.length ?? 0) === 0) {
      delete updated.mots_cles
    }
    onSave(updated)
    onClose()
  }, [draft, onSave, onClose])

  const canSave =
    draft.nom.trim().length > 0 && draft.description.trim().length > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pilier-edit-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.42)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        ref={cardRef}
        className="glass-regular"
        style={{
          width: '100%',
          maxWidth: 720,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          borderRadius: 20,
          padding: 32,
          background: 'rgba(255,255,255,0.97)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <nav
            aria-label="Fil d'Ariane"
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              fontWeight: 400,
              letterSpacing: '0.01em',
              color: 'rgba(0,0,0,0.4)',
              marginBottom: 4,
            }}
          >
            Ma Marque <span style={{ margin: '0 6px' }}>›</span> Piliers narratifs{' '}
            <span style={{ margin: '0 6px' }}>›</span>
            <span style={{ color: 'rgba(0,0,0,0.55)' }}>{pilier.nom || 'Pilier'}</span>
          </nav>
          <h2
            id="pilier-edit-title"
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#1C1C1E',
              margin: 0,
            }}
          >
            Affine ce pilier
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              lineHeight: 1.5,
              color: 'rgba(0,0,0,0.55)',
              margin: 0,
              marginTop: 4,
            }}
          >
            Le pilier porte un regard. Précise-le pour que Creative Fair puisse l’incarner.
          </p>
        </div>

        {/* Form */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            borderLeft: `4px solid ${couleur}`,
            paddingLeft: 16,
          }}
        >
          {/* Nom */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'rgba(0,0,0,0.55)',
              }}
            >
              Nom du pilier
            </span>
            <input
              name="pilier-nom"
              type="text"
              value={draft.nom}
              onChange={(e) => setDraft({ ...draft, nom: e.target.value })}
              maxLength={60}
              placeholder="Nom du pilier"
              style={{
                padding: '10px 12px',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.6)',
                fontFamily: 'var(--font-system)',
                fontSize: 16,
                fontWeight: 500,
                color: '#1C1C1E',
                outline: 'none',
              }}
            />
          </label>

          {/* Description */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'rgba(0,0,0,0.55)',
              }}
            >
              Description
            </span>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              maxLength={200}
              rows={4}
              placeholder="Ce que ce pilier raconte, le regard qu’il porte"
              style={{
                padding: '10px 12px',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.6)',
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                lineHeight: 1.5,
                color: '#1C1C1E',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </label>

          {/* Mots-clés */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'rgba(0,0,0,0.55)',
              }}
            >
              Mots-clés
              <span
                style={{
                  fontWeight: 400,
                  marginLeft: 8,
                  textTransform: 'none',
                  letterSpacing: 'normal',
                  color: 'rgba(0,0,0,0.4)',
                }}
              >
                Max 5. Entrée ou virgule pour ajouter.
              </span>
            </span>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                padding: 8,
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.6)',
                minHeight: 44,
                alignItems: 'center',
              }}
            >
              {(draft.mots_cles ?? []).map((m) => (
                <span
                  key={m}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 14,
                    background: 'rgba(0,0,0,0.06)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#1C1C1E',
                  }}
                >
                  {m}
                  <button
                    type="button"
                    onClick={() => removeMotCle(m)}
                    aria-label={`Retirer ${m}`}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'rgba(0,0,0,0.5)',
                      cursor: 'pointer',
                      fontSize: 16,
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              {(draft.mots_cles?.length ?? 0) < 5 ? (
                <input
                  type="text"
                  value={motCleInput}
                  onChange={(e) => setMotCleInput(e.target.value)}
                  onKeyDown={handleMotsClesEnter}
                  placeholder="Ajouter un mot-clé"
                  maxLength={30}
                  style={{
                    flex: 1,
                    minWidth: 100,
                    border: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    color: '#1C1C1E',
                    outline: 'none',
                  }}
                />
              ) : null}
            </div>
          </div>

          {/* Ratio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'rgba(0,0,0,0.55)',
              }}
            >
              Part du programme
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={draft.ratio_suggere}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    ratio_suggere: Number.parseFloat(e.target.value),
                  })
                }
                style={{ flex: 1 }}
              />
              <span
                style={{
                  minWidth: 48,
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1C1C1E',
                  fontVariantNumeric: 'tabular-nums',
                  textAlign: 'right',
                }}
              >
                {Math.round(draft.ratio_suggere * 100)} %
              </span>
            </div>
          </div>
        </div>

        {/* Propositions de posts */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            borderTop: '1px solid rgba(0,0,0,0.08)',
            paddingTop: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 16,
                fontWeight: 600,
                color: '#1C1C1E',
                margin: 0,
              }}
            >
              Exemples de posts qui pourraient venir
            </h3>
            <button
              type="button"
              onClick={() => void regenererPropositions()}
              disabled={loadingPropositions}
              style={{
                padding: '8px 14px',
                borderRadius: 18,
                border: '1px solid rgba(0,0,0,0.15)',
                background: loadingPropositions ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.7)',
                color: '#1C1C1E',
                cursor: loadingPropositions ? 'wait' : 'pointer',
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                fontWeight: 500,
                opacity: loadingPropositions ? 0.6 : 1,
              }}
            >
              {loadingPropositions ? 'Creative Fair réfléchit…' : 'Régénérer'}
            </button>
          </div>

          {propositions.length === 0 && !loadingPropositions && !erreurPropositions ? (
            <p
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                lineHeight: 1.5,
                color: 'rgba(0,0,0,0.55)',
                margin: 0,
              }}
            >
              Génère des propositions pour visualiser ce pilier en action.
            </p>
          ) : null}

          {erreurPropositions ? (
            <p
              role="alert"
              style={{
                margin: 0,
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                color: '#D70015',
              }}
            >
              {erreurPropositions}
            </p>
          ) : null}

          {propositions.length > 0 ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {propositions.map((p, i) => (
                <li
                  key={`${i}-${p.titre_court}`}
                  className="glass-thin"
                  style={{
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'rgba(0,0,0,0.45)',
                    }}
                  >
                    {p.type_contenu}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#1C1C1E',
                    }}
                  >
                    {p.titre_court}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: 'rgba(0,0,0,0.6)',
                    }}
                  >
                    {p.teaser}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: 22,
              border: 'none',
              background: 'transparent',
              color: 'rgba(0,0,0,0.55)',
              cursor: 'pointer',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            style={{
              padding: '10px 20px',
              borderRadius: 22,
              border: 'none',
              background: canSave ? '#1C1C1E' : 'rgba(0,0,0,0.2)',
              color: '#FFFFFF',
              cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
