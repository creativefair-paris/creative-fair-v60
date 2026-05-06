// Helpers pour la grille calendrier — pas de dépendance externe.

export function startOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

export function endOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(23, 59, 59, 999)
  return c
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

// Lundi de la semaine de la date donnée (locale FR : semaine commence lundi).
export function startOfWeek(d: Date): Date {
  const c = startOfDay(d)
  const day = c.getDay() // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day
  return addDays(c, diff)
}

export function endOfWeek(d: Date): Date {
  return endOfDay(addDays(startOfWeek(d), 6))
}

export function startOfMonth(d: Date): Date {
  return startOfDay(new Date(d.getFullYear(), d.getMonth(), 1))
}

export function endOfMonth(d: Date): Date {
  return endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

// Première case de la grille mois (lundi avant ou égal au 1er du mois).
export function startOfMonthGrid(d: Date): Date {
  return startOfWeek(startOfMonth(d))
}

// Dernière case de la grille mois (dimanche après ou égal au dernier).
export function endOfMonthGrid(d: Date): Date {
  return endOfWeek(endOfMonth(d))
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay()
  return day === 0 || day === 6
}

export function dayLabelShort(d: Date): string {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
    .format(d)
    .replace('.', '')
}

export function dayNumber(d: Date): number {
  return d.getDate()
}

export function monthLabel(d: Date): string {
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(d)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
