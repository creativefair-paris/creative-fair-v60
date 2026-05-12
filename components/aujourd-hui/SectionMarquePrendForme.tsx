// Sprint 36.C — Section "Ta marque prend forme" : Pattern A gros chiffres.
// Deux groupes : "Cette semaine" + "Depuis le début".
// Doctrine : pas de %, pas de comparaison entre utilisateurs.

import { SectionLabel } from './SectionLabel'
import { StatBlock } from './StatBlock'
import type { StatsWeek, StatsTotal } from '@/lib/aujourd-hui/load-data'

type Props = {
  cetteSemaine: StatsWeek
  depuisDebut: StatsTotal
}

function labelPiliers(n: number): string {
  return n === 1 ? 'pilier travaillé' : 'piliers travaillés'
}
function labelPosts(n: number): string {
  return n === 1 ? 'post publié' : 'posts publiés'
}
function labelSemaines(n: number): string {
  return n === 1 ? 'semaine tenue' : 'semaines tenues'
}

export function SectionMarquePrendForme({ cetteSemaine, depuisDebut }: Props) {
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionLabel>Ta marque prend forme</SectionLabel>

      <div className="cfs-stats-group">
        <h3 className="cfs-stats-group-title">Cette semaine</h3>
        <div className="cfs-stats-row">
          <StatBlock
            value={cetteSemaine.postsPublies}
            label={labelPosts(cetteSemaine.postsPublies)}
          />
          <StatBlock
            value={cetteSemaine.piliersTravailles}
            label={labelPiliers(cetteSemaine.piliersTravailles)}
          />
          <StatBlock
            value={cetteSemaine.programmeTenu ? 'Oui' : '—'}
            label="programme tenu"
          />
        </div>
      </div>

      <div className="cfs-stats-group" style={{ marginTop: 24 }}>
        <h3 className="cfs-stats-group-title">Depuis le début</h3>
        <div className="cfs-stats-row">
          <StatBlock
            value={depuisDebut.postsTotal}
            label={labelPosts(depuisDebut.postsTotal)}
          />
          <StatBlock
            value={depuisDebut.semainesTenues}
            label={labelSemaines(depuisDebut.semainesTenues)}
          />
          <StatBlock
            value={`${depuisDebut.fondations}/14`}
            label="fondations posées"
          />
        </div>
      </div>
    </section>
  )
}
