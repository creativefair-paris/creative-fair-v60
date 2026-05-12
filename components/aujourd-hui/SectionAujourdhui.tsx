// Sprint 36.C — Section "Aujourd'hui" : posts à préparer aujourd'hui.
// Empty state honnête : pas de placeholder fake.

import { SectionLabel } from './SectionLabel'
import { TaskItem } from './TaskItem'
import { heureLisible } from '@/lib/aujourd-hui/dates-fr'
import type { PostTodayItem } from '@/lib/aujourd-hui/load-data'

type Props = {
  posts: PostTodayItem[]
}

function phraseEtatJour(count: number): string {
  if (count === 0) return "C'est fait pour aujourd'hui — la suite, c'est plus tard cette semaine."
  if (count === 1) return 'Plus qu’un geste pour aujourd’hui.'
  return `Il te reste ${count} gestes pour aujourd’hui.`
}

export function SectionAujourdhui({ posts }: Props) {
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionLabel>Aujourd&apos;hui</SectionLabel>
      {posts.length === 0 ? (
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 15,
            lineHeight: 1.6,
            color: 'rgba(0,0,0,0.55)',
            margin: 0,
          }}
        >
          Pas de geste pour aujourd&apos;hui — la semaine respire.
        </p>
      ) : (
        <>
          <ul className="cfs-task-list">
            {posts.map((post) => (
              <li key={post.id}>
                <TaskItem
                  status="aujourdhui"
                  title={`Préparer le post de ${heureLisible(post.heure_prevue)}`}
                  subtitle={
                    post.titre
                      ? `« ${post.titre} » · ${post.type_contenu}`
                      : post.type_contenu
                  }
                  href={`/programme/post/${post.id}`}
                />
              </li>
            ))}
          </ul>
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              color: 'rgba(0,0,0,0.45)',
              margin: 0,
              marginTop: 12,
            }}
          >
            {phraseEtatJour(posts.length)}
          </p>
        </>
      )}
    </section>
  )
}
