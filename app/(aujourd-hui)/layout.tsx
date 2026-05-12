// Sprint 36.C — Layout du groupe /aujourd-hui (nouvelle home).
// Pattern identique aux groupes (programme), (ma-marque), (outils) :
// shell vertical avec <main flex-1> pour stretch + main landmark unique.

import type { ReactNode } from 'react'

export default function AujourdhuiLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <main className="flex-1">{children}</main>
    </div>
  )
}
