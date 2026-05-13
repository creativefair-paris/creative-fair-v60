-- Sprint 37.C (A8) — Migration 020 : brand_metrics.
-- Stocke les chiffres clés de la marque renseignés manuellement par le
-- pilote (followers, engagement, DM clients, mentions presse, etc.).
-- Source V1 : conversation conseiller (scénario A8). Source V2+ : API Meta.
-- Lecture par Sébastien L. (TF Analytics) en sub-prompt côté serveur.
-- Idempotente.

create table if not exists brand_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_type text not null check (metric_type in (
    'followers_count',
    'engagement_rate_pct',
    'dm_clients_qualifies_per_month',
    'presse_mentions_per_month',
    'comments_qualifies_per_month',
    'collaborations_demands_per_month',
    'newsletter_subscribers',
    'site_visits_per_month'
  )),
  value numeric not null,
  period text not null check (period in ('month', 'week')),
  source text not null default 'manual_input' check (source in (
    'manual_input',
    'meta_api',
    'conversation_extract'
  )),
  recorded_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_brand_metrics_tenant_type_date
  on brand_metrics(tenant_id, metric_type, recorded_at desc);

alter table brand_metrics enable row level security;

drop policy if exists "tenant isolation brand_metrics select" on brand_metrics;
create policy "tenant isolation brand_metrics select" on brand_metrics
  for select using (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation brand_metrics insert" on brand_metrics;
create policy "tenant isolation brand_metrics insert" on brand_metrics
  for insert with check (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation brand_metrics update" on brand_metrics;
create policy "tenant isolation brand_metrics update" on brand_metrics
  for update using (tenant_id = public.user_tenant_id())
  with check (tenant_id = public.user_tenant_id());

comment on table brand_metrics is
  'Chiffres clés de la marque, renseignés par le pilote (Sprint 37.C). Vocabulaire interne : retombées / indicateurs éditoriaux.';
comment on column brand_metrics.metric_type is
  'Type de chiffre : followers, engagement, DM clients, mentions presse, etc.';
comment on column brand_metrics.source is
  'Origine du chiffre : manual_input (formulaire), meta_api (V2), conversation_extract (parsing scénario A8).';
