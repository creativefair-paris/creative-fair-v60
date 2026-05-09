// Stub Sprint 32.5 — finalisation Sprint 33 (NavigationBar iOS large title)
import type { ReactNode } from 'react'

type NavigationBarProps = {
  title: string
  trailing?: ReactNode
}

export function NavigationBar({ title, trailing }: NavigationBarProps) {
  return (
    <header className="px-6 pt-12 pb-4">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {trailing != null ? <div>{trailing}</div> : null}
      </div>
    </header>
  )
}
