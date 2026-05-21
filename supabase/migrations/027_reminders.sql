-- Sprint 43-stable — Table reminders (Rappels V2.0)
-- Doctrine 04-MULTI_TENANT.md : tenant_id obligatoire + RLS + 4 policies.
-- Template exact selon brief §5.3.

create table reminders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  due_at timestamptz,
  completed_at timestamptz,
  source_post_id uuid references posts(id) on delete set null,
  source_conversation_id uuid references conversations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_reminders_tenant_user_active
  on reminders(tenant_id, user_id, due_at)
  where completed_at is null;

alter table reminders enable row level security;

create policy "reminders select" on reminders for select
  using (tenant_id = public.user_tenant_id());

create policy "reminders insert" on reminders for insert
  with check (tenant_id = public.user_tenant_id() and user_id = auth.uid());

create policy "reminders update" on reminders for update
  using (tenant_id = public.user_tenant_id() and user_id = auth.uid());

create policy "reminders delete" on reminders for delete
  using (tenant_id = public.user_tenant_id() and user_id = auth.uid());
