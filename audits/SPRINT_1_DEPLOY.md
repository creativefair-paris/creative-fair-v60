# Sprint 1 — Déploiement des migrations sur Supabase

> Procédure manuelle via le SQL Editor du Dashboard Supabase.
> Pas de Supabase CLI installée à ce stade.

## Avant de commencer

- Connecte-toi sur https://supabase.com/dashboard/project/ugfnokdxdqaqapylafeq
- Vérifie qu'aucune table custom n'existe encore dans **Database > Tables** (l'audit Sprint 1 a confirmé que c'est le cas le 2026-05-06).
- Si des tables existent déjà : **arrête-toi** et préviens Ulysse avant de continuer.

## Étape 1 — Schema (migration 001)

1. **SQL Editor** → **New query**
2. Copier le contenu intégral de [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql)
3. Cliquer **Run**
4. Attendu : `Success. No rows returned`
5. Vérifier dans **Database > Tables** que les 10 tables sont visibles :
   `tenants`, `profiles`, `brands`, `onboarding_answers`, `uploads`, `posts`, `conversations`, `daily_coaching`, `analytics_events`, `credits_usage`.

## Étape 2 — RLS policies (migration 002)

1. **SQL Editor** → **New query**
2. Copier le contenu intégral de [`supabase/migrations/002_rls_policies.sql`](../supabase/migrations/002_rls_policies.sql)
3. Cliquer **Run**
4. Attendu : `Success. No rows returned`
5. Vérifier dans **Authentication > Policies** :
   - 10 tables affichées
   - Chaque table a un cadenas vert (RLS enabled)
   - Compter les policies : `tenants` 1, `profiles` 2, `brands` 4, `onboarding_answers` 4, `uploads` 4, `posts` 4, `conversations` 4, `daily_coaching` 4, `analytics_events` 1, `credits_usage` 1.
   - Total : **29 policies**.

## Étape 3 — Seed des 3 tenants B2B (migration 003)

1. **SQL Editor** → **New query**
2. Copier le contenu intégral de [`supabase/migrations/003_seed_tenants.sql`](../supabase/migrations/003_seed_tenants.sql)
3. Cliquer **Run**
4. Attendu : `Success. No rows returned`
5. Vérifier dans **Database > Table editor > tenants** : 3 lignes (`angelina`, `tousentete`, `comptoir`).

## Étape 4 — Test d'isolation multi-tenant

```bash
cd /Users/ulysselemoine/Desktop/creative-fair-v60
npx tsx scripts/test-multi-tenant.ts
```

Attendu :
```
Result: 5 passed, 0 failed
```

Si un test échoue : **arrête tout**, documente dans `audits/SPRINT_1_BLOCAGE.md`, préviens Ulysse.

## Étape 5 — Régénérer les types TypeScript

```bash
npx supabase login            # une fois, ouvre un browser pour s'auth
npx supabase gen types typescript \
  --project-id ugfnokdxdqaqapylafeq > types/database.ts
```

Vérifier que `types/database.ts` contient maintenant les types réels (Tables, Enums, etc.) et plus le stub.

Re-run pour s'assurer que tout typecheck :

```bash
npm run build
npm run lint
```

## En cas d'erreur SQL

1. **Ne pas réessayer en aveugle.**
2. Documenter l'erreur exacte dans `audits/SPRINT_1_BLOCAGE.md` :
   - Quelle migration ?
   - Quel statement ?
   - Message d'erreur complet
3. Pour repartir propre : **Settings > Database > Reset database** (Dashboard Supabase). Attention : efface tout. À ne faire que si on est en phase initiale (pas de données utilisateur).
4. Préviens Ulysse avant de réappliquer.
