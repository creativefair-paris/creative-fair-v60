// Sprint 36.B.2 → 36.B.3 — Panneau gauche du Split Brief Calendrier business.
//
// Patches Sprint 36.B.3 :
//   - Fix bug : click sur piste = pré-remplit (titre + type), pas d'insertion.
//   - Layout dates "Du __ au __" sur une seule ligne.
//   - Accordéon Détails : importance, pilier associé, visibilité, notes.

'use client'

import { useState } from 'react'
import type {
  MomentBusiness,
  MomentBusinessType,
  MomentImportance,
  MomentVisibilite,
  PropositionCalendrier,
} from '@/types/ma-marque'
import type { PilierNarratif } from '@/types/programme'
import { TYPE_COULEURS } from './CalendrierPreview'

type Props = {
  moments: MomentBusiness[]
  propositions: PropositionCalendrier[]
  piliers?: PilierNarratif[]
  onAdd: (m: Omit<MomentBusiness, 'id'>) => void
  onRemove: (id: string) => void
}

const TYPES: { value: MomentBusinessType; label: string }[] = [
  { value: 'lancement', label: 'Lancement' },
  { value: 'evenement', label: 'Événement' },
  { value: 'operation', label: 'Opération' },
  { value: 'saison', label: 'Saison' },
]

const IMPORTANCES: { value: MomentImportance; label: string }[] = [
  { value: 'mineur', label: 'Mineur' },
  { value: 'structurant', label: 'Structurant' },
  { value: 'majeur', label: 'Majeur' },
]

const VISIBILITES: { value: MomentVisibilite; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'confidentiel', label: 'Confidentiel' },
]

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function formaterDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function CalendrierContext({
  moments,
  propositions,
  piliers = [],
  onAdd,
  onRemove,
}: Props) {
  const [titre, setTitre] = useState('')
  const [type, setType] = useState<MomentBusinessType>('lancement')
  const [dateDebut, setDateDebut] = useState(todayISO())
  const [dateFin, setDateFin] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [detailsOuverts, setDetailsOuverts] = useState(false)
  const [importance, setImportance] = useState<MomentImportance | ''>('')
  const [pilierId, setPilierId] = useState<string>('')
  const [visibilite, setVisibilite] = useState<MomentVisibilite | ''>('')
  const [notes, setNotes] = useState('')

  function reset() {
    setTitre('')
    setType('lancement')
    setDateDebut(todayISO())
    setDateFin('')
    setErreur(null)
    setImportance('')
    setPilierId('')
    setVisibilite('')
    setNotes('')
    setDetailsOuverts(false)
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
      ...(importance ? { importance } : {}),
      ...(pilierId ? { pilier_id: pilierId } : {}),
      ...(visibilite ? { visibilite } : {}),
      ...(notes.trim().length > 0 ? { notes: notes.trim().slice(0, 600) } : {}),
    })
    reset()
  }

  // Sprint 36.B.3 — Fix bug : pré-remplit le formulaire, n'insère pas.
  function preremplirDepuisProposition(p: PropositionCalendrier) {
    setTitre(p.titre)
    setType(p.type)
    setErreur(null)
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
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: 'var(--color-tertiary-label)',
            margin: 0,
          }}
        >
          Une piste remplit le formulaire ci-dessous. Tu valides toi-même avec Ajouter.
        </p>
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
                onClick={() => preremplirDepuisProposition(p)}
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
                    fontSize: 12,
                    color: 'var(--color-tertiary-label)',
                  }}
                >
                  Pré-remplir
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
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
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

          {/* Sprint 36.B.3 — Dates sur une seule ligne : Du __ au __ */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto 1fr',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                color: 'var(--color-secondary-label)',
              }}
            >
              Du
            </span>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="glass-thin"
              aria-label="Date de début"
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
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                color: 'var(--color-secondary-label)',
              }}
            >
              au
            </span>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="glass-thin"
              aria-label="Date de fin (optionnel)"
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
          </div>

          {/* Sprint 36.B.3 — Accordéon Détails */}
          <details
            open={detailsOuverts}
            onToggle={(e) => setDetailsOuverts((e.target as HTMLDetailsElement).open)}
            style={{
              borderRadius: 12,
              padding: '6px 0',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-secondary-label)',
                padding: '6px 2px',
                listStyle: 'none',
                userSelect: 'none',
              }}
            >
              Détails {detailsOuverts ? '−' : '+'}
            </summary>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                paddingTop: 10,
              }}
            >
              {/* Importance */}
              <div>
                <DetailLabel>Importance</DetailLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {IMPORTANCES.map((i) => (
                    <Chip
                      key={i.value}
                      label={i.label}
                      actif={importance === i.value}
                      onClick={() =>
                        setImportance(importance === i.value ? '' : i.value)
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Pilier */}
              {piliers.length > 0 ? (
                <div>
                  <DetailLabel>Pilier associé</DetailLabel>
                  <select
                    value={pilierId}
                    onChange={(e) => setPilierId(e.target.value)}
                    className="glass-thin"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.06)',
                      fontFamily: 'var(--font-system)',
                      fontSize: 13,
                      color: 'var(--color-label)',
                      outline: 'none',
                      appearance: 'none',
                    }}
                  >
                    <option value="">Aucun pilier</option>
                    {piliers.map((p, i) => (
                      <option key={`${p.nom}-${i}`} value={p.nom}>
                        {p.nom}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Visibilité */}
              <div>
                <DetailLabel>Visibilité</DetailLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {VISIBILITES.map((v) => (
                    <Chip
                      key={v.value}
                      label={v.label}
                      actif={visibilite === v.value}
                      onClick={() =>
                        setVisibilite(visibilite === v.value ? '' : v.value)
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <DetailLabel>Notes éditoriales</DetailLabel>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Précisions sur l'angle, le ton, les visuels prévus…"
                  rows={3}
                  maxLength={600}
                  className="glass-thin"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.06)',
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: 'var(--color-secondary-label)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </details>

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

// ── Sous-composants accordéon ────────────────────────────────────────

function DetailLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-system)',
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--color-tertiary-label)',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </div>
  )
}

function Chip({
  label,
  actif,
  onClick,
}: {
  label: string
  actif: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      style={{
        padding: '6px 12px',
        borderRadius: 14,
        border: 'none',
        cursor: 'pointer',
        background: actif ? 'var(--color-label)' : 'rgba(0,0,0,0.04)',
        color: actif ? 'var(--color-background)' : 'var(--color-secondary-label)',
        fontFamily: 'var(--font-system)',
        fontSize: 12,
        fontWeight: actif ? 600 : 500,
        transition: 'background 160ms ease, color 160ms ease',
      }}
    >
      {label}
    </button>
  )
}
