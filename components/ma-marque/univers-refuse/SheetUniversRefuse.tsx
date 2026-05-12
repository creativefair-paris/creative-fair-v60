// Sprint 36.B.3 — Sheet "Univers refusé".
// Texte libre — ce que la marque ne fera jamais.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SheetMaMarque } from '@/components/ma-marque/SheetMaMarque'
import type { BlocId } from '@/lib/ma-marque/completude'

type Props = {
  initialValue: string
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
}

const INTRO =
  "Ce que ta marque ne fera jamais. Sujets, postures, formats, partenaires. Ces refus protègent la signature."

const PLACEHOLDER =
  "Pas de partenariat fast-fashion. Pas de prise de parole politique. Pas de meme. Pas de réaction à chaud."

export function SheetUniversRefuse({ initialValue, onClose, onAllerVers }: Props) {
  const [value, setValue] = useState<string>(initialValue ?? '')
  const persistRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (persistRef.current) clearTimeout(persistRef.current)
    }
  }, [])

  const persister = useCallback((next: string) => {
    if (persistRef.current) clearTimeout(persistRef.current)
    persistRef.current = setTimeout(() => {
      void fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'univers_refuse', value: next }),
      }).catch((err) => {
        console.warn('[univers-refuse] persistance échouée:', err)
      })
    }, 500)
  }, [])

  function handleChange(next: string) {
    setValue(next)
    if (next.trim().length > 0) {
      persister(next)
    }
  }

  return (
    <SheetMaMarque
      layout="split"
      title="Univers refusé"
      bloc="univers-refuse"
      intro={INTRO}
      onClose={onClose}
      {...(onAllerVers ? { onAllerVers } : {})}
      context={
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={8}
          aria-label="Univers refusé"
          className="glass-thin"
          style={{
            width: '100%',
            padding: '16px 18px',
            borderRadius: 16,
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-system)',
            fontSize: 15,
            lineHeight: 1.5,
            color: 'var(--color-label)',
            resize: 'vertical',
            minHeight: 180,
          }}
        />
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
            Refus assumés
          </h3>
          {value.trim().length > 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 17,
                lineHeight: 1.5,
                color: 'var(--color-label)',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
            >
              {value}
            </p>
          ) : (
            <p
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 15,
                lineHeight: 1.5,
                color: 'var(--color-tertiary-label)',
                margin: 0,
                fontStyle: 'italic',
              }}
            >
              Les refus apparaîtront ici dès que tu en poses.
            </p>
          )}
        </article>
      }
    />
  )
}
