// Sprint 37.H (F72) — Routes placeholder /outils/post-creator/[format].
//
// 4 formats supportés (V1) : anecdote / produit / evenement / manifeste.
// Chaque route affiche la roadmap (phases visibles, étapes non implémentées)
// + CTA fallback "Discuter avec le conseiller →".
//
// L'expérience interactive complète arrive Sprint 38+.

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  ROADMAPS,
  FORMAT_LABELS,
  FORMAT_COLORS,
  type RoadmapFormat,
} from '@/lib/post-creator/roadmaps'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ format: string }> }

const SUPPORTED: ReadonlySet<RoadmapFormat> = new Set<RoadmapFormat>([
  'anecdote',
  'produit',
  'evenement',
  'manifeste',
])

function isSupported(f: string): f is RoadmapFormat {
  return SUPPORTED.has(f as RoadmapFormat)
}

export default async function PostCreatorFormatPage({ params }: PageProps) {
  const { format } = await params
  if (!isSupported(format)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const roadmap = ROADMAPS[format]
  const label = FORMAT_LABELS[format]
  const color = FORMAT_COLORS[format]

  return (
    <main style={{ minHeight: '100vh' }}>
      <PageHeader title={label} />
      <div
        className="cfs-page-container"
        style={{
          paddingTop: 'var(--space-4)',
          paddingBottom: 'var(--space-12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Breadcrumb 3 niveaux */}
        <nav
          aria-label="Fil d'ariane"
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            fontSize: 13,
            color: 'var(--color-tertiary-label)',
          }}
        >
          <Link
            href="/outils"
            style={{ color: 'var(--color-secondary-label)', textDecoration: 'none' }}
          >
            Mes Outils
          </Link>
          <span aria-hidden="true">›</span>
          <Link
            href="/outils/post-creator"
            style={{ color: 'var(--color-secondary-label)', textDecoration: 'none' }}
          >
            Post Creator
          </Link>
          <span aria-hidden="true">›</span>
          <span>{label}</span>
        </nav>

        <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
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
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--color-label)',
              margin: 0,
            }}
          >
            Roadmap {label}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.55,
              color: 'var(--color-secondary-label)',
            }}
          >
            Voici les étapes pour créer un post {label.toLowerCase()}. L&apos;expérience
            interactive complète arrive bientôt.
          </p>
        </header>

        <ol
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {roadmap.map((step, idx) => (
            <li
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: 12,
                opacity: 0.75,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.04)',
                  fontFamily: 'var(--font-system)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--color-secondary-label)',
                }}
              >
                {idx + 1}
              </span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-system)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-label)',
                  }}
                >
                  {step.label}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: 'var(--color-secondary-label)',
                  }}
                >
                  {step.description}
                </p>
              </div>
              <span
                style={{
                  flexShrink: 0,
                  alignSelf: 'center',
                  fontFamily: 'var(--font-system)',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-tertiary-label)',
                }}
              >
                Bientôt
              </span>
            </li>
          ))}
        </ol>

        <footer
          className="glass-thin"
          style={{
            padding: '20px 22px',
            borderRadius: 14,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              lineHeight: 1.55,
              color: 'var(--color-secondary-label)',
            }}
          >
            L&apos;expérience interactive complète arrive Sprint 38+. En attendant,
            tu peux discuter de tes idées de post {label.toLowerCase()} avec le conseiller.
          </p>
          <Link
            href={`/outils/conseiller?context=post_creator&format=${format}`}
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Discuter avec le conseiller →
          </Link>
        </footer>
      </div>
    </main>
  )
}
