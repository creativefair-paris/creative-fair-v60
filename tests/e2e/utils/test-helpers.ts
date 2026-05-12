// Sprint 36.E — Helpers de test partagés.
//
// Stratégie d'authentification : on contourne le magic link email en
// utilisant l'API admin Supabase (service_role) pour :
//   1. créer un user avec email_confirm = true
//   2. générer un magic link via auth.admin.generateLink
//   3. naviguer vers le action_link dans Playwright (le navigateur
//      atterrit sur /auth/callback?code=... qui échange le code en
//      session valide)
//
// Cette approche teste le vrai chemin auth callback de l'app
// (exchangeCodeForSession dans app/auth/callback/route.ts) sans avoir
// à mocker Supabase.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { expect, type Page } from '@playwright/test'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const TEST_EMAIL_DOMAIN = 'creativefair.test'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[test-helpers] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant — ' +
      'les tests qui requièrent l\'admin client échoueront.',
  )
}

let adminCache: SupabaseClient | null = null

export function getAdmin(): SupabaseClient {
  if (adminCache) return adminCache
  adminCache = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return adminCache
}

// Génère un email unique de test avec timestamp + random suffix.
// Le pattern test-*@creativefair.test est utilisé par cleanup.ts pour
// la suppression idempotente en fin de chaque suite.
export function uniqueTestEmail(prefix = 'user'): string {
  const stamp = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  return `test-${prefix}-${stamp}-${rand}@${TEST_EMAIL_DOMAIN}`
}

export type TestUser = {
  id: string
  email: string
}

// Crée un user via admin API. email_confirm = true pour éviter le
// nécessaire double-tour email de validation. Le trigger PG
// handle_new_user (Sprint 36.C.2) provisionne profile + tenant
// automatiquement.
export async function createTestUser(email?: string): Promise<TestUser> {
  const admin = getAdmin()
  const emailFinal = email ?? uniqueTestEmail()
  const { data, error } = await admin.auth.admin.createUser({
    email: emailFinal,
    email_confirm: true,
  })
  if (error || !data.user) {
    throw new Error(`createTestUser failed: ${error?.message ?? 'unknown'}`)
  }
  return { id: data.user.id, email: emailFinal }
}

// Connecte un user existant en générant un magic link puis en naviguant
// vers le action_link dans la page Playwright. À l'issue, la page a
// une session valide (cookie sb-* posé par /auth/callback).
export async function loginViaMagicLink(page: Page, email: string): Promise<void> {
  const admin = getAdmin()
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })
  if (error || !data.properties?.action_link) {
    throw new Error(`generateLink failed: ${error?.message ?? 'no action_link'}`)
  }
  // Le action_link mène vers /auth/callback qui exchange le code et pose
  // les cookies de session, puis redirige vers /aujourd-hui (ou onboarding
  // si pas encore complété).
  await page.goto(data.properties.action_link, { waitUntil: 'networkidle' })
}

// Lit le profile d'un user depuis la DB via admin (bypass RLS).
// Retourne null si pas de profile.
export type ProfileRow = {
  id: string
  tenant_id: string | null
  email: string | null
  role: string | null
}

export async function readProfile(userId: string): Promise<ProfileRow | null> {
  const admin = getAdmin()
  const { data, error } = await admin
    .from('profiles')
    .select('id, tenant_id, email, role')
    .eq('id', userId)
    .maybeSingle()
  if (error) return null
  return (data as ProfileRow | null) ?? null
}

// Lit le tenant correspondant.
export type TenantRow = {
  id: string
  slug: string
  name: string
  plan: string
}

export async function readTenant(tenantId: string): Promise<TenantRow | null> {
  const admin = getAdmin()
  const { data, error } = await admin
    .from('tenants')
    .select('id, slug, name, plan')
    .eq('id', tenantId)
    .maybeSingle()
  if (error) return null
  return (data as TenantRow | null) ?? null
}

// Lit la brand d'un tenant (1:1 dans le modèle V1).
export type BrandRow = {
  id: string
  tenant_id: string
  name: string | null
  brand_book_status: string | null
}

export async function readBrand(tenantId: string): Promise<BrandRow | null> {
  const admin = getAdmin()
  const { data, error } = await admin
    .from('brands')
    .select('id, tenant_id, name, brand_book_status')
    .eq('tenant_id', tenantId)
    .maybeSingle()
  if (error) return null
  return (data as BrandRow | null) ?? null
}

// Crée une brand "complète" pour un tenant directement en DB. Utilisé
// par les tests qui veulent skip l'onboarding (specs 02, 03, 04, 05, 06).
export async function seedCompleteBrand(
  tenantId: string,
  overrides: Partial<{
    name: string
    secteur: string
    ton: string
    singularite: string
  }> = {},
): Promise<{ brandId: string }> {
  const admin = getAdmin()
  const payload = {
    tenant_id: tenantId,
    name: overrides.name ?? 'Marque de test',
    secteur: overrides.secteur ?? 'Secteur de test',
    ton: overrides.ton ?? 'Voix de test, tranquille, posée.',
    singularite: overrides.singularite ?? 'La singularité spécifique de la marque test.',
    brand_book_status: 'complete',
  }
  // Vérifier si une brand existe déjà (le tenant peut en avoir une
  // créée par un test précédent qui n'a pas cleané).
  const existing = await readBrand(tenantId)
  if (existing) {
    const { error } = await admin
      .from('brands')
      .update(payload)
      .eq('id', existing.id)
    if (error) throw new Error(`seedCompleteBrand update failed: ${error.message}`)
    return { brandId: existing.id }
  }
  const { data, error } = await admin
    .from('brands')
    .insert(payload)
    .select('id')
    .single()
  if (error || !data) {
    throw new Error(`seedCompleteBrand insert failed: ${error?.message ?? 'no data'}`)
  }
  return { brandId: (data as { id: string }).id }
}

// Helper d'attente sur navigation pathname (Playwright a expect.toHaveURL,
// mais une regex sur pathname est plus tolérante aux query params).
export async function expectPathname(page: Page, pathname: string): Promise<void> {
  await expect.poll(() => new URL(page.url()).pathname).toBe(pathname)
}

// Capture les console errors pendant un test. À utiliser en début de
// chaque test pour détecter les régressions runtime.
export function captureConsoleErrors(page: Page): { errors: string[] } {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  page.on('pageerror', (err) => {
    errors.push(`pageerror: ${err.message}`)
  })
  return { errors }
}
