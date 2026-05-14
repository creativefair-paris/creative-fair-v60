// Sprint 35 — Stub Post Creator (Pilier 6 strict).
// Sprint 37.C (F26) — guard de jalon : si pas de programme actif ou marque
// non posée, JalonHero rediriger vers étape structurante.
// Sprint 37.H (F72) — Hub Post Creator : preview Instagram iOS + 4 formats
// supportés (Anecdote/Produit/Événement/Manifeste) cliquables vers leurs
// routes [format] placeholder + 2 formats à venir (Question/Coulisses).

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkJalonStatus } from '@/lib/jalons/check-jalons'
import { JalonHero } from '@/components/jalons/JalonHero'
import { PageHeader } from '@/components/layout/PageHeader'
import { ToolMockup } from '@/components/outils/ToolMockup'
import { FormatCard } from '@/components/outils/post-creator/FormatCard'

export const dynamic = 'force-dynamic'

export default async function PostCreatorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId =
    (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) redirect('/onboarding/analyse-marque')

  const status = await checkJalonStatus(supabase, tenantId)
  const jalonReached = status.marque.complete && status.programme.hasActive

  return (
    <main style={{ minHeight: '100vh' }}>
      <PageHeader title="Post Creator" />
      <div
        className="cfs-page-container"
        style={{
          paddingTop: 'var(--space-6)',
          paddingBottom: 'var(--space-12)',
        }}
      >
        {!jalonReached ? (
          <JalonHero jalon={!status.marque.complete ? 'marque' : 'programme'} />
        ) : (
          <article
            className="glass-regular"
            style={{
              borderRadius: 20,
              padding: '32px 36px',
              background: 'rgba(251, 250, 247, 0.7)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="cfs-post-creator-hub-grid">
              {/* Sprint 37.G F66 swap colonnes : contenu à gauche, mockup à droite. */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
                <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-system)',
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: '-0.015em',
                      color: 'var(--color-label)',
                    }}
                  >
                    Post Creator
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-system)',
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: 'var(--color-label)',
                    }}
                  >
                    Rédige et programme tes publications Instagram. Chaque post part
                    d&apos;un de tes piliers narratifs et garde la voix de ta marque.
                  </p>
                </header>

                {/* Section Supportés */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--color-tertiary-label)',
                    }}
                  >
                    Supportés
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 10,
                    }}
                    className="cfs-format-grid"
                  >
                    <FormatCard
                      format="anecdote"
                      label="Anecdote"
                      href="/outils/post-creator/anecdote"
                      description="Raconter une histoire qui sert un pilier."
                    />
                    <FormatCard
                      format="produit"
                      label="Produit"
                      href="/outils/post-creator/produit"
                      description="Mettre en avant une création avec son histoire."
                    />
                    <FormatCard
                      format="evenement"
                      label="Événement"
                      href="/outils/post-creator/evenement"
                      description="Annoncer une date qui compte."
                    />
                    <FormatCard
                      format="manifeste"
                      label="Manifeste"
                      href="/outils/post-creator/manifeste"
                      description="Affirmer une position forte."
                    />
                  </div>
                </section>

                {/* Section À venir */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--color-tertiary-label)',
                    }}
                  >
                    À venir
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 10,
                    }}
                    className="cfs-format-grid"
                  >
                    <FormatCard
                      format="question"
                      label="Question"
                      disabled
                      description="Faire réagir la communauté."
                    />
                    <FormatCard
                      format="coulisses"
                      label="Coulisses"
                      disabled
                      description="Montrer le geste, l'atelier, la fabrication."
                    />
                  </div>
                </section>
              </div>

              {/* Mockup Instagram à droite */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ToolMockup toolType="post-creator" />
              </div>
            </div>

            <style>{`
              .cfs-post-creator-hub-grid {
                display: grid;
                grid-template-columns: 1fr 320px;
                gap: 32px;
                align-items: start;
              }
              @media (max-width: 900px) {
                .cfs-post-creator-hub-grid {
                  grid-template-columns: 1fr;
                  gap: 24px;
                }
                .cfs-format-grid {
                  grid-template-columns: 1fr !important;
                }
              }
            `}</style>
          </article>
        )}
      </div>
    </main>
  )
}
