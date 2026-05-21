// Sprint 37 (Lot 8) — E2E 03 : Affiner un post (B2) depuis TaskRow.
//
// Couvre :
//   * Login + brand complete (seed)
//   * /outils/conseiller?context=post_<id> (rétrocompat Sprint 36.H/I)
//     ouvre la ConseillerSheet B2 préchargée du contexte
//
// Note : pas de TaskRow réelle à cliquer si pas de posts seedés —
// on teste donc le routage URL directement, qui est le mécanisme V1
// derrière le lien.

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

test('Routage /outils/conseiller?context=post_<id> ouvre la sheet B2', async ({ page }) => {
  const { id, email } = await createTestUser()
  const profile = await readProfile(id)
  await seedCompleteBrand(profile!.tenant_id!)

  await loginViaMagicLink(page, email)
  await page.waitForURL('**/aujourd-hui', { timeout: 30_000 })

  // Simule un clic TaskRow → /outils/conseiller?context=post_<id>
  const fakePostId = '00000000-0000-0000-0000-000000000001'
  await page.goto(`/outils/conseiller?context=post_${fakePostId}`)
  await page.waitForLoadState('networkidle')

  // Sheet ouverte avec header "Affiner ce post"
  await expect(page.getByRole('heading', { name: /affiner ce post/i })).toBeVisible({
    timeout: 10_000,
  })

  // URL nettoyée après ouverture (replaceState).
  await expect.poll(() => new URL(page.url()).search).toBe('')

  // Fermeture de la sheet
  await page.getByLabel(/fermer le conseiller/i).click()
  await expect(page.getByRole('heading', { name: /affiner ce post/i })).not.toBeVisible()
})

test('Nouveau format ?scenario=B2&post_id=<id>', async ({ page }) => {
  const { id, email } = await createTestUser()
  const profile = await readProfile(id)
  await seedCompleteBrand(profile!.tenant_id!)

  await loginViaMagicLink(page, email)
  await page.waitForURL('**/aujourd-hui', { timeout: 30_000 })

  const fakePostId = '00000000-0000-0000-0000-000000000002'
  await page.goto(`/outils/conseiller?scenario=B2&post_id=${fakePostId}`)
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('heading', { name: /affiner ce post/i })).toBeVisible({
    timeout: 10_000,
  })
})
