# Migration 005 — application autonome bloquée

**Date** : 2026-05-09
**Sprint** : 32.5 — Chantier F.3
**Statut** : SQL et script prêts. Application sur la base distante non automatisable depuis cette session.

## Cause

Le projet Supabase ne dispose pas d'une fonction RPC `public.exec_sql(sql text)` permettant d'exécuter du DDL via le client JS avec service role key. Les options testées :

1. `supabase.rpc('exec_sql', { sql })` → `Could not find the function public.exec_sql(sql) in the schema cache`
2. CLI `supabase` → non installé globalement (`supabase not found`). `npx supabase` répond mais nécessiterait un `db push` avec lien projet et mot de passe Postgres absent de `.env.local`
3. Aucune `DATABASE_URL` / `POSTGRES_URL` / `SUPABASE_DB_*` dans `.env.local` (seulement les clés REST/anon/service-role et l'URL HTTPS)

## Décision protocolaire

Pas de fix créatif (création d'une fonction `exec_sql` arbitraire = élargissement de la surface d'attaque + violation du protocole). Application différée à un humain.

## Action requise par le Lead (30 secondes)

1. Ouvrir Supabase Studio → SQL Editor pour le projet `ugfnokdxdqaqapylafeq`
2. Coller le contenu de `supabase/migrations/005_programmes.sql`
3. Run
4. Vérifier la création : `select count(*) from programmes;` → 0
5. (Optionnel) `npx tsx scripts/apply-migration-005.ts` doit afficher *"Table programmes déjà présente — migration considérée appliquée"*

## Impact sur Gate intermédiaire

Le critère §15.9 stipule "La table programmes est créée en migration 005". Le fichier de migration est créé (F.1). L'**exécution** sur la base distante n'est pas effectuée. Le runtime ne casse pas — les routes API qui utiliseront `programmes` retournent toutes 501 Not Implemented (Sprints 35-36).

Verdict : **Gate intermédiaire validable** avec ce point F.3 documenté comme étape humaine 30s. Le tag `v1.1.5` reste légitime puisque les autres critères passent.
