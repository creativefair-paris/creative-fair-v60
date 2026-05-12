// Sprint 36.B.3 → 36.B.5 — Hero gauche de /programme en Split Brief 40/60.
//
// Patches Sprint 36.B.5 :
//   - Breadcrumb et H1 "Mon Programme" portés désormais par PageHeader
//     (au-dessus du Split Brief). Le Hero démarre directement avec
//     l'intro contextuelle.

'use client'

import Link from 'next/link'
import type { PilierNarratif } from '@/types/programme'
import { ChipsPiliersActifs } from './ChipsPiliersActifs'

type Props = {
  arcNarratif: string
  piliers: PilierNarratif[]
  couleurs: readonly string[]
  numeroSemaine: number
  pilierDominantNom: string | null
  onVoirPost: () => void
}

export function ProgrammeHero({
  arcNarratif,
  piliers,
  couleurs,
  numeroSemaine,
  pilierDominantNom,
  onVoirPost,
}: Props) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 15,
          lineHeight: 1.6,
          color: 'rgba(0,0,0,0.55)',
          margin: 0,
          maxWidth: 480,
        }}
      >
        Voici comment Creative Fair a interprété ta marque cette semaine.
      </p>

      <h2
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 26,
          lineHeight: 1.25,
          fontWeight: 600,
          letterSpacing: '-0.018em',
          color: '#1C1C1E',
          margin: 0,
        }}
      >
        {arcNarratif || 'Ton programme prend forme cette semaine.'}
      </h2>

      <ChipsPiliersActifs
        piliers={piliers}
        couleurs={couleurs}
        pilierDominantNom={pilierDominantNom}
      />

      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          color: 'rgba(0,0,0,0.4)',
          margin: 0,
        }}
      >
        Semaine {numeroSemaine}
        {pilierDominantNom
          ? ` — pilier dominant : ${pilierDominantNom}`
          : ' — équilibre entre les piliers'}
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 24,
        }}
      >
        <button
          type="button"
          onClick={onVoirPost}
          className="cfs-btn-primaire"
        >
          Voir un post
        </button>
        <Link
          href="/ma-marque"
          className="cfs-btn-secondaire"
        >
          Enrichir ma marque
        </Link>
      </div>
    </section>
  )
}
