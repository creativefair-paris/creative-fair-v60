# Sprint 20 — Conseiller (chat continu)

## Objectif
Refondre le Conseiller : layout deux colonnes (liste de conversations + chat actif), Opus 4.7 en streaming SSE, persistance des conversations.

## Fichiers créés
- `components/conseiller/ConversationsList.tsx` — liste cliquable avec timestamps relatifs (heure, jour, date courte) et bouton "Nouvelle".
- `components/conseiller/ConseillerChat.tsx` — chat client avec streaming SSE, parse `data: {…}\n\n`, propage `conversationId` quand le serveur le crée, gère erreurs et auto-scroll.
- `components/conseiller/ConseillerLayout.tsx` — orchestre liste + chat actif, met à jour la liste localement quand une conversation est créée.
- `audits/SPRINT_20_TEST.md`.

## Fichiers mis à jour
- `app/(app)/conseiller/page.tsx` — server component, charge les 50 dernières conversations de l'utilisateur, mappe titre = première question utilisateur (60 char max).
- `app/api/ai/chat/route.ts` — réécrit pour :
  - Opus 4.7 (au lieu de Sonnet 4.6 dans la version Sprint 5).
  - Utiliser `getBrandByTenantId` + `buildStructuredBrandContext` au lieu de l'ancien `buildBrandContext` qui lisait des colonnes `values/audience/tone/mission` inexistantes.
  - Créer la conversation au premier message si `conversationId=null`, et envoyer `data: {"conversationId": "…"}` en début de stream.
  - Mettre à jour `conversations.messages` avec la réponse complète à la fin.
  - Logger `feature='conseiller'` après le stream via `stream.finalMessage().usage`.

## Comportement attendu
1. Sur `/conseiller`, la liste à gauche montre les conversations passées. Le panneau de droite ouvre la première (ou un état vide si aucune).
2. L'utilisateur tape, appuie sur Entrée (ou clique Envoyer). Réponse en streaming.
3. Si c'est une nouvelle conversation, le serveur l'insère et renvoie son ID dans le premier event SSE ; l'UI ajoute la conversation en haut de la liste.
4. Cliquer une autre conversation rend `ConseillerChat` avec une `key` différente, ce qui réinitialise l'état local sur les messages historiques.

## Sécurité / multi-tenant
- `getBrandIdForCurrentUser` utilisé pour récupérer tenant_id.
- Les conversations sont insérées avec `user_id`, `tenant_id`, `brand_id`. RLS attendu (table `conversations`).
- Aucun `createAdmin` côté chat — seul le logging crédit utilise admin (centralisé dans `lib/ai/credits.ts`).

## À vérifier hors sandbox
- `npm run lint` (le typage de `stream.finalMessage()` peut nécessiter un cast selon la version SDK).
- Que `app/api/ai/chat/route.ts` n'importe plus `buildBrandContext` (suppression). L'ancien `lib/ai/tenant-context.ts` reste mais n'est plus utilisé — pourra être supprimé dans un sprint d'hygiène.
- Streaming SSE en prod (Vercel) : nécessite `runtime='edge'` ou config Node 20 long timeout. À ajuster si besoin.

## Limites assumées
- Pas de suppression / renommage de conversation depuis l'UI.
- Pas de threading multi-onglet (la liste locale ne se rafraîchit que sur action utilisateur).
