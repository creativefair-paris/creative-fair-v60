// Sprint 36.E — Test E2E 3 : navigation entre les destinations principales.
//
// Le brief mentionne 4 destinations : Aujourd'hui, Calendrier, Ma Marque,
// Conseiller. Dans le repo actuel, "Calendrier" correspond à /programme
// (vue Calendrier business-driven). On teste les routes accessibles.
//
// Vérifie aussi qu'aucune entrée "Post Creator" n'apparaît en navigation
// (doctrine : Post Creator est un module interne, pas une destination
// principale).

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

// Routes à vérifier accessibles. /outils/post-creator est intentionnellement
// SOUS /outils (non navigation primaire).
const DESTINATIONS = [
  { name: 'Aujourd\'hui', path: '/aujourd-hui' },
  { name: 'Mon Programme', path: '/programme' },
  { name: 'Ma Marque', path: '/ma-marque' },
  { name: 'Conseiller', path: '/outils/conseiller' },
] as const

test('toutes les destinations principales chargent sans erreur', async ({ page }) => {
  const { errors } = captureConsoleErrors(page)
  const { id, email } = await createTestUser()
  const profile = await readProfile(id)
  await seedCompleteBrand(profile!.tenant_id!)

  await loginViaMagicLink(page, email)
  await page.waitForURL('**/aujourd-hui')

  for (const dest of DESTINATIONS) {
    await page.goto(dest.path)
    await page.waitForLoadState('networkidle')
    // La page doit charger sur le pathname demandé (pas de redirect).
    expect(new URL(page.url()).pathname).toBe(dest.path)
    // Le H1 du PageHeader doit être visible (chaque page mère en a un).
    await expect(page.locator('h1').first()).toBeVisible()
  }

  // Filtre les erreurs benign.
  const realErrors = errors.filter(
    (e) => !e.includes('favicon') && !e.includes('chrome-extension'),
  )
  expect(realErrors).toEqual([])
})

test('Post Creator n\'apparaît pas dans la nav primaire', async ({ page }) => {
  const { id, email } = await createTestUser()
  const profile = await readProfile(id)
  await seedCompleteBrand(profile!.tenant_id!)

  await loginViaMagicLink(page, email)
  await page.waitForURL('**/aujourd-hui')

  // Ouvrir le menu utilisateur (UserMenuBubble) qui contient les liens
  // de nav primaire (Mon Programme, Outils, etc.).
  await page.getByLabel('Menu utilisateur').click()
  await expect(page.locator('[class*="cfs-user-menu"]')).toBeVisible({ timeout: 5000 })

  // Aucun lien "Post Creator" ne doit apparaître dans la bulle.
  const postCreatorLink = page.getByRole('link', { name: /post.?creator/i })
  await expect(postCreatorLink).toHaveCount(0)
})
