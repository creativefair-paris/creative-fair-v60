// Sprint 36.B.2 — Panneau droit (60%) du Split Brief Ressources.
// Tableau visuel des capacités de production hebdomadaires.

'use client'

import type { Ressources, CapaciteProduction } from '@/types/ma-marque'
import { ressourcesEstVide } from '@/types/ma-marque'

type Props = {
  ressources: Ressources
}

const NIVEAUX: { value: CapaciteProduction; rang: number; label: string }[] = [
  { value: 'aucune', rang: 0, label: 'Pas de production' },
  { value: 'occasionnelle', rang: 1, label: 'Quelques pièces par mois' },
  { value: 'reguliere', rang: 2, label: 'Plusieurs fois par semaine' },
  { value: 'soutenue', rang: 3, label: 'Chaque jour ou presque' },
]

function rangPour(c: CapaciteProduction): number {
  return NIVEAUX.find((n) => n.value === c)?.rang ?? 0
}

function labelPour(c: CapaciteProduction): string {
  return NIVEAUX.find((n) => n.value === c)?.label ?? '—'
}

function phraseProfil(r: Ressources): string {
  if (ressourcesEstVide(r)) {
    return 'Pas encore renseigné. Sans repère sur tes capacités, le programme tire à l\'aveugle.'
  }
  const photo = rangPour(r.photo)
  const video = rangPour(r.video)
  const total = photo + video
  if (total === 0 && (r.terrain || r.studio)) {
    return 'Tu as un cadre de tournage mais pas encore de cadence de production.'
  }
  if (total <= 1) {
    return 'Production légère. On privilégiera du contenu sobre, économe en captation.'
  }
  if (total <= 3) {
    return 'Production équilibrée. Le programme alternera formats légers et plus produits.'
  }
  return 'Production soutenue. Le programme peut s\'appuyer sur des formats riches et variés.'
}

function CapaciteRow({
  titre,
  capacite,
}: {
  titre: string
  capacite: CapaciteProduction
}) {
  const rang = rangPour(capacite)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) 0',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--color-label)',
          }}
        >
          {titre}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: 'var(--color-tertiary-label)',
            marginTop: 2,
          }}
        >
          {labelPour(capacite)}
        </div>
      </div>
      <div
        aria-label={`Niveau ${rang} sur 3`}
        style={{
          display: 'inline-flex',
          gap: 6,
          flexShrink: 0,
        }}
      >
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            aria-hidden="true"
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background:
                n <= rang
                  ? 'var(--color-label)'
                  : 'rgba(0, 0, 0, 0.08)',
              transition: 'background 200ms ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function CadreRow({ titre, actif }: { titre: string; actif: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) 0',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 16,
            fontWeight: 500,
            color: actif ? 'var(--color-label)' : 'var(--color-tertiary-label)',
          }}
        >
          {titre}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: 'var(--color-tertiary-label)',
            marginTop: 2,
          }}
        >
          {actif ? 'Disponible' : 'Non disponible'}
        </div>
      </div>
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          fontFamily: 'var(--font-system)',
          fontSize: 18,
          fontWeight: 600,
          color: actif ? 'var(--color-label)' : 'var(--color-quaternary-label)',
        }}
      >
        {actif ? '✓' : '—'}
      </span>
    </div>
  )
}

export function RessourcesPreview({ ressources }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <header>
        <h3
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.015em',
            color: 'var(--color-label)',
            margin: 0,
          }}
        >
          Ce que tu peux produire chaque semaine
        </h3>
      </header>

      <article
        className="glass-regular"
        style={{
          padding: 'var(--space-5)',
          borderRadius: 22,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CapaciteRow titre="Photo" capacite={ressources.photo} />
        <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />
        <CapaciteRow titre="Vidéo" capacite={ressources.video} />
        <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />
        <CadreRow titre="Terrain (boutique, atelier)" actif={ressources.terrain} />
        <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />
        <CadreRow titre="Studio" actif={ressources.studio} />
      </article>

      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          lineHeight: 1.45,
          color: 'var(--color-secondary-label)',
          margin: 0,
          padding: '0 var(--space-2)',
        }}
      >
        {phraseProfil(ressources)}
      </p>
    </div>
  )
}
