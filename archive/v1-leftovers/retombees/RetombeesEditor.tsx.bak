// Sprint 37 (Lot 7) — Éditeur du champ Retombées sur fiche post.
//
// Doc 09 §8 (sous-section "Champ Retombées sur fiche post"). Texte
// libre 500 chars max, optionnel, visible uniquement quand le post
// est statut = 'publie'.
//
// Le composant gère son propre state local + debounce de persistance
// via la server action updatePostRetombees(). En cas d'échec
// (longueur, RLS, etc.), une bannière discrète s'affiche.

'use client'

import { useEffect, useRef, useState } from 'react'
import { updatePostRetombees } from '@/app/_actions/update-post-retombees'

const MAX_LENGTH = 500
const DEBOUNCE_MS = 800

type Props = {
  postId: string
  initialValue: string | null
}

type Status = 'idle' | 'saving' | 'saved' | 'error'

export function RetombeesEditor({ postId, initialValue }: Props) {
  const [value, setValue] = useState(initialValue ?? '')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>(initialValue ?? '')

  useEffect(() => {
    if (value === lastSavedRef.current) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setStatus('saving')
    setError(null)
    timerRef.current = setTimeout(async () => {
      const result = await updatePostRetombees({ postId, retombees: value })
      if (result.ok) {
        lastSavedRef.current = value
        setStatus('saved')
      } else {
        setStatus('error')
        setError(result.reason)
      }
    }, DEBOUNCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, postId])

  const remaining = MAX_LENGTH - value.length

  return (
    <section
      className="glass-thin"
      style={{
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-tertiary-label)',
            margin: 0,
          }}
        >
          Retombées
        </h3>
        <span
          aria-live="polite"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 12,
            color:
              status === 'error'
                ? 'var(--color-system-red, #c0392b)'
                : 'var(--color-tertiary-label)',
          }}
        >
          {status === 'saving'
            ? 'enregistrement…'
            : status === 'saved'
              ? 'enregistré'
              : status === 'error'
                ? (error ?? 'erreur')
                : ''}
        </span>
      </header>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
        placeholder="DM reçus, visites en galerie, ventes annoncées, mentions presse..."
        rows={3}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid var(--color-separator)',
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          lineHeight: 1.5,
          color: 'var(--color-label)',
          background: 'rgba(255,255,255,0.6)',
          resize: 'vertical',
          outline: 'none',
        }}
      />
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 12,
          color: 'var(--color-tertiary-label)',
          lineHeight: 1.4,
        }}
      >
        Comptages bruts uniquement (4 DM, 2 visites). Pas de pourcentages. {remaining}
        {' '}caractère{remaining > 1 ? 's' : ''} restant{remaining > 1 ? 's' : ''}.
      </p>
    </section>
  )
}
