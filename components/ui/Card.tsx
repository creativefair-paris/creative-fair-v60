// Sprint 33 §8.3 — Card de contenu (Apple-strict)
import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div className={`cfs-card ${className ?? ''}`.trim()} {...rest}>
      {children}
    </div>
  )
}
