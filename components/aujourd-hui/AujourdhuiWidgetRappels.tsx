// Sprint 43-stable — Widget Rappels sur Aujourd'hui

import Link from 'next/link'

type Rappel = {
  id: string
  title: string
  completed?: boolean
}

type Props = {
  rappels: ReadonlyArray<Rappel>
}

export function AujourdhuiWidgetRappels({ rappels }: Props) {
  const active = rappels.filter((r) => !r.completed)
  return (
    <Link href="/rappels" className="widget-link" aria-label="Ouvrir Rappels">
      <article className="widget glass-z2" aria-label="Rappels">
        <header className="widget-rap-header">
          <span className="widget-rap-count">{active.length}</span>
          <div>
            <div className="widget-rap-label">{active.length === 1 ? 'tâche' : 'tâches'}</div>
            <div className="widget-rap-sub">Aujourd'hui</div>
          </div>
        </header>
        <ul className="widget-rap-list">
          {active.length === 0 ? (
            <li className="widget-rap-empty">Aucun rappel.</li>
          ) : (
            active.slice(0, 3).map((rappel) => (
              <li key={rappel.id} className="widget-rap-item">
                <span className="widget-rap-check" aria-hidden="true" />
                <span className="widget-rap-text">{rappel.title}</span>
              </li>
            ))
          )}
        </ul>
      </article>
    </Link>
  )
}
