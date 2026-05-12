// Sprint 36.E — Test E2E 5 : page Conseiller.
//
// Vérifie l'accès à /outils/conseiller et l'absence de mention "IA"
// dans la UI (doctrine : toujours "Creative Fair", jamais "IA" /
// "intelligence artificielle" / "AI").
//
// La page Conseiller actuelle (Sprint 35 → 36.B.5) est un stub
// (titre seul, intégration v1 en attente). Le test couvre donc :
//   * accès sans erreur
//   * absence vocab interdit
// Le streaming chat sera testé quand l'intégration v1 atterrira.

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

test('Conseiller accessible et sans mention "IA" dans l\'UI', async ({ page }) => {
  const { id, email } = await createTestUser()
  const profile = await readProfile(id)
  await seedCompleteBrand(profile!.tenant_id!)

  await loginViaMagicLink(page, email)
  await page.goto('/outils/conseiller')
  await page.waitForLoadState('networkidle')

  expect(new URL(page.url()).pathname).toBe('/outils/conseiller')

  // H1 visible (PageHeader rend "Conseiller").
  await expect(page.getByRole('heading', { name: /conseiller/i, level: 1 })).toBeVisible()

  // Doctrine vocabulaire : aucune mention "IA", "intelligence artificielle",
  // "AI" en majuscules comme marque/acronyme.
  const bodyText = (await page.locator('body').textContent()) ?? ''
  // \b assure le mot entier ; on évite de matcher "AID" ou "MAIL".
  expect(bodyText).not.toMatch(/\bIA\b/)
  expect(bodyText).not.toMatch(/\bintelligence artificielle\b/i)
  // "AI" en mot entier : on exclut les contextes URL/code (peu probable
  // dans le body texte rendu).
  expect(bodyText).not.toMatch(/\bAI\b/)
})

// Note : le test "envoyer un message + vérifier streaming" est noté
// comme TODO Sprint 36+ quand l'intégration Conseiller v1 sera
// déployée. À ce moment-là, ajouter ici un test qui :
//   * remplit le textarea
//   * clique envoyer
//   * vérifie que la réponse streame token par token
//   * vérifie qu'aucune phrase de la réponse ne contient les mots
//     interdits (users, audience, dashboard, workflow, etc.)
