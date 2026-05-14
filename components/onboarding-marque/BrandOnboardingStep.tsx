// Sprint 37.C (F18) — Dispatcher des 14 étapes du wizard guidé Ma Marque.
//
// Pattern compact : au lieu de 14 fichiers séparés, un seul dispatcher
// qui rend l'étape adaptée avec des primitives réutilisables
// (TextField, TextAreaField, TagsField). Les réponses pré-remplies par
// le conseiller seront ajoutées Sprint 38+ via un fetch côté serveur.

'use client'

import { useState, type ReactNode } from 'react'
import type {
  BrandOnboardingResponses,
  BrandOnboardingStepIndex,
} from '@/lib/brand-onboarding/types'

type StepProps = {
  stepIndex: BrandOnboardingStepIndex
  responses: BrandOnboardingResponses
  saving: boolean
  isLastStep: boolean
  criticalAnswered: boolean
  onBack: () => void
  onSave: (stepIndex: number, key: string, value: unknown) => void
  onComplete: () => void
}

export function BrandOnboardingStep(props: StepProps) {
  const { stepIndex } = props
  const r = props.responses

  // Sprint 37.E (F59) — Wizard ramené à 4 étapes critiques.
  switch (stepIndex) {
    case 0:
      return (
        <Step0Identity
          initialNom={r['0']?.nom ?? ''}
          initialDesc={r['0']?.description_courte ?? ''}
          {...props}
        />
      )
    case 1:
      return (
        <SingleTextArea
          {...props}
          title="Qui est ton audience cible principale ?"
          desc="Profil sociologique, attentes, comportements. Sois précis."
          placeholder="Ex. Femmes 35-55, CSP+, déjà clientes joaillerie haute, attachées à la matière brute, lectrices Le Monde M Magazine."
          initial={r['1']?.audience_principale ?? ''}
          responseKey="1"
          fieldKey="audience_principale"
        />
      )
    case 2:
      return (
        <Step5Piliers
          initial={r['2']?.piliers ?? []}
          responseKey="2"
          {...props}
        />
      )
    case 3:
      return (
        <Step6Ton
          initialAdjectifs={r['3']?.ton_adjectifs ?? []}
          initialTexte={r['3']?.ton_texte ?? ''}
          responseKey="3"
          {...props}
        />
      )
    default:
      return null
  }
}

// ── Step 0 — Identité ────────────────────────────────────────────────────

function Step0Identity({
  initialNom,
  initialDesc,
  saving,
  onSave,
  onComplete,
  isLastStep,
}: {
  initialNom: string
  initialDesc: string
} & StepProps) {
  const [nom, setNom] = useState(initialNom)
  const [desc, setDesc] = useState(initialDesc)
  return (
    <StepShell
      title="Comment s'appelle ta marque ?"
      desc="Le nom officiel + une description courte (1-2 phrases)."
      onBack={null}
      onNext={() => onSave(0, '0', { nom, description_courte: desc })}
      onComplete={isLastStep ? onComplete : null}
      saving={saving}
      canContinue={nom.trim().length > 0}
    >
      <TextField label="Nom de la marque" value={nom} onChange={setNom} />
      <TextAreaField
        label="Description courte"
        value={desc}
        onChange={setDesc}
        placeholder="Ex. Maison de joaillerie héritière fondée en 1923 à Paris."
      />
    </StepShell>
  )
}

// ── SingleTextArea (steps 1, 2, 3, 4, 10) ────────────────────────────────

function SingleTextArea(props: StepProps & {
  title: string
  desc: string
  placeholder: string
  initial: string
  responseKey: string
  fieldKey: string
  allowSkip?: boolean
}) {
  const [value, setValue] = useState(props.initial)
  const stepIdx = parseInt(props.responseKey, 10)
  return (
    <StepShell
      title={props.title}
      desc={props.desc}
      onBack={props.onBack}
      onNext={() => props.onSave(stepIdx, props.responseKey, { [props.fieldKey]: value })}
      onComplete={props.isLastStep ? props.onComplete : null}
      saving={props.saving}
      canContinue={props.allowSkip || value.trim().length > 0}
    >
      <TextAreaField value={value} onChange={setValue} placeholder={props.placeholder} rows={5} />
      {props.allowSkip ? (
        <button
          type="button"
          onClick={() => props.onSave(stepIdx, props.responseKey, { [props.fieldKey]: '' })}
          className="btn-choice"
          style={{ alignSelf: 'flex-start', marginTop: 4 }}
        >
          Passer cette étape
        </button>
      ) : null}
    </StepShell>
  )
}

// ── TagsList (steps 7, 8, 9, 11, 12) ─────────────────────────────────────

function TagsList(props: StepProps & {
  title: string
  desc: string
  placeholder: string
  initial: ReadonlyArray<string>
  responseKey: string
  fieldKey: string
}) {
  const [tags, setTags] = useState<ReadonlyArray<string>>(props.initial)
  const [input, setInput] = useState('')
  const stepIdx = parseInt(props.responseKey, 10)

  function addTag() {
    const v = input.trim()
    if (!v || tags.includes(v)) return
    setTags([...tags, v])
    setInput('')
  }
  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t))
  }

  return (
    <StepShell
      title={props.title}
      desc={props.desc}
      onBack={props.onBack}
      onNext={() => props.onSave(stepIdx, props.responseKey, { [props.fieldKey]: tags })}
      onComplete={props.isLastStep ? props.onComplete : null}
      saving={props.saving}
      canContinue={true}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={props.placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          style={inputStyle}
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim()}
          className="btn-choice"
          style={{ padding: '10px 14px' }}
        >
          Ajouter
        </button>
      </div>
      {tags.length > 0 ? (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {tags.map((t) => (
            <li key={t}>
              <button
                type="button"
                onClick={() => removeTag(t)}
                style={tagStyle}
                aria-label={`Retirer ${t}`}
              >
                <span>{t}</span>
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </StepShell>
  )
}

// ── Step 5 — Piliers narratifs ───────────────────────────────────────────

function Step5Piliers(props: StepProps & {
  initial: ReadonlyArray<{ nom: string; description?: string }>
  responseKey: string
}) {
  const [piliers, setPiliers] = useState<ReadonlyArray<{ nom: string; description?: string }>>(
    props.initial.length > 0 ? props.initial : [{ nom: '' }, { nom: '' }, { nom: '' }],
  )

  function updatePilier(i: number, patch: Partial<{ nom: string; description?: string }>) {
    setPiliers(piliers.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  }

  const canContinue = piliers.filter((p) => p.nom.trim().length > 0).length >= 1

  return (
    <StepShell
      title="Tes 3 piliers narratifs"
      desc="Les territoires de contenu signature de ta marque. Le conseiller s'en sert pour structurer chaque programme."
      onBack={props.onBack}
      onNext={() => {
        const cleaned = piliers.filter((p) => p.nom.trim().length > 0)
        const idx = parseInt(props.responseKey, 10)
        props.onSave(idx, props.responseKey, { piliers: cleaned })
      }}
      onComplete={props.isLastStep ? props.onComplete : null}
      saving={props.saving}
      canContinue={canContinue}
    >
      {piliers.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '14px 16px',
            background: 'rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: 12,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-tertiary-label)' }}>
            Pilier {i + 1}
          </span>
          <TextField
            label="Nom du pilier"
            value={p.nom}
            onChange={(v) => updatePilier(i, { nom: v })}
            placeholder={i === 0 ? 'Ex. Détail qui tue' : i === 1 ? 'Ex. Querelles de créateurs' : 'Ex. Accident génial'}
          />
          <TextAreaField
            label="Description (optionnel)"
            value={p.description ?? ''}
            onChange={(v) => updatePilier(i, { description: v })}
            placeholder="En 1-2 phrases : pourquoi ce pilier, comment il se manifeste."
            rows={2}
          />
        </div>
      ))}
    </StepShell>
  )
}

// ── Step 6 — Ton de voix ─────────────────────────────────────────────────

const TON_ADJECTIFS_OPTIONS = [
  'sang-froid',
  'documenté',
  'chaleureux',
  'précis',
  'narratif',
  'sobre',
  'érudit',
  'tranchant',
  'doux',
  'fier',
]

function Step6Ton(props: StepProps & {
  initialAdjectifs: ReadonlyArray<string>
  initialTexte: string
  responseKey: string
}) {
  const [adjectifs, setAdjectifs] = useState<ReadonlyArray<string>>(props.initialAdjectifs)
  const [texte, setTexte] = useState(props.initialTexte)

  function toggleAdj(a: string) {
    if (adjectifs.includes(a)) setAdjectifs(adjectifs.filter((x) => x !== a))
    else if (adjectifs.length < 3) setAdjectifs([...adjectifs, a])
  }

  return (
    <StepShell
      title="Quel est ton ton de voix ?"
      desc="Coche jusqu'à 3 adjectifs + décris en 1-2 phrases comment ta marque parle."
      onBack={props.onBack}
      onNext={() => {
        const idx = parseInt(props.responseKey, 10)
        props.onSave(idx, props.responseKey, { ton_adjectifs: adjectifs, ton_texte: texte })
      }}
      onComplete={props.isLastStep ? props.onComplete : null}
      saving={props.saving}
      canContinue={adjectifs.length > 0 || texte.trim().length > 0}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {TON_ADJECTIFS_OPTIONS.map((a) => {
          const selected = adjectifs.includes(a)
          const disabled = !selected && adjectifs.length >= 3
          return (
            <button
              key={a}
              type="button"
              onClick={() => toggleAdj(a)}
              disabled={disabled}
              className="btn-choice"
              style={{
                padding: '8px 14px',
                background: selected ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.06)',
                borderColor: selected ? 'rgba(0, 122, 255, 0.5)' : 'rgba(0, 122, 255, 0.18)',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {a}
            </button>
          )
        })}
      </div>
      <TextAreaField
        label="Comment ta marque parle ?"
        value={texte}
        onChange={setTexte}
        placeholder="Ex. Phrases courtes, jamais d'exclamation. Pas de marketing. On affirme, on documente."
        rows={4}
      />
    </StepShell>
  )
}

// ── Step 13 — Chiffres initiaux (sub-flow A8) ───────────────────────────

function Step13Chiffres(props: StepProps) {
  return (
    <StepShell
      title="Tes chiffres actuels (optionnel)"
      desc="Tu peux renseigner tes chiffres maintenant avec le conseiller, ou y revenir plus tard depuis /programme/retombees."
      onBack={props.onBack}
      onNext={null}
      onComplete={() => {
        props.onSave(13, '13', { chiffres_renseignes: false })
        props.onComplete()
      }}
      saving={props.saving}
      canContinue={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <a
          href="/outils/conseiller?scenario=A8"
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Renseigner avec le conseiller →
        </a>
        <button
          type="button"
          onClick={() => {
            props.onSave(13, '13', { chiffres_renseignes: false })
            props.onComplete()
          }}
          className="btn-choice"
        >
          Passer et terminer
        </button>
      </div>
    </StepShell>
  )
}

// ── Primitives ───────────────────────────────────────────────────────────

function StepShell({
  title,
  desc,
  children,
  onBack,
  onNext,
  onComplete,
  saving,
  canContinue,
}: {
  title: string
  desc: string
  children: ReactNode
  onBack: (() => void) | null
  onNext: (() => void) | null
  onComplete: (() => void) | null
  saving: boolean
  canContinue: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={titleStyle}>{title}</h2>
        <p style={descStyle}>{desc}</p>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
      <footer style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        {onBack ? (
          <button type="button" onClick={onBack} className="btn-choice" disabled={saving}>
            Retour
          </button>
        ) : <span />}
        {onComplete ? (
          <button
            type="button"
            onClick={onComplete}
            className="btn-primary"
            disabled={!canContinue || saving}
          >
            {saving ? 'Enregistrement…' : 'Terminer'}
          </button>
        ) : onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="btn-primary"
            disabled={!canContinue || saving}
          >
            {saving ? 'Enregistrement…' : 'Suivant'}
          </button>
        ) : null}
      </footer>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={labelStyle}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label ? <span style={labelStyle}>{label}</span> : null}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
      />
    </label>
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
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-tertiary-label)',
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(0, 0, 0, 0.08)',
  background: 'rgba(255, 255, 255, 0.6)',
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  color: 'var(--color-label)',
  outline: 'none',
}
const tagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 12,
  border: '1px solid rgba(0, 122, 255, 0.18)',
  background: 'rgba(0, 122, 255, 0.08)',
  color: 'var(--color-label)',
  fontFamily: 'var(--font-system)',
  fontSize: 13,
  cursor: 'pointer',
}
