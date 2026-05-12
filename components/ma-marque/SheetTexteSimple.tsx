// Sprint 36.B.3 — Sheet d'édition texte simple (Nom, Secteur, Voix, Singularité).
// Pas de preview : layout centré 680px max, juste un champ + persistance.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SheetMaMarque } from '@/components/ma-marque/SheetMaMarque'
import type { BlocId } from '@/lib/ma-marque/completude'

type Props = {
  title: string
  bloc: BlocId
  intro: string
  placeholder: string
  field: 'name' | 'secteur' | 'ton' | 'singularite'
  multiline?: boolean
  maxLength?: number
  initialValue: string
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
}

export function SheetTexteSimple({
  title,
  bloc,
  intro,
  placeholder,
  field,
  multiline = false,
  maxLength,
  initialValue,
  onClose,
  onAllerVers,
}: Props) {
  const [value, setValue] = useState<string>(initialValue ?? '')
  const [erreur, setErreur] = useState<string | null>(null)
  const persistRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (persistRef.current) clearTimeout(persistRef.current)
    }
  }, [])

  const persister = useCallback(
    (next: string) => {
      if (persistRef.current) clearTimeout(persistRef.current)
      persistRef.current = setTimeout(() => {
        void fetch('/api/brand/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, value: next }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}))
              setErreur((data as { detail?: string }).detail ?? 'Persistance impossible.')
            } else {
              setErreur(null)
            }
          })
          .catch(() => setErreur('Connexion impossible.'))
      }, 500)
    },
    [field],
  )

  function handleChange(next: string) {
    setValue(next)
    if (next.trim().length > 0) {
      persister(next)
    }
  }

  const champStyle = {
    width: '100%',
    padding: '16px 18px',
    borderRadius: 16,
    border: 'none',
    outline: 'none',
    fontFamily: 'var(--font-system)',
    fontSize: 17,
    lineHeight: 1.5,
    color: 'var(--color-label)',
  } as const

  return (
    <SheetMaMarque
      layout="centered"
      title={title}
      bloc={bloc}
      intro={intro}
      onClose={onClose}
      {...(onAllerVers ? { onAllerVers } : {})}
    >
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          {...(maxLength ? { maxLength } : {})}
          aria-label={title}
          className="glass-thin"
          style={{ ...champStyle, resize: 'vertical', minHeight: 160 }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          {...(maxLength ? { maxLength } : {})}
          aria-label={title}
          className="glass-thin"
          style={champStyle}
        />
      )}
      {erreur ? (
        <p
          role="alert"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: '#D70015',
            margin: 0,
          }}
        >
          {erreur}
        </p>
      ) : null}
    </SheetMaMarque>
  )
}
