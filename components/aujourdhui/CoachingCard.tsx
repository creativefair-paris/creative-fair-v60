import type { ReactNode } from 'react'

export type DailyCoaching = {
  id: string
  date: string
  content: { text: string; suggestions?: string[] }
  business_context: string | null
  read_at: string | null
}

type Props = {
  coaching: DailyCoaching | null
  generateAction?: ReactNode
}

export function CoachingCard({ coaching, generateAction }: Props) {
  if (!coaching) {
    return (
      <section
        className="rounded-2xl px-8 py-10 space-y-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Ton coaching du jour est en préparation
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          Il arrivera chaque matin à 8h.
        </p>
        {generateAction && <div className="pt-2">{generateAction}</div>}
      </section>
    )
  }

  const { content, business_context } = coaching

  return (
    <section
      className="rounded-2xl px-8 py-8 space-y-5"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <p
        className="leading-relaxed whitespace-pre-line"
        style={{
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          fontSize: '17px',
          lineHeight: 1.6,
        }}
      >
        {content.text}
      </p>

      {content.suggestions && content.suggestions.length > 0 && (
        <ul className="space-y-2 pt-2">
          {content.suggestions.map((s, i) => (
            <li
              key={i}
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}

      {business_context && (
        <p
          className="text-xs pt-1"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          Adapté à ton calendrier · {business_context}
        </p>
      )}
    </section>
  )
}
