// Sprint 37.B (F11) — Primitive DocumentaryCard.
//
// Card aux normes Apple : image 16:9 (placeholder "Sans visuel" si
// imageUrl absent — pas de génération V1, sources autorisées BnF /
// Gallica / Getty Open / archives musées publics). Body avec titre,
// description, méta-données (date + source link).

type Props = {
  title: string
  description: string
  source?: string
  sourceUrl?: string
  imageUrl?: string
  date?: string
}

export function DocumentaryCard({
  title,
  description,
  source,
  sourceUrl,
  imageUrl,
  date,
}: Props) {
  return (
    <article className="documentary-card">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="documentary-card__image" src={imageUrl} alt={title} />
      ) : (
        <div className="documentary-card__image documentary-card__image--empty">
          Sans visuel
        </div>
      )}
      <div className="documentary-card__body">
        <h4 className="documentary-card__title">{title}</h4>
        <p className="documentary-card__description">{description}</p>
        {date || source ? (
          <div className="documentary-card__meta">
            {date ? <span>{date}</span> : null}
            {source ? (
              sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="documentary-card__source-link"
                >
                  {source}
                </a>
              ) : (
                <span>{source}</span>
              )
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
