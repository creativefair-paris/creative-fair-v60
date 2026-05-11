// Sprint 36.B.1 — Sheet d'édition d'un bloc de Ma Marque.
// PATCH /api/brand/update avec le mapping colonne DB approprié.
// L'UI affiche le label "Voix", la DB stocke dans "ton".
'use client'

import { useState } from 'react'
import { Sheet } from '@/components/layout/Sheet'

export type BrandFieldColumn = 'name' | 'secteur' | 'ton' | 'singularite'

type EditBlocSheetProps = {
  open: boolean
  onClose: () => void
  labelUI: string
  columnName: BrandFieldColumn
  currentValue: string
  maxLength: number
  multiline?: boolean
  onSaved: (newValue: string) => void
}

export function EditBlocSheet({
  open,
  onClose,
  labelUI,
  columnName,
  currentValue,
  maxLength,
  multiline = false,
  onSaved,
}: EditBlocSheetProps) {
  // Pattern React : on dérive l'état du prop `open` en comparant avec sa valeur
  // précédente. Ainsi à chaque ré-ouverture (open passe de false à true) on
  // réinitialise les champs locaux sans recourir à useEffect+setState.
  const [prevOpen, setPrevOpen] = useState(open)
  const [localValue, setLocalValue] = useState(currentValue)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setLocalValue(currentValue)
      setError(null)
      setSaving(false)
    }
  }

  async function handleSave() {
    const trimmed = localValue.trim()
    if (trimmed.length === 0) {
      setError('La valeur ne peut pas être vide.')
      return
    }
    if (trimmed.length > maxLength) {
      setError(`Longueur max ${maxLength} caractères.`)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: columnName, value: trimmed }),
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { detail?: string; error?: string }
          | null
        setError(data?.detail ?? 'La sauvegarde a échoué.')
        setSaving(false)
        return
      }
      onSaved(trimmed)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur réseau.'
      setError(message)
      setSaving(false)
    }
  }

  function handleCancel() {
    if (saving) return
    onClose()
  }

  return (
    <Sheet open={open} title={`Modifier ${labelUI}`} onDismiss={handleCancel}>
      <div className="cfs-edit-bloc">
        {multiline ? (
          <textarea
            className="cfs-edit-bloc__input glass-thin"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            maxLength={maxLength}
            rows={4}
            disabled={saving}
            aria-label={labelUI}
          />
        ) : (
          <input
            type="text"
            className="cfs-edit-bloc__input glass-thin"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            maxLength={maxLength}
            disabled={saving}
            aria-label={labelUI}
          />
        )}

        <p className="cfs-edit-bloc__counter">
          {localValue.length} / {maxLength}
        </p>

        {error ? <p className="cfs-edit-bloc__error">{error}</p> : null}

        <div className="cfs-edit-bloc__actions">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="cfs-edit-bloc__btn glass-thin"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="cfs-edit-bloc__btn cfs-edit-bloc__btn-primary glass-thin"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </Sheet>
  )
}
