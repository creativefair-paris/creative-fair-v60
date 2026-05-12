// Sprint 36.B.3 — Sheet "Canaux activés".
// 4 canaux V1 (LinkedIn, Newsletter, Site, GMB). TikTok/X/YouTube/Facebook refusés V1.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SheetMaMarque } from '@/components/ma-marque/SheetMaMarque'
import {
  CANAUX_LABELS,
  CANAUX_ORDRE,
  CANAUX_VIDES,
  canauxNormaliser,
  type CanalId,
  type Canaux,
} from '@/types/ma-marque'
import type { BlocId } from '@/lib/ma-marque/completude'

type Props = {
  initialValue: Canaux | null
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
}

const INTRO =
  "Active uniquement les canaux que tu vas vraiment nourrir. Un canal vide vaut moins qu'un canal absent."

const PLACEHOLDERS: Record<CanalId, string> = {
  linkedin: 'linkedin.com/company/ta-marque',
  newsletter: 'ta-marque@substack.com',
  site: 'tamarque.fr',
  gmb: 'Lien Google My Business',
}

const REFUSES_V1 = ['TikTok', 'X', 'YouTube', 'Facebook']

export function SheetCanaux({ initialValue, onClose, onAllerVers }: Props) {
  const [canaux, setCanaux] = useState<Canaux>(
    canauxNormaliser(initialValue ?? CANAUX_VIDES),
  )
  const persistRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (persistRef.current) clearTimeout(persistRef.current)
    }
  }, [])

  const persister = useCallback((next: Canaux) => {
    if (persistRef.current) clearTimeout(persistRef.current)
    persistRef.current = setTimeout(() => {
      void fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'canaux', value: next }),
      }).catch((err) => {
        console.warn('[canaux] persistance échouée:', err)
      })
    }, 400)
  }, [])

  function toggle(id: CanalId) {
    setCanaux((prev) => {
      const next = { ...prev, [id]: { ...prev[id], actif: !prev[id].actif } }
      persister(next)
      return next
    })
  }

  function changeUrl(id: CanalId, url: string) {
    setCanaux((prev) => {
      const next = { ...prev, [id]: { ...prev[id], url } }
      persister(next)
      return next
    })
  }

  return (
    <SheetMaMarque
      layout="split"
      title="Canaux activés"
      bloc="canaux"
      intro={INTRO}
      onClose={onClose}
      {...(onAllerVers ? { onAllerVers } : {})}
      context={
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
          {CANAUX_ORDRE.map((id) => {
            const c = canaux[id]
            return (
              <li
                key={id}
                className="glass-thin"
                style={{
                  borderRadius: 16,
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--color-label)',
                    }}
                  >
                    {CANAUX_LABELS[id]}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={c.actif}
                    aria-label={`Activer ${CANAUX_LABELS[id]}`}
                    onClick={() => toggle(id)}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      flexShrink: 0,
                      width: 44,
                      height: 26,
                      borderRadius: 13,
                      background: c.actif ? '#34C759' : 'rgba(0,0,0,0.15)',
                      position: 'relative',
                      transition: 'background 220ms ease',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: c.actif ? 20 : 2,
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        background: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'left 220ms ease',
                      }}
                    />
                  </button>
                </div>
                {c.actif ? (
                  <input
                    type="text"
                    value={c.url}
                    onChange={(e) => changeUrl(id, e.target.value)}
                    placeholder={PLACEHOLDERS[id]}
                    aria-label={`URL ou handle ${CANAUX_LABELS[id]}`}
                    style={{
                      padding: '8px 0',
                      border: 'none',
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                      background: 'transparent',
                      fontFamily: 'var(--font-system)',
                      fontSize: 14,
                      color: 'var(--color-label)',
                      outline: 'none',
                    }}
                  />
                ) : null}
              </li>
            )
          })}
        </ul>
      }
      preview={
        <article
          className="glass-regular"
          style={{
            borderRadius: 24,
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-tertiary-label)',
              margin: 0,
            }}
          >
            Canaux activés
          </h3>
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
            {CANAUX_ORDRE.filter((id) => canaux[id].actif).map((id) => (
              <li
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--color-label)',
                  }}
                >
                  {CANAUX_LABELS[id]}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    color: 'var(--color-secondary-label)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '60%',
                  }}
                >
                  {canaux[id].url.trim().length > 0 ? canaux[id].url : 'À renseigner'}
                </span>
              </li>
            ))}
            {CANAUX_ORDRE.every((id) => !canaux[id].actif) ? (
              <li
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 15,
                  color: 'var(--color-tertiary-label)',
                  fontStyle: 'italic',
                }}
              >
                Aucun canal actif.
              </li>
            ) : null}
          </ul>

          <div
            style={{
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              lineHeight: 1.5,
              color: 'var(--color-tertiary-label)',
            }}
          >
            {REFUSES_V1.join(', ')} — non couverts par Creative Fair V1.
          </div>
        </article>
      }
    />
  )
}
