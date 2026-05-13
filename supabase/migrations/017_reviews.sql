-- Sprint 37.A (F8) — Table reviews + bucket Storage review-visuals.
--
-- Reviews permet au pilote de "vérifier un post avant publication" :
--   * fact-check du texte (TF Éditorial Magazine Albane R.) → pour chaque
--     affirmation, indication "sourçable" / "à vérifier" / "non sourçable"
--   * crédit visuel (TF Archives & Mémoire Élise M.) → auteur, archive,
--     statut droits + crédit prêt à coller
--
-- Décision Lead salve 4 : on dispatche malgré la remarque Elena
-- (validation business à venir). Doctrinalement aligné TF Éditorial
-- Magazine + Archives & Mémoire.
--
-- Idempotente : CREATE TABLE IF NOT EXISTS + DROP POLICY IF EXISTS.

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Titre (auto-set depuis le début du post_text si laissé vide).
  title text,
  -- Texte du post à vérifier.
  post_text text,
  -- URL du visuel (alternative à un upload).
  visual_url text,
  -- Chemin du visuel uploadé dans le bucket review-visuals.
  visual_uploaded_path text,
  -- Fact-check texte : array d'affirmations avec status. Format :
  -- [{ statement, status: 'sourcable'|'a_verifier'|'non_sourcable',
  --    suggested_source?: string }]
  fact_check_payload jsonb,
  -- Crédit visuel : { auteur, archive, annee, licence, alternative? }
  visual_credit_payload jsonb,
  -- Ligne formatée "© Auteur / Archive / Année / Licence" prête à coller.
  ready_to_paste_credit text,
  -- Cycle : PENDING (créée) → COMPLETED (fact-check + crédit prêts) →
  -- ARCHIVED (le pilote l'a marqué pour archivage).
  state text not null default 'PENDING'
    check (state in ('PENDING', 'COMPLETED', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reviews_tenant_created
  on reviews(tenant_id, created_at desc);

create index if not exists idx_reviews_state_active
  on reviews(tenant_id, state)
  where state != 'ARCHIVED';

-- updated_at trigger
create or replace function public.touch_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_reviews_touch on reviews;
create trigger trg_reviews_touch
  before update on reviews
  for each row
  execute function public.touch_reviews_updated_at();

-- RLS multi-tenant (cohérent migrations 002, 005, 012, 015).
alter table reviews enable row level security;

drop policy if exists "tenant isolation reviews select" on reviews;
create policy "tenant isolation reviews select" on reviews
  for select using (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation reviews insert" on reviews;
create policy "tenant isolation reviews insert" on reviews
  for insert with check (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation reviews update" on reviews;
create policy "tenant isolation reviews update" on reviews
  for update using (tenant_id = public.user_tenant_id())
  with check (tenant_id = public.user_tenant_id());

-- Bucket Storage pour visuels uploadés. Le path est toujours préfixé du
-- tenant_id (RLS storage.objects ci-dessous).
insert into storage.buckets (id, name, public)
values ('review-visuals', 'review-visuals', false)
on conflict (id) do nothing;

drop policy if exists "review visuals tenant isolation read" on storage.objects;
create policy "review visuals tenant isolation read" on storage.objects
  for select using (
    bucket_id = 'review-visuals'
    and (storage.foldername(name))[1] = public.user_tenant_id()::text
  );

drop policy if exists "review visuals tenant isolation write" on storage.objects;
create policy "review visuals tenant isolation write" on storage.objects
  for insert with check (
    bucket_id = 'review-visuals'
    and (storage.foldername(name))[1] = public.user_tenant_id()::text
  );

comment on table reviews is
  'Sprint 37.A F8 — fact-check texte + crédit visuel d''un post avant publication.';
comment on column reviews.fact_check_payload is
  'Array [{ statement, status: sourcable|a_verifier|non_sourcable, suggested_source? }].';
comment on column reviews.visual_credit_payload is
  '{ auteur, archive, annee, licence, alternative? }.';
