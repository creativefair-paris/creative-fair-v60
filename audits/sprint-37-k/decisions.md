# Mégasprint 37.K — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité Sprint 37.J → 37.K.

6 commits livrés : 1 commit groupé F87+F86+F88, puis 5 commits F89 (migrations, actions, sub-prompt, UI, integration). Build vert tout du long.

---

## Synthèse

| # | Chantier | Statut |
|---|---|---|
| 1 | F87 — PostCreatorHubPreview layout stack vertical | ✅ Livré |
| 2 | F86 — Factorisation `<InstagramIOSMockup>` (@creativefair.paris + halos statiques) | ✅ Livré |
| 3 | F88 — `<ConseillerIPhoneMockup>` (iOS Messages : avatar pastel + bulles alternées) | ✅ Livré |
| 4 | F89.migrations — Table `pillars` + FK `posts.pilier_id` | ✅ Livré |
| 5 | F89.actions — CRUD server actions piliers persistés | ✅ Livré |
| 6 | F89.subprompt — Sonnet 4.6 : 5 questions + 3 propositions | ✅ Livré |
| 7 | F89.ui — PillarsManager + Wizard 3 étapes + Edit Sheet | ✅ Livré |
| 8 | F89.integration — PillarsManager monté sur `/ma-marque` | ✅ Livré |

---

## F87 — PostCreatorHubPreview stack vertical

### Diagnostic

Layout cassé sur `/outils` : grille `repeat(2, 1fr)` masquait la moitié des 6 cartes formats derrière le mockup Instagram preview.

### Fix appliqué

- `components/outils/previews/PostCreatorHubPreview.tsx`
- `.cfs-format-cards-grid` : `display: flex; flex-direction: column; gap: 8px` (au lieu du grid 2×2).
- `<aside>` mockup : `position: sticky; top: 24; align-self: start` pour rester visible pendant le scroll des cartes.

---

## F86 — `<InstagramIOSMockup>` factorisé

### Diagnostic

Sprint 37.I (F79) avait inliné un mockup Instagram dans `ToolMockup.tsx` (184 lignes) avec username `tamarque.paris` et gradient subtle dans l'image. Sprint 37.J avait dupliqué une variante dans la preview hub. Trop de copies, vocabulaire username pas aligné.

### Fix appliqué

- Création de `components/outils/mockups/InstagramIOSMockup.tsx` (~250 lignes)
- Username par défaut : `creativefair.paris` (passé en prop, surchargeable).
- Caption par défaut : `« L'histoire derrière ta création préférée… »`
- 6 halos pastels **statiques** (pas de drift animation) : rose `#FFC8DC`, lilac `#C8B4FF`, bleu pâle `#B4D2FF`, beige, lavande, vert pâle.
- Story ring : `linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)` (gradient Instagram officiel).
- SF Pro stack + SF Symbols-style outline SVGs (heart, comment, paper plane, bookmark).
- Styles scopés via composant local `<Styles />`.

`ToolMockup.tsx` : `PostCreatorMockup()` réduit à `return <InstagramIOSMockup />` (suppression de 184 lignes inlinées).

---

## F88 — `<ConseillerIPhoneMockup>` iOS Messages

### Diagnostic

L'ancien mockup conseiller (Sprint 37.D / 37.I) était une bulle bleue plate + 3 boutons-choix verticaux. Rendu peu évocateur du flow conversationnel réel.

### Fix appliqué

- Création de `components/outils/mockups/ConseillerIPhoneMockup.tsx` (~200 lignes)
- Header iOS Messages : back arrow `‹`, avatar 32px, nom `conseiller` (minuscule, doctrine), info `ⓘ`.
- Avatar gradient signature CF : `linear-gradient(135deg, #FFB5C5 0%, #C8B5FF 50%, #B5D5FF 100%)`.
- 3 bulles alternées :
  - User droite bleue iMessage `#007AFF` : « J'aimerais lancer une série sur l'histoire de mes pièces »
  - Assistant gauche gris `#E9E9EB` : « Bonne idée. On regarde tes archives ensemble pour identifier 3 pièces qui méritent leur récit. »
  - User droite courte (max-width 60%) : « On commence quand ? »
- Bord asymétrique `border-bottom-right-radius: 4px` (user) / `border-bottom-left-radius: 4px` (assistant) pour effet de queue iMessage.
- Input bar décoratif + bouton send circulaire en bas.

`ToolMockup.tsx` : `ConseillerMockup()` réduit à `return <ConseillerIPhoneMockup />`.

---

## F89 — Wizard piliers complet (feature structurelle)

### Doctrine retenue

- **Persistance vraie** dans une nouvelle table `pillars` (au lieu du JSONB `brands.piliers_narratifs` hérité Sprint 36).
- **Migration progressive** : les deux systèmes coexistent en V1. La table `pillars` est lue par le nouveau `<PillarsManager>` sur `/ma-marque`. L'ancien bloc piliers du `<MaMarqueDashboard>` reste affiché. Sprint 38+ décidera du backfill et retrait du JSONB.
- **Soft cap V1** : warning à 5+, hard cap à 7 (constantes `PILLARS_SOFT_CAP_WARN=5`, `PILLARS_HARD_CAP=7`).
- **Soft delete** via `archived_at` : les posts existants peuvent référencer un pilier archivé (FK `on delete set null` + colonne legacy `pilier_nom` TEXT conservée).
- **Audit complet** : `questions_answers` JSONB conserve l'historique des 5 questions guidées + réponses, `generation_model` audit le modèle Sonnet utilisé.

### F89.migrations

`supabase/migrations/025_pillars.sql` (idempotent) :

- Table `pillars (id, tenant_id, brand_id, title, description, color_hex, position, questions_answers JSONB, generation_model, archived_at, created_at, updated_at)`.
- Contraintes DB : `title <= 50 char`, `description <= 500 char`. Validation 3 mots applicative (V1 souple côté DB).
- Indexes partiels `WHERE archived_at IS NULL` sur `(brand_id)` et `(tenant_id)`.
- RLS 4 policies (select/insert/update/delete) via `public.user_tenant_id()` — pattern existant migrations 015-021.
- Trigger `update_updated_at_column()` (création conditionnelle si fonction absente).

`supabase/migrations/026_posts_pilier_id_fk.sql` (idempotent) :

- `posts.pilier_id uuid references pillars(id) on delete set null`
- Index partiel `WHERE pilier_id IS NOT NULL`.
- `posts.pilier_nom` legacy conservé pour V1.

### F89.actions

`lib/pillars/types.ts` + `app/_actions/pillars.ts` :

- `listPillars(brandId)` : lecture RLS native (pas d'admin), ordonné par position.
- `createPillar(input)` : validation titre 3 mots applicatif, hard cap 7 vérifié, position auto `max+1`, RLS via `tenant_id` du profile, écriture via admin (pattern existant), `revalidatePath('/ma-marque')`.
- `updatePillar(id, updates)` : `Partial<Pick<PillarRow, 'title' | 'description' | 'color_hex' | 'position'>>`, re-valide la contrainte 3 mots.
- `archivePillar(id)` : soft delete `archived_at = now()`.
- Tous retournent `{ ok: true; ... } | { ok: false; reason: string }`. Structured logging `[pillars] <action>_failed`.

### F89.subprompt

`lib/pillars/prompts.ts` + `app/_actions/generate-pillar-wizard.ts` :

- Deux server actions :
  - `generatePillarQuestions(brandId)` → `PillarQuestion[5]` (id, label, placeholder)
  - `generatePillarPropositions(brandId, answers)` → `PillarProposition[3]` (title, description)
- **Cascade** : `claude-sonnet-4-6` → `claude-sonnet-4-5` (404 fallback uniquement). Pas de cascade Opus — flow user-initiated court, coût/latence acceptable.
- **System prompts** calibrés via exemples concrets : "L'accident génial" (Carlo Sarrabezolles), "Sucre vivant" (Angelina Paris), "Lieu refuge" (Le Comptoir Général). Mauvais exemples explicites à éviter : "Inspiration", "Lifestyle", "Behind the scenes".
- Prompt étape 1 demande des questions **ouvertes**, **concrètes**, **ancrées** dans la singularité de la marque + non-redondantes avec les piliers existants.
- Prompt étape 2 force `title 2-4 mots` + `description 2-3 phrases 250 char max` + interdiction de dupliquer un pilier déjà en place.
- Validation JSON strict via `extractJsonFromText` (helper Sprint 37.F existant).
- Cache ephemeral sur le system prompt (pattern Anthropic SDK existant).

### F89.ui

4 composants dans `components/pillars/` :

- **`PillarCard`** : 260px wide × 180px min, glass blur `rgba(255,255,255,0.55) + backdrop-filter blur(12px) saturate(140%)`, bandeau couleur 3px en tête (color_hex ou bleu iOS par défaut), title clamp 2L, description clamp 4L, bouton archiver discret en bas.
- **`PillarAddCard`** : carte dashed `1.5px dashed rgba(0,0,0,0.18)`, hover bleu iOS subtle, label dynamique ("Définir mon premier pilier" si vide, sinon "Ajouter un pilier").
- **`PillarWizardSheet`** : Sheet glass-thick 3 étapes
  1. **Questions** : 5 textareas (les réponses optionnelles, 1 suffit) + spinner + CTA "Voir les pistes".
  2. **Propositions** : 3 cartes cliquables (hover border bleu).
  3. **Edit** : inputs title (compteur mots `n / 3`, rouge si > 3) + description (compteur char `n / 500`).
  - Persistance via `createPillar` à la validation étape 3. `questions_answers` JSONB enregistré pour audit.
- **`PillarEditSheet`** : Sheet rapide ouvert au click sur une carte existante. Mêmes validations.
- **`PillarsManager`** : orchestrateur client. Row scrollable `overflow-x auto + scroll-snap`. Soft cap (≥5 et <7) → banner orange "tu approches du cap, réfléchis avant d'en ajouter". Hard cap (≥7) → banner rouge + `<PillarAddCard>` désactivée.

### F89.integration

`app/(ma-marque)/ma-marque/page.tsx` :

- Fetch des piliers actifs côté server (RLS automatique via supabase user-scoped). Try/catch gracieux si migration 025 pas encore appliquée.
- Injection du `<PillarsManager brandId initialPillars />` dans un `cfs-page-container` 24px sous le `<MaMarqueDashboard>`.
- L'étape `piliers` de l'onboarding-marque (`components/onboarding-marque/BrandOnboardingStep.tsx`) reste inchangée — toujours sur le JSONB legacy. Pas de refonte onboarding dans 37.K (out of scope, migration progressive).

---

## Doctrine appliquée

- ✅ **Subtraction over addition** : F86 supprime 184 lignes inlinées au profit d'un composant factorisé. F88 remplace un rendu plat par un mockup conversationnel sans gonfler le bundle.
- ✅ **Migration progressive** : F89 n'écrase pas `brands.piliers_narratifs`. Les deux systèmes coexistent. Sprint 38+ décidera du retrait.
- ✅ **6 formats canoniques** : aucun touche à `lib/i18n/formats.ts`.
- ✅ **Vocabulaire interdit absent** : aucune occurrence de `stats|analytics|dashboard|performance|growth|métrique|KPI` introduite. `MaMarqueDashboard` est legacy (Sprint 36.B.3) et reste, mais aucun nouveau composant F89 ne réutilise ce terme.
- ✅ **Tutoiement** : "Tu approches du cap", "Donne un titre à ton pilier", "Resserre".
- ✅ **`conseiller` minuscule** dans le mockup F88.
- ✅ **Username `@creativefair.paris`** dans le mockup F86.
- ✅ **Structured logging** : `[pillars] <action>_failed`, `[pillar-wizard] questions_response { ms, model }`.
- ✅ **Audit modèle** persisté : `pillars.generation_model = 'sonnet-4-6'`.

---

## Build status

- `tsc --noEmit` vert sur les 6 commits.
- Pas d'eslint warnings introduits (les composants suivent le pattern inline-styles existant).
- Pas de regression sur les routes existantes (`/outils`, `/ma-marque`).

---

## Reste pour Sprint 38

- Backfill `brands.piliers_narratifs` JSONB → table `pillars` (script ponctuel).
- Décider du retrait définitif de `piliers_narratifs` et `posts.pilier_nom` legacy.
- Refonte de l'étape `piliers` de l'onboarding-marque (`BrandOnboardingStep`) pour utiliser le nouveau wizard.
- `posts.pilier_id` à brancher dans la création de post (Post Creator V2).
- Drag-and-drop reorder des `PillarCard` (mise à jour `position`).
