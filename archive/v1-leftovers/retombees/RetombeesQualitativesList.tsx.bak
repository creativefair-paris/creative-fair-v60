// Sprint 37.C (Chantier 5) — Liste des retombées qualitatives.
// Lit posts.retombees (champ texte saisi par le pilote sur la fiche post).
// Affichage en timeline par post : titre + date + texte retombée.

type PostRetombee = {
  id: string
  titre: string | null
  date_prevue: string | null
  retombees: string | null
  statut: string | null
}

export function RetombeesQualitativesList({
  posts,
}: {
  posts: ReadonlyArray<PostRetombee>
}) {
  const withRetombees = posts.filter(
    (p) => typeof p.retombees === 'string' && p.retombees.trim().length > 0,
  )

  if (withRetombees.length === 0) {
    return (
      <div
        className="glass-thin"
        style={{
          borderRadius: 14,
          padding: '20px 22px',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          color: 'var(--color-secondary-label)',
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        Pas de retombée renseignée pour l’instant. Tu peux ajouter une
        retombée depuis la fiche d’un post publié.
      </div>
    )
  }

  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {withRetombees.map((post) => (
        <li
          key={post.id}
          className="glass-thin"
          style={{
            borderRadius: 14,
            padding: '16px 20px',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--color-label)',
              }}
            >
              {post.titre ?? 'Post sans titre'}
            </span>
            {post.date_prevue ? (
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--color-tertiary-label)',
                }}
              >
                · {formatShortFr(post.date_prevue)}
              </span>
            ) : null}
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              lineHeight: 1.55,
              color: 'var(--color-label)',
            }}
          >
            {post.retombees}
          </p>
        </li>
      ))}
    </ul>
  )
}

function formatShortFr(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const mois = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
  ]
  return `${d.getDate()} ${mois[d.getMonth()]}`
}
