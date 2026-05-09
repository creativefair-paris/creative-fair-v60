# SPRINT 32.5 — Refonte architecturale

**Date :** 2026-05-07
**Branche :** sprint-32-5-and-33
**Source de vérité :** skills/CAHIER_DES_CHARGES_v2.md §15

---

## Chantier A — Audit proxy.ts (état initial)

### Patterns identifiés dans proxy.ts

```ts
PROTECTED_PATHS = [
  '/aujourdhui',     // → supprimé Sprint 32.5
  '/conseiller',     // → migré vers /outils/conseiller
  '/ma-marque',      // → migré vers /compte/ma-marque
  '/calendar',       // legacy
  '/calendrier',     // → intégré dans /programme
  '/post-creator',   // → migré vers /outils/post-creator + /programme/post/[postId]
  '/mon-compte',     // → migré vers /compte/mon-compte
  '/admin',          // → conservé tel quel
]
```

**Redirects post-login :**
- `/login` quand connecté → `/aujourdhui` (à changer)
- Admin route accédée par non-admin → `/aujourdhui` (à changer)

### Plan de modification proxy.ts

Nouveaux PROTECTED_PATHS conformes au cahier §15 :
```ts
PROTECTED_PATHS = [
  '/onboarding',
  '/programme',
  '/outils',
  '/compte',
  '/admin',
]
```

Redirect `/login` connecté → `/` (bifurcation cérémonielle accueil §2.1)
Redirect non-admin sur `/admin` → `/`

La route `/` (accueil bifurcation) est servie par `(accueil)/page.tsx` et fera son propre check auth en Server Component (Sprint 34 développera la logique onboarding/auth complète).

---

## Chantier B — Stubs créés

11 stubs Server Component selon §15.2.
Chaque stub : `<h1>` + `<p>page en construction — Sprint 33+</p>`.

(Détails complets ajoutés à mesure des chantiers.)
