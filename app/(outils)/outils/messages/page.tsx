// Sprint 37.A (F8-bis) — Placeholder /outils/messages.
//
// Doc 09 §5 scénario B5 — modération DM/commentaires Instagram.
// Reporté V2 avec l'intégration API Meta. Cette page place l'entrée
// dans /outils pour que le pilote sache qu'elle arrive, sans mock
// trompeur (l'ancien mock Sprint 37 Lot 5 a été supprimé en F8).

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main
      className="min-h-screen"
      style={{ position: 'relative', background: 'var(--color-background)' }}
    >
      <div className="bg-halo bg-halo-1" aria-hidden="true" />
      <div className="bg-halo bg-halo-2" aria-hidden="true" />
      <div className="bg-halo bg-halo-3" aria-hidden="true" />

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
          title="Messages"
          subtitle="DM et commentaires Instagram"
          breadcrumb={["Aujourd'hui", { label: 'Outils', href: '/outils' }, 'Messages']}
        />

        <section
          className="cfs-page-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 'var(--space-12)',
            gap: 16,
            maxWidth: 640,
          }}
        >
          <article
            className="glass-thin"
            style={{
              borderRadius: 16,
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              border: '1px solid var(--color-separator)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--color-label)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Cet outil arrive bientôt.
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 15,
                lineHeight: 1.6,
                color: 'var(--color-secondary-label)',
                margin: 0,
              }}
            >
              Il te permettra de gérer tes DM clients et commentaires
              Instagram avec l&apos;aide du conseiller, sans quitter Creative
              Fair.
            </p>
          </article>

          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--color-tertiary-label)',
              margin: 0,
              padding: '0 4px',
            }}
          >
            En attendant, tu peux poser une question au conseiller depuis{' '}
            <Link
              href="/outils/conseiller"
              style={{ color: '#007AFF', textDecoration: 'none' }}
            >
              Conseiller
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
