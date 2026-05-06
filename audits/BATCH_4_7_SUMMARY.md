# Batch autonome Sprints 9-21 — Synthèse

Branch : `main` (creative-fair-v60).
Modèles principaux : `claude-opus-4-7` (génération, coaching, conseiller),
`claude-sonnet-4-6` (chat de l'ancien Sprint 5, brief externe), avec
`cache_control: ephemeral` systématique sur la dernière partie système.

## Périmètre couvert

| Sprint | Sujet | Commit |
|---|---|---|
| 9 | Page Aujourd'hui (3 zones, header date, NextAction) | `c8454fb` |
| 10 | Coaching Opus 4.7 + génération lazy idempotente | `4922e61` |
| 11 | Visibilité brand book + indicateur crédits par feature | `a173973` |
| 12 | Calendrier semaine/mois + événements business | `50f1fa1` |
| 13 | Suggestions calendrier business-driven (Opus 4.7) | `5f44a19` |
| 14 | NewPostModal + page détail publication + delete | `84101f5` |
| 15 | Layout Post Creator double colonne + 3 onglets | `ef76640` |
| 16 | Route `/api/ai/post-generation` 6 étapes (web_search step 1) | `16454b6` |
| 17 | Anecdote custom 6 étapes (sans web search) | `d8267b2` |
| 18 | Brief externe markdown Sonnet 4.6 + copier presse-papier | `1071fd5` |
| 19 | Module Programmer (récap + datetime → scheduled) | `9c8eecd` |
| 20 | Conseiller deux colonnes Opus 4.7 + persistance conversations | `3516be3` |
| 21 | Suggestions contextuelles state-driven | `50470df` |

Chaque sprint a son audit détaillé : `audits/SPRINT_<n>_TEST.md`.

## Architecture IA

Helpers centralisés :
- `lib/ai/client.ts` — client Anthropic.
- `lib/ai/caching.ts` — `buildSystemPrompt` (ajoute `cache_control` ephemeral).
- `lib/ai/credits.ts` — pricing Opus 4.7 / Sonnet 4.6 / Haiku 4.5, USD→EUR 0.92,
  log via `createAdmin` dans `credits_usage`.
- `lib/ai/brand-context.ts` — `buildStructuredBrandContext` (brand book + business calendar)
  et `findNearestBusinessEvent` (fenêtre 14 jours).
- `lib/ai/prompts/` — un fichier par feature : `system.ts` (VOICE_SHEET sacré),
  `coaching.ts`, `business-suggest.ts`, `post-generation.ts`, `brief.ts`.

Routes ajoutées : `/api/ai/coaching`, `/api/ai/business-suggest`,
`/api/ai/post-generation`, `/api/ai/brief`. Route `/api/ai/chat` réécrite
(passage Sonnet 4.6 → Opus 4.7, fix bug colonnes brand).

## Server Actions

`lib/posts/actions.ts` : `createPost`, `deletePost`, `updatePostSchedule`,
`schedulePost` (passe à `status='scheduled'`), `updatePostStatus`. Toutes RLS-safe,
toutes `revalidatePath('/calendrier')`.

## Décisions remarquables

- **Multi-tenant** : chaque écriture passe par `createClient()` (RLS), seul le
  logging crédit utilise `createAdmin()` (table `credits_usage`).
- **Persistance progressive du draft** : `posts.content` jsonb mis à jour à chaque
  étape de génération, le statut suit (`in_progress` → `ready` → `scheduled`).
- **Empty states** : aucune feature factice. Onglets "Télécharger" et "Multi-canal"
  du module Programmer affichent honnêtement "Disponible bientôt".
- **VOICE_SHEET** : rappelée dans tous les system prompts ; vocabulaire interdit
  appliqué aux textes IA et UI utilisateur, pas aux identifiants de code ni aux
  noms de tables Supabase.

## Limites et points à vérifier hors sandbox

- **Build/lint non exécutés** : `npm` indisponible dans la sandbox.
  Action requise : `npm run lint && npm run build` avant déploiement.
- **Web search Anthropic** : route `/api/ai/post-generation` step 1 `anecdote_live`
  utilise l'outil `web_search_20250305`. Si l'outil n'est pas activé sur le compte,
  l'étape retourne 502 — fallback à prévoir (saisie manuelle d'actualité).
- **`stream.finalMessage()`** dans `/api/ai/chat` : peut nécessiter un cast selon
  la version SDK (0.94 cible).
- **Skills SACRED stubs** : `skills/01-ARCHITECTURE.md`, `02-VOICE_SHEET.md`,
  `04-DESIGN_SYSTEM.md`, `10-SACRED.md` contiennent encore "À enrichir". Les règles
  de voix appliquées proviennent de `lib/ai/prompts/system.ts` (source vivante).
- **`lib/ai/tenant-context.ts`** : ancien helper `buildBrandContext` n'est plus
  référencé. À supprimer dans un sprint d'hygiène (ne pas faire ici sans validation).
- **Realtime conseiller** : streaming SSE depuis route Next.js. En production
  Vercel, vérifier que le runtime Node tolère un long streaming ou passer en
  `runtime='edge'`.

## Plan de vérification recommandé

1. `npm install` puis `npm run lint && npm run build`.
2. Page Aujourd'hui : vérifier le coaching auto + suggestion contextuelle si brand book incomplet.
3. Calendrier : créer un post via NewPostModal, parcourir le flux Post Creator.
4. Anecdote live : valider que web_search répond (sinon basculer fallback).
5. Anecdote custom + Brief externe : vérifier persistance et bouton "Copier".
6. Programmer : programmer un post et confirmer le passage à `scheduled` dans la DB.
7. Conseiller : démarrer une conversation, vérifier qu'elle s'enregistre avec messages utilisateur + assistant.
