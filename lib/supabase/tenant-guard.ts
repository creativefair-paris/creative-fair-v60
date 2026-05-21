// Sprint 41-secu-compte (chantier A) — Helper sécurité multi-tenant.
//
// Doctrine 04-MULTI_TENANT.md + Sprint 40 10-transverse.md §1 :
// pattern fautif `createAdmin() + .eq('id', x)` sans filtre tenant_id
// = bypass RLS = faille P0 multi-tenant.
//
// Ce helper factorise les deux opérations canoniques :
//   1. Récupération du tenant_id courant depuis la session utilisateur.
//   2. Vérification d'appartenance d'une entité au tenant.
//
// Usage canonique dans une Server Action / Route Handler :
//
//   const { user, tenantId } = await requireTenantContext()
//   // Si lance, c'est que pas d'auth ou pas de tenant — gérer en amont.
//
//   const owned = await assertOwnership('posts', postId, tenantId)
//   if (!owned) throw new Error('forbidden')
//   // Sécurisé : on sait que postId appartient au tenant de l'utilisateur.

import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'

// ── Erreurs typées ──────────────────────────────────────────────────────

export class UnauthorizedError extends Error {
  constructor(message = 'unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class NoTenantError extends Error {
  constructor(message = 'no_tenant') {
    super(message)
    this.name = 'NoTenantError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

// ── Récupération du contexte tenant ─────────────────────────────────────

export type TenantContext = {
  user: { id: string; email: string | null }
  tenantId: string
}

/**
 * Récupère le tenant_id courant depuis la session utilisateur.
 * Lève UnauthorizedError si pas d'utilisateur connecté.
 * Lève NoTenantError si l'utilisateur n'a pas de profile/tenant_id.
 *
 * Cette fonction est SÉCURISÉE : elle ne lit jamais le tenant_id depuis
 * un input client. Elle interroge `profiles` côté serveur via createClient()
 * (donc RLS active). C'est la seule source autorisée.
 */
export async function requireTenantContext(): Promise<TenantContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new UnauthorizedError()
  }

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (profileRaw as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) {
    throw new NoTenantError()
  }

  return {
    user: { id: user.id, email: user.email ?? null },
    tenantId,
  }
}

/**
 * Variante non-throwing pour les contextes qui veulent gérer eux-mêmes
 * l'erreur (ex: API route qui retourne du JSON).
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  try {
    return await requireTenantContext()
  } catch {
    return null
  }
}

// ── Assertion d'appartenance ────────────────────────────────────────────

type TenantOwnedTable =
  | 'posts'
  | 'brands'
  | 'pillars'
  | 'reviews'
  | 'library_documents'
  | 'programmes'
  | 'conversations'
  | 'reminders'
  | 'alerts'
  | 'uploads'
  | 'onboarding_answers'
  | 'channel_waitlist'
  | 'brand_onboarding_sessions'
  | 'programme_creation_sessions'
  | 'brand_metrics'

/**
 * Vérifie qu'une entité (identifiée par son `id`) appartient bien au tenant
 * fourni. Lance ForbiddenError sinon.
 *
 * Cette fonction utilise `createAdmin()` car certaines tables peuvent avoir
 * des restrictions de RLS qui empêchent la lecture cross-tenant explicite.
 * Mais le filtre `.eq('tenant_id', tenantId)` est OBLIGATOIRE et garantit
 * que seules les entités appartenant au tenant courant matchent.
 *
 * @param table — nom de la table (whitelist typée).
 * @param id — identifiant de l'entité à vérifier.
 * @param tenantId — tenant courant (depuis requireTenantContext()).
 * @returns true si l'entité appartient au tenant. Sinon lance ForbiddenError.
 */
export async function assertOwnership(
  table: TenantOwnedTable,
  id: string,
  tenantId: string,
): Promise<true> {
  if (!id || !tenantId) {
    throw new ForbiddenError('missing_id_or_tenant')
  }
  const admin = createAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin.from(table) as any)
    .select('tenant_id')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .maybeSingle()
  if (error || !data) {
    throw new ForbiddenError(`entity_not_in_tenant:${table}:${id}`)
  }
  return true
}

/**
 * Helper combinant requireTenantContext + assertOwnership en un seul appel.
 * Pratique pour les server actions mutantes sur une entité identifiée.
 */
export async function requireOwnership(
  table: TenantOwnedTable,
  id: string,
): Promise<TenantContext> {
  const ctx = await requireTenantContext()
  await assertOwnership(table, id, ctx.tenantId)
  return ctx
}

// ── Helper pour les inserts ─────────────────────────────────────────────

/**
 * Helper qui insère un payload en attachant automatiquement `tenant_id`
 * (et optionnellement `user_id`) depuis le contexte courant.
 *
 * Utilise createClient() (donc RLS active) plutôt que createAdmin() car
 * un INSERT depuis user authentifié doit toujours respecter RLS.
 */
export async function insertWithTenant<T extends Record<string, unknown>>(
  table: TenantOwnedTable,
  payload: T,
  options: { withUserId?: boolean } = {},
): Promise<{ data: unknown; error: unknown }> {
  const ctx = await requireTenantContext()
  const supabase = await createClient()
  const finalPayload: Record<string, unknown> = {
    ...payload,
    tenant_id: ctx.tenantId,
  }
  if (options.withUserId) {
    finalPayload.user_id = ctx.user.id
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (supabase.from(table) as any).insert(finalPayload)
  return { data: result.data, error: result.error }
}

// ── Compatibilité : export d'un type alias ──────────────────────────────

export type { SupabaseClient }
