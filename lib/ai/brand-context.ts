import type { BrandBook } from '@/types/brand-book'
import type { BusinessCalendar } from '@/types/business-calendar'

// Construit un contexte texte structuré pour Claude à partir
// du brand book + business calendar du tenant.
// Utilisé par les routes Creative Fair (coaching, post generation, suggestions...).
export function buildStructuredBrandContext(
  brand: BrandBook | null,
  calendar: BusinessCalendar | null,
): string {
  const lines: string[] = []

  if (brand) {
    lines.push(`Marque : ${brand.identity.name}`)
    lines.push(`Domaine : ${brand.identity.domain}`)
    if (brand.identity.tagline) lines.push(`Signature : ${brand.identity.tagline}`)
    lines.push(`Description : ${brand.identity.description}`)

    if (brand.voice.tone.length > 0) {
      lines.push(`Ton : ${brand.voice.tone.join(', ')}`)
    }
    if (brand.voice.encouragedWords.length > 0) {
      lines.push(`Vocabulaire encouragé : ${brand.voice.encouragedWords.join(', ')}`)
    }
    if (brand.voice.forbiddenWords.length > 0) {
      lines.push(`Vocabulaire interdit : ${brand.voice.forbiddenWords.join(', ')}`)
    }

    if (brand.audience.personas.length > 0) {
      lines.push('\nPersonas :')
      for (const p of brand.audience.personas) {
        lines.push(`- ${p.name} : ${p.description}`)
      }
    }

    if (brand.territories.length > 0) {
      lines.push('\nTerritoires éditoriaux :')
      for (const t of brand.territories) {
        lines.push(`- ${t.name} : ${t.description}`)
      }
    }

    if (brand.taboos.length > 0) {
      lines.push(`\nTabous : ${brand.taboos.join(', ')}`)
    }

    if (brand.goals.instagram) {
      lines.push(`\nObjectif Instagram : ${brand.goals.instagram}`)
    }
  }

  if (calendar) {
    const launches = calendar.upcomingLaunches ?? []
    const recurring = calendar.recurringEvents ?? []
    const industry = calendar.industryEvents ?? []

    if (launches.length + recurring.length + industry.length > 0) {
      lines.push('\nCalendrier business :')
    }

    for (const l of launches) {
      lines.push(`- ${l.date} (lancement) : ${l.name} — ${l.description}`)
    }
    for (const r of recurring) {
      const next = r.nextDate ? ` (prochain : ${r.nextDate})` : ''
      lines.push(`- récurrent ${r.frequency} : ${r.name}${next}`)
    }
    for (const e of industry) {
      lines.push(`- ${e.date} (secteur) : ${e.name}`)
    }
  }

  return lines.join('\n')
}

// Trouve l'événement business le plus proche d'une date donnée.
// Retourne le nom de l'événement, ou null si aucun n'est pertinent.
export function findNearestBusinessEvent(
  calendar: BusinessCalendar | null,
  reference: Date,
  windowDays = 14,
): string | null {
  if (!calendar) return null

  const refMs = reference.getTime()
  const windowMs = windowDays * 24 * 60 * 60 * 1000

  type Candidate = { name: string; ms: number }
  const candidates: Candidate[] = []

  for (const l of calendar.upcomingLaunches ?? []) {
    const ms = new Date(l.date).getTime()
    if (!Number.isNaN(ms)) candidates.push({ name: l.name, ms })
  }
  for (const e of calendar.industryEvents ?? []) {
    const ms = new Date(e.date).getTime()
    if (!Number.isNaN(ms)) candidates.push({ name: e.name, ms })
  }
  for (const r of calendar.recurringEvents ?? []) {
    if (r.nextDate) {
      const ms = new Date(r.nextDate).getTime()
      if (!Number.isNaN(ms)) candidates.push({ name: r.name, ms })
    }
  }

  let nearest: Candidate | null = null
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const c of candidates) {
    const distance = Math.abs(c.ms - refMs)
    if (distance < windowMs && distance < nearestDistance) {
      nearest = c
      nearestDistance = distance
    }
  }

  return nearest?.name ?? null
}
