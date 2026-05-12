# Sprint 36.B.6 — Journal des écarts

Aucun abort déclenché. Sprint exécuté de bout en bout.

## Notes d'implémentation

- Seul `app/globals.css` modifié. Aucun composant `.tsx`, aucune page,
  aucune migration.

- Le choix de `flex-direction: row` explicite sur `.cfs-page-header-row`
  est défensif : `row` est la valeur par défaut de `flex-direction`, mais
  l'expliciter blinde contre un éventuel reset futur ou une lecture
  ambiguë du code.

- `position: relative` sur `.cfs-page-header` change le bloc de positionnement
  de `UserMenuBubble`. Effet garanti sur tous les viewports : le dropdown
  s'aligne toujours sur le container 1200px.
