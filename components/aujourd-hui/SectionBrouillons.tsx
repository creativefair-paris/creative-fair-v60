// Sprint 36.C — Section "Brouillons" : stub V1.
// Table drafts non créée à ce sprint (reportée Sprint 37).
// Si pas de brouillon : la section disparaît, zéro placeholder.

type Props = {
  drafts: ReadonlyArray<{ id: string; titre: string }>
}

export function SectionBrouillons({ drafts }: Props) {
  if (drafts.length === 0) return null

  // Stub : structure DOM prête pour Sprint 37.
  return (
    <section style={{ marginBottom: 32 }}>
      {/* Section désactivée en V1. Réservée Sprint 37. */}
    </section>
  )
}
