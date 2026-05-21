# Creative Fair v60 — Multi-Tenant

Ce skill décrit comment l'isolation multi-tenant est garantie côté DB et côté code.

## Principe fondamental

**Un seul codebase, une seule DB, toutes les données partagent un `tenant_id`.**

L'isolation passe par :
1. Une colonne `tenant_id` sur **toutes les tables sauf `tenants` elle-même**
2. RLS PostgreSQL activée partout, **sans exception**
3. Une fonction helper `public.user_tenant_id()` qui résout le tenant courant à partir du JWT
4. Des policies SELECT/INSERT/UPDATE/DELETE qui filtrent toutes sur `tenant_id = public.user_tenant_id()`

## La fonction `public.user_tenant_id()`

```sql
create or replace function public.user_tenant_id()
returns uuid as $$
  select tenant_id from profiles where id = auth.uid()
$$ language sql stable security definer;
```

Cette fonction est **stable** (même résultat dans une transaction) et **security definer** (s'exécute avec les privilèges du créateur). Elle lit la table `profiles` pour récupérer le `tenant_id` du user authentifié.

## Pattern de policies

Pour chaque table, 4 policies minimum :

```sql
create policy "<table> select" on <table> for select
  using (tenant_id = public.user_tenant_id());

create policy "<table> insert" on <table> for insert
  with check (tenant_id = public.user_tenant_id());

create policy "<table> update" on <table> for update
  using (tenant_id = public.user_tenant_id());

create policy "<table> delete" on <table> for delete
  using (tenant_id = public.user_tenant_id());
```

**Exception** : `analytics_events` et `credits_usage` n'ont pas de policy DELETE/UPDATE pour les users — seul le `service_role` peut écrire (les fonctions edge AI tracking).

## Côté code TypeScript

### À FAIRE

```ts
// Server component / route handler
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data } = await supabase.from('brands').select('*')
// → RLS filtre automatiquement par tenant_id
```

### À NE JAMAIS FAIRE

```ts
// ❌ Utiliser admin client en dehors d'un contexte explicitement admin
import { createAdmin } from '@/lib/supabase/admin'
const supabase = createAdmin()
await supabase.from('brands').select('*')
// → BYPASS RLS, retourne TOUTES les brands de TOUS les tenants
```

```ts
// ❌ Filtrer manuellement par tenant_id
const { data } = await supabase
  .from('brands')
  .select('*')
  .eq('tenant_id', userTenantId)
// → C'est inutile (RLS le fait déjà) et dangereux (oubli possible)
```

## Quand utiliser `createAdmin()`

Le client admin (service_role) bypasse RLS. Cas légitimes uniquement :

1. Création d'un nouveau tenant (avant que le user ait un profile)
2. Migrations / seeds
3. Cron jobs server-side (analytics, billing)
4. Webhooks Stripe ou autres intégrations sans contexte user

**Jamais** pour servir une requête venant d'un user.

## Theming par tenant

Chaque `tenant` a une colonne `theme jsonb` :

```json
{
  "colors": {
    "primary": "#A8324E",
    "background": "#FFF8F3",
    "text": "#2A1A1A"
  },
  "fonts": {
    "display": "\"Playfair Display\", serif",
    "body": "\"Inter\", sans-serif"
  }
}
```

Le layout root injecte ces valeurs en CSS variables (`--color-primary`, etc.) pour que Tailwind/CSS s'adapte sans recompilation.

## Test d'isolation

Le script `scripts/test-multi-tenant.ts` crée 2 tenants A et B avec 1 user et 1 brand chacun, puis vérifie qu'un user A ne peut PAS lire une brand B (et inversement). Ce test doit passer avant tout déploiement de migration touchant les policies.

## Tables actuelles (Sprint 1)

10 tables avec RLS active :

| Table | tenant_id | Notes |
|---|---|---|
| `tenants` | (id) | La table racine, lue via `id = public.user_tenant_id()`. |
| `profiles` | ✓ | Lien `auth.users` ↔ tenant. Update limité à `id = auth.uid()`. |
| `brands` | ✓ | Contient `brand_book` jsonb et `business_calendar` jsonb. |
| `onboarding_answers` | ✓ | Réponses brand book. |
| `uploads` | ✓ | Fichiers uploadés. |
| `posts` | ✓ | Publications planifiées (`business_event_id` lie à un événement du business calendar). |
| `conversations` | ✓ | Conseiller — INSERT/UPDATE/DELETE ne sont autorisés que sur `user_id = auth.uid()`. |
| `daily_coaching` | ✓ | Index unique `(brand_id, date)` — un seul coaching par jour par brand. |
| `analytics_events` | ✓ | **Read-only pour les users** — writes via service_role. |
| `credits_usage` | ✓ | **Read-only pour les users** — writes via service_role. |

## En cas de doute

- Si tu écris une nouvelle table : `tenant_id uuid not null references tenants(id) on delete cascade` est obligatoire.
- Si tu écris une nouvelle policy : commence par tester avec un user d'un autre tenant.
- Si tu hésites entre `createClient` et `createAdmin` : utilise `createClient`. Si ça échoue, demande-toi pourquoi avant de passer à `createAdmin`.
