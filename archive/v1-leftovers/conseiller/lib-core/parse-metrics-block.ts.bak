// Sprint 37.C (A8) — Parsing du bloc METRICS dans les réponses conseiller.
//
// Pattern attendu dans la réponse Anthropic :
//
//   METRICS:
//   - followers_count: 14000
//   - engagement_rate_pct: 3.2
//
// Le scénario A8 instruit le modèle à terminer ses réponses par ce bloc
// quand le pilote a fourni un chiffre. Le parsing est silent : si pas de
// bloc, on retourne []. Si bloc malformé, on extrait ce qu'on peut.

export type MetricType =
  | 'followers_count'
  | 'engagement_rate_pct'
  | 'dm_clients_qualifies_per_month'
  | 'presse_mentions_per_month'
  | 'comments_qualifies_per_month'
  | 'collaborations_demands_per_month'
  | 'newsletter_subscribers'
  | 'site_visits_per_month'

export type ParsedMetric = {
  type: MetricType
  value: number
}

const VALID_TYPES: ReadonlySet<MetricType> = new Set<MetricType>([
  'followers_count',
  'engagement_rate_pct',
  'dm_clients_qualifies_per_month',
  'presse_mentions_per_month',
  'comments_qualifies_per_month',
  'collaborations_demands_per_month',
  'newsletter_subscribers',
  'site_visits_per_month',
])

const METRICS_REGEX = /METRICS:\s*\n((?:-\s*[a-z_]+:\s*[\d.,]+\s*\n?)+)/i
const LINE_REGEX = /^-\s*([a-z_]+):\s*([\d.,]+)/i

export function parseMetricsBlock(response: string): ReadonlyArray<ParsedMetric> {
  const blockMatch = response.match(METRICS_REGEX)
  if (!blockMatch || !blockMatch[1]) return []

  const out: ParsedMetric[] = []
  for (const rawLine of blockMatch[1].split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    const m = line.match(LINE_REGEX)
    if (!m) continue
    const type = m[1] as MetricType
    if (!VALID_TYPES.has(type)) continue
    const valueStr = (m[2] ?? '').replace(',', '.')
    const value = parseFloat(valueStr)
    if (Number.isNaN(value) || !Number.isFinite(value)) continue
    out.push({ type, value })
  }
  return out
}

// Strip le bloc METRICS de la réponse avant affichage côté pilote — le
// pilote ne doit pas voir ce bloc technique.
export function stripMetricsBlock(response: string): string {
  return response.replace(METRICS_REGEX, '').replace(/\n{3,}/g, '\n\n').trim()
}
