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
