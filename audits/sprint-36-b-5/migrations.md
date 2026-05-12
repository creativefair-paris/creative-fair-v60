# Sprint 36.B.5 — Application des migrations Supabase

## Migration 010 — `channel_waitlist`

**Fichier source** : `supabase/migrations/010_channel_waitlist.sql`.

**Effet** :

- Crée la table `channel_waitlist` (id, tenant_id, brand_id, channel,
  email, created_at) avec contrainte `unique(brand_id, channel, email)`.
- Channel : enum `('tiktok', 'x', 'youtube', 'facebook')`.
- Indexes sur brand_id et channel.
- RLS via `public.user_tenant_id()` (pattern existant). 3 policies :
  select / insert / delete.

### Application — 30 s

1. Ouvrir le SQL Editor du projet Supabase
   (`https://supabase.com/dashboard/project/ugfnokdxdqaqapylafeq/sql/new`).
2. Coller le contenu de `supabase/migrations/010_channel_waitlist.sql`.
3. Cliquer **Run**.
4. Vérifier :
   ```sql
   select tablename from pg_tables where tablename = 'channel_waitlist';
   select policyname from pg_policies where tablename = 'channel_waitlist';
   ```
   Attendu : 1 ligne `channel_waitlist`, 3 policies (select / insert / delete).

### Comportement sans migration

Tant que la migration n'est pas appliquée, les clics « Notifier moi »
sur les plateformes Bientôt :

- L'endpoint `/api/brand/waitlist` renvoie 500 propre avec un détail
  Postgres (relation `channel_waitlist` does not exist).
- Le bouton affiche un message d'erreur sobre côté UI sans crash de
  la sheet.
- Aucune données silencieusement perdue.
