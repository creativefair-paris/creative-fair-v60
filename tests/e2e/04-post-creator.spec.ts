// Sprint 36.E — Test E2E 4 : Post Creator workflow.
//
// Post Creator est sous /outils/post-creator (module interne, pas une
// destination de nav primaire — cf. spec 03).
//
// Stratégie : on teste la navigation et la non-régression doctrinale
// (pas de "%" de progression dans l'UI, anti-gamification).
// La génération réelle via Claude API n'est PAS exécutée — les tests
// E2E ne doivent pas dépendre d'une API tierce payante.

import { test, expect } from '@playwright/test'
import {
  createTestUser,
  loginViaMagicLink,
  readProfile,
  seedCompleteBrand,
} from './utils/test-helpers'
import { cleanupTestUsers } from './utils/cleanup'

test.afterAll(async () => {
  await cleanupTestUsers()
})

test('Post Creator est accessible via /outils/post-creator', async ({ page }) => {
  const { id, email } = await createTestUser()
  const profile = await readProfile(id)
  await seedCompleteBrand(profile!.tenant_id!)

  await loginViaMagicLink(page, email)
  await page.waitForURL('**/aujourd-hui')

  // Navigation directe (pas de CTA navigable depuis /aujourd-hui en V1).
  await page.goto('/outils/post-creator')
  await page.waitForLoadState('networkidle')

  // Pas de redirect. La page charge.
  expect(new URL(page.url()).pathname).toBe('/outils/post-creator')
})

test('aucun pourcentage de progression dans l\'UI Post Creator', async ({ page }) => {
  const { id, email } = await createTestUser()
  const profile = await readProfile(id)
  await seedCompleteBrand(profile!.tenant_id!)

  await loginViaMagicLink(page, email)
  await page.goto('/outils/post-creator')
  await page.waitForLoadState('networkidle')

  // Doctrine anti-gamification : aucun "N%" ne doit apparaître dans le
  // texte rendu. On scanne le body entier.
  const bodyText = (await page.locator('body').textContent()) ?? ''
  // Pattern : un chiffre suivi de % (ex: "37%", "100%", "0%").
  // Tolérance : on n'interdit pas les "%" isolés (rare cas d'usage
  // littéraire) — seulement les pourcentages chiffrés.
  const percentMatches = bodyText.match(/\b\d+\s*%/g) ?? []
  expect(percentMatches).toEqual([])
})
