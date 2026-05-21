// Sprint 37.E (F47+F53) — Wrapper client qui affiche la sheet de
// pédagogie post-génération en overlay au-dessus de /programme quand
// le query param ?newPlan=ID est présent.
//
// Apparait au mount, disparaît au clic "Voir le plan en détail →" du
// pilote, révélant le PlanPreview en dessous.

'use client'

import { useState } from 'react'
import { PedagogyExplanationSheet } from '@/components/conseiller/PedagogyExplanationSheet'

type Props = {
  programmeId: string
}

export function NewPlanPedagogyOverlay({ programmeId }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <PedagogyExplanationSheet
      programmeId={programmeId}
      onContinue={() => setDismissed(true)}
    />
  )
}
