// Sprint 43-stable — Sub-sidebar Calendrier (filtres canaux + Rappels)

import { Search, Plus } from 'lucide-react'

type ChannelCount = {
  channel: string
  count: number
}

type Props = {
  publicationsCount: number
  channels: ReadonlyArray<ChannelCount>
  rappelsCount: number
}

export function CalendrierSubSidebar({ publicationsCount, channels, rappelsCount }: Props) {
  return (
    <aside className="sub-sidebar glass-z1" aria-label="Navigation Calendrier">
      <button className="cal-search" type="button">
        <Search size={14} strokeWidth={1.6} />
        <span>Rechercher</span>
      </button>

      <div className="sub-sidebar__group">
        <h3 className="sub-sidebar__eyebrow">Mes calendriers</h3>

        <div className="cal-parent-row">
          <span className="cal-dot" style={{ background: 'var(--blue-cf)' }} aria-hidden="true" />
          <span>Publications</span>
          <span className="lib-counter">{publicationsCount}</span>
        </div>
        <div className="cal-children">
          {channels.map((c) => (
            <div key={c.channel} className="cal-child-row">
              <span>{c.channel}</span>
              <span className="lib-counter">{c.count}</span>
            </div>
          ))}
        </div>

        <div className="sub-sidebar__item">
          <span className="cal-dot" style={{ background: 'var(--orange)' }} aria-hidden="true" />
          <span>Rappels</span>
          <span className="lib-counter">{rappelsCount}</span>
        </div>
      </div>

      <button type="button" className="cal-new-post-btn">
        <Plus size={16} strokeWidth={1.8} />
        Nouvelle publication
      </button>
    </aside>
  )
}
