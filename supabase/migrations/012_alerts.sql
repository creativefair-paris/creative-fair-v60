-- Sprint 36.G — Table alerts pour la Zone Critique de /aujourd-hui.
--
-- Une alerte est un signal tenant-level qui exige une attention immédiate
-- (échec de publication critique, incident plateforme, etc.). Distinct des
-- erreurs au niveau d'un post individuel (gérées par posts.statut).
--
-- En V1, aucun signal n'est généré automatiquement. La table existe pour
-- permettre des tests visuels via insertion manuelle.
--
-- Idempotente : CREATE TABLE IF NOT EXISTS + politiques DROP IF EXISTS.

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  severity text not null check (severity in ('critical', 'warning')),
  message text not null,
  source text not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_alerts_tenant_active
  on alerts(tenant_id, created_at desc)
  where resolved_at is null;

-- RLS : alerts tenant-scoped via public.user_tenant_id() (cohérent avec
-- les autres tables — cf. migrations 002 et 005).
alter table alerts enable row level security;

drop policy if exists "tenant isolation alerts select" on alerts;
create policy "tenant isolation alerts select"
  on alerts
  for select
  using (tenant_id = public.user_tenant_id());

-- Insert/Update/Delete via service_role uniquement (pas d'écriture user
-- en V1 — les alertes sont produites côté serveur par les workers ou
-- manuellement par l'admin).
drop policy if exists "tenant isolation alerts insert" on alerts;
create policy "tenant isolation alerts insert"
  on alerts
  for insert
  with check (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation alerts update" on alerts;
create policy "tenant isolation alerts update"
  on alerts
  for update
  using (tenant_id = public.user_tenant_id());
