-- Sprint 37 (Lot 2) — Table conseiller_conversations.
--
-- Stocke chaque session de conversation entre un pilote et le conseiller.
-- Une conversation correspond à UNE entrée dans /outils/conseiller (la page
-- historique en lecture seule) et à UNE ouverture de sheet contextuelle
-- depuis l'une des 8 voies d'accès (cf. doc 09 §5).
--
-- Décisions techniques tranchées par le Lead (cf. brief Sprint 37) :
--   * Décision #3 : nom de table `conseiller_conversations` (FR pour le
--                   préfixe métier, EN pour la convention pluriel/snake_case).
--   * Décision #4 : drafts (futurs) liés à `programme_id` direct,
--                   pas via session_id (donc pas de colonne ici).
--   * Décision #6 : backend = server actions (pas d'API routes).
--   * Décision #12 : détection vouvoiement V1 = heuristique regex côté
--                    client + stocké en `user_addresses_formally` boolean.
--
-- Doctrine machine à états (doc 09 §9) :
--   IDLE → CONTEXT_LOAD → THINKING_1 → TURN_1 → THINKING_2 → TURN_2 →
--   THINKING_3 → DELIVERED → CONSUMED
--   États dégradés : PAUSED, ABANDONED, FORCED_DELIVERY, ERROR_FALLBACK,
--                    CRISIS_DEGRADED, ERROR_TIMEOUT, REOPENED.
--
-- Idempotente : CREATE TABLE IF NOT EXISTS + DROP POLICY IF EXISTS.

create table if not exists conseiller_conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Type de scénario doctrinal (A1, A2, A7, B2, B4, B5, C3a, C3b, D6, D8,
  -- D9, E1, E-divers). Texte libre côté DB pour permettre l'ajout futur
  -- de scénarios sans migration.
  scenario_type text not null,
  -- Contexte préchargé au moment de l'ouverture : { post_id, period_start,
  -- period_end, bad_buzz_text, ... } selon scenario_type. Schéma libre V1.
  context jsonb,
  -- Machine à états cf. doc 09 §9.
  state text not null default 'IDLE',
  turn_count integer not null default 0,
  -- Vouvoiement détecté en 1er message pilote (heuristique regex,
  -- décision technique #12). FALSE par défaut (tutoiement = doctrine).
  user_addresses_formally boolean not null default false,
  -- Historique des messages : [{role: 'user'|'conseiller', content: string,
  -- created_at: iso}, ...]. JSONB pour rester souple V1.
  messages jsonb not null default '[]'::jsonb,
  -- Livrable final (plan, draft, brief, audit, etc.) une fois DELIVERED.
  -- Schéma dépend du scenario_type, validé côté server action Lot 6.
  delivered_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  consumed_at timestamptz
);

-- ── Index ───────────────────────────────────────────────────────────────
-- Liste historique /outils/conseiller (Lot 3) : on filtre par tenant et
-- on ordonne par created_at DESC.
create index if not exists idx_conseiller_conv_tenant_created
  on conseiller_conversations(tenant_id, created_at desc);

-- Recherche par user (multi-utilisateur V2 — un seul pilote V1 mais on
-- garde l'index pour les rapports/analytics).
create index if not exists idx_conseiller_conv_user
  on conseiller_conversations(user_id);

-- Sessions actives (filtre des CONSUMED pour les rapports temps réel) :
-- partial index pour rester compact.
create index if not exists idx_conseiller_conv_state_active
  on conseiller_conversations(tenant_id, state)
  where state != 'CONSUMED';

-- ── RLS multi-tenant ─────────────────────────────────────────────────────
-- Pattern cohérent avec migrations 002, 005, 012 — isolation par
-- public.user_tenant_id() (helper déjà défini).
alter table conseiller_conversations enable row level security;

drop policy if exists "tenant isolation conseiller_conversations select"
  on conseiller_conversations;
create policy "tenant isolation conseiller_conversations select"
  on conseiller_conversations
  for select
  using (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation conseiller_conversations insert"
  on conseiller_conversations;
create policy "tenant isolation conseiller_conversations insert"
  on conseiller_conversations
  for insert
  with check (tenant_id = public.user_tenant_id());

drop policy if exists "tenant isolation conseiller_conversations update"
  on conseiller_conversations;
create policy "tenant isolation conseiller_conversations update"
  on conseiller_conversations
  for update
  using (tenant_id = public.user_tenant_id())
  with check (tenant_id = public.user_tenant_id());

-- Delete via service_role uniquement (purge ABANDONED) — pas de policy
-- user delete.

-- ── updated_at trigger ───────────────────────────────────────────────────
create or replace function public.touch_conseiller_conv_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_conseiller_conv_touch on conseiller_conversations;
create trigger trg_conseiller_conv_touch
  before update on conseiller_conversations
  for each row
  execute function public.touch_conseiller_conv_updated_at();

comment on table conseiller_conversations is
  'Sprint 37 — sessions de conversation conseiller (1 par ouverture de sheet contextuelle).';
comment on column conseiller_conversations.scenario_type is
  'A1, A2, A7, B2, B4, B5, C3a, C3b, D6, D8, D9, E1, E-divers (doc 09 §5).';
comment on column conseiller_conversations.state is
  'Machine à états doc 09 §9 : IDLE → CONTEXT_LOAD → THINKING_n → TURN_n → DELIVERED → CONSUMED + états dégradés.';
comment on column conseiller_conversations.user_addresses_formally is
  'Détection vouvoiement V1 : heuristique regex sur 1er message pilote (décision technique #12).';
