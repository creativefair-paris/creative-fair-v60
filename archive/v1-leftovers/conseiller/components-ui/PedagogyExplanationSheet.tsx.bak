// Sprint 37.E (F47+F53) — Mini-sheet de pédagogie post-génération.
//
// Affichée AVANT le PlanPreview après génération du plan. 4-6 raisons
// expliquant les choix du conseiller. C'est le wow effect Creative Fair.

'use client'

import { useEffect, useState } from 'react'
import {
  generatePedagogyExplanations,
  type PedagogyExplanation,
} from '@/app/_actions/generate-pedagogy'

type Props = {
  programmeId: string
  onContinue: () => void
}

export function PedagogyExplanationSheet({ programmeId, onContinue }: Props) {
  const [explanations, setExplanations] = useState<ReadonlyArray<PedagogyExplanation>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    generatePedagogyExplanations(programmeId)
      .then((res) => {
        if (cancelled) return
        if (res.ok) {
          setExplanations(res.explanations)
        } else {
          setError(res.reason)
        }
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [programmeId])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pedagogy-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1250,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(251, 250, 247, 0.98)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        animation: 'cfs-pedagogy-in 280ms ease-out',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          padding: '24px 28px',
          background: 'rgba(251, 250, 247, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-tertiary-label)',
          }}
        >
          Le conseiller te parle
        </span>
        <h1
          id="pedagogy-title"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: 'var(--color-label)',
            margin: 0,
            lineHeight: 1.25,
          }}
        >
          Voilà comment j’ai construit ton plan
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: 'var(--color-secondary-label)',
            lineHeight: 1.5,
          }}
        >
          Quelques choix méritent d’être expliqués.
        </p>
      </header>

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 28px 60px',
        }}
      >
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {loading ? (
            <div
              role="status"
              aria-live="polite"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                padding: '60px 20px',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '3px solid rgba(0, 122, 255, 0.15)',
                  borderTopColor: '#007AFF',
                  animation: 'cfs-spin 800ms linear infinite',
                }}
              />
              <p style={{ fontSize: 14, color: 'var(--color-secondary-label)', margin: 0 }}>
                Je résume mes choix…
              </p>
            </div>
          ) : error ? (
            <p
              role="alert"
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(192, 57, 43, 0.06)',
                border: '1px solid rgba(192, 57, 43, 0.15)',
                fontSize: 14,
                color: '#C0392B',
                margin: 0,
              }}
            >
              Je n’ai pas pu résumer mes choix : {error}. Tu peux passer directement au plan.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {explanations.map((exp, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: '18px 20px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      color: '#007AFF',
                      fontSize: 14,
                      marginTop: 2,
                    }}
                  >
                    ◆
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily: 'var(--font-system)',
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'var(--color-label)',
                        lineHeight: 1.3,
                      }}
                    >
                      {exp.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: 'var(--font-system)',
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: 'rgba(0, 0, 0, 0.75)',
                      }}
                    >
                      {exp.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer
        style={{
          padding: '20px 28px',
          background: 'rgba(251, 250, 247, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={loading}
          className="btn-primary"
        >
          Voir le plan en détail →
        </button>
      </footer>

      <style>{`
        @keyframes cfs-pedagogy-in {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes cfs-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"] { animation: none !important; }
          [role="status"] span { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
