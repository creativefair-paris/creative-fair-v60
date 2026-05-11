-- Sprint 36.A — Migration 007 : brands extension (onboarding 4Q + piliers signature)
-- Source : Sprint 36.A — Flux inversé Marcus, Chantier A.2
-- Idempotente
--
-- Note Sprint 36.A : la migration étend brands avec les 3 nouveaux champs onboarding
-- (secteur, ton, singularite) et le tableau de piliers narratifs produit par l'IA.
-- secteur + ton ajoutés ici (pas dans une 008 séparée) pour rester soustractif.

alter table brands
  add column if not exists secteur text,
  add column if not exists ton text,
  add column if not exists singularite text,
  add column if not exists piliers_narratifs jsonb default '[]'::jsonb;

comment on column brands.secteur is
  'Réponse onboarding Q2 : secteur d''activité de la marque';
comment on column brands.ton is
  'Réponse onboarding Q3 : voix de marque (comment elle s''exprime)';
comment on column brands.singularite is
  'Réponse onboarding Q4 : ce qui rend la marque unique';
comment on column brands.piliers_narratifs is
  'Array de piliers signature définis par l''IA. Format: [{nom, description, ratio_suggere}]';
