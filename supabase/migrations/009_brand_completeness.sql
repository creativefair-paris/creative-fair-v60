-- Sprint 36.B.3 — Ma Marque complétude : 5 nouveaux champs + table brand_archives.
-- Doctrine : refactor en 14 rangs sur la page Ma Marque (pattern iOS Settings).
-- Adapté au schéma existant : RLS via public.user_tenant_id() (pas de table user_tenants).

-- ── Nouveaux champs sur brands ───────────────────────────────────────

alter table brands add column if not exists cible            text  default '';
alter table brands add column if not exists univers_refuse   text  default '';
alter table brands add column if not exists benchmarks       jsonb default '[]'::jsonb;
alter table brands add column if not exists canaux           jsonb default '{}'::jsonb;
alter table brands add column if not exists brand_book       jsonb default '{}'::jsonb;

comment on column brands.cible is
  'Cible précise sous forme de portrait éditorial (1 personne, 1 posture).';
comment on column brands.univers_refuse is
  'Ce que la marque ne fera jamais — sujets, postures, formats, partenaires.';
comment on column brands.benchmarks is
  'Array de 0 à 3 marques regardées : [{nom, raison}].';
comment on column brands.canaux is
  'Canaux activés et leur URL/handle : {linkedin, newsletter, site, gmb} chacun {actif, url}.';
comment on column brands.brand_book is
  'Charte visuelle : {palette[], typo{}, logo_url, dos[], donts[]}.';

-- ── Table brand_archives ─────────────────────────────────────────────

create table if not exists brand_archives (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  brand_id      uuid not null references brands(id)  on delete cascade,
  type          text not null check (type in ('texte', 'pdf', 'image', 'video', 'lien')),
  titre         text not null,
  description   text default '',
  url           text,
  fichier_path  text,
  tags          text[] default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_brand_archives_brand_id
  on brand_archives(brand_id);
create index if not exists idx_brand_archives_tenant_id
  on brand_archives(tenant_id);

-- ── RLS brand_archives ──────────────────────────────────────────────
-- Aligné sur le pattern existant : public.user_tenant_id() lit le tenant
-- de profiles.tenant_id. Un user n'appartient qu'à un seul tenant.

alter table brand_archives enable row level security;

drop policy if exists "brand_archives select" on brand_archives;
create policy "brand_archives select" on brand_archives
  for select using (tenant_id = public.user_tenant_id());

drop policy if exists "brand_archives insert" on brand_archives;
create policy "brand_archives insert" on brand_archives
  for insert with check (tenant_id = public.user_tenant_id());

drop policy if exists "brand_archives update" on brand_archives;
create policy "brand_archives update" on brand_archives
  for update using (tenant_id = public.user_tenant_id())
              with check (tenant_id = public.user_tenant_id());

drop policy if exists "brand_archives delete" on brand_archives;
create policy "brand_archives delete" on brand_archives
  for delete using (tenant_id = public.user_tenant_id());

-- ── Vérifications post-migration (manuel) ───────────────────────────
--   select column_name, data_type
--     from information_schema.columns
--     where table_name = 'brands'
--       and column_name in ('cible','univers_refuse','benchmarks','canaux','brand_book');
--   select tablename from pg_tables where tablename = 'brand_archives';
--   select policyname from pg_policies where tablename = 'brand_archives';
