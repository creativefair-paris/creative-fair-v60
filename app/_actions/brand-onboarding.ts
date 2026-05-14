// Sprint 37.C (F18) — Server actions du wizard guidé Ma Marque (14 étapes).
//
// Pattern hérité de wizard-session.ts (Sprint 37.B F16).
//
// Cycle :
//   1. createBrandOnboardingSession() → session_id (idempotent : reuse
//      d'une session IN_PROGRESS non expirée si elle existe)
//   2. updateBrandOnboardingStep(sessionId, stepIndex, response)
//   3. completeBrandOnboarding(sessionId) → transfère les responses vers
//      la table brands + marque la session COMPLETED
//   4. abandonBrandOnboarding(sessionId) → state ABANDONED
//   5. getResumableBrandOnboardingSession() → IN_PROGRESS la plus récente

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BrandOnboardingResponses,
  BrandOnboardingSessionRow,
} from '@/lib/brand-onboarding/types'
import { BRAND_ONBOARDING_TOTAL_STEPS } from '@/lib/brand-onboarding/types'

type RawRow = {
  id: string
  tenant_id: string
  user_id: string
  current_step: number
  total_steps: number
  responses: unknown
  state: string
  expires_at: string
  created_at: string
  updated_at: string
  completed_at: string | null
}

function fromRow(row: RawRow): BrandOnboardingSessionRow {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    user_id: row.user_id,
    current_step: row.current_step,
    total_steps: row.total_steps,
    responses:
      row.responses && typeof row.responses === 'object'
        ? (row.responses as BrandOnboardingResponses)
        : {},
    state: row.state as BrandOnboardingSessionRow['state'],
    expires_at: row.expires_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at,
  }
}

async function getCurrentTenantId(): Promise<{
  ok: true
  tenantId: string
  userId: string
} | { ok: false; reason: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId =
    (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) return { ok: false, reason: 'Tenant non provisionné' }
  return { ok: true, tenantId, userId: user.id }
}

// ── Création / reprise ───────────────────────────────────────────────────

export type CreateBrandOnboardingResult =
  | { ok: true; session: BrandOnboardingSessionRow }
  | { ok: false; reason: string }

export async function createBrandOnboardingSession(): Promise<CreateBrandOnboardingResult> {
  const ctx = await getCurrentTenantId()
  if (!ctx.ok) return { ok: false, reason: ctx.reason }
  const admin = createAdmin() as unknown as SupabaseClient
  const { data, error } = await admin
    .from('brand_onboarding_sessions')
    .insert({
      tenant_id: ctx.tenantId,
      user_id: ctx.userId,
      current_step: 0,
      total_steps: BRAND_ONBOARDING_TOTAL_STEPS,
      responses: {},
      state: 'IN_PROGRESS',
    })
    .select(
      'id, tenant_id, user_id, current_step, total_steps, responses, state, expires_at, created_at, updated_at, completed_at',
    )
    .single()
  if (error || !data) {
    return { ok: false, reason: error?.message ?? 'Insertion impossible' }
  }
  return { ok: true, session: fromRow(data as RawRow) }
}

// ── Reprise ─────────────────────────────────────────────────────────────

export async function getResumableBrandOnboardingSession(): Promise<BrandOnboardingSessionRow | null> {
  const ctx = await getCurrentTenantId()
  if (!ctx.ok) return null
  const admin = createAdmin() as unknown as SupabaseClient
  const { data } = await admin
    .from('brand_onboarding_sessions')
    .select(
      'id, tenant_id, user_id, current_step, total_steps, responses, state, expires_at, created_at, updated_at, completed_at',
    )
    .eq('tenant_id', ctx.tenantId)
    .eq('state', 'IN_PROGRESS')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  return fromRow(data as RawRow)
}

// ── Update step ─────────────────────────────────────────────────────────

export type UpdateBrandOnboardingStepResult =
  | { ok: true; session: BrandOnboardingSessionRow }
  | { ok: false; reason: string }

export async function updateBrandOnboardingStep(input: {
  sessionId: string
  stepIndex: number
  response: unknown
  advanceToNext?: boolean
}): Promise<UpdateBrandOnboardingStepResult> {
  const ctx = await getCurrentTenantId()
  if (!ctx.ok) return { ok: false, reason: ctx.reason }
  const admin = createAdmin() as unknown as SupabaseClient
  const { data: existing } = await admin
    .from('brand_onboarding_sessions')
    .select(
      'id, tenant_id, user_id, current_step, total_steps, responses, state, expires_at, created_at, updated_at, completed_at',
    )
    .eq('id', input.sessionId)
    .eq('tenant_id', ctx.tenantId)
    .maybeSingle()
  if (!existing) return { ok: false, reason: 'Session introuvable' }
  const row = existing as RawRow
  const merged: Record<string, unknown> = {
    ...((row.responses as Record<string, unknown>) ?? {}),
    [String(input.stepIndex)]: input.response,
  }
  const nextStep = input.advanceToNext
    ? Math.min(input.stepIndex + 1, BRAND_ONBOARDING_TOTAL_STEPS - 1)
    : row.current_step
  const { data: updated, error } = await admin
    .from('brand_onboarding_sessions')
    .update({
      responses: merged,
      current_step: nextStep,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.sessionId)
    .eq('tenant_id', ctx.tenantId)
    .select(
      'id, tenant_id, user_id, current_step, total_steps, responses, state, expires_at, created_at, updated_at, completed_at',
    )
    .single()
  if (error || !updated) {
    return { ok: false, reason: error?.message ?? 'Update impossible' }
  }
  return { ok: true, session: fromRow(updated as RawRow) }
}

// ── Complétion (transfert responses → brands) ────────────────────────────

export async function completeBrandOnboarding(input: {
  sessionId: string
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const ctx = await getCurrentTenantId()
  if (!ctx.ok) return { ok: false, reason: ctx.reason }
  const admin = createAdmin() as unknown as SupabaseClient
  const { data: existing } = await admin
    .from('brand_onboarding_sessions')
    .select('responses')
    .eq('id', input.sessionId)
    .eq('tenant_id', ctx.tenantId)
    .maybeSingle()
  if (!existing) return { ok: false, reason: 'Session introuvable' }

  const responses = ((existing as { responses?: BrandOnboardingResponses } | null)?.responses ?? {}) as BrandOnboardingResponses

  // Sprint 37.E (F59) — Mapping wizard 4 étapes → colonnes brands :
  //   step 0 : identité (nom + description_courte)
  //   step 1 : audience cible principale (stocké brand_book Sprint 38+)
  //   step 2 : piliers narratifs (3 piliers)
  //   step 3 : ton de voix (adjectifs + texte libre)
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (responses['0']?.nom) {
    updates.nom = responses['0'].nom
  }
  if (responses['2']?.piliers && responses['2'].piliers.length > 0) {
    updates.piliers_narratifs = responses['2'].piliers
  }
  if (responses['3']?.ton_texte) {
    updates.ton = responses['3'].ton_texte
  }

  if (Object.keys(updates).length > 1) {
    await admin
      .from('brands')
      .update(updates)
      .eq('tenant_id', ctx.tenantId)
  }

  const { error } = await admin
    .from('brand_onboarding_sessions')
    .update({
      state: 'COMPLETED',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.sessionId)
    .eq('tenant_id', ctx.tenantId)
  if (error) return { ok: false, reason: error.message }
  return { ok: true }
}

export async function abandonBrandOnboarding(input: {
  sessionId: string
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const ctx = await getCurrentTenantId()
  if (!ctx.ok) return { ok: false, reason: ctx.reason }
  const admin = createAdmin() as unknown as SupabaseClient
  const { error } = await admin
    .from('brand_onboarding_sessions')
    .update({
      state: 'ABANDONED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.sessionId)
    .eq('tenant_id', ctx.tenantId)
  if (error) return { ok: false, reason: error.message }
  return { ok: true }
}
