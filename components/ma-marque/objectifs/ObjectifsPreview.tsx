// Sprint 36.B.2 — Panneau droit (60%) du Split Brief Objectifs.
// Carte d'identité stratégique : phrase narrative + objectifs numérotés.

'use client'

import type { Objectif } from '@/types/ma-marque'

type Props = {
  objectifs: Objectif[]
}

// Phrases narratives — hardcodées, on choisit selon la longueur de la liste.
// Pilier 4 : vocabulaire humain, formulé comme un coach éditorial le dirait.
function phraseNarrative(objectifs: Objectif[]): string {
  if (objectifs.length === 0) {
    return 'Pas encore de cap pour cette saison.'
  }
  if (objectifs.length === 1) {
    return `Cette saison, tu vises ${decapitaliser(objectifs[0]!.label)}.`
  }
  if (objectifs.length === 2) {
    return `Cette saison, tu vises ${decapitaliser(objectifs[0]!.label)}, puis ${decapitaliser(objectifs[1]!.label)}.`
  }
  if (objectifs.length === 3) {
    return `Cette saison, tu vises ${decapitaliser(objectifs[0]!.label)}, puis ${decapitaliser(objectifs[1]!.label)}, et enfin ${decapitaliser(objectifs[2]!.label)}.`
  }
  // 4+ : on garde les 3 premiers en saillance
  const top = objectifs.slice(0, 3)
  return `Trois caps prioritaires : ${decapitaliser(top[0]!.label)}, ${decapitaliser(top[1]!.label)}, ${decapitaliser(top[2]!.label)}.`
}

function decapitaliser(s: string): string {
  const trim = s.trim()
  if (trim.length === 0) return trim
  return trim[0]!.toLowerCase() + trim.slice(1)
}

const RANGS = ['1er', '2e', '3e', '4e', '5e', '6e', '7e', '8e', '9e', '10e', '11e', '12e']

export function ObjectifsPreview({ objectifs }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <header>
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
          Cap de saison
        </h3>
      </header>

      <article
        className="glass-regular"
        style={{
          padding: 'var(--space-5)',
          borderRadius: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 19,
            lineHeight: 1.45,
            fontWeight: 500,
            color: 'var(--color-label)',
            margin: 0,
            letterSpacing: '-0.005em',
          }}
        >
          {phraseNarrative(objectifs)}
        </p>

        {objectifs.length > 0 ? (
          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            {objectifs.map((o, i) => (
              <li
                key={o.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) 0',
                  borderTop:
                    i === 0 ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 36,
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-tertiary-label)',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    paddingTop: 2,
                  }}
                >
                  {RANGS[i] ?? `${i + 1}e`}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 16,
                      lineHeight: 1.4,
                      color: 'var(--color-label)',
                    }}
                  >
                    {o.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 12,
                      color: 'var(--color-tertiary-label)',
                      marginTop: 2,
                    }}
                  >
                    Priorité {o.priorite}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              color: 'var(--color-tertiary-label)',
              margin: 0,
            }}
          >
            Choisis ce qui compte vraiment cette saison. Garde-en trois maximum, le reste suit.
          </p>
        )}
      </article>
    </div>
  )
}
