# Sprint 27 — Bugs identifiés

Trois niveaux de priorité :
- **P0** — bloque l'ouverture aux clients. Fix immédiat.
- **P1** — dégrade l'expérience, fix fortement recommandé avant V1.
- **P2** — friction acceptable en V1, intégrer V2.

## P0 — Corrigés dans ce sprint

### #001 — Page racine affichait « v60 · setup en cours »
**Fichier** : `app/page.tsx`.
**Symptôme** : la page d'accueil affichait un placeholder de
développement avec mention « setup en cours ».
**Fix** : remplacée par redirect serveur vers `/aujourdhui` si
authentifié, `/login` sinon. Le contenu marketing public sera
re-introduit V2 si nécessaire.
**Statut** : corrigé.

### #002 — Métadonnées HTML par défaut Next.js
**Fichier** : `app/layout.tsx`.
**Symptôme** : `<html lang="en">` et `<title>Create Next App</title>`
laissés au défaut du template.
**Fix** : `lang="fr"`, title `Creative Fair`, description correcte.
Suppression des polices Geist injectées et inutilisées (les fonts du
tenant viennent de `--font-display` / `--font-body`).
**Statut** : corrigé.

### #003 — Fichier mort `lib/ai/tenant-context.ts`
**Fichier** : `lib/ai/tenant-context.ts`.
**Symptôme** : ancien helper `buildBrandContext` plus utilisé depuis
la réécriture du conseiller (Sprint 20). Code mort.
**Fix** : fichier supprimé. Pas d'import résiduel.
**Statut** : corrigé.

## P1 — Ouverts, fix recommandé avant ouverture clients

### #101 — Anecdote live retourne 502 si web_search désactivé
**Fichier** : `app/api/ai/post-generation/route.ts`.
**Symptôme** : si l'outil `web_search_20250305` n'est pas activé sur
le compte Anthropic, l'étape 1 d'Anecdote live remonte une erreur
opaque à l'utilisateur.
**Fix proposé** : try/catch autour de l'appel, sur erreur tool
absent → bascule vers Anecdote custom avec message « L'actualité ne
peut pas être recherchée automatiquement. Saisissez votre actualité ci-
dessous. ».
**Statut** : ouvert.

### #102 — Erreur Supabase brute remontée à l'admin
**Fichier** : `app/(admin)/tenants/actions.ts`.
**Symptôme** : si `inviteUserByEmail` rejette (email déjà existant en
auth.users, par exemple), le message Supabase technique remonte tel
quel à l'utilisateur admin (« User already registered »).
**Fix proposé** : catch + map vers messages humains (« Cet utilisateur
a déjà un compte sur Creative Fair. ») avec mention du tenant
existant si possible.
**Statut** : ouvert.

### #103 — Streaming SSE Conseiller en production Vercel
**Fichier** : `app/api/ai/chat/route.ts`.
**Symptôme** : le streaming SSE peut être interrompu par les timeouts
serverless Vercel (10s par défaut sur Hobby, 60s sur Pro). Les
réponses Conseiller longues risquent d'être tronquées.
**Fix proposé** : ajouter `export const runtime = 'edge'` ou
`maxDuration = 300` selon plan Vercel. Tester en staging avant V1.
**Statut** : ouvert.

## P2 — Backlog V2

### #201 — Skills SACRED contiennent encore des stubs
**Fichiers** : `skills/01-ARCHITECTURE.md`, `02-VOICE_SHEET.md`,
`10-SACRED.md` portent encore « À enrichir ». Les règles vivantes
sont dans `lib/ai/prompts/system.ts`.
**Action V2** : enrichir ces docs en miroir du code.

### #202 — Migration Liquid Glass partielle
**Fichiers** : 14 composants des sprints 9-21 utilisent encore
`backgroundColor: 'var(--color-surface)'` au lieu de `.glass-z2`.
**Action V2** : migration progressive composant par composant. Le
rendu reste cohérent avec chaque tenant donc non bloquant.

### #203 — Pas de page d'erreur 404/500 personnalisée
**Action V2** : créer `app/not-found.tsx` et `app/error.tsx` avec
mise en page Liquid Glass.

### #204 — Suppression tenant non implémentée
**Action V2** : ajouter `deleteTenant` dans
`app/(admin)/tenants/actions.ts` avec cascade contrôlée. Nécessite
une migration RLS sécurisée et une UX de double confirmation.

### #205 — Contraste Comptoir Général à la limite WCAG AA
**Symptôme** : accent `#C26841` sur fond `#FAF4ED` ratio estimé 3.8:1
(en-dessous du 4.5:1 requis WCAG AA pour texte normal).
**Action V2** : restreindre l'accent aux éléments en grande taille
(boutons, headings 24px+) où le ratio 3:1 suffit, ou foncer le ton.

### #206 — Crédits affichés sans seuil d'alerte
**Symptôme** : aucun warning quand le tenant approche du quota
mensuel. Risque de surprise en fin de mois.
**Action V2** : seuils 80% / 95% avec ContextualSuggestion dédiée.
