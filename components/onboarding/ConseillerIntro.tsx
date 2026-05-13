// Sprint 37 (Lot 1) — Mini-onboarding du conseiller.
//
// 3 écrans skippables présentés à la fin de l'onboarding initial (après
// les 4 questions marque + persona + curseur fréquence). Doctrine
// doc 09 §8 (sous-section "Mini-onboarding du conseiller", décision
// Apple #51).
//
// Sortie écran 3 :
//   * "Créer mon plan" → /programme?action=create-plan (sheet création
//                        ouverte automatiquement par /programme — Lot 4)
//   * "Plus tard"     → /aujourd-hui
//
// Note implémentation : la route /programme est l'identité technique de
// la destination "Mon Programme" du user-menu. Doc 09 dit /mon-programme
// au sens du label produit, pas du slug Next.js. Cf. decisions.md.

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

type Screen = {
  title: string
  body: string
  illustration: 'sheet' | 'bubble' | 'plan'
}

const SCREENS: ReadonlyArray<Screen> = [
  {
    title: 'Voici ton conseiller.',
    body:
      "Tu peux le solliciter partout dans l'app. Il connaît ta marque, tes piliers, ton calendrier.",
    illustration: 'sheet',
  },
  {
    title: 'Il propose. Tu décides.',
    body:
      "Il ne publie jamais à ta place. Il prépare des briefs pour ta direction quand c'est nécessaire.",
    illustration: 'bubble',
  },
  {
    title: 'Prêt à poser ton premier plan ?',
    body:
      "Choisis une période, le conseiller t'accompagne.",
    illustration: 'plan',
  },
] as const

function Illustration({ kind }: { kind: Screen['illustration'] }) {
  // Illustrations sobres, sans couleur agressive, dans la palette crème.
  // Lots futurs pourront remplacer par de vraies captures stylisées.
  const surface: React.CSSProperties = {
    width: '100%',
    maxWidth: 320,
    height: 180,
    margin: '0 auto',
    borderRadius: 16,
    border: '1px solid var(--color-separator)',
    backgroundColor: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '14px 16px',
    gap: 8,
  }

  if (kind === 'sheet') {
    return (
      <div style={surface} aria-hidden="true">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: '#007AFF',
              boxShadow: '0 0 0 3px rgba(0, 122, 255, 0.18)',
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--color-tertiary-label)' }}>
            Sur. Post jeudi 14h
          </span>
        </div>
        <div style={{ height: 8, width: '70%', background: 'var(--color-separator)', borderRadius: 4 }} />
        <div style={{ height: 8, width: '55%', background: 'var(--color-separator)', borderRadius: 4 }} />
        <div style={{ height: 8, width: '62%', background: 'var(--color-separator)', borderRadius: 4 }} />
      </div>
    )
  }

  if (kind === 'bubble') {
    return (
      <div style={surface} aria-hidden="true">
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            background: '#007AFF',
            marginBottom: 4,
          }}
        />
        <div style={{ height: 8, width: '80%', background: 'var(--color-separator)', borderRadius: 4 }} />
        <div style={{ height: 8, width: '65%', background: 'var(--color-separator)', borderRadius: 4 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {['Option A', 'Option B', 'Option C'].map((label) => (
            <div
              key={label}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--color-separator)',
                fontSize: 11,
                color: 'var(--color-secondary-label)',
                background: 'rgba(255,255,255,0.5)',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 'plan'
  return (
    <div style={surface} aria-hidden="true">
      <span style={{ fontSize: 11, color: 'var(--color-tertiary-label)' }}>
        Période · 15 juin → 13 juillet
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginTop: 6 }}>
        {Array.from({ length: 21 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 16,
              borderRadius: 4,
              background:
                i % 4 === 0
                  ? 'rgba(31, 73, 55, 0.45)'
                  : 'var(--color-separator)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function ConseillerIntro() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const screen = SCREENS[index]!
  const isLast = index === SCREENS.length - 1

  function handleSkip() {
    router.push('/aujourd-hui')
  }

  function handleNext() {
    if (!isLast) {
      setIndex(index + 1)
    }
  }

  function handleCreatePlan() {
    router.push('/programme?action=create-plan')
  }

  function handleLater() {
    router.push('/aujourd-hui')
  }

  return (
    <section
      aria-label="Présentation du conseiller"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <div
        aria-hidden="true"
        style={{ display: 'flex', justifyContent: 'center', gap: 6 }}
      >
        {SCREENS.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === index ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background:
                i === index ? 'var(--color-accent)' : 'var(--color-separator)',
              transition: 'width var(--duration-fast) var(--ease-out-quart)',
            }}
          />
        ))}
      </div>

      <Illustration kind={screen.illustration} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h1
          className="text-title-1"
          style={{
            color: 'var(--color-label)',
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {screen.title}
        </h1>
        <p
          className="text-body"
          style={{
            color: 'var(--color-secondary-label)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {screen.body}
        </p>
      </div>

      {isLast ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <Button onClick={handleCreatePlan}>créer mon plan</Button>
          <button
            type="button"
            onClick={handleLater}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-secondary-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              cursor: 'pointer',
              padding: '8px 12px',
            }}
          >
            plus tard
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <Button onClick={handleNext}>suivant</Button>
          <button
            type="button"
            onClick={handleSkip}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-secondary-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              cursor: 'pointer',
              padding: '8px 12px',
            }}
          >
            passer
          </button>
        </div>
      )}
    </section>
  )
}
