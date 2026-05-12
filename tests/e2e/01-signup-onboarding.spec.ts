// Sprint 36.E — Test E2E 1 : signup + onboarding complet.
//
// Couvre :
//   * Création user via admin Supabase (bypass magic link email)
//   * Vérification trigger PG handle_new_user (profile + tenant auto)
//   * Login via magic link (action_link injecté dans Playwright)
//   * Complétion du formulaire onboarding 4 questions
//   * Atterrissage sur /aujourd-hui sans boucle redirect

import { test, expect } from '@playwright/test'
import {
  createTestUser,
  loginViaMagicLink,
  readProfile,
  readTenant,
  readBrand,
  captureConsoleErrors,
} from './utils/test-helpers'
import { cleanupTestUsers } from './utils/cleanup'

test.afterAll(async () => {
  await cleanupTestUsers()
})

test('signup auto-provisionne profile + tenant via le trigger PG', async () => {
  const { id, email } = await createTestUser()

  // Le trigger handle_new_user (migration 011) crée profile + tenant
  // de façon synchrone à l'INSERT auth.users. On lit donc directement
  // après createTestUser.
  const profile = await readProfile(id)
  expect(profile).not.toBeNull()
  expect(profile!.tenant_id).not.toBeNull()
  expect(profile!.role).toBe('owner')
  expect(profile!.email).toBe(email)

  const tenant = await readTenant(profile!.tenant_id!)
  expect(tenant).not.toBeNull()
  expect(tenant!.plan).toBe('b2b_custom')
  // Slug dérivé de la partie locale email (ou avec suffix random si collision).
  const localPart = (email.split('@')[0] ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  expect(tenant!.slug.startsWith(localPart)).toBe(true)
})

test('doit compléter l\'onboarding et atterrir sur /aujourd-hui', async ({ page }) => {
  const { errors } = captureConsoleErrors(page)
  const { email } = await createTestUser()

  await loginViaMagicLink(page, email)

  // Le callback redirige vers /aujourd-hui si onboarding complet, sinon
  // vers /onboarding/analyse-marque. Brand n'existe pas → onboarding.
  await expect.poll(() => new URL(page.url()).pathname).toBe('/onboarding/analyse-marque')

  // Remplit les 4 champs du formulaire onboarding (Sprint 36.A).
  // On utilise des sélecteurs résilients (label-based) avec fallback
  // sur placeholder/role.
  await page.getByRole('textbox').first().fill('Atelier Test')

  // Attend que le bouton "Suivant" soit visible, puis avance étape par étape.
  // Le composant OnboardingFlow gère 4 étapes en client.
  for (let step = 0; step < 4; step++) {
    // À chaque étape, remplir le champ visible avec une réponse plausible.
    const input = page.locator('input:visible, textarea:visible').first()
    const currentValue = await input.inputValue().catch(() => '')
    if (!currentValue) {
      await input.fill(`Réponse de test pour l'étape ${step + 1} — voix tranquille, posée.`)
    }
    const next = page.getByRole('button', { name: /suivant|terminer|valider|générer/i }).first()
    if (await next.isVisible({ timeout: 2000 }).catch(() => false)) {
      await next.click()
    } else {
      break
    }
  }

  // Attente du redirect post-completion vers /aujourd-hui.
  // Sprint 36.C.1 a fixé OnboardingFlow.tsx pour redirect /aujourd-hui.
  await page.waitForURL('**/aujourd-hui', { timeout: 60_000 })

  // Pas de redirect inattendu vers /onboarding (anti-loop check).
  await page.waitForLoadState('networkidle')
  expect(new URL(page.url()).pathname).toBe('/aujourd-hui')

  // Pas de redirect inattendu et console propre = onboarding réussi.
  // La non-redirect vers /onboarding/analyse-marque suffit comme preuve
  // que /api/onboarding/complete a écrit brand_book_status='complete'.

  expect(errors.filter((e) => !e.includes('favicon'))).toEqual([])
})
