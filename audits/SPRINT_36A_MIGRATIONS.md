# Sprint 36.A — Migrations 006 & 007

**Action Lead 60s requise après livraison Sprint 36.A.**
Sans ces 2 migrations appliquées, le flux onboarding 4 questions échouera.

---

## Migration 006 — Table `posts`

Source : `supabase/migrations/006_posts.sql`

```sql
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references programmes(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  brand_id uuid not null references brands(id) on delete cascade,
  pilier_nom text not null,
  jour text not null check (jour in ('lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche')),
  date_prevue date not null,
  heure_prevue time not null default '09:00:00',
  titre text not null,
  angle text not null,
  type_contenu text not null check (type_contenu in ('photo','carousel','video','texte')),
  statut text not null default 'planifie' check (statut in ('planifie','genere','publie','archive')),
  contenu_genere jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_programme_id on posts(programme_id);
create index if not exists idx_posts_tenant_id on posts(tenant_id);
create index if not exists idx_posts_date_prevue on posts(date_prevue);

alter table posts enable row level security;

drop policy if exists "tenant isolation posts select" on posts;
create policy "tenant isolation posts select"
  on posts for select using (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation posts insert" on posts;
create policy "tenant isolation posts insert"
  on posts for insert with check (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation posts update" on posts;
create policy "tenant isolation posts update"
  on posts for update using (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation posts delete" on posts;
create policy "tenant isolation posts delete"
  on posts for delete using (tenant_id = public.user_tenant_id());
```

---

## Migration 007 — Extension `brands`

Source : `supabase/migrations/007_brands_extension.sql`

```sql
alter table brands
  add column if not exists secteur text,
  add column if not exists ton text,
  add column if not exists singularite text,
  add column if not exists piliers_narratifs jsonb default '[]'::jsonb;
```

**Décision Sprint 36.A :** `secteur` + `ton` ajoutés ici (pas dans une 008 séparée) pour rester soustractif. Le prompt initial listait seulement `singularite` + `piliers_narratifs` mais référençait `brands.secteur` et `brands.ton` au Chantier B — c'est la seule lecture cohérente.

---

## Application

### Option 1 — Supabase Studio SQL Editor

1. Ouvrir https://supabase.com/dashboard/project/ugfnokdxdqaqapylafeq/sql/new
2. Copier-coller le contenu de `supabase/migrations/006_posts.sql` → **Run**
3. Copier-coller le contenu de `supabase/migrations/007_brands_extension.sql` → **Run**

### Option 2 — Scripts d'application (pattern apply-migration-004)

```bash
set -a && source .env.local && set +a
npx tsx scripts/apply-migration-006.ts
npx tsx scripts/apply-migration-007.ts
```

Les scripts tentent une RPC `exec_sql` ; si l'extension n'est pas dispo sur le Supabase managé, ils affichent les instructions Studio.

---

## Vérification post-application

À exécuter dans Supabase Studio SQL Editor :

```sql
-- 006 — posts
select count(*) from posts;  -- doit retourner 0

-- 007 — brands extension
select column_name
  from information_schema.columns
 where table_name = 'brands'
   and column_name in ('secteur','ton','singularite','piliers_narratifs');
-- doit retourner 4 lignes

-- Policies RLS posts
select policyname from pg_policies where tablename = 'posts';
-- doit retourner 4 lignes (select/insert/update/delete)
```
