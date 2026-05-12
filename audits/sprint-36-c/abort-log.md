# Sprint 36.C — Journal des écarts

Aucun abort déclenché. Les 5 lots ont été exécutés de bout en bout.

## Écarts par rapport au brief

### Lot 1

- `loadAujourdhuiData` retourne un union type `{ authenticated: false }
  | { authenticated: true; redirect } | { authenticated: true; ...data
  complète }` au lieu d'un loader monolithique. Permet à
  `aujourd-hui/page.tsx` de gérer auth + redirect onboarding au même
  niveau, identique au pattern `/programme/page.tsx`.

- Schéma posts réel : `statut='planifie'` (non `'a_preparer'` comme dans
  le brief), `pilier_nom` (non `pilier_id`), `titre` (non `titre_court`).
  Adapté en conséquence.

- `computeProgrammeTenuCetteSemaine` reste très simple en V1 (true par
  défaut sauf retard détecté). Une vraie heuristique nécessite plus
  de signal historique — reportée à Sprint 38.

### Lot 2

- Endpoint placé sous `/api/brand/pilier-propositions` (et non
  `/api/brand/[brandId]/pilier/[pilierId]/propositions` comme suggéré
  dans le brief). Raison : les piliers n'ont pas d'id DB stable (JSONB
  array), le brand est résolu via auth server-side. Plus simple,
  pas moins sûr.

- Layout SubSheetPilier : modal centré single-column plutôt que 40/60
  Split Brief. Justification : éviter le double 40/60 imbriqué avec
  la sheet parente (déjà 40/60). Plus lisible focalisé sur un seul pilier.

### Lot 4

- Brief mentionnait des noms de boutons en anglais (`cfs-btn-primary`).
  Le repo utilise convention française (`cfs-btn-primaire`/-secondaire/
  -destructif). Pas de rename — convention établie et déjà adoptée.

- Brief mentionnait `cfs-h1`/`cfs-h2` utility classes. Elles existent
  mais ne sont référencées nulle part (Sprint 36.B.4 les a déclarées
  sans les adopter). Gardées comme canonique source pour future
  adoption.

### Lot 5

- Localisation skills : `~/.claude/skills/` (brief) → en réalité
  `~/Library/Application Support/Claude/local-agent-mode-sessions/
  skills-plugin/<id>/<id>/skills/`. Les patches sont appliqués au
  bon emplacement effectif.

- Règle "veto Création Visuelle" : renumérotée 10 (non 9 comme prévu)
  car règle 9 "Tao 🌐 valide le timing culturel" existait déjà dans
  `cfs-coups-viralite-task-force/SKILL.md`. Le brief invitait
  explicitement à "renuméroter si nécessaire".

- Les modifications skills sont **hors dépôt git creative-fair-v60**.
  Pas de commit git ne les capture. Le backup
  `.backup-pre-sprint-36-c/` permet rollback en 1 commande `cp -r`.

## Composants legacy : 7/7 supprimés (pas d'abort)

Vérification grep avant chaque suppression : 0 import live pour les 7.
Build conserve son état post-suppression. Pas d'abort A2 déclenché.

## Migrations DB

Aucune touchée (A4 OK).

## Skills hors Lot 5

Aucune modification (A4 OK).
