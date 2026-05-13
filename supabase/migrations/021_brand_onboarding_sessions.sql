-- Sprint 37.C (F18) — Migration 021 : brand_onboarding_sessions.
-- Persiste l'état du wizard guidé Ma Marque (14 étapes). Permet la
-- reprise d'une session IN_PROGRESS, l'expiration à 30 jours, et
-- l'abandon explicite par le pilote.
-- Idempotente.

create table if not exists brand_onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  current_step integer not null default 0,
  total_steps integer not null default 14,
  responses jsonb not null default '{}'::jsonb,
  state text not null default 'IN_PROGRESS' check (state in (
    'IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'EXPIRED'
  )),
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_brand_onboarding_tenant_state
  on brand_onboarding_sessions(tenant_id, state) where state = 'IN_PROGRESS';

alter table brand_onboarding_sessions enable row level security;

drop policy if exists "tenant isolation brand_onboarding select" on brand_onboarding_sessions;
create policy "tenant isolation brand_onboarding select" on brand_onboarding_sessions
  for select using (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation brand_onboarding insert" on brand_onboarding_sessions;
create policy "tenant isolation brand_onboarding insert" on brand_onboarding_sessions
  for insert with check (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation brand_onboarding update" on brand_onboarding_sessions;
create policy "tenant isolation brand_onboarding update" on brand_onboarding_sessions
  for update using (tenant_id = public.user_tenant_id())
  with check (tenant_id = public.user_tenant_id());

comment on table brand_onboarding_sessions is
  'Sessions du wizard guidé Ma Marque (F18). Permet reprise + expiration 30j.';
comment on column brand_onboarding_sessions.responses is
  'JSONB indexé par stepIndex string : {"0": {...}, "1": {...}, ..., "13": {...}}';
