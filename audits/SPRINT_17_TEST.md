# Sprint 17 — Anecdote (custom)

## Objectif
Permettre à l'utilisateur de raconter son anecdote en mots libres et de la faire dérouler sur les six mêmes étapes que l'Anecdote live, sans recherche web.

## Fichier mis à jour
- `components/post-creator/AnecdoteCustom.tsx` — passe du stub à un vrai composant client.
  - Étape 1 : textarea où l'utilisateur écrit son anecdote (min 10 caractères). Le bouton "Lancer" envoie le texte à `/api/ai/post-generation` avec `type='anecdote_custom'`.
  - Étapes 2 à 6 : identiques à AnecdoteLive (3 angles → hook → slides → légende → finalisation). Mêmes patterns de "pending pour texte/list, done pour choix".

## Fichier mis à jour côté API
- `app/api/ai/post-generation/route.ts` — propage `userInput` dans `workingDraft.actualite` quand `step=1` et `type=anecdote_custom`. La règle d'étape 1 anecdote_custom (`STEP_ACTUALITE_RULES` n'est pas appliquée ; on fournit l'instruction inline dans le prompt utilisateur : "reformule l'indication utilisateur en trois pistes narratives distinctes").

## Comportement attendu
1. Étape 1 : l'utilisateur écrit. Claude renvoie trois angles narratifs (kind='choices').
2. Étape 2 → 6 : identique à anecdote_live.
3. Aucune recherche web : l'outil web_search n'est pas activé (`useWebSearch=false`).
4. Le draft est persisté dans `posts.content` à chaque étape, le statut passe à `in_progress` puis `ready`.

## À vérifier hors sandbox
- Quand le post arrive avec `type='anecdote_custom'`, ContextColumn ouvre directement l'onglet Anecdote.
- L'utilisateur peut quand même cliquer "Anecdote live" : l'expérience repart de zéro mais le post conserve `type='anecdote_custom'` côté DB tant qu'aucune écriture ne le change. La route ne réécrit `posts.type` que si la valeur est `null` (`post.type ?? body.type`).

## Limites assumées
- Pas encore de persistance du texte d'anecdote brut comme champ séparé : `actualite` joue ce rôle.
- Pas de validation longueur côté serveur (juste min 10 char côté client).
