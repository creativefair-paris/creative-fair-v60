// Sprint 37.B (F14) — Mini-sheet de choix avant ouverture conseiller.
//
// Affichée quand findResumableSession() retourne un match. 3 options :
//   - Reprendre la dernière conversation
//   - Commencer une nouvelle conversation
//   - Voir l'historique → /outils/conseiller

'use client'

import Link from 'next/link'
import type { ResumableMatch } from '@/app/_actions/find-resumable-session'

type Props = {
  open: boolean
  match: ResumableMatch
  onResume: () => void
  onNew: () => void
  onClose: () => void
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 60) return diffMin <= 1 ? "à l'instant" : `il y a ${diffMin} min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH} h`
  const diffD = Math.round(diffH / 24)
  return `il y a ${diffD} j`
}

export function ResumeChoiceSheet({ open, match, onResume, onNew, onClose }: Props) {
  if (!open) return null

  const lastUpdate =
    match.matchType === 'paused'
      ? match.session.updated_at
      : match.session.consumed_at ?? match.session.updated_at

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-choice-title"
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
          background: 'rgba(0, 0, 0, 0.18)',
        }}
      />
      <section
        className="glass-regular"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 480,
          width: '100%',
          borderRadius: 20,
          padding: '28px 28px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          background: 'rgba(251, 250, 247, 0.96)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.12)',
        }}
      >
        <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h2
            id="resume-choice-title"
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--color-label)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Tu as déjà commencé sur ce sujet
          </h2>
        </header>

        <button
          type="button"
          onClick={onResume}
          className="btn-choice"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}
        >
          <span style={{ fontWeight: 600 }}>Reprendre la dernière conversation</span>
          <span
            style={{
              fontSize: 12,
              color: 'rgba(0, 0, 0, 0.5)',
              fontWeight: 400,
            }}
          >
            Dernière mise à jour : {formatRelativeDate(lastUpdate)}
          </span>
        </button>

        <button
          type="button"
          onClick={onNew}
          className="btn-choice"
          style={{ fontWeight: 600 }}
        >
          Commencer une nouvelle conversation
        </button>

        <Link
          href="/outils/conseiller"
          onClick={onClose}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            color: '#007AFF',
            textDecoration: 'none',
            padding: '4px 0',
            alignSelf: 'flex-start',
          }}
        >
          Voir l&apos;historique →
        </Link>

        <footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 18,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-secondary-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
        </footer>
      </section>
    </div>
  )
}
