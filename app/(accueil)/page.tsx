// Sprint 34 → 36.C.2 — Page racine '/'.
//
// /aujourd-hui devient la home : pour les utilisateurs avec brand complète,
// on redirige direct vers /aujourd-hui plutôt que d'afficher la bifurcation.
// Les checks auth + tenant + brand restent.
//
// Sprint 36.C.2 : ensureProfile() comme filet si le trigger PG n'a pas
// tiré (orphelin pré-restauration ou rare régression d'exécution).
//
// Server Component, redirect uniquement — pas de UI rendue.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { ensureProfile } from '@/app/_actions/ensure-profile'

export const dynamic = 'force-dynamic'

export default async function AccueilPage() {
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

  let tenantId = (rawProfile as { tenant_id?: string } | null)?.tenant_id ?? null
  if (!tenantId) {
    const provision = await ensureProfile()
    if (provision.ok) {
      tenantId = provision.tenantId
    } else {
      console.warn(`[accueil] ensureProfile failed for ${user.id}: ${provision.reason}`)
      redirect('/onboarding/analyse-marque')
    }
  }

  const brand = await getBrandByTenantId(supabase, tenantId)
  if (!brand || brand.brand_book_status !== 'complete') {
    redirect('/onboarding/analyse-marque')
  }

  redirect('/aujourd-hui')
}
