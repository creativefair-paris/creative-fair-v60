# Supabase — Creative Fair v60

## Architecture en bref

10 tables, multi-tenant strict. Toutes les tables sauf `tenants` portent une colonne `tenant_id` avec foreign key cascade.

| # | Table | Rôle |
|---|---|---|
| 1 | `tenants` | Espace client (B2B custom ou B2C). Theme JSON. |
| 2 | `profiles` | Extension de `auth.users` rattachée à un tenant. |
| 3 | `brands` | Marque pilotée par un tenant — brand book + business calendar. |
| 4 | `onboarding_answers` | Réponses au questionnaire de brand book. |
| 5 | `uploads` | Documents, sites, images uploadés. |
| 6 | `posts` | Publications planifiées. |
| 7 | `conversations` | Historique du Conseiller. |
| 8 | `daily_coaching` | Coaching quotidien généré par IA. |
| 9 | `analytics_events` | Événements produit (writes via service_role). |
| 10 | `credits_usage` | Tracking tokens/coûts Anthropic (writes via service_role). |

RLS activée partout. Un user voit uniquement les rows où `tenant_id = auth.user_tenant_id()`. Voir [`/skills/03-MULTI_TENANT.md`](../skills/03-MULTI_TENANT.md).

## Migrations

Les migrations sont dans `supabase/migrations/`, numérotées dans l'ordre d'application :

| Fichier | Contenu |
|---|---|
| `001_initial_schema.sql` | 10 tables, indexes, trigger `updated_at`. |
| `002_rls_policies.sql` | Helper `auth.user_tenant_id()` + policies SELECT/INSERT/UPDATE/DELETE. |
| `003_seed_tenants.sql` | Seed des 3 tenants B2B (Angelina, Tous en Tête, Comptoir). |

### Appliquer une migration

Via le SQL Editor du Supabase Dashboard (méthode actuelle, pas de CLI installée) :

1. Ouvrir le projet sur https://supabase.com/dashboard/project/ugfnokdxdqaqapylafeq
2. **SQL Editor** → New query
3. Coller le contenu du fichier `.sql`
4. **Run**
5. Vérifier l'absence d'erreur dans le panneau de résultats

Voir [`/audits/SPRINT_1_DEPLOY.md`](../audits/SPRINT_1_DEPLOY.md) pour le pas-à-pas du Sprint 1.

### Ajouter une nouvelle migration

1. Créer `supabase/migrations/00X_<nom_court>.sql`
2. La numéroter en continuant la séquence (004, 005…)
3. La faire relire avant de l'appliquer en prod
4. Documenter ce qu'elle fait dans le header SQL

**Règle** : une migration ne se réécrit jamais après application. Pour corriger, on crée une nouvelle migration qui annule/modifie.

## Régénérer les types TypeScript

Une fois les migrations appliquées :

```bash
npx supabase gen types typescript \
  --project-id ugfnokdxdqaqapylafeq > types/database.ts
```

(Nécessite `npx supabase login` une fois pour s'authentifier.)

Le fichier `types/database.ts` actuel contient un stub permissif. Les types réels remplaceront ce stub et donneront l'autocomplétion sur toutes les tables.

## Helpers côté code

| Fichier | Usage |
|---|---|
| `lib/supabase/client.ts` | Client browser — Client Components, RLS active. |
| `lib/supabase/server.ts` | Client serveur — Server Components / route handlers, RLS active via cookies. |
| `lib/supabase/middleware.ts` | `updateSession()` — refresh la session dans le middleware Next.js. |
| `lib/supabase/admin.ts` | Service-role client — **bypasse RLS**, à n'utiliser que pour provisioning, seeds, webhooks. |

## Test d'isolation

```bash
npx tsx scripts/test-multi-tenant.ts
```

Crée 2 tenants A/B, 1 user et 1 brand chacun, vérifie que A ne voit jamais les données de B (et inversement). Cleanup automatique à la fin. Doit passer 5/5 avant tout déploiement touchant aux policies.
