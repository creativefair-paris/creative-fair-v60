// Sprint 36.E — Configuration Playwright pour suite E2E.
//
// Variables d'env attendues dans .env.test :
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   TEST_BASE_URL (optionnel, défaut http://localhost:3000)

import { defineConfig, devices } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'

// Charge .env.test en priorité, puis .env.local en fallback (pour les
// variables NEXT_PUBLIC_ que Next.js lit déjà).
loadEnv({ path: resolve(__dirname, '.env.test') })
loadEnv({ path: resolve(__dirname, '.env.local') })

const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  // Séquentiel : la DB de test est partagée, les tests créent et
  // suppriment des users — pas de parallélisation possible sans
  // isolation tenant explicite par test.
  workers: 1,
  fullyParallel: false,
  retries: 1,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Démarre le serveur Next si pas déjà lancé. Skippé si déjà en cours.
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
