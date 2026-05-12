-- Sprint 36.B.5 — Liste d'attente pour les canaux à venir.
-- TikTok, X, YouTube, Facebook ne sont pas couverts par Creative Fair V1.
-- Les utilisateurs qui s'inscrivent ici seront notifiés à l'arrivée.
-- RLS via public.user_tenant_id() (pattern existant).

create table if not exists channel_waitlist (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  brand_id    uuid not null references brands(id)  on delete cascade,
  channel     text not null check (channel in ('tiktok', 'x', 'youtube', 'facebook')),
  email       text not null,
  created_at  timestamptz default now(),
  unique(brand_id, channel, email)
);

create index if not exists idx_channel_waitlist_brand
  on channel_waitlist(brand_id);
create index if not exists idx_channel_waitlist_channel
  on channel_waitlist(channel);

alter table channel_waitlist enable row level security;

drop policy if exists "waitlist select" on channel_waitlist;
create policy "waitlist select" on channel_waitlist
  for select using (tenant_id = public.user_tenant_id());

drop policy if exists "waitlist insert" on channel_waitlist;
create policy "waitlist insert" on channel_waitlist
  for insert with check (tenant_id = public.user_tenant_id());

drop policy if exists "waitlist delete" on channel_waitlist;
create policy "waitlist delete" on channel_waitlist
  for delete using (tenant_id = public.user_tenant_id());

-- Vérifications post-migration (manuel) :
--   select tablename from pg_tables where tablename = 'channel_waitlist';
--   select policyname from pg_policies where tablename = 'channel_waitlist';
