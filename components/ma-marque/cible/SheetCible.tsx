// Sprint 36.B.3 — Sheet "Cible précise".
// Split Brief 40/60 : textarea libre à gauche, preview à droite.

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
  "Une cible n'est pas une démographie, c'est une posture. Qui parles-tu avec ? Comment vit-elle ?"

const PLACEHOLDER =
  "Floriane, 28 ans, responsable comm dans une PME culturelle. Ex-BCW. Lit le M du Monde le samedi. Prépare ses propositions le lundi matin avec un thé."

export function SheetCible({ initialValue, onClose, onAllerVers }: Props) {
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
        body: JSON.stringify({ field: 'cible', value: next }),
      }).catch((err) => {
        console.warn('[cible] persistance échouée:', err)
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
      title="Cible précise"
      bloc="cible"
      intro={INTRO}
      onClose={onClose}
      {...(onAllerVers ? { onAllerVers } : {})}
      context={
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={10}
          aria-label="Description de ta cible"
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
            minHeight: 220,
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
            Pour qui parles-tu
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
              La preview se remplira au fil de ta saisie.
            </p>
          )}
        </article>
      }
    />
  )
}
