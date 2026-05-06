-- Creative Fair v60 — Row Level Security policies (Sprint 1)
-- Multi-tenant isolation : tous les SELECT/INSERT/UPDATE/DELETE
-- sont filtrés par tenant_id = public.user_tenant_id().

-- =========================================================
-- Helper function : retourne le tenant_id du user courant
-- =========================================================
create or replace function public.user_tenant_id()
returns uuid as $$
  select tenant_id from profiles where id = auth.uid()
$$ language sql stable security definer;

-- =========================================================
-- Enable RLS on all tables
-- =========================================================
alter table tenants            enable row level security;
alter table profiles           enable row level security;
alter table brands             enable row level security;
alter table onboarding_answers enable row level security;
alter table uploads            enable row level security;
alter table posts              enable row level security;
alter table conversations      enable row level security;
alter table daily_coaching     enable row level security;
alter table analytics_events   enable row level security;
alter table credits_usage      enable row level security;

-- =========================================================
-- tenants — read-only for users (managed by service_role)
-- =========================================================
create policy "tenants select own"
  on tenants for select
  using (id = public.user_tenant_id());

-- =========================================================
-- profiles
-- =========================================================
create policy "profiles select tenant"
  on profiles for select
  using (tenant_id = public.user_tenant_id());

create policy "profiles update self"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and tenant_id = public.user_tenant_id());

-- =========================================================
-- brands
-- =========================================================
create policy "brands select tenant"
  on brands for select
  using (tenant_id = public.user_tenant_id());

create policy "brands insert tenant"
  on brands for insert
  with check (tenant_id = public.user_tenant_id());

create policy "brands update tenant"
  on brands for update
  using (tenant_id = public.user_tenant_id())
  with check (tenant_id = public.user_tenant_id());

create policy "brands delete tenant"
  on brands for delete
  using (tenant_id = public.user_tenant_id());

-- =========================================================
-- onboarding_answers
-- =========================================================
create policy "onboarding_answers select tenant"
  on onboarding_answers for select
  using (tenant_id = public.user_tenant_id());

create policy "onboarding_answers insert tenant"
  on onboarding_answers for insert
  with check (tenant_id = public.user_tenant_id());

create policy "onboarding_answers update tenant"
  on onboarding_answers for update
  using (tenant_id = public.user_tenant_id())
  with check (tenant_id = public.user_tenant_id());

create policy "onboarding_answers delete tenant"
  on onboarding_answers for delete
  using (tenant_id = public.user_tenant_id());

-- =========================================================
-- uploads
-- =========================================================
create policy "uploads select tenant"
  on uploads for select
  using (tenant_id = public.user_tenant_id());

create policy "uploads insert tenant"
  on uploads for insert
  with check (tenant_id = public.user_tenant_id());

create policy "uploads update tenant"
  on uploads for update
  using (tenant_id = public.user_tenant_id())
  with check (tenant_id = public.user_tenant_id());

create policy "uploads delete tenant"
  on uploads for delete
  using (tenant_id = public.user_tenant_id());

-- =========================================================
-- posts
-- =========================================================
create policy "posts select tenant"
  on posts for select
  using (tenant_id = public.user_tenant_id());

create policy "posts insert tenant"
  on posts for insert
  with check (tenant_id = public.user_tenant_id());

create policy "posts update tenant"
  on posts for update
  using (tenant_id = public.user_tenant_id())
  with check (tenant_id = public.user_tenant_id());

create policy "posts delete tenant"
  on posts for delete
  using (tenant_id = public.user_tenant_id());

-- =========================================================
-- conversations
-- =========================================================
create policy "conversations select tenant"
  on conversations for select
  using (tenant_id = public.user_tenant_id());

create policy "conversations insert tenant"
  on conversations for insert
  with check (tenant_id = public.user_tenant_id() and user_id = auth.uid());

create policy "conversations update tenant"
  on conversations for update
  using (tenant_id = public.user_tenant_id() and user_id = auth.uid())
  with check (tenant_id = public.user_tenant_id() and user_id = auth.uid());

create policy "conversations delete tenant"
  on conversations for delete
  using (tenant_id = public.user_tenant_id() and user_id = auth.uid());

-- =========================================================
-- daily_coaching
-- =========================================================
create policy "daily_coaching select tenant"
  on daily_coaching for select
  using (tenant_id = public.user_tenant_id());

create policy "daily_coaching insert tenant"
  on daily_coaching for insert
  with check (tenant_id = public.user_tenant_id());

create policy "daily_coaching update tenant"
  on daily_coaching for update
  using (tenant_id = public.user_tenant_id())
  with check (tenant_id = public.user_tenant_id());

create policy "daily_coaching delete tenant"
  on daily_coaching for delete
  using (tenant_id = public.user_tenant_id());

-- =========================================================
-- analytics_events — read-only for users (writes via service_role)
-- =========================================================
create policy "analytics_events select tenant"
  on analytics_events for select
  using (tenant_id = public.user_tenant_id());

-- =========================================================
-- credits_usage — read-only for users (writes via service_role)
-- =========================================================
create policy "credits_usage select tenant"
  on credits_usage for select
  using (tenant_id = public.user_tenant_id());
