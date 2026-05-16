-- Sprint 37.K (F89) — Migration 026 : posts.pilier_id (FK vers pillars.id).
-- Migration progressive — l'ancienne colonne posts.pilier_nom (TEXT)
-- reste en place pour compatibilité V1. Sprint 38+ décidera du backfill
-- et retrait après que toute la création de posts soit refondue.
--
-- Idempotente.

alter table posts
  add column if not exists pilier_id uuid references pillars(id) on delete set null;

create index if not exists idx_posts_pilier_id
  on posts(pilier_id) where pilier_id is not null;

comment on column posts.pilier_id is
  'Sprint 37.K (F89) — FK vers pillars.id. Coexiste avec pilier_nom (TEXT legacy) en V1.';
