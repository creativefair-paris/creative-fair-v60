// Sprint 35 → 37 Lot 5 — Interface modération minimale.
//
// Doc 09 §5 groupe B / scénario B5 — modération quotidienne. V1 mocké
// (pas encore d'API Meta intégrée). Liste de DM/commentaires reçus
// avec bouton "Affiner avec le conseiller" qui ouvre la
// ConseillerSheet scénario B5 préchargée du contexte (auteur + texte).
//
// Sprint 38 branchera l'API Meta. Le mock est en lib/conseiller/
// moderation-mock.ts pour être supprimable d'un seul fichier.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { ModerationList } from '@/components/conseiller/ModerationList'
import { MODERATION_MOCK_ITEMS } from '@/lib/conseiller/moderation-mock'

export const dynamic = 'force-dynamic'

export default async function ReviewsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // V1 : mock. Sprint 38 : fetch depuis l'API Meta avec persistence DB.
  const items = MODERATION_MOCK_ITEMS

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
          title="Modération"
          subtitle="Messages reçus en DM et commentaires"
        />

        <section
          className="cfs-page-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 'var(--space-12)',
            gap: 20,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              lineHeight: 1.55,
              color: 'var(--color-secondary-label)',
              margin: 0,
              padding: '12px 14px',
              borderRadius: 10,
              background: 'rgba(0,0,0,0.03)',
              maxWidth: 640,
            }}
          >
            V1 — Aperçu mocké pour tester le flux conseiller. Sprint 38
            branchera l'API Meta (DM + commentaires en temps réel).
          </p>

          <ModerationList items={items} />
        </section>
      </div>
    </main>
  )
}
