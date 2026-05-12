# Sprint 36.C.1 — Fix redirection /aujourd-hui + Footer Sheet

Branche `sprint-36-c-1` (basée sur `sprint-36-c` HEAD `d6652f3`).
1 commit. Build OK, tsc OK, lint OK (11 warnings pré-existants, 0 erreur).
Pas de push, pas de tag.

## Patch 1 — Redirection /aujourd-hui

**Bugs identifiés (3 chemins de redirection résiduels vers /programme) :**

1. `components/onboarding/OnboardingFlow.tsx:113`
   `router.push('/programme?welcome=true')` après completion 4/4.
   → `router.push('/aujourd-hui')`
   - Le flag `welcome=true` est abandonné : pas de welcome scene sur la
     home V1. À réactiver Sprint 37 si une animation d'arrivée est
     ajoutée.

2. `app/(programme)/programme/bienvenue/page.tsx:42`
   Route fallback post-onboarding qui vérifiait l'existence d'un programme
   actif puis redirigeait vers /programme.
   → `redirect('/aujourd-hui')` (les checks auth + programme actif restent).

3. `app/(admin)/layout.tsx:16`
   `redirect('/aujourdhui')` — sans hyphen, route morte qui retournait 404.
   Bug latent depuis Sprint 36.C (auth callback avait été corrigé mais
   pas ce layout admin).
   → `redirect('/aujourd-hui')`

**Pas modifiés (intentionnels — pas de fallback home) :**

- `components/layout/ProgrammeOutilsToggle.tsx:17` : toggle utilisateur
  Programme ⇄ Outils, action explicite.
- `components/layout/UserMenuTrigger.tsx:37` : même toggle dans le menu user.
- `components/layout/UserMenuBubble.tsx:61` : lien explicite "Mon Programme"
  dans le menu.
- `components/accueil/BifurcationCards.tsx` : composant orphelin
  (Sprint 36.C a court-circuité l'accueil bifurcation, mais le composant
  reste en tree). À retirer Sprint 37.

**Vérification routing post-fix :**

| Action | Destination | Statut |
|---|---|---|
| `/` (user onboardé) | `/aujourd-hui` | ✓ (Sprint 36.C) |
| `/aujourd-hui` (direct, onboardé) | reste sur `/aujourd-hui` | ✓ |
| Logout + magic link | `/aujourd-hui` (auth callback) | ✓ (Sprint 36.C) |
| Onboarding 4/4 complete | `/aujourd-hui` | ✓ (ce sprint) |
| `/programme/bienvenue` (avec programme actif) | `/aujourd-hui` | ✓ (ce sprint) |
| Non-admin sur `/admin/*` | `/aujourd-hui` | ✓ (ce sprint) |

**Note diagnostic** sur "user onboardé redirigé vers /onboarding" :
le check `brand.brand_book_status !== 'complete'` dans `loadAujourdhuiData`
est byte-identique à celui de `/programme`, `/ma-marque`, `/outils`,
`/(accueil)`. Si le user accède à `/aujourd-hui` et est redirigé, c'est
que son `brand_book_status` est différent de `'complete'` en base.
Aucune régression dans le code Sprint 36.C — le symptôme est probablement
un état de données spécifique (user partiellement onboardé via path legacy).
À investiguer côté DB si ça persiste après ce sprint.

## Patch 2 — Footer Sheet qui masque le contenu

**Diagnostic réel :**

Le footer n'est PAS `position: fixed` — il est `position: relative` en
flex flow naturel, sibling après le body scrollable. La structure :

```
<dialog flex-column overflow:hidden>
  <header />
  <body flex:1 overflow:auto>{content scrollable}</body>
  <footer />
</dialog>
```

Donc le footer est physiquement EN-DESSOUS du body, pas par-dessus.
Le "masquage" observé sur Piliers narratifs venait de **deux effets
combinés** :

1. **Padding-bottom insuffisant** du contenu intérieur (`32px`) : le bouton
   "Régénérer les 3 piliers" se retrouvait collé au bord inférieur du
   body scrollable, juste au-dessus du footer. Le contraste entre la
   bordure dark du bouton (`1px solid var(--color-label)`) et le footer
   semi-transparent (`rgba(255,255,255,0.6) + blur`) créait un effet de
   fusion visuelle qui le rendait illisible.

2. **Opacité footer trop faible** (`rgba(255,255,255,0.6)`) avec backdrop-
   filter blur : le contenu du body transparaissait sous le footer.

**Fix appliqué :**

| Endroit | Avant | Après |
|---|---|---|
| Inner content (split) padding | `32px 60px 32px 60px` | `32px 60px 96px 60px` |
| Inner content (single) padding | `32px 32px 32px 32px` | `32px 32px 96px 32px` |
| Footer background | `rgba(255,255,255,0.6)` | `rgba(255,255,255,0.88)` |
| Footer z-index | `2` | `3` |
| Footer flex-shrink | (default) | `0` (explicite, blindage) |

**Résultat :**
- 64 px supplémentaires de breathing room au bottom du contenu scrollable
- Le footer occulte totalement (88% opacité) le contenu qui passerait
  derrière au scroll
- Le bouton "Régénérer" reste accessible et visuellement distinct
- Le fix se propage automatiquement à toutes les sheets utilisant
  `SheetMaMarque` (PiliersSheet, CalendrierBusinessSheet, ObjectifsSheet,
  RessourcesSheet, BenchmarksSheet, CanauxSheet, BrandBookSheet, etc.)

## Gate

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `eslint --quiet` | 0 erreur (11 warnings pré-existants) |
| 3 | `next build` | succès, 40 routes |
| 4 | `#1F4937` dans code | 0 |
| 5 | `/programme` redirects (default home) | 0 (toggles intentionnels conservés) |
| 6 | Fichiers modifiés | 4 |
| 7 | Push / tag | aucun |
| 8 | Migrations DB | aucune touchée |
| 9 | Skills | non touchées |

## Action Lead

1. Valider visuellement :
   - Logout + re-login (compte onboardé) → atterrit sur `/aujourd-hui`
   - Compte nouveau → onboarding 4/4 → `/aujourd-hui`
   - Sheet Piliers narratifs → scroller en bas → bouton "Régénérer"
     visible et cliquable
   - Autres sheets : footer cohérent, contenu non masqué
2. Si OK : push `sprint-36-c-1` → merge `main` → tag `v1.7.1`

Filet : `git checkout sprint-36-c` revient à l'état pré-fix en < 1 s.
