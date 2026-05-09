// Sprint 33 §8.1 + §8.2 — Bouton primaire / secondaire iOS-strict
'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  children: ReactNode
}

export function Button({ variant = 'primary', children, className, style, ...rest }: ButtonProps) {
  const isPrimary = variant === 'primary'
  const baseStyle = {
    height: isPrimary ? 50 : 'auto',
    padding: isPrimary ? '0 24px' : '0 8px',
    borderRadius: 14,
    fontFamily: 'var(--font-system)',
    fontSize: 'var(--text-headline-size)',
    fontWeight: 600,
    letterSpacing: 'var(--text-headline-tracking)',
    transition: 'transform var(--duration-fast) var(--ease-out-quart), background-color var(--duration-fast) var(--ease-out-quart), opacity var(--duration-fast) var(--ease-out-quart)',
    backgroundColor: isPrimary ? 'var(--color-system-blue)' : 'transparent',
    color: isPrimary ? '#FFFFFF' : 'var(--color-system-blue)',
    border: 'none',
    cursor: 'pointer',
    ...style,
  } as const
  return (
    <button
      type="button"
      className={`cfs-button cfs-button--${variant} ${className ?? ''}`.trim()}
      style={baseStyle}
      {...rest}
    >
      {children}
    </button>
  )
}
