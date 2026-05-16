// Sprint 37.K (F89) — PillarsManager : orchestrateur côté client.
//
// Affiche les piliers persistés (table `pillars`) sous forme de rangée
// horizontale scrollable + carte dashed "+" pour déclencher le wizard.
//
// Soft cap (5-7) → message d'avertissement. Hard cap (7) → carte "+" désactivée.

'use client'

import { useCallback, useMemo, useState } from 'react'
import { archivePillar, updatePillar } from '@/app/_actions/pillars'
import {
  PILLARS_HARD_CAP,
  PILLARS_SOFT_CAP_WARN,
  type PillarRow,
} from '@/lib/pillars/types'
import { PillarCard, PillarAddCard } from './PillarCard'
import { PillarWizardSheet } from './PillarWizardSheet'
import { PillarEditSheet } from './PillarEditSheet'

type Props = {
  brandId: string
  initialPillars: ReadonlyArray<PillarRow>
}

export function PillarsManager({ brandId, initialPillars }: Props) {
  const [pillars, setPillars] = useState<ReadonlyArray<PillarRow>>(initialPillars)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [editing, setEditing] = useState<PillarRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const count = pillars.length
  const atHardCap = count >= PILLARS_HARD_CAP
  const atSoftCap = count >= PILLARS_SOFT_CAP_WARN && count < PILLARS_HARD_CAP

  const sorted = useMemo(
    () => [...pillars].sort((a, b) => a.position - b.position),
    [pillars],
  )

  const handleArchive = useCallback(async (pillar: PillarRow) => {
    const confirmed = window.confirm(
      `Archiver « ${pillar.title} » ? Les posts existants restent reliés mais le pilier sort de la rotation.`,
    )
    if (!confirmed) return
    setBusy(true)
    setError(null)
    try {
      const res = await archivePillar(pillar.id)
      if (!res.ok) {
        setError(res.reason)
        return
      }
      setPillars((prev) => prev.filter((p) => p.id !== pillar.id))
    } finally {
      setBusy(false)
    }
  }, [])

  const handleEdit = useCallback((pillar: PillarRow) => {
    setEditing(pillar)
  }, [])

  const handleEditSave = useCallback(
    async (id: string, updates: { title: string; description: string }) => {
      setBusy(true)
      setError(null)
      try {
        const res = await updatePillar(id, updates)
        if (!res.ok) {
          setError(res.reason)
          return false
        }
        setPillars((prev) => prev.map((p) => (p.id === id ? res.pillar : p)))
        setEditing(null)
        return true
      } finally {
        setBusy(false)
      }
      return false
    },
    [],
  )

  const handleCreated = useCallback((pillar: PillarRow) => {
    setPillars((prev) => [...prev, pillar])
  }, [])

  return (
    <section
      aria-label="Tes piliers narratifs"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-system)',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--color-label)',
          }}
        >
          Tes piliers narratifs
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: 'var(--color-secondary-label)',
          }}
        >
          {count === 0
            ? "Tu n'as pas encore défini de pilier. Le conseiller t'aide en cinq questions."
            : `${count} pilier${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''} · cap conseillé ${PILLARS_HARD_CAP}.`}
        </p>
      </header>

      {atSoftCap ? (
        <p
          role="status"
          style={{
            margin: 0,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(255, 159, 10, 0.10)',
            border: '1px solid rgba(255, 159, 10, 0.30)',
            color: 'var(--color-label)',
            fontFamily: 'var(--font-system)',
            fontSize: 13,
          }}
        >
          Tu approches du cap. Au-delà de cinq piliers, ils se diluent — réfléchis avant d’en ajouter.
        </p>
      ) : null}

      {atHardCap ? (
        <p
          role="status"
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
          Maximum {PILLARS_HARD_CAP} piliers atteint. Archive un pilier pour en créer un nouveau.
        </p>
      ) : null}

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

      <div
        className="cfp-row"
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {sorted.map((p) => (
          <div key={p.id} style={{ scrollSnapAlign: 'start' }}>
            <PillarCard pillar={p} onEdit={handleEdit} onArchive={handleArchive} disabled={busy} />
          </div>
        ))}
        <div style={{ scrollSnapAlign: 'start' }}>
          <PillarAddCard
            onClick={() => setWizardOpen(true)}
            disabled={atHardCap || busy}
            label={count === 0 ? 'Définir mon premier pilier' : 'Ajouter un pilier'}
          />
        </div>
      </div>

      <PillarWizardSheet
        open={wizardOpen}
        brandId={brandId}
        onDismiss={() => setWizardOpen(false)}
        onCreated={handleCreated}
      />

      {editing ? (
        <PillarEditSheet
          pillar={editing}
          onDismiss={() => setEditing(null)}
          onSave={handleEditSave}
          saving={busy}
        />
      ) : null}
    </section>
  )
}
