# Audit Sprint 40 — Page Mon Programme

> Verdict global : **À refactorer** (concept doctrinal V2.0 OK, implémentation V1 massivement décalée)
> Doctrine de référence : `00-CONCEPT.md` §5 promesse 6 "Tu programmes sans paniquer. Mon Programme te montre le pilotage trimestriel et hebdomadaire : suggestions de la semaine, piliers actifs, heatmap calendrier 30 jours. Sans métriques inventées." · `01-ARCHITECTURE.md` §1 (Mon Programme, section Éditorial) · §6 cross-pages (piliers, posts).

---

## 1. Périmètre audité

### 1.1 Routes (groupe `(programme)/programme/`)

Repo actuel utilise `/programme` ; doctrine V2.0 attend `/mon-programme`.

- `app/(programme)/layout.tsx` — shell du groupe.
- `app/(programme)/programme/page.tsx` — page principale Sprint 36.B.3 Split Brief 40/60.
- `app/(programme)/programme/create/page.tsx` — création de programme via wizard.
- `app/(programme)/programme/bienvenue/page.tsx` — page de bienvenue.
- `app/(programme)/programme/strategie/page.tsx` — sous-page Stratégie.
- `app/(programme)/programme/retombees/page.tsx` — sous-page Retombées (publications passées).
- `app/(programme)/programme/post/[postId]/page.tsx` — détail post (1).
- `app/(programme)/programme/posts/[postId]/page.tsx` — détail post (2 — doublon).

### 1.2 Composants programme (33 fichiers)

- `components/programme/ProgrammeDashboard.tsx` — orchestrateur Split Brief 40/60 (Sprint 36.B.3).
- `components/programme/ProgrammeHero.tsx`
- `components/programme/ProgrammeSidebar.tsx`
- `components/programme/ProgrammeSplitShell.tsx`
- `components/programme/ProgrammeCalendarView.tsx`
- `components/programme/CalendarListView.tsx`
- `components/programme/CalendarMonthView.tsx`
- `components/programme/CalendarPostCard.tsx`
- `components/programme/CalendarToggle.tsx`
- `components/programme/CalendarView.tsx`
- `components/programme/CalendarViewSwitcher.tsx`
- `components/programme/CalendarWeekView.tsx`
- `components/programme/VueMois.tsx`
- `components/programme/VueSemaine.tsx`
- `components/programme/ChipsPiliersActifs.tsx`
- `components/programme/CoachingCard.tsx`
- `components/programme/CoachingGenerator.tsx`
- `components/programme/ConseillerAccess.tsx` — entrées Conseiller depuis /programme.
- `components/programme/DeletePostButton.tsx`
- `components/programme/MiniPostCard.tsx`
- `components/programme/NewPlanPedagogyOverlay.tsx`
- `components/programme/NewPostModal.tsx`
- `components/programme/NextAction.tsx`
- `components/programme/PeriodSelectionSheet.tsx`
- `components/programme/PlanPreview.tsx`
- `components/programme/PostDetailSheet.tsx`
- `components/programme/PostEditor.tsx`
- `components/programme/PostMiniChat.tsx`
- `components/programme/PostPreviewOverlay.tsx`
- `components/programme/RetombeesEditor.tsx`
- `components/programme/SuggestionsPanel.tsx`
- `components/programme/WelcomeURLCleaner.tsx`
- `components/programme-create/MarqueIncompleteWarning.tsx`
- `components/programme-create/ProgrammeCreateForm.tsx`

### 1.3 Composants Retombées (publications passées V1)

- `components/retombees/AppMetricsSection.tsx`
- `components/retombees/RetombeesQualitativesList.tsx`
- `components/retombees/RetombeesQuantitativesGrid.tsx`

### 1.4 Composants Stratégie

- `components/strategie/EstimationsList.tsx`
- `components/strategie/EventIntentionCard.tsx`
- `components/strategie/IndicateursEditorialsList.tsx`

### 1.5 Server actions Programme

- `app/_actions/generate-plan-from-form.ts`
- `app/_actions/generate-plan-from-wizard.ts`
- `app/_actions/estimate-programme-outcomes.ts`
- `app/_actions/strategie-events-intention.ts`
- `app/_actions/update-post.ts`
- `app/_actions/update-post-retombees.ts`
- `app/_actions/catch-up-overdue-posts.ts`
- `app/api/programme/etendre/route.ts`
- `app/api/programme/generer/route.ts`

### 1.6 Lib programme

- `lib/programme/colors.ts`
- `lib/programme/compute-indicateurs-editoriaux.ts`
- `lib/programme/dominance.ts`
- `lib/programme/extension.ts`
- `lib/programme/generation.ts`
- `lib/programme/prompts.ts`
- `lib/programme/strategie-estimations-prompt.ts`
- `lib/programme/strategie-events-intention-prompt.ts`
- `lib/programme/wizard-generation.ts`
- `lib/programme/wizard-prompt.ts`
- `lib/programme/wizard-steps-config.ts`
- `lib/programme-creation/types.ts`

### 1.7 Migrations Supabase liées

- `005_programmes.sql` — table programmes.
- `006_posts.sql` — table posts.
- `013_posts_reported_from.sql`
- `016_posts_retombees.sql`
- `019_programme_creation_sessions.sql`
- `022_posts_format.sql`
- `023_programmes_dates.sql`
- `024_posts_caption_complete.sql`

### 1.8 Types

- `types/outils.ts` (et autres types/programme inférés).
- `lib/types/post.ts`

---

## 2. Confrontation à la doctrine

### `app/(programme)/programme/page.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §5 promesse 6 "Mon Programme te montre le pilotage trimestriel et hebdomadaire : suggestions de la semaine, piliers actifs, heatmap calendrier 30 jours. Sans métriques inventées." `01-ARCHITECTURE.md` §1 destination "Mon Programme" (canonique, pas "/programme"). §3.2 layout sub-sidebar 260px.
- **Constat factuel :** Server Component. Layout Split Brief 40/60 via `<ProgrammeSplitShell>`. Hero gauche + Calendrier droit. Importe `ConseillerAccess`, `WelcomeURLCleaner`, `PlanPreview`, `NewPlanPedagogyOverlay`.
- **Écart constaté :**
  1. Route `/programme` ≠ `/mon-programme` doctrinal.
  2. Layout Split Brief 40/60 ≠ doctrine §3.2 sub-sidebar 260px.
  3. Import `ConseillerAccess` = entrée Conseiller V1 Recalée.
  4. Import `NewPlanPedagogyOverlay` = overlay pédagogie 4 mois Recalée (`00-CONCEPT.md` §14).
  5. `maxDuration = 90` pour les server actions wizard A1 plan generation = Conseiller V1.
- **Action proposée Phase 2 :** Refactor majeur. Retirer imports Conseiller + Pédagogie. Renommer chemin Sprint 41 (`/programme` → `/mon-programme`).

### `app/(programme)/layout.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.2.
- **Action proposée Phase 2 :** Vérifier qu'il n'impose pas un layout incompatible cible V2.0.

### `app/(programme)/programme/create/page.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §6 pilier 8 Out of the Box Experience "Au premier login, Floriane voit déjà sa marque, ses piliers, son calendrier — pré-remplis intelligemment par l'onboarding initial." `02-EXPERTS.md` §6.2 "F89 Wizard piliers : Hélène M. cascade un Sonnet 4.6".
- **Constat factuel :** Création programme via formulaire/wizard.
- **Écart constaté :** Wizard programme cohabite avec wizard piliers (F89 récent). Risque de doublon ou de friction. À auditer Phase 2.
- **Action proposée Phase 2 :** Investiguer. Probablement à conserver mais réécrire pour signer Hélène M. (Sprint 43+).

### `app/(programme)/programme/bienvenue/page.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §6 pilier 8.
- **Constat factuel :** Page de bienvenue post-création de programme.
- **Écart constaté :** Concept "bienvenue" déconnecté de la doctrine V2.0 où Aujourd'hui est le hub permanent.
- **Action proposée Phase 2 :** À investiguer Phase 2. Probablement à supprimer (avec backup), redirect propre vers Mon Programme.

### `app/(programme)/programme/strategie/page.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §7 territoire Stratégie = Ma Marque + Mon Programme. Pas de sous-page "stratégie".
- **Constat factuel :** Sous-page Stratégie avec estimations, indicateurs éditoriaux, events intention.
- **Écart constaté :** Sous-route `/programme/strategie` ≠ doctrine V2.0 (deux pages canoniques : Ma Marque + Mon Programme, pas de sous-page Stratégie).
- **Action proposée Phase 2 :** Refactor structurel — soit fusionner les contenus dans Mon Programme, soit supprimer. À trancher Sprint 41+.

### `app/(programme)/programme/retombees/page.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §8 "Pas dans V1 : Pas d'analyse de performance des publications passées (vanity metrics, engagement rate, etc.). Ces données sont du bruit non-actionnable au stade V1."
- **Constat factuel :** Page de retombées qualitatives + quantitatives + métriques d'app pour les publications passées.
- **Écart constaté :** Concept entier dégagé en V1.
- **Action proposée Phase 2 :** Supprimer. Backup `archive/v1-leftovers/programme-retombees/`.

### `app/(programme)/programme/post/[postId]/page.tsx` et `posts/[postId]/page.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §6 cross-pages "une publication peut exister dans Bibliothèque (archivée), dans Calendrier (programmée)".
- **Constat factuel :** Deux routes nommées différemment pour un détail post (singulier + pluriel).
- **Écart constaté :** Doublon de route à clarifier.
- **Action proposée Phase 2 :** Investiguer + supprimer la route non utilisée.

### `components/programme/ProgrammeDashboard.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §9 vocabulaire interdit "dashboard, tableau de bord (en UI visible)". Code interne tolérable, mais le composant porte le nom "Dashboard".
- **Constat factuel :** Orchestrateur client Split Brief 40/60.
- **Écart constaté :**
  1. Nom "Dashboard" en composant interne — tolérable (`03-VOICE_SHEET.md` §9 "Dans le code TypeScript et SQL, les contraintes de vocabulaire sont assouplies").
  2. Pattern Split Brief 40/60 ≠ doctrine §3.2 sub-sidebar.
  3. Couleur `couleursPiliers` fonctionne avec `PASTELS_DEFAUT` + `brand_book.palette` — neutre.
- **Action proposée Phase 2 :** Renommer en `MonProgrammeView` ou similaire Sprint 41+. Refactor structurel sub-sidebar Sprint 43+.

### `components/programme/ConseillerAccess.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 "Conseiller comme page séparée (fusionné dans Messages avec Hélène M. pinned)" + abandon ancienne nav.
- **Constat factuel :** 4 entrées Conseiller depuis /programme (CTA Créer plan A1, bannière A2, CTA Faire le point A7, CTA Préparer réunion E1).
- **Écart constaté :** Concept entier dégagé.
- **Action proposée Phase 2 :** Supprimer. Backup. Retirer tous les imports.

### `components/programme/NewPlanPedagogyOverlay.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 "Méthode pédagogique 4 mois (V60-pre)" abandonnée.
- **Constat factuel :** Overlay pédagogique du nouveau plan.
- **Écart constaté :** Méthode pédagogique 4 mois dégagée.
- **Action proposée Phase 2 :** Supprimer. Backup.

### `components/programme/CoachingCard.tsx` + `components/programme/CoachingGenerator.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §3 lecture erronée à éviter "Ce n'est pas Headspace. Ce n'est pas Calm." + anti-référence "Pas de gamification". `02-EXPERTS.md` §1 "Creative Fair n'est pas un chatbot avec un modèle de langage".
- **Constat factuel :** Card + générateur de daily coaching.
- **Écart constaté :** Le mot "coaching" et le pattern daily contredisent la doctrine V2.0 "tranquillité du pilote en cockpit, pas une bougie aromatique". Cible V2.0 = Roadmap d'Hélène, pas un coaching séparé.
- **Action proposée Phase 2 :** Supprimer (+ table `daily_coaching` à traiter Sprint 41 schéma).

### `components/programme/ProgrammeSidebar.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.2 sub-sidebar 260px.
- **Constat factuel :** Sidebar interne /programme.
- **Écart constaté :** À auditer pixel-près Sprint 41 (couleurs, fond, sticky, padding).
- **Action proposée Phase 2 :** Audit visuel Sprint 41.

### `components/programme/ProgrammeHero.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** §3.1 hero =/= layout pages métier.
- **Constat factuel :** Hero gauche (40%) avec narrative + chips piliers + dominante + actions rapides.
- **Écart constaté :** Hero ≠ doctrine V2.0 (sub-sidebar 260px). Le pattern hero gauche grand format est du Sprint 36.B.3 obsolète.
- **Action proposée Phase 2 :** Refactor structurel Sprint 43+. Pour Sprint 40, à laisser en l'état avec un commentaire `@deprecated`.

### `components/programme/ProgrammeSplitShell.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** §3.2 sub-sidebar 260px.
- **Constat factuel :** Shell Split Brief 40/60.
- **Écart constaté :** Pattern Split Brief obsolète V2.0.
- **Action proposée Phase 2 :** À refactorer Sprint 43+.

### `components/programme/ProgrammeCalendarView.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §5 promesse 6 "heatmap calendrier 30 jours".
- **Constat factuel :** Vue calendrier programmable.
- **Écart constaté :** Le concept "heatmap 30j" canonique V2.0 n'est probablement pas ce qui est implémenté ici. À vérifier visuellement Sprint 41+.
- **Action proposée Phase 2 :** Audit visuel + refactor.

### `components/programme/CalendarListView.tsx`, `CalendarMonthView.tsx`, `CalendarPostCard.tsx`, `CalendarToggle.tsx`, `CalendarView.tsx`, `CalendarViewSwitcher.tsx`, `CalendarWeekView.tsx`, `VueMois.tsx`, `VueSemaine.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §1 destinations Calendrier (top-level) + Mon Programme (différent). §6 cross-pages.
- **Constat factuel :** 9 composants de vue calendrier dans `components/programme/`. Confusion entre la heatmap éditoriale 30j de Mon Programme et la vue temporelle de Calendrier (top-level V2.0).
- **Écart constaté :** Mon Programme et Calendrier sont deux pages distinctes en V2.0. Le code actuel mélange les deux dans /programme. À séparer.
- **Action proposée Phase 2 :** Sprint 43+ séparation. Pour Sprint 40, marquer `@deprecated` les vues qui sortiront vers /calendrier.

### `components/programme/ChipsPiliersActifs.tsx`
- **Statut doctrinal :** Validé
- **Référence doctrine :** `00-CONCEPT.md` §5 promesse 6 "piliers actifs".
- **Constat factuel :** Chips affichant les piliers narratifs actifs.
- **Action proposée Phase 2 :** Aucune.

### `components/programme/SuggestionsPanel.tsx`
- **Statut doctrinal :** Validé (à raffiner)
- **Référence doctrine :** `02-EXPERTS.md` §6.2 "Mon Programme > Suggestions semaine : Hélène M. génère trois suggestions."
- **Constat factuel :** Panel suggestions semaine.
- **Action proposée Phase 2 :** Sprint 43+ : aligner sur signature Hélène M.

### `components/programme/NewPostModal.tsx`, `PostEditor.tsx`, `PostDetailSheet.tsx`, `PostPreviewOverlay.tsx`, `MiniPostCard.tsx`, `DeletePostButton.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §6 cross-pages (posts = entité partagée).
- **Constat factuel :** CRUD posts.
- **Écart constaté :** À auditer pour vérifier que les copies UI respectent la voice sheet.
- **Action proposée Phase 2 :** Audit copies (cf. `10-transverse.md` §4).

### `components/programme/PostMiniChat.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md`.
- **Constat factuel :** Mini-chat post (utilise `app/_actions/ask-mini-chat.ts`).
- **Écart constaté :** Pas aligné Experts.
- **Action proposée Phase 2 :** Sprint 43+. Pour Sprint 40, garder, marquer `@deprecated`.

### `components/programme/PlanPreview.tsx`, `PeriodSelectionSheet.tsx`, `NextAction.tsx`, `WelcomeURLCleaner.tsx`, `RetombeesEditor.tsx`
- **Statut doctrinal :** À refactorer (mixed)
- **Référence doctrine :** variable.
- **Action proposée Phase 2 :** Audit cas par cas Sprint 41+.

### `components/programme/RetombeesEditor.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §8 "Pas d'analyse de performance des publications passées".
- **Constat factuel :** Éditeur de retombées (engagement quanti + quali).
- **Écart constaté :** Hors scope V1.
- **Action proposée Phase 2 :** Supprimer. Backup.

### `components/retombees/AppMetricsSection.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** §8 vanity metrics interdits.
- **Constat factuel :** Section métriques d'app sur retombées.
- **Action proposée Phase 2 :** Supprimer. Backup.

### `components/retombees/RetombeesQualitativesList.tsx`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer. Backup.

### `components/retombees/RetombeesQuantitativesGrid.tsx`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer. Backup.

### `components/strategie/EstimationsList.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** §8 vanity metrics interdits, mais "estimations indicatives" peuvent rester si pas métriques de performance.
- **Constat factuel :** Liste d'estimations indicatives (commentaire "JAMAIS performance / KPI / metrics / growth").
- **Écart constaté :** Concept "estimation indicative" déjà rédigé pour respecter la doctrine. À conserver sous réserve.
- **Action proposée Phase 2 :** Conserver. Audit copies fine Sprint 41.

### `components/strategie/IndicateursEditorialsList.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** §8.
- **Constat factuel :** "Indicateurs éditoriaux" (commentaire "JAMAIS KPI, performance, analytics, metrics, dashboard").
- **Écart constaté :** Concept "indicateurs éditoriaux" potentiellement aligné mais à auditer fond ; les "indicateurs vitaux" Cohérence/Équilibre/Densité/Profondeur sont dégagés.
- **Action proposée Phase 2 :** Auditer le contenu effectif Sprint 41. Si Cohérence/Équilibre/Densité/Profondeur figurent → Recalé. Sinon À refactorer.

### `components/strategie/EventIntentionCard.tsx`
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Aucune.

### `components/programme-create/*` (2 fichiers)
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** §6 pilier 8 Out of the Box.
- **Constat factuel :** Form + warning de création programme.
- **Action proposée Phase 2 :** Audit Sprint 41.

### `app/_actions/generate-plan-from-form.ts` + `generate-plan-from-wizard.ts` + `estimate-programme-outcomes.ts` + `strategie-events-intention.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md` §6.2 (Hélène M. génère).
- **Constat factuel :** Server actions de génération.
- **Écart constaté :** Pas alignées Experts. Utilisent `createAdmin` (cf. `10-transverse.md` §1).
- **Action proposée Phase 2 :** Sprint 41 patch `createAdmin`. Sprint 43+ alignement Experts.

### `app/_actions/update-post.ts`, `update-post-retombees.ts`, `catch-up-overdue-posts.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `04-MULTI_TENANT.md`.
- **Constat factuel :** CRUD posts.
- **Écart constaté :** `update-post-retombees.ts` → Recalé (retombées hors scope V1). Les autres utilisent `createAdmin`.
- **Action proposée Phase 2 :** Supprimer `update-post-retombees.ts`. Patch sécurité multi-tenant sur les autres.

### `app/api/programme/etendre/route.ts` + `generer/route.ts`
- **Statut doctrinal :** À refactorer
- **Action proposée Phase 2 :** Audit prompt + patch sécurité.

### `lib/programme/*` (12 fichiers)
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §5 promesse 6, `02-EXPERTS.md`.
- **Constat factuel :** Helpers + prompts génération programme.
- **Écart constaté :**
  - `wizard-prompt.ts`, `wizard-generation.ts`, `wizard-steps-config.ts` → wizard programme (à distinguer du wizard piliers F89). Si lié au wizard Conseiller A1 → Recalé.
  - `prompts.ts` → prompts génération.
  - `strategie-estimations-prompt.ts`, `strategie-events-intention-prompt.ts` → prompts stratégie.
  - `compute-indicateurs-editoriaux.ts` → calcul indicateurs éditoriaux (à vérifier qu'il n'invente pas de métriques).
- **Action proposée Phase 2 :** Audit cas par cas. Suppression probable des wizards programme V1 si redondants avec F89 piliers.

### `lib/programme-creation/types.ts`
- **Statut doctrinal :** À refactorer
- **Action proposée Phase 2 :** Audit.

### Migrations Supabase liées
- `005_programmes.sql`, `006_posts.sql`, `013_posts_reported_from.sql`, `016_posts_retombees.sql` (Retombées → Recalé), `019_programme_creation_sessions.sql`, `022_posts_format.sql`, `023_programmes_dates.sql`, `024_posts_caption_complete.sql`
- **Statut doctrinal :** À refactorer (mixed)
- **Référence doctrine :** `04-MULTI_TENANT.md` + §8 V1.
- **Constat factuel :** 8 migrations Programme + Posts.
- **Écart constaté :** `016_posts_retombees.sql` → étend `posts` avec colonnes retombées (hors scope V1).
- **Action proposée Phase 2 :** Migration de schéma = risque, hors scope Sprint 40 (cf. brief §7). À documenter dans `10-transverse.md` §5 et laisser à Sprint 41+.

---

## 3. Confrontation à la spec HTML

**[doctrine silencieuse sur le détail visuel Mon Programme]**.

Ce que la doctrine couvre :

- `01-ARCHITECTURE.md` §1 : route `Mon Programme` (à renommer depuis `/programme`).
- §3.2 layout sub-sidebar 260px + content. Le code actuel = Split Brief 40/60.
- `00-CONCEPT.md` §5 promesse 6 cible exacte : suggestions de la semaine + piliers actifs + heatmap calendrier 30 jours. **Pas de métriques inventées.**
- `00-CONCEPT.md` §14 "Apple Santé avec 4 indicateurs vitaux Cohérence/Équilibre/Densité/Profondeur dans Mon Programme (exploration cf-conceptuel-0, jamais validée)". Toute trace de ces 4 indicateurs dans le code = Recalé.

---

## 4. Résumé chiffré

| Verdict | Nombre |
|---|---|
| Validés | 3 |
| À refactorer | 28 |
| Recalés | 12 |
| Total fichiers Mon Programme audités | ~43 |

Recalés détail :
1. `app/(programme)/programme/retombees/page.tsx`
2. `components/programme/ConseillerAccess.tsx`
3. `components/programme/NewPlanPedagogyOverlay.tsx`
4. `components/programme/CoachingCard.tsx`
5. `components/programme/CoachingGenerator.tsx`
6. `components/programme/RetombeesEditor.tsx`
7. `components/retombees/AppMetricsSection.tsx`
8. `components/retombees/RetombeesQualitativesList.tsx`
9. `components/retombees/RetombeesQuantitativesGrid.tsx`
10. `app/_actions/update-post-retombees.ts`
11. `app/(programme)/programme/bienvenue/page.tsx` (probablement)
12. l'un des deux `/programme/post[s]/[postId]/page.tsx` (doublon)

---

## 5. Recommandation pour Phase 2

### 5.1 Suppressions à valider (`proposed-deletions.md`)

**Bloc Retombées V1** (hors scope V1, métriques de performance) :
- `app/(programme)/programme/retombees/page.tsx`
- `components/retombees/AppMetricsSection.tsx`
- `components/retombees/RetombeesQualitativesList.tsx`
- `components/retombees/RetombeesQuantitativesGrid.tsx`
- `components/programme/RetombeesEditor.tsx`
- `app/_actions/update-post-retombees.ts`

**Bloc Conseiller dans Programme** :
- `components/programme/ConseillerAccess.tsx`
- `components/programme/NewPlanPedagogyOverlay.tsx`

**Bloc Coaching daily** (Headspace effect) :
- `components/programme/CoachingCard.tsx`
- `components/programme/CoachingGenerator.tsx`
- `app/api/ai/coaching/route.ts` (déjà listé dans 02-mes-outils.md)

**Bloc doublon** :
- l'un des deux `/programme/post[s]/[postId]/page.tsx` (à investiguer)

**Bloc bienvenue** :
- `app/(programme)/programme/bienvenue/page.tsx` (probablement)

### 5.2 Refactor automatique (modifications dans des fichiers existants)

- Retirer imports `ConseillerAccess`, `NewPlanPedagogyOverlay` de `page.tsx`.
- Retirer mentions wizard A1/A2 du commentaire d'en-tête + `maxDuration = 90` si lié.
- Vérifier vocabulaire des copies + grep mots interdits.

### 5.3 Hors scope Sprint 40 (laissé Sprint 41+)

- Renommer route `/programme` → `/mon-programme` (impact router + URL existants).
- Refactor structurel Split Brief → sub-sidebar 260px.
- Renommer composant `ProgrammeDashboard` → `MonProgrammeView`.
- Aligner prompts génération sur Hélène M. + Experts (Sprint 43+).
- Décider du sort des 9 composants `Calendar*` (rester ici en heatmap ou migrer vers `/calendrier` top-level Sprint 43+).
- Migration de schéma `016_posts_retombees.sql` (rollback ou tag deprecated) — Sprint 41 dédié.
- Suppression de la table `daily_coaching` (Sprint 41 schéma dédié).
