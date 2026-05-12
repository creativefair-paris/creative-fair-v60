# Sprint 36.E — Décisions d'architecture E2E

Branche `sprint-36-e` (basée sur `sprint-36-c-2` HEAD `bc1302d`).
Lecture : le brief dit "main (v1.7.0)" mais v1.7.0 n'est pas encore taguée
(sprint-36-c-2 attend validation Lead). Branchement depuis `sprint-36-c-2`
pour que les tests référencent le code à jour (/aujourd-hui, ensureProfile,
migration 011, etc.). Rebase trivial si le Lead préfère un branchement
littéral depuis `main`.

Build OK (pas de modif TS app). Pas de push, pas de tag.

## 1. Magic link : vrai chemin auth, pas de mock

**Décision** : utiliser `supabase.auth.admin.generateLink({ type: 'magiclink' })`
puis naviguer vers `data.properties.action_link` dans Playwright.

**Justification** :
- Mocker l'auth entièrement (intercepter les requêtes Supabase) demande
  de reproduire la complexité du protocole PKCE côté test → fragile.
- Bypasser via injection de session cookie demande de connaître le format
  interne des cookies Supabase → couplé à la lib `@supabase/ssr`.
- `auth.admin.generateLink` est l'API officielle Supabase pour générer
  un magic link sans envoi email. Le `action_link` retourné est une URL
  qui pointe vers `<projet>.supabase.co/auth/v1/verify?token=...` qui
  redirige vers notre `/auth/callback?code=...`. Le callback `exchangeCodeForSession`
  est donc testé pour de vrai.

**Conséquence** : les tests requièrent que `SUPABASE_SERVICE_ROLE_KEY`
soit accessible. Cette clé doit pointer sur une **instance de dev/staging**,
jamais sur prod.

## 2. Onboarding : seedCompleteBrand en DB pour skip

**Décision** : seul le spec 01 traverse l'onboarding via le formulaire.
Les specs 02-06 court-circuitent en seedant directement une brand
`brand_book_status='complete'` en DB via service_role.

**Justification** :
- Le formulaire onboarding appelle `/api/onboarding/complete` qui lance
  une **génération Claude Opus** (`generateProgrammeInitial` dans
  `lib/programme/generation.ts`). Coût ~5-10 centimes par test.
- Avec 5 specs (02-06) traversant l'onboarding réel, soit 25-50 centimes
  par run E2E complet, à chaque PR → coût mensuel non-négligeable.
- En seedant la brand directement, les specs 02-06 testent uniquement
  leur périmètre (UI rendu, navigation, isolation) sans payer le coût
  Anthropic.
- Le spec 01 reste le test "intégration complète" : il vaut sa génération
  Claude, mais il est aussi le test le plus susceptible d'échouer si la
  Anthropic API est down. À surveiller en CI.

**Alternative envisagée** : mocker `/api/onboarding/complete` via une
route handler de test. Rejetée car le brief interdit toute modification
de `app/`.

## 3. Pas de mock Anthropic dans les tests Conseiller / Post Creator

**Décision** : les specs 04 (Post Creator) et 05 (Conseiller) testent
uniquement la navigation et la non-régression doctrinale, pas la
génération réelle.

**Justification** :
- Tester la génération réelle = paye un appel Claude Opus par test.
- Mocker Claude API = modifier `app/api/*` (interdit par le brief) OR
  configurer un proxy MSW en helper Playwright. Le second est complexe
  et non couvert dans le scope d'un sprint d'amorçage.
- Le check doctrinal (`0%` dans la UI Post Creator, pas de "IA" dans
  Conseiller) est statique et n'a pas besoin de génération réelle.

**Suite** : si Sprint 37+ ajoute une route `/api/test/mock-generation`
explicitement pour les tests, on étendra ce spec pour tester l'UX de
génération end-to-end.

## 4. Cleanup : afterAll dans chaque spec

**Décision** : chaque spec déclare `test.afterAll(cleanupTestUsers)`.

**Justification** :
- En cas de crash d'un test, les users de test restent en DB. Le
  `afterAll` du test suivant ramasse les résidus la prochaine fois.
- Cleanup global au niveau Playwright (`globalTeardown`) est plus
  élégant mais demande un setup additionnel. Le `afterAll` par spec
  est suffisant pour V1.
- Pattern email `test-*@creativefair.test` garantit qu'aucun user prod
  n'est jamais touché par accident.

## 5. workers: 1 (séquentiel)

**Décision** : Playwright en mode séquentiel.

**Justification** :
- La DB de test est partagée entre tests. Sans isolation par schéma
  Postgres, des tests parallèles créent des courses de timing sur
  les SELECT/DELETE des cleanup.
- 6 specs × ~30s chacune = 3min en séquentiel. Acceptable pour V1.
- Si la suite passe à 30+ specs, envisager pg_namespace isolation
  ou Supabase branches.

## 6. Sélecteurs résilients (role-based, pas CSS class)

**Décision** : `getByRole('heading')`, `getByLabel('Menu utilisateur')`,
`getByText('AUJOURD\'HUI')` plutôt que `.locator('.cfs-page-header-title')`.

**Justification** :
- Les classes CSS canoniques (`cfs-page-header-title`, `cfs-task-bullet`)
  sont stables mais leur exhaustivité doit suivre l'évolution du design
  system. Un rename de classe casse tous les tests.
- Les rôles ARIA et les labels accessibles sont plus stables et alignés
  avec l'accessibilité.
- Exception : `[class*="cfs-user-menu"]` utilisé dans 03 pour détecter
  l'ouverture de la bulle (pas de role ARIA approprié sur la bulle elle-même).

## 7. Aucune dépendance installée par cette session

**Décision** : `package.json` modifié (ajout `@playwright/test`, `dotenv`,
scripts), mais **pas de `npm install` exécuté**.

**Justification** :
- Le brief autorise la modif `package.json` "scripts + devDependencies
  only". L'installation génère `package-lock.json` modifié → contrainte
  pas strictement violée mais zone grise.
- Le Lead exécutera `npm install` quand il voudra activer la suite.
  Le `package-lock.json` se mettra à jour en local au premier install
  et sera commit dans le sprint suivant.

## Tests reportés au futur

- **Streaming Conseiller** : quand l'intégration v1 atterrira (post
  Sprint 37 probable).
- **Génération réelle Post Creator** : nécessite mock Anthropic ou
  budget Anthropic pour CI.
- **Onboarding edge cases** : payload invalide, retry sur 502 Claude,
  cancel mid-form. Non couvert V1.
- **Mobile viewport** : Playwright supporte `devices['iPhone 13']`,
  pas activé V1 (focus desktop).

## Action Lead

1. Créer `.env.test` avec les 3 vars listées dans `README.md`
2. `npm install` (active les nouvelles deps + Playwright binaries via
   `npm run test:e2e:install`)
3. Lancer `npm run test:e2e` une fois en local — observer le rapport
4. Si vert : merge `sprint-36-e` sur `main` → pas de tag (la suite
   E2E n'est pas un livrable produit)
5. Si rouge : analyser le rapport HTML (`npx playwright show-report`)
   et arbitrer fix vs ajustement test
