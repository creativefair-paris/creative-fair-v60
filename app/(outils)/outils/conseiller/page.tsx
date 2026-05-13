// Sprint 35 → 37 Lot 3 — Page /outils/conseiller en mode historique.
//
// Avant : stub Sprint 35 (PageHeader seul).
// Maintenant : liste des conversations passées (lecture seule) +
// bouton "Nouvelle question" qui ouvre la sheet contextuelle.
//
// Doctrine doc 09 §8 (décision Apple #49) : la page dédiée n'est
// jamais un point d'entrée principal. C'est un point de reprise et
// d'historique.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConseillerHistory } from '@/components/conseiller/ConseillerHistory'
import { listConversations } from '@/lib/conseiller/queries'

export const dynamic = 'force-dynamic'

export default async function ConseillerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const conversations = await listConversations(supabase)

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
        <PageHeader title="Conseiller" />

        <section
          className="cfs-page-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 'var(--space-12)',
          }}
        >
          <ConseillerHistory conversations={conversations} />
        </section>
      </div>
    </main>
  )
}
