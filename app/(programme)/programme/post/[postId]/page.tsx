// Sprint 36.B → 37 Lot 7 — Page détail post.
//
// Précédemment placeholder. Sprint 37 Lot 7 active le champ
// Retombées (doc 09 §8) — visible et éditable UNIQUEMENT pour les
// posts statut = 'publie', sinon section invisible.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { RetombeesEditor } from '@/components/programme/RetombeesEditor'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ postId: string }> }

type PostRow = {
  id: string
  titre: string | null
  type_contenu: string | null
  pilier_nom: string | null
  date_prevue: string | null
  heure_prevue: string | null
  statut: string | null
  retombees: string | null
}

export default async function PostDetailPage({ params }: PageProps) {
  const { postId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawPost } = await supabase
    .from('posts')
    .select('id, titre, type_contenu, pilier_nom, date_prevue, heure_prevue, statut, retombees')
    .eq('id', postId)
    .maybeSingle()
  const post = rawPost as PostRow | null

  if (!post) {
    return (
      <main
        className="min-h-screen"
        style={{ position: 'relative', background: 'var(--color-background)' }}
      >
        <PageHeader title="Post" />
        <section className="cfs-page-container" style={{ padding: '40px 0' }}>
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              color: 'var(--color-secondary-label)',
            }}
          >
            Ce post n&apos;existe plus ou n&apos;est pas accessible.
          </p>
        </section>
      </main>
    )
  }

  const isPublished = post.statut === 'publie'

  return (
    <main
      className="min-h-screen"
      style={{ position: 'relative', background: 'var(--color-background)' }}
    >
      <div className="bg-halo bg-halo-1" aria-hidden="true" />
      <div className="bg-halo bg-halo-2" aria-hidden="true" />
      <div className="bg-halo bg-halo-3" aria-hidden="true" />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PageHeader title={post.titre ?? 'Post'} />

        <section
          className="cfs-page-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            paddingBottom: 'var(--space-12)',
          }}
        >
          <article
            className="glass-thin"
            style={{
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
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
              {post.statut ?? 'planifié'}
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--color-label)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {post.titre ?? 'Sans titre'}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 13,
                color: 'var(--color-secondary-label)',
                margin: 0,
              }}
            >
              {post.pilier_nom ?? '—'} · {post.type_contenu ?? '—'} · {post.date_prevue ?? '—'}
              {post.heure_prevue ? ` · ${post.heure_prevue.slice(0, 5)}` : ''}
            </p>
          </article>

          {/* Sprint 37 Lot 7 — Retombées visibles uniquement si statut='publie'
              (doc 09 §8). Sur les autres statuts, la section reste invisible. */}
          {isPublished ? (
            <RetombeesEditor postId={post.id} initialValue={post.retombees} />
          ) : null}
        </section>
      </div>
    </main>
  )
}
