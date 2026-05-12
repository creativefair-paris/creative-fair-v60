// Sprint 36.E — Test E2E 2 : page /aujourd-hui pour user onboardé.
//
// Setup : user créé via admin + brand seedée "complete" en DB → l'user
// arrive directement sur /aujourd-hui sans passer par l'onboarding.

import { test, expect } from '@playwright/test'
import {
  createTestUser,
  loginViaMagicLink,
  readProfile,
  seedCompleteBrand,
  captureConsoleErrors,
} from './utils/test-helpers'
import { cleanupTestUsers } from './utils/cleanup'

test.afterAll(async () => {
  await cleanupTestUsers()
})

test('charge /aujourd-hui sans erreur console et sans redirect', async ({ page }) => {
  const { errors } = captureConsoleErrors(page)
  const { id, email } = await createTestUser()

  // Trigger PG a créé profile + tenant. On seed la brand complete pour
  // shortcut l'onboarding.
  const profile = await readProfile(id)
  expect(profile?.tenant_id).toBeTruthy()
  await seedCompleteBrand(profile!.tenant_id!)

  await loginViaMagicLink(page, email)

  // Doit atterrir directement sur /aujourd-hui (brand complète).
  await page.waitForURL('**/aujourd-hui', { timeout: 30_000 })
  expect(new URL(page.url()).pathname).toBe('/aujourd-hui')

  // Le H1 "Aujourd'hui" est rendu par le PageHeader.
  await expect(page.getByRole('heading', { name: "Aujourd'hui", level: 1 })).toBeVisible()

  // Une des sections clés doit être présente (titre uppercase iOS).
  // On accepte n'importe laquelle des 4 sections principales.
  const sectionLabels = ["AUJOURD'HUI", 'CETTE SEMAINE', 'TA MARQUE PREND FORME']
  let foundOne = false
  for (const label of sectionLabels) {
    if (await page.getByText(label, { exact: false }).first().isVisible({ timeout: 5000 }).catch(() => false)) {
      foundOne = true
      break
    }
  }
  expect(foundOne).toBe(true)

  // Avatar / menu utilisateur visible (UserMenuTrigger).
  await expect(page.getByLabel('Menu utilisateur')).toBeVisible()

  // Pas d'erreur console (en ignorant favicon et 3rd-party benign).
  const realErrors = errors.filter(
    (e) =>
      !e.includes('favicon') &&
      !e.includes('chrome-extension') &&
      !e.includes('Failed to load resource'),
  )
  expect(realErrors).toEqual([])
})
