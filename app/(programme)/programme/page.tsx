// Sprint 35 — Page Programme (cahier §4 — destination Mode 1).
// Server Component. Toujours état vide ce sprint : table programmes
// non utilisée avant Sprint 36 (génération IA reportée).

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { Button } from '@/components/ui/Button'
import { NavigationBar } from '@/components/layout/NavigationBar'
import { ProgrammeOutilsToggle } from '@/components/layout/ProgrammeOutilsToggle'

export default async function ProgrammePage() {
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
        <NavigationBar title="Mon Programme" trailing={<ProgrammeOutilsToggle />} />

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
              L&apos;IA analyse ta marque et génère un plan sur mesure.
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
      </div>
    </main>
  )
}
