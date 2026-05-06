# Sprint 15 — Layout Post Creator

## Objectif
Mettre en place la coquille du Post Creator : layout double colonne, contexte à gauche (3 onglets), preview iPhone à droite toujours visible, route dynamique `/post-creator/[postId]`.

## Fichiers créés
- `types/post-draft.ts` — `PostDraft`, `PostType`, `PostStatus`, `PostRecord`.
- `components/post-creator/PreviewIOS.tsx` — mockup iPhone outline (sans PNG), affiche hook + 3 lignes de légende + hashtags.
- `components/post-creator/AnecdoteLive.tsx` — stepper 6 étapes (consomme `/api/ai/post-generation`, route créée Sprint 16).
- `components/post-creator/AnecdoteCustom.tsx` — stub (Sprint 17).
- `components/post-creator/BriefExterne.tsx` — stub (Sprint 18).
- `components/post-creator/ContextColumn.tsx` — 3 onglets, sélection initiale dérivée de `post.type`.
- `components/post-creator/PostCreatorLayout.tsx` — grille `lg:grid-cols-[1fr_360px]`, preview `lg:sticky`.
- `app/(app)/post-creator/[postId]/page.tsx` — server component, fetch post + brand, monte `PostCreatorLayout`.

## Fichier mis à jour
- `app/(app)/post-creator/page.tsx` — redirige vers `/calendrier` (l'entrée canonique passe désormais par une publication existante).

## Comportements attendus
1. `/post-creator` redirige vers `/calendrier`.
2. `/post-creator/<id>` affiche layout double colonne en desktop, preview empilée sous le contexte en mobile.
3. L'onglet par défaut suit `post.type` (`anecdote_live` → onglet 1, `anecdote_custom` → onglet 2, autres → Brief externe).
4. Preview reflète le draft local (state du layout) ; la persistance Supabase se fera dans les routes API des sprints suivants.

## À vérifier hors sandbox
- `npm run lint` et `npm run build` (sandbox sans npm).
- Navigation depuis NewPostModal vers `/post-creator/[id]` — vérifier qu'aucun import circulaire.

## Limites assumées
- Aucun appel API n'est encore branché : `AnecdoteLive` montre la coquille, `AnecdoteCustom` et `BriefExterne` annoncent "Disponible bientôt" jusqu'aux sprints 17 et 18.
- `onDraftChange` n'écrit pas encore en base — sera traité quand chaque module aura sa propre route.
