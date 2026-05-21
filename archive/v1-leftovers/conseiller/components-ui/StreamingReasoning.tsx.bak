// Sprint 37 (Lot 2) — Streaming visible du raisonnement.
//
// Doc 09 §8 (décision Apple #46) — différenciant fort vs ChatGPT :
// pendant que le conseiller "pense" (15 à 45s), le pilote voit le
// raisonnement se construire à l'écran, élément par élément.
//
// Format des lignes :
//   * Ligne "in-progress" : "Je lis ton brand book..." (en cours)
//   * Ligne "done" : "✓ 3 piliers actifs détectés : Détail qui tue, ..."
//
// Mobile (décision Apple salve 3 — Hiroshi) : streaming plus verbal,
// l'écran étant plus vide il faut éviter le sentiment de page désertique.
// V1 : on rend la même séquence + une phrase d'accroche additionnelle
// passée en prop `mobileVerboseTitle` quand le viewport est mobile.

'use client'

import { useEffect, useState } from 'react'

export type ReasoningStep = {
  // Ligne "in-progress" affichée pendant que le step travaille.
  inProgress: string
  // Ligne "done" affichée une fois terminée. Si absente → la ligne
  // in-progress reste affichée sans check.
  done?: string
}

type Props = {
  // Steps à streamer. La séquence et la cadence sont contrôlées par le
  // parent (typiquement la server action côté Lot 6, ou un mock côté
  // dev). V1 : on consomme le tableau et on avance d'1 step toutes les
  // `intervalMs` ms tant que `running` est true.
  steps: ReadonlyArray<ReasoningStep>
  // Cadence d'avancement entre 2 steps (ms). Défaut 1200ms.
  intervalMs?: number
  // Si false, on fige l'animation au step courant sans avancer.
  running?: boolean
  // Phrase d'accroche additionnelle rendue seulement sur mobile pour
  // éviter le sentiment de page vide (décision Apple salve 3).
  mobileVerboseTitle?: string
}

export function StreamingReasoning({
  steps,
  intervalMs = 1200,
  running = true,
  mobileVerboseTitle,
}: Props) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!running) return
    if (index >= steps.length - 1) return
    const t = setTimeout(() => {
      setIndex((i) => Math.min(i + 1, steps.length - 1))
    }, intervalMs)
    return () => clearTimeout(t)
  }, [running, index, steps.length, intervalMs])

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontFamily: 'var(--font-system)',
        fontSize: 14,
        lineHeight: 1.6,
        color: 'var(--color-secondary-label)',
      }}
    >
      {mobileVerboseTitle ? (
        <p
          className="cfs-streaming-mobile-title"
          style={{
            margin: 0,
            marginBottom: 6,
            fontSize: 13,
            color: 'var(--color-tertiary-label)',
            fontStyle: 'italic',
          }}
        >
          {mobileVerboseTitle}
        </p>
      ) : null}

      {steps.slice(0, index + 1).map((step, i) => {
        const isCurrent = i === index && running
        const showDone = !isCurrent && step.done
        return (
          <div
            key={i}
            className="cfs-streaming-line"
            style={{
              opacity: 0,
              animation: 'cfs-streaming-line-in 320ms ease-out forwards',
              animationDelay: '0ms',
            }}
          >
            {showDone ? (
              <span style={{ color: 'var(--color-secondary-label)' }}>
                <span style={{ color: 'var(--color-accent)', marginRight: 6 }}>✓</span>
                {step.done}
              </span>
            ) : (
              <span style={{ color: 'var(--color-secondary-label)' }}>
                {step.inProgress}
                <span aria-hidden="true" className="cfs-streaming-cursor">
                  …
                </span>
              </span>
            )}
          </div>
        )
      })}

      <style>{`
        @keyframes cfs-streaming-line-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cfs-streaming-line {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
        @media (min-width: 768px) {
          .cfs-streaming-mobile-title { display: none; }
        }
      `}</style>
    </div>
  )
}
