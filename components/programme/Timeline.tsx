// Sprint 36.B.1 — Chantier D : Timeline orchestre 3 vues + Sheet détail.
// Modes : timeline (par défaut, hero + cards verticales), semaine (7 cols), mois (grille).
// Hero (HeroSemaine) reste visible uniquement en mode timeline.
// CTA Ma Marque toujours en bas.

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { PilierNarratif, PostRow } from '@/types/programme'
import { colorForPilier } from '@/lib/programme/colors'
import { HeroSemaine } from './HeroSemaine'
import { PostCard } from './PostCard'
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
  const [view, setView] = useState<ViewMode>('timeline')
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
      <div className="cfs-timeline-controls">
        <CalendarToggle value={view} onChange={setView} />
      </div>

      {view === 'timeline' ? (
        <>
          <HeroSemaine arcNarratif={arcNarratif} piliers={piliers} />

          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard
                  post={post}
                  accentColor={colorForPilier(post.pilier_nom, piliers)}
                />
              </li>
            ))}
          </ol>
        </>
      ) : view === 'semaine' ? (
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

      <Link
        href="/ma-marque"
        className="cta-affiner glass-thin"
        style={{
          display: 'block',
          padding: 24,
          borderRadius: 24,
          marginTop: 32,
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: 'var(--font-system)',
          fontSize: 17,
          fontWeight: 500,
          color: 'var(--color-label)',
          textAlign: 'center',
          textDecoration: 'none',
          transition: 'background-color 200ms ease, backdrop-filter 200ms ease',
        }}
      >
        Affine ta marque avec Creative Fair →
      </Link>

      <PostDetailSheet
        open={selectedPost != null}
        post={selectedPost}
        accentColor={selectedAccent}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  )
}
