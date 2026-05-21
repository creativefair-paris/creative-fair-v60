// Sprint 43-stable — Roadmap orchestrée par Hélène M.
// Doctrine 01-ARCHITECTURE.md §3.1 : "3 à 10 étapes selon la charge réelle".
// Sprint 43-stable : données mockées. Service Hélène réel = Sprint 41-prompts.

type RoadmapStep = {
  id: string
  label: string
  context?: string
  done?: boolean
}

type Props = {
  steps: ReadonlyArray<RoadmapStep>
  generatedAt?: string
}

export function AujourdhuiRoadmap({ steps, generatedAt }: Props) {
  return (
    <section className="roadmap glass-z2" aria-label="Parcours du jour">
      <header className="roadmap-header">
        <h2 className="roadmap-title">Aujourd'hui, voici ton parcours</h2>
        {generatedAt ? (
          <p className="roadmap-meta">Préparé par Hélène M. à {generatedAt}</p>
        ) : null}
      </header>
      <ol className="roadmap-steps">
        {steps.map((step, index) => (
          <li key={step.id} className={`roadmap-step ${step.done ? 'is-done' : ''}`}>
            <span className="roadmap-step-number">{index + 1}</span>
            <div className="roadmap-step-body">
              <div className="roadmap-step-label">{step.label}</div>
              {step.context ? <div className="roadmap-step-context">{step.context}</div> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
