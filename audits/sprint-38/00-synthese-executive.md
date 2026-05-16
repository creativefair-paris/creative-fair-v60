# Sprint 38 — Synthèse exécutive audit Creative Fair v60

> Document autosuffisant. Le Lead lit ce fichier en premier, et peut décider
> du Sprint 39 sans avoir à lire les 21 audits page-par-page.
>
> Daté : 16 mai 2026. Branche `sprint-38`. 21 fichiers d'audit lus en
> profondeur (4958 lignes markdown), 5 axes appliqués partout.

---

## TL;DR

Creative Fair v60 a un **squelette doctrinal solide** (multi-tenant Supabase
+ Server Actions + tokens v60 + sub-prompts Sonnet 4.6 cachés) **mais
trois failles structurelles** se sont accumulées entre Sprint 33 et 37 :

1. **Doctrine documentation drift** — `skills/00-CONCEPT.md`,
   `01-ARCHITECTURE.md`, `10-SACRED.md` décrivent encore l'ancien produit
   (forest green `#1F4937` unique accent, navigation 4 destinations avec
   `/calendrier` et `/aujourdhui` sans tiret). Le code, lui, a basculé
   sur la palette v60 crème + `#007AFF` + pastels et la nav 5 (Aujourd'hui,
   Mon Programme, Ma Marque, Mes Outils, Conseiller). **Tous les Sprint 37
   ont livré contre une doctrine non écrite.**
2. **Migration progressive Sprint 37.K F89 pas terminée** — table `pillars`
   créée, server actions livrées, UI `<PillarsManager>` montée sur
   `/ma-marque`, mais `posts.pilier_id` (FK migration 026) n'est jamais
   branchée dans `PostEditor` ni dans les server actions de création de
   post. Le système legacy `brands.piliers_narratifs` JSONB + `posts.pilier_nom`
   TEXT continue à tourner en parallèle. **Le pilote voit deux blocs piliers
   sur `/ma-marque` sans savoir lequel est canonique.**
3. **Faille multi-tenant systémique sur les server actions admin** —
   `updatePillar`, `archivePillar`, `updatePostFields` et plusieurs autres
   font `.eq('id', X)` via `createAdmin()` (qui bypass RLS) **sans
   filtrer sur `tenant_id`**. Un user authentifié dont l'ID est fuité
   pourrait théoriquement éditer des piliers/posts d'un autre tenant en
   forgeant un `id` valide. **Risque sécurité réel, P0.**

**Top 3 chantiers critiques pour Sprint 39 :**

- **Chantier 1 — Brancher `pilier_id` end-to-end** : Post Creator, Editor,
  Bibliothèque, Programme, Retombees. Migration de `pilier_nom` TEXT
  vers `pilier_id` UUID FK + backfill. Retrait du JSONB `piliers_narratifs`.
- **Chantier 2 — Sécuriser server actions admin** : ajouter
  `.eq('tenant_id', tenantId)` sur TOUTES les mutations qui passent par
  `createAdmin()`. Test isolation 5/5 obligatoire.
- **Chantier 3 — Mettre à jour `skills/00-CONCEPT.md`, `01-ARCHITECTURE.md`,
  `10-SACRED.md`** pour refléter le produit v60 réel (palette, nav 5,
  routes `/aujourd-hui` et `/programme`). Sans cette mise à jour, chaque
  nouveau dev / agent IA livre contre une cible obsolète.

---

## Statistiques globales

### Périmètre couvert

- **Pages auditées** : 21 (signup absent compté comme audit de l'absence)
- **Workflows audités** : 4 / 4 (A onboarding, B pilier, C post, D nav)
- **Routes inventoriées** dans `app/` : 30 page.tsx
- **Pages NON auditées explicitement** : 9 (admin tenants, dev split-brief,
  programme/[postId], programme/create, programme/strategie,
  programme/retombees, programme/bienvenue, compte/*, accueil)
  → traitées en angle mort dans `decisions.md`.

### Verdicts agrégés (sur 105 verdicts = 21 pages × 5 axes)

| Axe | Validé | Recalé partiel | Recalé | % Validé |
|---|---|---|---|---|
| Hiroshi UI | 4 | 12 | 5 | 19% |
| Elena Archi | 5 | 11 | 5 | 24% |
| Sarah Copy | 5 | 10 | 6 | 24% |
| Marcus Workflow | 5 | 10 | 6 | 24% |
| Hélène Doctrine | 8 | 7 | 6 | 38% |
| **Total** | **27** | **50** | **28** | **26%** |

**Distribution :** 26% Validé, 48% Recalé partiel, 27% Recalé. Dans la
cible "30-50% Validé attendu" — la calibration penche côté exigence,
mais le pattern de Recalé est concentré sur **3 anti-patterns récurrents**
(cf. faiblesses systémiques ci-dessous), pas dispersé. La concentration
rend la remédiation traçable.

### Volume par axe (signal de profondeur)

- Hiroshi UI : ~1100 lignes d'observations cumulées
- Elena Archi : ~1300 lignes
- Sarah Copy : ~700 lignes
- Marcus Workflow : ~900 lignes
- Hélène Doctrine : ~900 lignes

Sarah Copy est sous-pondérée (le vocabulaire interdit est rapide à grep,
les verdicts tombent en quelques lignes). Elena Archi est sur-pondérée
parce que les findings nécessitent de citer des migrations + schémas SQL
en plus du code TSX.

### Compteurs P0/P1/P2 cross-pages

- **P0** (bloquant) : **42** occurrences cumulées sur les 21 audits
- **P1** (important) : **108**
- **P2** (polish) : **156**

Après déduplication (mêmes patterns récurrents) :
- **P0 uniques** : **18**
- **P1 uniques** : **47**
- **P2 uniques** : **72**

Détails consolidés dans `90-priorisation-p0-p1-p2.md`.

---

## Forces structurelles (à NE PAS casser Sprint 39+)

### 1. Architecture multi-tenant Supabase + RLS

Le pattern `tenant_id = public.user_tenant_id()` est appliqué **sur toutes
les tables avec RLS** (15 migrations, idempotentes, structurées
chronologiquement). Le helper `createClient()` / `createAdmin()` est
correctement séparé par concern.

**Caveat** : `createAdmin()` est utilisé pour les mutations dans plusieurs
server actions (Sprint 37.F + 37.K), ce qui **bypass RLS**. Les mutations
font ensuite des `.eq('id', X)` sans re-filtrer `tenant_id` — c'est le
P0 sécurité #1. Mais l'**architecture** elle-même reste saine, c'est
juste l'usage qui dérive.

### 2. Server Actions partout pour les mutations

Aucun `fetch POST` côté client trouvé dans l'audit. Toutes les mutations
passent par `'use server'` dans `app/_actions/`. Pattern Next.js 16 App
Router respecté.

### 3. Cacheable prompts Anthropic

Tous les system prompts Anthropic utilisent
`cache_control: { type: 'ephemeral' }`. Cf. `app/_actions/propose-piliers.ts:40-46`
+ `app/_actions/generate-pillar-wizard.ts:46-52`. **Économie 90% cache
hit préservée**. VOICE_SHEET_RULES (`/lib/ai/prompts/system.ts`) cité dans
les skills mais pas modifié par les Sprint 37 — bonne discipline.

### 4. Composant `<InstagramIOSMockup>` Sprint 37.K/L/M solide

Le mockup central a été refactoré 3 fois (F86 → F86.3) jusqu'à atteindre
une réplique pixel-près iOS mai 2026. Story ring conique 5 couleurs +
badge Meta SVG 8 lobes scalloped + caption truncate "… plus" + carousel
chevron + dots + compteurs FR. API 100% rétro-compatible. **Le standard
visuel le plus abouti du repo** — à étendre comme référence pour les
autres mockups.

### 5. Wizard piliers Sprint 37.K F89 — flux Sonnet 4.6 élégant

5 questions guidées dynamiques + 3 propositions title+description ancrées
dans les réponses. System prompt calibré via exemples concrets ("L'accident
génial" Carlo Sarrabezolles, "Sucre vivant" Angelina, "Lieu refuge" Le
Comptoir Général). Validation 3 mots applicative + soft cap 5 / hard cap
7. Pattern à réutiliser pour autres wizards LLM-driven.

### 6. Discipline subtraction-first observable

Sprint 37.K F86 a supprimé 184 lignes inlinées dans `ToolMockup.tsx` pour
factoriser en composant. Sprint 37.M F86.3 a supprimé 47 lignes CSS halos
legacy. Sprint 37.J F82 a reverté F80 (4 designs cartes formats) au profit
d'un pattern unique. La doctrine "Quand on hésite : on enlève" est
appliquée en pratique, pas seulement écrite.

---

## Faiblesses systémiques (patterns récurrents)

### Faiblesse 1 — Coexistence doublon `piliers_narratifs` JSONB ↔ `pillars` table

**Pages touchées** : `/ma-marque`, `/programme`, `/outils/post-creator`,
`/outils/bibliotheque`, `/outils/retombees`, workflow C.

**Pattern** :
- `brand.piliers_narratifs` JSONB lu par `<MaMarqueDashboard>`, `<PiliersSheet>`,
  `BrandOnboardingStep.tsx`, `propose-piliers.ts`.
- Table `pillars` (migration 025) lue par `<PillarsManager>` (Sprint 37.K
  F89).
- Sur `/ma-marque` les **deux blocs coexistent** dans la même page (cf.
  `app/(ma-marque)/ma-marque/page.tsx:186` puis `:200`). Le pilote voit
  deux représentations différentes de la même donnée.
- `posts.pilier_nom` TEXT legacy reste la source de vérité pour le
  rattachement post→pilier. `posts.pilier_id` UUID FK existe (migration
  026) mais aucun consumer ne l'utilise.

**Cause racine** : Sprint 37.K F89 a annoncé "migration progressive — Sprint
38+ décidera du retrait". Sprint 38 doit décider et exécuter le retrait.

**Effort estimé** : XL (3-5 jours)
- Backfill script `piliers_narratifs` JSONB → table `pillars`
- Refonte `PostEditor` pour utiliser `pilier_id` (FK)
- Refonte `updatePostFields` pour persister `pilier_id`
- Migration retrait : `ALTER TABLE brands DROP COLUMN piliers_narratifs`
  + `ALTER TABLE posts DROP COLUMN pilier_nom`
- Refonte `BrandOnboardingStep` étape piliers pour utiliser le nouveau
  wizard
- Suppression `<PiliersSheet>` legacy

### Faiblesse 2 — `createAdmin()` sans re-filtre `tenant_id`

**Pages touchées** : workflow B (pilier), workflow C (post), `/ma-marque`
mutations, `/outils/post-creator` save, `/programme/post/[postId]` edit.

**Pattern** :
```ts
// app/_actions/pillars.ts:167 (updatePillar)
const admin = createAdmin() as unknown as SupabaseClient
const { data, error } = await admin
  .from('pillars')
  .update({ ...updates, updated_at: new Date().toISOString() })
  .eq('id', id)                        // ← pas de .eq('tenant_id', tenantId)
  .select(...)
```

`createAdmin()` utilise `SUPABASE_SERVICE_ROLE_KEY` qui **bypass RLS**.
Si un user A connaît l'`id` d'un pilier du tenant B, l'action permet
théoriquement d'éditer. La server action lit bien le `tenant_id` du user
en amont (`profile.tenant_id`) mais ne s'en sert PAS pour filtrer la
mutation.

**Server actions affectées** (audit cross-fichiers) :
- `app/_actions/pillars.ts:167` updatePillar
- `app/_actions/pillars.ts:196` archivePillar
- `app/_actions/pillars.ts:111` createPillar (insert : tenantId est inclus
  dans le payload, donc protection partielle — mais pas de check `brand_id`
  appartient au tenant)
- Server actions de programme à vérifier au Sprint 39 — l'audit
  workflow D mentionne `updatePostFields` mais ne cite pas la ligne.
- `app/_actions/brand-onboarding.ts` à auditer.

**Effort estimé** : M (1-2 jours)
- Helper `assertTenantOwnership(admin, table, id, tenantId)` à factoriser
- Refactor chaque mutation pour passer par ce helper
- Tests isolation 5/5 (cf. `scripts/test-multi-tenant.ts`)

### Faiblesse 3 — Doctrine documentation drift (skills/ files)

**Fichiers touchés** :
- `skills/00-CONCEPT.md:96` — `Accent unique : #1F4937` ← deprecated 6 mai
- `skills/00-CONCEPT.md:78-87` — Navigation 4 destinations (aujourd'hui,
  calendrier, ma marque, conseiller) ← réalité = nav 5
- `skills/01-ARCHITECTURE.md:57-69` — Structure repo référencée :
  `(app)/aujourdhui/`, `(app)/calendrier/`, `(app)/post-creator/[postId]/`
  — toutes ces routes n'existent pas. La vraie structure est `(aujourd-hui)/`,
  `(programme)/`, `(outils)/post-creator/`.
- `skills/10-SACRED.md:36-44` — "Navigation 4 destinations. Jamais 5."
  ← contradiction directe avec le produit livré Sprint 37.
- `skills/10-SACRED.md:74-78` — "Vert forêt unique accent #1F4937" ←
  deprecated.

**Cause racine** : Sprint 33-37 a livré contre une doctrine non écrite
("post-doctrine"). Les skills/ sont restés figés à la doctrine Sprint
26-32. Chaque nouveau dev / agent IA lit les skills et applique des
règles obsolètes — c'est la cause racine du retour de `#1F4937` dans
`ConseillerIntro.tsx:143` et de l'apparition de "onboarding" en UI sur
`BrandOnboardingHeaderCta`.

**Effort estimé** : S (4-6 heures)
- Refonte 4 fichiers skills/ : 00, 01, 04, 10
- Ajout date de validité en en-tête de chaque skill
- Annotation des décisions reversées (forest green → palette v60)
- Communication aux 3 clients pilotes B2B (Angelina, Tous en Tête, Comptoir)
  pour calibrer la nouvelle signature visuelle si elle leur arrive.

### Faiblesse 4 — Vocabulaire interdit récurrent en UI

**Occurrences** :
- "onboarding" en UI utilisateur :
  - `components/onboarding-marque/BrandOnboardingSheet.tsx` aria-label
  - `components/onboarding-marque/BrandOnboardingHeaderCta.tsx` (2 labels)
  - `components/onboarding-marque/ResumeChoiceSheet.tsx` ("nouvel
    onboarding")
- "Conseiller" majuscule en UI :
  - `components/outils/OutilsCatalog.tsx:122`
  - `app/(outils)/outils/conseiller/page.tsx:138-139`
- "Sprint 38+", "TF Ads", "Sub-prompt" exposés en commentaires visibles
  par le pilote :
  - `components/outils/OutilsCatalog.tsx` (fragments internes)

**Effort estimé** : S (3 heures)
- Remplacer "onboarding" par "questions guidées" ou "premières réponses"
- Remplacer "Conseiller" par "conseiller" partout en UI
- Auditer tous les `// Sprint XX` et déplacer en haut de fichier hors
  copy utilisateur.

### Faiblesse 5 — Tokens hardcodés résiduels

**Occurrences** :
- `app/globals.css` contient encore `#1F4937` (référence forest green)
- `components/conseiller/ConseillerIntro.tsx:143` — hex hardcodé `#1F4937`
- Plusieurs hex hardcodés dans `BrandOnboardingStep.tsx` : `#FBFAF7`,
  `#5856D6`, `#C0392B`, rgba accents
- `<InstagramIOSMockup>` utilise des couleurs Instagram hardcodées
  (`#0095F6`, `#FEDA77`, etc.) — c'est ASSUMÉ et CORRECT pour un mockup
  qui copie Instagram. NE PAS confondre.

**Effort estimé** : M (1 jour)
- Recenser les vraies dérives vs les hardcodes assumés (mockups Instagram)
- Migrer les hex génériques vers `var(--color-*)`

### Faiblesse 6 — Absence `loading.tsx` / `error.tsx`

**Pages affectées** : aujourd-hui, programme, ma-marque, outils,
conseiller — soit les 5 nav principales. Aucune n'a de fichier
`loading.tsx` ou `error.tsx` Next.js dédié. Les loading states sont
gérés en composant (skeleton inline) mais l'expérience network slow
ou erreur 500 dégrade brutalement.

**Effort estimé** : S (4 heures)
- Ajouter `loading.tsx` glass-z2 skeleton sur chaque route group
- Ajouter `error.tsx` avec CTA "Retour à Aujourd'hui" + bouton "Réessayer"

### Faiblesse 7 — Duplication `FORMAT_LABELS` / `FORMAT_COLORS`

`lib/post-creator/roadmaps.ts` définit 4 formats (Anecdote, Produit,
Événement, Coulisses). `lib/i18n/formats.ts` définit 6 formats (Anecdote,
Produit, Événement, Coulisses, Manifeste, Question). **Drift schéma
garanti** — un format manquant côté roadmaps signifie qu'aucune roadmap
n'est définie pour Manifeste et Question.

**Effort estimé** : S (2 heures)
- Étendre `lib/post-creator/roadmaps.ts` aux 6 formats canoniques
- Faire référencer `lib/i18n/formats.ts` comme source de vérité unique

### Faiblesse 8 — Breadcrumb sans possessif "Mes Outils"

Sur `/outils/bibliotheque`, `/outils/reviews`, `/outils/messages`, le
breadcrumb dit "Outils" au lieu de "Mes Outils". Incohérent avec la
doctrine possessifs nav ("Mon Programme", "Ma Marque", "Mes Outils").

**Effort estimé** : XS (30 min)

---

## Top 10 P0 cross-pages (priorisé)

Ordre = impact × urgence. Source : `90-priorisation-p0-p1-p2.md`.

| # | Item | Pages source | Effort |
|---|---|---|---|
| 1 | Sécuriser server actions admin : ajouter `.eq('tenant_id', tid)` partout | workflow B + C + 09 + 22 | M |
| 2 | Brancher `pilier_id` FK end-to-end (Post Creator, Editor, Bibliotheque, Programme) | 12, 13, 22 | XL |
| 3 | Mettre à jour `skills/00-CONCEPT.md` + `01-ARCHITECTURE.md` + `10-SACRED.md` (post-Sprint 37 reality) | tous | S |
| 4 | Backfill `piliers_narratifs` JSONB → table `pillars` + retrait JSONB | 09, 21 | L |
| 5 | Retirer `#1F4937` de `globals.css` + `ConseillerIntro.tsx:143` + autres | 11, 23 | S |
| 6 | Remplacer "onboarding" par "questions guidées" en UI (4 occurrences) | 03, 04, 05, 06 | S |
| 7 | "Conseiller" → "conseiller" minuscule partout en UI | 10, 11, 23 | XS |
| 8 | Compléter transfert `completeBrandOnboarding` (audience_principale + ton_adjectifs) | 06 | S |
| 9 | Ajouter `loading.tsx` + `error.tsx` sur les 5 routes nav | 07-11 | S |
| 10 | Étendre `lib/post-creator/roadmaps.ts` aux 6 formats canoniques | 12 | S |

---

## Top 20 P1 cross-pages (priorisé)

| # | Item | Effort |
|---|---|---|
| 1 | Refonte `BrandOnboardingStep` étape piliers pour utiliser nouveau wizard | M |
| 2 | Suppression `<PiliersSheet>` legacy + composants associés | S |
| 3 | Migration tokens hex hardcodés `BrandOnboardingStep.tsx` → vars | S |
| 4 | Breadcrumb "Outils" → "Mes Outils" sur biblio/reviews/messages | XS |
| 5 | Things 3 task states cohérents sur `<TaskRow>` `/aujourd-hui` | S |
| 6 | Empty states unifiés (pas de zones blanches) sur outils sub-pages | M |
| 7 | Touch targets < 44px sur boutons archive `<PillarCard>` | XS |
| 8 | Confirmation actions destructrices avec sheet iOS (pas window.confirm) | S |
| 9 | `loading.tsx` + `error.tsx` également sur sous-routes programme | S |
| 10 | Compléter pages stubs (`/outils/moodboard`, `/outils/variations`) | L |
| 11 | Refonte `/outils/messages` (page non auditée en profondeur — état flou) | M |
| 12 | Page `/compte/parametres` — audit complet (skip Sprint 38) | M |
| 13 | Page accueil `/` publique — audit complet | M |
| 14 | Programme sous-pages `/strategie`, `/retombees`, `/bienvenue` — audit | L |
| 15 | Refonte ConseillerIntro pour palette v60 (cf. forest green leak) | S |
| 16 | Cacheable prompts à vérifier sur `propose-piliers` + autres actions LLM | S |
| 17 | Tests isolation multi-tenant 5/5 sur nouvelles tables `pillars` | M |
| 18 | Documentation `VOICE_SHEET_RULES` au-delà de la mention SACRED | S |
| 19 | Unifier les sheet patterns (Sheet vs SheetMaMarque vs ad-hoc) | M |
| 20 | Migrer `lib/post-creator/roadmaps.ts` 4 slugs → 6 slugs | S |

---

## Recommandation stratégique pour Sprint 39 → 41

### Vision V1.1 → V1.5 (3 sprints)

**Sprint 39 — Sécurité + Doctrine (1 semaine)**

Objectif : éliminer les 3 failles structurelles (sécurité multi-tenant,
doctrine drift, pilier_id branchage). Aucune nouvelle feature. Volume
estimé : 30-40 commits, 2K lignes code modifiées.

Critères de succès :
- ✅ Tests isolation 5/5 sur table `pillars` + `posts` après ajout
  `.eq('tenant_id', ...)` partout
- ✅ `skills/00-CONCEPT.md` + `01-ARCHITECTURE.md` + `10-SACRED.md` mis à
  jour avec date de validité
- ✅ `posts.pilier_id` branchée sur Post Creator + Editor + Bibliothèque
- ✅ Backfill JSONB → table executé sur les 3 clients pilotes
- ✅ Migrations retrait `piliers_narratifs` + `pilier_nom` créées (mais
  pas appliquées tant que backfill non validé sur prod)

**Sprint 40 — Polish UI (1 semaine)**

Objectif : nettoyer les 47 P1 cross-pages. Aucune nouvelle feature.
Pattern de cohérence visuelle bout-en-bout.

Critères :
- ✅ ZERO `#1F4937` dans le repo
- ✅ ZERO "onboarding" / "Conseiller" majuscule en UI utilisateur
- ✅ `loading.tsx` + `error.tsx` sur toutes les routes nav 5
- ✅ Empty states unifiés sur les 6 outils sub-pages
- ✅ Touch targets ≥ 44px partout (audit Playwright dimensions)
- ✅ Tokens `var(--color-*)` partout sauf mockups Instagram assumés

**Sprint 41 — Combler les angles morts (1 semaine)**

Objectif : auditer + traiter les 9 pages skipped Sprint 38 :
- `/` (accueil public)
- `/compte/parametres`, `/compte/mon-compte`, `/compte/ma-marque/brand-book`,
  `/compte/ma-marque/business-calendar`
- `/programme/strategie`, `/programme/retombees`, `/programme/bienvenue`,
  `/programme/post/[postId]`, `/programme/posts/[postId]`, `/programme/create`
- `/outils/post-creator/[format]` (audit en profondeur des 6 formats)

Critères :
- ✅ Audit Sprint 41 produit pour chaque page skipped
- ✅ Tous P0 trouvés Sprint 41 traités dans le même sprint
- ✅ Refonte `/outils/moodboard` + `/outils/variations` (stubs) en pages
  fonctionnelles minimum viable

### Au-delà Sprint 41

- **Sprint 42-44** : V2 features (auto-publication Instagram, multi-marque
  par tenant, Analytics tenant-side privacy-friendly).
- **Décision Apple Board** à provoquer avant Sprint 42 : faut-il maintenir
  l'absence de page `/signup` (B2B custom only) ou ouvrir self-service
  pour V2 ? Cf. `00-CONCEPT.md:60` mentionne 49€/mois en V2.

---

## Anti-évaluation : ce que cet audit ne couvre PAS

- **Performance Web Vitals** : aucun Lighthouse exécuté. À faire Sprint 40
  avec captures Playwright.
- **Accessibilité WCAG AA** : grep partiel (touch targets) mais pas
  d'audit Axe-core.
- **Sécurité côté Anthropic** : pas de vérif que les system prompts ne
  fuient pas en logs.
- **Backup + disaster recovery** : pas audité.
- **GDPR / RGPD** : pas audité (tenants EU, mais aucun pop-up cookie ni
  privacy policy lue).
- **Mobile responsive** : la spec mentionne 44px touch targets mais aucune
  capture mobile produite — à faire Sprint 41.
- **i18n EN/FR** : seul `lib/i18n/formats.ts` mentionne EN mais l'app
  semble 100% FR. À clarifier doctrine V1 vs V2.

---

## Citation anchor

> "lui faire croire que c'est lui qui pilote et que tout est sous contrôle
> avec un vrai tableau de bord, simple et efficace."
> — Ulysse, 12 mai 2026

L'audit confirme que **la promesse est tenue à 70%** : le pilote a un
`/aujourd-hui` Split Brief qui lui montre Prochaine action + État
programme + Suggéré. Mais les 30% manquants sont concentrés sur deux
points :
1. **Sentiment de contrôle dilué** sur `/ma-marque` (deux blocs piliers
   coexistent, le pilote ne sait pas lequel est canonique)
2. **Doctrine documentation drift** qui crée un risque que les prochains
   Sprint 39+ ne préservent pas cette promesse.

Le Sprint 39 doit re-cristalliser la promesse en éliminant les 3 failles
structurelles. Sans cela, la dette technique transforme la "tranquillité
du pilote" en "tranquillité apparente fragile".
