-- Sprint 30 (7 mai 2026) : décision produit V1 = signature
-- Creative Fair unifiée. La personnalisation par tenant
-- est suspendue jusqu'à V2. L'architecture de theming
-- (lib/theme/apply-theme.ts + default-theme.ts) reste
-- en place. Pour réactiver un theme custom : update
-- tenants set theme = '<json>'::jsonb where slug = '<x>'.
--
-- Colonne theme : NOT NULL DEFAULT '{}'::jsonb (001_initial_schema.sql:14)
-- '{}' est neutre pour mergeTheme() → fallback sur defaultTheme
-- (spread no-op sur undefined). Aucun changement de schema.

update tenants
set theme = '{}'::jsonb
where slug in ('angelina', 'tousentete', 'comptoir');
