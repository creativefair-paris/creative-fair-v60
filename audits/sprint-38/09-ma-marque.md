# Page : /ma-marque

## Métadonnées
- Route : `/ma-marque`
- Fichier source : `app/(ma-marque)/ma-marque/page.tsx`
- Composants principaux :
  - `<PageHeader>` (`components/layout/PageHeader.tsx`) — titre "Ma Marque"
  - `<BrandOnboardingHeaderCta>` (`components/onboarding-marque/BrandOnboardingHeaderCta.tsx`) — CTA wizard header
  - `<MaMarqueDashboard>` (`components/ma-marque/MaMarqueDashboard.tsx`) — orchestrateur client, layout 2 colonnes 40/60
  - `<EtatMarque>` (`components/ma-marque/EtatMarque.tsx`) — phrase d'état + `<BarreFondations>`
  - `<MarqueGroup>` + `<MarqueRow>` (`components/ma-marque/MarqueGroup.tsx`, `MarqueRow.tsx`) — pattern iOS Settings
  - `<MarquePreview>` (`components/ma-marque/MarquePreview.tsx`) — édition inline desktop CAS A
  - Sheets thématiques : `<SheetTexteSimple>`, `<SheetCible>`, `<SheetUniversRefuse>`, `<SheetBenchmarks>`, `<SheetCanaux>`, `<SheetBrandBook>`, `<SheetArchives>`, `<CalendrierBusinessSheet>`, `<ObjectifsSheet>`, `<RessourcesSheet>`, `<PiliersSheet>` (anciennes piliers JSONB)
  - **`<PillarsManager>`** (`components/pillars/PillarsManager.tsx`) — bloc Sprint 37.K F89, table `pillars` persistée
  - `<PillarCard>`, `<PillarAddCard>`, `<PillarWizardSheet>`, `<PillarEditSheet>` (`components/pillars/*`)
  - `<BrandOnboardingTrigger>` (`components/onboarding-marque/BrandOnboardingTrigger.tsx`) — deep-link `?onboarding=true`
- Server / Client : Page = Server Component (`export const dynamic = 'force-dynamic'`). Dashboard, PillarsManager = `'use client'`. Server Actions : `getResumableBrandOnboardingSession`, `archivePillar`, `updatePillar`, `generate-pillar-wizard` (Sonnet 4.6 cascade Sonnet 4.5, cf. `app/_actions/generate-pillar-wizard.ts:9, 28`).
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise).

## Lecture rapide
Page de référence de la marque, pattern iOS Settings : 14 rangs cliquables regroupés en 4 sections (Identité / Doctrine éditoriale / Production / Mémoire). Layout 2 colonnes desktop (40% liste / 60% preview édition inline). Mobile : liste seule + sheets. Sprint 37.K F89 a greffé `<PillarsManager>` **en plus** du rang "piliers" existant — coexistence de deux modèles de données (JSONB `brand.piliers_narratifs` historique + table `pillars` persistée). Wizard piliers en 5 questions piloté par Sonnet 4.6.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. Palette v60 respectée : `background: 'var(--color-background)'` (`app/(ma-marque)/ma-marque/page.tsx:171`).
2. Halos statiques 1-6 (`page.tsx:173-178`) — conforme à la règle. Aucune animation.
3. Aucune occurrence `#1F4937` dans `components/ma-marque/`, `components/pillars/`, `app/(ma-marque)/` (grep). Bon respect dépréciation.
4. **`<BarreFondations>`** : barre 6px de progression à 2 segments (complets en `#1C1C1E`, partiels en `rgba(28,28,30,0.4)`) — `components/ma-marque/BarreFondations.tsx:43-58`. Le commentaire ligne 1-5 défend l'anti-gamification ("Pas de pourcentage. Pas de chiffre. Pas d'animation au mount."). Mais c'est **toujours une barre de progression** : signal visuel ambigu. Recalé doctrine Hélène + Hiroshi.
5. `<EtatMarque>` utilise `color: '#1C1C1E'` en dur (`components/ma-marque/EtatMarque.tsx:31`) — devrait passer par `var(--color-label)`.
6. `<PillarCard>` Liquid Glass : `rgba(255, 255, 255, 0.55)` + `backdrop-filter: blur(12px) saturate(140%)` (`components/pillars/PillarCard.tsx:29-31`). Conforme.
7. `<PillarCard>` border-radius 14, padding 16 — espacement grille canonique. Bon.
8. Touch target `<PillarCard>` action "Archiver" : `padding: '4px 10px'`, fontSize 11 (`PillarCard.tsx:112-113`). ~24px — très en dessous 44px iOS. Recalé.
9. `<PillarCard>` hover ne change pas le background — pas de feedback visuel d'hover (mais cursor pointer). Affordance faible.
10. `<PillarAddCard>` hover : `background: 'rgba(0, 122, 255, 0.04)'` + border-color change (`PillarCard.tsx:160-168`). Bon mais en `onMouseEnter` JS au lieu de CSS `:hover` — pas de support tactile.
11. `<PillarsManager>` : titre "Tes piliers narratifs" 22px bold + sous-titre 13px secondary — typographie hiérarchique nette (`PillarsManager.tsx:101-124`).
12. Soft cap warning orange `rgba(255, 159, 10, 0.10)` (`PillarsManager.tsx:134`) et hard cap rouge `rgba(255, 59, 48, 0.08)` (`PillarsManager.tsx:152`) — couleurs iOS standard. OK.
13. Row pillar list `overflow-x: auto` + `scroll-snap-type` (`PillarsManager.tsx:184-189`) — UX mobile correcte.
14. `<MarqueRow>` chevron iOS SVG inline 8×14 (`MarqueRow.tsx:25-44`) — Apple-style. Bon.
15. Sidebar/grille du dashboard `cfs-ma-marque-grid` — défini ailleurs (CSS class). Pas vu inline. À auditer côté `globals.css`.
16. Le bouton "Archiver" dans `<PillarCard>` : background transparent + border `rgba(0,0,0,0.08)` (`PillarCard.tsx:115-117`). Sobre, OK.
17. `<PillarsManager>` confirmation archive : `window.confirm()` (ligne 43) → modale système non-stylée. **Recalé Hiroshi** (et Marcus) : ne respecte pas Apple/iOS look.
18. Espacements `gap: 12` `gap: 16` `gap: 4` `gap: 24` — grille canonique respectée.
19. `<PageHeader title="Ma Marque" />` — H1 trouvé. Bon possessif. Le `BrandOnboardingHeaderCta` est placé en `cfs-page-container` justify-end (`page.tsx:203`) — à droite du header. OK pattern.
20. La grille principale `cfs-ma-marque-grid` (40%/60%) est définie dans CSS global (non vue ici) — pattern Split Brief implicite mais pas via `<SplitBrief>` canonique. Décision architecturale à documenter.
21. Coexistence visuelle dashboard 14 rangs (avec rang "piliers") + bloc `<PillarsManager>` séparé en dessous → **deux interfaces piliers superposées** (`page.tsx:207-222`). Le pilote voit "piliers" deux fois. Recalé UI + Marcus.

### Verdict : **Recalé**

### Justification
Palette propre, halos OK, pas de forest green. Mais (a) la `<BarreFondations>` est une barre de progression malgré la doctrine anti-gamification — signal visuel ambigu ; (b) `window.confirm()` natif au lieu d'une modale Apple-style ; (c) coexistence visuelle de deux blocs "piliers" dans la même page (rang dashboard + PillarsManager) ; (d) touch targets sous 44px sur les boutons d'action.

### Recommandations
- **P0** : Trancher la coexistence rang "piliers" (JSONB) + `<PillarsManager>` (table). Soit retirer le rang, soit retirer le PillarsManager. Voir Elena.
- **P0** : Remplacer `window.confirm()` par une modale Apple-style maison (`components/pillars/PillarsManager.tsx:43`).
- **P1** : Reconsidérer `<BarreFondations>` — soit la supprimer (cohérent avec doctrine anti-gamification), soit la documenter explicitement comme acceptation contrôlée.
- **P1** : Touch target bouton "Archiver" `<PillarCard>` : `padding: '8px 14px'`, fontSize 13 minimum.
- **P2** : Passer hover `<PillarAddCard>` en CSS `:hover` au lieu de JS `onMouseEnter` pour support tactile.
- **P2** : `#1C1C1E` dans `<EtatMarque>` → `var(--color-label)`.

---

## Axe 2 — Elena (Archi)

### Observations
1. **DOUBLON DE SCHÉMA CRITIQUE** : `piliers_narratifs` (JSONB sur `brands`, lu `page.tsx:94`) **et** table `pillars` (Sprint 37.K F89 migration 025, lu `page.tsx:131-144`). Les deux coexistent et alimentent deux UI distinctes : le rang `piliers` du `<MaMarqueDashboard>` (qui ouvre `<PiliersSheet>`) écrit dans `brand.piliers_narratifs` ; le `<PillarsManager>` écrit dans la table `pillars`. **Aucune synchronisation entre les deux**. Recalé Elena fort.
2. `try/catch` autour de la lecture `pillars` (`page.tsx:132-144`) avec fallback `pillars = []` — protège contre la migration non appliquée, pragmatique mais cache la dette.
3. Server Component bien architecturé : lecture, snapshot, redirect. Pas de hooks.
4. RLS : `pillars` filtré par `brand_id` (`page.tsx:138`) — repose sur la RLS pour le `tenant_id`. À valider côté schéma.
5. `createAdmin()` utilisé pour lire `brand_archives` (`page.tsx:103-125`) — bypass RLS volontaire avec commentaire "RLS gérée serveur". À documenter pourquoi admin et pas RLS côté table.
6. Cast complexe pour `admin` (`page.tsx:104-115`) : 11 lignes de typage manuel sur un client admin — symptôme de types Supabase non générés.
7. Server Actions piliers : `archivePillar`, `updatePillar` (`app/_actions/pillars`) importés par `<PillarsManager>` (`PillarsManager.tsx:11`). Bon pattern.
8. `generate-pillar-wizard.ts` utilise cascade `['claude-sonnet-4-6', 'claude-sonnet-4-5']` (ligne 28) — pattern de fallback documenté.
9. Le commentaire `page.tsx:88-90` "Si la migration 009 n'est pas encore appliquée, les colonnes manquantes remontent en `null`" — défense en profondeur, mais signale que le schéma BD est instable.
10. Helpers de typage `asArray`, `asObjet`, `asRessources` (`page.tsx:51-66`) — bonne pratique faute de types générés.
11. `snapshot` construit en-mémoire (`page.tsx:146-162`) — bonne séparation données / vue.
12. `<MaMarqueDashboard>` gère son état local `setSnapshot` (`MaMarqueDashboard.tsx:65`) pour CAS A inline — bonne pratique optimistic update.
13. `mql.addEventListener('change', handler)` (`MaMarqueDashboard.tsx:82`) — gestion responsive propre.
14. Pas de Suspense, pas de loading.tsx (`ls app/(ma-marque)/` → seulement `layout.tsx` + `ma-marque/`). Friction.
15. `getResumableBrandOnboardingSession()` (Server Action, `page.tsx:166`) — propre.

### Verdict : **Recalé**

### Justification
Le doublon de schéma `piliers_narratifs` JSONB + table `pillars` est un drift architectural critique. Les deux UI sont visibles en même temps sur la page et alimentent deux sources de vérité divergentes. C'est exactement le type de doublon que la doctrine Elena interdit (cf. règle `business_calendar` vs `calendrier_business`). Sprint 38 doit trancher : migration `piliers_narratifs` → table `pillars` complète, suppression du rang JSONB.

### Recommandations
- **P0** : **Plan de migration** : (a) écrire script pour migrer `brand.piliers_narratifs` JSONB vers table `pillars` ; (b) bascule UI : supprimer le rang `piliers` du `<MaMarqueDashboard>` (`MaMarqueDashboard.tsx:168, 267-274`) ; (c) deprecate la colonne JSONB ; (d) le `<PillarsManager>` devient unique source de vérité.
- **P1** : Générer les types Supabase et éliminer les casts `as BrandRow | null`, `as PillarRow[]`.
- **P1** : Paralléliser les requêtes Supabase (`profiles`, `brands`, `brand_archives`, `pillars`, `getResumableBrandOnboardingSession`) via `Promise.all`.
- **P2** : Documenter pourquoi `createAdmin()` pour `brand_archives` (RLS manquante ? politique différente ?) ou migrer vers RLS standard.
- **P2** : Documenter dans `CLAUDE.md` la doctrine "une seule source de vérité par concept métier".

---

## Axe 3 — Sarah (Copy)

### Observations
1. Tutoiement systématique : "Tu n'as pas encore défini de pilier. Le conseiller t'aide en cinq questions." (`PillarsManager.tsx:122`), "Tu approches du cap." (ligne 141), "Comment ta marque se nomme." (`MaMarqueDashboard.tsx:205`). Bon.
2. Possessif : "Ma Marque" titre header (`page.tsx:190`). Bon.
3. `aria-label="Tes piliers narratifs"` (`PillarsManager.tsx:92`) + H2 "Tes piliers narratifs" (ligne 111) — tutoiement OK.
4. "Conseiller" minuscule : "Le conseiller t'aide en cinq questions." (`PillarsManager.tsx:122`) — OK doctrine.
5. Vocabulaire interdit : grep ne trouve pas "users" "dashboard" "tableau de bord" "workflow" "viral" "growth" "engagement" "streak" en UI dans `components/ma-marque/` et `components/pillars/`.
6. **MAIS** : commentaire de tête `MaMarqueDashboard.tsx:1` "Page Ma Marque : tableau de bord 14 rangs" — c'est du code. Pas UI. OK.
7. Idem `SheetMaMarque.tsx:4` "footer avec workflow inter-blocs" — code, pas UI. OK.
8. Copy Sheet "Voix" : "Le ton qu'on reconnaît immédiatement quand tu parles." (`MaMarqueDashboard.tsx:233`) — Floriane, lyrique mais propre. Bon.
9. Placeholder "Calme, posé, précis. Pas de slogans. Pas d'exclamations. Pas de jargon." (`MaMarqueDashboard.tsx:234`) — réfère explicitement la doctrine CF. Excellent.
10. Sheet "Singularité" : "Ce qui fait que ta marque n'est confondue avec aucune autre." (`MaMarqueDashboard.tsx:248`) — Floriane impeccable.
11. Copy soft cap : "Au-delà de cinq piliers, ils se diluent — réfléchis avant d'en ajouter." (`PillarsManager.tsx:141`) — sage, didactique, non-coercitif.
12. Copy hard cap : "Maximum {N} piliers atteint. Archive un pilier pour en créer un nouveau." (`PillarsManager.tsx:159`) — direct, claire.
13. Confirm archive : "Archiver « {title} » ? Les posts existants restent reliés mais le pilier sort de la rotation." (`PillarsManager.tsx:43-45`) — informatif, OK.
14. Bouton header "Définir mon premier pilier" / "Ajouter un pilier" (`PillarCard.tsx:181`, `PillarsManager.tsx:201`) — infinitif net, OK.
15. "Non renseigné" comme fallback (`MaMarqueDashboard.tsx:160`) — sec et neutre. OK.
16. Sheet "Cible", "Univers refusé", "Benchmarks", "Canaux", "Brand Book", "Archives" — labels iOS-style, OK.
17. "Brand Book" est un anglicisme. À auditer : la doctrine CF accepte-t-elle "Brand Book" ou préfère "Livre de marque" ?

### Verdict : **Validé**

### Justification
Tutoiement, possessifs, conseiller minuscule, ton Floriane parfait. Aucun vocabulaire interdit en UI. La copy "Voix" et "Singularité" sont des modèles. La seule réserve mineure est "Brand Book" anglicisme à arbitrer doctrine.

### Recommandations
- **P2** : Arbitrer "Brand Book" vs "Livre de marque" (Hélène salve 5) — `MaMarqueDashboard.tsx:326`, `SheetBrandBook`.

---

## Axe 4 — Marcus (Workflow)

### Observations
1. Aucun `loading.tsx` ni `error.tsx` dans `app/(ma-marque)/` (sortie `ls`). Friction sur Supabase lent.
2. `MaMarqueDashboard` gère responsive : `matchMedia` + `useEffect` (`MaMarqueDashboard.tsx:79-84`) — pas de flash CSS.
3. CAS A inline desktop (édition directe) vs CAS B sheet (édition lourde) — bonne séparation friction-coût.
4. Onboarding wizard guidé `BrandOnboardingTrigger` via `?onboarding=true` (`page.tsx:227`) — deep-link propre.
5. `BrandOnboardingHeaderCta` adapte son label selon `hasResumable` (`page.tsx:204`) — feedback contextuel.
6. `<PillarsManager>` : `busy` state + `error` state affichés (`PillarsManager.tsx:30-31, 163-179`). Loading state intra-composant OK.
7. **`window.confirm()`** pour archive (`PillarsManager.tsx:43`) — modale système non-thémable, non-mobile-friendly, casse l'UX Apple. Recalé.
8. `<PillarCard>` : `role="button"`, `tabIndex` géré, `onKeyDown` Enter/Space (`PillarCard.tsx:43-51`) — bonne a11y clavier.
9. Bouton "Archiver" interne `<PillarCard>` fait `e.stopPropagation()` (`PillarCard.tsx:105`) — évite déclenchement onClick parent. OK.
10. `<PillarAddCard>` : `disabled` state explicite avec `cursor: 'not-allowed'` + `opacity: 0.45` (`PillarCard.tsx:154-155`) — feedback clair.
11. Soft cap / hard cap `role="status"` (`PillarsManager.tsx:128, 145`) — annonce screen reader. Bon.
12. Error `role="alert"` (`PillarsManager.tsx:163`) — bon.
13. Confirmations destructrices : oui sur archive pilier. Mais sur les autres blocs (sheets), à auditer cas par cas (non couvert ici).
14. Optimistic update sur create/edit pillar (`PillarsManager.tsx:55, 75, 87`) — pas de loader entre clic et résultat. Bon.
15. `cfs-ma-marque-grid` (CSS global) en pattern Split Brief 40/60 implicite — mais pas via `<SplitBrief>` canonique. Le pilote voit deux patterns 40/60 (un canonique sur `/aujourd-hui`, un custom ici). Recalé cohérence.
16. La présence simultanée du rang "piliers" + bloc `<PillarsManager>` crée une confusion workflow : où le pilote doit-il cliquer pour gérer ses piliers ? **Décision UI à trancher**.
17. `<BarreFondations>` `aria-label` "{N} blocs sur {total} en cours" (`BarreFondations.tsx:32`) — accessible OK.
18. Sheets ouvrent et ferment via `openSheet` state (`MaMarqueDashboard.tsx:66`) — clean state machine.

### Verdict : **Recalé**

### Justification
Bonne UX intrasheet (CAS A inline / CAS B sheet, optimistic update), bonne a11y clavier sur `<PillarCard>`. Mais (a) `window.confirm()` natif casse l'UX Apple ; (b) confusion workflow piliers (deux blocs) ; (c) absence de `loading.tsx`/`error.tsx` ; (d) Split Brief custom au lieu du `<SplitBrief>` canonique.

### Recommandations
- **P0** : Remplacer `window.confirm()` par une modale Apple-style (cohérence UX).
- **P0** : Trancher la confusion workflow piliers — un seul point d'entrée visible.
- **P0** : Créer `app/(ma-marque)/loading.tsx` (squelette grille 2 colonnes).
- **P1** : Créer `app/(ma-marque)/error.tsx`.
- **P1** : Migrer `cfs-ma-marque-grid` vers le composant `<SplitBrief>` canonique pour cohérence avec `/aujourd-hui`.
- **P2** : Auditer toutes les sheets pour confirmation destructrice cohérente.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. Le commentaire de tête `page.tsx:7` "Aucun pourcentage exposé. Compteur N/14 admissible (lisible, pas gamifié)." — déclaration doctrinaire. Cohérent.
2. `<EtatMarque>` `phrase = getPhrase14(snapshot)` (`EtatMarque.tsx:20`) → prose tranquille narrative, pas de chiffre. Floriane.
3. **MAIS** : `<BarreFondations>` injecte une barre de progression visuelle (`EtatMarque.tsx:38-43`). Le commentaire `BarreFondations.tsx:1-9` défend "anti-gamification : aucun pourcentage écrit, aucun chiffre dans la barre, pas d'animation". Mais une barre 2-segments noir/gris **est** une jauge — la perception utilisateur est gamifiée. La doctrine "pas de gamification" devrait s'appliquer à la **représentation visuelle** pas seulement aux chiffres.
4. Pas de streak, pas de badge, pas de niveau, pas de points. Conforme.
5. Pas de "il te reste N piliers", pas de "5/14 fondations posées" en compteur coloré. Conforme.
6. Pattern iOS Settings 14 rangs (commentaire `page.tsx:1`) — référence Apple HIG explicite. Conforme.
7. Les 6 promesses CF : la page incarne "pilote", "mémoire de marque", "stabilité". Conforme.
8. Trilogie Organique/Outreach/Libre : non matérialisée sur cette page (logique programme). Pas le scope.
9. Phase 1 / Phase 2 : la marque est la fondation de Phase 1. Si `brand_book_status !== 'complete'` → redirect `/onboarding/analyse-marque` (`page.tsx:84-86`). Bonne gate.
10. La copy "Voix" et "Singularité" (`MaMarqueDashboard.tsx:233-234, 248-249`) sont des modèles de l'ancrage doctrinaire en source. Floriane.
11. **Drift doctrine cross-cutting** : `skills/00-CONCEPT.md`, `skills/10-SACRED.md`, `skills/01-ARCHITECTURE.md` décrivent encore l'ancien produit. P0 synthèse.
12. **Drift schéma cross-cutting** : doublon `piliers_narratifs` JSONB + table `pillars` — déjà signalé Elena, doctrine Hélène l'amplifie : la doctrine CF dit "un seul lieu pour la marque". Deux blocs piliers = deux lieux. Recalé doctrine.
13. La création d'un pilier passe par 5 questions Sonnet 4.6 (`generate-pillar-wizard.ts`) — doctrine "le conseiller t'aide en cinq questions" (`PillarsManager.tsx:122`). Cohérent.
14. La sidebar header "Définir mon premier pilier" / "Ajouter un pilier" suit le pattern "verbe d'action + objet". Floriane.
15. Le wizard guidé Ma Marque (`BrandOnboardingTrigger`, déclenché par `?onboarding=true`) — bonne porte d'entrée pour pose des fondations.

### Verdict : **Recalé partiel**

### Justification
Doctrine bien servie sur la copy ("Voix", "Singularité", "Tu approches du cap"), pattern iOS Settings, anti-gamification chiffrée. **Mais** : (a) `<BarreFondations>` contredit l'esprit anti-gamification malgré la défense en code ; (b) doublon de schéma piliers contredit "une seule source de vérité" ; (c) deux UI piliers superposées contredit "une seule porte d'entrée".

### Recommandations
- **P0** : Décision doctrinaire — `<BarreFondations>` doit-elle disparaître ? Si oui, supprimer le composant. Si non, documenter explicitement l'exception.
- **P0** : Décision doctrinaire — un seul lieu pour les piliers. Migration JSONB → table.
- **P1** : Conserver le commentaire `page.tsx:1-7` comme référence doctrinaire et faire de même sur `BarreFondations.tsx` quitte à la défendre.

---

## Synthèse de la page

### Verdicts cumulés
| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé |
| Elena Archi | ❌ Recalé |
| Sarah Copy | ✅ Validé |
| Marcus Workflow | ❌ Recalé |
| Hélène Doctrine | ❌ Recalé partiel |

### Top fixes priorisés
- **P0** :
  1. **Trancher le doublon piliers** : plan de migration `brand.piliers_narratifs` JSONB → table `pillars`. Supprimer le rang "piliers" du `<MaMarqueDashboard>` (`MaMarqueDashboard.tsx:168, 267-274`) ou bien supprimer le `<PillarsManager>` (page.tsx:221).
  2. Remplacer `window.confirm()` par une modale Apple-style (`PillarsManager.tsx:43`).
  3. Décision doctrinaire `<BarreFondations>` : supprimer ou défendre explicitement.
  4. Créer `app/(ma-marque)/loading.tsx`.
  5. Créer `app/(ma-marque)/error.tsx`.
- **P1** :
  1. Touch target bouton "Archiver" `<PillarCard>` → `padding: '8px 14px'`, fontSize 13 (`PillarCard.tsx:112`).
  2. Migrer `cfs-ma-marque-grid` vers `<SplitBrief>` canonique.
  3. Paralléliser les requêtes Supabase via `Promise.all`.
  4. Générer types Supabase, éliminer casts.
  5. Mettre `<EtatMarque>` `#1C1C1E` → `var(--color-label)`.
- **P2** :
  1. Hover `<PillarAddCard>` JS → CSS `:hover`.
  2. Arbitrer "Brand Book" vs "Livre de marque" (Hélène salve 5).
  3. Documenter pourquoi `createAdmin()` pour `brand_archives` ou migrer RLS.
  4. Auditer toutes les sheets pour confirmation destructrice.
  5. Documenter wizard piliers Sonnet 4.6 cascade dans `CLAUDE.md`.

### Verdict global page
**Recalé** — Page cruciale (fondations de marque) avec un drift architectural majeur (doublon de schéma piliers) et une dette UI/workflow significative (window.confirm, deux UI piliers). 4 axes sur 5 en recalé. Doit être prioritaire Sprint 38.
