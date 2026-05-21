// Sprint 37 (Lot 8) — E2E 01 : Onboarding complet avec 2 nouvelles
// questions (persona + curseur fréquence) + 3 écrans mini-onboarding
// du conseiller.
//
// Couvre :
//   * Création user + magic link (helper Sprint 36.E)
//   * Atterrissage /onboarding/analyse-marque
//   * 4 questions marque (texte) → 2 questions doctrinales (choix)
//   * Submit → mini-onboarding (3 écrans skippables)
//   * Sortie via "Plus tard" → /aujourd-hui

import { test, expect } from '@playwright/test'
import {
  createTestUser,
  loginViaMagicLink,
  captureConsoleErrors,
} from '../utils/test-helpers'
import { cleanupTestUsers } from '../utils/cleanup'

test.afterAll(async () => {
  await cleanupTestUsers()
})

test('onboarding 4 + 2 questions puis mini-onboarding conseiller', async ({ page }) => {
  const { errors } = captureConsoleErrors(page)
  const { email } = await createTestUser()

  await loginViaMagicLink(page, email)
  await expect.poll(() => new URL(page.url()).pathname).toBe('/onboarding/analyse-marque')

  // 4 questions texte (Sprint 36.A) — boucle générique.
  for (let step = 0; step < 4; step++) {
    const input = page.locator('input:visible, textarea:visible').first()
    const currentValue = await input.inputValue().catch(() => '')
    if (!currentValue) {
      await input.fill(`Réponse étape ${step + 1} — voix tranquille, posée.`)
    }
    await page.getByRole('button', { name: /suivant/i }).first().click()
  }

  // Question persona (choix 2 options).
  await expect(page.getByText(/pilotes une marque/i)).toBeVisible({ timeout: 10_000 })
  await page.getByRole('radio', { name: /Je pilote une marque/i }).click()
  await page.getByRole('button', { name: /suivant/i }).first().click()

  // Question curseur fréquence (choix 3 options).
  await expect(page.getByText(/à quel rythme tu publies/i)).toBeVisible()
  await page.getByRole('radio', { name: /Équilibré/i }).click()
  await page.getByRole('button', { name: /terminer/i }).first().click()

  // Mini-onboarding conseiller (3 écrans skippables).
  await expect(page.getByText(/Voici ton conseiller/i)).toBeVisible({ timeout: 20_000 })
  // On clique "Passer" sur l'écran 1 → redirige direct vers /aujourd-hui.
  await page.getByRole('button', { name: /passer/i }).first().click()

  await page.waitForURL('**/aujourd-hui', { timeout: 30_000 })
  expect(new URL(page.url()).pathname).toBe('/aujourd-hui')

  // Pas d'erreur console (en ignorant favicon et benign).
  expect(
    errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('chrome-extension') &&
        !e.includes('Failed to load resource'),
    ),
  ).toEqual([])
})
