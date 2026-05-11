// Sprint 36.B — Page Ma Marque minimale (lecture seule).
// 4 champs onboarding + 3 piliers narratifs. Aucune édition pour Sprint 36.B
// (le tableau de bord enrichi est dette ouverte Sprint 36.B.2).

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { NavigationBar } from '@/components/layout/NavigationBar'
import type { PilierNarratif } from '@/types/programme'

export const dynamic = 'force-dynamic'

type BrandRow = {
  id: string
  name?: string | null
  secteur?: string | null
  ton?: string | null
  singularite?: string | null
  piliers_narratifs?: unknown
}

const PILIER_COLOR_VARS = ['var(--pilier-1)', 'var(--pilier-2)', 'var(--pilier-3)'] as const

export default async function MaMarquePage() {
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

  const { data: rawExtras } = await supabase
    .from('brands')
    .select('id, name, secteur, ton, singularite, piliers_narratifs')
    .eq('id', brand.id)
    .maybeSingle()
  const extras = rawExtras as BrandRow | null

  const nom = extras?.name ?? brand.name ?? ''
  const secteur = extras?.secteur ?? ''
  const ton = extras?.ton ?? ''
  const singularite = extras?.singularite ?? ''
  const piliers: PilierNarratif[] = Array.isArray(extras?.piliers_narratifs)
    ? (extras!.piliers_narratifs as PilierNarratif[])
    : []

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
        <NavigationBar title="Ma Marque" />

        <div
          style={{
            width: '100%',
            maxWidth: 680,
            margin: '0 auto',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          <Field label="Nom" value={nom} />
          <Field label="Secteur" value={secteur} />
          <Field label="Voix" value={ton} />
          <Field label="Singularité" value={singularite} />

          {piliers.length > 0 ? (
            <section
              className="glass-regular"
              style={{
                padding: 'var(--space-5)',
                borderRadius: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: '-0.015em',
                  color: 'var(--color-label)',
                  margin: 0,
                }}
              >
                Tes 3 piliers narratifs
              </h2>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                {piliers.map((pilier, i) => (
                  <li
                    key={pilier.nom}
                    className="glass-thin"
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 20,
                      borderLeft: `4px solid ${PILIER_COLOR_VARS[i] ?? PILIER_COLOR_VARS[0]}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 17,
                        fontWeight: 600,
                        color: 'var(--color-label)',
                      }}
                    >
                      {pilier.nom}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 15,
                        lineHeight: 1.4,
                        color: 'var(--color-secondary-label)',
                      }}
                    >
                      {pilier.description}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <section
      className="glass-thin"
      style={{
        padding: 'var(--space-5)',
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          color: 'var(--color-secondary-label)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 17,
          lineHeight: 1.4,
          color: 'var(--color-label)',
        }}
      >
        {value || '—'}
      </span>
    </section>
  )
}
