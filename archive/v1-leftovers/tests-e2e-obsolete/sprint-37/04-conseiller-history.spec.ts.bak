// Sprint 37 (Lot 8) — E2E 04 : Page /outils/conseiller (historique).
//
// Couvre :
//   * Affichage de la page (PageHeader "Conseiller")
//   * Bouton "Nouvelle question" visible (CTA top-right)
//   * État vide à gauche : message "Aucune conversation pour l'instant"
//   * Click "Nouvelle question" → ConseillerSheet E-divers ouverte
//   * Click X → ferme la sheet

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

test('page /outils/conseiller affiche l\'historique vide + bouton "Nouvelle question"', async ({
  page,
}) => {
  const { id, email } = await createTestUser()
  const profile = await readProfile(id)
  await seedCompleteBrand(profile!.tenant_id!)

  await loginViaMagicLink(page, email)
  await page.waitForURL('**/aujourd-hui', { timeout: 30_000 })

  await page.goto('/outils/conseiller')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('heading', { name: 'Conseiller', level: 1 })).toBeVisible()
  await expect(
    page.getByText(/Aucune conversation pour l'instant/i),
  ).toBeVisible()

  // Bouton "Nouvelle question" (au moins une instance — soit haut droite, soit empty preview).
  const newQuestionBtn = page.getByRole('button', { name: /nouvelle question/i }).first()
  await expect(newQuestionBtn).toBeVisible()

  await newQuestionBtn.click()

  // Sheet ouverte avec header "Nouvelle question"
  await expect(page.getByRole('heading', { name: /nouvelle question/i })).toBeVisible({
    timeout: 5000,
  })

  // Bouton fermer présent
  await expect(page.getByLabel(/fermer le conseiller/i)).toBeVisible()

  // Esc ferme
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: /nouvelle question/i })).not.toBeVisible()
})
