// Sprint 37.B (F16) — Barre de progression du wizard immersif.
//
// 3px de hauteur, fond rgba(0, 122, 255, 0.1), fill #007AFF qui
// progresse selon (current_step / total_steps). Transition 280ms
// ease-out.

type Props = {
  currentStep: number
  totalSteps: number
}

export function WizardProgressBar({ currentStep, totalSteps }: Props) {
  const pct = Math.max(0, Math.min(100, ((currentStep + 1) / totalSteps) * 100))
  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Étape ${currentStep + 1} sur ${totalSteps}`}
      style={{
        height: 3,
        background: 'rgba(0, 122, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: '#007AFF',
          transition: 'width 280ms ease-out',
        }}
      />
    </div>
  )
}
