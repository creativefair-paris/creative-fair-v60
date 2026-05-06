# Sprint 16 — Anecdote live (route + intégration)

## Objectif
Brancher le module Anecdote live sur Opus 4.7. Six étapes : actualité (avec recherche web), angle, hook, slides, légende, finalisation. Chaque étape persiste le draft sur la publication.

## Fichiers créés
- `lib/ai/prompts/post-generation.ts` — base + 6 jeux de règles d'étape (actualité, angle, hook, slides, légende, finalisation).
- `app/api/ai/post-generation/route.ts` — Opus 4.7, JSON strict par étape, web_search outil natif Anthropic activé pour `step=1` en mode `anecdote_live`. Vérifie l'appartenance du post au tenant courant. Met à jour `posts.content` et passe `posts.status` à `in_progress` (étapes 1-5) puis `ready` (étape 6).

## Fichier mis à jour
- `components/post-creator/AnecdoteLive.tsx` — corrige l'enchaînement : pour les étapes texte/list (3, 4, 5) le composant repasse en `status='pending'` pour afficher "Continuer". Pour les étapes choix et la finalisation, statut `done`.

## Comportement attendu
1. Étape 1 (Lancer) : Claude utilise `web_search` (`max_uses=3`) pour proposer trois actualités récentes.
2. Étape 2 : trois angles dérivés de l'actualité retenue.
3. Étape 3 : hook unique 6-12 mots → écrit dans `draft.hook`.
4. Étape 4 : cinq slides → `draft.slides`.
5. Étape 5 : légende + hashtags → `draft.caption` + `draft.hashtags` (parsing de la dernière ligne `#…`).
6. Étape 6 : confirme, passe `status='ready'`, `router.refresh()`.

## Sécurité / multi-tenant
- Le post est rechargé côté serveur et son `tenant_id` doit correspondre au tenant courant (issu de `getBrandIdForCurrentUser`).
- Toute mise à jour du post passe par le client RLS (`createClient`) — aucun bypass admin.
- `logCreditsUsage` (admin) écrit feature='generation' avec model='claude-opus-4-7'.

## À vérifier hors sandbox
- Disponibilité du tool `web_search_20250305` sur le compte Anthropic ; à défaut, l'étape 1 retournera un 502 et il faudra fallback sur saisie utilisateur.
- `npm run lint` et `npm run build`.
- Comportement en cas de réponse non-JSON (déjà prévu : tentative d'extraction du premier bloc `{…}` puis 502).

## Limites assumées
- Le draft est partiel jusqu'à l'étape 6 ; la preview iPhone reflète le draft local côté layout (Sprint 15) — la persistance Supabase est faite après chaque étape réussie.
- Pas de "regen" explicite : l'utilisateur peut recliquer une option d'une étape passée pour relancer la suite.
