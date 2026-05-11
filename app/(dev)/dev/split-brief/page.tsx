// Sprint 36.B — Démo composant SplitBrief.
// Accessible uniquement via URL directe /dev/split-brief.
// PAS listée dans la NavigationBar. À retirer ou protéger en production.
//
// Sprint 36.B.1 — NavigationBar devient async server : on la rend depuis
// la page server, le client gère uniquement l'ouverture du Split Brief.

import { NavigationBar } from '@/components/layout/NavigationBar'
import { SplitBriefDemoClient } from './SplitBriefDemoClient'

export const dynamic = 'force-dynamic'

export default function SplitBriefDemoPage() {
  return (
    <div
      className="min-h-screen"
      style={{ position: 'relative', background: 'var(--color-background)' }}
    >
      <div className="bg-halo bg-halo-1" aria-hidden="true" />
      <div className="bg-halo bg-halo-2" aria-hidden="true" />
      <div className="bg-halo bg-halo-3" aria-hidden="true" />
      <div className="bg-halo bg-halo-4" aria-hidden="true" />
      <div className="bg-halo bg-halo-5" aria-hidden="true" />
      <div className="bg-halo bg-halo-6" aria-hidden="true" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <NavigationBar title="Démo Split Brief" />
        <SplitBriefDemoClient />
      </div>
    </div>
  )
}
