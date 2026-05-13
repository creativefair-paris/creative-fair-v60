-- Sprint 37.A (F9) — Table library_documents + bucket library-uploads.
--
-- Bibliothèque V1 : espace centralisé de la marque côté pilote. Tout
-- ce qui a été uploadé, créé, archivé est accessible depuis un seul
-- endroit avec recherche et filtres.
--
-- F9.V1 = UI + upload + listing + preview. RAG + attachment manuel
-- dans le chat conseiller REPORTÉS Sprint 38 (cf. decisions.md).
--
-- Idempotente : CREATE TABLE IF NOT EXISTS + DROP POLICY IF EXISTS.

create table if not exists library_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Titre (auto-set depuis filename si vide à l'upload).
  title text not null,
  -- Description optionnelle.
  description text,
  -- Catégorie pilotage du tri/filtres.
  category text check (category in ('presse', 'brief', 'archive', 'autre')),
  -- Chemin dans le bucket library-uploads.
  file_path text not null,
  -- Type MIME pour le rendu preview.
  file_type text not null,
  -- Taille en octets pour affichage.
  file_size_bytes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_library_docs_tenant_created
  on library_documents(tenant_id, created_at desc);

create index if not exists idx_library_docs_category
  on library_documents(tenant_id, category);

-- updated_at trigger
create or replace function public.touch_library_docs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_library_docs_touch on library_documents;
create trigger trg_library_docs_touch
  before update on library_documents
  for each row
  execute function public.touch_library_docs_updated_at();

-- RLS multi-tenant.
alter table library_documents enable row level security;

drop policy if exists "tenant isolation library_documents select" on library_documents;
create policy "tenant isolation library_documents select" on library_documents
  for select using (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation library_documents insert" on library_documents;
create policy "tenant isolation library_documents insert" on library_documents
  for insert with check (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation library_documents delete" on library_documents;
create policy "tenant isolation library_documents delete" on library_documents
  for delete using (tenant_id = public.user_tenant_id());

-- Bucket Storage pour les uploads pilote (PDF/DOCX/images, max 10 MB).
insert into storage.buckets (id, name, public)
values ('library-uploads', 'library-uploads', false)
on conflict (id) do nothing;

drop policy if exists "library uploads tenant isolation read" on storage.objects;
create policy "library uploads tenant isolation read" on storage.objects
  for select using (
    bucket_id = 'library-uploads'
    and (storage.foldername(name))[1] = public.user_tenant_id()::text
  );

drop policy if exists "library uploads tenant isolation write" on storage.objects;
create policy "library uploads tenant isolation write" on storage.objects
  for insert with check (
    bucket_id = 'library-uploads'
    and (storage.foldername(name))[1] = public.user_tenant_id()::text
  );

comment on table library_documents is
  'Sprint 37.A F9 V1 — documents uploadés par le pilote dans la Bibliothèque (presse, brief, archive, autre).';
