// Sprint 34 — Step individuel onboarding (input texte ou textarea)
'use client'

import { useEffect, useId, useRef } from 'react'

type OnboardingStepProps = {
  question: string
  value: string
  onChange: (next: string) => void
  multiline?: boolean
  placeholder?: string
  maxLength?: number
  rows?: number
}

export function OnboardingStep({
  question,
  value,
  onChange,
  multiline = false,
  placeholder,
  maxLength,
  rows = 4,
}: OnboardingStepProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [question])

  const sharedStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid var(--color-separator)',
    borderRadius: 'var(--radius-medium)',
    backgroundColor: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    fontFamily: 'var(--font-system)',
    fontSize: 'var(--text-body-size)',
    letterSpacing: 'var(--text-body-tracking)',
    color: 'var(--color-label)',
    outline: 'none',
    transition: 'border-color var(--duration-fast) var(--ease-out-quart), box-shadow var(--duration-fast) var(--ease-out-quart)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <label
        htmlFor={id}
        className="text-title-1"
        style={{ color: 'var(--color-label)', fontWeight: 600, lineHeight: 1.2 }}
      >
        {question}
      </label>

      {multiline ? (
        <textarea
          ref={(el) => {
            inputRef.current = el
          }}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className="cfs-onboarding-input"
          style={{ ...sharedStyle, resize: 'none' }}
        />
      ) : (
        <input
          ref={(el) => {
            inputRef.current = el
          }}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="cfs-onboarding-input"
          style={sharedStyle}
        />
      )}
    </div>
  )
}
