// Sprint 36.B.2 — Panneau gauche (40%) du Split Brief Objectifs.
// 3 propositions sur-mesure + formulaire d'ajout + liste réordonnable (↑↓).

'use client'

import { useState } from 'react'
import type { Objectif, PropositionObjectif } from '@/types/ma-marque'

type Props = {
  objectifs: Objectif[]
  propositions: PropositionObjectif[]
  onAdd: (o: Omit<Objectif, 'id'>) => void
  onRemove: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
}

const PRIORITES: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: 'Prioritaire' },
  { value: 2, label: 'Important' },
  { value: 3, label: 'Secondaire' },
]

export function ObjectifsContext({
  objectifs,
  propositions,
  onAdd,
  onRemove,
  onMove,
}: Props) {
  const [label, setLabel] = useState('')
  const [priorite, setPriorite] = useState<1 | 2 | 3>(1)
  const [erreur, setErreur] = useState<string | null>(null)

  function valider(e: React.FormEvent) {
    e.preventDefault()
    const net = label.trim()
    if (net.length === 0) {
      setErreur('Décris ton objectif en une phrase courte.')
      return
    }
    if (objectifs.length >= 12) {
      setErreur('Maximum 12 objectifs. Retire-en un pour en ajouter.')
      return
    }
    onAdd({ label: net, priorite })
    setLabel('')
    setPriorite(1)
    setErreur(null)
  }

  function ajouterDepuisProposition(p: PropositionObjectif) {
    if (objectifs.length >= 12) {
      setErreur('Maximum 12 objectifs. Retire-en un pour en ajouter.')
      return
    }
    onAdd({ label: p.label, priorite: p.priorite_suggeree })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Propositions sur-mesure */}
      <section
        aria-labelledby="obj-props-title"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
      >
        <h4
          id="obj-props-title"
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
          Quelques caps possibles
        </h4>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {propositions.slice(0, 3).map((p, i) => (
            <li key={`${i}-${p.label}`}>
              <button
                type="button"
                onClick={() => ajouterDepuisProposition(p)}
                className="glass-thin"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontFamily: 'var(--font-system)',
                  fontSize: 14,
                  color: 'var(--color-label)',
                }}
              >
                <span style={{ flex: 1 }}>{p.label}</span>
                <span
                  style={{
                    fontSize: 18,
                    lineHeight: 1,
                    color: 'var(--color-secondary-label)',
                  }}
                >
                  +
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Ajouter à la main */}
      <section
        aria-labelledby="obj-add-title"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
      >
        <h4
          id="obj-add-title"
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
          Ajouter un objectif
        </h4>
        <form
          onSubmit={valider}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex. Rendre visible le savoir-faire artisanal"
            maxLength={160}
            className="glass-thin"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.06)',
              fontFamily: 'var(--font-system)',
              fontSize: 15,
              color: 'var(--color-label)',
              outline: 'none',
            }}
          />
          <select
            value={priorite}
            onChange={(e) => setPriorite(Number.parseInt(e.target.value, 10) as 1 | 2 | 3)}
            className="glass-thin"
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.06)',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              color: 'var(--color-label)',
              outline: 'none',
              appearance: 'none',
            }}
          >
            {PRIORITES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          {erreur ? (
            <p
              role="alert"
              style={{
                margin: 0,
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                color: '#D70015',
              }}
            >
              {erreur}
            </p>
          ) : null}
          <button
            type="submit"
            style={{
              alignSelf: 'flex-start',
              padding: '10px 18px',
              borderRadius: 22,
              border: 'none',
              cursor: 'pointer',
              background: 'var(--color-label)',
              color: 'var(--color-background)',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Ajouter
          </button>
        </form>
      </section>

      {/* Liste réordonnable */}
      {objectifs.length > 0 ? (
        <section
          aria-labelledby="obj-list-title"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
        >
          <h4
            id="obj-list-title"
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
            Tes objectifs ({objectifs.length})
          </h4>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {objectifs.map((o, i) => (
              <li
                key={o.id}
                className="glass-thin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 14,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 24,
                    fontFamily: 'var(--font-system)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--color-tertiary-label)',
                    textAlign: 'center',
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontFamily: 'var(--font-system)',
                    fontSize: 14,
                    color: 'var(--color-label)',
                  }}
                >
                  {o.label}
                </span>
                <button
                  type="button"
                  onClick={() => onMove(o.id, 'up')}
                  disabled={i === 0}
                  aria-label={`Monter ${o.label}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    border: 'none',
                    background: 'transparent',
                    cursor: i === 0 ? 'not-allowed' : 'pointer',
                    color: i === 0 ? 'var(--color-quaternary-label)' : 'var(--color-secondary-label)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: i === 0 ? 0.35 : 1,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M6 3 L2 8 L10 8 Z" fill="currentColor" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onMove(o.id, 'down')}
                  disabled={i === objectifs.length - 1}
                  aria-label={`Descendre ${o.label}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    border: 'none',
                    background: 'transparent',
                    cursor: i === objectifs.length - 1 ? 'not-allowed' : 'pointer',
                    color:
                      i === objectifs.length - 1
                        ? 'var(--color-quaternary-label)'
                        : 'var(--color-secondary-label)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: i === objectifs.length - 1 ? 0.35 : 1,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M6 9 L2 4 L10 4 Z" fill="currentColor" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(o.id)}
                  aria-label={`Retirer ${o.label}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--color-tertiary-label)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path
                      d="M3 3 L11 11 M11 3 L3 11"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
