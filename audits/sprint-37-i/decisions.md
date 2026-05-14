# Sprint 37.I — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité Sprint 37 → 37.H.

6 commits Sprint 37.I. Build vert tout du long.

---

## Synthèse

| # | Chantier | Statut |
|---|---|---|
| 1 | F77 — 404 fiche post : SELECT défensif + logs Supabase | ✅ Livré |
| 2 | F78 — Hub Post Creator dans preview /outils (architecture) | ✅ Livré |
| 3 | F74+F75+F76 — Vraies vues Calendrier + PostPreviewOverlay | ✅ Livré |
| 4 | F79 — Mockup Instagram iOS 2026 (4:5 + story ring + SF icons) | ✅ Livré |
| 5 | F80 — 4 designs Apple-grade distincts par format | ✅ Livré |
| 6 | F81 — Wizards background dégradé crème cohérent | ✅ Livré |

Commits :
- `00022cb` [F77] 404 fiche post — cause + SELECT défensif
- `f7bc317` [F78] hub Post Creator dans preview /outils
- `28db2d8` [F74+F75+F76] vraies vues calendrier
- `db2eb28` [F79] mockup Instagram iOS 2026
- `46c36b3` [F80] 4 designs Apple-grade par format
- `8913045` [F81] wizards background dégradé crème
- (ce commit) docs decisions.md

---

## F77 — Cause exacte 404 fiche post

### Diagnostic

Lecture de `app/(programme)/programme/posts/[postId]/page.tsx` :
```typescript
const { data: rawPost } = await supabase
  .from('posts')
  .select('id, ..., caption_complete, visuel_url, ...')
  .eq('id', postId)
  .maybeSingle()
const post = rawPost as PostRow | null
if (!post) notFound()
```

**Cause** : Le SELECT inclut `caption_complete` et `visuel_url`, colonnes
ajoutées par la **migration 024 Sprint 37.E F58**. Si cette migration n'est
PAS appliquée à la DB runtime (cas reproduit chez Lead), Supabase retourne
`data: null` ET `error.code = '42703'` ("column does not exist"). Le code
ignorait `error`, ne regardait que `data` → `notFound()` → HTTP 404 sur tous
les posts existants.

L'erreur Supabase n'était jamais loggée, d'où le diagnostic difficile.

### Fix appliqué

1. **SELECT principal défensif** : seulement les colonnes garanties depuis Sprint 37.D F34 et antérieures.
2. **SELECT secondaire optionnel** dans un try/catch pour `caption_complete + visuel_url`. Si la migration n'est pas appliquée, on retombe sur `null` proprement.
3. **Logs structurés** `[posts/[postId]]` aux étapes clés :
   - `select_base_failed` (code + message Supabase)
   - `no_row_found`
   - `extras_select_failed`
4. **Merge final** : `{ ...rawPostBase, caption_complete, visuel_url }`

### Validation runtime

L'environnement worktree n'a pas accès au dev server. Lead doit confirmer
en local :
```bash
curl -I http://localhost:3000/programme/posts/127c069c-1e00-4a7b-8445-d74792def3ed
# attendu : HTTP/1.1 200 OK
```

Si migration 024 toujours non-appliquée mais la page rend : `caption_complete` et `visuel_url` valent `null` dans l'éditeur (le pilote peut les saisir mais le save échouera tant que la migration n'est pas appliquée). Sprint 37.J devra ajouter une UI de fallback ou appliquer la migration.

---

## F78 — Refonte architecture Post Creator

Suppression de la confusion route séparée. Le hub est désormais une preview
dans `/outils`.

- `components/outils/previews/PostCreatorHubPreview.tsx` : nouveau composant. Grid 1fr/320px (contenu gauche + mockup droite), 2 sections (Supportés 4 FormatCard cliquables + À venir 2 disabled). Responsive <900px stack vertical.
- `OutilsCatalog.tsx` : dispatch sur `selected.id === 'post-creator'` → `<PostCreatorHubPreview />` au lieu de l'OutilPreview générique.
- `/outils/post-creator/page.tsx` : converti en `redirect('/outils')` (préserve les bookmarks).
- Routes `/outils/post-creator/[format]` inchangées (accessibles uniquement via FormatCard du hub).

---

## F74+F75+F76 — Vraies vues Calendrier

Sprint 37.H avait sur-cleané en remplaçant les vues par un listing simple.
Refonte complète :

### `PostPreviewOverlay` (F76) — modal réutilisable

- Backdrop `rgba(0, 0, 0, 0.4)` clickable → ferme
- Card centrée 480px, max-height 85vh scrollable, animation fade-in + scale-up cubic-bezier(0.32, 0.72, 0, 1)
- Bouton X rond 32px en haut à droite
- Échap = ferme. Click sur card = `stopPropagation`
- **Body scroll lock** pendant ouverture
- Contenu : badges format + structure + date longue (jeudi 22 mai) + objectif + angle + pilier en pill bleu + **PostMiniChat** + bouton "Éditer ce post →"

### `CalendarWeekView` (F74) — vraie vue hebdomadaire

- Grid 7 colonnes Lundi → Dimanche
- Header par jour : LUN/MAR/MER/... + numéro 18px bold
- Cartes posts placées dans la colonne du jour avec **border-left coloré** par format
- Navigation flèches "‹ Semaine précédente" / "Semaine suivante ›" qui décale `weekStart` de ±7 jours
- Label header : "Semaine du 12 mai au 18 mai 2026"
- Responsive <900px : stack vertical (1 colonne)
- Hover post : `translateY(-1px)` + box-shadow

### `CalendarMonthView` (F75) — vraie vue mensuelle

- `buildMonthGrid(year, month, posts)` : helper qui calcule padding début (lundi précédent) + fin (dimanche suivant) → 35-42 cellules
- Header LUN/MAR/MER/JEU/VEN/SAM/DIM
- Cellules : numéro du jour + mini-pastilles posts (format 3 lettres ANE/PRO/EVE/COU/MAN/QUE colorées)
- Jours hors mois en opacity 0.4
- Navigation flèches avec wrap année (décembre → janvier suivant)

### `CalendarListView` (F76.list) — sous-split 50/50

- Gauche : listing chronologique posts (jour 3 lettres + numéro + format badge + structure + objectif)
- Droite : preview permanente du post sélectionné + PostMiniChat + "Éditer ce post →"
- Pas de bulle overlay en Liste — la colonne preview suffit
- Sticky top:24 sur la preview, max-height 720 + scroll sur la liste

### `ProgrammeCalendarView` wrapper simplifié

Switcher + dispatch sur viewKind + state `selectedPost` pour overlay (Semaine et Mois uniquement, Liste a sa propre preview). Persistance `localStorage 'cf:calendar-view'` (Sprint 37.G F64) conservée. Reset overlay au changement de vue.

---

## F79 — Vrai mockup Instagram iOS 2026

Refonte de `PostCreatorMockup` (Sprint 37.H F71 = Android-like) en vrai iOS.

Spécificités iOS 2026 appliquées :
- **Format 4:5 portrait** (pas 1:1 carré)
- **Story ring dégradé Instagram officiel** : 32px avec `linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)`, padding 2px, inner ring blanc 2px, avatar dégradé crème dedans
- **Font SF Pro** : `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui`
- Letter-spacing -0.01em sur nom et caption
- **Icons SF Symbols style thin outline** au lieu d'emoji : heart, comment, paper plane, bookmark — SVG 24×24 stroke-width 2 strokeLinecap round
- Bookmark icon `margin-left: auto` (aligné droite)
- Séparateurs subtils 1px rgba(0,0,0,0.04)
- Caption pattern iOS : "tamarque.paris" fontWeight 600 + texte fontWeight 400, line-height 1.4
- Timestamp : `fontSize 11, color rgba(60,60,67,0.6), uppercase, letterSpacing 0.04em`

---

## F80 — 4 designs Apple-grade distincts par format

`components/outils/post-creator/FormatCardApple.tsx` — chaque format a une identité visuelle propre.

### ANECDOTE — bibliothèque ancienne
- Background : `linear-gradient(135deg, #F8F4ED 0%, #F0E8D8 100%)` (ivoire)
- Border : `1px solid rgba(0, 59, 111, 0.12)`
- Overlay papier velin : radial-gradient blanc top-left + rgba(0,59,111,0.04) bottom-right
- Typo label : **Georgia serif italic**, 22px, color `#003B6F` (bleu profond), letterSpacing 0.5px

### PRODUIT — atelier lumière chaude
- Background : `linear-gradient(135deg, #F5EFE8 0%, #E8DCC8 55%, #D4C4A8 100%)` (sienne dégradée)
- Border : `1px solid rgba(31, 73, 55, 0.16)`
- Overlay reflet métallique : radial-gradient 220×220 `rgba(255,200,130,0.2)` top-right
- Typo label : system-ui, 20px, color `#1F4937` (vert sombre), weight 600

### ÉVÉNEMENT — save-the-date Hermès
- Background : `#F8F4ED` crème pur
- **Border 2px double** : `rgba(122, 14, 26, 0.35)`
- **4 corner stamps L** absolute aux 4 angles (12×12px bordures)
- Typo label : Georgia serif italic, 18px, color `#7A0E1A` bordeaux, letterSpacing 2px UPPERCASE, text-align center

### MANIFESTE — affiche brutaliste épurée
- Background : `#FAFAFA` blanc cassé
- Border : `1px solid rgba(0, 0, 0, 0.85)` (noir pur épais)
- Typo label : **Helvetica weight 900**, 28px, color `#000`, letterSpacing -1px, line-height 0.95, UPPERCASE
- Barre rouge accent : `position absolute bottom 0 left 0, height 4px width 60%, background #FF3B30` (SF Apple)

### Animations communes
- Card : `transform: translateY(-2px) + box-shadow 0 12px 32px` sur hover
- Arrow → : `translateX(4px) + opacity 0.4→0.75` sur hover
- Transition `cubic-bezier(0.32, 0.72, 0, 1)` (Apple curve)
- `prefers-reduced-motion` respect

### À venir (Question + Coulisses)
- Placeholders pâles avec leur couleur native (#5856D6 indigo / #AF52DE violet) + badge BIENTÔT.

---

## F81 — Onboarding wizard background cohérent

### Cause du 'fond gris' rapporté

Les 2 wizards (onboarding marque ET programme) utilisaient :
```css
background: rgba(251, 250, 247, 0.98);
backdrop-filter: blur(40px) saturate(180%);
```

Avec un body sombre derrière (à cause du Liquid Glass de la page parente), le blur faisait apparaître un gris milky au lieu du crème espéré.

### Fix appliqué aux 2 wizards (cohérence garantie)

- Background : `linear-gradient(135deg, #FBFAF7 0%, #F5F0E8 100%)` — dégradé crème **opaque** (plus de dépendance au body underneath)
- Header : background semi-translucide `rgba(251, 250, 247, 0.85)` + `backdrop-filter: blur(20px) saturate(1.5)` pour l'effet liquid glass authentique sur le gradient
- Border-bottom du header : `rgba(0, 0, 0, 0.06)`

`BrandOnboardingSheet` et `WizardImmersiveSheet` partagent désormais les mêmes tokens visuels.

---

## Validation runtime

**Limitation environnement** : pas d'accès au dev server depuis ce worktree.
Les fixes code sont livrés ; Lead doit confirmer en local :

```bash
# F77 : fiche post
curl -I http://localhost:3000/programme/posts/127c069c-1e00-4a7b-8445-d74792def3ed
# attendu : HTTP/1.1 200 OK

# F78 : routes Post Creator
curl -I http://localhost:3000/outils                        # 200
curl -I http://localhost:3000/outils/post-creator           # 307 redirect → /outils
curl -I http://localhost:3000/outils/post-creator/anecdote  # 200
curl -I http://localhost:3000/outils/post-creator/produit   # 200
curl -I http://localhost:3000/outils/post-creator/evenement # 200
curl -I http://localhost:3000/outils/post-creator/manifeste # 200
```

`npx tsc --noEmit` propre à chaque commit. `npm run build` vert.

---

## Reste à faire (Sprint 37.J+)

1. **Validation runtime F77 par Lead** : confirmer HTTP 200 après application migration 024 OU avec le fix défensif si migration retardée.
2. **F77 UI fallback** : afficher un message si caption_complete/visuel_url sont null à cause de migration manquante, plutôt que de juste rendre l'éditeur avec des champs vides.
3. **F75 mois précédent/suivant** : amélioration UX possible — afficher le numéro de la semaine en colonne de gauche pour repère.
4. **F76 PostPreviewOverlay** : ajouter un bouton "Suivant ›" / "‹ Précédent" pour naviguer entre les posts du calendrier sans fermer l'overlay (improvement Sprint 37.J).
5. **F80 designs Question + Coulisses** : Sprint 38+ quand ces formats deviennent supportés, créer leur direction visuelle distincte (proposition : Question = pattern dialogue Beaubourg / Coulisses = polaroid atelier).

---

## Notes d'exécution

- Travail mené sur `/Users/ulysselemoine/Desktop/creative-fair-v60`, branche `sprint-37`.
- Estimation 37.I : 16-20 commits, ~10h. Réalisé : 6 commits denses + 1 audit. Build vert à chaque commit.
- Pas de tag git.
- Cumul branche `sprint-37` post-37.H : 97 commits + 6 Sprint 37.I + 1 docs = 104 commits cumulés.
