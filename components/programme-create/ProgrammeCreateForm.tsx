// Sprint 37.D (F35b) — Formulaire natif de création de plan.
//
// 7 fieldsets correspondant aux 7 étapes du wizard A1. Soumission directe
// (pas de wizard). Bouton optionnel 'Préfère discuter avec le conseiller →'
// pour basculer vers le wizard immersif (route /programme?action=create-plan).

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generatePlanFromForm } from '@/app/_actions/generate-plan-from-form'
import type {
  CanonicalFormat,
  ObjectifEditorial,
  RiskCursor,
} from '@/lib/programme-creation/types'

// Sprint 37.G (F68) — Types des nouvelles étapes (alignés sur le wizard
// immersif Sprint 37.E). On les redéclare localement pour éviter d'imposer
// des imports lourds sur le client.
type MixMode = 'full_cf' | 'mixed'
type Cadence = 'discreet' | 'balanced' | 'dense'
type Engagement = 'prudent' | 'pose' | 'engage'

type PilierLite = { id: string; nom: string }

type Props = {
  pillarsCatalog: ReadonlyArray<PilierLite>
  businessAnchorSuggestions: ReadonlyArray<{ value: string }>
  publicationFrequency: 'discret' | 'equilibre' | 'dense' | null
}

const PERIOD_QUICK = [
  { label: '2 semaines', weeks: 2 },
  { label: '1 mois', weeks: 4 },
  { label: '6 semaines', weeks: 6 },
  { label: '2 mois', weeks: 8 },
  { label: '3 mois', weeks: 12 },
]

const SENSITIVE_CHOICES = [
  'Aucun sujet sensible',
  'Sujet politique en cours',
  'Crise interne récente',
  'Concurrent à éviter',
]

const RISK_OPTIONS: ReadonlyArray<{ value: RiskCursor; label: string; desc: string }> = [
  { value: 'safe', label: 'Safe', desc: 'Tu restes sur ton territoire signature.' },
  { value: 'moderate', label: 'Modéré', desc: '1 à 2 posts qui sortent du confort.' },
  { value: 'risky', label: 'Risqué', desc: '3 à 4 posts en exploration libre.' },
]

const FORMATS: ReadonlyArray<{ value: CanonicalFormat; label: string; color: string }> = [
  { value: 'anecdote', label: 'Anecdote', color: '#007AFF' },
  { value: 'produit', label: 'Produit', color: '#34C759' },
  { value: 'evenement', label: 'Événement', color: '#FF9500' },
  { value: 'coulisses', label: 'Coulisses', color: '#AF52DE' },
  { value: 'manifeste', label: 'Manifeste', color: '#FF3B30' },
  { value: 'question', label: 'Question', color: '#5856D6' },
]

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function ProgrammeCreateForm({
  pillarsCatalog,
  businessAnchorSuggestions,
}: Props) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Period
  const [periodMode, setPeriodMode] = useState<'quick' | 'custom' | null>(null)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  // Anchors
  const [selectedAnchors, setSelectedAnchors] = useState<ReadonlyArray<string>>([])
  const [customAnchor, setCustomAnchor] = useState('')
  const [noAnchors, setNoAnchors] = useState(false)

  // Sensitive
  const [sensitiveChoice, setSensitiveChoice] = useState<string | null>(null)
  const [sensitiveCustom, setSensitiveCustom] = useState('')
  const [sensitiveMode, setSensitiveMode] = useState<'quick' | 'custom'>('quick')

  // Sprint 37.G (F68) — Nouvelles étapes alignées wizard immersif :

  // MixMode (NEW étape 2 — F45 Sprint 37.E)
  const [mixMode, setMixMode] = useState<MixMode>('full_cf')

  // Pillars weights (legacy gardé pour le backend qui s'attend à ce format ;
  // les sliders ne sont plus affichés en V1 page native, on envoie l'équilibre
  // par défaut. Sprint 37.H si besoin de granularité côté page native.)
  const [pillarsWeights] = useState<Record<string, number>>(() => {
    const out: Record<string, number> = {}
    pillarsCatalog.forEach((p) => {
      out[p.id] = Math.floor(100 / Math.max(1, pillarsCatalog.length))
    })
    return out
  })

  // Rythme + Engagement (NEW étape 5 — F39+F40 fusion Sprint 37.E)
  const [cadence, setCadence] = useState<Cadence>('balanced')
  const [engagement, setEngagement] = useState<Engagement>('pose')

  // Mapping engagement → riskCursor legacy pour la server action existante.
  const risk: RiskCursor =
    engagement === 'prudent' ? 'safe' : engagement === 'engage' ? 'risky' : 'moderate'

  // Objectif éditorial + business (NEW étape 6 — F42+F43 fusion Sprint 37.E)
  const [objectifEditoText, setObjectifEditoText] = useState('')
  const [objectifBusinessText, setObjectifBusinessText] = useState('')

  // Formats
  const [formats, setFormats] = useState<ReadonlyArray<CanonicalFormat>>([])

  function handleQuickPeriod(weeks: number) {
    const today = new Date()
    const end = new Date(today)
    end.setDate(end.getDate() + weeks * 7)
    setPeriodStart(isoDate(today))
    setPeriodEnd(isoDate(end))
    setPeriodMode('quick')
  }

  function toggleAnchor(value: string) {
    if (selectedAnchors.includes(value)) {
      setSelectedAnchors(selectedAnchors.filter((v) => v !== value))
    } else {
      setSelectedAnchors([...selectedAnchors, value])
      setNoAnchors(false)
    }
  }

  function toggleFormat(f: CanonicalFormat) {
    if (formats.includes(f)) {
      setFormats(formats.filter((x) => x !== f))
    } else if (formats.length < 3) {
      setFormats([...formats, f])
    }
  }

  const isComplete =
    periodStart !== '' &&
    periodEnd !== '' &&
    new Date(periodStart) < new Date(periodEnd) &&
    (noAnchors || selectedAnchors.length > 0 || customAnchor.trim().length > 0) &&
    (sensitiveChoice !== null || sensitiveCustom.trim().length > 0) &&
    formats.length > 0

  async function handleSubmit() {
    setError(null)
    setGenerating(true)
    try {
      const anchors = [...selectedAnchors]
      const custom = customAnchor.trim()
      if (custom && !anchors.includes(custom)) anchors.push(custom)

      const sensitiveTopics = sensitiveMode === 'custom'
        ? sensitiveCustom.trim()
        : sensitiveChoice ?? ''

      // Sprint 37.G (F68) — concatène objectif édito + business dans le
      // tableau objectifs (la server action existante n'a qu'un seul champ
      // legacy ; les 2 sont préservés pour le sub-prompt).
      const objs: ObjectifEditorial[] = []
      if (objectifEditoText.trim().length > 0) {
        objs.push({ value: objectifEditoText.trim(), type: 'qualitatif', source: 'custom' })
      }
      if (objectifBusinessText.trim().length > 0) {
        objs.push({ value: objectifBusinessText.trim(), type: 'quantitatif', source: 'custom' })
      }
      const objectifs: ReadonlyArray<ObjectifEditorial> = objs

      const result = await generatePlanFromForm({
        periodStart,
        periodEnd,
        businessAnchors: anchors,
        sensitiveTopics,
        pillarsWeights,
        riskCursor: risk,
        objectifs,
        formats,
      })
      if (!result.ok) {
        setError(result.reason)
        setGenerating(false)
        return
      }
      router.push(`/programme?newPlan=${result.programmeId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setGenerating(false)
    }
  }

  if (generating) {
    return (
      <section
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: '80px 20px',
          textAlign: 'center',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '3px solid rgba(0, 122, 255, 0.15)',
            borderTopColor: '#007AFF',
            animation: 'cfs-spin 800ms linear infinite',
          }}
        />
        <p style={{ fontSize: 16, fontWeight: 500, margin: 0, maxWidth: 320 }}>
          Je construis ton plan. Ça peut prendre 30 secondes.
        </p>
        <style>{`
          @keyframes cfs-spin { to { transform: rotate(360deg); } }
          @media (prefers-reduced-motion: reduce) {
            [role="status"] span { animation: none !important; }
          }
        `}</style>
      </section>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--color-label)',
            margin: 0,
          }}
        >
          Créer mon programme
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 15,
            color: 'var(--color-secondary-label)',
            margin: 0,
          }}
        >
          Remplis les questions ou laisse le conseiller t&apos;accompagner.
        </p>
        <button
          type="button"
          onClick={() => router.push('/programme?action=create-plan')}
          className="btn-choice"
          style={{
            alignSelf: 'flex-start',
            marginTop: 4,
            padding: '8px 14px',
            background: 'rgba(0, 122, 255, 0.06)',
            borderColor: 'rgba(0, 122, 255, 0.18)',
            color: '#007AFF',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Préfère discuter avec le conseiller →
        </button>
      </header>

      {error ? (
        <p
          role="alert"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: '#C0392B',
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(192, 57, 43, 0.06)',
            border: '1px solid rgba(192, 57, 43, 0.15)',
            margin: 0,
          }}
        >
          {error}
        </p>
      ) : null}

      {/* 1. Période */}
      <Fieldset legend="Sur quelle période veux-tu construire ce plan ?">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PERIOD_QUICK.map((opt) => {
            const selected = periodMode === 'quick' && periodEnd && periodStart && (() => {
              const days = Math.round((new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / 86400000)
              return Math.abs(days - opt.weeks * 7) < 2
            })()
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleQuickPeriod(opt.weeks)}
                aria-pressed={Boolean(selected)}
                className="btn-choice"
                style={{
                  padding: '8px 14px',
                  background: selected ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
                  borderColor: selected ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setPeriodMode('custom')}
            aria-pressed={periodMode === 'custom'}
            className="btn-choice"
            style={{
              padding: '8px 14px',
              background: periodMode === 'custom' ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
              borderColor: periodMode === 'custom' ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
            }}
          >
            Préciser des dates →
          </button>
        </div>
        {periodMode === 'custom' ? (
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} style={inputStyle} />
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} style={inputStyle} />
          </div>
        ) : null}
        {periodStart && periodEnd ? (
          <p style={hintStyle}>Du {periodStart} au {periodEnd}.</p>
        ) : null}
      </Fieldset>

      {/* Sprint 37.G (F68) — Étape 2 Mix CF / externe (F45 Sprint 37.E). */}
      <Fieldset legend="Comment veux-tu construire ce programme ?">
        <p style={hintStyle}>
          100% Creative Fair (rapide, efficace) ou mixé avec contenu externe
          (complexe, ultra efficace).
        </p>
        <div
          className="cfs-mix-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 12 }}
        >
          {([
            {
              value: 'full_cf' as MixMode,
              title: '100% Creative Fair',
              tag: 'Rapide et efficace',
              desc: 'Le conseiller génère tout le programme à partir de ta marque et ta bibliothèque.',
            },
            {
              value: 'mixed' as MixMode,
              title: 'Mix avec contenu externe',
              tag: 'Complexe mais ultra efficace',
              desc: "Tu intègres tes propres créations (off-app) dans le programme.",
            },
          ]).map((opt) => {
            const sel = mixMode === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMixMode(opt.value)}
                aria-pressed={sel}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: sel ? '1px solid rgba(0, 122, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.06)',
                  background: sel ? 'rgba(0, 122, 255, 0.06)' : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#007AFF',
                  }}
                >
                  {opt.tag}
                </span>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-label)' }}>
                  {opt.title}
                </span>
                <span style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(0, 0, 0, 0.7)' }}>
                  {opt.desc}
                </span>
              </button>
            )
          })}
        </div>
        <style>{`
          @media (max-width: 560px) {
            .cfs-mix-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </Fieldset>

      {/* 3. Ancres business */}
      <Fieldset legend="As-tu des événements business sur cette période ?">
        {businessAnchorSuggestions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {businessAnchorSuggestions.map((s) => {
              const selected = selectedAnchors.includes(s.value)
              return (
                <label
                  key={s.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: selected ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
                  }}
                >
                  <input type="checkbox" checked={selected} onChange={() => toggleAnchor(s.value)} />
                  <span style={{ fontSize: 14 }}>{s.value}</span>
                </label>
              )
            })}
          </div>
        ) : null}
        <input
          type="text"
          placeholder="Ajouter manuellement un événement…"
          value={customAnchor}
          onChange={(e) => { setCustomAnchor(e.target.value); setNoAnchors(false) }}
          style={{ ...inputStyle, marginTop: 8 }}
        />
        <button
          type="button"
          onClick={() => { setNoAnchors(true); setSelectedAnchors([]); setCustomAnchor('') }}
          className="btn-choice"
          aria-pressed={noAnchors}
          style={{
            alignSelf: 'flex-start',
            marginTop: 8,
            padding: '8px 14px',
            background: noAnchors ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            borderColor: 'rgba(0, 0, 0, 0.08)',
            color: 'var(--color-secondary-label)',
            fontSize: 13,
          }}
        >
          Aucun événement à signaler
        </button>
      </Fieldset>

      {/* 3. Sujets sensibles */}
      <Fieldset legend="Y a-t-il un sujet sensible à éviter ce mois-ci ?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SENSITIVE_CHOICES.map((c) => (
            <label key={c} style={radioRowStyle(sensitiveMode === 'quick' && sensitiveChoice === c)}>
              <input
                type="radio"
                name="sensitive"
                checked={sensitiveMode === 'quick' && sensitiveChoice === c}
                onChange={() => { setSensitiveMode('quick'); setSensitiveChoice(c) }}
              />
              <span style={{ fontSize: 14 }}>{c}</span>
            </label>
          ))}
          <label style={radioRowStyle(sensitiveMode === 'custom')}>
            <input
              type="radio"
              name="sensitive"
              checked={sensitiveMode === 'custom'}
              onChange={() => { setSensitiveMode('custom'); setSensitiveChoice(null) }}
            />
            <span style={{ fontSize: 14 }}>Préciser…</span>
          </label>
        </div>
        {sensitiveMode === 'custom' ? (
          <textarea
            value={sensitiveCustom}
            onChange={(e) => setSensitiveCustom(e.target.value)}
            placeholder="Une thématique sensible, un sujet d'actualité à éviter, etc."
            rows={3}
            style={{ ...inputStyle, marginTop: 8, resize: 'vertical' }}
          />
        ) : null}
      </Fieldset>

      {/* Sprint 37.G (F68) — Étape 5 Rythme + niveau d'engagement (F39+F40
          fusion Sprint 37.E). Remplace l'ancienne étape "Curseur de risque". */}
      <Fieldset legend="Rythme et niveau d'engagement">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <span style={subTitleStyle}>Cadence de publication</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {([
                { value: 'discreet', label: 'Discret', desc: '1-2 / sem' },
                { value: 'balanced', label: 'Équilibré', desc: '2-4 / sem' },
                { value: 'dense', label: 'Dense', desc: '5-7 / sem' },
              ] as const).map((opt) => (
                <label key={opt.value} style={radioRowStyle(cadence === opt.value)}>
                  <input
                    type="radio"
                    name="cadence"
                    checked={cadence === opt.value}
                    onChange={() => setCadence(opt.value)}
                  />
                  <span style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>{opt.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-secondary-label)' }}>{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <span style={subTitleStyle}>Niveau d&apos;engagement éditorial</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {([
                { value: 'prudent', label: 'Prudent', desc: 'On évite les clivages.' },
                { value: 'pose', label: 'Posé', desc: 'On prend position calmement.' },
                { value: 'engage', label: 'Engagé', desc: 'On assume les prises fortes.' },
              ] as const).map((opt) => (
                <label key={opt.value} style={radioRowStyle(engagement === opt.value)}>
                  <input
                    type="radio"
                    name="engagement"
                    checked={engagement === opt.value}
                    onChange={() => setEngagement(opt.value)}
                  />
                  <span style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>{opt.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-secondary-label)' }}>{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Fieldset>

      {/* Sprint 37.G (F68) — Étape 6 Objectifs combinés (F42+F43 fusion). */}
      <Fieldset legend="Tes objectifs sur cette période">
        <p style={{ fontSize: 13, color: 'var(--color-secondary-label)', margin: '0 0 12px 0' }}>
          Choisis ou rédige tes objectifs. Les deux dimensions comptent.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="cfs-objectifs-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={subTitleStyle}>Objectif éditorial</label>
            <input
              type="text"
              value={objectifEditoText}
              onChange={(e) => setObjectifEditoText(e.target.value)}
              placeholder="Ex. Renforcer la perception expertise sur le pilier Coulisses."
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={subTitleStyle}>Objectif business</label>
            <input
              type="text"
              value={objectifBusinessText}
              onChange={(e) => setObjectifBusinessText(e.target.value)}
              placeholder="Ex. Obtenir 3 demandes presse."
              style={inputStyle}
            />
          </div>
        </div>
        <style>{`
          @media (max-width: 720px) {
            .cfs-objectifs-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </Fieldset>

      {/* 7. Formats */}
      <Fieldset legend="Quels formats dominants ? (1 à 3)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {FORMATS.map((f) => {
            const selected = formats.includes(f.value)
            const disabled = !selected && formats.length >= 3
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => toggleFormat(f.value)}
                disabled={disabled}
                aria-pressed={selected}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: selected ? '1px solid rgba(0, 122, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.06)',
                  background: selected ? 'rgba(0, 122, 255, 0.06)' : 'rgba(255, 255, 255, 0.6)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 9px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#FFFFFF',
                    background: f.color,
                  }}
                >
                  {f.label}
                </span>
              </button>
            )
          })}
        </div>
      </Fieldset>

      <footer style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isComplete}
          className="btn-primary"
        >
          Générer mon plan
        </button>
      </footer>
    </div>
  )
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset
      style={{
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: 14,
        padding: '20px 22px',
        margin: 0,
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <legend
        style={{
          padding: '0 8px',
          fontFamily: 'var(--font-system)',
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--color-label)',
        }}
      >
        {legend}
      </legend>
      {children}
    </fieldset>
  )
}

function radioRowStyle(selected: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    background: selected ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
  }
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(0, 0, 0, 0.08)',
  background: 'rgba(255, 255, 255, 0.6)',
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  color: 'var(--color-label)',
  outline: 'none',
  width: '100%',
}

const hintStyle: React.CSSProperties = {
  marginTop: 6,
  fontFamily: 'var(--font-system)',
  fontSize: 13,
  color: 'var(--color-secondary-label)',
}

// Sprint 37.G (F68) — Style sous-titre dans les fieldsets multi-sections.
const subTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-tertiary-label)',
}
