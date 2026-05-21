// Sprint 37.B (F11) — Primitive Timeline.
//
// Calendrier d'activation : ligne verticale 1px à gauche, points
// pour chaque étape (cercle blanc bordé gris par défaut, ou bleu
// rempli pour type=milestone). Date en small caps + titre + desc.
//
// Utilisé pour : calendriers A1 (arc narratif programme), D8
// (activations en 3 temps), C3a (plan de gestion crise).

type TimelineItem = {
  date: string
  title: string
  description?: string
  type?: 'milestone' | 'standard'
}

type Props = {
  items: ReadonlyArray<TimelineItem>
}

export function Timeline({ items }: Props) {
  return (
    <ol className="timeline">
      {items.map((item, i) => (
        <li
          key={i}
          className="timeline__item"
          data-type={item.type ?? 'standard'}
        >
          <span className="timeline__date">{item.date}</span>
          <span className="timeline__title" style={{ display: 'block' }}>
            {item.title}
          </span>
          {item.description ? (
            <span className="timeline__description" style={{ display: 'block' }}>
              {item.description}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
