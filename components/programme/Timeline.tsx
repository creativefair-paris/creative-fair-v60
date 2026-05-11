// Sprint 36.A — Timeline verticale (Chantier D.4)
// Server Component. Rend hero + liste verticale de PostCard.

import type { PilierNarratif, PostRow } from '@/types/programme'
import { HeroSemaine } from './HeroSemaine'
import { PostCard } from './PostCard'

type TimelineProps = {
  posts: PostRow[]
  piliers: PilierNarratif[]
  arcNarratif: string
}

export function Timeline({ posts, piliers, arcNarratif }: TimelineProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 680,
        margin: '0 auto',
        padding: 'var(--space-5)',
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
            <PostCard post={post} />
          </li>
        ))}
      </ol>
    </div>
  )
}
