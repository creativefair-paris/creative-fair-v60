# Sprint 36.B.7 — Journal des écarts

Aucun abort déclenché. Sprint exécuté de bout en bout.

## Notes d'implémentation

- **Patch 1** : le passage de `<main>` → `<div>` sur /programme/page.tsx
  est sémantiquement correct : le layout `(programme)/layout.tsx` fournit
  déjà le landmark `<main>`, les pages ne doivent pas en introduire un second.

- **Patch 2 — architecture sticky** : plutôt que de convertir PageHeader en
  Client Component (ce qui aurait requis de déplacer `loadUserMeta` en prop
  ou de dupliquer la logique côté client), on a introduit
  `PageHeaderStickyWrapper` — un Client Component minimal qui porte
  uniquement la détection de scroll. PageHeader reste Server Component.
  Cette architecture "Server → Client wrapper" est le pattern recommandé
  Next.js pour les Server Components qui ont besoin d'un comportement
  interactif localisé.

- **position:sticky vs position:relative** : `position: sticky` est un
  contexte de positionnement (non-static) et sert d'ancrage pour les enfants
  `position: absolute`. `UserMenuBubble` (`position:absolute; top:76px; right:24px`)
  s'ancre sur `.cfs-page-header-inner` (le plus proche ancêtre positionné
  explicitement via `position:relative`), pas sur le `<header>` sticky.
  Résultat : alignement identique avant et après le scroll.

- **`data-scrolled` vs class** : attribut `data-*` choisi plutôt qu'une
  classe CSS (ex. `.is-scrolled`) pour éviter toute collision avec Tailwind
  ou d'autres utilitaires. Le sélecteur `[data-scrolled="true"]` est
  explicite et résistant aux collisions.
