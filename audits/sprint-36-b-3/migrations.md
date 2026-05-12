# Sprint 36.B.3 — Application des migrations Supabase

## Migration 009 — `brand_completeness`

**Fichier source** : `supabase/migrations/009_brand_completeness.sql`.

**Effet** :

- Ajoute 5 colonnes optionnelles sur `brands` (`cible` TEXT, `univers_refuse` TEXT,
  `benchmarks` JSONB, `canaux` JSONB, `brand_book` JSONB).
- Crée la table `brand_archives` (RLS via `public.user_tenant_id()`).
- Index sur `brand_id` et `tenant_id`.
- Toutes les colonnes ont un DEFAULT — la migration est compatible avec le code
  actuel sur `main` (8cba9ad). Pas de rollback nécessaire en cas d'abandon.

### Application — 30 s

1. Ouvrir le SQL Editor du projet Supabase
   (`https://supabase.com/dashboard/project/ugfnokdxdqaqapylafeq/sql/new`).
2. Coller le contenu de `supabase/migrations/009_brand_completeness.sql`.
3. Cliquer **Run**.
4. Vérifier :
   ```sql
   select column_name, data_type
     from information_schema.columns
    where table_name = 'brands'
      and column_name in ('cible','univers_refuse','benchmarks','canaux','brand_book');
   select tablename from pg_tables where tablename = 'brand_archives';
   select policyname from pg_policies where tablename = 'brand_archives';
   ```
   Attendu : 5 colonnes brands, 1 ligne brand_archives, 4 policies.

### Adaptation par rapport au spec

Le spec proposait des policies RLS sur une table `user_tenants` qui n'existe pas
dans le schéma. Le pattern réel est `public.user_tenant_id()` (helper qui lit
`profiles.tenant_id`). La migration a été adaptée.

## Storage — bucket `brand-archives`

**À créer manuellement** depuis le Dashboard Supabase
(`Storage → New bucket`).

- **Nom** : `brand-archives`
- **Public** : non (privé)
- **File size limit** : 50 MB
- **Allowed MIME types** : `image/png`, `image/jpeg`, `image/webp`,
  `image/svg+xml`, `application/pdf`, `text/plain`, `video/mp4`,
  `video/quicktime`.

Path pattern à respecter côté code : `{tenant_id}/{brand_id}/{filename}`
(brand-book/* ou uploads/*).

### Policies Storage

À coller dans le SQL Editor après création du bucket :

```sql
-- Storage policies sur bucket brand-archives.
-- Le tenant_id est le premier segment du chemin.

drop policy if exists "brand-archives select" on storage.objects;
create policy "brand-archives select" on storage.objects
  for select using (
    bucket_id = 'brand-archives'
    and (storage.foldername(name))[1] = public.user_tenant_id()::text
  );

drop policy if exists "brand-archives insert" on storage.objects;
create policy "brand-archives insert" on storage.objects
  for insert with check (
    bucket_id = 'brand-archives'
    and (storage.foldername(name))[1] = public.user_tenant_id()::text
  );

drop policy if exists "brand-archives update" on storage.objects;
create policy "brand-archives update" on storage.objects
  for update using (
    bucket_id = 'brand-archives'
    and (storage.foldername(name))[1] = public.user_tenant_id()::text
  );

drop policy if exists "brand-archives delete" on storage.objects;
create policy "brand-archives delete" on storage.objects
  for delete using (
    bucket_id = 'brand-archives'
    and (storage.foldername(name))[1] = public.user_tenant_id()::text
  );
```

## Doctrine swap silencieux côté code

Tant que la migration n'est pas appliquée :

- `brands.cible`, `brands.univers_refuse`, `brands.benchmarks`, `brands.canaux`,
  `brands.brand_book` renvoient `undefined` côté JS.
- La page `/ma-marque` lit ces champs avec un `??` neutre et affiche
  "Non renseigné" — pas de crash, pas d'affichage cassé.
- Les sheets correspondantes ouvrent sur un formulaire vide. Le PATCH
  retournera une erreur Postgres (colonne inconnue) que les endpoints
  attrapent et renvoient en JSON propre.

Après application : les colonnes deviennent disponibles, la persistance
fonctionne, la page se remplit progressivement.
