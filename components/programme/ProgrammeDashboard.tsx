// Sprint 36.B.3 — Orchestrateur client de /programme en Split Brief 40/60.
//
// Hero gauche (40%) : narrative + chips piliers actifs + mention pilier dominant
// + actions rapides.
// Calendrier droit (60%) : toggle Semaine/Mois + VueSemaine ou VueMois +
// PostDetailSheet.

'use client'

import { useMemo, useState } from 'react'
import type { PilierNarratif, PostRow } from '@/types/programme'
import type { BrandBook } from '@/types/ma-marque'
import { PASTELS_DEFAUT } from '@/types/ma-marque'
import { colorForPilier } from '@/lib/programme/colors'
import { pilierDominantSemaine, numeroSemaineISO } from '@/lib/programme/dominance'
import { addDays, startOfDay, startOfWeek } from '@/lib/calendar/dates'
import { CalendarToggle, type ViewMode } from './CalendarToggle'
import { VueSemaine } from './VueSemaine'
import { VueMois } from './VueMois'
import { PostDetailSheet } from './PostDetailSheet'
import { ProgrammeHero } from './ProgrammeHero'

type Props = {
  posts: PostRow[]
  piliers: PilierNarratif[]
  arcNarratif: string
  brandBook: BrandBook | null
}

function couleursPiliers(brandBook: BrandBook | null, n: number): string[] {
  if (brandBook && brandBook.palette.length >= n) {
    return brandBook.palette.slice(0, n).map((c) => c.hex)
  }
  return PASTELS_DEFAUT.slice(0, Math.max(n, 1)).map((c) => c.hex)
}

export function ProgrammeDashboard({
  posts,
  piliers,
  arcNarratif,
  brandBook,
}: Props) {
  const [view, setView] = useState<ViewMode>('semaine')
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null)

  const referenceDate = useMemo(() => {
    const first = posts.find((p) => Boolean(p.date_prevue))
    if (first?.date_prevue) {
      const d = new Date(first.date_prevue)
      if (!Number.isNaN(d.getTime())) return d
    }
    return new Date()
  }, [posts])

  const fenetreSemaine = useMemo(() => {
    const debut = startOfWeek(referenceDate)
    const fin = startOfDay(addDays(debut, 7))
    return { debut, fin }
  }, [referenceDate])

  const dominance = useMemo(
    () => pilierDominantSemaine(posts, piliers, fenetreSemaine),
    [posts, piliers, fenetreSemaine],
  )

  const couleurs = useMemo(
    () => couleursPiliers(brandBook, piliers.length),
    [brandBook, piliers.length],
  )

  const numero = useMemo(() => numeroSemaineISO(referenceDate), [referenceDate])

  const selectedAccent = selectedPost
    ? colorForPilier(selectedPost.pilier_nom, piliers)
    : undefined

  function voirPremierPost() {
    // Le bouton "Voir un post" ouvre directement le premier post de la fenêtre
    // (ou de toute la liste s'il n'y en a aucun cette semaine).
    const premierSemaine = posts.find(
      (p) =>
        p.date_prevue &&
        new Date(p.date_prevue).getTime() >= fenetreSemaine.debut.getTime() &&
        new Date(p.date_prevue).getTime() < fenetreSemaine.fin.getTime(),
    )
    const cible = premierSemaine ?? posts[0] ?? null
    if (cible) setSelectedPost(cible)
  }

  // Sprint 36.B.8 — le container max-width/padding est désormais porté par
  // .cfs-page-container dans la page parente. Le grid n'ajoute aucun padding
  // horizontal propre pour rester aligné avec le PageHeader (1200px/24px).
  return (
    <div
      className="programme-split-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '40% 60%',
        gap: 40,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <aside style={{ paddingRight: 20 }}>
        <ProgrammeHero
          arcNarratif={arcNarratif}
          piliers={piliers}
          couleurs={couleurs}
          numeroSemaine={numero}
          pilierDominantNom={dominance?.pilier.nom ?? null}
          onVoirPost={voirPremierPost}
        />
      </aside>

      <section
        style={{
          paddingLeft: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <div className="cfs-timeline-controls">
          <CalendarToggle value={view} onChange={setView} />
        </div>

        {view === 'semaine' ? (
          <VueSemaine
            posts={posts}
            piliers={piliers}
            referenceDate={referenceDate}
            onSelectPost={setSelectedPost}
          />
        ) : (
          <VueMois
            posts={posts}
            piliers={piliers}
            referenceDate={referenceDate}
            onSelectPost={setSelectedPost}
          />
        )}
      </section>

      <PostDetailSheet
        open={selectedPost != null}
        post={selectedPost}
        accentColor={selectedAccent}
        onClose={() => setSelectedPost(null)}
      />

      <style>{`
        @media (max-width: 1200px) {
          .programme-split-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .programme-split-grid > aside,
          .programme-split-grid > section {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
