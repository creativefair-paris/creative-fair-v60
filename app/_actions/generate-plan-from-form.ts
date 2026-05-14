// Sprint 37.D (F35b) — Server action : génère un plan depuis le formulaire
// natif /programme/create. Crée une session wizard implicite avec les
// réponses du formulaire, puis appelle le même pipeline que le wizard.

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { generateFromWizardSession } from '@/lib/programme/wizard-generation'
import {
  WIZARD_TOTAL_STEPS,
  type CanonicalFormat,
  type ObjectifEditorial,
  type RiskCursor,
  type WizardResponses,
} from '@/lib/programme-creation/types'

export type ProgrammeCreateFormInput = {
  periodStart: string
  periodEnd: string
  businessAnchors: ReadonlyArray<string>
  sensitiveTopics: string
  pillarsWeights: Record<string, number>
  riskCursor: RiskCursor
  objectifs: ReadonlyArray<ObjectifEditorial>
  formats: ReadonlyArray<CanonicalFormat>
}

export type GenerateFromFormResult =
  | { ok: true; programmeId: string }
  | { ok: false; reason: string }

export async function generatePlanFromForm(
  input: ProgrammeCreateFormInput,
): Promise<GenerateFromFormResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id, publication_frequency')
    .eq('id', user.id)
    .maybeSingle()
  const profile = rawProfile as {
    tenant_id?: string | null
    publication_frequency?: 'discret' | 'equilibre' | 'dense' | null
  } | null
  const tenantId = profile?.tenant_id ?? null
  if (!tenantId) return { ok: false, reason: 'Tenant non provisionné' }

  if (!input.periodStart || !input.periodEnd) {
    return { ok: false, reason: 'Période manquante' }
  }
  if (new Date(input.periodStart) >= new Date(input.periodEnd)) {
    return { ok: false, reason: 'Période invalide' }
  }
  if (input.formats.length === 0) {
    return { ok: false, reason: 'Aucun format choisi' }
  }

  const admin = createAdmin() as unknown as SupabaseClient

  // Sprint 37.E — Mapping form natif → nouvelle structure 9 étapes.
  // V1 : le formulaire natif F35b n'expose pas encore Mix mode / objectif
  // business / cadence séparée. On utilise des défauts.
  const cadence: 'discreet' | 'balanced' | 'dense' =
    profile?.publication_frequency === 'discret' ? 'discreet'
    : profile?.publication_frequency === 'dense' ? 'dense'
    : 'balanced'
  const engagement: 'prudent' | 'pose' | 'engage' =
    input.riskCursor === 'safe' ? 'prudent'
    : input.riskCursor === 'risky' ? 'engage'
    : 'pose'
  const responses: WizardResponses = {
    '0': { period_start: input.periodStart, period_end: input.periodEnd },
    '1': { mix_mode: 'full_cf' },
    '2': { business_anchors: [...input.businessAnchors] },
    '3': { sensitive_topics: input.sensitiveTopics },
    '5': { cadence, engagement },
    '6': {
      objectif_editorial: input.objectifs[0],
    },
    '7': { formats: input.formats },
  }

  // 1. Créer une session implicite COMPLETED
  const { data: sessionRow, error: sessionErr } = await admin
    .from('programme_creation_sessions')
    .insert({
      tenant_id: tenantId,
      user_id: user.id,
      current_step: WIZARD_TOTAL_STEPS - 1,
      total_steps: WIZARD_TOTAL_STEPS,
      responses,
      state: 'IN_PROGRESS',
    })
    .select('id')
    .single()
  if (sessionErr || !sessionRow) {
    return { ok: false, reason: sessionErr?.message ?? 'Session implicite échouée' }
  }
  const sessionId = (sessionRow as { id: string }).id

  // 2. Charge la marque
  const { data: rawBrand } = await admin
    .from('brands')
    .select('id, name, secteur, ton, singularite, piliers_narratifs')
    .eq('tenant_id', tenantId)
    .maybeSingle()
  const brand = rawBrand as {
    id: string
    name: string | null
    secteur: string | null
    ton: string | null
    singularite: string | null
    piliers_narratifs: unknown
  } | null
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

  // 3. Génère
  const result = await generateFromWizardSession({
    admin,
    sessionId,
    tenantId,
    brandId: brand.id,
    brandName: brand.name ?? 'Ma marque',
    brandSecteur: brand.secteur,
    brandTon: brand.ton,
    brandSingularite: brand.singularite,
    pillarsCatalog,
    responses,
    publicationFrequency: profile?.publication_frequency ?? null,
    userId: user.id,
  })

  // 4. Marque la session COMPLETED (idempotent)
  await admin
    .from('programme_creation_sessions')
    .update({
      state: 'COMPLETED',
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  return result
}
