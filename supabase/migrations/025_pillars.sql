-- Sprint 37.K (F89) — Migration 025 : table pillars.
-- Vraie persistance des piliers narratifs (au lieu du champ JSONB
-- brands.piliers_narratifs hérité Sprint 36).
--
-- L'ancienne colonne brands.piliers_narratifs reste en place pour
-- compatibilité V1 (migration progressive). Sprint 38+ décidera de
-- son retrait après backfill.
--
-- Idempotente.

create table if not exists pillars (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  brand_id uuid not null references brands(id) on delete cascade,

  title text not null,
  description text not null,
  color_hex text,

  position integer not null default 0,

  -- Sprint 37.K F89 — Conserve l'historique des 5 questions guidées
  -- + réponses qui ont mené à la création (audit + ré-édition).
  questions_answers jsonb,

  -- Audit du modèle Anthropic qui a généré le pilier ('sonnet-4-6' V1).
  generation_model text,

  -- Soft delete : posts existants peuvent référencer un pilier archivé.
  archived_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint pillars_title_length check (char_length(title) <= 50),
  constraint pillars_description_length check (char_length(description) <= 500)
);

create index if not exists idx_pillars_brand_active
  on pillars(brand_id) where archived_at is null;
create index if not exists idx_pillars_tenant_active
  on pillars(tenant_id) where archived_at is null;

alter table pillars enable row level security;

drop policy if exists "tenant isolation pillars select" on pillars;
create policy "tenant isolation pillars select" on pillars
  for select using (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation pillars insert" on pillars;
create policy "tenant isolation pillars insert" on pillars
  for insert with check (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation pillars update" on pillars;
create policy "tenant isolation pillars update" on pillars
  for update using (tenant_id = public.user_tenant_id())
  with check (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation pillars delete" on pillars;
create policy "tenant isolation pillars delete" on pillars
  for delete using (tenant_id = public.user_tenant_id());

-- Trigger updated_at (réutilise la fonction update_updated_at_column
-- existante si présente, sinon création conditionnelle).
do $$
begin
  if not exists (
    select 1 from pg_proc where proname = 'update_updated_at_column'
  ) then
    create or replace function update_updated_at_column()
    returns trigger as $func$
    begin
      new.updated_at = now();
      return new;
    end;
    $func$ language plpgsql;
  end if;
end $$;

drop trigger if exists update_pillars_updated_at on pillars;
create trigger update_pillars_updated_at
  before update on pillars
  for each row
  execute function update_updated_at_column();

comment on table pillars is
  'Sprint 37.K (F89) — Piliers narratifs persistés. Remplace progressivement brands.piliers_narratifs JSONB.';
comment on column pillars.title is 'Max 3 mots (validation code applicatif), 50 char max (DB).';
comment on column pillars.description is '2-3 phrases, large mais structurante. 500 char max.';
comment on column pillars.questions_answers is
  'JSONB : { q1: "réponse 1", q2: "réponse 2", ... } — historique 5 questions guidées.';
comment on column pillars.generation_model is
  'Audit du modèle Anthropic ayant généré le pilier (sonnet-4-6 V1).';
comment on column pillars.archived_at is
  'Soft delete : posts existants peuvent référencer (pas hard delete).';
