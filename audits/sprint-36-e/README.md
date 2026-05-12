# Sprint 36.E — Comment lancer les tests E2E

## Prérequis

1. **Variables d'env** dans `.env.test` à la racine du repo :

```
NEXT_PUBLIC_SUPABASE_URL=<url_supabase_de_test>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
TEST_BASE_URL=http://localhost:3000
```

Le `SUPABASE_SERVICE_ROLE_KEY` est le **service_role**, jamais le
`anon_key`. Sans cette clé, les helpers admin ne peuvent ni créer
ni nettoyer les users de test.

**Important** : utiliser une instance Supabase **de développement / staging**,
JAMAIS la production. Les tests créent et suppriment des users en masse
sur le pattern `test-*@creativefair.test`.

2. **Migration 011 appliquée** (Sprint 36.C.2) — le trigger
   `handle_new_user` est nécessaire pour que les tests de signup
   réussissent. Vérifier en SQL :
   ```sql
   select tgname from pg_trigger where tgname = 'on_auth_user_created';
   ```

## Installation

```bash
npm install               # installe @playwright/test + dotenv
npm run test:e2e:install  # installe les binaires Chromium
```

## Exécution

```bash
# Tous les tests (séquentiel, 1 worker)
npm run test:e2e

# UI interactive (utile pour debug pas à pas)
npm run test:e2e:ui

# Un seul fichier
npx playwright test tests/e2e/01-signup-onboarding.spec.ts

# Avec navigateur visible (par défaut headless)
npx playwright test --headed
```

Playwright démarre automatiquement `npm run dev` (port 3000) si le
serveur n'est pas déjà en cours.

## Rapport

Après exécution, un rapport HTML est généré dans `playwright-report/`.

```bash
npx playwright show-report
```

## Cleanup

Chaque spec a un `afterAll` qui supprime les users dont email matche
`test-*@creativefair.test`. Si un crash interrompt un test, le cleanup
suivant ramasse les résidus.

Pour un nettoyage manuel hors-test :

```sql
-- Supabase SQL Editor (service_role)
delete from auth.users
where email like 'test-%@creativefair.test';
```

Les CASCADE détruisent `profiles` et `tenants` orphelins.

## Suite (6 specs)

| # | Fichier | Couverture |
|---|---|---|
| 1 | `01-signup-onboarding.spec.ts` | Trigger PG, magic link, onboarding 4/4, redirect /aujourd-hui |
| 2 | `02-aujourd-hui.spec.ts` | Home rendue, sections clés, console clean |
| 3 | `03-navigation-4-destinations.spec.ts` | 4 routes accessibles, Post Creator hors nav |
| 4 | `04-post-creator.spec.ts` | Route accessible, anti-gamification (0% dans UI) |
| 5 | `05-conseiller.spec.ts` | Route accessible, doctrine vocab (pas "IA" / "AI") |
| 6 | `06-multi-tenant-isolation.spec.ts` | 2 users distincts, aucune fuite d'IDs cross-tenant |
