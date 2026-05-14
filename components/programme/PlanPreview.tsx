// Sprint 37.D (F34) — Aperçu du plan généré.
//
// Affiché en haut de /programme quand le pilote arrive depuis le wizard
// (?newPlan=programmeId). Liste verticale de posts avec pastille
// colorée par format + date + objectif + description brève.
//
// Pas de timeline visuelle. Séparateurs subtils entre posts.

import Link from 'next/link'

const FORMAT_COLOR: Record<string, string> = {
  anecdote: '#007AFF',
  produit: '#34C759',
  evenement: '#FF9500',
  coulisses: '#AF52DE',
  manifeste: '#FF3B30',
  question: '#5856D6',
}

const FORMAT_LABEL: Record<string, string> = {
  anecdote: 'Anecdote',
  produit: 'Produit',
  evenement: 'Événement',
  coulisses: 'Coulisses',
  manifeste: 'Manifeste',
  question: 'Question',
}

const STRUCTURE_LABEL: Record<string, string> = {
  carrousel: 'Carrousel',
  photo: 'Photo',
  reel: 'Reel',
}

type PostPreviewRow = {
  id: string
  date_prevue: string | null
  format: string | null
  structure_type: string | null
  pilier_nom: string | null
  objectif_editorial: string | null
  angle: string | null
  titre: string | null
}

type Props = {
  posts: ReadonlyArray<PostPreviewRow>
  periodStart?: string | null
  periodEnd?: string | null
}

export function PlanPreview({ posts, periodStart, periodEnd }: Props) {
  if (posts.length === 0) return null
  return (
    <section
      aria-label="Aperçu du plan généré"
      className="glass-regular"
      style={{
        borderRadius: 18,
        padding: '24px 24px 20px 24px',
        marginBottom: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: 'rgba(251, 250, 247, 0.85)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--color-label)',
            letterSpacing: '-0.015em',
            margin: 0,
            lineHeight: 1.25,
          }}
        >
          Ton plan{periodStart && periodEnd ? ` du ${formatShortFr(periodStart)} au ${formatShortFr(periodEnd)}` : ''}
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            color: 'var(--color-secondary-label)',
          }}
        >
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} générés
        </p>
      </header>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
        {posts.map((p, i) => (
          <li
            key={p.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: '14px 0',
              borderBottom:
                i < posts.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {p.date_prevue ? (
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-label)',
                    minWidth: 110,
                  }}
                >
                  {formatLongFr(p.date_prevue)}
                </span>
              ) : null}
              {p.format ? <FormatBadge format={p.format} /> : null}
              {p.structure_type ? (
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--color-secondary-label)',
                    background: 'rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    padding: '3px 8px',
                    borderRadius: 6,
                  }}
                >
                  {STRUCTURE_LABEL[p.structure_type] ?? p.structure_type}
                </span>
              ) : null}
            </div>
            {p.objectif_editorial ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-system)',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--color-label)',
                  lineHeight: 1.4,
                }}
              >
                {p.objectif_editorial}
              </p>
            ) : null}
            {p.angle ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'var(--color-secondary-label)',
                }}
              >
                {p.angle}
              </p>
            ) : null}
            {p.pilier_nom ? (
              <span
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-tertiary-label)',
                  marginTop: 2,
                }}
              >
                Pilier : {p.pilier_nom}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <footer style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <Link
          href="/programme"
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Valider ce plan
        </Link>
      </footer>
    </section>
  )
}

function FormatBadge({ format }: { format: string }) {
  const color = FORMAT_COLOR[format] ?? '#8E8E93'
  const label = FORMAT_LABEL[format] ?? format
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 6,
        fontFamily: 'var(--font-system)',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#FFFFFF',
        background: color,
      }}
    >
      {label}
    </span>
  )
}

function formatShortFr(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `${d.getDate()} ${mois[d.getMonth()]}`
}

function formatLongFr(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const jours = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.']
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`
}
