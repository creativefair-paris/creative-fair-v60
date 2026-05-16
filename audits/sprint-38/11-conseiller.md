# Page : /outils/conseiller

## Métadonnées
- Route : `/outils/conseiller`
- Fichier source : `app/(outils)/outils/conseiller/page.tsx`
- Composants principaux :
  - `<PageHeader>` avec breadcrumb ("Aujourd'hui" › "Outils" › "Conseiller")
  - `<ConseillerHistory>` (`components/conseiller/ConseillerHistory.tsx`, 492 lignes) — orchestrateur historique
  - `<ConseillerSheet>` (`components/conseiller/ConseillerSheet.tsx`, 799 lignes) — sheet conversationnelle UNIQUE pour 8 voies d'accès (décision Apple #49)
  - `<ResumeChoiceSheet>` (`components/conseiller/ResumeChoiceSheet.tsx`) — mini-sheet "Tu as déjà commencé sur ce sujet" (Sprint 37.B F14)
  - `<WizardImmersiveSheet>` (`components/conseiller/WizardImmersiveSheet.tsx`, 577 lignes) — wizard A1 fullscreen 7 étapes (Sprint 37.B F16)
  - Wizard steps : `<Step1Period>`, `<Step2BusinessAnchors>`, `<Step2MixMode>`, `<Step3SensitiveTopics>`, `<Step5DefinirPiliers>`, `<Step5RythmeEngagement>`, `<Step6ObjectifsCombined>`, `<Step7Formats>`, `<Step7Confirmation>`
  - `<ConseillerBubble>`, `<PiloteBubble>` — bulles iOS Messages
  - `<StreamingReasoning>`, `<WaitingState>` — feedback streaming
  - `<QuickMetricsRow>`, `<MetricSlider>` — scénario A8 "Renseigner mes chiffres"
  - `<PedagogyExplanationSheet>`, `<ExitConfirmDialog>`, `<WizardProgressBar>`
- Mockup outil dans `/outils` : `<ConseillerIPhoneMockup>` (Sprint 37.K F88, 192 lignes)
- Server / Client : Page = Server Component (auth + listConversations + findResumableSession). `<ConseillerHistory>` et toutes les sheets = `'use client'`. Server Actions : `runConseillerTurn`, `findResumableSession`, `markConseillerTimeout`, `updateProgrammeCreationSessionStep`, `completeProgrammeCreationSession`, `generatePlanFromWizardSession`. Modèle : **Anthropic Opus 4.7** (cf. brief).
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise).

## Lecture rapide
La page n'est jamais un point d'entrée principal (décision Apple #49) — c'est l'**historique** des conversations passées + un bouton "Nouvelle question" qui ouvre une sheet conversationnelle. Layout SplitBrief 40/60 : gauche liste des conversations groupées par date (pattern Things 3), droite preview lecture seule + bouton "Reprendre". 8 voies d'accès URL contextuel (scenarios A1-E1) auto-ouvrent la `<ConseillerSheet>` correspondante. Le scénario A1 (création plan) bascule en `<WizardImmersiveSheet>` fullscreen 7 étapes. Anthropic Opus 4.7 streaming en arrière-plan.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. Palette v60 respectée : `background: 'var(--color-background)'` (`app/(outils)/outils/conseiller/page.tsx:120`).
2. Halos statiques 1-5 (`page.tsx:122-126`) — conforme.
3. Aucune occurrence `#1F4937` dans `components/conseiller/` (grep). Bon.
4. **`<ResumeChoiceSheet>`** : modal Apple-style avec backdrop `rgba(0, 0, 0, 0.18)`, card `borderRadius: 20`, `box-shadow: '0 24px 60px rgba(0, 0, 0, 0.12)'` (`ResumeChoiceSheet.tsx:60-80`). `aria-modal="true"`, `aria-labelledby` (`ResumeChoiceSheet.tsx:45-46`). Bon.
5. Background fond Liquid Glass : `rgba(251, 250, 247, 0.96)` (`ResumeChoiceSheet.tsx:78`). Crème v60 quasi-opaque, Apple modal style. Bon.
6. Sidebar conversations : pattern Things 3 implicite (groupes par date, `<button>` cliquable). Hover `rgba(0, 0, 0, 0.03)` (`ConseillerHistory.tsx:272`). OK.
7. Hairlines : pas vue de border-bottom 1px dans la liste des convos — séparation par `gap: 4` (`ConseillerHistory.tsx:212`). Conforme Apple.
8. `glass-thin` sur l'item sélectionné (`ConseillerHistory.tsx:225`). Bon Liquid Glass.
9. Tokens utilisés massivement : `var(--color-label)`, `var(--color-tertiary-label)`, `var(--color-secondary-label)` (lignes 206, 247, 256). Bon.
10. `<ConseillerSheet>` : 799 lignes — commentaire d'anatomie ligne 6-13 réfère doctrine doc 09 §8 + décisions Apple #49, #54, #11. Excellent ancrage.
11. Sheet 60% largeur desktop, 100% mobile (commentaire ligne 7-8). Liquid Glass niveau 2 (ligne 9). Header sticky. Bouton fermer haut droite. Conforme décisions Apple.
12. `MOBILE_BREAKPOINT = 768`, `TABLET_PORTRAIT_BREAKPOINT = 1024` (`ConseillerSheet.tsx:98-99`). Bon.
13. **`<WizardImmersiveSheet>`** fullscreen 100vw × 100vh, `border-radius: 0` (commentaire `WizardImmersiveSheet.tsx:3-7`) — démarcation visuelle nette du chat classique. Bon UX immersive.
14. WizardProgressBar 3px sous le header (commentaire ligne 5) — hauteur très fine, non-gamifiée. Acceptable doctrine (≠ jauge `<BarreFondations>` `/ma-marque`).
15. Hover sidebar avec `prefers-reduced-motion` géré (`ConseillerHistory.tsx:274-276`). Bon a11y.
16. `<button>` rangées sidebar : `padding: '10px 12px'` (`ConseillerHistory.tsx:233`) ≈ 36px touch target — **sous 44px iOS HIG**. Recalé.
17. Bouton "Nouvelle question" en `btn-primary` global (`ConseillerHistory.tsx:184`) — à valider dans `globals.css`.
18. Espacements `gap: 4`, `gap: 8`, `gap: 18`, `gap: 20`, `padding: '28px 28px 24px 28px'` — grille canonique respectée.
19. Pas de gradient agressif. Pas d'animation tonitruante. Conforme Hiroshi.
20. `aria-pressed={isSelected}` sur item sidebar (`ConseillerHistory.tsx:222`) — bonne a11y.
21. `<ConseillerIPhoneMockup>` (Sprint 37.K F88) — non lu en détail mais déjà cohérent dans `/outils` audit.
22. Couleurs en dur : peu d'occurrences `#007AFF` dans `ConseillerHistory.tsx`. Bon respect tokens.
23. WizardImmersiveSheet importe `runConseillerTurn`, `markConseillerTimeout`, etc. — visible donc Server Actions correctement appelées.

### Verdict : **Recalé partiel**

### Justification
Layout conforme aux décisions Apple #49 et #54, Liquid Glass propre, halos, tokens, ancrage doctrinaire en commentaires riches. Mais (a) touch target rangées sidebar 36px sous 44px ; (b) on ne valide pas ici les détails internes de `<ConseillerSheet>` (799 lignes) et `<WizardImmersiveSheet>` (577 lignes) qui demanderaient un audit dédié par composant.

### Recommandations
- **P1** : Touch target rangées sidebar à `padding: '12px 14px'` minimum (`ConseillerHistory.tsx:233`).
- **P2** : Audit dédié `<ConseillerSheet>` (799 lignes) et `<WizardImmersiveSheet>` (577 lignes) au niveau Hiroshi — hors scope Sprint 38 mais à programmer.
- **P2** : Vérifier touch target des 9 boutons step du wizard et des QuickMetricsRow / MetricSlider.

---

## Axe 2 — Elena (Archi)

### Observations
1. Server Component minimal : `page.tsx` fait auth + parse searchParams + `findResumableSession` + `listConversations`. Bon pattern.
2. `parseInitialSheet` (`page.tsx:63-88`) : validation stricte des scenarios via `VALID_SCENARIOS Set`. Rétrocompat Sprint 36.H/I via `?context=post_<id>` → B2 (lignes 64-72). Bon.
3. `findResumableSession` appelée server-side en parallèle de `listConversations` ? **Non** : séquentiel (`page.tsx:108-115`). P1.
4. Server Actions : `runConseillerTurn`, `findResumableSession`, `markConseillerTimeout`, `updateProgrammeCreationSessionStep`, `completeProgrammeCreationSession`, `generatePlanFromWizardSession`. Bonne séparation logique métier.
5. State machine `<ConseillerSheet>` : IDLE → THINKING → TURN → DELIVERED (commentaire ligne 17-18). Bon pattern.
6. Plafond 3 tours côté serveur + FORCED_DELIVERY au 4e (commentaire ligne 19-20) — anti-spam, garde-fou Hélène doctrine.
7. **`<ConseillerSheet>` est très lourd : 799 lignes**. Couvre 8 voies d'accès, streaming, state machine, A8 metrics. Maintenance difficile. P1.
8. **`<WizardImmersiveSheet>` 577 lignes** — orchestrateur de 9 wizard steps. À envisager d'éclater.
9. `useRouter()` Next.js dans `WizardImmersiveSheet.tsx:15` — navigation propre.
10. `listConversations(supabase)` (`page.tsx:115`) — fonction extraite `lib/conseiller/queries.ts`. Bonne séparation.
11. Auto-clean URL après ouverture sheet : `window.history.replaceState` (`ConseillerHistory.tsx:103-111`) — UX correcte, évite re-trigger sur reload.
12. Cast `params.scenario as ScenarioType` (`page.tsx:75`) sans guard avant `VALID_SCENARIOS.has(scenario)` ligne 76 — fonctionnel mais TS imprécis. P2.
13. `runConseillerTurn` passée en prop `onSendMessage` à `<ConseillerSheet>` (`ConseillerHistory.tsx:297`) — bon pattern de dépendance inversée.
14. Pas de `loading.tsx` ni `error.tsx` dans `app/(outils)/outils/conseiller/`. Friction sur Supabase ou Anthropic lent.
15. `maxDuration` n'est pas défini sur `page.tsx` — pour les Server Actions Anthropic, c'est `maxDuration = 90` sur `/programme/page.tsx`. À vérifier que la Server Action conseiller a aussi son timeout (déclaré là où elle est définie). P2.
16. RLS : `listConversations` filtre côté query. À valider tenant_id côté `lib/conseiller/queries.ts`.

### Verdict : **Recalé partiel**

### Justification
Architecture saine au niveau page (Server Component minimal, Server Actions, state machine claire). Mais (a) `<ConseillerSheet>` et `<WizardImmersiveSheet>` sont des monolithes (799 + 577 lignes) qui demandent un refactoring ; (b) `findResumableSession` + `listConversations` séquentiels ; (c) pas de loading.tsx.

### Recommandations
- **P1** : Paralléliser `findResumableSession` + `listConversations` via `Promise.all` (`page.tsx:108-115`).
- **P1** : Éclater `<ConseillerSheet>` (799 lignes) : extraire la state machine, les sub-components (Header, MessagesList, ChoicesRow, ComposerRow, etc.).
- **P1** : Éclater `<WizardImmersiveSheet>` (577 lignes) : extraire le router des 9 steps + le store de responses.
- **P2** : Créer `app/(outils)/outils/conseiller/loading.tsx` (squelette SplitBrief).
- **P2** : Vérifier `maxDuration` sur la Server Action `runConseillerTurn`.
- **P2** : Type guard avant cast `as ScenarioType` (`page.tsx:75`).

---

## Axe 3 — Sarah (Copy)

### Observations
1. Tutoiement systématique : "Tu as déjà commencé sur ce sujet" (`ResumeChoiceSheet.tsx:94`), "Nouvelle question" (`ConseillerHistory.tsx:186`). OK.
2. **"Conseiller" majuscule en UI** : `<PageHeader title="Conseiller">` (`page.tsx:138`) + breadcrumb `["Aujourd'hui", { label: 'Outils', href: '/outils' }, 'Conseiller']` (`page.tsx:139`). **Recalé doctrine**. La spec demande "conseiller" minuscule en UI.
3. HEADER_LABELS du wizard / scénarios : "Création de plan", "Régénération de plan", "Faire le point", "Affiner ce post", "Préparer le week-end", "Répondre à un message", "Bad buzz", "Imprévu sur ce post", "Et si on faisait...", "Opportunité business", "Opportunité visibilité", "Préparer ma réunion", "Nouvelle question", "Renseigner mes chiffres" (`page.tsx:38-53`). Tous infinitifs/noms, Floriane, OK.
4. "à l'instant", "il y a N min", "il y a N h", "il y a N j" (`ResumeChoiceSheet.tsx:21-31`) — relatif date FR propre. Bon.
5. Empty state liste : `EmptyList` rendu (`ConseillerHistory.tsx:194`, défini ligne 314+). À vérifier mais probablement Floriane.
6. **Vocabulaire interdit "engagement"** : trouvé 15+ occurrences en UI dans `components/conseiller/` :
   - `MetricSlider.tsx:13` `'engagement_rate_pct'` (id technique, OK code)
   - `MetricSlider.tsx:35-38` label `"d'engagement"` (UI metric slider du scénario A8) — **Recalé doctrine**, "engagement" hors citation persona.
   - `QuickMetricsRow.tsx:14` `engagement_rate_pct: 'Engagement'` (label de chip) — **Recalé**.
   - `QuickMetricsRow.tsx:25` phrase `"Mon taux d'engagement moyen est de ${v}."` (message envoyé comme pilote) — **Recalé**.
   - `Step5RythmeEngagement.tsx:51` `<h2>Rythme et niveau d'engagement</h2>` — **Recalé** (titre H2 d'étape).
   - `Step5RythmeEngagement.tsx:93` `<h3>Niveau d'engagement éditorial</h3>` — **Recalé**.
   - `Step7Confirmation.tsx:99` `label="Niveau d'engagement"` — **Recalé**.
   - `WizardImmersiveSheet.tsx:457` prop type `engagement: EngagementLevel` (typage, OK code).
   - Le mot "engagement" est massivement présent en UI du conseiller (chips, sliders, titres step, confirmations). La doctrine interdit le terme sauf en citation persona. **Recalé doctrine fort**.
7. Comme contre-argument : "engagement" est ici une **métrique business** que le pilote saisit (taux d'engagement Instagram). Sa présence est légitime côté input pilote (citation A8 "renseigner mes chiffres"). Mais reste un anti-modèle dans les titres de step.
8. "Tu as déjà commencé sur ce sujet" (`ResumeChoiceSheet.tsx:94`) — Floriane, OK.
9. "Nouvelle question" CTA primary (`ConseillerHistory.tsx:186`) — net, OK.
10. Breadcrumb `["Aujourd'hui", { label: 'Outils', href: '/outils' }, 'Conseiller']` (`page.tsx:139`) — "Aujourd'hui" et "Outils" sans possessif. La doctrine demande "Mes Outils". **Recalé** mineur.
11. Reasoning streaming : `<StreamingReasoning>` (`ConseillerSheet.tsx:37`) — composant tiers, copy à auditer.
12. `WaitingState` (`ConseillerSheet.tsx:38`) — composant tiers.
13. Pas de "users", "dashboard", "tableau de bord", "workflow", "viral", "boost", "growth hack", "streak", "métrique", "KPI", "stats", "analytics" détectés dans `components/conseiller/` (grep neg).
14. "Followers", "DM clients", "Mentions presse", "Newsletter", "Visites site" (`QuickMetricsRow.tsx:13-21`) — vocabulaire métier IG, acceptable.

### Verdict : **Recalé**

### Justification
La présence massive de "engagement" en UI (sliders, chips, titres de step, confirmation) viole la doctrine Sarah "engagement interdit sauf citation persona". 7+ occurrences UI documentées. **Plus** : "Conseiller" majuscule dans le `<PageHeader title>` et le breadcrumb. **Plus** : breadcrumb "Outils" sans possessif "Mes". Trois drifts copy concurrents.

### Recommandations
- **P0** : "Conseiller" → "conseiller" dans `<PageHeader title>` ET breadcrumb (`page.tsx:138-139`).
- **P0** : Breadcrumb "Outils" → "Mes Outils" (`page.tsx:139`).
- **P0** : Reformuler "engagement" sur les titres step et chip labels. Options : "Niveau d'attention éditoriale" / "Niveau de présence" / "Niveau de rythme" — à arbitrer avec Sarah/Hélène.
- **P1** : Si l'input pilote doit conserver le mot "engagement" comme métrique IG (citation persona), encadrer explicitement avec commentaire doctrine dans le code et limiter à 1 occurrence (l'input slider) — pas dans 3 titres de step + 2 confirmations.

---

## Axe 4 — Marcus (Workflow)

### Observations
1. Pas de `loading.tsx` ni `error.tsx`. Friction sur Supabase + Anthropic streaming lent.
2. Conversation sélectionnée par défaut = première (`ConseillerHistory.tsx:79`) — UX continue.
3. `<ResumeChoiceSheet>` ouverte automatiquement si match (`ConseillerHistory.tsx:92-95`) — anti-friction "tu as déjà commencé".
4. URL paramètres → auto-ouverture sheet → URL clean (`ConseillerHistory.tsx:103-111`) — pas de re-trigger sur reload. Excellent UX.
5. 8 voies d'accès via URL paramètres (commentaire `page.tsx:11-19`) — pattern unifié. Bonne architecture inter-pages.
6. Rétrocompat `?context=post_<id>` Sprint 36.H/I (`page.tsx:64-72`) — pas de lien cassé sur les anciens posts. Excellent.
7. `<ConseillerSheet>` : header sticky obligatoire (commentaire ligne 10-11), conversation persistée à la fermeture (commentaire ligne 13). Bon UX continu.
8. Plafond 3 tours + FORCED_DELIVERY au 4e (commentaire `ConseillerSheet.tsx:19-20`) — anti-tunnel. Bon.
9. Wizard A1 : `<ExitConfirmDialog>` au clic croix (commentaire `WizardImmersiveSheet.tsx:9`). "Anti-paternaliste : la session reste IN_PROGRESS, sortie autorisée" (ligne 10). Bon UX Apple.
10. Wizard "responses persistées au pas-à-pas" (`WizardImmersiveSheet.tsx:10`) — pas de perte si crash navigateur.
11. `<WaitingState>` (`ConseillerSheet.tsx:38`) — feedback streaming. `WAITING_TIMEOUT_MS` (`ConseillerSheet.tsx:48`) géré.
12. `markConseillerTimeout` (`ConseillerSheet.tsx:49`) — gestion timeout serveur explicite.
13. **`detectsFormalAddress`** (`ConseillerSheet.tsx:40`) — détection du vouvoiement du pilote pour adapter la réponse. Excellent UX Floriane.
14. Bulles `<ConseillerBubble>`, `<PiloteBubble>` — pattern iOS Messages cohérent.
15. Touch targets sidebar conversation : 36px (sub-44px). Recalé déjà signalé.
16. `aria-pressed` sur sidebar item (`ConseillerHistory.tsx:222`), `aria-modal` sur `<ResumeChoiceSheet>`, `aria-labelledby`. Bonne a11y.
17. Bouton "Nouvelle question" en haut à droite (`ConseillerHistory.tsx:181-188`) — affordance forte d'amorçage.
18. Mobile order `left-first` (`ConseillerHistory.tsx:191`) — la liste passe en premier sur mobile, alors que la doctrine Tranquillité du pilote dit "right-first" sur les pages brief. Ici c'est un historique, pas un brief — `left-first` est cohérent (lecture sequentielle). OK décision contextuelle.

### Verdict : **Recalé partiel**

### Justification
Workflow exemplaire : auto-ouverture sheet, URL clean, ResumeChoice intelligent, 3-tours-cap, ExitConfirmDialog, persistance pas-à-pas, détection vouvoiement, streaming feedback. La seule réserve : touch target sidebar et pas de loading/error.tsx.

### Recommandations
- **P1** : Touch target rangées sidebar (`ConseillerHistory.tsx:233`).
- **P2** : `loading.tsx` + `error.tsx` au niveau `/outils/conseiller/`.
- **P2** : Audit `<ConseillerSheet>` dédié pour vérifier touch targets internes (bouton fermer, boutons-choix, composer).

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. Doctrine doc 09 §8 référencée explicitement en commentaires : `page.tsx:4-9`, `ConseillerHistory.tsx:1-12`, `ConseillerSheet.tsx:1-23`, `WizardImmersiveSheet.tsx:1-10`. Excellent ancrage en source.
2. **Décision Apple #49 "page = historique uniquement, jamais point d'entrée principal"** (`page.tsx:4-5`, `ConseillerHistory.tsx:3-5`) — respectée. Le pilote accède au conseiller via /aujourd-hui, /programme, ou /outils — la page /outils/conseiller est secondaire.
3. **Décision Apple #54 "header sticky obligatoire avec le contexte"** (`ConseillerSheet.tsx:10-11`) — respectée.
4. Une seule sheet pour 8 voies d'accès (`ConseillerSheet.tsx:3-4`) — anti-prolifération doctrinaire. Bon.
5. Plafond 3 tours + FORCED_DELIVERY (`ConseillerSheet.tsx:19-20`) — incarnation doctrine "le conseiller délivre, pas un chat infini". Bon.
6. Wizard A1 fullscreen 7 étapes — pas de gamification (pas de "Step 3/7 ⭐"), juste WizardProgressBar 3px. Sobre.
7. Persistance pas-à-pas wizard (`WizardImmersiveSheet.tsx:10`) — doctrine "tranquillité". Aucune anxiété de perte.
8. ExitConfirmDialog "anti-paternaliste, sortie autorisée" (`WizardImmersiveSheet.tsx:10`) — doctrine "le pilote décide".
9. Détection vouvoiement (`ConseillerSheet.tsx:40`) — incarnation Floriane respectueuse.
10. **"engagement" en UI** : c'est le drift doctrine majeur (cf. Sarah). La doctrine CF interdit "engagement" hors citation persona. Ici, les titres de step en abusent. Recalé doctrine.
11. **Conseiller majuscule dans PageHeader** : viole la règle "conseiller minuscule en UI". Recalé doctrine.
12. ResumeChoiceSheet "Tu as déjà commencé sur ce sujet" — formulation Floriane. Bonne.
13. Le `<ConseillerIPhoneMockup>` (Sprint 37.K F88) sur `/outils` montre un chat iOS Messages — visuel cohérent avec la doctrine "conversation tranquille".
14. Trilogie Organique/Outreach/Libre : pas matérialisée directement, mais c'est le conseiller qui aide à arbitrer. OK.
15. Phase 1 / Phase 2 : le conseiller traverse les deux. OK.
16. **Drift doctrine cross-cutting** : `skills/00-CONCEPT.md`, `skills/10-SACRED.md`, `skills/01-ARCHITECTURE.md` — P0 synthèse.
17. Le scénario A8 "Renseigner mes chiffres" expose le pilote à des inputs métriques. Doctrine CF refuse les KPI vanités — ici les métriques sont en saisie pilote, pas en restitution dashboard. Acceptable.
18. Mais le **wording "Niveau d'engagement éditorial"** (Step5RythmeEngagement.tsx:93) est un titre orienté métrique. Doctrine ambigu.

### Verdict : **Recalé partiel**

### Justification
Anchrage doctrinaire exceptionnel en commentaires source (décisions Apple #49, #54, #11 citées). Architecture conforme. Wizard pas-à-pas sans gamification. **Mais** : (a) "engagement" en UI viole la doctrine vocabulaire ; (b) "Conseiller" majuscule viole la règle minuscule ; (c) titre "Niveau d'engagement éditorial" amplifie le drift.

### Recommandations
- **P0** : "Conseiller" → "conseiller" UI partout (déjà P0 Sarah).
- **P0** : Reformuler "engagement" dans wizard step (déjà P0 Sarah).
- **P1** : Conserver les commentaires riches en source — c'est un modèle de doctrine en code.
- **P2** : Documenter dans `CLAUDE.md` les décisions Apple #49 et #54 référencées par ce composant.

---

## Synthèse de la page

### Verdicts cumulés
| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé partiel |
| Elena Archi | ❌ Recalé partiel |
| Sarah Copy | ❌ Recalé |
| Marcus Workflow | ❌ Recalé partiel |
| Hélène Doctrine | ❌ Recalé partiel |

### Top fixes priorisés
- **P0** :
  1. "Conseiller" → "conseiller" : `<PageHeader title>` + breadcrumb (`page.tsx:138-139`). Cascade dans tous les labels UI.
  2. Reformuler "engagement" dans titres step (`Step5RythmeEngagement.tsx:51, 93`, `Step7Confirmation.tsx:99`) et chip label (`QuickMetricsRow.tsx:14`).
  3. Breadcrumb "Outils" → "Mes Outils" (`page.tsx:139`).
- **P1** :
  1. Touch target rangées sidebar `<ConseillerHistory>` à 44px minimum (`ConseillerHistory.tsx:233`).
  2. Paralléliser `findResumableSession` + `listConversations` (`page.tsx:108-115`).
  3. Éclater `<ConseillerSheet>` (799 lignes) en sous-composants.
  4. Éclater `<WizardImmersiveSheet>` (577 lignes) en router + store.
  5. Si "engagement" reste métrique IG saisie pilote, encadrer en code avec commentaire doctrine et limiter à 1 occurrence (slider input).
- **P2** :
  1. Créer `app/(outils)/outils/conseiller/loading.tsx` + `error.tsx`.
  2. Vérifier `maxDuration` sur Server Action `runConseillerTurn`.
  3. Type guard avant cast `as ScenarioType` (`page.tsx:75`).
  4. Audit dédié Hiroshi pour `<ConseillerSheet>` et `<WizardImmersiveSheet>` (touch targets internes, boutons-choix, composer).
  5. Documenter décisions Apple #49 / #54 dans `CLAUDE.md`.
  6. Vérifier touch target des 9 boutons step wizard.

### Verdict global page
**Recalé** — Architecture exemplaire (anchrage doctrinaire en code, séparation propre, Server Actions, state machine, persistance pas-à-pas) **mais** copy non conforme (Conseiller majuscule, engagement en UI, breadcrumb sans possessif) — 5 axes sur 5 en recalé partiel. Les fix P0 sont presque tous des fix de copy à coût faible mais impact doctrinaire élevé.
