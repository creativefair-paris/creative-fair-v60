-- Sprint 37 (Lot 7) — Champ Retombées sur fiche post.
--
-- Doc 09 §8 (sous-section "Champ Retombées sur fiche post") + brief
-- Lot 7. Texte libre 500 chars max, optionnel, visible et éditable
-- uniquement quand le post est statut = 'publie' (les autres statuts
-- ne montrent pas le champ — pas de retombées avant publication).
--
-- Alimentation TF Analytics (Sébastien L.) pour les scénarios A2
-- (régénération) et A7 (bilan).
--
-- Format Sprint 37 : texte libre simple.
-- Format Sprint 38 (à venir) : catégorisation enrichie
-- (DM/visite/vente) + comptage automatique DM via API Meta.
--
-- Idempotente : ADD COLUMN IF NOT EXISTS + DO block pour CHECK.

alter table posts
  add column if not exists retombees text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'posts_retombees_length_check'
  ) then
    alter table posts
      add constraint posts_retombees_length_check
      check (retombees is null or char_length(retombees) <= 500);
  end if;
end$$;

comment on column posts.retombees is
  'Sprint 37 — texte libre optionnel sur les retombées du post (DM commerciaux, visites en galerie, ventes annoncées). Max 500 chars. Visible et éditable uniquement si statut = ''publie''. Alimente TF Analytics pour A2 et A7.';
