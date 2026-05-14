-- Sprint 37.D (F34) — Migration 023 : programmes.date_debut / date_fin.
-- Colonnes référencées dans /aujourd-hui, /programme, /programme/retombees,
-- lib/jalons/check-jalons.ts mais absentes de la table jusqu'ici. Pas de
-- back-fill : les programmes existants restent à NULL et seront
-- considérés sans date (le check jalon "programme" les ignore).
-- Idempotente.

alter table programmes
  add column if not exists date_debut date,
  add column if not exists date_fin date;

create index if not exists idx_programmes_status_date_fin
  on programmes(status, date_fin)
  where status = 'active';

comment on column programmes.date_debut is
  'Date de début de la période couverte par le programme (Sprint 37.D).';
comment on column programmes.date_fin is
  'Date de fin de la période couverte par le programme (Sprint 37.D).';
