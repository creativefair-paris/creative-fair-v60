// Sprint 37.K (F89) — Sheet édition rapide d'un pilier existant.
//
// Ouvert au click sur une PillarCard. Permet d'éditer title + description.
// La validation 3 mots est appliquée côté UI (et côté server action).

'use client'

import { useState } from 'react'
import { Sheet } from '@/components/layout/Sheet'
import type { PillarRow } from '@/lib/pillars/types'

type Props = {
  pillar: PillarRow
  onDismiss: () => void
  onSave: (id: string, updates: { title: string; description: string }) => Promise<boolean>
  saving: boolean
}

export function PillarEditSheet({ pillar, onDismiss, onSave, saving }: Props) {
  const [title, setTitle] = useState(pillar.title)
  const [description, setDescription] = useState(pillar.description)
  const [error, setError] = useState<string | null>(null)

  const wordCount = title.trim().split(/\s+/).filter((w) => w.length > 0).length

  const handleSave = async () => {
    setError(null)
    const t = title.trim()
    const d = description.trim()
    if (!t) {
      setError('Donne un titre à ton pilier.')
      return
    }
    if (wordCount > 3) {
      setError('Le titre fait plus de 3 mots — resserre.')
      return
    }
    if (!d) {
      setError('La description ne peut pas être vide.')
      return
    }
    await onSave(pillar.id, { title: t, description: d })
  }

  return (
    <Sheet open={true} title="Affiner ce pilier" onDismiss={onDismiss}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-label)',
            }}
          >
            Titre <span style={{ color: 'var(--color-tertiary-label)', fontWeight: 400 }}>(3 mots max)</span>
          </span>
          <input
            type="text"
            value={title}
            maxLength={50}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${wordCount > 3 ? 'rgba(255, 59, 48, 0.5)' : 'rgba(0, 0, 0, 0.12)'}`,
              background: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'var(--font-system)',
              fontSize: 15,
              color: 'var(--color-label)',
              outline: 'none',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 11,
              color: wordCount > 3 ? '#FF3B30' : 'var(--color-tertiary-label)',
            }}
          >
            {wordCount} / 3 mots
          </span>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-label)',
            }}
          >
            Description <span style={{ color: 'var(--color-tertiary-label)', fontWeight: 400 }}>(2-3 phrases)</span>
          </span>
          <textarea
            value={description}
            maxLength={500}
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid rgba(0, 0, 0, 0.12)',
              background: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              color: 'var(--color-label)',
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 11,
              color: 'var(--color-tertiary-label)',
            }}
          >
            {description.length} / 500
          </span>
        </label>

        {error ? (
          <p
            role="alert"
            style={{
              margin: 0,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(255, 59, 48, 0.08)',
              border: '1px solid rgba(255, 59, 48, 0.25)',
              color: 'var(--color-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 13,
            }}
          >
            {error}
          </p>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button
            type="button"
            onClick={onDismiss}
            disabled={saving}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: '1px solid rgba(0, 0, 0, 0.12)',
              background: 'transparent',
              color: 'var(--color-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#007AFF',
              color: '#FFFFFF',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </Sheet>
  )
}
