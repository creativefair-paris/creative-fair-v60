// Sprint 37.F (F46) — Étape conditionnelle "Définir tes piliers".
//
// Insérée dans le wizard programme à l'index 4 quand brand.piliers_narratifs
// est vide. Le conseiller propose 3 piliers (server action proposePiliers),
// le pilote peut éditer ou valider.

'use client'

import { useEffect, useState } from 'react'
import { proposePiliers, updateBrandPiliers } from '@/app/_actions/propose-piliers'

type Props = {
  // Piliers déjà proposés (si on revient à cette étape, pas besoin de re-fetch).
  initial: ReadonlyArray<string>
  onBack: () => void
  // Si validé, on enregistre dans brand + onSave avec la liste finale.
  onSave: (piliers: ReadonlyArray<string>) => void
  // Si "Continuer sans définir", on saute sans persister.
  onSkip: () => void
  saving?: boolean
}

export function Step5DefinirPiliers({
  initial,
  onBack,
  onSave,
  onSkip,
  saving,
}: Props) {
  const [suggestions, setSuggestions] = useState<ReadonlyArray<string>>(initial)
  const [edited, setEdited] = useState<string[]>(() =>
    initial.length === 3 ? [...initial] : ['', '', ''],
  )
  const [loading, setLoading] = useState(initial.length !== 3)
  const [persistError, setPersistError] = useState<string | null>(null)
  const [persisting, setPersisting] = useState(false)

  useEffect(() => {
    if (initial.length === 3) return
    let cancelled = false
    setLoading(true)
    proposePiliers()
      .then((res) => {
        if (cancelled) return
        if (res.ok) {
          setSuggestions(res.piliers)
          setEdited([...res.piliers])
        } else {
          // Fallback : 3 piliers vides à remplir manuellement.
          setSuggestions([])
          setEdited(['', '', ''])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([])
          setEdited(['', '', ''])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [initial.length])

  const allFilled = edited.every((p) => p.trim().length > 0)
  const canValidate = allFilled && !persisting && !saving

  async function handleValidate() {
    setPersistError(null)
    setPersisting(true)
    try {
      const cleaned = edited.map((p) => p.trim())
      const res = await updateBrandPiliers(cleaned)
      if (!res.ok) {
        setPersistError(res.reason)
        setPersisting(false)
        return
      }
      onSave(cleaned)
    } catch (err) {
      setPersistError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setPersisting(false)
    }
  }

  function updatePilier(idx: number, value: string) {
    setEdited(edited.map((p, i) => (i === idx ? value : p)))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Définissons tes piliers narratifs</h2>
        <p style={descStyle}>
          Les piliers structurent tout ce que tu raconteras. Voici 3 piliers que
          j&apos;ai dérivés de ta marque. Tu peux les valider, les éditer, ou en
          proposer d&apos;autres.
        </p>
      </header>

      {loading ? (
        <section
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            padding: '40px 20px',
            textAlign: 'center',
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
            Je réfléchis à tes piliers…
          </p>
          <style>{`
            @keyframes cfs-spin { to { transform: rotate(360deg); } }
          `}</style>
        </section>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {edited.map((p, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '14px 16px',
                background: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: 12,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-tertiary-label)',
                }}
              >
                Pilier {idx + 1}
              </span>
              <input
                type="text"
                value={p}
                onChange={(e) => updatePilier(idx, e.target.value)}
                placeholder={suggestions[idx] ?? 'Ex. Le détail qui tue'}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      )}

      {persistError ? (
        <p
          role="alert"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: '#C0392B',
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(192, 57, 43, 0.06)',
            margin: 0,
          }}
        >
          {persistError}
        </p>
      ) : null}

      <footer style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onBack} className="btn-choice btn-choice-sm" disabled={persisting || saving}>
            Retour
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={persisting || saving}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-secondary-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Continuer sans définir les piliers
          </button>
        </div>
        <button
          type="button"
          onClick={handleValidate}
          disabled={!canValidate}
          className="btn-primary"
        >
          {persisting || saving ? 'Enregistrement…' : 'Valider ces piliers'}
        </button>
      </footer>
    </div>
  )
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--color-label)',
  margin: 0,
  letterSpacing: '-0.01em',
  lineHeight: 1.3,
}
const descStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--color-secondary-label)',
  margin: 0,
}
const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid rgba(0, 0, 0, 0.08)',
  background: 'rgba(255, 255, 255, 0.7)',
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  color: 'var(--color-label)',
  outline: 'none',
  width: '100%',
}
