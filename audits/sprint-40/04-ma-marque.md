# Audit Sprint 40 — Page Ma Marque

> Verdict global : **À refactorer** (architecture massivement plus complète que la cible doctrinale V2.0)
> Doctrine de référence : `00-CONCEPT.md` §5 promesse 2 "Tu sais ce que ta marque dit. Ma Marque consigne l'identité éditoriale, les piliers signature, l'univers visuel, les ressources et les calendriers business." · §7 territoire Stratégie · §6 pilier 4 Aspirational Storytelling · `01-ARCHITECTURE.md` §1 (Ma Marque, section Éditorial) · §3.2 layout sub-sidebar 260px · `02-EXPERTS.md` §6.2 "F89 Wizard piliers : Hélène M. cascade un Sonnet 4.6".

---

## 1. Périmètre audité

### 1.1 Route principale

- `app/(ma-marque)/layout.tsx`
- `app/(ma-marque)/ma-marque/page.tsx` — Server Component, tableau de bord 14 rangs (Sprint 36.B.3).

### 1.2 Composants Ma Marque core (9 fichiers)

- `components/ma-marque/MaMarqueDashboard.tsx`
- `components/ma-marque/MarqueGroup.tsx`
- `components/ma-marque/MarqueRow.tsx`
- `components/ma-marque/MarquePreview.tsx`
- `components/ma-marque/EditBlocSheet.tsx`
- `components/ma-marque/SheetMaMarque.tsx`
- `components/ma-marque/SheetTexteSimple.tsx`
- `components/ma-marque/EtatMarque.tsx`
- `components/ma-marque/BarreFondations.tsx`

### 1.3 Composants Ma Marque par bloc

- `components/ma-marque/archives/SheetArchives.tsx`
- `components/ma-marque/benchmarks/SheetBenchmarks.tsx`
- `components/ma-marque/brand-book/SheetBrandBook.tsx`
- `components/ma-marque/calendrier/CalendrierBusinessSheet.tsx`
- `components/ma-marque/calendrier/CalendrierContext.tsx`
- `components/ma-marque/calendrier/CalendrierPreview.tsx`
- `components/ma-marque/canaux/SheetCanaux.tsx`
- `components/ma-marque/canaux/WaitlistModal.tsx`
- `components/ma-marque/cible/SheetCible.tsx`
- `components/ma-marque/objectifs/ObjectifsContext.tsx`
- `components/ma-marque/objectifs/ObjectifsPreview.tsx`
- `components/ma-marque/objectifs/ObjectifsSheet.tsx`
- `components/ma-marque/piliers/PiliersBanner.tsx`
- `components/ma-marque/piliers/PiliersContext.tsx`
- `components/ma-marque/piliers/PiliersPreview.tsx`
- `components/ma-marque/piliers/PiliersSheet.tsx`
- `components/ma-marque/piliers/SubSheetPilier.tsx`
- `components/ma-marque/ressources/RessourcesContext.tsx`
- `components/ma-marque/ressources/RessourcesPreview.tsx`
- `components/ma-marque/ressources/RessourcesSheet.tsx`
- `components/ma-marque/univers-refuse/SheetUniversRefuse.tsx`

### 1.4 Wizard piliers F89 (récent, doctrine V2.0 ✓)

- `components/pillars/PillarCard.tsx`
- `components/pillars/PillarEditSheet.tsx`
- `components/pillars/PillarWizardSheet.tsx`
- `components/pillars/PillarsManager.tsx`
- `lib/pillars/prompts.ts`
- `lib/pillars/types.ts`
- `app/_actions/pillars.ts`
- `app/_actions/generate-pillar-wizard.ts`
- `app/_actions/propose-piliers.ts`
- `app/api/ma-marque/propositions/route.ts`
- `app/api/ma-marque/regenerer-piliers/route.ts`
- `app/api/brand/pilier-propositions/route.ts`
- `lib/brand/propose-piliers-prompt.ts`
- `lib/ma-marque/prompts-pilier-propositions.ts`
- `lib/ma-marque/prompts.ts`

### 1.5 Onboarding et compte marque

- `components/compte/ma-marque/BrandBookGeneration.tsx`
- `components/compte/ma-marque/OnboardingFlow.tsx`
- `components/onboarding-marque/BrandOnboardingSheet.tsx`
- `components/onboarding-marque/BrandOnboardingHeaderCta.tsx`
- `components/onboarding-marque/BrandOnboardingStep.tsx`
- `components/onboarding-marque/BrandOnboardingTrigger.tsx`
- `app/_actions/brand-onboarding.ts`
- `app/api/onboarding/complete/route.ts`
- `app/(onboarding)/onboarding/analyse-marque/page.tsx`
- `app/(onboarding)/layout.tsx`
- `lib/brand-onboarding/types.ts`

Note : `components/onboarding/OnboardingFlow.legacy-sprint34.tsx` est marqué `legacy`.

### 1.6 Lib Ma Marque

- `lib/ma-marque/completude.ts`
- `lib/ma-marque/prompts.ts`
- `lib/ma-marque/prompts-pilier-propositions.ts`
- `lib/ma-marque/score.ts`
- `lib/supabase/brands.ts`

### 1.7 Server actions Ma Marque

- `app/_actions/propose-piliers.ts`
- `app/_actions/brand-onboarding.ts`
- `app/_actions/generate-pillar-wizard.ts`
- `app/_actions/pillars.ts`
- `app/api/brand/archives/route.ts` + `archives/[id]/route.ts`
- `app/api/brand/update/route.ts`
- `app/api/brand/upload/route.ts`
- `app/api/brand/waitlist/route.ts`
- `app/api/ai/brand-book/route.ts`

### 1.8 Migrations Supabase liées

- `001_initial_schema.sql`, `002_rls_policies.sql`, `003_seed_tenants.sql`, `004_neutralize_tenant_themes.sql`
- `007_brands_extension.sql`, `008_brands_enrichissement.sql`, `009_brand_completeness.sql`
- `010_channel_waitlist.sql`, `017_reviews.sql` (cf. autres pages aussi)
- `018_library_documents.sql` (cf. Bibliothèque)
- `020_brand_metrics.sql`
- `021_brand_onboarding_sessions.sql`
- `025_pillars.sql` (V2.0 conforme)
- `026_posts_pilier_id_fk.sql` (V2.0 conforme, FK progressive)

---

## 2. Confrontation à la doctrine

### `app/(ma-marque)/ma-marque/page.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §5 promesse 2 ; `02-EXPERTS.md` §6.2 F89 wizard ; `01-ARCHITECTURE.md` §3.2 sub-sidebar 260px.
- **Constat factuel :** Tableau de bord 14 rangs pattern iOS Settings. `MaMarqueDashboard` cohabite avec `PillarsManager` (migration progressive).
- **Écart constaté :**
  1. Le commentaire d'en-tête mentionne "tableau de bord 14 rangs" — vocabulaire à clarifier (composant interne tolérable, mais "tableau de bord" en commentaire reste un signal).
  2. Cohabitation de deux gestionnaires de piliers : `MaMarqueDashboard` (legacy 14 rangs avec `<PiliersSheet>`) + `<PillarsManager>` F89 (V2.0). À résoudre Sprint 39 (P0.W.2 audit Sprint 38).
  3. Utilise `createAdmin` (cf. ligne 12 import) → P0 multi-tenant (cf. `10-transverse.md` §1).
- **Action proposée Phase 2 :** Audit `createAdmin` usage exact. Marquer `MaMarqueDashboard` comme deprecated dans son commentaire d'en-tête (sans suppression — migration progressive).

### `app/(ma-marque)/layout.tsx`
- **Statut doctrinal :** À refactorer
- **Action proposée Phase 2 :** Vérification layout sub-sidebar 260px.

### `components/ma-marque/MaMarqueDashboard.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §9 "dashboard, tableau de bord (en UI visible)". `03-VOICE_SHEET.md` §9 (assouplissement code).
- **Constat factuel :** Orchestrateur client Ma Marque, 14 blocs, layout 2 colonnes desktop.
- **Écart constaté :** Nom de composant interne "Dashboard" tolérable mais signal. La doctrine V2.0 favorise une grammaire "ma marque" / "doctrine éditoriale". À renommer Sprint 41+.
- **Action proposée Phase 2 :** Conserver. Renommer Sprint 43+ en `MaMarqueView`.

### `components/ma-marque/EtatMarque.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §3 anti-référence "Pas de métriques inventées qui simulent un contrôle". `10-SACRED.md` "Pas de gamification".
- **Constat factuel :** Phrase d'état contextuelle + `<BarreFondations>` sous la phrase. Commentaire revendique "Pilier 4 — aspirational storytelling" + "anti-gamification".
- **Écart constaté :** Le composant porte "Barre de fondations" qui peut être lue comme une jauge de progression — frontière mince avec la gamification soft. À auditer le rendu visuel Sprint 41.
- **Action proposée Phase 2 :** Conserver provisoirement. Audit visuel Sprint 41 — si la barre crée pression visuelle "remplis-la !" → Recalé.

### `components/ma-marque/BarreFondations.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `10-SACRED.md` "Pas de gamification, jamais. Pas de streaks. Pas de badges. Pas de XP."
- **Constat factuel :** Barre de progression 6px, segments noirs/gris. Commentaire revendique "anti-gamification". `aria-label` dit `${complets + partiels} blocs sur ${total} en cours`.
- **Écart constaté :** Même si la barre est sobre, elle reste une jauge visible. Le mot "fondations" lui-même remonte à la méthode pédagogique 4 mois (dégagée).
- **Action proposée Phase 2 :** Investiguer. Si la barre est sobre et que le contexte de complétude est utile → garder + renommer. Sinon Recalé.

### `components/ma-marque/MarqueGroup.tsx`, `MarqueRow.tsx`, `MarquePreview.tsx`, `EditBlocSheet.tsx`, `SheetMaMarque.tsx`, `SheetTexteSimple.tsx`
- **Statut doctrinal :** Validé (à raffiner copies Sprint 41)
- **Référence doctrine :** §5 promesse 2.
- **Action proposée Phase 2 :** Audit copies fine.

### Sous-arbre `archives/SheetArchives.tsx`
- **Statut doctrinal :** Validé (archives = mémoire éditoriale, doctrine §5 promesse 7 "Élise M., Experte Archives & Mémoire").
- **Action proposée Phase 2 :** Audit copies Sprint 41.

### Sous-arbre `benchmarks/SheetBenchmarks.tsx`
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Aucune action structurelle.

### Sous-arbre `brand-book/SheetBrandBook.tsx`
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Audit copies.

### Sous-arbre `calendrier/CalendrierBusinessSheet.tsx`, `CalendrierContext.tsx`, `CalendrierPreview.tsx`
- **Statut doctrinal :** Validé
- **Référence doctrine :** §5 promesse 3 "Le Calendrier… Calendriers business". Ces composants concernent le **calendrier business** (ancrages éditoriaux récurrents), différent du Calendrier top-level (publications futures).
- **Action proposée Phase 2 :** Aucune. Distinguer Sprint 41 le calendrier business (Ma Marque) du Calendrier des publications (top-level).

### Sous-arbre `canaux/SheetCanaux.tsx`, `WaitlistModal.tsx`
- **Statut doctrinal :** Validé
- **Référence doctrine :** §5 promesse 5 (canaux multi-platforme).
- **Action proposée Phase 2 :** Audit copies.

### Sous-arbre `cible/SheetCible.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §10 vocabulaire encouragé "la cible → la communauté, les lecteurs".
- **Écart constaté :** Le mot "cible" lui-même est dans la liste vocabulaire à éviter.
- **Action proposée Phase 2 :** Renommer Sprint 43+ (impact architecture). Pour Sprint 40, audit copies.

### Sous-arbre `objectifs/ObjectifsContext.tsx`, `ObjectifsPreview.tsx`, `ObjectifsSheet.tsx`
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Audit copies.

### Sous-arbre `piliers/PiliersBanner.tsx`, `PiliersContext.tsx`, `PiliersPreview.tsx`, `PiliersSheet.tsx`, `SubSheetPilier.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §6 cross-pages (pilier = entité partagée). `02-EXPERTS.md` §6.2 F89.
- **Constat factuel :** Architecture legacy piliers Ma Marque, à harmoniser avec `<PillarsManager>` F89.
- **Écart constaté :** Cohabitation des deux systèmes (migration progressive). À résoudre Sprint 41.
- **Action proposée Phase 2 :** Conserver provisoirement. Marquer `@deprecated` PiliersSheet legacy une fois `<PillarsManager>` validé en autonomie.

### Sous-arbre `ressources/RessourcesContext.tsx`, `RessourcesPreview.tsx`, `RessourcesSheet.tsx`
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Audit copies.

### Sous-arbre `univers-refuse/SheetUniversRefuse.tsx`
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Audit copies.

### `components/pillars/PillarCard.tsx`, `PillarEditSheet.tsx`, `PillarWizardSheet.tsx`, `PillarsManager.tsx`
- **Statut doctrinal :** Validé
- **Référence doctrine :** `02-EXPERTS.md` §6.2 F89 wizard piliers Hélène M. cascade Sonnet 4.6. Sprint 37+.
- **Constat factuel :** Implémentation V2.0 conforme.
- **Action proposée Phase 2 :** Aucune action structurelle. Audit Sprint 43+ pour aligner sur signature Hélène M. dans copy.

### `lib/pillars/prompts.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md` §1 "Hélène M. est l'orchestratrice".
- **Constat factuel :** Prompts wizard piliers (5 questions + 3 propositions) calibrés avec exemples Sarrabezolles/Angelina/Comptoir Général.
- **Écart constaté :** Signature Hélène à expliciter Sprint 43+. Aujourd'hui prompts non rattachés à un Expert.
- **Action proposée Phase 2 :** Audit Sprint 43+ pour aligner sur signature Hélène M.

### `lib/pillars/types.ts`
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Aucune.

### `app/_actions/pillars.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `04-MULTI_TENANT.md` "Le pattern fautif identifié au Sprint 38 — `createAdmin()` + `.eq('id', ...)` sans vérification d'appartenance — est interdit."
- **Constat factuel :** CRUD Pillars. Utilise `createAdmin` (cf. grep `10-transverse.md` §1).
- **Écart constaté :** P0 multi-tenant sur les mutations `updatePillar`, `archivePillar` (déjà identifié Sprint 38).
- **Action proposée Phase 2 :** Documenter le patch dans `10-transverse.md` §1. Patch concret laissé à Sprint dédié.

### `app/_actions/generate-pillar-wizard.ts`
- **Statut doctrinal :** Validé
- **Référence doctrine :** §6.2 F89.
- **Action proposée Phase 2 :** Audit Sprint 43+ pour signature Expert.

### `app/_actions/propose-piliers.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md` §6.2.
- **Constat factuel :** Action de proposition de piliers — duplique potentiellement F89.
- **Écart constaté :** Doublon potentiel avec `generate-pillar-wizard.ts`. À investiguer.
- **Action proposée Phase 2 :** Investiguer. Probablement à supprimer si redondant.

### `app/api/ma-marque/propositions/route.ts`, `regenerer-piliers/route.ts`
- **Statut doctrinal :** À refactorer
- **Action proposée Phase 2 :** Audit Sprint 41 — fusionner les endpoints redondants avec F89.

### `app/api/brand/pilier-propositions/route.ts`
- **Statut doctrinal :** À refactorer
- **Action proposée Phase 2 :** Idem.

### `lib/brand/propose-piliers-prompt.ts`, `lib/ma-marque/prompts-pilier-propositions.ts`, `lib/ma-marque/prompts.ts`
- **Statut doctrinal :** À refactorer
- **Constat factuel :** Trois fichiers de prompts piliers avec scopes proches.
- **Action proposée Phase 2 :** Consolidation Sprint 41.

### `lib/ma-marque/completude.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `10-SACRED.md` anti-gamification.
- **Constat factuel :** Calcul complétude 14 blocs. Phrase contextuelle. Commentaire "doctrine : pas de pourcentage chiffré global". Score qualitatif "Trois prioritaires".
- **Écart constaté :** Concept "complétude 14 blocs" potentiellement aligné, mais le mot "fondations" associé pose le même problème que `BarreFondations.tsx`.
- **Action proposée Phase 2 :** Conserver. Renommer Sprint 43+ ("complétude" → "doctrine de marque" ou similaire).

### `lib/ma-marque/prompts.ts`, `lib/ma-marque/prompts-pilier-propositions.ts`
- **Statut doctrinal :** À refactorer
- **Action proposée Phase 2 :** Consolidation Sprint 41.

### `lib/ma-marque/score.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `10-SACRED.md` anti-gamification. `00-CONCEPT.md` §3 anti-référence "métriques inventées".
- **Constat factuel :** Helper de scoring.
- **Écart constaté :** Le mot "score" et la nature même posent question. À vérifier qu'il ne calcule pas un score affiché en UI.
- **Action proposée Phase 2 :** Investiguer. Si score utilisé en UI → Recalé. Sinon À refactorer (renommer en `priority.ts` ou similaire).

### `lib/supabase/brands.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `04-MULTI_TENANT.md`.
- **Constat factuel :** Helper `getBrandByTenantId`.
- **Action proposée Phase 2 :** Audit Sprint 41 sécurité multi-tenant.

### Onboarding marque

- `components/compte/ma-marque/BrandBookGeneration.tsx`
- `components/compte/ma-marque/OnboardingFlow.tsx`
- `components/onboarding-marque/BrandOnboardingSheet.tsx`
- `components/onboarding-marque/BrandOnboardingHeaderCta.tsx`
- `components/onboarding-marque/BrandOnboardingStep.tsx`
- `components/onboarding-marque/BrandOnboardingTrigger.tsx`
- `app/(onboarding)/onboarding/analyse-marque/page.tsx`
- `app/(onboarding)/layout.tsx`
- `lib/brand-onboarding/types.ts`
- `app/_actions/brand-onboarding.ts`
- `app/api/onboarding/complete/route.ts`

- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §6 pilier 8 "Au premier login, Floriane voit déjà sa marque… pré-remplis intelligemment par l'onboarding initial." `00-CONCEPT.md` §9 vocabulaire interdit "onboarding (en UI visible)".
- **Constat factuel :** Architecture onboarding marque + analyse marque.
- **Écart constaté :**
  1. Mot "onboarding" en route URL = visible utilisateur (jargon SaaS).
  2. Concept d'onboarding visible Floriane contredit §6 pilier 8 (pré-remplissage par Lead). Mais en V1 c'est probablement nécessaire (pas encore d'admin Lead UI complet).
- **Action proposée Phase 2 :** Conserver provisoirement. Renommer "onboarding" → "premiers pas" ou "mise en route" Sprint 43+.

### `components/onboarding/OnboardingFlow.legacy-sprint34.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 "Onboarding 10 questions (remplacé par F89 wizard piliers 5 questions)".
- **Constat factuel :** Le fichier porte explicitement `.legacy-sprint34` dans son nom.
- **Écart constaté :** Legacy assumé.
- **Action proposée Phase 2 :** Supprimer. Backup `archive/v1-leftovers/onboarding-legacy/`.

### `components/onboarding/ConseillerIntro.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 abandon Conseiller.
- **Action proposée Phase 2 :** Supprimer. Backup.

### `components/onboarding/OnboardingChoiceStep.tsx`, `OnboardingFlow.tsx`, `OnboardingProgress.tsx`, `OnboardingStep.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** §9 vocabulaire "onboarding (en UI visible)".
- **Action proposée Phase 2 :** Audit Sprint 41 — renommer ou remplacer.

### Migrations Supabase Ma Marque
- `001`, `002`, `003`, `004`, `007`, `008`, `009`, `010`, `020`, `021` → Schema brand + tenants.
- `025_pillars.sql`, `026_posts_pilier_id_fk.sql` → V2.0 conforme.
- **Statut doctrinal :** À refactorer (mixed)
- **Référence doctrine :** `04-MULTI_TENANT.md`.
- **Constat factuel :** Schéma multi-tenant respecté. RLS active.
- **Écart constaté :** `020_brand_metrics.sql` à examiner (cf. anti-référence métriques inventées).
- **Action proposée Phase 2 :** Audit dans `10-transverse.md` §5.

---

## 3. Confrontation à la spec HTML

**[doctrine silencieuse sur la spec HTML]**.

La doctrine couvre :
- `01-ARCHITECTURE.md` §1 Ma Marque = destination Éditorial.
- §3.2 sub-sidebar 260px → code actuel = layout 2 colonnes 40/60 (Sprint 36.B.4), proche mais pas identique.
- `00-CONCEPT.md` §5 promesse 2 = doctrine éditoriale + piliers signature + univers visuel + ressources + calendriers business.
- F89 wizard piliers (5 questions + 3 propositions) → implémenté côté `components/pillars/` ✓.

---

## 4. Résumé chiffré

| Verdict | Nombre |
|---|---|
| Validés | 12 |
| À refactorer | 35 |
| Recalés | 2 |
| Total fichiers Ma Marque audités | ~49 |

Recalés :
1. `components/onboarding/OnboardingFlow.legacy-sprint34.tsx`
2. `components/onboarding/ConseillerIntro.tsx`

---

## 5. Recommandation pour Phase 2

### 5.1 Suppressions (`proposed-deletions.md`)

- `components/onboarding/OnboardingFlow.legacy-sprint34.tsx`
- `components/onboarding/ConseillerIntro.tsx`

### 5.2 Refactor automatique

- Marquer `@deprecated` les sheets piliers legacy (`PiliersSheet.tsx` etc.) dans leur commentaire d'en-tête, en pointant `<PillarsManager>` F89 comme successeur.
- Marquer `@deprecated` `MaMarqueDashboard` (renommage différé Sprint 43+).
- Vérifier vocabulaire copies (grep, cf. `10-transverse.md` §4).

### 5.3 Hors scope Sprint 40 (Sprint 41+)

- Consolidation des prompts piliers (3 fichiers dispersés).
- Suppression de `app/_actions/propose-piliers.ts` si redondant avec F89.
- Renommage "cible" → "communauté/lecteurs" (impact texte + composant).
- Patch sécurité multi-tenant sur `app/_actions/pillars.ts` et autres mutations.
- Investigation de `lib/ma-marque/score.ts` (renommer si pas en UI, supprimer sinon).
- Renommer dossiers `onboarding/` → `premiers-pas/` (impact router).
- Audit visuel `BarreFondations` (frontière gamification).
- Tag deprecated migration `020_brand_metrics.sql` si métriques inventées.
