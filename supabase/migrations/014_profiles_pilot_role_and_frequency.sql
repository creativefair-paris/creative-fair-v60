-- Sprint 37 (Lot 1) — Onboarding amendé : persona + curseur fréquence.
--
-- Ajoute 2 colonnes sur profiles pour stocker les réponses aux 2 nouvelles
-- questions d'onboarding (cf. doc 09 sections 2 et 3) :
--
--   * pilot_role           : 'pilots' (Floriane, responsable comm)
--                            ou 'owns' (Maxime, fondateur·rice)
--                            → guide la directivité du prompt système conseiller.
--
--   * publication_frequency : 'discreet'  (1-2 posts/sem, marques ultra premium)
--                             'balanced'  (2-4 posts/sem, marques établies premium)
--                             'dense'     (5-7 posts/sem, food/retail saisonnier)
--                             → guide le scope du plan (3-4 semaines × N posts).
--
-- Les 2 champs sont nullable. Les profils existants gardent NULL et les
-- consommateurs (prompt système, génération de plan) traitent NULL comme
-- "non répondu" sans crasher.
--
-- Idempotente : ADD COLUMN IF NOT EXISTS + DO blocks pour les CHECK
-- (évite les erreurs si la migration est rejouée).

alter table profiles
  add column if not exists pilot_role text,
  add column if not exists publication_frequency text;

-- CHECK constraints en DO blocks idempotents.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_pilot_role_check'
  ) then
    alter table profiles
      add constraint profiles_pilot_role_check
      check (pilot_role is null or pilot_role in ('pilots', 'owns'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_publication_frequency_check'
  ) then
    alter table profiles
      add constraint profiles_publication_frequency_check
      check (
        publication_frequency is null
        or publication_frequency in ('discreet', 'balanced', 'dense')
      );
  end if;
end$$;

comment on column profiles.pilot_role is
  'Sprint 37 — persona pilote : "pilots" (Floriane) ou "owns" (Maxime). NULL = non répondu.';
comment on column profiles.publication_frequency is
  'Sprint 37 — curseur fréquence onboarding : "discreet" (1-2/sem), "balanced" (2-4/sem), "dense" (5-7/sem). NULL = non répondu.';
