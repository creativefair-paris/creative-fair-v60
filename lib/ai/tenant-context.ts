type BrandBook = {
  name?: string
  values?: string[]
  audience?: string
  tone?: string
  mission?: string
}

type BusinessCalendar = {
  events?: Array<{ date: string; title: string; description?: string }>
}

export function buildBrandContext(
  brand: BrandBook,
  calendar?: BusinessCalendar,
): string {
  const lines: string[] = []

  if (brand.name) lines.push(`Marque : ${brand.name}`)
  if (brand.mission) lines.push(`Mission : ${brand.mission}`)
  if (brand.audience) lines.push(`Audience cible : ${brand.audience}`)
  if (brand.tone) lines.push(`Ton de voix : ${brand.tone}`)
  if (brand.values?.length) lines.push(`Valeurs : ${brand.values.join(', ')}`)

  if (calendar?.events?.length) {
    lines.push('\nÉvénements à venir :')
    for (const event of calendar.events) {
      const desc = event.description ? ` — ${event.description}` : ''
      lines.push(`- ${event.date} : ${event.title}${desc}`)
    }
  }

  return lines.join('\n')
}
