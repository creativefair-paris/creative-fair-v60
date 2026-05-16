// Sprint 38 — Capture Playwright headless de toutes les routes auditées.
//
// Usage (depuis racine du projet) :
//   1. Démarrer le dev server : `npm run dev` (sur ${DEV_PORT} ou 3000)
//   2. Exporter DEV_PORT si différent : `export DEV_PORT=3000`
//   3. Pour les pages protégées : se connecter manuellement une fois
//      dans Chrome, exporter les cookies dans un fichier `.auth.json`
//      (cf. https://playwright.dev/docs/auth) et le passer via
//      `STORAGE_STATE=./audits/sprint-38/.auth.json node ...`.
//   4. Lancer : `node audits/sprint-38/_capture.mjs`
//
// Note importante : ce script doit être lancé depuis l'environnement Lead
// (Mac local avec Supabase env + auth valide). Dans la session Claude Code
// le dev server + auth ne sont pas accessibles, donc les captures sont
// produites côté Lead.

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const PORT = process.env.DEV_PORT ?? '3000'
const BASE = `http://localhost:${PORT}`
const OUT = resolve('audits/sprint-38/99-screenshots')
const STORAGE_STATE = process.env.STORAGE_STATE // optionnel : path vers fichier d'état d'auth

mkdirSync(OUT, { recursive: true })

const ROUTES = [
  // Auth (publiques)
  { name: '01-login', path: '/login', auth: false },

  // Onboarding (protégée — requiert auth)
  { name: '02-onboarding-analyse-marque', path: '/onboarding/analyse-marque', auth: true },

  // Nav 5 (protégées)
  { name: '03-aujourd-hui', path: '/aujourd-hui', auth: true },
  { name: '04-mon-programme', path: '/programme', auth: true },
  { name: '05-ma-marque', path: '/ma-marque', auth: true },
  { name: '06-mes-outils', path: '/outils', auth: true },
  { name: '07-conseiller', path: '/outils/conseiller', auth: true },

  // Outils (protégées)
  { name: '08-outils-post-creator', path: '/outils/post-creator', auth: true },
  { name: '09-outils-bibliotheque', path: '/outils/bibliotheque', auth: true },
  { name: '10-outils-moodboard', path: '/outils/moodboard', auth: true },
  { name: '11-outils-variations', path: '/outils/variations', auth: true },
  { name: '12-outils-reviews', path: '/outils/reviews', auth: true },
  { name: '13-outils-messages', path: '/outils/messages', auth: true },

  // Programme sous-pages
  { name: '14-programme-strategie', path: '/programme/strategie', auth: true },
  { name: '15-programme-retombees', path: '/programme/retombees', auth: true },
  { name: '16-programme-bienvenue', path: '/programme/bienvenue', auth: true },

  // Compte
  { name: '17-compte-mon-compte', path: '/compte/mon-compte', auth: true },
  { name: '18-compte-parametres', path: '/compte/parametres', auth: true },
  { name: '19-compte-ma-marque', path: '/compte/ma-marque', auth: true },
  { name: '20-compte-brand-book', path: '/compte/ma-marque/brand-book', auth: true },
  { name: '21-compte-business-calendar', path: '/compte/ma-marque/business-calendar', auth: true },

  // Accueil public
  { name: '22-accueil', path: '/', auth: false },
]

const browser = await chromium.launch({ headless: true })
const contextOpts = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }
if (STORAGE_STATE) contextOpts.storageState = STORAGE_STATE
const ctx = await browser.newContext(contextOpts)
const page = await ctx.newPage()

const errors = []

for (const r of ROUTES) {
  const url = `${BASE}${r.path}`
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
    const status = resp?.status() ?? 0
    if (status >= 400 && !r.auth) {
      errors.push(`${r.name} : HTTP ${status}`)
    }
    // Laisser les animations se stabiliser (halos statiques mais blur peut prendre une frame).
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${r.name}.png`, fullPage: true })
    console.log(`✓ ${r.name} (HTTP ${status})`)
  } catch (err) {
    errors.push(`${r.name} : ${err.message}`)
    console.log(`✗ ${r.name} : ${err.message}`)
  }
}

await browser.close()

if (errors.length > 0) {
  console.log('\n--- Erreurs ---')
  errors.forEach((e) => console.log(e))
  process.exit(1)
}
