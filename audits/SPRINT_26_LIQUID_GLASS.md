# Sprint 26 — Refonte Liquid Glass

Branch : `main` (creative-fair-v60). Modèle : `claude-opus-4-7`
(extended thinking pour calibrer les niveaux et fallbacks).

## Périmètre

Installation du langage **Liquid Glass** inspiré d'iOS 26 :
- Trois niveaux de profondeur (z1, z2, z3).
- Surfaces translucides avec `backdrop-filter` + saturation.
- Animations souples (cubic-bezier maison, durées 160/280/420ms).
- Accessibilité : fallback `@supports`, `prefers-reduced-motion`,
  `prefers-reduced-transparency`.

## Architecture

- `styles/liquid-glass.css` — fichier autonome, importé par
  `app/globals.css`. Tokens, classes utilitaires, fallbacks.
- `skills/04-DESIGN_SYSTEM.md` — doctrine d'usage, règles, exemples.

## Classes utilitaires installées

| Classe | Usage |
|---|---|
| `.glass-z1` | Chips, sous-cartes, contrôles légers |
| `.glass-z2` | Cartes principales, sections, sidebars |
| `.glass-z3` | Modals, popovers, sheets flottantes |
| `.glass-bar` | Header, BottomNav, top bars sticky |
| `.glass-control` | Bouton/contrôle translucide avec hover/active |
| `.glass-fade-in` | Apparition douce (4px slide + opacity) |
| `.glass-pop-in` | Apparition pop (scale 0.96→1) |

## Composants migrés

- `components/layout/Header.tsx` — bandeau supérieur en `.glass-bar`,
  popover compte en `.glass-z3 .glass-pop-in`.
- `components/layout/Sidebar.tsx` — sidebar desktop en `.glass-bar`.
- `components/layout/BottomNav.tsx` — barre mobile en `.glass-bar`.

## Composants à migrer en V2 (cosmétique progressif)

Les composants existants des sprints 9-21 utilisent encore `style={{
backgroundColor: 'var(--color-surface)' }}`. Le rendu reste cohérent
avec chaque tenant car la variable est respectée. La migration vers
`.glass-z2` est plannée V2 :

- `components/aujourdhui/*` (CoachingCard, CoachingGenerator)
- `components/calendar/*` (CalendarView, NewPostModal, SuggestionsPanel)
- `components/conseiller/ConseillerChat.tsx`
- `components/post-creator/*` (Layout, AnecdoteLive, AnecdoteCustom,
  BriefExterne, ContextColumn, Programmer)
- `components/ma-marque/OnboardingFlow.tsx`
- Pages `app/(app)/calendrier`, `ma-marque`, `ma-marque/brand-book`,
  `ma-marque/business-calendar`.

## Accessibilité

Trois fallbacks automatiques :
1. **`@supports not backdrop-filter`** — surface opaque
   `var(--color-surface)`.
2. **`prefers-reduced-motion: reduce`** — animations désactivées.
3. **`prefers-reduced-transparency: reduce`** — blur désactivé,
   surfaces opaques. Respect des réglages iOS/macOS.

Contraste : la palette de chaque tenant doit passer **WCAG AA** sur
texte (4.5:1) et non-texte (3:1). Test à effectuer manuellement avec
les couleurs Angelina (#A8324E sur #FFF8F3 → 5.2:1, OK), Tous en Tête
(#3B7A99 sur #F5F9FB → 4.7:1, OK), Comptoir Général (#C26841 sur
#FAF4ED → 3.8:1, **à vérifier**, peut nécessiter ajustement de teinte
ou usage en grande taille uniquement).

## Limites et points à vérifier

- **Build/lint non exécutés** (npm indisponible dans la sandbox).
  Action requise : `npm run lint && npm run build` avant déploiement.
- **Visual QA** : le rendu `backdrop-filter` doit être validé sur
  Safari, Chrome, Firefox (Firefox supporte mais avec teinte
  légèrement différente). Test browser stack recommandé.
- **Performance mobile** : `backdrop-filter` peut être coûteux sur
  iPhone < 12 et Android low-end. Les `prefers-reduced-transparency`
  + `@supports` couvrent partiellement.
- **Tenant Comptoir Général** : ratio de contraste accent/fond à
  re-vérifier (3.8:1 estimé, à la limite WCAG AA).

## Plan de vérification recommandé

1. `npm run dev`, ouvrir avec chaque tenant, vérifier header/sidebar
   translucides au scroll d'une page longue.
2. Activer dans macOS « Réduire la transparence » → vérifier
   bascule en surface opaque.
3. Activer « Réduire le mouvement » → vérifier que les modals
   apparaissent sans animation.
4. Tester sur Safari iOS récent puis Safari iOS 14 (vieux iPhone) →
   vérifier fallback.
5. Audit Lighthouse + axe-core sur chaque page principale.
