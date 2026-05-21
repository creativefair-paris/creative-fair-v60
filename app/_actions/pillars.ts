// Sprint 37.K (F89) — Server actions CRUD piliers persistés.
// Sprint 41-secu-compte (A) — Patch P0 multi-tenant : ajout filtre
// .eq('tenant_id', tenantId) sur tous les createAdmin (UPDATE + ARCHIVE).
//
// Pipeline :
//   listPillars(brandId) → PillarRow[]
//   createPillar(input) → PillarRow inséré (position auto-calculée)
//   updatePillar(id, updates) → PillarRow modifié (filtré tenant_id)
//   archivePillar(id) → soft delete (filtré tenant_id)
//
// RLS appliqué côté DB via public.user_tenant_id() (migration 025).
// Pattern canonique : requireTenantContext() + admin.eq('tenant_id', tenantId).

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import { requireTenantContext } from '@/lib/supabase/tenant-guard'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PillarRow } from '@/lib/pillars/types'
import { PILLARS_HARD_CAP } from '@/lib/pillars/types'

export type ListPillarsResult =
  | { ok: true; pillars: ReadonlyArray<PillarRow> }
  | { ok: false; reason: string }

export async function listPillars(brandId: string): Promise<ListPillarsResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const { data, error } = await supabase
    .from('pillars')
    .select(
      'id, tenant_id, brand_id, title, description, color_hex, position, questions_answers, generation_model, archived_at, created_at, updated_at',
    )
    .eq('brand_id', brandId)
    .is('archived_at', null)
    .order('position', { ascending: true })

  if (error) {
    console.error('[pillars] list_failed', { code: error.code, message: error.message })
    return { ok: false, reason: error.message }
  }
  return { ok: true, pillars: (data as PillarRow[] | null) ?? [] }
}

export type CreatePillarInput = {
  brandId: string
  title: string
  description: string
  questionsAnswers?: Record<string, string>
  colorHex?: string
}

export type CreatePillarResult =
  | { ok: true; pillar: PillarRow }
  | { ok: false; reason: string }

export async function createPillar(input: CreatePillarInput): Promise<CreatePillarResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  // Validation côté code (les contraintes DB couvrent les longueurs max).
  const title = input.title.trim()
  const description = input.description.trim()
  if (!title) return { ok: false, reason: 'Titre vide' }
  if (!description) return { ok: false, reason: 'Description vide' }
  // Max 3 mots sur le titre (validation applicative, le DB autorise jusqu'à 50 char).
  const wordCount = title.split(/\s+/).filter((w) => w.length > 0).length
  if (wordCount > 3) {
    return { ok: false, reason: 'Le titre fait plus de 3 mots' }
  }

  // Récupère le tenant_id via le profile.
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) return { ok: false, reason: 'Tenant non provisionné' }

  // Cap V1 : refus si déjà 7 piliers actifs.
  const { count } = await supabase
    .from('pillars')
    .select('id', { count: 'exact', head: true })
    .eq('brand_id', input.brandId)
    .is('archived_at', null)
  if ((count ?? 0) >= PILLARS_HARD_CAP) {
    return { ok: false, reason: `Maximum ${PILLARS_HARD_CAP} piliers atteint` }
  }

  // Position : max+1.
  const { data: rawMax } = await supabase
    .from('pillars')
    .select('position')
    .eq('brand_id', input.brandId)
    .is('archived_at', null)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  const maxPosition = (rawMax as { position?: number } | null)?.position
  const nextPosition = typeof maxPosition === 'number' ? maxPosition + 1 : 0

  const admin = createAdmin() as unknown as SupabaseClient
  const { data, error } = await admin
    .from('pillars')
    .insert({
      brand_id: input.brandId,
      tenant_id: tenantId,
      title,
      description,
      color_hex: input.colorHex ?? null,
      position: nextPosition,
      questions_answers: input.questionsAnswers ?? null,
      generation_model: 'sonnet-4-6',
    })
    .select(
      'id, tenant_id, brand_id, title, description, color_hex, position, questions_answers, generation_model, archived_at, created_at, updated_at',
    )
    .single()

  if (error || !data) {
    console.error('[pillars] create_failed', { message: error?.message, code: error?.code })
    return { ok: false, reason: error?.message ?? 'Création impossible' }
  }
  revalidatePath('/ma-marque')
  return { ok: true, pillar: data as PillarRow }
}

export type UpdatePillarResult =
  | { ok: true; pillar: PillarRow }
  | { ok: false; reason: string }

export async function updatePillar(
  id: string,
  updates: Partial<Pick<PillarRow, 'title' | 'description' | 'color_hex' | 'position'>>,
): Promise<UpdatePillarResult> {
  // Sprint 41-secu-compte (A) : check tenant_id obligatoire avant UPDATE.
  let tenantId: string
  try {
    const ctx = await requireTenantContext()
    tenantId = ctx.tenantId
  } catch {
    return { ok: false, reason: 'Non authentifié' }
  }

  // Validation titre si modifié.
  if (typeof updates.title === 'string') {
    const title = updates.title.trim()
    if (!title) return { ok: false, reason: 'Titre vide' }
    const wordCount = title.split(/\s+/).filter((w) => w.length > 0).length
    if (wordCount > 3) {
      return { ok: false, reason: 'Le titre fait plus de 3 mots' }
    }
    updates.title = title
  }
  if (typeof updates.description === 'string') {
    const description = updates.description.trim()
    if (!description) return { ok: false, reason: 'Description vide' }
    updates.description = description
  }

  const admin = createAdmin() as unknown as SupabaseClient
  const { data, error } = await admin
    .from('pillars')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select(
      'id, tenant_id, brand_id, title, description, color_hex, position, questions_answers, generation_model, archived_at, created_at, updated_at',
    )
    .single()

  if (error || !data) {
    console.error('[pillars] update_failed', { id, message: error?.message })
    return { ok: false, reason: error?.message ?? 'Update impossible' }
  }
  revalidatePath('/ma-marque')
  return { ok: true, pillar: data as PillarRow }
}

export type ArchivePillarResult =
  | { ok: true }
  | { ok: false; reason: string }

export async function archivePillar(id: string): Promise<ArchivePillarResult> {
  // Sprint 41-secu-compte (A) : check tenant_id obligatoire avant ARCHIVE.
  let tenantId: string
  try {
    const ctx = await requireTenantContext()
    tenantId = ctx.tenantId
  } catch {
    return { ok: false, reason: 'Non authentifié' }
  }

  const admin = createAdmin() as unknown as SupabaseClient
  const { error } = await admin
    .from('pillars')
    .update({
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) {
    console.error('[pillars] archive_failed', { id, message: error.message })
    return { ok: false, reason: error.message }
  }
  revalidatePath('/ma-marque')
  return { ok: true }
}
