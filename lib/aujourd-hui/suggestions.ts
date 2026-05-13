// Sprint 37.A (F7) — Calcul des suggestions "À faire cette semaine".
//
// Doc 09 §8 (gamification soft assumée) — Bloc dynamique de 0 à 3
// cards affiché sous BlocCetteSemaine dans /aujourd-hui. Cap à 3 et
// si 0, on ne rend pas le bloc du tout (pas de fallback "aucune
// suggestion" — anti-friction Apple).

import type { TaskPost } from '@/lib/types/post'

export type Suggestion = {
  title: string
  description: string
  href: string
}

export type SuggestionsInput = {
  // Date de fin du programme actif (YYYY-MM-DD) ou null si pas de
  // programme. Si <14j avant la fin → suggestion "Préparer ton
  // prochain plan".
  currentProgrammeEnd: string | null
  // Posts du reste de la semaine pour détecter le vide samedi/dimanche.
  postsWeek: ReadonlyArray<TaskPost>
  // brand.questions_answered (0..14) — <14 → Ma Marque incomplet.
  brandQuestionsAnswered: number
  // Date courante (passée en argument pour testabilité).
  now: Date
}

function daysUntil(iso: string, now: Date): number {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return Number.POSITIVE_INFINITY
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((d.getTime() - t0.getTime()) / 86400000)
}

function isWeekendDate(iso: string): boolean {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return false
  const day = d.getDay()
  return day === 0 || day === 6 // dim || sam
}

export function computeSuggestions(input: SuggestionsInput): Suggestion[] {
  const suggestions: Suggestion[] = []

  // 1) Programme actif <14j de la fin → prochaine régénération.
  if (input.currentProgrammeEnd) {
    const daysLeft = daysUntil(input.currentProgrammeEnd, input.now)
    if (daysLeft > 0 && daysLeft < 14) {
      suggestions.push({
        title: 'Préparer ton prochain plan',
        href: '/programme?action=create-plan',
        description: `Ton plan actuel se termine dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.`,
      })
    }
  }

  // 2) Ma Marque incomplet (questions_answered < 14).
  if (input.brandQuestionsAnswered < 14) {
    const remaining = 14 - input.brandQuestionsAnswered
    suggestions.push({
      title: 'Compléter Ma Marque',
      href: '/ma-marque',
      description:
        remaining === 1
          ? 'Encore 1 fondation à poser pour compléter ta marque.'
          : `Encore ${remaining} fondations à poser pour compléter ta marque.`,
    })
  }

  // 3) Vendredi 16h+ et samedi/dimanche vides.
  const dayOfWeek = input.now.getDay()
  const hour = input.now.getHours()
  const isFridayLate = dayOfWeek === 5 && hour >= 16
  if (isFridayLate) {
    const weekendPostsScheduled = input.postsWeek.some((p) =>
      isWeekendDate(p.date_prevue),
    )
    if (!weekendPostsScheduled) {
      suggestions.push({
        title: 'Préparer le week-end',
        href: '/outils/conseiller?scenario=B4',
        description: 'Pas de post prévu samedi ni dimanche.',
      })
    }
  }

  return suggestions.slice(0, 3)
}
