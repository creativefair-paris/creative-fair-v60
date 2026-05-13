// Sprint 36.C — Helpers de date FR pour la home /aujourd-hui.
// Sans dépendance externe (Intl.DateTimeFormat + calcul ISO week).

export function formatDateHeaderFr(d: Date): string {
  // "mardi 12 mai" — minuscules à l'arrivée, le composant capitalise si besoin.
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  }).format(d)
}

export function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Numéro de semaine ISO 8601 (lundi = jour 1).
export function getISOWeek(d: Date): number {
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  // Jeudi de la semaine ISO de la date.
  const dayNum = (target.getDay() + 6) % 7 // 0 = lundi
  target.setDate(target.getDate() - dayNum + 3)
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const firstDayNum = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstDayNum + 3)
  const diffMs = target.getTime() - firstThursday.getTime()
  return 1 + Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
}

// Année ISO 8601 (peut différer de getFullYear pour les semaines à cheval).
export function getISOWeekYear(d: Date): number {
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayNum = (target.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNum + 3)
  return target.getFullYear()
}

// Nom du jour FR à partir d'une date (pour "Préparer le post de mardi").
export function nomDuJourFr(d: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    timeZone: 'Europe/Paris',
  }).format(d)
}

// Sprint 36.H Finding 1 — Sous-titre "Semaine du 11 au 17 mai".
// Si le mois est le même : "DD au DD mois" (un seul mois affiché).
// Si chevauchement de mois : "DD mois au DD mois".
// Pas d'année (V1 — la date est implicitement l'année courante).
const MOIS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

export function semaineRangeFr(weekStart: Date, weekEnd: Date): string {
  const dStart = weekStart.getDate()
  const dEnd = weekEnd.getDate()
  const mStart = weekStart.getMonth()
  const mEnd = weekEnd.getMonth()
  if (mStart === mEnd) {
    return `Semaine du ${dStart} au ${dEnd} ${MOIS_FR[mStart]}`
  }
  return `Semaine du ${dStart} ${MOIS_FR[mStart]} au ${dEnd} ${MOIS_FR[mEnd]}`
}

// Sprint 36.H Finding 2 — Titre Bloc A "Aujourd'hui, 13 mai".
// Pas d'année, mois en minuscule.
export function jourCourantFr(d: Date): string {
  return `${d.getDate()} ${MOIS_FR[d.getMonth()]}`
}

// Sprint 36.H Finding 7 — "Reporté de N jours" sous le titre TaskRow.
// reportedFromISO = timestamp du moment où le catch-up a déplacé le post.
// today = jour courant.
// date_prevue = nouvelle date du post (après report).
// Retourne null si pas de report ou si pas de label à afficher.
export function reportedLabel(
  reportedFromISO: string | null | undefined,
  datePrevueISO: string,
  today: Date,
): string | null {
  if (!reportedFromISO) return null
  const dPrevue = new Date(`${datePrevueISO}T00:00:00`)
  const dToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (Number.isNaN(dPrevue.getTime())) return null

  // Cas 1 : date_prevue = today (le post a été reporté à aujourd'hui).
  if (dPrevue.getTime() === dToday.getTime()) {
    return 'Reporté de hier'
  }
  // Cas 2 : date_prevue > today + 1 (reporté dans le futur).
  const tomorrow = new Date(dToday)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (dPrevue.getTime() > tomorrow.getTime()) {
    const reported = new Date(reportedFromISO)
    if (Number.isNaN(reported.getTime())) return null
    const reportedDay = new Date(reported.getFullYear(), reported.getMonth(), reported.getDate())
    const diffDays = Math.max(1, Math.round((dToday.getTime() - reportedDay.getTime()) / 86400000))
    return `Reporté de ${diffDays} jours`
  }
  return null
}

// Heure courte "9h30" / "14h" depuis "HH:MM:SS" ou "HH:MM".
export function heureLisible(heurePrevue: string | null | undefined): string {
  if (!heurePrevue) return ''
  const [hRaw, mRaw] = heurePrevue.split(':')
  const h = Number(hRaw)
  const m = Number(mRaw ?? 0)
  if (Number.isNaN(h)) return ''
  if (!m || m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}
