// Sprint 36.B.2 — Panneau gauche (40%) du Split Brief Calendrier business.
// 3 propositions sur-mesure (silent swap) + formulaire d'ajout + liste éditable.

'use client'

import { useState } from 'react'
import type {
  MomentBusiness,
  MomentBusinessType,
  PropositionCalendrier,
} from '@/types/ma-marque'
import { TYPE_COULEURS } from './CalendrierPreview'

type Props = {
  moments: MomentBusiness[]
  propositions: PropositionCalendrier[]
  onAdd: (m: Omit<MomentBusiness, 'id'>) => void
  onRemove: (id: string) => void
}

const TYPES: { value: MomentBusinessType; label: string }[] = [
  { value: 'lancement', label: 'Lancement' },
  { value: 'evenement', label: 'Événement' },
  { value: 'operation', label: 'Opération' },
  { value: 'saison', label: 'Saison' },
]

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function formaterDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function CalendrierContext({ moments, propositions, onAdd, onRemove }: Props) {
  const [titre, setTitre] = useState('')
  const [type, setType] = useState<MomentBusinessType>('lancement')
  const [dateDebut, setDateDebut] = useState(todayISO())
  const [dateFin, setDateFin] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  function reset() {
    setTitre('')
    setType('lancement')
    setDateDebut(todayISO())
    setDateFin('')
    setErreur(null)
  }

  function valider(e: React.FormEvent) {
    e.preventDefault()
    const titreNet = titre.trim()
    if (titreNet.length === 0) {
      setErreur('Donne un titre court à ce moment.')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateDebut)) {
      setErreur('Date de début attendue.')
      return
    }
    if (dateFin && !/^\d{4}-\d{2}-\d{2}$/.test(dateFin)) {
      setErreur('Date de fin invalide.')
      return
    }
    if (dateFin && dateFin < dateDebut) {
      setErreur('La date de fin doit être après le début.')
      return
    }
    onAdd({
      titre: titreNet,
      type,
      date_debut: dateDebut,
      ...(dateFin ? { date_fin: dateFin } : {}),
    })
    reset()
  }

  function ajouterDepuisProposition(p: PropositionCalendrier) {
    onAdd({
      titre: p.titre,
      type: p.type,
      date_debut: todayISO(),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Section : Propositions sur-mesure */}
      <section
        aria-labelledby="cal-props-title"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
      >
        <h4
          id="cal-props-title"
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
          Quelques pistes pour démarrer
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
            <li key={`${i}-${p.titre}`}>
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
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: TYPE_COULEURS[p.type],
                  }}
                />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.titre}
                </span>
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

      {/* Section : Ajouter à la main */}
      <section
        aria-labelledby="cal-add-title"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
      >
        <h4
          id="cal-add-title"
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
          Ajouter un moment
        </h4>
        <form
          onSubmit={valider}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre (ex. Lancement collection automne)"
            maxLength={120}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MomentBusinessType)}
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
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="glass-thin"
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.06)',
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                color: 'var(--color-label)',
                outline: 'none',
              }}
            />
          </div>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            placeholder="Date de fin (optionnel)"
            className="glass-thin"
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.06)',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              color: 'var(--color-secondary-label)',
              outline: 'none',
            }}
          />
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

      {/* Section : Liste des moments existants */}
      {moments.length > 0 ? (
        <section
          aria-labelledby="cal-list-title"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
        >
          <h4
            id="cal-list-title"
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
            Moments planifiés ({moments.length})
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
            {moments.map((m) => (
              <li
                key={m.id}
                className="glass-thin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 14,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: TYPE_COULEURS[m.type],
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 14,
                      color: 'var(--color-label)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.titre}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 12,
                      color: 'var(--color-tertiary-label)',
                    }}
                  >
                    {formaterDate(m.date_debut)}
                    {m.date_fin ? ` → ${formaterDate(m.date_fin)}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(m.id)}
                  aria-label={`Retirer ${m.titre}`}
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
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
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
