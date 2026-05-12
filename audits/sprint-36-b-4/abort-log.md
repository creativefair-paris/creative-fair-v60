# Sprint 36.B.4 — Journal des écarts

Aucun abort déclenché. Sprint exécuté de bout en bout.

## Note d'implémentation

- Patch 5 traité par addition d'utilitaires `.cfs-*` plutôt que refonte
  systématique des composants legacy. Décision motivée par le risque de
  régression visuelle (les patches critiques 1-4 sont prioritaires), et
  consigne sprint qui rappelle "ne pas supprimer les composants legacy
  listés en dette Sprint 36.B.3 — ce n'est pas le bon moment". La
  migration progressive est documentée comme dette dans `decisions.md`.

- Patch 1 : `glass-regular` retiré de la className de UserMenuBubble car
  son background 0.55 empêchait toute redéfinition sans `!important`.
  Préféré : rendre `.cfs-user-menu-bubble` autonome.
