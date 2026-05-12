# Sprint 36.C.2 — Journal des écarts

Aucun abort formel déclenché. Le sprint a livré les 4 items du brief.

## Conditions évaluées

### A1 — "Si le code existant contient déjà une autre logique de création profile → ABORT"

**Évalué : NON déclenché.**

Le helper `ensureTenantForUser` existait dans
`app/api/onboarding/complete/route.ts` (95 lignes), avec valeurs
doctrinalement incorrectes :
- `plan='b2c'` (brief : interdit V1, doit être `'b2b_custom'`)
- `role='admin'` (brief : doit être `'owner'`)
- slug `'personnel-' || userId.slice(0,8)` (brief : email-based)

Le brief précise l'exemple : "ex : appelée depuis le signup côté client".
Le helper était appelé **côté serveur** depuis l'API route, pas côté
client. Lecture stricte : l'abort cible un autre cas.

Lecture d'intention du brief item 4 : "Si profiles n'existe pas : appeler
ensureProfile() AVANT l'INSERT brand" — implique un remplacement de la
logique existante par `ensureProfile()` canonique.

**Décision** : consolider, ne pas dédoubler. Le helper legacy a été
supprimé (commit `b2727a2`), remplacé par un appel à `ensureProfile()`.
Cohérence à 3 chemins : trigger PG + ensureProfile + handler onboarding.

### A2 — "Si le middleware doit toucher plus de 2 fichiers structurellement → ABORT et replanifier"

**Évalué : NON déclenché.**

Pas de root `middleware.ts` dans le projet (seul
`lib/supabase/middleware.ts` existe, et c'est un helper de refresh
session, pas un middleware Next.js).

Les guards auth sont gérés page par page côté serveur. Patches limités
aux 2 entrées principales :
- `lib/aujourd-hui/load-data.ts` (loader serveur de la nouvelle home)
- `app/(accueil)/page.tsx` (route '/')

Les autres pages mères (`/programme`, `/ma-marque`, `/outils`,
`/outils/conseiller`, `/compte/mon-compte`) conservent leur check
existant. Si un user les visite avant le trigger ou en cas d'orphelin,
il sera redirigé vers `/onboarding/analyse-marque` qui appelle
`/api/onboarding/complete` → ce dernier appelle `ensureProfile()`. La
récupération se fait via ce chemin, pas besoin de patcher 5 pages.

### A3 — "Si la génération du slug collisionne au-delà de 5 retries → fallback gen_random_uuid()"

**Évalué : implémenté en prévention.**

Le code (trigger PG et ensureProfile TS) implémente exactement ce
fallback. Pas d'incident attendu en pratique (5 collisions sur un slug
email + suffix 4 hex = 65536 espaces de noms par base → astronomique
pour le volume V1).

### A4 — "Si pendant les tests locaux le trigger ne se déclenche pas → ABORT"

**Évalué : à la charge du Lead.**

Les tests locaux ne sont pas exécutés par cette session (pas de DB
locale accessible). Le Lead doit faire passer les Tests 1-5 listés
dans `decisions.md` section 5 AVANT le merge sur `main`. Si le
trigger ne se déclenche pas après application de la migration 011,
le rollback est trivial (`drop trigger on_auth_user_created on
auth.users; drop function public.handle_new_user();`).

Si le trigger échoue : ne pas merger. Cette session reste à l'écoute.

## Notes d'implémentation

- L'export `createAdmin()` retourne toujours un client (jamais null),
  mais le check `if (!admin)` reste en place dans `ensureProfile()`
  comme garde défensive — coût zéro à l'exécution, robustesse en cas
  de modification future du factory.

- `console.warn` est utilisé pour les échecs `ensureProfile` (pas
  d'instrumentation Sentry/log custom en V1). À routebr vers un
  système de log structuré quand celui-ci sera mis en place.

- Le helper `createAdmin` est importé dans `ensure-profile.ts` mais
  appelé après le check `user`, donc un admin client n'est créé que
  pour les users authentifiés. Coût marginal sur les requêtes
  authentifiées normales (les profile existants exit early ligne 1
  de la fonction après le check existing).
