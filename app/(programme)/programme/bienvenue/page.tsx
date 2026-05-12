// Sprint 36.A → 36.C.1 — Point d'entrée post-onboarding (Chantier D.1).
// Server Component. Vérifie auth + présence d'un programme actif.
// Redirige vers /aujourd-hui (home Sprint 36.C) si OK, sinon vers
// /onboarding/analyse-marque. L'écran d'attente narratif est géré
// côté client dans OnboardingFlow.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function BienvenuePage() {
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
  const tenantId = (rawProfile as { tenant_id?: string } | null)?.tenant_id
  if (!tenantId) redirect('/onboarding/analyse-marque')

  // Vérifier qu'au moins un programme actif existe pour ce tenant
  const { data: rawProgramme } = await supabase
    .from('programmes')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const programmeId = (rawProgramme as { id?: string } | null)?.id
  if (!programmeId) {
    redirect('/onboarding/analyse-marque')
  }

  redirect('/aujourd-hui')
}
