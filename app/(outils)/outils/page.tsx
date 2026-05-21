// Sprint 35 — Page Outils catalogue (cahier §5).
// Server Component. Pas de fetch côté serveur — catalogue statique.
// Redirection auth/onboarding identique au reste de l'app pour cohérence.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { PageHeader } from '@/components/layout/PageHeader'
import { OutilsCatalog } from '@/components/outils/OutilsCatalog'

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
      {/* Sprint 40 Phase 2B — halos bg-halo-N retirés (wallpaper saturated
          réservé à Aujourd'hui uniquement, doctrine 01-ARCHITECTURE.md §3.4). */}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sprint 36.B.5 — PageHeader unifié. */}
        <PageHeader title="Mes Outils" />

        {/* Sprint 36.B.8 — cfs-page-container aligne sur 1200px/24px comme les autres pages. */}
        <section
          className="cfs-page-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 'var(--space-12)',
          }}
        >
          <OutilsCatalog />
        </section>
      </div>
    </main>
  )
}
