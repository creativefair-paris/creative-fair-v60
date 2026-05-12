# Sprint 36.B.4 — Patches critiques UI/UX

Branche `sprint-36-b-4` (basée sur `sprint-36-b-3` HEAD `f3de7ab`).
1 commit. Build OK, tsc OK, lint OK. Pas de push, pas de tag.
Aucune modification DB, aucune nouvelle route, aucun nouveau bloc.

## Cadre doctrinal respecté

- Aucun `#1F4937` introduit (vérifié `git diff sprint-36-b-3 | grep #1F4937` → AUCUN).
- Aucun nouveau pourcentage chiffré global. Aucun badge.
- Tutoiement partout. Aucune exclamation. Aucun emoji introduit.
- Liquid Glass à 3 niveaux respectés (commentaire canonique ajouté
  dans `styles/liquid-glass.css`).
- Pas de `window.confirm()` introduit.
- Sheets bottom Apple-grade conservées pour CAS B.
- Aucune mention de "IA" — uniquement "Creative Fair".

## Patch 1 — Menu avatar : fond solide

**Fichier modifié** : `app/globals.css` (.cfs-user-menu-bubble),
`components/layout/UserMenuBubble.tsx` (retrait classe `glass-regular`).

Le menu avatar utilisait `glass-regular` (background 0.55) qui le rendait
illisible sur les gradients clairs/rosés. Remplacé par :

- `background: rgba(255, 255, 255, 0.92)`
- `backdrop-filter: blur(20px) saturate(180%)`
- `border: 1px solid rgba(0, 0, 0, 0.08)`
- `box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)`
- `border-radius: 16px`
- `@supports not (backdrop-filter)` → fallback 0.98 opaque

Texte des items : `color: #1C1C1E` (noir Apple), jamais transparent.
Item destructif (Déconnexion) : `color: #FF3B30` plein, `font-weight: 500`.
Séparateur : `1px solid rgba(0,0,0,0.06)`.

## Patch 2 — Mon Programme : H1 dans colonne contexte + différenciation boutons

**Fichiers modifiés** :
- `components/programme/ProgrammeHero.tsx`
- `app/(programme)/programme/page.tsx`
- `components/layout/NavigationBar.tsx`
- `app/globals.css` (classes `cfs-btn-*`)

### Fix A — Alignement H1

NavigationBar n'affiche plus de H1 quand `title=""` (nouveau garde-fou
ligne 126). La page programme passe `title=""` et le H1 "Mon Programme"
est rendu en tête de `ProgrammeHero`, donc dans la colonne contexte
gauche du Split Brief. Plus de désalignement vertical avec l'arc
narratif. Breadcrumb "Aujourd'hui › Mon Programme" en tête.

### Fix B — Boutons vs chips

Les boutons "Voir un post" et "Enrichir ma marque" n'utilisent plus
`glass-thin` (qui les confondait visuellement avec les chips piliers).
Nouvelles classes utilitaires globales :

- `.cfs-btn-primaire` : fond `#1C1C1E`, texte blanc, pill 980px, hover
  opacity 0.85. "Voir un post" porte cette classe.
- `.cfs-btn-secondaire` : transparent + border 1.5px rgba(0,0,0,0.2),
  pill, hover background rgba(0,0,0,0.04). "Enrichir ma marque" porte
  cette classe (Link Next).
- `.cfs-btn-destructif` : `#FF3B30`, sans border. Disponible mais non
  utilisé dans le Hero.

Marge de séparation au-dessus des boutons : 24 px (vs 12 px avant).
Gap entre boutons : 12 px.

## Patch 3 — Ma Marque : 2 colonnes permanentes desktop

**Fichiers modifiés / créés** :
- `components/ma-marque/MarquePreview.tsx` (nouveau)
- `components/ma-marque/MaMarqueDashboard.tsx` (refonte layout)
- `components/ma-marque/MarqueRow.tsx` (prop `selected` + classes)
- `app/(ma-marque)/ma-marque/page.tsx` (sortie du wrapper 720 px)
- `app/globals.css` (.cfs-ma-marque-grid + .cfs-marque-row hover)

### Layout

Grille `1fr` mobile, `minmax(0,40%) minmax(0,60%)` desktop (≥ 1024 px).
La colonne preview est `sticky top: 24px` et `max-height: calc(100vh - 48px)`
pour rester visible en scrollant la liste.

### CAS A — édition inline desktop

6 blocs : `nom`, `secteur`, `voix`, `singularite`, `cible`, `univers-refuse`.
Sur desktop, clic → la colonne droite affiche un éditeur inline
(breadcrumb "Ma Marque › <bloc>", titre, hero contextuel, champ
input/textarea, bouton "Enregistrer" primaire). Le rang sélectionné est
mis en évidence (`background: rgba(0,0,0,0.05)`). Le save appelle
`PATCH /api/brand/update` puis met à jour le snapshot local.

### CAS B — sheet plein écran

Les 8 autres blocs (piliers, cap-saison, benchmarks, calendrier-business,
ressources, canaux, brand-book, archives) ouvrent toujours leur sheet
plein écran (comportement 36.B.3 conservé). MarquePreview affiche un
message discret "« X » s'ouvre en plein écran pour te donner la place
dont il a besoin." pendant que la sheet est en cours d'apparition.

### Mobile

Sous 1024 px : layout 1 colonne, la colonne preview est masquée (`display:
none`), tous les blocs ouvrent leur sheet (CAS A → `SheetTexteSimple`,
CAS B → leur sheet dédiée). Aucune régression mobile.

### Détection desktop

Lazy initializer `useState(() => window.matchMedia(...).matches)` +
listener sur `change`. Pas de `setState` synchrone dans `useEffect`
(lint `react-hooks/set-state-in-effect`).

## Patch 4 — Breadcrumb sur pages mères

**Fichier créé** : `components/ui/Breadcrumb.tsx`.

**Pages mises à jour** :
- `/programme` → "Aujourd'hui › Mon Programme" (dans ProgrammeHero).
- `/ma-marque` → "Aujourd'hui › Ma Marque" (dans MaMarqueDashboard).
- `/outils` → "Aujourd'hui › Mes Outils".
- `/outils/conseiller` → "Aujourd'hui › Conseiller".
- `/compte/mon-compte` → "Aujourd'hui › Mon compte".

### Comportement

- Style : 12 px, color rgba(0,0,0,0.4), letter-spacing 0.01em, marge bas 4 px.
- Premier segment "Aujourd'hui" = lien cliquable vers `/programme` (la
  page d'accueil `/aujourd-hui` n'existe pas encore — fallback documenté
  comme commentaire dans le composant pour bascule future).
- Séparateur `›` en rgba(0,0,0,0.25), marges 8 px gauche/droite.
- Dernier segment : non-cliquable, color rgba(0,0,0,0.55).
- Hover lien : color rgba(0,0,0,0.7) via classe `.cfs-breadcrumb-link`.

## Patch 5 — Harmonisation UI globale

**Fichiers modifiés** : `app/globals.css`, `styles/liquid-glass.css`.

Stratégie d'addition non-destructive : ajout d'utilitaires canoniques
disponibles pour les nouvelles pages et la migration future. Les
composants existants ne sont pas refactorisés en masse (hors scope
sprint patches critiques, et risque de régression élevé).

### 5.A — Typographie

Classes utilitaires :
- `.cfs-h1` : 28 px, 700, `#1C1C1E`, letter-spacing -0.02em.
- `.cfs-h2` : 20 px, 600, `#1C1C1E`, letter-spacing -0.012em.
- `.cfs-label-group` : 11 px, 500, rgba(0,0,0,0.4), uppercase, 0.06em.
- `.cfs-body` : 16 px, 400, `#1C1C1E`, line-height 1.5.
- `.cfs-summary` : 15 px, rgba(0,0,0,0.45), truncate 1 ligne (utilisée
  implicitement via MarqueRow).
- `.cfs-hero-intro` : 15 px, rgba(0,0,0,0.55), line-height 1.6, max 480 px.

Toutes les nouvelles pages écrites dans ce sprint utilisent ces valeurs
en inline-style (cf. ProgrammeHero, MaMarqueDashboard, MarquePreview,
Breadcrumb, page outils, page conseiller, page mon-compte).

### 5.B — Boutons

3 variantes uniquement (`.cfs-btn-primaire`, `.cfs-btn-secondaire`,
`.cfs-btn-destructif`). Pill 980 px, padding 10/20, 15 px, 500.
Transitions opacity/background 150 ms ease. Désactivées si
`prefers-reduced-motion`.

### 5.C — Rangs

`.cfs-marque-row` : hover `rgba(0,0,0,0.03)`, active `rgba(0,0,0,0.06)`,
selected `rgba(0,0,0,0.05)`. Transition 100 ms ease. Touch target 56 px
(≥ 44 px Apple). Séparateur 1 px rgba(0,0,0,0.06).

### 5.D — Cards

Classe `.cfs-card` (niveau 2) : background rgba(255,255,255,0.7),
blur 12 px saturate 160 %, border 1 px rgba(255,255,255,0.6), radius
12 px, padding 12/14. Fallback @supports en 0.95 opaque.

### 5.E — Espacements

Standardisés dans le code écrit ce sprint : 24 px margin/padding,
12 px gap entre boutons, 4 px gap breadcrumb-H1.

### 5.F — Anti-régression valeurs

`grep -E "font-size:\s*([0-9]|10)px" app/ components/` retourne
uniquement les pages legacy (post-creator/moodboard/reviews) non
touchées par ce sprint. Notées en dette technique.

### 5.G — Animations

Règle globale `@media (prefers-reduced-motion: reduce)` ajoutée
dans `app/globals.css` : annule animations + transitions partout
(`animation-duration: 0.01ms`, `transition-duration: 0.01ms`,
`scroll-behavior: auto`). Plus de risque qu'un composant oublie
de respecter la préférence système.

### 5.H — Liquid Glass 3 niveaux

Documenté en en-tête de `styles/liquid-glass.css` :
- Niveau 1 (fond) : gradient + halos, pas de blur.
- Niveau 2 (cards, rangs) : `.glass-thin` (existant) + `.cfs-card`
  (nouveau), background 0.65-0.72, blur 12-20, saturate 160-180.
- Niveau 3 (sheets, menus) : `.glass-thick` (existant) + style inline
  du menu avatar (Patch 1), background 0.88-0.92, blur 20-50, saturate 180.

Règle absolue : jamais niveau 2 sur niveau 2.

## Gate — vérifications

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `eslint --quiet` | 0 erreur |
| 3 | `next build` | succès |
| 4 | Anti-régression `#1F4937` | 0 ajout vs sprint-36-b-3 |
| 5 | Vocabulaire interdit | seul hit = "MaMarqueDashboard" (nom de composant React, pas label UI) |
| 6 | Emoji ajouté | 0 (le `✓` résiduel de RessourcesPreview ligne 157 reste hérité du sprint 36-b-2) |
| 7 | Working tree | clean après commit |
| 8 | Push / tag | aucun |
| 9 | Nouvelle route / migration DB | aucune |
| 10 | Skill files | non touchés |

## Dette technique reportée

- Pages legacy non migrées vers les utilitaires `.cfs-*` :
  post-creator, moodboard, reviews, variations, parametres,
  compte/ma-marque, compte/parametres. À traiter en Sprint 36.C
  une fois la validation visuelle obtenue (les patches critiques
  étaient prioritaires).
- Composants legacy ma-marque (PiliersBloc/ObjectifsBloc/etc.,
  MaMarqueFields, Timeline, HeroSemaine) toujours non supprimés.
  Dette héritée du sprint 36-b-3, à nettoyer après validation Lead.
- `✓` unicode dans `RessourcesPreview` (sprint 36-b-2, hors scope).
- `/aujourd-hui` non créé — le breadcrumb pointe en fallback sur
  `/programme`. À basculer quand la home arrive.

## Action Lead à l'arrivée

1. Validation visuelle des 5 patches en local ou preview Vercel.
2. Si OK : push de `sprint-36-b-4` sur origin, merge sur main,
   tag `v1.6.0` (Lead seul).
3. La migration 009 et le bucket Storage du sprint précédent
   restent en attente d'application si pas encore fait.

Filet de sécurité : `git checkout main` revient à v1.5.0 en < 1 s.
