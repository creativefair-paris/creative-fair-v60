// Sprint 34 — Barre de progression onboarding (fine, sans numérotation visible)
type OnboardingProgressProps = {
  current: number
  total: number
}

export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
  const ratio = Math.max(0, Math.min(1, current / total))
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Étape ${current} sur ${total}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          backgroundColor: 'var(--color-separator)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${ratio * 100}%`,
            backgroundColor: 'var(--color-system-blue)',
            borderRadius: 2,
            transition: 'width var(--duration-medium) var(--ease-out-quart)',
          }}
        />
      </div>
      <span
        className="text-caption-1"
        style={{ color: 'var(--color-secondary-label)', minWidth: 36, textAlign: 'right' }}
      >
        {current}/{total}
      </span>
    </div>
  )
}
