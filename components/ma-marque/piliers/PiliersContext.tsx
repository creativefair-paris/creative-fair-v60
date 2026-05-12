// Sprint 36.B.2 — Panneau gauche (40%) du Split Brief Piliers narratifs.
// 3 cartes éditables (nom / description / ratio) + bouton "Régénérer les 3 piliers"
// avec confirmation par Sheet (pas de window.confirm).

'use client'

import { useState } from 'react'
import { Sheet } from '@/components/layout/Sheet'
import type { PilierEditable } from '@/types/ma-marque'

type Props = {
  piliers: PilierEditable[]
  onUpdate: (id: string, patch: Partial<Omit<PilierEditable, 'id'>>) => void
  onRegenerer: () => Promise<void>
  regenerationEnCours: boolean
  erreurRegeneration: string | null
  // Sprint 36.B.3 — palette injectée par le wrapper (brand_book ou pastels).
  couleurs?: readonly string[]
  // Sprint 36.C — clic sur "Affiner" ouvre la sub-sheet d'édition individuelle.
  onAffiner?: (id: string) => void
}

const PILIER_COULEURS_DEFAUT = ['#007AFF', '#AF52DE', '#FF9500'] as const

export function PiliersContext({
  piliers,
  onUpdate,
  onRegenerer,
  regenerationEnCours,
  erreurRegeneration,
  couleurs = PILIER_COULEURS_DEFAUT,
  onAffiner,
}: Props) {
  const palette = couleurs.length >= 1 ? couleurs : PILIER_COULEURS_DEFAUT
  const [confirmationOuverte, setConfirmationOuverte] = useState(false)

  async function confirmer() {
    setConfirmationOuverte(false)
    await onRegenerer()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <section
        aria-labelledby="pil-edit-title"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
      >
        <h4
          id="pil-edit-title"
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
          Ajuste chaque pilier
        </h4>

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
          {piliers.map((p, i) => (
            <li
              key={p.id}
              className="glass-thin"
              style={{
                borderRadius: 16,
                padding: 'var(--space-4)',
                borderLeft: `4px solid ${palette[i] ?? palette[0]}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <input
                type="text"
                value={p.nom}
                onChange={(e) => onUpdate(p.id, { nom: e.target.value })}
                placeholder="Nom du pilier"
                maxLength={60}
                aria-label={`Nom du pilier ${i + 1}`}
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
                value={p.description}
                onChange={(e) => onUpdate(p.id, { description: e.target.value })}
                placeholder="Ce que ce pilier raconte"
                rows={2}
                maxLength={200}
                aria-label={`Description du pilier ${i + 1}`}
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <label
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 12,
                    color: 'var(--color-tertiary-label)',
                    flexShrink: 0,
                  }}
                  htmlFor={`ratio-${p.id}`}
                >
                  Poids
                </label>
                <input
                  id={`ratio-${p.id}`}
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={p.ratio_suggere}
                  onChange={(e) =>
                    onUpdate(p.id, {
                      ratio_suggere: Number.parseFloat(e.target.value),
                    })
                  }
                  style={{ flex: 1 }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--color-secondary-label)',
                    minWidth: 40,
                    textAlign: 'right',
                  }}
                >
                  {Math.round(p.ratio_suggere * 100)}%
                </span>
              </div>
              {/* Sprint 36.C — Lien "Affiner" pour ouvrir la sub-sheet d'édition. */}
              {onAffiner ? (
                <button
                  type="button"
                  onClick={() => onAffiner(p.id)}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 4,
                    padding: '4px 0',
                    border: 'none',
                    background: 'transparent',
                    color: 'rgba(0,0,0,0.55)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(0,0,0,0.25)',
                    textUnderlineOffset: 3,
                  }}
                  aria-label={`Affiner le pilier ${p.nom || i + 1}`}
                >
                  Affiner ce pilier
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="pil-regen-title"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
      >
        <h4
          id="pil-regen-title"
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
          Repartir de zéro
        </h4>
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            lineHeight: 1.4,
            color: 'var(--color-secondary-label)',
            margin: 0,
          }}
        >
          Si tes piliers ne te ressemblent plus, on peut en redéfinir trois nouveaux à partir de ta marque actuelle.
        </p>
        <button
          type="button"
          onClick={() => setConfirmationOuverte(true)}
          disabled={regenerationEnCours}
          style={{
            alignSelf: 'flex-start',
            padding: '10px 18px',
            borderRadius: 22,
            border: '1px solid var(--color-label)',
            background: 'transparent',
            color: 'var(--color-label)',
            cursor: regenerationEnCours ? 'wait' : 'pointer',
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            fontWeight: 600,
            opacity: regenerationEnCours ? 0.5 : 1,
          }}
        >
          {regenerationEnCours ? 'Régénération…' : 'Régénérer les 3 piliers'}
        </button>
        {erreurRegeneration ? (
          <p
            role="alert"
            style={{
              margin: 0,
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              color: '#D70015',
            }}
          >
            {erreurRegeneration}
          </p>
        ) : null}
      </section>

      <Sheet
        open={confirmationOuverte}
        title="Régénérer les 3 piliers ?"
        onDismiss={() => setConfirmationOuverte(false)}
      >
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 15,
            lineHeight: 1.45,
            color: 'var(--color-secondary-label)',
            margin: '0 0 var(--space-4)',
          }}
        >
          Tes 3 piliers actuels seront remplacés par 3 nouveaux, calculés à partir de ta marque telle qu&apos;elle est aujourd&apos;hui. Tu pourras toujours les éditer ensuite.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setConfirmationOuverte(false)}
            style={{
              padding: '10px 18px',
              borderRadius: 22,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-secondary-label)',
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
            onClick={() => void confirmer()}
            style={{
              padding: '10px 18px',
              borderRadius: 22,
              border: 'none',
              background: 'var(--color-label)',
              color: 'var(--color-background)',
              cursor: 'pointer',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Régénérer
          </button>
        </div>
      </Sheet>
    </div>
  )
}
