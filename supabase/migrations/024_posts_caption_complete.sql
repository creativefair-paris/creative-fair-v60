-- Sprint 37.E (F58) — Migration 024 : posts.caption_complete + visuel_url.
-- Champs nécessaires pour la fiche post éditable (workflow B).
-- Idempotente.

alter table posts
  add column if not exists caption_complete text,
  add column if not exists visuel_url text;

comment on column posts.caption_complete is
  'Caption finale du post (généré ou édité manuellement par le pilote).';
comment on column posts.visuel_url is
  'URL du visuel uploadé pour ce post (V1 = pas d''upload, juste un champ).';
