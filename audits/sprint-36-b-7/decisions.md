# Sprint 36.B.7 — Fix alignement /programme + Sticky Header

Branche `sprint-36-b-7` (basée sur `sprint-36-b-6` HEAD `ab2970e`).
1 commit. Build OK, tsc OK, lint OK (11 warnings pré-existants, 0 erreur).
Pas de push, pas de tag.

## Patch 1 — Fix alignement gauche PageHeader sur /programme

### Diagnostic

La page `/programme/page.tsx` utilisait `<main class="min-h-screen">` comme
racine de son JSX. Le layout `(programme)/layout.tsx` injecte déjà les pages
dans un `<main class="flex-1">`. Deux `<main>` imbriqués = HTML invalide +
comportement de rendu flex ambigu selon les moteurs : le deuxième `<main>`
peut être interprété différemment en termes de contexte de bloc, décalant le
container 1200px du PageHeader vers la droite.

Sur `/ma-marque`, le JSX racine est `<div class="min-h-screen">` → aucun
conflit, padding-left 24px aligné correctement.

De plus, `programme-wrapper` englobait à la fois le PageHeader et le contenu.
Sur `/ma-marque`, le PageHeader est un enfant direct du conteneur flex-column,
sans classe supplémentaire héritée.

### Fix

- `<main class="min-h-screen">` → `<div class="min-h-screen">` (cohérent
  avec /ma-marque, supprime la dualité `<main>` imbriquée).
- `programme-wrapper` descend sur le seul **conteneur de contenu** (enveloppe
  ProgrammeDashboard / section vide), pas le PageHeader.
- `WelcomeURLCleaner` déplacé avant le conteneur flex-column (il ne prend pas
  de place visuelle).
- Le PageHeader est maintenant sibling du conteneur de contenu dans le même
  div flex-column → même profondeur DOM que /ma-marque.

**Animation is-welcome préservée** : `.programme-wrapper.is-welcome` s'applique
toujours aux `.intro-subtle`, `.arc-narratif`, `.piliers-chips` qui sont enfants
de ProgrammeHero (lui-même enfant du conteneur de contenu).

## Patch 2 — Sticky Header avec double état visuel

### Architecture

`PageHeader` (Server Component) délègue le rendu du `<header>` à
`PageHeaderStickyWrapper` (Client Component). Séparation nette :

| Composant | Nature | Rôle |
|---|---|---|
| `PageHeader.tsx` | Server Component | Charge `loadUserMeta()`, prépare breadcrumb, H1, trailing |
| `PageHeaderStickyWrapper.tsx` | Client Component | Rend `<header>`, détecte scroll, applique `data-scrolled` |

### CSS — Deux couches

**`.cfs-page-header`** (outer `<header>`) :
- `position: sticky; top: 0; z-index: 50`
- `background: transparent; border-bottom: 1px solid transparent` au repos
- `transition: background-color, backdrop-filter, border-color 200ms ease-out`
- `position: sticky` crée un contexte de positionnement → UserMenuBubble
  reste correctement ancré au scroll.

**`.cfs-page-header-inner`** (div 1200px centré) :
- `max-width: 1200px; margin: 0 auto; padding: 24px`
- `position: relative` (ancrage UserMenuBubble, `top: 76px; right: 24px`)

### État scrollé (`data-scrolled="true"`)

Activé dès `window.scrollY > 8px` :
```
background: rgba(255,255,255,0.88)
backdrop-filter: blur(20px) saturate(180%)
border-bottom: 1px solid rgba(0,0,0,0.06)
```
Fallback `@supports not (backdrop-filter)` : `background: rgba(255,255,255,0.98)`.
`prefers-reduced-motion` : `transition: none`.

### Anti-gamification / doctrine

- Aucun `#1F4937` introduit.
- Aucun emoji, aucune exclamation, aucune mention "IA".
- Liquid Glass niveau 3 (consistant avec `UserMenuBubble` et la spec §7.6).

## Gate

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `eslint --quiet` | 0 erreur (11 warnings pré-existants) |
| 3 | `next build` | succès |
| 4 | Anti-régression `#1F4937` | 0 ajout vs sprint-36-b-6 |
| 5 | Fichiers modifiés | `page.tsx` /programme, `globals.css`, `PageHeader.tsx` |
| 6 | Fichiers créés | `PageHeaderStickyWrapper.tsx` |
| 7 | Push / tag | aucun |
| 8 | SheetMaMarque / MarquePreview / MarqueRow | non touchés |
| 9 | Migrations DB | non touchées |
| 10 | Skills | non touchés |
| 11 | Working tree | clean après commit |

## Action Lead

1. Valider visuellement :
   - `/programme` et `/ma-marque` : H1 alignés à la même position x.
   - Scroll sur /programme (ou /ma-marque) : fond glass apparaît après 8px.
   - Transition douce 200ms ease-out.
   - Dropdown avatar : correctement ancré avant et au scroll.
2. Si OK : push `sprint-36-b-7` → merge main → tag `v1.6.2`.

Filet : `git checkout sprint-36-b-6` revient à l'état pré-sprint en < 1 s.
