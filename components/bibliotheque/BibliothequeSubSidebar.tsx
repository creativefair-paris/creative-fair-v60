// Sprint 43-stable — Sub-sidebar Bibliothèque (filtres piliers + période)
// Doctrine 01-ARCHITECTURE.md §3.2

import Link from 'next/link'
import { Image as ImageIcon, Clock, Star, Archive } from 'lucide-react'

type FilterKey = 'all' | 'recents' | 'favoris' | 'archive'

type Pilier = {
  id: string
  label: string
  count: number
  color: string
}

type Props = {
  activeFilter: FilterKey
  totalCount: number
  recentCount: number
  piliers: ReadonlyArray<Pilier>
  activePilier?: string
}

export function BibliothequeSubSidebar({
  activeFilter,
  totalCount,
  recentCount,
  piliers,
  activePilier,
}: Props) {
  return (
    <aside className="sub-sidebar glass-z1" aria-label="Catégories Bibliothèque">
      <div className="sub-sidebar__group">
        <h3 className="sub-sidebar__eyebrow">Bibliothèque</h3>
        <Link
          href="/bibliotheque"
          className={`sub-sidebar__item ${activeFilter === 'all' ? 'is-active' : ''}`}
        >
          <ImageIcon size={16} strokeWidth={1.6} />
          <span>Tout</span>
          <span className="lib-counter">{totalCount}</span>
        </Link>
        <Link
          href="/bibliotheque?filter=recents"
          className={`sub-sidebar__item ${activeFilter === 'recents' ? 'is-active' : ''}`}
        >
          <Clock size={16} strokeWidth={1.6} />
          <span>Récents</span>
          <span className="lib-counter">{recentCount}</span>
        </Link>
        <Link
          href="/bibliotheque?filter=favoris"
          className={`sub-sidebar__item ${activeFilter === 'favoris' ? 'is-active' : ''}`}
        >
          <Star size={16} strokeWidth={1.6} />
          <span>Favoris</span>
        </Link>
        <Link
          href="/bibliotheque?filter=archive"
          className={`sub-sidebar__item ${activeFilter === 'archive' ? 'is-active' : ''}`}
        >
          <Archive size={16} strokeWidth={1.6} />
          <span>Archives</span>
        </Link>
      </div>

      <div className="sub-sidebar__group">
        <h3 className="sub-sidebar__eyebrow">Piliers</h3>
        {piliers.map((p) => (
          <Link
            key={p.id}
            href={`/bibliotheque?pilier=${encodeURIComponent(p.id)}`}
            className={`sub-sidebar__item ${activePilier === p.id ? 'is-active' : ''}`}
          >
            <span
              className="sub-sidebar__dot"
              style={{ background: p.color }}
              aria-hidden="true"
            />
            <span>{p.label}</span>
            <span className="lib-counter">{p.count}</span>
          </Link>
        ))}
      </div>
    </aside>
  )
}

export type { FilterKey as BibliothequeFilter }
