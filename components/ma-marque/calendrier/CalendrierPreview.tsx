// Sprint 36.B.2 — Panneau droit (60%) du Split Brief Calendrier business.
// Aperçu visuel de l'année : 12 mois en grille 4×3, badges colorés par type.

'use client'

import type { MomentBusiness, MomentBusinessType } from '@/types/ma-marque'

type Props = {
  moments: MomentBusiness[]
}

const MOIS_LABELS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc',
]
const MOIS_LONGS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export const TYPE_COULEURS: Record<MomentBusinessType, string> = {
  lancement: '#007AFF',
  evenement: '#FF9500',
  operation: '#AF52DE',
  saison: '#34C759',
}

const TYPE_LABELS: Record<MomentBusinessType, string> = {
  lancement: 'Lancement',
  evenement: 'Événement',
  operation: 'Opération',
  saison: 'Saison',
}

function moisDu(iso: string): number | null {
  // iso = YYYY-MM-DD → mois 0-11
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const m = Number.parseInt(iso.slice(5, 7), 10)
  if (Number.isNaN(m) || m < 1 || m > 12) return null
  return m - 1
}

// Pour chaque mois, on calcule la liste des moments qui le couvrent.
// Un moment avec date_fin couvre tous les mois entre date_debut et date_fin.
function momentsParMois(moments: MomentBusiness[]): MomentBusiness[][] {
  const grid: MomentBusiness[][] = Array.from({ length: 12 }, () => [])
  for (const m of moments) {
    const debut = moisDu(m.date_debut)
    if (debut === null) continue
    const fin = m.date_fin ? moisDu(m.date_fin) ?? debut : debut
    const finBornee = Math.min(11, Math.max(debut, fin))
    for (let i = debut; i <= finBornee; i++) {
      grid[i]!.push(m)
    }
  }
  return grid
}

export function CalendrierPreview({ moments }: Props) {
  const grid = momentsParMois(moments)
  const anneeCourante = new Date().getFullYear()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
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
        <h3
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.015em',
            color: 'var(--color-label)',
            margin: 0,
          }}
        >
          Ton année
        </h3>
        <span
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: 'var(--color-tertiary-label)',
          }}
        >
          {anneeCourante}
        </span>
      </header>

      {/* Légende */}
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        {(Object.keys(TYPE_COULEURS) as MomentBusinessType[]).map((t) => (
          <li
            key={t}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              color: 'var(--color-secondary-label)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: TYPE_COULEURS[t],
                display: 'inline-block',
              }}
            />
            {TYPE_LABELS[t]}
          </li>
        ))}
      </ul>

      {/* Grille 4×3 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginTop: 'var(--space-2)',
        }}
      >
        {MOIS_LABELS.map((mois, i) => {
          const items = grid[i] ?? []
          const nonVide = items.length > 0
          return (
            <article
              key={mois}
              aria-label={`${MOIS_LONGS[i]} — ${items.length} moment${items.length === 1 ? '' : 's'}`}
              className={nonVide ? 'glass-regular' : 'glass-thin'}
              style={{
                borderRadius: 18,
                padding: 'var(--space-3)',
                minHeight: 110,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                opacity: nonVide ? 1 : 0.6,
                transition: 'opacity 200ms ease',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-secondary-label)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}
              >
                {mois}
              </span>
              {nonVide ? (
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  {items.slice(0, 3).map((m) => (
                    <li
                      key={m.id}
                      title={`${m.titre} — ${TYPE_LABELS[m.type]}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: 'var(--font-system)',
                        fontSize: 12,
                        color: 'var(--color-label)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          background: TYPE_COULEURS[m.type],
                        }}
                      />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.titre}
                      </span>
                    </li>
                  ))}
                  {items.length > 3 ? (
                    <li
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 11,
                        color: 'var(--color-tertiary-label)',
                        marginLeft: 12,
                      }}
                    >
                      +{items.length - 3}
                    </li>
                  ) : null}
                </ul>
              ) : (
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 12,
                    color: 'var(--color-tertiary-label)',
                  }}
                >
                  —
                </span>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
