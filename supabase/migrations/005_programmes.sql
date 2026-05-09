-- Sprint 32.5 — Migration 005 : table programmes
-- Source : §15.8 Cahier des charges v2.0
-- Idempotente : peut être réappliquée sans casser l'état si déjà présente

create table if not exists programmes (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  periode text not null check (periode in ('semaine', 'mois', 'trimestre')),
  arc_narratif jsonb not null,
  context_generation jsonb not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table programmes enable row level security;

drop policy if exists "tenant isolation programmes select" on programmes;
create policy "tenant isolation programmes select"
  on programmes for select
  using (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation programmes insert" on programmes;
create policy "tenant isolation programmes insert"
  on programmes for insert
  with check (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation programmes update" on programmes;
create policy "tenant isolation programmes update"
  on programmes for update
  using (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation programmes delete" on programmes;
create policy "tenant isolation programmes delete"
  on programmes for delete
  using (tenant_id = public.user_tenant_id());
