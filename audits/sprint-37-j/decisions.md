# Mini-Sprint 37.J express — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité Sprint 37 → 37.I.

3 commits Mini-Sprint 37.J. Build vert tout du long.

---

## Synthèse

| # | Chantier | Statut |
|---|---|---|
| 1 | F82 — FormatCardApple revert vers bouton CTA simple | ✅ Livré |
| 2 | F85 — Dictionnaire i18n FR/EN formats (livré avec F82) | ✅ Livré |
| 3 | F83 — Halos signature injectés dans les 2 wizards | ✅ Livré |
| 4 | F84 — Calendrier Semaine Apple Calendar style + toggle iOS | ✅ Livré |

---

## F82 — Revert FormatCardApple

### Diagnostic

Sprint 37.I F80 avait livré 4 designs visuellement distincts :
- Anecdote bibliothèque ancienne (papier velin + serif italique bleu profond)
- Produit atelier (sienne dégradée + reflet métallique + vert sombre)
- Événement save-the-date Hermès (bordure double + 4 corner stamps)
- Manifeste affiche brutaliste (Helvetica 900 + barre rouge SF)

Direction recalée par Lead : "trop chargées, pas Margiela qu'on imite, c'est Apple".

### Fix appliqué

Pattern unique répété 6 fois (incluant Question + Coulisses) :
- Icône Lucide à gauche dans carré arrondi 36px (background couleur format à **15% opacity uniquement**)
- Label format 15px font-weight 600 SF Pro letter-spacing -0.1px
- Description 13px font-weight 400 gris 55% white-space nowrap
- Flèche → 16px gris à droite (translateX(3px) au hover)
- Card uniforme : `rgba(255,255,255,0.7) + backdrop-filter blur(20px) saturate(1.4) + border 1px rgba(0,0,0,0.06) + border-radius 12px`
- Hover : `translateY(-1px) + background 0.9 + box-shadow 0 4px 12px`
- Disabled : opacity 0.5 + badge "BIENTÔT" au lieu de la flèche

Tous les styles Sprint 37.I F80 (`.format-card-apple--anecdote`, `.fca-anecdote__paper`, `.fca-evt__stamp`, `.fca-manifeste__bar`, etc.) **supprimés**.

---

## F85 — Dictionnaire i18n formats

Livré simultanément à F82 (FormatCardApple en consomme directement).

`lib/i18n/formats.ts` :
- `FormatSlug` type union (6 slugs canoniques inchangés — Anecdote / Produit / Événement / Coulisses / Manifeste / Question)
- `FORMAT_LABELS: Record<FormatSlug, Record<Locale, string>>` avec entrées FR + EN
  - Coulisses → 'Behind the Scenes' au pluriel (terme anglais consacré)
- `FORMAT_DESCRIPTIONS` idem
- `FORMAT_COLORS: Record<FormatSlug, string>` — couleurs SF Apple centralisées (réutilisables partout)
- Helpers `getFormatLabel(format, locale)`, `getFormatDescription`, `getFormatColor`

V1 reste française : tous les composants UI utilisent `.fr`. Préparation Sprint 39+ migration internationale.

---

## F83 — Halos signature wizards

### Cause du fond plat sur l'onboarding

`styles/liquid-glass.css` définit `.bg-halo` + 6 variantes `.bg-halo-1..6` :
- `position: fixed`, `z-index: 0`
- 6 halos radiaux (bleu primary, lilas, indigo, orange chaud)
- Animations `drift` 18-30s en boucle (respect `prefers-reduced-motion`)

Les pages auth (`/programme`, `/ma-marque`, `/outils`, etc.) injectent ces div halos manuellement dans leur layout.

Les 2 wizards (BrandOnboardingSheet + WizardImmersiveSheet) sont en `position: fixed` `inset: 0` `z-index: 1200` avec un background opaque → ils masquaient les halos du layout parent.

Sprint 37.I F81 avait remplacé `rgba+blur` (qui apparaissait gris) par un gradient plat `linear-gradient(135deg, #FBFAF7 0%, #F5F0E8 100%)`. Propre mais sans personnalité.

### Fix appliqué aux 2 wizards (cohérence garantie)

- Background : `#FBFAF7` crème uniforme + `overflow: hidden` pour cropper les halos qui débordent
- 6 `<div className="bg-halo bg-halo-1..6" aria-hidden="true" />` injectés en début de wizard (avant header)
- Les halos restent en `position: fixed` (positionnement viewport) avec leurs animations drift
- `<main>` du wizard reçoit `position: relative + zIndex: 1` pour passer au-dessus des halos (z-index: 0)
- Le `<header>` du wizard avait déjà `position: sticky + zIndex: 2` (au-dessus des halos)

Cohérence visuelle parfaite entre les 2 wizards et toutes les pages auth.

---

## F84 — Calendrier Semaine Apple Calendar style + toggle iOS

### CalendarViewSwitcher

Refonte en vrai Segmented Control Apple iOS :
- Background gris natif `rgba(120, 120, 128, 0.12)` + padding 2px + border-radius 9px
- Options : padding 6×16, font-size 13, weight 500, letter-spacing -0.1px, color rgba(0,0,0,0.85)
- Active : background `#FFFFFF`, color rgba(0,0,0,0.95), font-weight 600, double box-shadow `0 3px 8px + 0 1px 2px`
- Hover non-active : color rgba(0,0,0,0.65)
- Transition `cubic-bezier(0.32, 0.72, 0, 1)` (courbe Apple)

### CalendarWeekView (refonte)

Style Apple Calendar épuré :
- Header centré : bouton `‹` rond 32px + label `Semaine du X au Y AAAA` SF Pro 14px weight 600 + bouton `›`
- Boutons nav : rond, background rgba(255,255,255,0.6) + blur 10px + border subtle, scale 1.05 au hover
- **Grid 7 colonnes transparentes** (background: transparent) → les halos signature passent à travers
- **Lignes fines entre colonnes** : `::before` 1px `rgba(0, 0, 0, 0.05)` (Apple Calendar style)
- Header jour : LUN/MAR/... en 11px uppercase letter-spacing 0.6 color rgba(0,0,0,0.4) + numéro 17px bold rgba(0,0,0,0.85) letter-spacing -0.3
- Cartes posts : **plus d'heure** (juste label format en accent + objectif clamp 2 lignes), border-left 3px color du format, background rgba(255,255,255,0.7) + blur, hover translateY(-1px)
- Lecture des labels via `FORMAT_LABELS[format].fr` (i18n F85)
- Couleurs via `FORMAT_COLORS[format]` (i18n F85)
- Responsive <900px : stack vertical (1 colonne) avec border-bottom entre jours

### CalendarMonthView (minimal F84)

- Cellules `background: transparent` (au lieu de rgba blanc 0.55) pour laisser passer les halos
- Cellules hors-mois : opacity 0.35 + border 0.02 (encore plus subtle)

---

## Vérifications

- `npx tsc --noEmit` propre à chaque commit
- `npm run build` final : vert. Toutes routes intactes.
- Pas de fichier `.env` modifié
- `lib/i18n/formats.ts` exporte `FormatSlug` type + 6 constantes + 3 helpers

---

## Notes

- Travail mené sur `/Users/ulysselemoine/Desktop/creative-fair/creative-fair-v60` (le projet a été déplacé depuis `/Users/ulysselemoine/Desktop/creative-fair-v60` entre 37.I et 37.J).
- Estimation 37.J : 3-4 commits, ~2h. Réalisé : 3 commits denses + 1 audit. Build vert.
- Cumul branche `sprint-37` post-37.I : 104 commits + 3 Sprint 37.J + 1 docs = 108 commits cumulés.
