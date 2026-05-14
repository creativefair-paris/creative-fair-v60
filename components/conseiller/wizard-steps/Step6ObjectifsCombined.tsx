// Sprint 37.E (F42+F43) — Wizard Step 6 : Objectifs (éditorial + business).
//
// 2 sections sur une seule étape : 1 objectif éditorial + 1 objectif
// business. Multi-select non — 1 seul par section. Champ libre alternatif.

'use client'

import { useState } from 'react'
import type {
  ObjectifEditorial,
  ObjectifBusiness,
} from '@/lib/programme-creation/types'

type Props = {
  initial: { objectif_editorial?: ObjectifEditorial; objectif_business?: ObjectifBusiness }
  editorialSuggestions: ReadonlyArray<ObjectifEditorial>
  onBack: () => void
  onSave: (params: { objectif_editorial?: ObjectifEditorial; objectif_business?: ObjectifBusiness }) => void
  saving?: boolean
}

const BUSINESS_PRESETS: ReadonlyArray<ObjectifBusiness> = [
  { value: 'Obtenir 3 demandes presse', source: 'preset' },
  { value: 'Augmenter les visites en galerie/showroom', source: 'preset' },
  { value: 'Préparer un lancement business', source: 'preset' },
  { value: 'Recevoir plus de DM clients qualifiés', source: 'preset' },
  { value: 'Provoquer une collaboration de marque', source: 'preset' },
]

export function Step6ObjectifsCombined({
  initial,
  editorialSuggestions,
  onBack,
  onSave,
  saving,
}: Props) {
  const [edito, setEdito] = useState<ObjectifEditorial | null>(initial.objectif_editorial ?? null)
  const [biz, setBiz] = useState<ObjectifBusiness | null>(initial.objectif_business ?? null)
  const [editoCustom, setEditoCustom] = useState('')
  const [bizCustom, setBizCustom] = useState('')

  function handleSave() {
    let finalEdito: ObjectifEditorial | undefined = edito ?? undefined
    if (!finalEdito && editoCustom.trim().length > 0) {
      finalEdito = { value: editoCustom.trim(), type: 'qualitatif', source: 'custom' }
    }
    let finalBiz: ObjectifBusiness | undefined = biz ?? undefined
    if (!finalBiz && bizCustom.trim().length > 0) {
      finalBiz = { value: bizCustom.trim(), source: 'custom' }
    }
    onSave({ objectif_editorial: finalEdito, objectif_business: finalBiz })
  }

  const canSave = !saving

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>Tes objectifs sur cette période</h2>
        <p style={descStyle}>
          Choisis ou rédige tes objectifs. Les deux dimensions comptent.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="cfs-objectifs-grid">
        {/* Objectif éditorial */}
        <section style={cardStyle}>
          <h3 style={cardTitleStyle}>Objectif éditorial</h3>
          <p style={cardHintStyle}>Ce que tu veux qu&apos;on comprenne de ta marque.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 8px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {editorialSuggestions.map((s, i) => {
              const sel = edito?.value === s.value
              return (
                <li key={`${s.value}-${i}`}>
                  <button
                    type="button"
                    onClick={() => { setEdito(s); setEditoCustom('') }}
                    aria-pressed={sel}
                    className="btn-choice"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      fontSize: 13,
                      background: sel ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
                      borderColor: sel ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
                    }}
                  >
                    {s.value}
                  </button>
                </li>
              )
            })}
          </ul>
          <input
            type="text"
            value={editoCustom}
            onChange={(e) => { setEditoCustom(e.target.value); if (e.target.value) setEdito(null) }}
            placeholder="Ou précise un autre objectif éditorial…"
            style={inputStyle}
          />
        </section>

        {/* Objectif business */}
        <section style={cardStyle}>
          <h3 style={cardTitleStyle}>Objectif business</h3>
          <p style={cardHintStyle}>Ce que tu veux obtenir concrètement.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 8px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {BUSINESS_PRESETS.map((s, i) => {
              const sel = biz?.value === s.value
              return (
                <li key={`${s.value}-${i}`}>
                  <button
                    type="button"
                    onClick={() => { setBiz(s); setBizCustom('') }}
                    aria-pressed={sel}
                    className="btn-choice"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      fontSize: 13,
                      background: sel ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
                      borderColor: sel ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
                    }}
                  >
                    {s.value}
                  </button>
                </li>
              )
            })}
          </ul>
          <input
            type="text"
            value={bizCustom}
            onChange={(e) => { setBizCustom(e.target.value); if (e.target.value) setBiz(null) }}
            placeholder="Ou précise un autre objectif business…"
            style={inputStyle}
          />
        </section>
      </div>

      <footer style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={onBack} className="btn-choice btn-choice-sm">
          Retour
        </button>
        <button type="button" onClick={handleSave} disabled={!canSave} className="btn-primary">
          {saving ? 'Enregistrement…' : 'Suivant'}
        </button>
      </footer>

      <style>{`
        @media (max-width: 720px) {
          .cfs-objectifs-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
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
const cardStyle: React.CSSProperties = {
  padding: '16px 18px',
  borderRadius: 14,
  border: '1px solid rgba(0, 0, 0, 0.06)',
  background: 'rgba(255, 255, 255, 0.5)',
  display: 'flex',
  flexDirection: 'column',
}
const cardTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--color-label)',
  margin: 0,
}
const cardHintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 13,
  color: 'var(--color-secondary-label)',
  margin: '4px 0 0 0',
}
const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid rgba(0, 0, 0, 0.08)',
  background: 'rgba(255, 255, 255, 0.7)',
  fontFamily: 'var(--font-system)',
  fontSize: 13,
  outline: 'none',
  width: '100%',
}
