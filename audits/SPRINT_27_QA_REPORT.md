# Sprint 27 — QA Report V1

Branch : `main` (creative-fair-v60). Modèle : `claude-opus-4-7`
(audit + détection bugs).

## Méthode

Audit en lecture par 8 flux utilisateur, du point d'entrée à la sortie
attendue. Chaque flux noté **OK / OK avec réserve / KO**. Bugs
identifiés ventilés en P0/P1/P2 dans `SPRINT_27_BUGS.md`.

L'audit a été conduit sans navigateur (sandbox sans npm) — la
vérification visuelle finale est listée comme suite à donner avant
ouverture aux clients.

## Flux 1 — Inscription / connexion

**Verdict** : OK.

- `/login` accepte email + magic link.
- Proxy redirige authentifié vers `/aujourdhui`, non authentifié vers
  `/login` sur routes protégées.
- Page racine `/` redirige proprement (corrigé Sprint 27).
- Logout via formulaire POST `/logout`.

**Réserve** : pas de page `/auth/callback` testée live ici. Vérifier
qu'elle pose bien le cookie session avant le redirect Supabase.

## Flux 2 — Onboarding nouveau tenant (admin)

**Verdict** : OK.

- `/admin/tenants/new` provisionne tenants + brands + invite owner +
  insère profile.
- Triple gate sécurité (proxy + layout + server action).
- Theme par défaut applique palette forêt si rien n'est passé.

**Réserve** : `auth.admin.inviteUserByEmail` renvoie 422 si email déjà
existant. Le message d'erreur Supabase remonte tel quel à
l'utilisateur — pas idéal mais lisible.

## Flux 3 — Onboarding utilisateur final

**Verdict** : OK avec réserve.

- À la première connexion sans brand book, `/aujourdhui` affiche une
  suggestion contextuelle vers `/ma-marque/onboarding`.
- Le flux d'onboarding produit le brand book par questions IA (Sprint
  pré-batch).

**Réserve** : pas d'audit du parcours complet onboarding (Sprints 1-8
hors batch courant). Suppose le bon fonctionnement sur la base des
audits SPRINT_8_*.md.

## Flux 4 — Page Aujourd'hui

**Verdict** : OK.

- 3 zones (header date, NextAction, coaching) chargent en parallèle
  (server component).
- Coaching IA généré à la première visite, idempotent ensuite (table
  daily_coaching).
- Suggestions contextuelles dismissibles via localStorage.
- Crédits affichés.

## Flux 5 — Création de post (Post Creator)

**Verdict** : OK avec réserve.

- 3 onglets (Anecdote live, Anecdote custom, Brief externe).
- Persistance progressive du draft jsonb à chaque étape.
- Status flow `in_progress` → `ready` → `scheduled`.
- Programmer module fonctionnel (datetime J+1 9h00 par défaut).

**Réserve P1** : Anecdote live utilise web_search Anthropic. Si l'outil
n'est pas activé sur le compte, l'étape 1 retourne 502. Fallback à
prévoir (saisie manuelle d'actualité).

## Flux 6 — Calendrier

**Verdict** : OK.

- Vue semaine + mois.
- NewPostModal pour création rapide.
- Drag-and-drop reschedule via `updatePostSchedule`.
- Suggestions IA business-driven (panneau dédié).

## Flux 7 — Conseiller

**Verdict** : OK avec réserve.

- Stream SSE Opus 4.7.
- Persistance des conversations (table conversations).
- Liste des conversations triée par récence.

**Réserve P2** : streaming SSE en production Vercel — peut nécessiter
`runtime='edge'` pour tenir le long timeout. À tester en staging.

## Flux 8 — Ma Marque (édition brand book)

**Verdict** : OK.

- Édition par question IA (8 questions canoniques).
- Édition libre du brand book.
- Édition libre du business calendar.
- Visibilité du statut (incomplete / complete).

## Audit visuel

Non exécuté en sandbox (pas de browser). Liste de vérifications à
faire avant ouverture clients :

- [ ] Header glass-bar visible en scroll long
- [ ] BottomNav glass-bar mobile (test < 768px)
- [ ] Modals NewPostModal en glass-z3
- [ ] Activer macOS « Réduire transparence » → bascule surface opaque
- [ ] Activer « Réduire le mouvement » → désactive animations
- [ ] Test Safari iOS récent + iOS 14 (fallback @supports)
- [ ] Tests rendu : Chrome, Firefox, Safari macOS

## Performance

- Aucun audit Lighthouse exécuté en sandbox.
- Suspecter `backdrop-filter` sur low-end Android — surveillance prévue
  V2.

## Sécurité

- Route admin triple-gated : OK.
- RLS Supabase : toutes les écritures user passent par `createClient()`,
  seul l'admin et les logs crédits passent par `createAdmin()`.
- Pas de secrets côté client. Variables sensibles uniquement
  server-side.
- Allowlist admin centralisée dans `lib/auth/admin.ts` (replicated
  inline dans `proxy.ts` car edge runtime).

## Copywriting

- VOICE_SHEET appliquée dans tous les system prompts IA.
- Vocabulaire interdit (pipeline, dashboard, sync, tokens) absent des
  textes utilisateurs.
- Sentence case respecté (à confirmer manuellement page par page).
- Aucun emoji, aucun point d'exclamation détecté à la lecture.

## Bugs identifiés (résumé)

Voir `SPRINT_27_BUGS.md` pour le détail.

- P0 : 2 bugs corrigés dans ce sprint.
- P1 : 3 bugs ouverts, fix recommandés avant ouverture clients.
- P2 : 5 bugs ouverts, ajoutés au backlog V2.
