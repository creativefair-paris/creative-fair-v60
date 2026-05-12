# Sprint 36.B.3 — Décisions architecturales et journal de bord

Branche `sprint-36-b-3` (basée sur `sprint-36-b-2` HEAD `94825b4`).
3 commits sur la branche (LOT 1+2 fusionnés, LOT 3 séparé).
État final : build OK, tsc OK, lint OK, working tree clean.
**Aucun push, aucun tag.** Validation Lead obligatoire.

## Cadre doctrinal respecté

- Palette : `#007AFF` + lilas + indigo + orange + pastels doux. Aucun
  nouveau `#1F4937` introduit. Pastels par défaut (Sable `#E8DDD0`,
  Brume `#C9D4DD`, Ardoise `#B5B2C7`) hérités du brand_book si dispo.
- Anti-gamification : aucun pourcentage chiffré global, aucun badge,
  aucun streak. Compteur lisible "N/14" admis (pas une jauge).
- Voix : tutoiement partenaire complice. Aucune exclamation. Aucun
  "Hello [prénom]". Aucun emoji introduit.
- Pas de `window.confirm()`. Sheets bottom Apple-grade partout, y
  compris la confirmation de régénération des piliers.
- Liquid Glass : 3 depth levels (`glass-thin`, `glass-regular`,
  `glass-thick`), backdrop-filter présent. `prefers-reduced-motion`
  respecté dans SheetMaMarque.
- Jamais "IA" — toujours "Creative Fair".

## LOT 1+2 — Refactor Ma Marque (commit `8e18501`)

### Données

- `supabase/migrations/009_brand_completeness.sql` :
  - 5 colonnes brands : `cible` TEXT, `univers_refuse` TEXT,
    `benchmarks` JSONB, `canaux` JSONB, `brand_book` JSONB. Toutes avec
    DEFAULT — rétro-compatible avec le code sur `main`.
  - Table `brand_archives` (id, tenant_id, brand_id, type, titre,
    description, url, fichier_path, tags, timestamps).
  - RLS via `public.user_tenant_id()` (helper existant). Le spec proposait
    une jointure sur `user_tenants` qui n'existe pas dans ce schéma — voir
    `abort-log.md`.
  - Indexes GIN sur brand_id et tenant_id.
- Storage `brand-archives` : à créer manuellement par le Lead (procédure
  dans `migrations.md`). Privé, 50 Mo max, MIME whitelist, path pattern
  `{tenant_id}/{brand_id}/{dossier}/{filename}`.

### Types (`types/ma-marque.ts`)

Nouveaux : `Benchmark`, `Canaux` + `CanalId` + `CanalConfig` + helpers
`canauxNormaliser`/`canauxActifs`/`canauxEstVide`, `BrandBook` +
`PaletteCouleur` + helpers `brandBookNormaliser`/`brandBookEstVide`,
`BrandArchive` + `ArchiveType`, `PASTELS_DEFAUT`.

Extensions : `MomentBusiness` reçoit 4 champs optionnels (`importance`,
`pilier_id`, `visibilite`, `notes`) — stockés dans le même JSONB,
rétro-compatibles avec les moments préexistants.

### Logique de complétude (`lib/ma-marque/completude.ts`)

`BrandSnapshot14` regroupe les 14 blocs. `etatDuBloc` calcule
`empty/partial/complete` par bloc selon des règles claires (par ex.
piliers : 0 = empty, 1-2 = partial, 3 = complete ; canaux : 0 actifs =
empty, 1 actif = partial, ≥2 = complete).

`getPhrase14` rend une phrase contextuelle calibrée :
- 0/14 : "Ta marque attend ses premières fondations."
- 1-4/14 : "Bon début. N fondations posées sur 14."
- 5-9/14 : "N fondations posées sur 14. Trois prioritaires pour aller plus loin."
- 10-13/14 : "N sur 14. Encore un effort pour boucler la marque."
- 14/14 : "Ta marque est complète. Creative Fair peut tirer le meilleur."

3 blocs marqués prioritaires (point lilas 6 px) : `cible`,
`univers-refuse`, `brand-book`.

### Composants atomiques

- `MarqueRow` : rang 64 px desktop / 56 px mobile, label + summary
  tronqué + chevron iOS, hairline 1 px en bas (sauf dernier),
  hover background blanc 6 %, touch target ≥ 44 px, point lilas si
  priority.
- `MarqueGroup` : titre small caps 11 px + container Liquid Glass
  arrondi 16 px qui contient les rangs et leur passe `isLast` auto.
- `EtatMarque` : phrase contextuelle 16 px gris foncé, sans CTA.
- `SheetMaMarque` : wrapper unifié plein écran. Header avec breadcrumb
  "Ma Marque › <title>" + H1 (matche le label rang) + croix.
  Footer fixe avec "Retour à Ma Marque" et "Continuer vers <suivant>"
  (ou "Terminé" sur le dernier bloc) — ordre canonique des 14 blocs.
  Layout `split` (40/60) ou `centered` (680 px max). Viewport ≥ 1200 px
  requis, fallback message sobre sinon.
- `SheetTexteSimple` : factorise les 4 sheets Nom / Secteur / Voix /
  Singularité — single field + persistance débouncée 500 ms.

### 6 nouvelles sheets

- `SheetCible` (Split Brief) : textarea libre 8 lignes + preview "Pour qui
  parles-tu".
- `SheetUniversRefuse` : textarea 6 lignes + preview "Refus assumés".
- `SheetBenchmarks` : 3 slots max (nom + raison ≤ 200 char) + preview
  liste verticale "Niveau d'exigence".
- `SheetCanaux` : 4 lignes (LinkedIn, Newsletter, Site, GMB), toggle iOS
  + champ URL si actif. Preview "Canaux activés" + mention en bas des
  refus assumés V1 (TikTok / X / YouTube / Facebook).
- `SheetBrandBook` : 5 sections (palette ≤ 6 couleurs avec colorpicker,
  typo principale + secondaire, logo, dos ≤ 6, donts ≤ 6). Preview
  "Charte visuelle" sous forme de fiche.
- `SheetArchives` : formulaire "Ajouter un document" radio Texte/PDF/
  Image/Vidéo/Lien + titre + description + upload + tags. Liste des
  archives existantes avec icône type + suppression. Preview compteur
  global + répartition par type + derniers ajouts.

### Endpoints API

- POST `/api/brand/upload` : multipart, valide MIME + taille (50 Mo),
  upload Storage admin avec path tenant/brand/dossier, retourne `{path}`.
- GET/POST `/api/brand/archives` : liste / crée. Auth + tenant + brand
  vérifiés serveur, RLS bypass via admin pour Insert.
- PATCH/DELETE `/api/brand/archives/[id]` : update partial / supprime
  + cleanup Storage best-effort.
- PATCH `/api/brand/update` étendu : accepte les 7 nouveaux champs
  (cible, univers_refuse, benchmarks, canaux, brand_book + déjà existants)
  avec validators stricts (hex regex pour palette, whitelist MIME,
  longueurs capées, types whitelist pour archives).

### Page (`app/(ma-marque)/ma-marque/page.tsx`)

Server Component. Sélectionne tous les champs en un select. Lit aussi
`brand_archives` via admin (RLS gérée serveur, le user n'a pas besoin
d'INSERT/SELECT directement). Construit `BrandSnapshot14`. Délègue tout
au client `MaMarqueDashboard`. max-width 720 px (lecture iOS Settings).

### Patches LOT 2

- **Piliers** :
  - Couleurs injectées via prop dans `PiliersContext` et `PiliersPreview`
    (avec fallback signature legacy). `PiliersSheet` calcule la palette
    héritée du brand_book ou pastels.
  - Preview dédoublonnée : la légende devient pastille + titre + %,
    plus de description répétée à droite.
- **Calendrier** :
  - Bug d'auto-insertion fixé : clic sur piste = `setTitre + setType`
    uniquement, plus de `onAdd({date_debut: today})`. Texte
    d'information : "Une piste remplit le formulaire ci-dessous. Tu
    valides toi-même avec Ajouter." Le bouton de piste affiche
    "Pré-remplir" au lieu de "+".
  - Dates "Du __ au __" sur une ligne via grid `auto 1fr auto 1fr`.
  - Accordéon `<details>` "Détails" fermé par défaut. Importance (chips
    Mineur/Structurant/Majeur), pilier associé (dropdown des piliers de
    la marque), visibilité (Public/Confidentiel), notes éditoriales
    textarea 4 lignes. Champs optionnels, stockés dans le JSONB.
- **Ressources** :
  - Phrase causale 14 px sous le hero : "Ces choix conditionnent ce
    que Creative Fair te proposera. Si tu n'as pas de vidéo, le
    programme n'en demandera pas."
  - 3 chips de profils figés (Léger / Régulier / Soutenu) appliquant
    un preset complet en un clic.
  - La section "Trois profils possibles" du Context existant est
    masquée via une nouvelle prop `hidePropositions` (évite la
    redondance avec la rangée de chips au-dessus).

### Sheets wrappers

`PiliersSheet`, `ObjectifsSheet`, `CalendrierBusinessSheet`,
`RessourcesSheet` : 4 nouveaux composants qui reproduisent la logique
des Blocs existants (state, fetch propositions silent swap, persistance
débouncée, handlers add/remove/move/update) à l'intérieur de
`SheetMaMarque`, sans tile cliquable (la tile est désormais `MarqueRow`).
Les anciens Blocs (`CalendrierBusinessBloc`, `ObjectifsBloc`,
`RessourcesBloc`, `PiliersBloc`) restent en tree (non importés par
la page) — préservés le temps de la validation Lead.

## LOT 3 — Refactor /programme (commit `08c1576`)

### Pattern Split Brief 40/60

- Hero gauche (40 %) : phrase intro 15 px + H1 arc narratif 30 px +
  chips piliers actifs + sous-titre "Semaine N — pilier dominant : <nom>"
  (ou "équilibre entre les piliers" si égalité ou 0 post) + 2 actions
  rapides (Voir un post / Enrichir ma marque).
- Calendrier droit (60 %) : CalendarToggle + VueSemaine ou VueMois +
  PostDetailSheet (composants existants, réutilisés tels quels).

### Hiérarchie visuelle pilier dominant

Aucun pourcentage. La chip du pilier dominant est rendue à `font-weight:
600` et background `rgba(255,255,255,0.9)` (vs 0.55 pour les autres).
Différence douce, lisible, anti-gamification.

### Couleurs

Héritées du `brand_book.palette` si ≥ 3 couleurs, sinon `PASTELS_DEFAUT`.
Cohérent avec les couleurs de piliers dans Ma Marque.

### Densité réduite

`min-height: 110px` sur `.cfs-mini-post--semaine` (vs hauteur ouverte
~80 px avant). `gap: 12px` entre les cards (vs 4 px). Hover : `scale(1.02)`
+ box-shadow douce. Padding interne 14 px. Layout `justify-content: space-between`
pour aérer le contenu (heure / titre / type).

### Action "Voir un post"

Au lieu d'un anchor scroll vers `#timeline-start`, ouvre directement
`PostDetailSheet` sur le premier post de la fenêtre semaine (ou de la
liste si aucun dans la fenêtre). Plus utile, plus immédiat.

### Helper `lib/programme/dominance.ts`

- `pilierDominantSemaine(posts, piliers, fenêtre)` : compte par pilier
  dans la fenêtre, retourne le plus représenté ou `null` si égalité
  ou 0 post.
- `numeroSemaineISO(date)` : numéro de semaine ISO 8601 (1-53).

### Responsive

Sous 1200 px : `grid-template-columns: 1fr` → Hero au-dessus, calendrier
en dessous. Pas de mode "mobile cassé" — chaque colonne devient pleine
largeur.

## Gate — vérifications post-vol

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `eslint --quiet` | 0 erreur |
| 3 | `next build` | succès, toutes routes générées (4 nouvelles : /api/brand/upload, /api/brand/archives, /api/brand/archives/[id], extension /api/brand/update) |
| 4 | Aucun nouveau `#1F4937` introduit | 0 occurrence dans le diff vs main |
| 5 | Vocabulaire interdit (growth/boost/viral/dashboard/workflow/funnel/streak/badge) | seules les mentions sont dans des **commentaires interdisant** ces mots, jamais dans des labels utilisateur |
| 6 | Aucun emoji introduit | 0 nouvel emoji dans le diff vs main (le `✓` résiduel dans `RessourcesPreview` provient du commit 36-b-2 `49c41a4`, hors scope 36.B.3) |
| 7 | Working tree | clean |
| 8 | Branche push | **non poussée** (interdiction stricte respectée) |
| 9 | Tag git | **aucun tag créé** (interdiction stricte respectée) |
| 10 | Migration 009 | écrite, **pas appliquée** sur production (procédure Lead 30 s dans `migrations.md`) |
| 11 | Bucket Storage `brand-archives` | **non créé** (procédure Lead dans `migrations.md`) |
| 12 | Skill files (`.claude/skills/*`) | **non touchés** |

## Dette technique

- **Pas encore d'éditeur de pilier individuel** (sous-écran Split Brief
  par pilier) — reporté Sprint 36.C comme prévu.
- **Pas de back-fill des moments calendrier business existants** avec les
  nouveaux champs (importance / pilier_id / visibilité / notes). Tous
  optionnels et lus avec `?? null` côté front → pas de crash, juste
  pas de valeur tant que le moment n'a pas été ré-édité.
- **Le `✓` unicode dans `RessourcesPreview` (ligne 157)** est une dette
  héritée du commit `49c41a4` (Sprint 36.B.2). Cohérent avec la
  consigne de ne pas toucher au `#1F4937` résiduel — dette à traiter
  en sprint séparé.
- **Composants legacy non supprimés** : `PiliersBloc`, `ObjectifsBloc`,
  `CalendrierBusinessBloc`, `RessourcesBloc`, `MaMarqueFields`,
  `Timeline`, `HeroSemaine`. Préservés en tree mais non importés
  par les pages refondues. À nettoyer en Sprint 36.C une fois la
  validation visuelle Lead obtenue (cf. abort A5 : pas de suppression
  > 100 lignes sans remplacement clair).

## Critères de succès (Floriane)

1. **Ouvre `/ma-marque`** — voit la phrase d'état + 4 groupes + 14 rangs
   denses. Pattern iOS Settings reconnu en < 3 s. ✅
2. **Comprend les 14 blocs** — chaque label est en français humain, la
   colonne droite (summary) montre l'état (Non renseigné / valeur
   actuelle tronquée), le point lilas signale les 3 prioritaires
   (cible, univers refusé, brand book). ✅
3. **Clic sur un rang** — sheet plein écran s'ouvre avec breadcrumb
   "Ma Marque › <bloc>", titre H1 qui matche le label, layout adapté
   (Split Brief 40/60 ou centré selon le bloc). ✅
4. **Édition / persistance** — chaque champ persiste en débouncé
   (300-500 ms). Footer permet de continuer vers le bloc suivant
   sans repasser par la page. ✅
5. **Upload charte graphique** — sheet "Brand book et charte visuelle"
   permet palette + typo + logo + dos/donts via Storage bucket. ✅
6. **Upload archives** — sheet "Archives et uploads" gère 5 types
   (texte, pdf, image, vidéo, lien) avec tags et description. ✅

## Action Lead à l'arrivée

1. Validation visuelle de l'ensemble (Ma Marque + Programme) en local
   ou via preview Vercel (si push après validation).
2. Application de la migration 009 sur Supabase production (procédure
   30 s dans `migrations.md`).
3. Création manuelle du bucket Storage `brand-archives` privé +
   policies (SQL dans `migrations.md`).
4. Push de `sprint-36-b-3` sur origin si validation OK.
5. Merge sur main + tag `v1.6.0` (Lead seul).

Filet de sécurité : `git checkout main` revient à v1.5.0 (8cba9ad) en
< 1 s. La migration 009 est compatible avec le code de `main` (colonnes
optionnelles avec DEFAULT) — pas besoin de rollback DB si abandon.
