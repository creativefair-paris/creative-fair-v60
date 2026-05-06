# Creative Fair V1 — Livraison

Tag : `v1.0.0`. Date : 2026-05-06.

## Périmètre livré

- **4 destinations utilisateur** : Aujourd'hui, Calendrier, Ma marque,
  Conseiller.
- **3 formats Post Creator** : Anecdote live (web_search), Anecdote
  custom, Brief externe.
- **Multi-tenant** avec 3 clients pré-configurés : Angelina, Tous en
  Tête, Le Comptoir Général.
- **Interface admin** réservée à `creativefair@1922.studio` :
  provisioning, configuration thème, brand book, calendrier business,
  invitation utilisateurs.
- **Design Liquid Glass** : tokens CSS, 3 niveaux de profondeur,
  animations souples, fallback @supports + accessibilité (reduced
  motion / transparency).

## Sprints couverts (22 à 29)

| Sprint | Sujet | Commit |
|---|---|---|
| 22 | Interface admin (layout + tenants CRUD + 4 onglets) | `566901e`, `1eda40f` |
| 23 | Seeds Angelina + script configure-tenant | `f825190` |
| 24 | Seeds Tous en Tête + recherche déontologique | `1e5464a` |
| 25 | Seeds Le Comptoir Général | `e5b3326` |
| 26 | Design Liquid Glass | `69f25e0` |
| 27 | QA + bug fix P0 + backlog V2 | `e0c0057` |
| 28 | Lancement manuel — sans commit (action Ulysse) | — |
| 29 | Documentation utilisateur + admin + roadmap V2 | `f78be42` |

Sprints 9-21 livrés dans le batch précédent
(`audits/BATCH_4_7_SUMMARY.md`).

## Fichiers livrés notables

### Code application
- `app/(admin)/` — interface admin complète.
- `app/(admin)/tenants/actions.ts` — server actions gated par
  `requireAdmin`.
- `lib/auth/admin.ts` — allowlist email centralisée.
- `proxy.ts` — protection routes admin.
- `styles/liquid-glass.css` — système de surfaces translucides.
- `app/page.tsx` + `app/layout.tsx` — bugs P0 corrigés.
- Suppression `lib/ai/tenant-context.ts` (code mort).

### Données et scripts
- `seeds/{angelina,tous-en-tete,comptoir-general}-{tenant,theme,brand-book,business-calendar}.json`
- `scripts/configure-tenant.ts` — provisioning ou mise à jour tenant.

### Documentation
- `docs/user/` (6 guides utilisateurs).
- `docs/admin/` (3 guides admin).
- `docs/roadmap-v2.md`.
- `skills/V1_RECAP.md` — vue d'ensemble V1.
- `skills/04-DESIGN_SYSTEM.md` enrichi.
- `audits/SPRINT_22_TEST.md` à `audits/SPRINT_27_BUGS.md`.
- `audits/V2_BACKLOG.md`.

## Bugs P0 corrigés

- #001 page racine remplacée par redirect (auth-aware).
- #002 metadata `<html>` corrigés (lang fr, title Creative Fair).
- #003 `lib/ai/tenant-context.ts` supprimé (code mort).

## Bugs P1 ouverts (à traiter en priorité V2)

- #101 Anecdote live retourne 502 si web_search désactivé sur le
  compte Anthropic. Fallback Anecdote custom à mettre en place.
- #102 Erreurs Supabase brutes remontées à l'admin (« User already
  registered » par exemple). Mapping humain à ajouter.
- #103 Streaming SSE Conseiller — risque de timeout sur Vercel
  serverless. Configurer `runtime='edge'` ou `maxDuration`.

## Bugs P2 (V2 backlog)

5 chantiers identifiés (skills SACRED stubs, migration Liquid Glass
14 composants restants, pages 404/500, suppression tenant, contraste
Comptoir, alertes crédits).

## Limites V1 connues

- **Pas de publication automatique Instagram** — copy-paste manuel par
  le client (V2 connecte Meta Graph API).
- **Pas de support multi-canal** — Instagram uniquement (V2 ajoute
  LinkedIn, TikTok, Facebook).
- **Pas de self-serve** — chaque client est provisionné par admin
  (V2 introduit l'onboarding self-serve B2C).
- **Pas de Stripe / billing** — V1 fonctionne en facturation manuelle.
- **Pas de tests automatisés** — couverture V2 prévue.
- **Build/lint non exécutés** dans la sandbox (npm indisponible) — à
  vérifier avant déploiement production.

## Plan post-livraison

1. **Build local** : `npm install && npm run lint && npm run build`
   pour valider qu'aucune régression de compilation.
2. **Déploiement Vercel** : push automatique sur `main`. Vérifier les
   variables d'environnement (NEXT_PUBLIC_SUPABASE_URL,
   SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY).
3. **Provisioning des 3 tenants pilotes** :
   ```bash
   npx tsx scripts/configure-tenant.ts angelina
   npx tsx scripts/configure-tenant.ts tous-en-tete
   npx tsx scripts/configure-tenant.ts comptoir-general
   ```
4. **Visios de cadrage** avec chaque client (agendas dans
   `audits/SPRINT_2{3,4,5}_VISIO_AGENDA.md`).
5. **Audit visuel manuel** sur les 8 flux utilisateur (liste
   `audits/SPRINT_27_QA_REPORT.md`).
6. **Monitoring premier jour** : suivi crédits Anthropic, logs Supabase,
   logs Vercel.

## Personnes mobilisées

- Conception et exécution batch 9-29 : Ulysse Lemoine + Claude
  Code (claude-opus-4-7 et claude-sonnet-4-6).
- Validation client : Angelina, Tous en Tête, Le Comptoir Général
  (visios à venir).

## Stats du dépôt

- Commits batch 9-29 : ~30 commits sur `main`.
- Fichiers ajoutés : ~80 fichiers.
- Lignes ajoutées : ~6500 lignes (code + docs + seeds).

V1 livrée. Bonne route.
