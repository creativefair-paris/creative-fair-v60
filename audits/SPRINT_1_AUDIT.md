# Sprint 1 — Audit lecture-seule

Date : 2026-05-06

## 1. Accès Supabase

| Variable | Statut |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | ✓ `https://ugfnokdxdqaqapylafeq.supabase.co` |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✓ JWT legacy format, valide |
| SUPABASE_SERVICE_ROLE_KEY | ✓ Nouveau format `sb_secret_*` |

**Probe REST API** :
- `GET /rest/v1/` avec service_role → `200`, schema PostgREST 14.5 retourné
- `GET /rest/v1/tenants` → `PGRST205 — table not found` ✓ (état initial attendu)

## 2. État des tables

Aucune table custom dans le schema `public`. Seules les tables système Supabase (`auth.*`, `storage.*`) existent.

État de départ propre — pas de migration legacy à gérer.

## 3. Helpers Supabase

| Fichier | État |
|---|---|
| `lib/supabase/client.ts` | Placeholder vide |
| `lib/supabase/server.ts` | Placeholder vide |
| `lib/supabase/middleware.ts` | Placeholder vide |
| `lib/supabase/admin.ts` | Manquant — à créer |

## 4. Skills

| Fichier | État |
|---|---|
| `skills/00-MASTER.md` | Complet (Sprint 0) |
| `skills/03-MULTI_TENANT.md` | Placeholder — à enrichir |
| `skills/10-SACRED.md` | Placeholder — à enrichir |

## 5. Note sur les clés API Supabase

Le projet utilise le **nouveau format** de clés API Supabase :
- `service_role` au format `sb_secret_*` (plus court, opaque, non-JWT)
- `anon` au format JWT legacy (compatible avec les deux formats)

Les clients JS Supabase (`@supabase/ssr`, `@supabase/supabase-js`) gèrent les deux formats de manière transparente — aucune adaptation côté code.

## Verdict

✓ Environnement prêt pour Sprint 1. Pas de blocage. On peut procéder.
