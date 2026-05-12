# Sprint 36.B.8 — Journal des écarts

Aucun abort déclenché. Sprint exécuté de bout en bout.

## Notes d'implémentation

- `ProgrammeDashboard.tsx` : suppression de `maxWidth: 1280` et
  `padding: '0 var(--space-5)'`. Les colonnes `aside paddingRight: 20`
  et `section paddingLeft: 20` sont conservées — elles fournissent
  du souffle interne entre les deux colonnes du split brief et ne
  contribuent pas au décalage gauche du container.

- `/ma-marque/page.tsx` non modifié : `.cfs-ma-marque-grid` porte
  déjà `max-width: 1200px; margin: 0 auto; padding: 0 24px` — aligné
  identiquement à `.cfs-page-container`. Modifier ce composant aurait
  risqué de casser la grille 40/60 desktop sans bénéfice.

- `/outils/conseiller/page.tsx` non modifié : la page ne contient que
  `<PageHeader title="Conseiller" />`, aucun contenu à aligner.

- Le CSS `.cfs-ma-marque-grid` (Sprint 36.B.4) et `.cfs-page-container`
  (Sprint 36.B.8) sont intentionnellement dupliqués (même valeurs) pour
  éviter de créer une dépendance sur une classe générique dans un composant
  spécifique. À factoriser si besoin lors d'un refacto futur.
