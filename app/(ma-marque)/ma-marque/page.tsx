// Sprint 36.B.2 — Page Ma Marque : tableau de bord 4 blocs en Split Brief.
//
// Phrase contextuelle dynamique en tête (Pilier 4 — Aspirational storytelling).
// Quatre tuiles cliquables sous les champs texte :
//   Piliers narratifs · Cap de saison · Calendrier business · Ressources de production
// Chaque tuile ouvre un Split Brief plein écran 40/60.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { NavigationBar } from '@/components/layout/NavigationBar'
import { MaMarqueFields } from '@/components/ma-marque/MaMarqueFields'
import { CalendrierBusinessBloc } from '@/components/ma-marque/calendrier/CalendrierBusinessBloc'
import { ObjectifsBloc } from '@/components/ma-marque/objectifs/ObjectifsBloc'
import { RessourcesBloc } from '@/components/ma-marque/ressources/RessourcesBloc'
import { PiliersBloc } from '@/components/ma-marque/piliers/PiliersBloc'
import { getPhraseContextuelle, type BrandSnapshot } from '@/lib/ma-marque/score'
import { RESSOURCES_VIDES } from '@/types/ma-marque'
import type { MomentBusiness, Objectif, Ressources } from '@/types/ma-marque'
import type { PilierNarratif } from '@/types/programme'

export const dynamic = 'force-dynamic'

type BrandRow = {
  id: string
  name?: string | null
  secteur?: string | null
  ton?: string | null
  singularite?: string | null
  piliers_narratifs?: unknown
  calendrier_business?: unknown
  objectifs?: unknown
  ressources?: unknown
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

function asRessources(v: unknown): Ressources | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  return v as Ressources
}

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
    .select(
      'id, name, secteur, ton, singularite, piliers_narratifs, calendrier_business, objectifs, ressources',
    )
    .eq('id', brand.id)
    .maybeSingle()
  const extras = rawExtras as BrandRow | null

  const nom = extras?.name ?? brand.name ?? ''
  const secteur = extras?.secteur ?? ''
  const ton = extras?.ton ?? ''
  const singularite = extras?.singularite ?? ''

  const calendrierBusiness = asArray<MomentBusiness>(extras?.calendrier_business)
  const objectifs = asArray<Objectif>(extras?.objectifs)
  const ressources = asRessources(extras?.ressources)
  const piliersNarratifs = asArray<PilierNarratif>(extras?.piliers_narratifs)

  const snapshot: BrandSnapshot = {
    calendrierBusiness,
    objectifs,
    ressources,
    piliersNarratifs,
  }
  const phrase = getPhraseContextuelle(snapshot)

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
            maxWidth: 1080,
            margin: '0 auto',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >
          {/* Phrase contextuelle — narration humaine, ton calibré sur l'état réel. */}
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 19,
              lineHeight: 1.45,
              letterSpacing: '-0.005em',
              color: 'var(--color-secondary-label)',
              margin: 0,
              maxWidth: 640,
            }}
          >
            {phrase}
          </p>

          <MaMarqueFields
            initialValues={{
              name: nom,
              secteur,
              ton,
              singularite,
            }}
          />

          {/* Grille 2×2 des 4 blocs Split Brief. */}
          <section
            aria-label="Les quatre blocs de ta marque"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <PiliersBloc initialPiliers={piliersNarratifs} />
            <ObjectifsBloc initialObjectifs={objectifs} />
            <CalendrierBusinessBloc initialMoments={calendrierBusiness} />
            <RessourcesBloc initialRessources={ressources ?? RESSOURCES_VIDES} />
          </section>
        </div>
      </div>
    </div>
  )
}
