// Sprint 36.C.2 — Filet de sécurité côté serveur pour le provisioning
// profile + tenant. En régime normal, le trigger PG handle_new_user fait
// le job automatiquement à chaque INSERT sur auth.users. ensureProfile()
// sert si le trigger plante ou pour les users créés avant restauration
// du trigger (orphelins pré-Sprint 36.C.2).
//
// Logique identique au trigger pour rester déterministe :
//   * slug dérivé de split_part(email, '@', 1) + slugify
//   * retry sur unique_violation max 5
//   * fallback UUID
//   * plan='b2b_custom', role='owner'

'use server'

import { createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type Result =
  | { ok: true; tenantId: string; created: boolean }
  | { ok: false; reason: 'unauthenticated' | 'admin_failed' | 'tenant_insert_failed' | 'profile_insert_failed' }

type ProfileRow = { tenant_id: string | null }
type TenantInsertRow = { id: string }

function slugifyEmailLocalPart(email: string): string {
  const local = email.split('@')[0] ?? ''
  // Cohérent avec la fonction PG : lowercase, non-alphanum → '-', trim dashes.
  let s = local.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  s = s.replace(/^-+|-+$/g, '')
  if (s.length === 0) return 'user'
  return s
}

function randomSuffix(): string {
  // 4 chars hex, suffisant pour départager une dizaine de collisions.
  // Le trigger PG utilise md5(random()::text) ; ici on reste sur la même
  // entropie effective.
  return Math.random().toString(16).slice(2, 6).padEnd(4, '0')
}

export async function ensureProfile(): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'unauthenticated' }

  const admin = createAdmin()
  if (!admin) return { ok: false, reason: 'admin_failed' }

  // Cast lâche : les types Supabase générés sont volontairement minimalistes.
  const adminTyped = admin as unknown as {
    from: (t: 'profiles' | 'tenants') => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: ProfileRow | null; error: { message: string } | null }>
        }
      }
      insert: (row: Record<string, unknown>) => {
        select: (cols: string) => {
          single: () => Promise<{ data: TenantInsertRow | null; error: { code?: string; message: string } | null }>
        }
      } & Promise<{ error: { code?: string; message: string } | null }>
    }
  }

  const email = user.email ?? `${user.id}@local.unknown`

  // 1. Profile déjà présent ?
  const { data: existing } = await adminTyped
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  if (existing?.tenant_id) {
    return { ok: true, tenantId: existing.tenant_id, created: false }
  }

  // 2. Création tenant avec retry sur slug.
  const baseSlug = slugifyEmailLocalPart(email)
  let candSlug = baseSlug
  let newTenantId: string | null = null

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await adminTyped
      .from('tenants')
      .insert({ slug: candSlug, name: email, plan: 'b2b_custom' })
      .select('id')
      .single()
    if (data?.id && !error) {
      newTenantId = data.id
      break
    }
    // 23505 = unique_violation sur Postgres. On retente avec suffix.
    if (error?.code !== '23505') {
      // Erreur non liée à la collision slug → on quitte la boucle pour
      // tomber dans le fallback UUID (plus robuste qu'un échec sec).
      break
    }
    candSlug = `${baseSlug}-${randomSuffix()}`
  }

  // 3. Fallback final : slug UUID-only.
  if (!newTenantId) {
    const uuid =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
    const fallbackSlug = `user-${uuid.replace(/-/g, '')}`
    const { data, error } = await adminTyped
      .from('tenants')
      .insert({ slug: fallbackSlug, name: email, plan: 'b2b_custom' })
      .select('id')
      .single()
    if (error || !data?.id) {
      return { ok: false, reason: 'tenant_insert_failed' }
    }
    newTenantId = data.id
  }

  // 4. INSERT profile (role 'owner', forcé sur le default DDL 'member').
  const insertProfilePromise = adminTyped
    .from('profiles')
    .insert({
      id: user.id,
      tenant_id: newTenantId,
      email,
      role: 'owner',
    })
  const profileResult = await (insertProfilePromise as unknown as Promise<{
    error: { code?: string; message: string } | null
  }>)

  if (profileResult.error) {
    // Course de timing : le trigger PG a pu créer le profile entre nos
    // checks. On retente la lecture.
    const { data: retry } = await adminTyped
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle()
    if (retry?.tenant_id) {
      return { ok: true, tenantId: retry.tenant_id, created: false }
    }
    return { ok: false, reason: 'profile_insert_failed' }
  }

  return { ok: true, tenantId: newTenantId, created: true }
}
