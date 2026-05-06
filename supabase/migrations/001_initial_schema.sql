-- Creative Fair v60 — Initial schema (Sprint 1)
-- 10 tables, multi-tenant. RLS will be enabled in 002.
-- Concept "méthode 4 mois" abandonné : pas de table programmes.
-- Le calendrier éditorial est piloté par brands.business_calendar.

-- =========================================================
-- 1. tenants
-- =========================================================
create table tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  plan text not null check (plan in ('b2b_custom', 'b2c')),
  theme jsonb not null default '{}'::jsonb,
  enabled_channels text[] default array['instagram'],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_tenants_slug on tenants(slug);

-- =========================================================
-- 2. profiles (extension of auth.users)
-- =========================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profiles_tenant on profiles(tenant_id);

-- =========================================================
-- 3. brands
-- =========================================================
create table brands (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  brand_book jsonb,
  business_calendar jsonb,
  brand_book_status text not null default 'incomplete'
    check (brand_book_status in ('incomplete', 'complete')),
  questions_answered integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_brands_tenant on brands(tenant_id);

-- =========================================================
-- 4. onboarding_answers
-- =========================================================
create table onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  question_id text not null,
  answer jsonb not null,
  source text not null default 'question'
    check (source in ('question', 'document', 'website')),
  created_at timestamptz default now()
);

create index idx_onboarding_brand on onboarding_answers(brand_id);
create index idx_onboarding_tenant on onboarding_answers(tenant_id);

-- =========================================================
-- 5. uploads
-- =========================================================
create table uploads (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  type text not null check (type in ('document', 'website', 'image')),
  url text,
  storage_path text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index idx_uploads_brand on uploads(brand_id);
create index idx_uploads_tenant on uploads(tenant_id);

-- =========================================================
-- 6. posts
-- =========================================================
create table posts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  scheduled_for timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'in_progress', 'ready', 'scheduled', 'published')),
  type text
    check (type in ('anecdote_live', 'anecdote_custom', 'reels', 'story', 'newsletter', 'unsupported')),
  channel text default 'instagram',
  business_event_id text,
  content jsonb,
  preview_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_posts_brand on posts(brand_id);
create index idx_posts_scheduled on posts(scheduled_for);

-- =========================================================
-- 7. conversations
-- =========================================================
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  brand_id uuid references brands(id) on delete cascade,
  context_page text,
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_conversations_user on conversations(user_id);
create index idx_conversations_tenant on conversations(tenant_id);

-- =========================================================
-- 8. daily_coaching
-- =========================================================
create table daily_coaching (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  date date not null,
  content jsonb not null,
  business_context text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create unique index idx_coaching_brand_date
  on daily_coaching(brand_id, date);
create index idx_coaching_tenant on daily_coaching(tenant_id);

-- =========================================================
-- 9. analytics_events
-- =========================================================
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  event_name text not null,
  event_data jsonb,
  created_at timestamptz default now()
);

create index idx_events_tenant on analytics_events(tenant_id);

-- =========================================================
-- 10. credits_usage
-- =========================================================
create table credits_usage (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  feature text not null check (feature in ('coaching', 'generation', 'brief', 'brand_book', 'conseiller')),
  tokens_input integer,
  tokens_output integer,
  cost_eur numeric(10, 4),
  created_at timestamptz default now()
);

create index idx_credits_tenant on credits_usage(tenant_id);

-- =========================================================
-- updated_at trigger
-- =========================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_tenants_updated_at
  before update on tenants
  for each row execute function update_updated_at();

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger update_brands_updated_at
  before update on brands
  for each row execute function update_updated_at();

create trigger update_posts_updated_at
  before update on posts
  for each row execute function update_updated_at();

create trigger update_conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at();

