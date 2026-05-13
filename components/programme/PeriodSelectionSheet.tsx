// Sprint 37 (Lot 4) — Sheet sélection période avant ConseillerSheet A1.
//
// Doc 09 §8 "UX spécifique — Création de plan (Scénario A1)" Étape 2-3.
//
// Permet au pilote de choisir date_start + date_end. Calcule en temps
// réel la durée + estimation nombre de posts (selon profil curseur
// fréquence). Détecte le chevauchement avec un programme existant et
// propose 2 options : démarrer plus tard (recommandé) ou insister.
//
// Décision technique #8 : seuil chevauchement = 21 jours. V1 implémente
// la détection stricte (start < currentEnd). La fine-tuning du seuil
// 21-jours (proximité fin de programme actuel) est documentée pour
// Sprint 38 dans audits/sprint-37/decisions.md.

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const OVERLAP_BUFFER_DAYS = 21 // décision technique #8

export type PublicationFrequency = 'discreet' | 'balanced' | 'dense'

type Props = {
  open: boolean
  onClose: () => void
  // Programme actif (si existant) — pour détecter le chevauchement.
  currentProgrammeEnd?: string | null // YYYY-MM-DD ou null
  // Curseur fréquence du pilote (profiles.publication_frequency).
  // Si null, on assume 'balanced' (3 posts/sem) — fallback doctrinal.
  publicationFrequency?: PublicationFrequency | null
  // Callback déclenché quand le pilote valide la période (sortie
  // vers la ConseillerSheet A1).
  onConfirm: (params: { start: string; end: string }) => void
}

function todayPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function diffDays(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`)
  const db = new Date(`${b}T00:00:00`)
  return Math.round((db.getTime() - da.getTime()) / 86400000)
}

function postsPerWeek(freq: PublicationFrequency | null | undefined): number {
  if (freq === 'discreet') return 2
  if (freq === 'dense') return 6
  return 3 // 'balanced' ou null → 3 posts/sem
}

function formatFr(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  }).format(d)
}

export function PeriodSelectionSheet({
  open,
  onClose,
  currentProgrammeEnd,
  publicationFrequency,
  onConfirm,
}: Props) {
  // Défaut V1 (doc 09 §8 exemple) : 4 semaines à partir d'aujourd'hui +
  // 2 jours (laisse 1-2 jours de respiration avant le démarrage).
  const [start, setStart] = useState<string>(todayPlus(2))
  const [end, setEnd] = useState<string>(todayPlus(2 + 28))
  const dialogRef = useRef<HTMLDivElement>(null)

  // Esc → close.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const stats = useMemo(() => {
    const days = Math.max(0, diffDays(start, end) + 1)
    const weeks = Math.max(1, Math.round(days / 7))
    const posts = weeks * postsPerWeek(publicationFrequency)
    return { days, weeks, posts }
  }, [start, end, publicationFrequency])

  // Détection chevauchement avec programme actif. Le chevauchement strict
  // est : nouvelle start < current_end. Le seuil 21 jours (décision #8)
  // élargit la fenêtre d'alerte : on warn aussi si l'écart current_end →
  // new_start est < OVERLAP_BUFFER_DAYS (le pilote enchaîne trop vite).
  const overlap = useMemo(() => {
    if (!currentProgrammeEnd) return null
    const cmp = diffDays(currentProgrammeEnd, start)
    // cmp = jours entre fin programme actuel et début du nouveau.
    // cmp < 0 → chevauchement strict (nouveau commence avant fin actuel).
    // 0 ≤ cmp < 21 → proximité (alerte décision #8).
    if (cmp < 0) {
      const overlapDays = -cmp
      return {
        kind: 'strict' as const,
        overlapDays,
        suggestedStart: todayPlus(0), // recalculé ci-dessous
      }
    }
    if (cmp < OVERLAP_BUFFER_DAYS) {
      return { kind: 'buffer' as const, marginDays: cmp, suggestedStart: '' }
    }
    return null
  }, [currentProgrammeEnd, start])

  // Suggested start = lendemain du current_end.
  const suggestedStart = useMemo(() => {
    if (!currentProgrammeEnd) return null
    const d = new Date(`${currentProgrammeEnd}T00:00:00`)
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  }, [currentProgrammeEnd])

  if (!open) return null

  const canContinue =
    start.length > 0 && end.length > 0 && diffDays(start, end) > 0

  function handleConfirm(insistDespiteOverlap = false) {
    void insistDespiteOverlap
    onConfirm({ start, end })
  }

  function handleAcceptSuggestion() {
    if (!suggestedStart) return
    setStart(suggestedStart)
    // Recalcule end pour conserver la durée (28 jours par défaut).
    const newEnd = (() => {
      const d = new Date(`${suggestedStart}T00:00:00`)
      d.setDate(d.getDate() + Math.max(7, diffDays(start, end)))
      return d.toISOString().slice(0, 10)
    })()
    setEnd(newEnd)
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="period-sheet-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.18)',
          animation: 'cfs-period-overlay-in 200ms ease-out',
        }}
      />
      <section
        className="glass-regular"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 520,
          width: '100%',
          borderRadius: 20,
          padding: '28px 28px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          animation: 'cfs-period-sheet-in 280ms ease-out',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
        }}
      >
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h2
            id="period-sheet-title"
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-label)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Créer mon prochain plan sur mesure
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--color-secondary-label)',
              margin: 0,
            }}
          >
            Tu choisis la période. Le conseiller construit avec toi le plan
            adapté.
          </p>
        </header>

        <div style={{ display: 'flex', gap: 12 }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-tertiary-label)',
              }}
            >
              Date de début
            </span>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--color-separator)',
                fontFamily: 'var(--font-system)',
                fontSize: 15,
                color: 'var(--color-label)',
                background: 'rgba(255,255,255,0.6)',
                outline: 'none',
              }}
            />
          </label>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-tertiary-label)',
              }}
            >
              Date de fin
            </span>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--color-separator)',
                fontFamily: 'var(--font-system)',
                fontSize: 15,
                color: 'var(--color-label)',
                background: 'rgba(255,255,255,0.6)',
                outline: 'none',
              }}
            />
          </label>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            color: 'var(--color-secondary-label)',
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(0,0,0,0.03)',
          }}
        >
          Durée. {stats.weeks} {stats.weeks === 1 ? 'semaine' : 'semaines'},
          environ {stats.posts} posts.
        </div>

        {overlap && currentProgrammeEnd ? (
          <div
            role="alert"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid rgba(255, 149, 0, 0.5)',
              background: 'rgba(255, 149, 0, 0.06)',
            }}
          >
            <strong
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-label)',
              }}
            >
              Tu as déjà un plan en cours.
            </strong>
            <p
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                lineHeight: 1.5,
                color: 'var(--color-secondary-label)',
                margin: 0,
              }}
            >
              Plan actuel se termine le {formatFr(currentProgrammeEnd)}.
              {overlap.kind === 'strict'
                ? ` Chevauchement de ${overlap.overlapDays} jour${overlap.overlapDays > 1 ? 's' : ''}.`
                : ` Tu enchaînes dans ${overlap.marginDays} jour${overlap.marginDays > 1 ? 's' : ''}.`}
            </p>
            {suggestedStart ? (
              <p
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'var(--color-secondary-label)',
                  margin: 0,
                }}
              >
                Je te propose plutôt de démarrer le {formatFr(suggestedStart)}.
                Tu finis ton plan actuel proprement, puis le nouveau enchaîne
                sans casser le rythme.
              </p>
            ) : null}
          </div>
        ) : null}

        <footer
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: 22,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-secondary-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {overlap && suggestedStart ? (
              <button
                type="button"
                onClick={handleAcceptSuggestion}
                style={{
                  padding: '10px 18px',
                  borderRadius: 22,
                  border: '1px solid var(--color-separator)',
                  background: 'rgba(255,255,255,0.6)',
                  color: 'var(--color-label)',
                  fontFamily: 'var(--font-system)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Démarrer le {formatFr(suggestedStart)}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => handleConfirm(overlap !== null)}
              disabled={!canContinue}
              className="btn-primary"
            >
              {overlap ? `Démarrer le ${formatFr(start)}` : 'Continuer'}
            </button>
          </div>
        </footer>

        <style>{`
          @keyframes cfs-period-overlay-in {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes cfs-period-sheet-in {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          @media (prefers-reduced-motion: reduce) {
            section { animation: none !important; }
          }
        `}</style>
      </section>
    </div>
  )
}
