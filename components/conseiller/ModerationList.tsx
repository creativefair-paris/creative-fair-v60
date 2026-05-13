// Sprint 37 (Lot 5) — Liste modération + CTA conseiller par item.
//
// Doc 09 §5 scénario B5 — modération quotidienne. Composant client
// pur rendu : pour V1, chaque item a un bouton "Affiner avec le
// conseiller" qui navigue vers /outils/conseiller?scenario=B5&... avec
// le contexte (auteur + texte) pré-rempli.
//
// Pas d'envoi automatique en V1 (doc 09 §5 B5 "pas d'envoi
// automatique en V1, le pilote copie-colle").

'use client'

import Link from 'next/link'
import {
  relativeTimeFr,
  type ModerationItem,
} from '@/lib/conseiller/moderation-mock'

type Props = {
  items: ReadonlyArray<ModerationItem>
}

function sensitivityBadge(s: ModerationItem['sensitivity']): {
  label: string
  color: string
  bg: string
} {
  if (s === 'sensitive') {
    return {
      label: 'Sensible',
      color: '#B25B00',
      bg: 'rgba(255, 149, 0, 0.12)',
    }
  }
  if (s === 'commercial') {
    return {
      label: 'Commercial',
      color: '#1F4937',
      bg: 'rgba(31, 73, 55, 0.10)',
    }
  }
  return {
    label: 'Neutre',
    color: 'var(--color-tertiary-label)',
    bg: 'rgba(0,0,0,0.04)',
  }
}

function kindLabel(k: ModerationItem['kind']): string {
  return k === 'dm' ? 'DM' : 'Commentaire'
}

function buildConseillerHref(item: ModerationItem): string {
  const params = new URLSearchParams({
    scenario: 'B5',
    message_text: item.text,
    message_author: item.author,
  })
  return `/outils/conseiller?${params.toString()}`
}

export function ModerationList({ items }: Props) {
  if (items.length === 0) {
    return (
      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          color: 'var(--color-secondary-label)',
          margin: 0,
        }}
      >
        Aucun message à modérer pour l'instant.
      </p>
    )
  }

  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {items.map((item) => {
        const badge = sensitivityBadge(item.sensitivity)
        return (
          <li key={item.id}>
            <article
              className="glass-thin"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: '16px 18px',
                borderRadius: 14,
                border: '1px solid var(--color-separator)',
              }}
            >
              <header
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-tertiary-label)',
                  }}
                >
                  {kindLabel(item.kind)}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--color-label)',
                  }}
                >
                  {item.author}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 12,
                    color: 'var(--color-tertiary-label)',
                  }}
                >
                  · {relativeTimeFr(item.received_at)}
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-system)',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 6,
                    color: badge.color,
                    background: badge.bg,
                  }}
                >
                  {badge.label}
                </span>
              </header>

              <p
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: 'var(--color-label)',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {item.text}
              </p>

              <footer
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: 4,
                }}
              >
                <Link
                  href={buildConseillerHref(item)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 18,
                    background: '#007AFF',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Affiner avec le conseiller →
                </Link>
              </footer>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
