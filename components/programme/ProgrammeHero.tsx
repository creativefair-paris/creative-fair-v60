// Sprint 36.B.3 — Hero gauche de /programme en Split Brief 40/60.
//
// Narrative + chips piliers actifs + mention pilier dominant + actions rapides.
// Pas de pourcentage. Pas de badge. Prose tranquille.

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
          lineHeight: 1.5,
          color: 'var(--color-secondary-label)',
          margin: 0,
        }}
      >
        Voici comment Creative Fair a interprété ta marque cette semaine.
      </p>

      <h1
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 30,
          lineHeight: 1.2,
          fontWeight: 600,
          letterSpacing: '-0.018em',
          color: 'var(--color-label)',
          margin: 0,
        }}
      >
        {arcNarratif || 'Ton programme prend forme cette semaine.'}
      </h1>

      <ChipsPiliersActifs
        piliers={piliers}
        couleurs={couleurs}
        pilierDominantNom={pilierDominantNom}
      />

      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          color: 'var(--color-tertiary-label)',
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
          marginTop: 'var(--space-3)',
        }}
      >
        <button
          type="button"
          onClick={onVoirPost}
          className="glass-thin"
          style={{
            padding: '10px 18px',
            borderRadius: 22,
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-label)',
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Voir un post
        </button>
        <Link
          href="/ma-marque"
          className="glass-thin"
          style={{
            padding: '10px 18px',
            borderRadius: 22,
            color: 'var(--color-label)',
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Enrichir ma marque
        </Link>
      </div>
    </section>
  )
}
