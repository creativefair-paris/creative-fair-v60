// Sprint 37.B (F16) — Server actions du wizard immersif A1.
//
// Cycle :
//   1. createProgrammeCreationSession(periodStart, periodEnd) → session_id
//   2. updateProgrammeCreationSessionStep(sessionId, stepIndex, response)
//   3. generateProgrammeFromSession(sessionId) → marque la session
//      COMPLETED + appelle le pipeline de génération existant
//   4. abandonProgrammeCreationSession(sessionId) → state ABANDONED
//      (sortie volontaire confirmée par le pilote)
//   5. getResumableProgrammeCreationSession() → session IN_PROGRESS la
//      plus récente du pilote courant (non expirée)

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type {
  WizardResponses,
  WizardSessionRow,
  WizardStepIndex,
} from '@/lib/programme-creation/types'
import { WIZARD_TOTAL_STEPS } from '@/lib/programme-creation/types'

type RawRow = {
  id: string
  tenant_id: string
  user_id: string
  conseiller_conversation_id: string | null
  current_step: number
  total_steps: number
  responses: unknown
  state: string
  expires_at: string
  created_at: string
  updated_at: string
  completed_at: string | null
}

function fromRow(row: RawRow): WizardSessionRow {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    user_id: row.user_id,
    conseiller_conversation_id: row.conseiller_conversation_id,
    current_step: row.current_step,
    total_steps: row.total_steps,
    responses:
      row.responses && typeof row.responses === 'object'
        ? (row.responses as WizardResponses)
        : {},
    state: row.state as WizardSessionRow['state'],
    expires_at: row.expires_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at,
  }
}

// ── Création ─────────────────────────────────────────────────────────────

export type CreateWizardSessionResult =
  | { ok: true; session: WizardSessionRow }
  | { ok: false; reason: string }

export async function createProgrammeCreationSession(input: {
  periodStart: string
  periodEnd: string
}): Promise<CreateWizardSessionResult> {
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
  const tenantId =
    (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) return { ok: false, reason: 'Tenant non provisionné' }

  if (!input.periodStart || !input.periodEnd) {
    return { ok: false, reason: 'Période invalide' }
  }
  if (new Date(input.periodStart) >= new Date(input.periodEnd)) {
    return { ok: false, reason: 'La date de fin doit être après la date de début' }
  }

  const admin = createAdmin()
  const adminSess = admin as unknown as {
    from: (t: 'programme_creation_sessions') => {
      insert: (row: Record<string, unknown>) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: RawRow | null
            error: { message: string } | null
          }>
        }
      }
    }
  }
  const initialResponses: WizardResponses = {
    '0': { period_start: input.periodStart, period_end: input.periodEnd },
  }
  const { data, error } = await adminSess
    .from('programme_creation_sessions')
    .insert({
      tenant_id: tenantId,
      user_id: user.id,
      current_step: 1, // step 0 (période) déjà validé
      total_steps: WIZARD_TOTAL_STEPS,
      responses: initialResponses,
      state: 'IN_PROGRESS',
    })
    .select(
      'id, tenant_id, user_id, conseiller_conversation_id, current_step, total_steps, responses, state, expires_at, created_at, updated_at, completed_at',
    )
    .single()
  if (error || !data) {
    return { ok: false, reason: `Création échouée : ${error?.message ?? 'no row'}` }
  }
  return { ok: true, session: fromRow(data) }
}

// ── Update step ──────────────────────────────────────────────────────────

export type UpdateWizardStepResult =
  | { ok: true; session: WizardSessionRow }
  | { ok: false; reason: string }

export async function updateProgrammeCreationSessionStep(input: {
  sessionId: string
  stepIndex: WizardStepIndex
  response: WizardResponses[keyof WizardResponses]
  advance: boolean
}): Promise<UpdateWizardStepResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  // Lecture pour merger les responses existantes (RLS via select).
  const { data: rawExisting } = await supabase
    .from('programme_creation_sessions')
    .select(
      'id, tenant_id, user_id, conseiller_conversation_id, current_step, total_steps, responses, state, expires_at, created_at, updated_at, completed_at',
    )
    .eq('id', input.sessionId)
    .maybeSingle()
  if (!rawExisting) return { ok: false, reason: 'Session introuvable' }
  const existing = fromRow(rawExisting as RawRow)
  if (existing.state !== 'IN_PROGRESS') {
    return { ok: false, reason: `Session ${existing.state.toLowerCase()}` }
  }

  const newResponses: WizardResponses = {
    ...existing.responses,
    [String(input.stepIndex)]: input.response,
  } as WizardResponses

  const newCurrentStep = input.advance
    ? Math.min(input.stepIndex + 1, WIZARD_TOTAL_STEPS - 1)
    : existing.current_step

  const admin = createAdmin()
  const adminSess = admin as unknown as {
    from: (t: 'programme_creation_sessions') => {
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => {
          select: (cols: string) => {
            single: () => Promise<{
              data: RawRow | null
              error: { message: string } | null
            }>
          }
        }
      }
    }
  }
  const { data, error } = await adminSess
    .from('programme_creation_sessions')
    .update({
      responses: newResponses,
      current_step: newCurrentStep,
    })
    .eq('id', input.sessionId)
    .select(
      'id, tenant_id, user_id, conseiller_conversation_id, current_step, total_steps, responses, state, expires_at, created_at, updated_at, completed_at',
    )
    .single()
  if (error || !data) {
    return { ok: false, reason: `Update échoué : ${error?.message ?? 'no row'}` }
  }
  return { ok: true, session: fromRow(data) }
}

// ── Abandon (sortie volontaire) ──────────────────────────────────────────

export async function abandonProgrammeCreationSession(
  sessionId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const admin = createAdmin()
  const adminSess = admin as unknown as {
    from: (t: 'programme_creation_sessions') => {
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{
          error: { message: string } | null
        }>
      }
    }
  }
  const { error } = await adminSess
    .from('programme_creation_sessions')
    .update({ state: 'ABANDONED' })
    .eq('id', sessionId)
  if (error) return { ok: false, reason: error.message }
  return { ok: true }
}

// ── Resumable ────────────────────────────────────────────────────────────

export async function getResumableProgrammeCreationSession(): Promise<WizardSessionRow | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('programme_creation_sessions')
    .select(
      'id, tenant_id, user_id, conseiller_conversation_id, current_step, total_steps, responses, state, expires_at, created_at, updated_at, completed_at',
    )
    .eq('state', 'IN_PROGRESS')
    .gt('expires_at', new Date().toISOString())
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  return fromRow(data as RawRow)
}

// ── Complete + déclenche génération ──────────────────────────────────────
// V1 minimaliste : marque la session COMPLETED. L'appel à la génération
// réelle (lib/programme/generation.ts) est laissé au caller — il est
// déjà câblé Sprint 36.C.2 via runConseillerTurn A1. Le wizard livre
// les responses persistées comme contexte alternatif.

export async function completeProgrammeCreationSession(
  sessionId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const admin = createAdmin()
  const adminSess = admin as unknown as {
    from: (t: 'programme_creation_sessions') => {
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{
          error: { message: string } | null
        }>
      }
    }
  }
  const { error } = await adminSess
    .from('programme_creation_sessions')
    .update({
      state: 'COMPLETED',
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
  if (error) return { ok: false, reason: error.message }
  return { ok: true }
}
