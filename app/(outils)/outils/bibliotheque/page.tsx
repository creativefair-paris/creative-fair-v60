// Sprint 37.A (F9) — Page /outils/bibliotheque V1.
//
// Doc 09 §11 — espace centralisé de la marque côté pilote.
// V1 = UI + upload + listing + preview. RAG + attachment dans le
// chat conseiller reportés Sprint 38.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { LibraryView } from '@/components/library/LibraryView'
import { loadLibrary } from '@/lib/library/queries'

export const dynamic = 'force-dynamic'

export default async function BibliothequePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const items = await loadLibrary(supabase)

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
          title="Bibliothèque"
          subtitle="Tout ce que tu as, en un seul endroit."
          breadcrumb={["Aujourd'hui", { label: 'Outils', href: '/outils' }, 'Bibliothèque']}
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
          <LibraryView items={items} />
        </section>
      </div>
    </main>
  )
}
