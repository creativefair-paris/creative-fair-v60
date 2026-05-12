// Sprint 36.C — Orchestrateur de la home /aujourd-hui.
// Layout vertical, 4 sections séparées implicitement (margins).

import { DateHeader } from './DateHeader'
import { SectionAujourdhui } from './SectionAujourdhui'
import { SectionCetteSemaine } from './SectionCetteSemaine'
import { SectionMarquePrendForme } from './SectionMarquePrendForme'
import { SectionBrouillons } from './SectionBrouillons'
import type { AujourdhuiData } from '@/lib/aujourd-hui/load-data'

type Props = {
  data: Extract<AujourdhuiData, { authenticated: true; redirect?: undefined }>
}

export function AujourdhuiContent({ data }: Props) {
  return (
    <div className="cfs-aujourdhui">
      <DateHeader isoDate={data.todayDate} />
      <SectionAujourdhui posts={data.postsToday} />
      <SectionCetteSemaine
        posts={data.postsWeek}
        blocsPrioritaires={data.blocsPrioritaires}
        progression={data.progressionSemaine}
      />
      <SectionMarquePrendForme
        cetteSemaine={data.statsWeek}
        depuisDebut={data.statsTotal}
      />
      <SectionBrouillons drafts={data.drafts} />
    </div>
  )
}
