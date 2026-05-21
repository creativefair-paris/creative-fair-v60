// Sprint 37.D (F34) — Server action : génère un plan depuis une session
// wizard A1 complétée. Bridge entre WizardImmersiveSheet et le pipeline
// `lib/programme/wizard-generation.ts`.

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { generateFromWizardSession } from '@/lib/programme/wizard-generation'
import type { WizardResponses } from '@/lib/programme-creation/types'

type SessionRow = {
  id: string
  tenant_id: string
  user_id: string
  responses: unknown
  state: string
}

type BrandRow = {
  id: string
  name: string | null
  secteur: string | null
  ton: string | null
  singularite: string | null
  piliers_narratifs: unknown
}

type ProfileRow = {
  publication_frequency: 'discret' | 'equilibre' | 'dense' | null
}

export type GeneratePlanResult =
  | { ok: true; programmeId: string }
  | { ok: false; reason: string }

export async function generatePlanFromWizardSession(
  sessionId: string,
): Promise<GeneratePlanResult> {
  // Sprint 41-secu-compte (A) : tenant context obligatoire.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const userTenantId = (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!userTenantId) return { ok: false, reason: 'Tenant non provisionné' }

  const admin = createAdmin() as unknown as SupabaseClient

  // 1. Charge la session (filtres tenant_id + user_id obligatoires)
  const { data: rawSession } = await admin
    .from('programme_creation_sessions')
    .select('id, tenant_id, user_id, responses, state')
    .eq('id', sessionId)
    .eq('tenant_id', userTenantId)
    .eq('user_id', user.id)
    .maybeSingle()
  const session = rawSession as SessionRow | null
  if (!session) return { ok: false, reason: 'Session introuvable' }
  if (session.state === 'EXPIRED' || session.state === 'ABANDONED') {
    return { ok: false, reason: `Session ${session.state}` }
  }

  const responses = (session.responses && typeof session.responses === 'object'
    ? session.responses
    : {}) as WizardResponses

  // Vérifie que les étapes minimales sont présentes
  if (!responses['0']?.period_start || !responses['0']?.period_end) {
    return { ok: false, reason: 'Période wizard manquante (étape 1).' }
  }

  // 2. Charge la marque
  const { data: rawBrand } = await admin
    .from('brands')
    .select('id, name, secteur, ton, singularite, piliers_narratifs')
    .eq('tenant_id', session.tenant_id)
    .maybeSingle()
  const brand = rawBrand as BrandRow | null
  if (!brand) return { ok: false, reason: 'Marque introuvable' }

  const pillarsCatalog = Array.isArray(brand.piliers_narratifs)
    ? brand.piliers_narratifs
        .map((p, i) => {
          if (p && typeof p === 'object' && 'nom' in p && typeof (p as Record<string, unknown>).nom === 'string') {
            return { id: `pilier-${i}`, nom: (p as { nom: string }).nom }
          }
          return null
        })
        .filter((x): x is { id: string; nom: string } => x !== null)
    : []

  // 3. Profile.publication_frequency
  const { data: rawProfileFreq } = await admin
    .from('profiles')
    .select('publication_frequency')
    .eq('id', user.id)
    .maybeSingle()
  const publicationFrequency = (rawProfileFreq as ProfileRow | null)?.publication_frequency ?? null

  // 4. Appel pipeline
  return generateFromWizardSession({
    admin,
    sessionId: session.id,
    tenantId: session.tenant_id,
    brandId: brand.id,
    brandName: brand.name ?? 'Ma marque',
    brandSecteur: brand.secteur,
    brandTon: brand.ton,
    brandSingularite: brand.singularite,
    pillarsCatalog,
    responses,
    publicationFrequency,
    userId: user.id,
  })
}
