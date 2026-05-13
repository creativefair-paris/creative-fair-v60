// Sprint 37 (Lot 8) — E2E 02 : Création de plan A1 depuis /programme.
//
// Couvre :
//   * Login + onboarding rapide (seed brand complete)
//   * Navigation /programme
//   * Click CTA primaire "Créer mon prochain plan sur mesure"
//   * PeriodSelectionSheet visible
//   * Saisie période + bouton Continuer → ConseillerSheet B1 (A1)
//
// Note : la conversation Anthropic est mockée (fallback hors-ligne)
// si ANTHROPIC_API_KEY non configurée. Le test valide juste le flux UI.

import { test, expect } from '@playwright/test'
import {
  createTestUser,
  loginViaMagicLink,
  readProfile,
  seedCompleteBrand,
} from '../utils/test-helpers'
import { cleanupTestUsers } from '../utils/cleanup'

test.afterAll(async () => {
  await cleanupTestUsers()
})

test('CTA primaire /programme ouvre PeriodSelectionSheet puis ConseillerSheet A1', async ({
  page,
}) => {
  const { id, email } = await createTestUser()
  const profile = await readProfile(id)
  expect(profile?.tenant_id).toBeTruthy()
  await seedCompleteBrand(profile!.tenant_id!)

  await loginViaMagicLink(page, email)
  await page.waitForURL('**/aujourd-hui', { timeout: 30_000 })

  await page.goto('/programme')
  await page.waitForLoadState('networkidle')

  // CTA primaire "Créer mon prochain plan sur mesure"
  await expect(
    page.getByRole('button', { name: /créer mon prochain plan sur mesure/i }),
  ).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: /créer mon prochain plan sur mesure/i }).click()

  // PeriodSelectionSheet
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
  await expect(page.getByText(/Créer mon prochain plan sur mesure/i)).toBeVisible()
  await expect(page.getByText(/Date de début/i)).toBeVisible()
  await expect(page.getByText(/Date de fin/i)).toBeVisible()

  // Submit → ConseillerSheet (A1)
  await page.getByRole('button', { name: /^continuer$/i }).first().click()

  // ConseillerSheet ouverte avec header "Création de plan"
  await expect(page.getByRole('heading', { name: /création de plan/i })).toBeVisible({
    timeout: 5000,
  })
  await expect(page.getByLabel(/fermer le conseiller/i)).toBeVisible()
})
