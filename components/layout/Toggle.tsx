// Stub Sprint 32.5 — finalisation Sprint 33 (§8.7 du cahier)

type ToggleProps = {
  value: 'programme' | 'outils'
  onChange?: (value: 'programme' | 'outils') => void
}

export function Toggle({ value }: ToggleProps) {
  return (
    <div role="tablist" aria-label="Mode" className="inline-flex">
      <span aria-current={value === 'programme' ? 'true' : 'false'}>Programme</span>
      <span aria-current={value === 'outils' ? 'true' : 'false'}>Outils</span>
    </div>
  )
}
