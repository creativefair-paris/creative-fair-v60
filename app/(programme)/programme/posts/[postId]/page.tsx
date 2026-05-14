// Sprint 37.E (F58) — Fiche post éditable (workflow B).
//
// Layout Split Brief : sidebar gauche avec tous les posts du programme
// + colonne droite avec l'éditeur du post sélectionné.

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { SplitBrief } from '@/components/layouts/SplitBrief'
import { PostEditor } from '@/components/programme/PostEditor'
import { PostMiniChat } from '@/components/programme/PostMiniChat'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ postId: string }> }

type PostRow = {
  id: string
  programme_id: string
  pilier_nom: string | null
  date_prevue: string | null
  format: string | null
  structure_type: string | null
  objectif_editorial: string | null
  angle: string | null
  caption_complete: string | null
  visuel_url: string | null
  statut: string | null
  titre: string | null
}

const FORMAT_COLOR: Record<string, string> = {
  anecdote: '#007AFF',
  produit: '#34C759',
  evenement: '#FF9500',
  coulisses: '#AF52DE',
  manifeste: '#FF3B30',
  question: '#5856D6',
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
    .select(
      'id, programme_id, pilier_nom, date_prevue, format, structure_type, objectif_editorial, angle, caption_complete, visuel_url, statut, titre',
    )
    .eq('id', postId)
    .maybeSingle()
  const post = rawPost as PostRow | null
  if (!post) notFound()

  // Sidebar : tous les posts du même programme.
  const { data: rawAllPosts } = await supabase
    .from('posts')
    .select('id, titre, date_prevue, format, objectif_editorial')
    .eq('programme_id', post.programme_id)
    .order('date_prevue', { ascending: true })
  type SidebarPost = {
    id: string
    titre: string | null
    date_prevue: string | null
    format: string | null
    objectif_editorial: string | null
  }
  const allPosts = (rawAllPosts as SidebarPost[] | null) ?? []

  // Catalogue de piliers : prend la liste unique des pilier_nom du programme.
  const piliersSet = new Set<string>()
  for (const p of allPosts) {
    // (allPosts ne contient pas pilier_nom; on l'enrichirait Sprint 37.F)
    void p
  }
  if (post.pilier_nom) piliersSet.add(post.pilier_nom)
  const pillarsCatalog = Array.from(piliersSet)

  return (
    <main
      className="min-h-screen"
      style={{ position: 'relative', background: 'var(--color-background)' }}
    >
      <div className="bg-halo bg-halo-1" aria-hidden="true" />
      <div className="bg-halo bg-halo-2" aria-hidden="true" />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PageHeader title="Mon Programme" />

        <div
          className="cfs-page-container"
          style={{
            paddingTop: 'var(--space-4)',
            paddingBottom: 'var(--space-12)',
          }}
        >
          {/* Breadcrumb local */}
          <nav
            aria-label="Fil d'ariane"
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              fontSize: 13,
              color: 'var(--color-tertiary-label)',
              marginBottom: 20,
            }}
          >
            <Link
              href="/programme"
              style={{ color: 'var(--color-secondary-label)', textDecoration: 'none' }}
            >
              Mon Programme
            </Link>
            <span aria-hidden="true">›</span>
            <span>{post.titre ?? 'Post'}</span>
          </nav>

          <SplitBrief
            mobileOrder="left-first"
            leftColumn={
              <aside style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-tertiary-label)',
                    margin: '0 0 4px 4px',
                  }}
                >
                  Posts du programme
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {allPosts.map((p) => {
                    const isActive = p.id === postId
                    return (
                      <li key={p.id}>
                        <Link
                          href={`/programme/posts/${p.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 10,
                            textDecoration: 'none',
                            background: isActive ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
                            border: isActive
                              ? '1px solid rgba(0, 122, 255, 0.2)'
                              : '1px solid rgba(0, 0, 0, 0.04)',
                          }}
                        >
                          {p.format ? (
                            <span
                              aria-hidden="true"
                              style={{
                                flexShrink: 0,
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                background: FORMAT_COLOR[p.format] ?? '#8E8E93',
                              }}
                            />
                          ) : null}
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                display: 'block',
                                fontFamily: 'var(--font-system)',
                                fontSize: 13,
                                fontWeight: 500,
                                color: 'var(--color-label)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {p.objectif_editorial ?? p.titre ?? 'Sans titre'}
                            </span>
                            {p.date_prevue ? (
                              <span
                                style={{
                                  display: 'block',
                                  fontFamily: 'var(--font-system)',
                                  fontSize: 11,
                                  color: 'var(--color-tertiary-label)',
                                }}
                              >
                                {p.date_prevue}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </aside>
            }
            rightColumn={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <article
                  style={{
                    padding: '24px 26px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <PostEditor post={post} pillarsCatalog={pillarsCatalog} />
                </article>
                {/* Sprint 37.H (F69) — Mini chat déplacé depuis le Calendrier
                    (Sprint 37.F F48). 3 tours max → bascule scénario B2. */}
                <PostMiniChat postId={post.id} />
              </div>
            }
          />
        </div>
      </div>
    </main>
  )
}
