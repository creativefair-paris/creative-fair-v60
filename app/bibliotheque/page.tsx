// Sprint 43-stable — Bibliothèque V2.0 top-level (création).
//
// Doctrine :
//   - 00-CONCEPT.md §5 promesse 7 (mémoire éditoriale) + §3 (Apple Reminders sobriété).
//   - 01-ARCHITECTURE.md §1 (Bibliothèque = Travail top-level) + §3.2 (sub-sidebar 260px).
//
// HTML de référence : docs/design-mockups/03-bibliotheque-v2.html
//
// Page déplacée depuis /outils/bibliotheque vers /bibliotheque (décision 4
// decisions.md Sprint 43-stable).

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  BibliothequeSubSidebar,
  type BibliothequeFilter,
} from '@/components/bibliotheque/BibliothequeSubSidebar'
import { BibliothequeGrille } from '@/components/bibliotheque/BibliothequeGrille'
import { loadBibliothequeItems, PILIER_COLORS } from '@/lib/bibliotheque/queries'

export const dynamic = 'force-dynamic'

const VALID_FILTERS: ReadonlyArray<BibliothequeFilter> = ['all', 'recents', 'favoris', 'archive']

type SearchParams = {
  filter?: string
  pilier?: string
}

export default async function BibliothequePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const filterKey = (params.filter && VALID_FILTERS.includes(params.filter as BibliothequeFilter)
    ? (params.filter as BibliothequeFilter)
    : 'all')

  const pilier = params.pilier

  const { items, totalCount, recentCount, piliersCount } = await loadBibliothequeItems(supabase, {
    filterKey,
    pilier,
  })

  // Construire la liste des piliers depuis les comptages (avec fallback aux noms canoniques)
  const defaultPiliers = ['Anecdote', 'Produit', 'Événement', 'Manifeste', 'Coulisses']
  const piliers = defaultPiliers.map((label) => ({
    id: label,
    label,
    count: piliersCount.get(label) ?? 0,
    color: PILIER_COLORS[label] ?? 'rgba(0, 0, 0, 0.2)',
  }))

  return (
    <>
      <div className="wallpaper-neutral" aria-hidden="true" />

      <header className="page-header">
        <div className="page-shell">
          <div className="breadcrumb">
            <Link href="/aujourd-hui" className="breadcrumb-link">Aujourd&apos;hui</Link>
            <span className="breadcrumb-separator">›</span>
            <span>Bibliothèque</span>
          </div>
          <h1 className="header-h1">Bibliothèque</h1>
          <p className="header-subtitle">Tout ce que tu as publié, en un seul endroit.</p>
        </div>
      </header>

      <div className="page-shell page-with-sidebar">
        <BibliothequeSubSidebar
          activeFilter={filterKey}
          totalCount={totalCount}
          recentCount={recentCount}
          piliers={piliers}
          activePilier={pilier}
        />

        <main className="bibliotheque-content">
          <BibliothequeGrille items={items} />
        </main>
      </div>
    </>
  )
}
