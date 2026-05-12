// Sprint 36.C — Item unifié de tâche (post à préparer, bloc Ma Marque prioritaire,
// brouillon). Pastille left + titre + sous-titre. iOS Settings vibes.

'use client'

import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'

export type TaskStatus = 'aujourdhui' | 'semaine' | 'brouillon'

type Props = {
  status: TaskStatus
  title: string
  subtitle?: string
  href?: string
  onActivate?: () => void
}

export function TaskItem({ status, title, subtitle, href, onActivate }: Props) {
  const router = useRouter()
  const handleClick = () => {
    if (onActivate) {
      onActivate()
      return
    }
    if (href) router.push(href)
  }

  const bulletStyle: CSSProperties = (() => {
    if (status === 'aujourdhui') {
      return { background: '#1C1C1E' }
    }
    if (status === 'semaine') {
      return { background: 'transparent', border: '1.5px solid rgba(0,0,0,0.30)' }
    }
    // brouillon : pastille demi-violet (gradient stop net 50%).
    return {
      background: 'linear-gradient(to right, #AB47BC 0%, #AB47BC 50%, transparent 50%, transparent 100%)',
      border: '1.5px solid rgba(171,71,188,0.45)',
    }
  })()

  return (
    <button
      type="button"
      onClick={handleClick}
      className="cfs-task-item"
      aria-label={subtitle ? `${title} — ${subtitle}` : title}
    >
      <span className="cfs-task-bullet" style={bulletStyle} aria-hidden="true" />
      <span className="cfs-task-content">
        <span className="cfs-task-title">{title}</span>
        {subtitle ? <span className="cfs-task-subtitle">{subtitle}</span> : null}
      </span>
    </button>
  )
}
