// Sprint 36.B.5 — Modale d'inscription à la liste d'attente d'un canal.
//
// Pas de window.confirm. Pas de Sheet plein écran : popover discret
// centré, ouverture rapide. Email pré-rempli si dispo.

'use client'

import { useEffect, useRef, useState } from 'react'
import { CANAUX_BIENTOT_LABELS, type CanalBientotId } from '@/types/ma-marque'

type Props = {
  channel: CanalBientotId
  defaultEmail?: string
  dejaInscrit: boolean
  onClose: () => void
  onInscrire: (email: string) => Promise<{ ok: boolean; detail?: string }>
  onRetirer: (email: string) => Promise<{ ok: boolean; detail?: string }>
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function WaitlistModal({
  channel,
  defaultEmail = '',
  dejaInscrit,
  onClose,
  onInscrire,
  onRetirer,
}: Props) {
  const [email, setEmail] = useState<string>(defaultEmail)
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    inputRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function valider() {
    setErreur(null)
    const e = email.trim().toLowerCase()
    if (!EMAIL_RE.test(e)) {
      setErreur('Adresse email invalide.')
      return
    }
    setEnCours(true)
    const res = await onInscrire(e)
    setEnCours(false)
    if (!res.ok) {
      setErreur(res.detail ?? 'Impossible de t’inscrire pour l’instant.')
      return
    }
    onClose()
  }

  async function retirer() {
    setErreur(null)
    setEnCours(true)
    const res = await onRetirer(email.trim().toLowerCase() || defaultEmail.trim().toLowerCase())
    setEnCours(false)
    if (!res.ok) {
      setErreur(res.detail ?? 'Impossible de te retirer pour l’instant.')
      return
    }
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Liste d'attente ${CANAUX_BIENTOT_LABELS[channel]}`}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        background: 'rgba(0,0,0,0.32)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 16,
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 18,
            fontWeight: 600,
            color: '#1C1C1E',
            margin: 0,
            letterSpacing: '-0.012em',
          }}
        >
          {dejaInscrit
            ? `Tu es sur la liste pour ${CANAUX_BIENTOT_LABELS[channel]}`
            : `Inscris-toi à la liste d'attente pour ${CANAUX_BIENTOT_LABELS[channel]}`}
        </h2>
        {!dejaInscrit ? (
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              lineHeight: 1.5,
              color: 'rgba(0,0,0,0.55)',
              margin: 0,
            }}
          >
            On te notifie dès que Creative Fair couvre ce canal.
          </p>
        ) : null}

        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErreur(null)
          }}
          placeholder="ton@email.com"
          aria-label="Adresse email"
          disabled={enCours}
          style={{
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.6)',
            fontFamily: 'var(--font-system)',
            fontSize: 15,
            color: '#1C1C1E',
            outline: 'none',
          }}
        />

        {erreur ? (
          <p
            role="alert"
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              color: '#FF3B30',
              margin: 0,
            }}
          >
            {erreur}
          </p>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={enCours}
            className="cfs-btn-secondaire"
          >
            Annuler
          </button>
          {dejaInscrit ? (
            <button
              type="button"
              onClick={() => void retirer()}
              disabled={enCours}
              className="cfs-btn-destructif"
            >
              {enCours ? 'En cours…' : 'Me retirer'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void valider()}
              disabled={enCours}
              className="cfs-btn-primaire"
            >
              {enCours ? 'Inscription…' : 'Inscrire'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
