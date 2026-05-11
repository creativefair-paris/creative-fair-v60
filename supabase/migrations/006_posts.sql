-- Sprint 36.A — Migration 006 : table posts
-- Source : Sprint 36.A — Flux inversé Marcus, Chantier A.1
-- Idempotente : peut être réappliquée sans casser l'état si déjà présente

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
