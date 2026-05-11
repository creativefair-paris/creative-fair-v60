// Sprint 36.B.1 (patch) — Timeline orchestre 2 vues calendrier + Sheet détail.
// La vue cards verticales (timeline) est retirée. Vue par défaut : semaine.
// HeroSemaine reste affiché en permanence au-dessus du toggle.

'use client'

import { useMemo, useState } from 'react'
import type { PilierNarratif, PostRow } from '@/types/programme'
import { colorForPilier } from '@/lib/programme/colors'
import { HeroSemaine } from './HeroSemaine'
import { CalendarToggle, type ViewMode } from './CalendarToggle'
import { VueSemaine } from './VueSemaine'
import { VueMois } from './VueMois'
import { PostDetailSheet } from './PostDetailSheet'

type TimelineProps = {
  posts: PostRow[]
  piliers: PilierNarratif[]
  arcNarratif: string
}

export function Timeline({ posts, piliers, arcNarratif }: TimelineProps) {
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

  const selectedAccent = selectedPost
    ? colorForPilier(selectedPost.pilier_nom, piliers)
    : undefined

  return (
    <div
      id="timeline-start"
      className={`cfs-timeline-root view-${view}`}
      style={{
        width: '100%',
        maxWidth: 680,
        margin: '0 auto',
        padding: 'var(--space-5)',
        scrollMarginTop: 24,
      }}
    >
      <HeroSemaine arcNarratif={arcNarratif} piliers={piliers} />

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

      <PostDetailSheet
        open={selectedPost != null}
        post={selectedPost}
        accentColor={selectedAccent}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  )
}
