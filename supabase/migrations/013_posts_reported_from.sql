-- Sprint 36.H — Ajout colonne reported_from sur posts pour le report
-- automatique des retards via catchUpOverduePosts.
--
-- reported_from : timestamp du moment où l'algorithme catch-up a déplacé
-- ce post dans le futur. NULL = jamais reporté (peut encore être catch-up).
-- NOT NULL = déjà reporté une fois, exclu des prochains passages catch-up
-- (anti-boucle).
--
-- Idempotente : ADD COLUMN IF NOT EXISTS + CREATE INDEX IF NOT EXISTS.

alter table posts
  add column if not exists reported_from timestamptz;

-- Index pour le SELECT principal du catch-up :
-- WHERE tenant_id = $1 AND statut = '...' AND reported_from IS NULL
-- + comparaison (date_prevue + heure_prevue) < now()
-- Le partial index ne retient que les rows reported_from IS NULL —
-- les posts déjà reportés sortent du scan.
create index if not exists idx_posts_catchup
  on posts(tenant_id, date_prevue, heure_prevue)
  where reported_from is null;
