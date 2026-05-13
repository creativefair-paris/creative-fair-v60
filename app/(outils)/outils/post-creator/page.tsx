// Sprint 35 — Stub Post Creator (Pilier 6 strict).
// Sprint 37.C (F26) — guard de jalon : si le pilote n'a pas de programme
// actif (ou de marque posée), on lui montre un hero qui le redirige
// vers la prochaine étape structurante avant d'arriver ici.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkJalonStatus } from '@/lib/jalons/check-jalons'
import { JalonHero } from '@/components/jalons/JalonHero'
import { PageHeader } from '@/components/layout/PageHeader'

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
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {!jalonReached ? (
          <JalonHero jalon={!status.marque.complete ? 'marque' : 'programme'} />
        ) : (
          <section
            style={{
              padding: 'var(--space-6)',
              textAlign: 'center',
              color: 'var(--color-secondary-label)',
            }}
          >
            <p style={{ fontSize: 15, margin: 0 }}>
              Post Creator est en cours de finition pour le sprint suivant.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
