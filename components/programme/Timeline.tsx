// Sprint 36.B — Timeline verticale enrichie.
// Server Component. Rend Hero + cards avec accent couleur par pilier + CTA Ma Marque.

import Link from 'next/link'
import type { PilierNarratif, PostRow } from '@/types/programme'
import { HeroSemaine } from './HeroSemaine'
import { PostCard } from './PostCard'

type TimelineProps = {
  posts: PostRow[]
  piliers: PilierNarratif[]
  arcNarratif: string
}

const PILIER_COLOR_VARS = ['var(--pilier-1)', 'var(--pilier-2)', 'var(--pilier-3)'] as const

function colorForPilier(pilierNom: string, piliers: PilierNarratif[]): string {
  const idx = piliers.findIndex((p) => p.nom === pilierNom)
  return PILIER_COLOR_VARS[idx] ?? PILIER_COLOR_VARS[0]
}

export function Timeline({ posts, piliers, arcNarratif }: TimelineProps) {
  return (
    <div
      id="timeline-start"
      style={{
        width: '100%',
        maxWidth: 680,
        margin: '0 auto',
        padding: 'var(--space-5)',
        scrollMarginTop: 24,
      }}
    >
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
            <PostCard post={post} accentColor={colorForPilier(post.pilier_nom, piliers)} />
          </li>
        ))}
      </ol>

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
    </div>
  )
}
