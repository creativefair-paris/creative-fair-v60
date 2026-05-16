# Page : /programme (label nav "Mon Programme")

## Métadonnées
- Route : `/programme`
- Fichier source : `app/(programme)/programme/page.tsx`
- Composants principaux :
  - `<ProgrammeSplitShell>` (`components/programme/ProgrammeSplitShell.tsx`) — shell unifié + sidebar
  - `<ProgrammeSidebar>` (`components/programme/ProgrammeSidebar.tsx`) — nav latérale Piloter / Actions rapides
  - `<ProgrammeCalendarView>` (`components/programme/ProgrammeCalendarView.tsx`) — wrapper switcher 3 vues
  - `<CalendarWeekView>`, `<CalendarMonthView>`, `<CalendarListView>`, `<CalendarViewSwitcher>` — vues calendrier Sprint 37.I/J
  - `<PostPreviewOverlay>` (`components/programme/PostPreviewOverlay.tsx`) — bulle overlay Semaine/Mois
  - `<PostMiniChat>` (`components/programme/PostMiniChat.tsx`) — mini-chat conseiller intra-post
  - `<ConseillerAccess>` (`components/programme/ConseillerAccess.tsx`) — 4 voies d'accès conseiller
  - `<PlanPreview>`, `<NewPlanPedagogyOverlay>`, `<WelcomeURLCleaner>`
- Sous-routes : `/programme/strategie`, `/programme/retombees`, `/programme/create`, `/programme/post/[id]`, `/programme/posts`, `/programme/bienvenue`.
- Server / Client : Page = Server Component (`export const dynamic = 'force-dynamic'`, `maxDuration = 90` pour Anthropic). Calendar views, ConseillerAccess, ProgrammeSidebar = `'use client'`.
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise).

## Lecture rapide
Centre de pilotage du plan éditorial : sidebar à gauche (Calendrier, Stratégie, Retombées, Refaire un programme + actions rapides Faire le point / Préparer ma réunion), zone droite avec calendrier Apple-style en 3 vues (Semaine / Mois / Liste) qui ouvre une bulle preview au clic. Si aucun programme actif : empty state centré avec CTA désactivé "Génération en préparation" — le pilote passe par le `<ConseillerAccess>` au-dessus pour lancer le wizard A1.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. Palette v60 respectée : `background: 'var(--color-background)'` (`components/programme/ProgrammeSplitShell.tsx:23`).
2. Halos statiques 1/2/3 (`ProgrammeSplitShell.tsx:25-27`) — conforme à la règle. Aucune animation.
3. Aucune occurrence `#1F4937` dans `components/programme/` ni `app/(programme)/` via grep — bon respect dépréciation 6 mai.
4. **MAIS** : fichier legacy `components/programme/CalendarPostCard.tsx` contient `#2F7A45` (vert sapin proche du green Apple HIG, `CalendarPostCard.tsx:38-40`) et un commentaire de tête "SUPPRESSION CANDIDATE Sprint 33" (ligne 1). Ce composant n'est plus référencé par la page courante (Sprint 37.I a remplacé par `CalendarWeekView/MonthView/ListView`), mais il **traîne dans le dossier**. Recalé propreté.
5. Couleurs format en dur : `#007AFF`, `#34C759`, `#FF9500`, `#AF52DE`, `#FF3B30`, `#5856D6` dupliquées dans `CalendarListView.tsx:14-29` ET `PostPreviewOverlay.tsx:33-48` (et probablement aussi dans `CalendarWeekView` / `CalendarMonthView`). Devrait passer par une constante centralisée `FORMAT_COLORS` qui existe déjà (`@/lib/i18n/formats`, importée par `CalendarWeekView.tsx:14`). Duplication = drift.
6. Sidebar `<ProgrammeSidebar>` : utilise correctement `var(--color-label)`, `var(--color-secondary-label)`, `var(--color-tertiary-label)` (`ProgrammeSidebar.tsx:98, 137, 148, 171, 217, 231`). Bon.
7. Sidebar active : `rgba(0, 122, 255, 0.08)` + texte `#007AFF` (lignes 137-138). Apple-style. Bon.
8. Sidebar hover : `background-color: rgba(0, 0, 0, 0.03)` + `transform: translateX(2px)` (`ProgrammeSidebar.tsx:182-183`). Bon micro-mouvement, `prefers-reduced-motion` respecté (ligne 185).
9. Empty state "Tu n'as pas encore de plan en cours." (`page.tsx:308`) — typo `var(--text-title-1-size)` + token `var(--color-label)`. Conforme.
10. Bouton "Générer mon programme" `disabled` + `aria-disabled="true"` + `title="Génération en préparation"` (`page.tsx:319-325`). UX correct : ne laisse pas un bouton cliquable mort.
11. CTA primaire `<ConseillerAccess>` : `#007AFF` `padding: '8px 16px'`, `borderRadius: 18` (`ConseillerAccess.tsx:292-294`). Touch target ~34px : **sous 44px iOS HIG**.
12. Grille sidebar/preview `grid-template-columns: 280px 1fr; gap: 32px` (`ProgrammeSplitShell.tsx:58-60`). OK.
13. Calendar Apple-style "lignes fines rgba(0,0,0,0.04) entre colonnes" (commentaire `CalendarWeekView.tsx:4-5`) — Hiroshi-compatible.
14. Aucune gamification visible : pas de jauge, pas de pourcentage, pas de barre de progression.
15. `aria-current="page"` correctement utilisé sur l'item sidebar actif (`ProgrammeSidebar.tsx:129`). Bon a11y.
16. PostPreviewOverlay : backdrop `rgba(0, 0, 0, 0.4)`, card 480px, lock body scroll (`PostPreviewOverlay.tsx:62-75`) — modal Apple propre.
17. Bouton X de fermeture overlay : à vérifier sur le composant, mais touch target probablement à confirmer screenshot.
18. ProgrammeSidebar.openAction fait `window.location.href = '/outils/conseiller?scenario=...'` (`ProgrammeSidebar.tsx:31`) — pas `router.push()`. Provoque un full page reload → flash UI, perte d'état React. Marcus point aussi.

### Verdict : **Recalé partiel**

### Justification
Palette propre, halos OK, sidebar exemplaire avec tokens et `aria-current`. Mais (a) fichier legacy `CalendarPostCard.tsx` traîne avec couleur verte non-doctrinaire et lien `/calendrier/${id}` mort ; (b) couleurs format dupliquées dans 3+ fichiers alors qu'une constante centrale `FORMAT_COLORS` existe ; (c) touch target CTA bannière régénération < 44px ; (d) `window.location.href` au lieu de `router.push` casse l'UX SPA.

### Recommandations
- **P0** : Supprimer `components/programme/CalendarPostCard.tsx` (composant orphelin Sprint 33, lien `/calendrier/<id>` mort).
- **P0** : Centraliser les FORMAT_COLORS dans `@/lib/i18n/formats` (déjà partiellement importé par `CalendarWeekView`) ; éliminer la duplication dans `CalendarListView.tsx:14-29` et `PostPreviewOverlay.tsx:33-48`.
- **P0** : Remplacer `window.location.href = …` par `router.push()` dans `ProgrammeSidebar.tsx:31`.
- **P1** : Touch target bannière régénération à `padding: '12px 24px'` minimum (`ConseillerAccess.tsx:292`).
- **P2** : Auditer toutes les vues calendrier pour cohérence visuelle (`CalendarWeekView`, `CalendarMonthView`, `CalendarListView`).

---

## Axe 2 — Elena (Archi)

### Observations
1. Server Component bien typé : `ProgrammePageProps` avec `searchParams: Promise<…>` (`page.tsx:46`) — Next.js 15 pattern.
2. `maxDuration = 90` (ligne 28) — légitime pour Anthropic streaming. Bon commentaire explicatif.
3. RLS : la page filtre `programmes` par `tenant_id` (`page.tsx:102`) et `posts` par `programme_id` (`page.tsx:180`). Mais `brands` lu sans `tenant_id` (lignes 86-89) — repose sur RLS, à valider côté schéma.
4. 6+ requêtes Supabase séquentielles dans `page.tsx` (profile, brand, brands extras, programme, profileFreq, jalon, plan, posts). Pas de `Promise.all`. Latence cumulée probable. P1.
5. **Doublon de schéma** : `brand.business_calendar` JSONB lu ligne 160. Cohérent avec `/aujourd-hui` qui lit la même colonne. Pas de table dédiée détectée ici (à confirmer schéma).
6. **Doublon de schéma POTENTIEL** : `piliers_narratifs` lu en JSONB sur `brands` (`page.tsx:87, 91-93`) — ALORS qu'il existe une table `pillars` (Sprint 37.K F89) pour `/ma-marque`. Coexistence des deux modèles → **Recalé Elena** au niveau cross-page. Détail dans `09-ma-marque.md`.
7. `arc_narratif` lu comme `unknown` puis cast (`page.tsx:38, 168`) — typage faible mais isolé.
8. `posts` cast `as unknown as PostRow[]` (`page.tsx:184`) — bypass TS. Devrait passer par types Supabase générés.
9. Server Action : `createProgrammeCreationSession`, `findResumableSession`, `runConseillerTurn` (imports `ConseillerAccess.tsx:25-30`). Bonne pattern Server Action.
10. `ProgrammeCalendarView` côté client utilise `localStorage` pour persister `cf:calendar-view` (`ProgrammeCalendarView.tsx:33-44`) — OK, mais pas synchronisé entre tabs (acceptable V1).
11. La page nettoie `?welcome=true` via `<WelcomeURLCleaner>` (component non lu en détail, 19 lignes) — bon pattern URL clean.
12. `<NewPlanPedagogyOverlay>` reçoit `programmeId` (`page.tsx:246`) — Server-rendered overlay client.
13. `useState<'A7' | 'E1' | null>` dans `ProgrammeSidebar.tsx:25` est declared mais juste setter, jamais lu → variable inutile. Recalé propreté.
14. `<ConseillerAccess>` orchestre 4 `phase.kind` distincts (closed, period, sheet, wizard, resume-choice) via union discriminée (`ConseillerAccess.tsx:60-83`) — bon pattern state machine.
15. `useEffect` Escape listener dans `PostPreviewOverlay.tsx:62-75` — propre, cleanup OK.

### Verdict : **Recalé partiel**

### Justification
Bonne séparation Server/Client, Server Actions modernes, mais (a) doublon de schéma `piliers_narratifs` JSONB vs table `pillars` (Sprint 37.K) confirmé cross-page ; (b) 6+ requêtes Supabase sérialisées sans `Promise.all` ; (c) cast `as unknown as PostRow[]` ; (d) state setter sans reader dans la sidebar.

### Recommandations
- **P0** : Trancher `piliers_narratifs` JSONB vs table `pillars` — Sprint 38 doit décider. Plan de migration nécessaire.
- **P1** : Paralléliser les 6+ requêtes Supabase de `page.tsx` via `Promise.all`.
- **P1** : Générer les types Supabase pour `posts`, `programmes`, `brands` et éliminer les casts.
- **P2** : Supprimer `useState<'A7' | 'E1' | null>` non utilisé dans `ProgrammeSidebar.tsx:25` (ou l'exploiter pour ouvrir une sheet inline comme commenté ligne 28-29).
- **P2** : Documenter dans `lib/types/post.ts` la relation entre `statut` DB et `state` UI Things 3.

---

## Axe 3 — Sarah (Copy)

### Observations
1. Tutoiement systématique : "Tu n'as pas encore de plan en cours." (`page.tsx:308`), "Ton plan actuel se termine bientôt." (`ConseillerAccess.tsx:274`), "Encore N jours avant la fin." (ligne 284). OK.
2. Possessifs : "Mon Programme" titre header (`ProgrammeSplitShell.tsx:38`). Bon.
3. "Sections Mon Programme" `aria-label` (`ProgrammeSidebar.tsx:35`) — possessif intégré dans le a11y. Bon.
4. "Voies d'accès au conseiller" `aria-label` (`ConseillerAccess.tsx:239`) — conseiller minuscule. OK.
5. Items sidebar : "Calendrier" / "Stratégie" / "Retombées" / "Refaire un programme" + "Faire le point" / "Préparer ma réunion" — copy sobre, infinitif, OK Floriane.
6. Sous-titre item "Annule le programme en cours" (ligne 58) — info utile, ton sec. OK.
7. Empty state : "Creative Fair analyse ta marque et structure ton plan éditorial." (`page.tsx:317`) — phrase descriptive, propre. Bon.
8. Vocabulaire interdit : aucun "users", "dashboard", "tableau de bord", "workflow", "viral", "boost", "growth hack", "engagement", "streak", "métrique", "KPI", "stats", "analytics" détecté dans les copies UI de `components/programme/`.
9. **Bémol** : `PeriodSelectionSheet.tsx:88,286-287` utilise `stats` (`const stats = useMemo`) — c'est du code, pas UI. OK.
10. "Régénération de plan" / "Création de plan" (`ConseillerAccess.tsx:207, 216`) — formel mais correct.
11. "Génération en préparation" (`page.tsx:322`) — tooltip neutre.
12. CTA "Préparer le prochain ?" (`ConseillerAccess.tsx:285`) — interrogatif, Floriane.
13. Bouton "Refaire un programme" (`ProgrammeSidebar.tsx:57`) — verbe d'action net, conforme.
14. Conseiller en minuscule consistent (`ConseillerAccess.tsx:1, 14, 46`) en code/comm — mais à vérifier dans les composants enfants (Sheet etc.) qui dépendent du label de fenêtre.

### Verdict : **Validé**

### Justification
Tutoiement, possessifs, conseiller minuscule respectés. Aucun vocabulaire interdit en UI. Ton Floriane bien tenu, copies sobres et descriptives. Pas de jargon SaaS.

### Recommandations
- **P2** : Vérifier la cohérence "conseiller" minuscule dans les headers de `ConseillerSheet`, `WizardImmersiveSheet`, `ResumeChoiceSheet` (audit 11-conseiller).

---

## Axe 4 — Marcus (Workflow)

### Observations
1. Aucun `loading.tsx` ni `error.tsx` détecté dans `app/(programme)/` ni `app/(programme)/programme/`. Friction sur appels Supabase lents.
2. Server Component avec `maxDuration = 90` (`page.tsx:28`) — bonne anticipation de la timeout client.
3. Switcher de vue Calendrier persisté via `localStorage` (`ProgrammeCalendarView.tsx:33-44`) — UX continue entre sessions. Bon.
4. Overlay PostPreviewOverlay : Escape pour fermer (`PostPreviewOverlay.tsx:64-67`), click backdrop pour fermer (`PostPreviewOverlay.tsx:79-` à confirmer), lock body scroll (ligne 70). Apple-compliant.
5. Empty state propre : "Tu n'as pas encore de plan en cours." + CTA disabled `aria-disabled="true"` + tooltip (`page.tsx:319-325`). Pas de bouton trompeur.
6. Bannière régénération conditionnelle <14j de la fin (`ConseillerAccess.tsx:84-91`) — déterministe, OK.
7. JalonGuardDialog (`ConseillerAccess.tsx:228-237`) : friction soft si marque pas posée. Bouton "Continuer quand même" pour ne pas bloquer le pilote. Bon équilibre.
8. ResumeChoiceSheet (`ConseillerAccess.tsx:74-83`) : "Tu as déjà commencé sur ce sujet" — pattern Apple récupération de tâche.
9. `window.location.href = '/outils/conseiller?scenario=...'` dans `ProgrammeSidebar.tsx:31` — provoque hard reload, perd l'état React, perd la sidebar collapsed/expand. Recalé UX.
10. Sidebar hover `translateX(2px)` (`ProgrammeSidebar.tsx:183`) — feedback Apple net, `prefers-reduced-motion` respecté.
11. Sidebar focus visible ? `<Link>` Next n'a pas de focus-visible défini en inline style — outline navigateur par défaut s'applique. Acceptable mais pas parfait.
12. Touch target items sidebar : `padding: '12px 14px'` (`ProgrammeSidebar.tsx:134`) + font 14px + icône 18px ≈ 44px. À la limite mais OK iOS HIG.
13. Touch target ActionItem sidebar : même padding `12px 14px` (`ProgrammeSidebar.tsx:213`) — OK.
14. `cfs-page-container` + `paddingBottom: var(--space-12)` (`ProgrammeSplitShell.tsx:44`) → marge confortable bas de page. Bon.
15. Things 3 task states : pas détectés directement sur `CalendarWeekView/MonthView/ListView`. Les cartes posts dans le calendrier utilisent FORMAT colors, pas les états Things 3 (`mapStatutToState`). Recalé doctrine — un programme doit montrer l'état `todo/ready/published` à la Things 3, pas seulement le format.

### Verdict : **Recalé partiel**

### Justification
Bonne maîtrise des modales (Escape, backdrop, lock scroll), bonne gestion de la friction (JalonGuardDialog), bonne empty state. Mais (a) absence de `loading.tsx`/`error.tsx` ; (b) `window.location.href` dans la sidebar qui hard-reload ; (c) les cartes calendrier n'affichent pas les états Things 3 — incohérence avec `/aujourd-hui` qui les affiche correctement.

### Recommandations
- **P0** : Créer `app/(programme)/loading.tsx` (squelette sidebar + grille calendrier).
- **P0** : Créer `app/(programme)/error.tsx`.
- **P0** : Remplacer `window.location.href` par `router.push` dans `ProgrammeSidebar.tsx:31` (utiliser `useRouter()` du composant client).
- **P1** : Ajouter le `StateCircle` Things 3 sur les cartes posts dans `CalendarWeekView`, `CalendarMonthView`, `CalendarListView` — cohérence avec `/aujourd-hui`.
- **P2** : Ajouter `:focus-visible` explicite sur les Link sidebar pour a11y clavier.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. La page incarne la doctrine "Mon Programme" : un seul plan actif à la fois, refonte via wizard A1, régénération soft <14j de la fin. Conforme CF.
2. Une seule CTA primaire ConseillerAccess (commentaire `ConseillerAccess.tsx:10-12`). Anti-foire-à-boutons assumée. Bon.
3. Trilogie Organique / Outreach / Libre : non explicitement matérialisée sur cette page. Les `format` (anecdote, produit, événement, coulisses, manifeste, question) sont visibles mais pas l'orientation Organique/Outreach/Libre. Drift léger doctrine.
4. Phase 1 (anecdotique) vs Phase 2 (programme) : la page gère bien Phase 2 (programme actif) et propose le wizard A1 si Phase 1. OK.
5. Anti-gamification : conforme. Aucun pourcentage, aucune jauge, aucun streak.
6. Tranquillité : empty state calme, bannière régénération sobre, pas d'alarme. Bon.
7. 6 formats canoniques (Anecdote / Produit / Événement / Coulisses / Manifeste / Question) — affichés dans `FORMAT_LABEL` (`PostPreviewOverlay.tsx:41-48`) et `CalendarListView.tsx:22-29`. Cohérent avec doctrine Post Creator.
8. La sidebar "Faire le point" / "Préparer ma réunion" — bons scénarios CF (A7 et E1).
9. **Drift doctrine connue cross-cutting** : `skills/00-CONCEPT.md`, `skills/10-SACRED.md`, `skills/01-ARCHITECTURE.md` décrivent encore l'ancien produit (forest green, nav 4 dont `/calendrier`, sans `/programme` ni `/outils`). P0 synthèse.
10. Le `<CalendarPostCard.tsx>` legacy (Sprint 33) référence encore `/calendrier/${post.id}` (ligne 77) — vestige drift nav.
11. La sidebar item "Refaire un programme" avec sous-titre "Annule le programme en cours" (`ProgrammeSidebar.tsx:57-58`) — formulation un peu froide. Floriane dirait "Recommencer un programme · le précédent est archivé" ou similaire.
12. La page respecte le pattern "pilote = contrôle" doctrine v60 : sidebar = contrôles, droite = exécution.

### Verdict : **Validé**

### Justification
Page bien alignée doctrine : un plan actif, wizard A1 pour le suivant, formats canoniques, anti-gamification, sidebar pilote. Drift doctrine connue cross-cutting traité en synthèse. La seule réserve mineure est la copie "Annule le programme en cours" un peu rude.

### Recommandations
- **P1** : Reformuler "Annule le programme en cours" en "Le précédent est archivé" — `ProgrammeSidebar.tsx:58`.
- **P2** : Exposer la trilogie Organique/Outreach/Libre dans une vue (filtre ou pastille) — non-bloquant V1.
- **P2** : Documenter la doctrine programme dans `CLAUDE.md` (renvoyer vers cet audit).

---

## Synthèse de la page

### Verdicts cumulés
| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé partiel |
| Elena Archi | ❌ Recalé partiel |
| Sarah Copy | ✅ Validé |
| Marcus Workflow | ❌ Recalé partiel |
| Hélène Doctrine | ✅ Validé |

### Top fixes priorisés
- **P0** :
  1. Supprimer `components/programme/CalendarPostCard.tsx` (legacy Sprint 33, lien `/calendrier/<id>` mort).
  2. Trancher `piliers_narratifs` JSONB vs table `pillars` (cf. `/ma-marque`).
  3. Créer `app/(programme)/loading.tsx` et `error.tsx`.
  4. Remplacer `window.location.href` par `router.push` dans `ProgrammeSidebar.tsx:31`.
  5. Centraliser FORMAT_COLORS dans `@/lib/i18n/formats`, éliminer duplication.
- **P1** :
  1. Paralléliser les 6+ requêtes Supabase de `page.tsx` via `Promise.all`.
  2. Ajouter `<StateCircle>` Things 3 sur les cartes posts dans les 3 vues calendrier.
  3. Touch target bannière régénération `padding: '12px 24px'` (`ConseillerAccess.tsx:292`).
  4. Générer types Supabase et supprimer les casts `as unknown as PostRow[]`.
  5. Reformuler "Annule le programme en cours" en plus doux (`ProgrammeSidebar.tsx:58`).
- **P2** :
  1. Supprimer `useState<'A7' | 'E1' | null>` non lu (`ProgrammeSidebar.tsx:25`).
  2. Ajouter `:focus-visible` explicite sur Link sidebar.
  3. Exposer trilogie Organique/Outreach/Libre dans le calendrier (filtre/pastille).
  4. Auditer cohérence visuelle entre `CalendarWeekView`/`MonthView`/`ListView`.
  5. Documenter la relation `statut` DB ↔ `state` UI Things 3.
  6. Vérifier "conseiller" minuscule dans headers des sheets enfants.

### Verdict global page
**Recalé partiel** — architecture saine et doctrine respectée, mais 5 fix P0 à régler (legacy file, schéma pillars, loading/error, navigation sidebar, FORMAT_COLORS) avant d'être référence.
