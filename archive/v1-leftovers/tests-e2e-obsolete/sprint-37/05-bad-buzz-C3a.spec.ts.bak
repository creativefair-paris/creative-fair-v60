// Sprint 37 (Lot 8) — E2E 05 : Bad buzz (C3a) depuis /outils/conseiller.
//
// Couvre :
//   * Login + brand complete
//   * /outils/conseiller?scenario=C3a → sheet ouverte avec header "Bad buzz"
//   * Saisie d'un texte libre + envoi
//   * Réponse du conseiller (mock fallback hors-ligne si pas d'ANTHROPIC_API_KEY)

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

test('flux C3a — bad buzz', async ({ page }) => {
  const { id, email } = await createTestUser()
  const profile = await readProfile(id)
  await seedCompleteBrand(profile!.tenant_id!)

  await loginViaMagicLink(page, email)
  await page.waitForURL('**/aujourd-hui', { timeout: 30_000 })

  await page.goto('/outils/conseiller?scenario=C3a')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('heading', { name: /bad buzz/i })).toBeVisible({
    timeout: 10_000,
  })

  // Attend que le Tour 1 du conseiller s'affiche (réponse mockée ou
  // réelle Anthropic — délai max 60s pour couvrir les 2 cas).
  // On cherche la zone des bulles conseiller : présence du point bleu
  // ou d'un texte de réponse non vide.
  await expect(page.locator('article.cfs-conseiller-bubble')).toBeVisible({
    timeout: 60_000,
  })

  // Saisie texte libre + envoi
  const textarea = page.getByLabel(/message au conseiller/i)
  await textarea.fill(
    'Trois comptes ont mentionné notre dernier post en mode hostile. Pas viral, mais le ton est désagréable.',
  )
  await page.getByRole('button', { name: /^envoyer$/i }).click()

  // Une deuxième bulle conseiller doit apparaître (Tour 2 — ou
  // FORCED_DELIVERY si compteur dépassé).
  await expect.poll(
    async () => await page.locator('article.cfs-conseiller-bubble').count(),
    { timeout: 60_000 },
  ).toBeGreaterThanOrEqual(2)
})
