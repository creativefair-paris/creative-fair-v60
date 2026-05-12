# Sprint 36.B.8 — Désactiver sticky + homogénéiser containers

Branche `sprint-36-b-8` (basée sur `sprint-36-b-7` HEAD `5971034`).
1 commit. Build OK, tsc OK, lint OK (11 warnings pré-existants, 0 erreur).
Pas de push, pas de tag.

## Patch 1 — Désactiver le sticky

`PageHeaderStickyWrapper.tsx` supprimé.
`PageHeader.tsx` rend directement :
```html
<header class="cfs-page-header">
  <div class="cfs-page-header-inner">
    <nav>Breadcrumb</nav>
    <div class="cfs-page-header-row"><h1>...</h1><div>Avatar</div></div>
  </div>
</header>
```

`globals.css` — section PageHeader :
- Supprimé : `position: sticky`, `transition`, `data-scrolled`, `backdrop-filter`, `@supports not (...)`, `@media prefers-reduced-motion`.
- `.cfs-page-header` = `background: transparent; border: none; box-shadow: none; position: static`.
- `.cfs-page-header-inner` = `position: relative; max-width: 1200px; margin: 0 auto; padding: 24px`.

## Patch 2 — Container homogène .cfs-page-container

Nouvelle classe utilitaire dans `globals.css` :
```css
.cfs-page-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
  box-sizing: border-box;
}
@media (max-width: 768px) { padding-left/right: 16px; }
```

### Pages mises à jour

| Page | Avant | Après |
|---|---|---|
| `/programme` | contenu dans div sans container propre → ProgrammeDashboard ajoutait `maxWidth:1280 + padding 0 20px` | `cfs-page-container` sur le div contenu |
| `ProgrammeDashboard` | `maxWidth:1280; padding:'0 var(--space-5)'` (20px chaque côté) | `width:100%` uniquement — hérite du container parent |
| `/outils` | `padding: '0 var(--space-5) var(--space-12)'` (20px horizontal) | `className="cfs-page-container"` + `paddingBottom: 'var(--space-12)'` |
| `/compte/mon-compte` | inline `maxWidth:1200; padding:'0 24px'` | `className="cfs-page-container"` |
| `/ma-marque` | `.cfs-ma-marque-grid` déjà à `1200px / padding 0 24px` | non modifié |

### Résultat

Sur tous les viewports, le bord gauche du breadcrumb, du H1 et du
contenu premier ligne est exactement identique entre `/programme`
et `/ma-marque` (24px du bord du container 1200px centré).

## Gate

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `eslint --quiet` | 0 erreur (11 warnings pré-existants) |
| 3 | `next build` | succès |
| 4 | Anti-régression `#1F4937` | 0 ajout vs sprint-36-b-7 |
| 5 | `PageHeaderStickyWrapper` plus référencé nulle part | confirmé |
| 6 | `data-scrolled` / `backdrop-filter` sur `.cfs-page-header` | 0 résidu |
| 7 | Fichiers modifiés | 6 fichiers + 1 supprimé |
| 8 | Push / tag | aucun |
| 9 | Sheets / MarquePreview / MarqueRow | non touchés |
| 10 | Migrations | non touchées |
| 11 | Working tree | clean après commit |

## Action Lead

1. Ouvrir `/programme` et `/ma-marque` côte-à-côte.
2. Vérifier alignement parfait : breadcrumb, H1, premier contenu, avatar droite.
3. Scroller : PageHeader disparaît normalement avec le contenu, aucun fond blanc.
4. Si OK : push `sprint-36-b-8` → merge main → tag `v1.6.3`.

Filet : `git checkout sprint-36-b-7` revient à l'état sticky en < 1 s.
