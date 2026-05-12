// Sprint 36.C — En-tête date de la home /aujourd-hui.
// "Mardi 12 mai · Semaine 20" — date Paris, semaine ISO 8601.

import { capitalize, formatDateHeaderFr, getISOWeek } from '@/lib/aujourd-hui/dates-fr'

type Props = {
  isoDate: string
}

export function DateHeader({ isoDate }: Props) {
  const d = new Date(isoDate)
  const dateFr = capitalize(formatDateHeaderFr(d))
  const semaine = getISOWeek(d)

  return (
    <p
      style={{
        fontFamily: 'var(--font-system)',
        fontSize: 18,
        fontWeight: 400,
        color: 'rgba(0,0,0,0.55)',
        margin: 0,
        marginTop: 8,
        marginBottom: 32,
      }}
    >
      {dateFr} · Semaine {semaine}
    </p>
  )
}
