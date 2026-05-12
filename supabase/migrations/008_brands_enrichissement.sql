-- Sprint 36.B.2 — Enrichissement Ma Marque : calendrier business, objectifs, ressources.
-- Trois nouvelles colonnes JSONB sur la table brands.
-- Les piliers narratifs existent déjà (Sprint 36.A migration 007).

alter table brands
  add column if not exists calendrier_business jsonb default '[]'::jsonb,
  add column if not exists objectifs jsonb default '[]'::jsonb,
  add column if not exists ressources jsonb default '{}'::jsonb;

comment on column brands.calendrier_business is
  'Array de moments business : [{id, titre, date_debut, date_fin?, type}]';
comment on column brands.objectifs is
  'Array d''objectifs de saison ordonnés par priorité : [{id, label, priorite}]';
comment on column brands.ressources is
  'Capacités de production hebdomadaires : {photo, video, terrain, studio}';

-- Vérifications post-migration (à exécuter manuellement) :
--   select column_name, data_type, column_default
--     from information_schema.columns
--     where table_name = 'brands'
--     and column_name in ('calendrier_business','objectifs','ressources');
