# Sprint 36.E — Journal des écarts

Aucun abort déclenché. Les 6 specs + helpers + cleanup + config + audits
ont été livrés selon le brief.

## Conditions évaluées

### A1 — "Si magic link signup ne peut pas être bypassé sans modifier l'app : skip ce test"

**Non déclenché.** Le bypass utilise l'API officielle Supabase
`auth.admin.generateLink({ type: 'magiclink' })` + navigation vers le
`action_link` retourné. Le vrai chemin `/auth/callback?code=...` est
exercé. Aucune modif app.

### A2 — "Si tu dois modifier un fichier app/, components/, lib/ : ABORT"

**Non déclenché.** Fichiers modifiés :
- `package.json` (scripts + devDeps only, conforme au brief)
- `playwright.config.ts` (création)
- `tests/e2e/**` (création)
- `audits/sprint-36-e/**` (création)

Aucun fichier `app/`, `components/`, `lib/`, `supabase/`, `styles/` touché.

### A3 — "Si Playwright ne peut pas démarrer le serveur Next localement → ABORT"

**Non testé localement par cette session.** Le `webServer` config pointe
vers `npm run dev` avec `reuseExistingServer: true` (hors CI). Le Lead
exécutera la suite après `npm install` et confirmera. Si le boot échoue,
arbitrage Lead-side (mode CI, port, env var manquante).

### A4 — "Si plus de 8 tests sont nécessaires : limiter à 6, documenter les autres"

**Non déclenché.** 6 specs livrés. Tests reportés documentés dans
`decisions.md` section "Tests reportés au futur".

## Écarts par rapport au brief

1. **Branche source** : `sprint-36-c-2` au lieu de `main` (v1.7.0 pas
   encore taguée). Documenté dans `decisions.md` introduction.

2. **Pas de `npm install` exécuté** : le brief autorise la modif
   `package.json` mais n'explicite pas l'install. Sécurité : laisser
   le Lead activer la suite quand il le décide. Voir `decisions.md`
   section 7.

3. **Onboarding traversé une seule fois** (spec 01). Les 5 autres specs
   seedent une brand complete en DB pour éviter le coût Anthropic répété.
   Voir `decisions.md` section 2.

4. **Pas de mock Anthropic** dans Conseiller/Post Creator (specs 04, 05).
   Tests limités à la non-régression doctrinale (anti-gamification,
   vocab interdit). Génération réelle = TODO Sprint futur quand un mock
   route handler dédié sera créé.

5. **Spec 03 "destinations"** : le brief mentionne "Calendrier" comme
   destination ; dans le repo c'est `/programme` (vue Calendrier
   business-driven). Adapté en conséquence, documenté dans le test.

## Notes d'implémentation

- Le helper `seedCompleteBrand` met à jour la brand si elle existe déjà,
  évite les conflits FK lors de tests re-runned.
- Le helper `cleanupTestUsers` ne fail jamais bruyamment — un user déjà
  supprimé entre 2 appels n'est pas une erreur (idempotence).
- `captureConsoleErrors` filtre les benign (favicon, chrome-extension)
  pour éviter les faux positifs.
