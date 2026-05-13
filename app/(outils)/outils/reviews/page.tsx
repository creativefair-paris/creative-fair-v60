// Sprint 37.A (F8) — /outils/reviews refondu en fact-check + crédits.
//
// Doc 09 §11 — TF Éditorial Magazine (Albane R.) + Archives & Mémoire
// (Élise M.). L'ancien mock modération B5 (Sprint 37 Lot 5) a été
// déplacé en placeholder /outils/messages (F8-bis).

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { ReviewsHistory } from '@/components/reviews/ReviewsHistory'
import { listReviews } from '@/lib/reviews/queries'

export const dynamic = 'force-dynamic'

export default async function ReviewsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const reviews = await listReviews(supabase)

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
        <PageHeader
          title="Reviews"
          subtitle="Fact-check texte et crédits visuel avant publication"
          breadcrumb={["Aujourd'hui", { label: 'Outils', href: '/outils' }, 'Reviews']}
        />

        <section
          className="cfs-page-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 'var(--space-12)',
          }}
        >
          <ReviewsHistory reviews={reviews} />
        </section>
      </div>
    </main>
  )
}
