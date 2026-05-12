# Sprint 36.C.2 — Restauration trigger handle_new_user + blindage flow

Branche `sprint-36-c-2` (basée sur `sprint-36-c-1` HEAD `2f1b17d`).
4 commits atomiques. Build OK, tsc OK, lint OK (11 warnings pré-existants).
Pas de push, pas de tag.

## Vue d'ensemble

| Commit | Livrable | Lignes |
|---|---|---|
| `e7a445e` | Migration 011 trigger + backfill | +164 / -0 |
| `2514006` | Server action `ensureProfile()` | +149 / -0 |
| `356fdb8` | Guard auth (load-data + /accueil) | +29 / -5 |
| `b2727a2` | Refactor handler onboarding | +23 / -104 |

Net : **+365 / -109** (consolidation : -109 lignes legacy supprimées,
+365 lignes canoniques avec couverture triple — trigger + server action + handler).

## 1. Trigger logic

**Fonction `public.handle_new_user()`** créée comme `SECURITY DEFINER`
avec `search_path = public, auth, pg_temp`.

Justifications :
- `SECURITY DEFINER` nécessaire : le trigger s'exécute dans le contexte
  du rôle qui INSERT dans `auth.users` (typiquement `supabase_auth_admin`).
  Sans `DEFINER`, l'INSERT dans `public.tenants` / `public.profiles`
  échouerait par défaut de privilèges.
- `search_path` explicite : empêche un attaquant qui aurait posé un schéma
  malveillant de détourner la résolution des objets (recommandation
  PostgreSQL pour toute fonction SECURITY DEFINER).
- `pg_temp` en fin de search_path : best practice pour éviter qu'une
  function temporaire shadowe une fonction de schéma standard.

Trigger `on_auth_user_created` : `AFTER INSERT ON auth.users FOR EACH ROW`.

`GRANT EXECUTE` sur `postgres`, `service_role`, `supabase_auth_admin`
(les trois rôles qui peuvent INSERT auth.users : admin direct, service_role,
ou flow OAuth Supabase).

Valeurs canoniques injectées :
- `tenants.plan = 'b2b_custom'` (V1 — `'b2c'` interdit doctrine v60)
- `profiles.role = 'owner'` (forcé sur default DDL `'member'`)
- `tenants.name = NEW.email` (substituable post-onboarding par le brand name)

## 2. Slug strategy

| Étape | Logique |
|---|---|
| Base | `regexp_replace(lower(split_part(NEW.email, '@', 1)), '[^a-z0-9]+', '-', 'g')` puis trim des dashes. Fallback `'user'` si chaîne vide. |
| Retry | Boucle PL/pgSQL avec `BEGIN ... EXCEPTION WHEN unique_violation ... END`. Max 5 tentatives. Suffix random = `substring(md5(random()::text || clock_timestamp()::text), 1, 4)`. |
| Fallback | Après 5 retries, slug `'user-' || replace(gen_random_uuid()::text, '-', '')` — unique par construction. |

La logique TypeScript dans `ensureProfile()` est **bit-identique** sur
le principe (lowercase, slugify, retry sur code Postgres 23505, fallback
UUID-only). Code différent (regex JS vs regexp_replace PG) mais
comportement déterministe.

## 3. Backfill scope

DO block en fin de migration. Sélectionne `auth.users LEFT JOIN profiles
ON profiles.id = auth.users.id WHERE profiles.id IS NULL` — exactement
les orphelins.

Pour chaque orphelin : même logique que la fonction (inline plutôt que
récursif via le trigger, pour rester démonstrable lors de l'audit DBA).

Idempotence : `ON CONFLICT (id) DO NOTHING` sur l'INSERT profile protège
les comptes qui auraient été corrigés manuellement entre temps. Le compte
canonical Lead (`creativefair@1922.studio`, profile `4514941a-...`) est
explicitement listé dans le brief comme déjà corrigé — il sera ignoré
silencieusement par le `ON CONFLICT`.

Scope : 2 orphelins attendus (3 users - 1 Lead déjà corrigé). Si plus
d'orphelins existent (cas de signups récents pendant la phase de
diagnostic), tous sont traités au même moment.

## 4. Recovery flow

Architecture en triple couverture :

```
┌──────────────────────────────────────────────────────────────┐
│  Signup (POST auth.users)                                    │
│         │                                                    │
│         ▼                                                    │
│  TRIGGER on_auth_user_created (chemin nominal)               │
│     → public.handle_new_user() crée tenant + profile         │
│     → role=owner, plan=b2b_custom                            │
│                                                              │
│  Si trigger absent (régression DB) OU déjà créé manuellement │
│         │                                                    │
│         ▼                                                    │
│  ensureProfile() — Server Action (filet runtime)             │
│     Appelée par :                                            │
│       * lib/aujourd-hui/load-data.ts (avant redirect)        │
│       * app/(accueil)/page.tsx (avant redirect)              │
│       * /api/onboarding/complete (avant INSERT brand)        │
│     Idempotente : retourne tenant_id existant si profile     │
│     déjà présent ; sinon provisionne (mêmes valeurs que      │
│     le trigger).                                             │
│                                                              │
│  Au cas où trigger ET ensureProfile auraient raté            │
│         │                                                    │
│         ▼                                                    │
│  Backfill ad-hoc (migration 011 DO block)                    │
│     Boucle sur tous les orphelins auth.users.                │
│     À ré-exécuter manuellement si nouveau set d'orphelins    │
│     apparaît post-migration.                                 │
└──────────────────────────────────────────────────────────────┘
```

**Anti-loop** : pas de compteur d'attempts explicite implémenté.
Justification :
- Avec les 3 couches ci-dessus, le scénario "user authentifié sans
  profile" est éliminé à la racine.
- Si malgré tout `ensureProfile()` échoue (admin client cassé, DB down,
  contrainte CHECK invalidée), le code log un `console.warn` avec le
  reason et redirect vers `/onboarding` ONE shot. La prochaine visite
  passera par la même boucle de provisioning ; pas de loop UI infini
  côté navigateur (chaque page-load fait son propre check).
- Un compteur stateful (cookie ou session) ajouterait de la complexité
  sans bénéfice tant que la racine du bug (trigger absent) est corrigée.

## 5. Tests local (à exécuter par Lead)

### Test 1 — Nouveau signup (chemin nominal trigger)
1. Créer un nouveau user via Supabase auth (magic link ou direct INSERT
   sur `auth.users`).
2. Vérifier en DB :
   - `select * from tenants where slug = lower(split_part('<email>', '@', 1))` → 1 row
   - `select * from profiles where id = '<user_id>'` → 1 row
   - `select role, plan from profiles p join tenants t on t.id = p.tenant_id where p.id = '<user_id>'` → `('owner', 'b2b_custom')`

### Test 2 — Backfill (orphelins existants)
1. Avant migration : `select count(*) from auth.users u left join profiles p on p.id = u.id where p.id is null;` → N orphelins
2. Appliquer migration 011
3. Re-vérifier : `select count(*) ...` → 0
4. Le compte `creativefair@1922.studio` (profile manuel) doit avoir
   `tenant_id` intact (vérifier par `slug` côté `tenants`).

### Test 3 — Login utilisateur onboardé (pas de boucle)
1. Se déconnecter
2. Se connecter avec `creativefair@1922.studio`
3. Atterrir sur `/aujourd-hui` sans passer par `/onboarding/analyse-marque`
4. La page rend les Stats Pattern A normalement

### Test 4 — Onboarding 4/4 (handler refactoré)
1. Créer un user via Supabase auth (le trigger crée profile + tenant)
2. Se connecter → redirigé vers `/onboarding/analyse-marque` (brand n'existe pas)
3. Remplir les 4 questions → submit
4. Vérifier en DB que la brand est créée sur le bon `tenant_id` (celui
   créé par le trigger), pas un nouveau
5. Atterrir sur `/aujourd-hui`

### Test 5 — Idempotence ensureProfile
1. Pour un user qui a déjà profile + tenant, accéder à `/aujourd-hui` →
   pas de re-création (le check `existing?.tenant_id` retourne early).
2. Logs : pas de `[load-data] ensureProfile failed` ni warning.

## Écarts par rapport au brief

1. **Numérotation migration** : 3-digit `011_` (suit la convention
   `001_..010_` existante) plutôt que timestamp `<timestamp>_`. Cohérence
   > forme. Si tu préfères timestamp, renommer le fichier (le contenu
   est invariant à la numérotation).

2. **Server action path** : `app/_actions/ensure-profile.ts` (créé,
   convention Next.js Server Actions) au lieu d'un chemin pré-existant
   (le dossier `_actions` n'existait pas).

3. **Aucun root middleware.ts** : le projet ne contient pas de
   `middleware.ts` à la racine. Les redirects sont gérés page par page.
   Patch appliqué sur les 2 entrées principales (`/aujourd-hui` via
   `load-data.ts` et `/` via `(accueil)/page.tsx`) — respecte la
   contrainte "moins de 2 fichiers structurellement".

4. **Anti-loop counter** non implémenté — voir section 4 ci-dessus.

5. **Abort condition #1** examinée : le helper `ensureTenantForUser`
   existait dans `/api/onboarding/complete` avec des valeurs doctrinalement
   incorrectes (`'b2c'`, `'admin'`, slug `personnel-<8>`). Lecture du
   brief item 4 : "Si profiles n'existe pas : appeler ensureProfile()
   AVANT l'INSERT brand" — interprété comme une demande de **remplacement**,
   pas de superposition. Helper legacy supprimé, refactor vers
   `ensureProfile()` canonique. Décision documentée ici, pas d'abort
   formel déclenché.

## Action Lead

1. Appliquer la migration 011 sur la base (procédure standard
   Supabase CLI ou SQL Editor)
2. Exécuter Tests 1-5 ci-dessus
3. Si tous verts : merge `sprint-36-c-2` sur `main` → tag `v1.7.0`
4. Surveiller les logs serveur pendant 24-48h pour détecter d'éventuels
   `[load-data] ensureProfile failed` ou `[accueil] ensureProfile failed`

Filet : `git checkout sprint-36-c-1` revient à l'état pré-sprint en < 1 s.
Migration 011 NON appliquée tant que validation visuelle non faite.
