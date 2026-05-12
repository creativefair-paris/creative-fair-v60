// Sprint 36.B.3 — Page Ma Marque : tableau de bord 14 rangs (pattern iOS Settings).
//
// Server Component. Lit la marque + les archives, construit le snapshot,
// délègue toute l'interaction (sheets) au client MaMarqueDashboard.
//
// Phrase contextuelle dynamique en tête (Pilier 4 — aspirational storytelling).
// Aucun pourcentage exposé. Compteur N/14 admissible (lisible, pas gamifié).

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { NavigationBar } from '@/components/layout/NavigationBar'
import { MaMarqueDashboard } from '@/components/ma-marque/MaMarqueDashboard'
import type { BrandSnapshot14 } from '@/lib/ma-marque/completude'
import type {
  MomentBusiness,
  Objectif,
  Ressources,
  Benchmark,
  Canaux,
  BrandBook,
  BrandArchive,
} from '@/types/ma-marque'
import type { PilierNarratif } from '@/types/programme'

export const dynamic = 'force-dynamic'

type BrandRow = {
  id: string
  name?: string | null
  secteur?: string | null
  ton?: string | null
  singularite?: string | null
  cible?: string | null
  univers_refuse?: string | null
  piliers_narratifs?: unknown
  calendrier_business?: unknown
  objectifs?: unknown
  ressources?: unknown
  benchmarks?: unknown
  canaux?: unknown
  brand_book?: unknown
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

function asObjet<T>(v: unknown): T | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  return v as T
}

// Ressources : reject incomplete `{}`.
function asRessources(v: unknown): Ressources | null {
  const o = asObjet<Record<string, unknown>>(v)
  if (!o) return null
  if (typeof o.photo !== 'string' || typeof o.video !== 'string') return null
  return o as unknown as Ressources
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

  // Sélectionne tous les champs (texte + JSONB nouveaux et anciens).
  // Si la migration 009 n'est pas encore appliquée, les colonnes manquantes
  // remontent en `null` et les helpers `??` / `asXxx` gèrent gracieusement.
  const { data: rawExtras } = await supabase
    .from('brands')
    .select(
      'id, name, secteur, ton, singularite, cible, univers_refuse, piliers_narratifs, calendrier_business, objectifs, ressources, benchmarks, canaux, brand_book',
    )
    .eq('id', brand.id)
    .maybeSingle()
  const extras = rawExtras as BrandRow | null

  // ── Archives — lecture via admin (RLS gérée serveur)
  let archives: BrandArchive[] = []
  try {
    const admin = createAdmin()
    const adminTyped = admin as unknown as {
      from: (t: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            order: (col: string, opts: { ascending: boolean }) => Promise<{
              data: BrandArchive[] | null
              error: { message: string } | null
            }>
          }
        }
      }
    }
    const { data: arr } = await adminTyped
      .from('brand_archives')
      .select('id, type, titre, description, url, fichier_path, tags, created_at, updated_at')
      .eq('brand_id', brand.id)
      .order('created_at', { ascending: false })
    if (Array.isArray(arr)) archives = arr
  } catch {
    // table absente → tableau vide, la sheet Archives reste utilisable.
    archives = []
  }

  const snapshot: BrandSnapshot14 = {
    nom: extras?.name ?? brand.name ?? '',
    secteur: extras?.secteur ?? '',
    ton: extras?.ton ?? '',
    singularite: extras?.singularite ?? '',
    cible: extras?.cible ?? '',
    piliers: asArray<PilierNarratif>(extras?.piliers_narratifs),
    capSaison: '',
    objectifs: asArray<Objectif>(extras?.objectifs),
    universRefuse: extras?.univers_refuse ?? '',
    benchmarks: asArray<Benchmark>(extras?.benchmarks),
    calendrierBusiness: asArray<MomentBusiness>(extras?.calendrier_business),
    ressources: asRessources(extras?.ressources),
    canaux: asObjet<Canaux>(extras?.canaux),
    brandBook: asObjet<BrandBook>(extras?.brand_book),
    archivesCount: archives.length,
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
        <NavigationBar title="Ma Marque" />

        <div
          style={{
            width: '100%',
            maxWidth: 720,
            margin: '0 auto',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <MaMarqueDashboard snapshot={snapshot} archives={archives} />
        </div>
      </div>
    </div>
  )
}
