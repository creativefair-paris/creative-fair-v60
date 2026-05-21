// Sprint 43-stable — Suggestions pour cette semaine (Mon Programme)
// Doctrine 02-EXPERTS.md §6.2 : Hélène M. génère 3 suggestions.
// V1 : données mockées. Service réel = Sprint 41-prompts.

type Suggestion = {
  id: string
  kind: 'planning' | 'series' | 'delegate'
  eyebrow: string
  title: string
  description: string
}

type Props = {
  suggestions: ReadonlyArray<Suggestion>
}

export function MonProgrammeSuggestions({ suggestions }: Props) {
  return (
    <section className="mp-section">
      <div className="mp-eyebrow">Suggestions pour cette semaine</div>
      <div className="mp-suggestions">
        {suggestions.map((sug) => (
          <article key={sug.id} className={`mp-sugg is-${sug.kind} glass-z2`}>
            <div className="mp-sugg-eyebrow">{sug.eyebrow}</div>
            <h3 className="mp-sugg-title">{sug.title}</h3>
            <p className="mp-sugg-desc">{sug.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
