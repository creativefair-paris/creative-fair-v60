// Sprint 36.A — Page Programme : timeline verticale ou état vide (Chantier D.3).
// Server Component. Auth chain identique Sprint 35.
// Si programme actif présent : timeline 3 cards.
// Sinon : empty state Sprint 35 (bouton désactivé).

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { Button } from '@/components/ui/Button'
import { NavigationBar } from '@/components/layout/NavigationBar'
import { ChipAction } from '@/components/ui/ChipAction'
import { Timeline } from '@/components/programme/Timeline'
import { WelcomeURLCleaner } from '@/components/programme/WelcomeURLCleaner'
import type { PilierNarratif, PostRow } from '@/types/programme'

export const dynamic = 'force-dynamic'

type BrandRowWithExtras = {
  id: string
  piliers_narratifs?: unknown
}

type ProgrammeRow = {
  id: string
  arc_narratif: unknown
}

type ProgrammePageProps = {
  searchParams?: Promise<{ welcome?: string }>
}

export default async function ProgrammePage({ searchParams }: ProgrammePageProps) {
  const resolvedSearch = (await searchParams) ?? {}
  const isWelcome = resolvedSearch.welcome === 'true'

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

  const tenantId = (rawProfile as { tenant_id?: string } | null)?.tenant_id ?? null
  if (!tenantId) redirect('/onboarding/analyse-marque')

  const brand = await getBrandByTenantId(supabase, tenantId)
  if (!brand || brand.brand_book_status !== 'complete') {
    redirect('/onboarding/analyse-marque')
  }

  // Récupération piliers (colonne brands.piliers_narratifs, Sprint 36.A)
  let piliers: PilierNarratif[] = []
  const { data: rawBrandExtras } = await supabase
    .from('brands')
    .select('id, piliers_narratifs')
    .eq('id', brand.id)
    .maybeSingle()
  const extras = rawBrandExtras as BrandRowWithExtras | null
  if (extras && Array.isArray(extras.piliers_narratifs)) {
    piliers = extras.piliers_narratifs as PilierNarratif[]
  }

  // Récupération programme actif le plus récent
  const { data: rawProgramme } = await supabase
    .from('programmes')
    .select('id, arc_narratif')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const programme = rawProgramme as ProgrammeRow | null

  let posts: PostRow[] = []
  let arcNarratif = ''

  if (programme) {
    // Extraction du thème depuis arc_narratif (forme { semaines: [{ theme }] })
    const arc = programme.arc_narratif as
      | { semaines?: Array<{ theme?: string }> }
      | null
    arcNarratif = arc?.semaines?.[0]?.theme ?? ''

    const { data: rawPosts } = await supabase
      .from('posts')
      .select(
        'id, programme_id, tenant_id, brand_id, pilier_nom, jour, date_prevue, heure_prevue, titre, angle, type_contenu, statut, contenu_genere, created_at, updated_at',
      )
      .eq('programme_id', programme.id)
      .order('date_prevue', { ascending: true })

    if (Array.isArray(rawPosts)) {
      posts = rawPosts as unknown as PostRow[]
    }
  }

  const hasProgramme = programme != null && posts.length > 0

  return (
    <main
      className="min-h-screen"
      style={{ position: 'relative', background: 'var(--color-background)' }}
    >
      <div className="bg-halo bg-halo-1" aria-hidden="true" />
      <div className="bg-halo bg-halo-2" aria-hidden="true" />
      <div className="bg-halo bg-halo-3" aria-hidden="true" />
      <div className="bg-halo bg-halo-4" aria-hidden="true" />
      <div className="bg-halo bg-halo-5" aria-hidden="true" />
      <div className="bg-halo bg-halo-6" aria-hidden="true" />

      <div
        className={`programme-wrapper${isWelcome ? ' is-welcome' : ''}`}
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isWelcome ? <WelcomeURLCleaner /> : null}
        <NavigationBar title="Mon Programme" />

        {hasProgramme ? (
          <>
            <div
              className="cfs-page-actions"
              style={{
                width: '100%',
                maxWidth: 680,
                margin: '0 auto',
                padding: '0 var(--space-5)',
                marginTop: 16,
                marginBottom: 32,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <ChipAction label="Voir un post" href="#timeline-start" />
              <ChipAction label="Enrichir ma marque" href="/ma-marque" />
            </div>
            <Timeline posts={posts} piliers={piliers} arcNarratif={arcNarratif} />
          </>
        ) : (
          <section
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-6)',
              gap: 'var(--space-5)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-5)',
                maxWidth: 560,
                width: '100%',
              }}
            >
              <h1
                style={{
                  fontSize: 'var(--text-title-1-size)',
                  fontWeight: 700,
                  letterSpacing: '-0.022em',
                  color: 'var(--color-label)',
                  margin: 0,
                }}
              >
                Ton programme éditorial n&apos;existe pas encore.
              </h1>
              <p
                className="text-body"
                style={{
                  color: 'var(--color-secondary-label)',
                  margin: 0,
                }}
              >
                Creative Fair analyse ta marque et structure ton plan éditorial.
              </p>
              <Button
                disabled
                aria-disabled="true"
                title="Génération en préparation"
              >
                Générer mon programme
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
