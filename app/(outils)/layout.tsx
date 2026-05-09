import type { ReactNode } from 'react'

export default function OutilsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <main className="flex-1">{children}</main>
    </div>
  )
}
