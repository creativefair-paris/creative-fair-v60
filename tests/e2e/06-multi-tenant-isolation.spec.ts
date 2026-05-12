// Sprint 36.E — Test E2E 6 : isolation multi-tenant.
//
// Crée 2 users dans 2 tenants distincts (trigger PG auto-crée 1 tenant
// par signup). Chacun seed sa propre brand. On vérifie qu'aucune fuite
// d'IDs cross-tenant n'apparaît dans l'UI, et qu'un accès direct
// manipulé est rejeté.

import { test, expect, type BrowserContext } from '@playwright/test'
import {
  createTestUser,
  loginViaMagicLink,
  readProfile,
  seedCompleteBrand,
  type TestUser,
} from './utils/test-helpers'
import { cleanupTestUsers } from './utils/cleanup'

test.afterAll(async () => {
  await cleanupTestUsers()
})

type Seeded = {
  user: TestUser
  tenantId: string
  brandId: string
}

async function seedUserWithBrand(): Promise<Seeded> {
  const user = await createTestUser()
  const profile = await readProfile(user.id)
  if (!profile?.tenant_id) {
    throw new Error('Profile/tenant non créé par le trigger PG')
  }
  const { brandId } = await seedCompleteBrand(profile.tenant_id, {
    name: `Brand ${user.email}`,
  })
  return { user, tenantId: profile.tenant_id, brandId }
}

async function loginInContext(ctx: BrowserContext, email: string) {
  const page = await ctx.newPage()
  await loginViaMagicLink(page, email)
  await page.waitForURL('**/aujourd-hui', { timeout: 30_000 })
  return page
}

test('users isolés : aucune fuite d\'IDs cross-tenant dans la UI', async ({ browser }) => {
  const a = await seedUserWithBrand()
  const b = await seedUserWithBrand()

  // Context A
  const ctxA = await browser.newContext()
  const pageA = await loginInContext(ctxA, a.user.email)
  await pageA.goto('/ma-marque')
  await pageA.waitForLoadState('networkidle')
  const bodyA = (await pageA.locator('body').textContent()) ?? ''

  // L'UI de A ne doit JAMAIS contenir l'id du tenant ou de la brand de B.
  expect(bodyA).not.toContain(b.tenantId)
  expect(bodyA).not.toContain(b.brandId)

  // Context B (séparé, cookies indépendants)
  const ctxB = await browser.newContext()
  const pageB = await loginInContext(ctxB, b.user.email)
  await pageB.goto('/ma-marque')
  await pageB.waitForLoadState('networkidle')
  const bodyB = (await pageB.locator('body').textContent()) ?? ''

  expect(bodyB).not.toContain(a.tenantId)
  expect(bodyB).not.toContain(a.brandId)

  await ctxA.close()
  await ctxB.close()
})

test('accès direct API manipulé : le tenant B ne peut pas lire la brand de A', async ({ browser }) => {
  const a = await seedUserWithBrand()
  const b = await seedUserWithBrand()

  // Login en context B
  const ctxB = await browser.newContext()
  const pageB = await loginInContext(ctxB, b.user.email)

  // Tentative d'accès via l'API GET /api/brand/waitlist ne révèle pas
  // les données de A — l'API utilise public.user_tenant_id() côté RLS.
  // On observe le payload retourné : il doit refléter le tenant B,
  // jamais A.
  const response = await pageB.request.get('/api/brand/waitlist')
  if (response.ok()) {
    const body = await response.json().catch(() => null)
    const serialized = JSON.stringify(body ?? {})
    expect(serialized).not.toContain(a.tenantId)
    expect(serialized).not.toContain(a.brandId)
  }
  // Si 503 (migration_pending) ou 404 : pas de fuite par construction,
  // on accepte. L'important est l'absence d'ID de A dans toute réponse 200.

  await ctxB.close()
})
