-- Sprint 37.B (F16) — Wizard immersif création de plan.
--
-- Persistance d'état du wizard A1. Sans elle, le wizard est cassé :
-- le pilote ne peut pas sortir/revenir, et la barre de progression
-- est inutile. Le brief Sprint 37.B F16 acte cette table comme
-- obligatoire (Q1 décision Lead).
--
-- État : IN_PROGRESS → COMPLETED → (TTL EXPIRED) | ABANDONED si le
-- pilote refuse explicitement. TTL 7 jours avant purge silencieuse.
-- Idempotente.

create table if not exists programme_creation_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Lien optionnel avec la conversation conseiller du wizard (le
  -- wizard utilise la même architecture sheet conseiller en mode
  -- fullscreen-immersive, donc une conversation row peut exister
  -- pour le streaming des suggestions step 2/3).
  conseiller_conversation_id uuid references conseiller_conversations(id) on delete cascade,
  current_step integer not null default 0,
  total_steps integer not null default 7,
  -- Réponses validées étape par étape. Schéma :
  -- {
  --   "1": { "period_start": "...", "period_end": "..." },
  --   "2": { "business_anchors": ["...", "..."] },
  --   "3": { "sensitive_topics": "..." },
  --   "4": { "pillars": { "pilier-1": 40, ... } },
  --   "5": { "risk_cursor": "moderate" },
  --   "6": { "format": "carousel" }
  -- }
  responses jsonb not null default '{}'::jsonb,
  state text not null default 'IN_PROGRESS'
    check (state in ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'EXPIRED')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_programme_sessions_tenant_state
  on programme_creation_sessions(tenant_id, state)
  where state = 'IN_PROGRESS';

create index if not exists idx_programme_sessions_user_recent
  on programme_creation_sessions(user_id, updated_at desc);

-- updated_at trigger
create or replace function public.touch_programme_sessions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_programme_sessions_touch
  on programme_creation_sessions;
create trigger trg_programme_sessions_touch
  before update on programme_creation_sessions
  for each row
  execute function public.touch_programme_sessions_updated_at();

-- RLS multi-tenant (cohérent migrations 002, 005, 012, 015, 017, 018).
alter table programme_creation_sessions enable row level security;

drop policy if exists "tenant isolation programme_sessions select"
  on programme_creation_sessions;
create policy "tenant isolation programme_sessions select"
  on programme_creation_sessions
  for select using (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation programme_sessions insert"
  on programme_creation_sessions;
create policy "tenant isolation programme_sessions insert"
  on programme_creation_sessions
  for insert with check (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation programme_sessions update"
  on programme_creation_sessions;
create policy "tenant isolation programme_sessions update"
  on programme_creation_sessions
  for update using (tenant_id = public.user_tenant_id())
  with check (tenant_id = public.user_tenant_id());

-- Fonction de purge TTL (à appeler par cron Supabase ou serveur).
-- Les rows IN_PROGRESS dépassant expires_at passent à EXPIRED
-- silencieusement.
create or replace function public.expire_old_programme_sessions()
returns void
language plpgsql
as $$
begin
  update programme_creation_sessions
    set state = 'EXPIRED'
    where state = 'IN_PROGRESS' and expires_at < now();
end;
$$;

comment on table programme_creation_sessions is
  'Sprint 37.B F16 — État persistant du wizard immersif de création de plan A1. TTL 7 jours.';
