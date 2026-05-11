// Sprint 36.B — Démo composant SplitBrief.
// Accessible uniquement via URL directe /dev/split-brief.
// PAS listée dans la NavigationBar. À retirer ou protéger en production.

import { SplitBriefDemoClient } from './SplitBriefDemoClient'

export const dynamic = 'force-static'

export default function SplitBriefDemoPage() {
  return <SplitBriefDemoClient />
}
