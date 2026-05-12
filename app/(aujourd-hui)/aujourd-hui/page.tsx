// Sprint 36.C — Page Aujourd'hui (nouvelle home).
// Server Component. Charge toutes les données en un passage côté serveur,
// puis délègue le rendu à AujourdhuiContent.

import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { AujourdhuiContent } from '@/components/aujourd-hui/AujourdhuiContent'
import { loadAujourdhuiData } from '@/lib/aujourd-hui/load-data'

export const dynamic = 'force-dynamic'

export default async function AujourdhuiPage() {
  const data = await loadAujourdhuiData()

  if (!data.authenticated) redirect('/login')
  if ('redirect' in data && data.redirect) {
    redirect(data.redirect)
  }
  // À ce point, data est de la variante complète (authenticated, sans redirect).
  if (!('postsToday' in data)) {
    // Garde TS — théoriquement inaccessible après les deux redirect ci-dessus.
    redirect('/login')
  }

  return (
    <div
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
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PageHeader title="Aujourd'hui" breadcrumb={["Aujourd'hui"]} />

        <div
          className="cfs-page-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 'var(--space-6)',
          }}
        >
          <AujourdhuiContent data={data} />
        </div>
      </div>
    </div>
  )
}
