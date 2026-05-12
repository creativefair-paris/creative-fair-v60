# Sprint 36.B.2 — Ma Marque tableau de bord en Split Brief

**Branche :** `sprint-36-b-2`
**État final :** working tree clean, 7 commits au-dessus de la base.
**Date :** 12 mai 2026.

## Intention

Faire de la page Ma Marque le tableau de bord central de la marque,
auquel l'utilisateur revient pour ajuster les 4 blocs qui pilotent
ensuite tout le programme : ses piliers narratifs, le cap de la
saison, le calendrier business, ses ressources de production.

Chaque bloc s'ouvre en plein écran Split Brief 40/60, calque la
doctrine Pilier 1 (artisanat) et Pilier 4 (storytelling), et propose
trois angles personnalisés par Claude — affichés immédiatement en
fallback générique et swappés en silence si l'API répond avant le clic.

Pas de score numérique, pas de "X/4". Une seule phrase contextuelle
en tête de page raconte l'état réel.

## Commits

| # | SHA | Chantier |
|---|---|---|
| 1 | `9158f2f` | Migration 008 + endpoint propositions IA + types Ma Marque |
| 2 | `844336e` | Bloc Calendrier business + Split Brief 40/60 |
| 3 | `1ec6016` | Bloc Objectifs + Split Brief avec reorder ↑↓ |
| 4 | `49c41a4` | Bloc Ressources + Split Brief capacités hebdomadaires |
| 5 | `22481ef` | Bloc Piliers narratifs + endpoint régénération Claude Opus |
| 6 | `180f8ac` | Module score — état marque + phrase contextuelle dynamique |
| 7 | `362cc56` | Refonte page en tableau de bord 4 blocs Split Brief |

## Livraisons

### Données

- `supabase/migrations/008_brands_enrichissement.sql`
  — ajoute 3 colonnes JSONB sur `brands` :
  `calendrier_business`, `objectifs`, `ressources`.
  Indexes GIN pour requêtes futures. Application via Supabase Studio
  documentée dans `audits/SPRINT_36B2_MIGRATIONS.md`.
- `types/ma-marque.ts` — source unique de vérité : `MomentBusiness`,
  `Objectif`, `Ressources`, `PilierEditable`, propositions IA,
  helpers `RESSOURCES_VIDES` / `ressourcesEstVide`.

### Endpoints

- `POST /api/ma-marque/propositions`
  — 3 propositions par bloc (`calendrier` | `objectifs` | `ressources`),
  cascade Opus 4-5 → Opus 4-1, timeout 15 s.
  Doctrine swap silencieux Q2 : ne renvoie jamais 5xx, retourne
  `{ propositions: [], error }` en 200 pour que le frontend garde
  son fallback générique sans état d'erreur visible.
- `POST /api/ma-marque/regenerer-piliers`
  — recalcule 3 nouveaux piliers narratifs depuis la marque actuelle,
  cascade Opus 4-5 → Opus 4-1 → Sonnet 4-5 (last chance), timeout 30 s.
  Persiste via admin client après auth + tenant + brand vérifiés.
- `PATCH /api/brand/update` — étendu pour accepter les 4 champs JSONB
  en plus des 4 champs texte. Validateurs stricts par catégorie
  (longueurs, types whitelist, ratios bornés).

### Prompts IA

- `lib/ma-marque/prompts.ts` — 3 SYSTEM_PROMPTS spécialisés propositions
  + 1 SYSTEM_PROMPT régénération piliers. JSON strict imposé, vocabulaire
  marketing bani (growth, boost, viral, scale, hack, KPI, funnel,
  dashboard, workflow).

### Score / narration

- `lib/ma-marque/score.ts` — `EtatMarque` (initial / demarrage /
  consolide / complet) et `getPhraseContextuelle(snapshot)`. Pas de
  pourcentage exposé. Quatre phrases calibrées sur le nombre de
  blocs remplis, avec suggestion du prochain bloc à poser dans
  l'ordre `piliers → objectifs → calendrier → ressources`.

### Composants Split Brief (4 blocs × 3 fichiers)

Chaque bloc suit le même contrat : tile cliquable → Split Brief
plein écran 40/60 avec `intro`, `context` (édition à gauche) et
`preview` (visualisation à droite).

- `components/ma-marque/calendrier/` — Bloc + Context + Preview.
  Preview = grille 12 mois 4×3 avec badges colorés par type (lancement
  bleu, événement orange, opération violet, saison vert).
  Context = 3 propositions cliquables + formulaire (titre / type / dates)
  + liste éditable avec suppression. Max 60 moments.
- `components/ma-marque/objectifs/` — Bloc + Context + Preview.
  Preview = card "Cap de saison" avec phrase narrative générée selon
  le nombre d'objectifs (vide / 1 / 2 / 3 / 4+).
  Context = 3 propositions + form (label / priorité 1-3) + liste avec
  réordonnancement ↑↓ (swap dans l'array). Max 12 objectifs.
- `components/ma-marque/ressources/` — Bloc + Context + Preview.
  Pattern objet unique (pas array). Preview = profil de production
  narratif. Context = SegmentedControl 4 niveaux (aucune /
  occasionnelle / regulière / soutenue) pour photo et vidéo, toggles
  iOS-style pour terrain / studio. Persistance débouncée 300 ms pour
  absorber les toggles rapides.
- `components/ma-marque/piliers/` — Bloc + Context + Preview.
  Preview = SVG disc donut 320×320 avec arcs polaires proportionnels
  au ratio_suggere. Context = 3 cards éditables (nom / description
  textarea / range slider 0-1) + bouton "Régénérer les 3 piliers"
  avec confirmation Sheet bottom (jamais window.confirm). Persistance
  débouncée 500 ms.

### Page

- `app/(ma-marque)/ma-marque/page.tsx` — refonte complète. Server
  Component qui lit les 4 champs JSONB en un seul select, construit
  le `BrandSnapshot`, calcule la phrase contextuelle, et affiche :
  - Phrase contextuelle en tête (19 px, secondary-label).
  - Champs texte (Nom / Secteur / Voix / Singularité) — inchangés.
  - Grille 2×2 auto-fit (`minmax(420px, 1fr)`) des 4 blocs Split Brief.
  - max-width élargi à 1080 pour accueillir la grille.
  - Section read-only piliers supprimée — remplacée par `PiliersBloc`
    éditable + régénération.

## Doctrine respectée

- **Pilier 4** — Vocabulaire humain partout. Zéro mot interdit dans
  `components/ma-marque/` ni `lib/ma-marque/` côté labels (seules les
  listes d'interdits dans les SYSTEM_PROMPTS contiennent les mots,
  par construction).
- **Pilier 6** — Aucun "bientôt disponible" visible. Si une IA
  échoue, on garde le fallback générique. Si la migration n'est pas
  appliquée, le composant lit `[]` et propose à l'utilisateur de
  commencer.
- **Liquid Glass** — 28 occurrences `glass-thin` / `glass-regular`
  / `glass-thick` couvrent les 14 fichiers de composants.
- **6 halos** identiques au reste de l'app — `bg-halo bg-halo-1`
  à `bg-halo-6`.

## Gate final — vérifications

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `eslint --quiet` | 0 erreur |
| 3 | `next build` | succès, toutes routes générées |
| 4 | `grep #1F4937` dans le code modifié | 0 occurrence introduite (les 2 résidus dans `globals.css` lignes 873 et 948 concernent `cfs-vue-semaine` et `cfs-vue-mois`, hors scope Ma Marque) |
| 5 | `grep serif\|Georgia` dans `app/(ma-marque)` et `components/ma-marque` | 0 occurrence |
| 6 | `grep bg-halo` dans `page.tsx` | 6 halos |
| 7 | `grep window.confirm` dans `components/ma-marque` | 0 occurrence (seul match = commentaire `// pas de window.confirm`) |
| 8 | Vocabulaire interdit (dashboard / workflow / pipeline / boost / viral / growth / KPI / funnel) | 0 occurrence dans labels — seuls les SYSTEM_PROMPTS les listent comme interdits |
| 9 | Routes nouvelles | `app/api/ma-marque/propositions/route.ts` + `app/api/ma-marque/regenerer-piliers/route.ts` présentes |
| 10 | Migration | `supabase/migrations/008_brands_enrichissement.sql` commitée |
| 11 | Liquid Glass | 28 occurrences sur 14 fichiers |
| 12 | Working tree | clean |

## Action Lead à l'arrivée

1. **Appliquer la migration 008** via Supabase Studio (instructions
   prêtes dans `audits/SPRINT_36B2_MIGRATIONS.md`).
2. Recharger `/ma-marque` — la page doit afficher la phrase
   contextuelle initiale et les 4 tuiles vides cliquables.
3. Cliquer chaque tuile pour valider l'ouverture en Split Brief 40/60,
   l'apparition des 3 propositions IA (génériques en fallback, swap si
   Claude répond), l'édition et la persistance.

## Note de bord

Aucune régression introduite. Toutes les conventions héritées
(halos, Liquid Glass, navigation, palette) sont préservées. La
phrase contextuelle est volontairement humaine : "Pose d'abord les
bases de ta marque. Sans repères, ton programme tire à l'aveugle."
plutôt qu'un compteur 0/4.

Branche `sprint-36-b-2` prête pour push.
