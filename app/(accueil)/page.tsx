// Sprint 34 — Page Accueil bifurcation Mode 1 / Mode 2 (cahier §2.x)
// Server Component. Si pas de brand → redirect /onboarding/analyse-marque.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { BifurcationCards } from '@/components/accueil/BifurcationCards'

function extractFirstName(metadata: Record<string, unknown> | null, email: string | null): string {
  const raw = metadata ?? {}
  const first = typeof raw['first_name'] === 'string' ? (raw['first_name'] as string) : null
  if (first && first.length > 0) return first
  const full = typeof raw['full_name'] === 'string' ? (raw['full_name'] as string) : null
  if (full && full.length > 0) {
    const trimmed = full.trim().split(/\s+/)[0]
    if (trimmed) return trimmed
  }
  if (email && email.length > 0) {
    const local = email.split('@')[0] ?? ''
    if (local.length > 0) return local.charAt(0).toUpperCase() + local.slice(1)
  }
  return 'toi'
}

export default async function AccueilPage() {
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

  const firstName = extractFirstName(user.user_metadata ?? null, user.email ?? null)

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

      <section
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          gap: 'var(--space-8)',
        }}
      >
        <header style={{ textAlign: 'center', maxWidth: 640 }}>
          <h1 className="text-large-title" style={{ marginBottom: 'var(--space-3)' }}>
            Bonjour, {firstName}.
          </h1>
          <p className="text-body" style={{ color: 'var(--color-secondary-label)' }}>
            Que veux-tu faire aujourd&apos;hui ?
          </p>
        </header>

        <BifurcationCards />
      </section>
    </main>
  )
}
