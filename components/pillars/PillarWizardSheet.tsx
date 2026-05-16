// Sprint 37.K (F89) — Wizard pilier 3 étapes (sheet bottom glass-thick).
//
// Étapes :
//   1. Questions : 5 questions guidées (Sonnet 4.6) — pilote répond ce qu'il veut.
//   2. Propositions : 3 piliers proposés (Sonnet 4.6) — pilote en choisit 1.
//   3. Edit : title + description éditables, validation 3 mots.
//
// La persistance (createPillar) se fait à la validation finale étape 3.

'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sheet } from '@/components/layout/Sheet'
import {
  generatePillarQuestions,
  generatePillarPropositions,
  type PillarQuestion,
  type PillarProposition,
  type QuestionAnswer,
} from '@/app/_actions/generate-pillar-wizard'
import { createPillar } from '@/app/_actions/pillars'
import type { PillarRow } from '@/lib/pillars/types'

type Props = {
  open: boolean
  brandId: string
  onDismiss: () => void
  onCreated: (pillar: PillarRow) => void
}

type Step = 'questions' | 'propositions' | 'edit'

type EditDraft = {
  title: string
  description: string
}

export function PillarWizardSheet({ open, brandId, onDismiss, onCreated }: Props) {
  const [step, setStep] = useState<Step>('questions')

  // Étape 1
  const [questions, setQuestions] = useState<ReadonlyArray<PillarQuestion>>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  // Étape 2
  const [propositions, setPropositions] = useState<ReadonlyArray<PillarProposition>>([])
  const [loadingPropositions, setLoadingPropositions] = useState(false)

  // Étape 3
  const [draft, setDraft] = useState<EditDraft>({ title: '', description: '' })
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Reset + charge questions à l'ouverture.
  useEffect(() => {
    if (!open) return
    setStep('questions')
    setQuestions([])
    setAnswers({})
    setPropositions([])
    setDraft({ title: '', description: '' })
    setError(null)

    let cancelled = false
    setLoadingQuestions(true)
    generatePillarQuestions(brandId)
      .then((res) => {
        if (cancelled) return
        if (!res.ok) {
          setError(res.reason)
          return
        }
        setQuestions(res.questions)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Échec de génération')
      })
      .finally(() => {
        if (!cancelled) setLoadingQuestions(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, brandId])

  const handleSubmitAnswers = useCallback(async () => {
    setError(null)
    const qa: QuestionAnswer[] = questions
      .map((q) => ({ label: q.label, answer: (answers[q.id] ?? '').trim() }))
      .filter((q) => q.answer.length > 0)
    if (qa.length < 1) {
      setError('Réponds à au moins une question pour continuer.')
      return
    }
    setLoadingPropositions(true)
    try {
      const res = await generatePillarPropositions(brandId, qa)
      if (!res.ok) {
        setError(res.reason)
        return
      }
      setPropositions(res.propositions)
      setStep('propositions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de génération')
    } finally {
      setLoadingPropositions(false)
    }
  }, [questions, answers, brandId])

  const handlePickProposition = useCallback((p: PillarProposition) => {
    setDraft({ title: p.title, description: p.description })
    setStep('edit')
    setError(null)
  }, [])

  const handleSave = useCallback(async () => {
    setError(null)
    const title = draft.title.trim()
    const description = draft.description.trim()
    if (!title) {
      setError('Donne un titre à ton pilier.')
      return
    }
    const wordCount = title.split(/\s+/).filter((w) => w.length > 0).length
    if (wordCount > 3) {
      setError('Le titre fait plus de 3 mots — resserre.')
      return
    }
    if (!description) {
      setError('La description ne peut pas être vide.')
      return
    }

    // Conserve les questions/réponses pour audit.
    const qaPayload: Record<string, string> = {}
    for (const q of questions) {
      const a = (answers[q.id] ?? '').trim()
      if (a) qaPayload[q.label.slice(0, 200)] = a.slice(0, 800)
    }

    setSaving(true)
    try {
      const res = await createPillar({
        brandId,
        title,
        description,
        questionsAnswers: Object.keys(qaPayload).length > 0 ? qaPayload : undefined,
      })
      if (!res.ok) {
        setError(res.reason)
        return
      }
      onCreated(res.pillar)
      onDismiss()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible')
    } finally {
      setSaving(false)
    }
  }, [draft, questions, answers, brandId, onCreated, onDismiss])

  return (
    <Sheet open={open} title={titleFor(step)} onDismiss={onDismiss}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
        {step === 'questions' ? (
          <QuestionsStep
            loading={loadingQuestions}
            questions={questions}
            answers={answers}
            onChange={(id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))}
            onContinue={handleSubmitAnswers}
            loadingNext={loadingPropositions}
          />
        ) : null}

        {step === 'propositions' ? (
          <PropositionsStep
            propositions={propositions}
            onPick={handlePickProposition}
            onBack={() => setStep('questions')}
          />
        ) : null}

        {step === 'edit' ? (
          <EditStep
            draft={draft}
            onChange={setDraft}
            saving={saving}
            onSave={handleSave}
            onBack={() => setStep('propositions')}
          />
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
      </div>
    </Sheet>
  )
}

function titleFor(step: Step): string {
  switch (step) {
    case 'questions':
      return 'Creusons ton nouveau pilier'
    case 'propositions':
      return 'Trois pistes à explorer'
    case 'edit':
      return 'Affine ton pilier'
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────────────────────────────────────

function QuestionsStep(props: {
  loading: boolean
  questions: ReadonlyArray<PillarQuestion>
  answers: Record<string, string>
  onChange: (id: string, value: string) => void
  onContinue: () => void
  loadingNext: boolean
}) {
  const { loading, questions, answers, onChange, onContinue, loadingNext } = props

  if (loading) {
    return <LoadingBlock label="Le conseiller prépare cinq questions sur mesure…" />
  }
  if (questions.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--font-system)', fontSize: 14, color: 'var(--color-secondary-label)' }}>
        Aucune question disponible pour l’instant.
      </p>
    )
  }
  return (
    <>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          lineHeight: 1.5,
          color: 'var(--color-secondary-label)',
        }}
      >
        Réponds à celles qui te parlent. Une réponse suffit pour avancer.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {questions.map((q) => (
          <label key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-label)',
              }}
            >
              {q.label}
            </span>
            <textarea
              value={answers[q.id] ?? ''}
              onChange={(e) => onChange(q.id, e.target.value)}
              placeholder={q.placeholder}
              rows={2}
              style={{
                width: '100%',
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
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <PrimaryButton onClick={onContinue} disabled={loadingNext}>
          {loadingNext ? 'Génération…' : 'Voir les pistes'}
        </PrimaryButton>
      </div>
    </>
  )
}

function PropositionsStep(props: {
  propositions: ReadonlyArray<PillarProposition>
  onPick: (p: PillarProposition) => void
  onBack: () => void
}) {
  const { propositions, onPick, onBack } = props
  return (
    <>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          lineHeight: 1.5,
          color: 'var(--color-secondary-label)',
        }}
      >
        Choisis la piste qui te parle. Tu pourras l’ajuster avant de l’enregistrer.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {propositions.map((p, i) => (
          <button
            key={`${i}-${p.title}`}
            type="button"
            onClick={() => onPick(p)}
            style={{
              textAlign: 'left',
              padding: 14,
              borderRadius: 12,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              cursor: 'pointer',
              fontFamily: 'var(--font-system)',
              transition: 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1), border-color 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-label)' }}>
              {p.title}
            </span>
            <span
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: 'var(--color-secondary-label)',
              }}
            >
              {p.description}
            </span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <SecondaryButton onClick={onBack}>Retour aux questions</SecondaryButton>
      </div>
    </>
  )
}

function EditStep(props: {
  draft: EditDraft
  onChange: (next: EditDraft) => void
  saving: boolean
  onSave: () => void
  onBack: () => void
}) {
  const { draft, onChange, saving, onSave, onBack } = props
  const wordCount = draft.title.trim().split(/\s+/).filter((w) => w.length > 0).length
  return (
    <>
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
          value={draft.title}
          maxLength={50}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          placeholder="L'accident génial"
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
          value={draft.description}
          maxLength={500}
          rows={4}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          placeholder="L'angle, ce qu'on filme/montre/raconte concrètement."
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
          {draft.description.length} / 500
        </span>
      </label>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <SecondaryButton onClick={onBack} disabled={saving}>
          Retour
        </SecondaryButton>
        <PrimaryButton onClick={onSave} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer le pilier'}
        </PrimaryButton>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────

function LoadingBlock({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          border: '2px solid rgba(0, 0, 0, 0.1)',
          borderTopColor: '#007AFF',
          animation: 'cfp-spin 0.8s linear infinite',
        }}
      />
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          color: 'var(--color-secondary-label)',
          textAlign: 'center',
        }}
      >
        {label}
      </p>
      <style>{`@keyframes cfp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function PrimaryButton(props: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      style={{
        padding: '10px 18px',
        borderRadius: 8,
        border: 'none',
        background: '#007AFF',
        color: '#FFFFFF',
        fontFamily: 'var(--font-system)',
        fontSize: 14,
        fontWeight: 600,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.5 : 1,
      }}
    >
      {props.children}
    </button>
  )
}

function SecondaryButton(props: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      style={{
        padding: '10px 18px',
        borderRadius: 8,
        border: '1px solid rgba(0, 0, 0, 0.12)',
        background: 'transparent',
        color: 'var(--color-label)',
        fontFamily: 'var(--font-system)',
        fontSize: 14,
        fontWeight: 500,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.5 : 1,
      }}
    >
      {props.children}
    </button>
  )
}
