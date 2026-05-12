// Sprint 35 — Page Outils catalogue (cahier §5).
// Server Component. Pas de fetch côté serveur — catalogue statique.
// Redirection auth/onboarding identique au reste de l'app pour cohérence.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { NavigationBar } from '@/components/layout/NavigationBar'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CatalogueOutils } from '@/components/outils/CatalogueOutils'

export default async function OutilsPage() {
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

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sprint 36.B.4 — H1 + breadcrumb portés dans la colonne contenu. */}
        <NavigationBar title="" />

        <section
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px var(--space-5) var(--space-12)',
            gap: 24,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 1080,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <Breadcrumb items={["Aujourd'hui", 'Mes Outils']} />
            <h1
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#1C1C1E',
                margin: 0,
              }}
            >
              Mes Outils
            </h1>
          </div>
          <CatalogueOutils />
        </section>
      </div>
    </main>
  )
}
