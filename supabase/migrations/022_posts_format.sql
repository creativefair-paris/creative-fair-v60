-- Sprint 37.D (F34) — Migration 022 : posts.format + structure_type + objectif_editorial.
-- Les 6 formats canoniques (TF Communication, Hélène M.) deviennent
-- explicites sur la table posts. Ils alimentent le plan généré et
-- seront utilisés par Post Creator (Sprint 38+).
-- Idempotente.

alter table posts
  add column if not exists format text check (format in (
    'anecdote',
    'produit',
    'evenement',
    'coulisses',
    'manifeste',
    'question'
  ));

alter table posts
  add column if not exists structure_type text check (structure_type in (
    'carrousel',
    'photo',
    'reel'
  ));

alter table posts
  add column if not exists objectif_editorial text;

create index if not exists idx_posts_format on posts(format);

comment on column posts.format is
  '6 formats canoniques V1 (Sprint 37.D) : anecdote, produit, evenement, coulisses, manifeste, question.';
comment on column posts.structure_type is
  'Type structurel du post : carrousel (multi-slide), photo (single), reel (vidéo verticale).';
comment on column posts.objectif_editorial is
  'Objectif éditorial court (1 phrase ≤ 80 caractères) — intention du post.';
