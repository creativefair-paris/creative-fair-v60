# Sprint 36.B.6 — Fix alignement PageHeader

Branche `sprint-36-b-6` (basée sur `sprint-36-b-5` HEAD `839a80a`).
1 commit. Build OK, tsc OK, lint OK (11 warnings pré-existants, 0 erreur).
Pas de push, pas de tag.

## Périmètre

Un seul fichier modifié : `app/globals.css`.
Aucun composant TypeScript touché. Aucune migration. Aucune page.

## Problème corrigé

Sprint 36.B.5 avait livré `.cfs-page-header` avec `padding: 24px` (shorthand) et
sans `position: relative`. Deux symptômes visuels observés :

1. **Breadcrumb et H1 collés au bord gauche (x=0)** — le shorthand `padding`
   peut être écrasé dans certaines conditions de cascade Tailwind v4 (layers
   `base` / `utilities` vs CSS unlayered) ; les propriétés longues `padding-left`,
   `padding-right` etc. ne sont pas affectées de la même façon.

2. **Avatar sous le H1** (au lieu d'être sur la même ligne) — les marges bloc
   par défaut du navigateur sur `<h1>` (`margin-block-start: 0.67em`) ne sont
   pas systématiquement neutralisées par le Preflight Tailwind v4 dans ce
   contexte flex. Elles agissaient sur la hauteur de `.cfs-page-header-row`
   de façon à tromper `align-items: center`.

## Correctifs appliqués

| Sélecteur | Modification | Raison |
|---|---|---|
| `.cfs-page-header` | `padding: 24px` → 4 propriétés longues | Évite l'écrasement par shorthand en cascade |
| `.cfs-page-header` | `position: relative` ajouté | Ancre `UserMenuBubble` (`position:absolute top:76px right:24px`) sur le container 1200px |
| `.cfs-page-header-row` | `flex-direction: row` explicite | Blindage contre toute réinitialisation de direction |
| `.cfs-page-header-row h1` | `margin: 0` | Neutralise les marges bloc navigateur sur `<h1>` |
| Media query `≤768px` | `padding: 16px` → 4 propriétés longues | Cohérence avec la règle desktop |

## Impact UserMenuBubble

`.cfs-user-menu-bubble` est `position: absolute; top: 76px; right: 24px`.
Sans `position: relative` sur `.cfs-page-header`, le bubble se positionnait
relativement au premier ancêtre positionné (le wrapper de page, pleine largeur).
Sur un viewport > 1200px, `right: 24px` pointait vers le bord droit de l'écran
et non vers celui du container 1200px — le dropdown était désaligné.
Avec `position: relative` sur `.cfs-page-header`, le `right: 24px` colle
au bord droit du container 1200px, en alignement exact avec le padding-right.

## Gate

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `eslint --quiet` | 0 erreur (11 warnings pré-existants) |
| 3 | `next build` | succès |
| 4 | Anti-régression `#1F4937` | 0 ajout vs sprint-36-b-5 |
| 5 | Fichiers modifiés | `app/globals.css` uniquement |
| 6 | Push / tag | aucun |
| 7 | SheetMaMarque / MarquePreview / MarqueRow | non touchés |
| 8 | Migrations DB | non touchées |
| 9 | Skills | non touchés |
| 10 | Working tree | clean après commit |

## Action Lead

1. Valider visuellement le PageHeader sur `/programme`, `/ma-marque`, `/outils`.
2. Si OK : push `sprint-36-b-6` → merge sur main → tag `v1.6.1`.

Filet de sécurité : `git checkout sprint-36-b-5` revient à l'état pré-fix
en < 1 s.
