// Sprint 35 — Page Outils catalogue (cahier §5).
// Server Component. Pas de fetch côté serveur — catalogue statique.
// Redirection auth/onboarding identique au reste de l'app pour cohérence.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { NavigationBar } from '@/components/layout/NavigationBar'
import { ProgrammeOutilsToggle } from '@/components/layout/ProgrammeOutilsToggle'
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
        <NavigationBar title="Mes Outils" trailing={<ProgrammeOutilsToggle />} />

        <section
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-6) var(--space-5) var(--space-12)',
          }}
        >
          <CatalogueOutils />
        </section>
      </div>
    </main>
  )
}
