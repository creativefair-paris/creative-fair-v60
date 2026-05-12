// Sprint 36.C — Section "Cette semaine" : posts restants + blocs Ma Marque
// prioritaires non remplis. Barre de progression discrète au-dessus.

import { SectionLabel } from './SectionLabel'
import { TaskItem } from './TaskItem'
import { BarreFondations } from '@/components/ma-marque/BarreFondations'
import { nomDuJourFr } from '@/lib/aujourd-hui/dates-fr'
import type {
  PostWeekItem,
  BlocPrioritaire,
  ProgressionSemaine,
} from '@/lib/aujourd-hui/load-data'

type Props = {
  posts: PostWeekItem[]
  blocsPrioritaires: BlocPrioritaire[]
  progression: ProgressionSemaine
}

export function SectionCetteSemaine({ posts, blocsPrioritaires, progression }: Props) {
  const total = Math.max(1, progression.total)
  if (posts.length === 0 && blocsPrioritaires.length === 0) {
    return null
  }
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionLabel>Cette semaine</SectionLabel>

      <div style={{ marginBottom: 16 }}>
        <BarreFondations
          total={total}
          complets={progression.complets}
          partiels={0}
          prioritaires={0}
        />
      </div>

      <ul className="cfs-task-list">
        {posts.map((post) => {
          const d = new Date(post.date_prevue)
          const nomJour = !Number.isNaN(d.getTime()) ? nomDuJourFr(d) : ''
          return (
            <li key={post.id}>
              <TaskItem
                status="semaine"
                title={nomJour ? `Préparer le post de ${nomJour}` : 'Préparer le post'}
                subtitle={
                  post.titre
                    ? `« ${post.titre} » · ${post.type_contenu}`
                    : post.type_contenu
                }
                href={`/programme/post/${post.id}`}
              />
            </li>
          )
        })}

        {blocsPrioritaires.map((bloc) => (
          <li key={bloc.id}>
            <TaskItem
              status="semaine"
              title={bloc.actionLabel}
              subtitle={bloc.contextLabel}
              href={`/ma-marque?bloc=${bloc.id}`}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
