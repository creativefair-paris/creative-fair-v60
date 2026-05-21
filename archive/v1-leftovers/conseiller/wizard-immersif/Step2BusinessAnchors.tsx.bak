// Sprint 37.B (F16) — Wizard Step 2 : Ancres business.
//
// V1 : suggestions hydratées par le caller (pas d'appel streaming
// Anthropic — décision pragmatique V1, l'enrichissement streaming
// est laissé pour Sprint 38, cf. decisions.md). Le pilote coche +
// peut ajouter un texte libre.

'use client'

import { useState } from 'react'
import { SuggestionPicker } from './SuggestionPicker'
import type { WizardSuggestion } from '@/lib/programme-creation/types'

type Props = {
  suggestions: ReadonlyArray<WizardSuggestion>
  initialAnchors: ReadonlyArray<string>
  onBack: () => void
  onSave: (anchors: string[]) => void
  saving?: boolean
}

export function Step2BusinessAnchors({
  suggestions,
  initialAnchors,
  onBack,
  onSave,
  saving,
}: Props) {
  const [selected, setSelected] = useState<string[]>([...initialAnchors])
  const [free, setFree] = useState('')

  function handleSave() {
    const all = [...selected]
    const trimmed = free.trim()
    if (trimmed.length > 0 && !all.includes(trimmed)) all.push(trimmed)
    onSave(all)
  }

  // Sprint 37.D (F33) — bouton "Aucun événement à signaler" qui valide
  // explicitement une période sans ancre business (le conseiller n'a
  // alors pas d'ancre à intégrer dans le plan).
  function handleNoAnchors() {
    setSelected([])
    setFree('')
    onSave([])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>
          As-tu des événements business sur cette période ?
        </h2>
        <p style={descStyle}>
          Coche les événements pertinents. Le conseiller s&apos;en servira comme
          ancres pour ton plan.
        </p>
      </header>

      <SuggestionPicker
        suggestions={suggestions}
        selected={selected}
        onSelectedChange={setSelected}
        freeText={free}
        onFreeTextChange={setFree}
        freeTextPlaceholder="Un autre événement à ajouter…"
      />

      <button
        type="button"
        onClick={handleNoAnchors}
        disabled={saving}
        className="btn-choice"
        style={{
          alignSelf: 'flex-start',
          padding: '10px 16px',
          background: 'rgba(0, 0, 0, 0.04)',
          borderColor: 'rgba(0, 0, 0, 0.08)',
          color: 'var(--color-secondary-label)',
        }}
      >
        Aucun événement à signaler
      </button>

      <footer style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={onBack} className="btn-choice btn-choice-sm">
          Retour
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Enregistrement…' : 'Suivant'}
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
