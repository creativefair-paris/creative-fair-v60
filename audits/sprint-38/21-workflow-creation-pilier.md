# Workflow : B — Création pilier (wizard 3 étapes Sprint 37.K F89)

## Métadonnées

- **Pages impliquées** :
  - `app/(ma-marque)/ma-marque/page.tsx` (page hôte — server component qui lit `pillars` + provisionne le `PillarsManager`)
  - `components/pillars/PillarsManager.tsx` (orchestrateur client — rangée scrollable + carte "+")
  - `components/pillars/PillarCard.tsx` + `PillarEditSheet.tsx` (lecture et édition rapide)
  - `components/pillars/PillarWizardSheet.tsx` (wizard 3 étapes — questions / propositions / edit)
  - `components/layout/Sheet.tsx` (sheet bottom glass-thick partagé)
- **Server actions / endpoints** :
  - `app/_actions/generate-pillar-wizard.ts` → `generatePillarQuestions(brandId)` + `generatePillarPropositions(brandId, qa)`
  - `app/_actions/pillars.ts` → `listPillars(brandId)` (non utilisé dans le wizard) + `createPillar(input)` + `updatePillar(id, updates)` + `archivePillar(id)`
- **Tables Supabase touchées** : `pillars` (insert / update / soft-delete via `archived_at`), `profiles` (lecture `tenant_id`), `brands` (lecture du contexte de marque)
- **Modèles Anthropic appelés** : cascade `claude-sonnet-4-6` → `claude-sonnet-4-5` (`generate-pillar-wizard.ts:28`). Cache `ephemeral` sur le system prompt (ligne 49). Pas d'Opus.
- **Screenshots** : à produire côté Lead (storyboard recommandé : 1. `/ma-marque` avec rangée piliers + carte "+", 2. wizard étape 1 — loading "Le conseiller prépare cinq questions sur mesure…", 3. étape 1 questions remplies, 4. étape 2 — 3 propositions, 5. étape 3 — édition title/description, 6. retour `/ma-marque` avec le nouveau pilier dans la rangée, 7. cas hard cap 7 avec carte "+" disabled, 8. soft cap 5 avec warning orange).

---

## Storyboard narratif

### Étape 0 — Entrée `/ma-marque`

`app/(ma-marque)/ma-marque/page.tsx:131-144` charge les piliers actifs via le client RLS-aware (`supabase.from('pillars').select(…).eq('brand_id', brand.id).is('archived_at', null).order('position')`). Si la migration 025 n'est pas appliquée, fallback `pillars = []` silencieux.

Le `<PillarsManager>` (ligne 221) reçoit `brandId` + `initialPillars`. Sa header (cf. `PillarsManager.tsx:100-125`) affiche soit "Tu n'as pas encore défini de pilier. Le conseiller t'aide en cinq questions." (count = 0), soit "N pilier(s) actif(s) · cap conseillé 7." (count > 0).

### Étape 1 — Click "+"

`PillarsManager.tsx:197-203` rend une `<PillarAddCard>` dashed avec label "Définir mon premier pilier" (count=0) ou "Ajouter un pilier" (count>0). Disabled si `count >= 7` (hard cap). Le click set `wizardOpen = true`.

### Étape 2 — Ouverture wizard, génération questions

`PillarWizardSheet.tsx:56-87` déclenche au `open=true` un `useEffect` qui :

1. Reset state (step='questions', questions=[], answers={}, etc.)
2. Appelle `generatePillarQuestions(brandId)` → server action
3. Affiche un `LoadingBlock` "Le conseiller prépare cinq questions sur mesure…" pendant ~5-10s

Côté server (`generate-pillar-wizard.ts:146-200`) :

1. Auth check via `createClient()` (cookies)
2. Récupère tenant_id depuis `profiles`
3. Charge brand context (nom, secteur, ton, singularité, positionnement, audience_principale) + piliers existants via `createAdmin()`
4. Construit prompt avec `buildPillarQuestionsUserPrompt(brand, existingPillars)` (`lib/pillars/prompts.ts:71-98`)
5. Appel Sonnet 4.6 avec `max_tokens=1024`, `temperature=0.7`, `timeout=30s`, **cache ephemeral sur le system prompt**
6. Parse JSON strict, valide 5 questions (id "q1"-"q5", label, placeholder)
7. Renvoie `{ ok: true, questions }` ou `{ ok: false, reason }`

### Étape 3 — 5 questions affichées

`PillarWizardSheet.tsx:255-309` rend 5 `<label><textarea rows=2>` empilés, copy "Réponds à celles qui te parlent. Une réponse suffit pour avancer." Une réponse minimum (`handleSubmitAnswers` vérifie ligne 94-97).

Click "Voir les pistes" → état `loadingPropositions` puis `generatePillarPropositions(brandId, qa)`.

### Étape 4 — Génération propositions

`generate-pillar-wizard.ts:240-308` : même flow auth + tenant + admin + Sonnet 4.6 + JSON strict. Renvoie 3 propositions `{ title, description }` truncated à 50 et 500 chars.

### Étape 5 — 3 propositions affichées

`PillarWizardSheet.tsx:311-378` rend 3 cartes glass clickables. Hover effect : bordure passe à `rgba(0, 122, 255, 0.4)`. Bouton "Retour aux questions" en bas à gauche. Pas de bouton "passer cette étape" — le pilote DOIT choisir une proposition.

### Étape 6 — Édition (3 mots max + description)

`PillarWizardSheet.tsx:380-480` rend un formulaire avec :

- Input title (50 char max, validation 3 mots côté client + serveur — bordure rouge si `wordCount > 3`)
- Textarea description (500 char max, 4 rows)
- Compteur live "{wordCount} / 3 mots" et "{description.length} / 500"
- Boutons "Retour" + "Enregistrer le pilier"

### Étape 7 — Save

`PillarWizardSheet.tsx:120-164` valide côté client (title non vide, ≤3 mots, description non vide), puis appelle `createPillar({ brandId, title, description, questionsAnswers })`.

Côté server (`pillars.ts:59-132`) :

1. Auth check + récupération tenant via profiles
2. Validation applicative (title non vide, ≤3 mots, description non vide)
3. Cap V1 hard refus si déjà 7 actifs
4. Position : `max(position) + 1`
5. Insert via `createAdmin()` (bypass RLS) avec `generation_model = 'sonnet-4-6'`
6. `revalidatePath('/ma-marque')`
7. Renvoie `{ ok: true, pillar }`

### Étape 8 — Retour rangée piliers

`PillarsManager.tsx:86-88` reçoit le nouveau pilier via callback `handleCreated`, l'ajoute à `pillars`. Le sheet se ferme (`onDismiss`). Le pilote voit immédiatement sa nouvelle carte dans la rangée. Optimistic update.

---

## Axe 1 — Hiroshi (UI)

### Observations

1. `PillarsManager.tsx:181-204` — la rangée piliers est `overflow-x: auto` avec `scrollSnapType: 'x proximity'`. Pas d'indicateur scroll horizontal (pas de chevrons, pas d'ombre fade côté droit). Sur desktop 1200px, si le pilote a 3-4 piliers + carte "+", tout rentre sans scroll. Sur écran étroit ou 7 piliers, le scroll est invisible. Friction perceptuelle.
2. `PillarCard.tsx:18-44` utilise `backdropFilter: 'blur(12px) saturate(140%)'` + `background: rgba(255, 255, 255, 0.55)`. Cohérent avec le pattern glass-regular v60. Bien.
3. `PillarWizardSheet.tsx:166-217` — le sheet utilise `<Sheet>` partagé (`glass-thick`). Title change selon step ("Creusons ton nouveau pilier" / "Trois pistes à explorer" / "Affine ton pilier"). Bonne narrative.
4. `PillarWizardSheet.tsx:281-298, 402-417, 441-457` — inputs/textarea inline-styled, pas de classe `.cfs-input` ou `.btn-primary` partagée. Si demain on change le radius/padding des champs ailleurs, le wizard piliers ne suit pas. Anti-pattern de duplication stylistique.
5. `PillarWizardSheet.tsx:524-549` — `PrimaryButton` redéfini localement avec `background: '#007AFF'`, `padding: 10px 18px`, `borderRadius: 8`. La doctrine v60 a une classe `.btn-primary` (utilisée ailleurs, ex. `app/(outils)/outils/post-creator/[format]/page.tsx:244`). Duplication.
6. `PillarWizardSheet.tsx:411` — bordure rouge `rgba(255, 59, 48, 0.5)` quand `wordCount > 3`. C'est `--color-system-red` v60. OK même si hardcoded.
7. `PillarCard.tsx` — `color_hex` pilier appliqué uniquement à un détail (probablement un dot, à vérifier le rendu complet) — l'`accent` est lu mais l'usage n'est pas évident dans les 50 premières lignes vues. Le wizard ne propose pas de choisir une couleur — `color_hex` reste null à la création.
8. Pas de halos de fond dans la Sheet. Le sheet flotte au-dessus de `/ma-marque` qui a ses halos — cohérent avec le pattern Sheet iOS.
9. Pas d'animation entre les 3 steps du wizard. Le contenu remplace brutalement. Apple Settings transitions fade — ici c'est instantané.
10. `PillarWizardSheet.tsx:486-522` — le `LoadingBlock` avec spinner `border-topColor: #007AFF` est custom (animation `cfp-spin`). Pas de spinner shared (`/aujourd-hui` n'en a pas non plus — `bg-halo-pulse` est utilisé). Incohérence des indicateurs de loading dans l'app.

### Verdict : **Recalé partiel**

### Justification

Le wizard pilier respecte la signature glass v60 et la palette accent #007AFF. Mais quatre incohérences à corriger : (a) PrimaryButton/SecondaryButton redéfinis localement au lieu d'utiliser `.btn-primary`, (b) spinner custom au lieu d'un pattern partagé, (c) pas de fade entre steps, (d) couleur `color_hex` du modèle ignorée par le wizard de création.

### Recommandations

- **P1** : Extraire `PrimaryButton` / `SecondaryButton` en `components/ui/Button.tsx` (qui existe déjà — utilisé dans `OnboardingFlow`). Le wizard pilier doit consommer ce composant partagé.
- **P1** : Définir un `<Spinner>` partagé (taille S/M/L) et l'utiliser dans `LoadingBlock` + `OnboardingFlow` "submitting" + ailleurs.
- **P2** : Ajouter une transition `opacity 200ms` entre les 3 steps du wizard.
- **P2** : Ajouter dans le step 3 un sélecteur de `color_hex` (palette v60 : lilas, indigo, orange, pastels) — sinon `color_hex` restera NULL en V1.

---

## Axe 2 — Elena (Archi)

### Observations

1. **Prompt caching** appliqué — `generate-pillar-wizard.ts:45-51` envoie `cache_control: { type: 'ephemeral' }` sur le system prompt. Bien. Le system prompt fait ~70 lignes et est identique pour chaque génération de questions — le cache va morder.
2. **Pas de cascade Opus** — la cascade est `sonnet-4-6 → sonnet-4-5` (ligne 28). Cohérent avec la doctrine "user-initiated court" (commentaire ligne 11). Pas d'over-engineering.
3. **Double appel LLM** : génération questions (~5-10s) puis génération propositions (~5-10s). Total ~15-20s de latence cumulée user-perçue. Acceptable mais non parallélisable (le second prompt dépend du premier).
4. **RLS contradictoire** : `listPillars` (`pillars.ts:24-45`) utilise `createClient()` (RLS user). MAIS `createPillar` / `updatePillar` / `archivePillar` utilisent `createAdmin()` après une simple validation `user` + `tenant_id`. Pour `createPillar` (ligne 108) c'est défendable (admin = ergonomique pour insert sans worry sur policies). Pour `updatePillar` / `archivePillar` (lignes 164, 193), pas de filtre `tenant_id` ni `brand_id` côté `.update(...).eq('id', id)`. **Faille potentielle** : si un user envoie l'id d'un pilier d'un autre tenant, l'admin va l'updater sans broncher (`updatePillar` ligne 165 → `.eq('id', id)` seul).
5. **Race condition position** : `createPillar` (`pillars.ts:96-106`) calcule `nextPosition = max(position) + 1` puis insère. Deux requêtes concurrentes sur le même brand calculent la même `nextPosition` et créent deux piliers à la même position. Pas de contrainte UNIQUE `(brand_id, position)` dans la migration 025 (à vérifier dans `supabase/migrations/025_pillars.sql`).
6. **`questions_answers` payload** : sauvegardé seulement avec les `qaPayload` non-vides (`PillarWizardSheet.tsx:140-143`). Truncate label à 200 chars et answer à 800 chars. Bon réflexe de borne.
7. **`generation_model = 'sonnet-4-6'`** hardcodé (`pillars.ts:119`). Si la cascade fallback sur 4-5, on enregistre quand même 'sonnet-4-6' — audit erroné. Devrait recevoir le `model` retourné par `callAnthropic`.
8. **Caching de `loadBrandContext`** : le contexte brand (~6 champs + piliers existants) est rechargé à CHAQUE appel LLM (`generate-pillar-wizard.ts:165, 268`). 2 SELECT par flow wizard. Acceptable mais pourrait être cached côté `revalidatePath` ou client-side.
9. **Revalidation** : `revalidatePath('/ma-marque')` dans `createPillar`, `updatePillar`, `archivePillar`. Bien. Mais le `PillarsManager` fait aussi un optimistic update local (`setPillars(...)`), donc le revalidate ne sert que pour les autres tabs/sessions. OK.
10. **Validation server-side** : 3 mots max sur title vérifié côté serveur (`pillars.ts:71-75, 152-155`). Pas de validation longueur max description (le DB constraint doit s'en charger — non vu dans le code, mais commentaire ligne 66 "les contraintes DB couvrent les longueurs max").

### Verdict : **Recalé**

### Justification

Faille de sécurité multi-tenant sur `updatePillar` / `archivePillar` (admin update par `id` seul, sans filtre `tenant_id`). Race condition possible sur `position` (pas de UNIQUE constraint évident). `generation_model` hardcodé fausse l'audit.

### Recommandations

- **P0** : Ajouter `.eq('tenant_id', tenantId)` sur les `.update(...)` de `updatePillar` et `archivePillar` (`pillars.ts:166, 195`). Récupérer `tenantId` via profile au début de chaque action — cohérent avec ce qui est déjà fait dans `createPillar`.
- **P0** : Ajouter une contrainte UNIQUE `(brand_id, position) WHERE archived_at IS NULL` dans la migration 025 (ou s'en assurer). Ou bien calculer la position via une SQL function (`RETURNING position` avec lock).
- **P1** : Remonter le `model` réel depuis `callAnthropic` et l'inscrire dans `generation_model` (`pillars.ts:119`) au lieu du hardcode.
- **P2** : Cacher `loadBrandContext` côté server action avec un `unstable_cache` keyé `[tenantId, brandId]` (TTL court 60s).

---

## Axe 3 — Sarah (Copy)

### Observations

1. `PillarsManager.tsx:111` — "Tes piliers narratifs" (H2). Tutoiement, possessif. Bien.
2. `PillarsManager.tsx:122` — "Tu n'as pas encore défini de pilier. Le conseiller t'aide en cinq questions." → tutoiement, "Conseiller" minuscule ? Non : "Le conseiller" → minuscule "c". Bien.
3. `PillarsManager.tsx:141` — "Tu approches du cap. Au-delà de cinq piliers, ils se diluent — réfléchis avant d'en ajouter." → ton Floriane juste, métaphore éditoriale ("se diluent"). Bien.
4. `PillarsManager.tsx:159` — "Maximum 7 piliers atteint. Archive un pilier pour en créer un nouveau." → instructif, neutre. OK.
5. `PillarWizardSheet.tsx:221-228` — titles steps : "Creusons ton nouveau pilier" / "Trois pistes à explorer" / "Affine ton pilier". Tutoiement + verbes d'action + 1ère pers. plurielle ("Creusons"). Très Floriane.
6. `PillarWizardSheet.tsx:266` — "Réponds à celles qui te parlent. Une réponse suffit pour avancer." → tutoiement, anti-friction. Excellent.
7. `PillarWizardSheet.tsx:246` — "Le conseiller prépare cinq questions sur mesure…" → tutoiement implicite. "Conseiller" minuscule. Bien.
8. `PillarWizardSheet.tsx:251` — "Aucune question disponible pour l'instant." → état edge case, OK.
9. `PillarWizardSheet.tsx:328` — "Choisis la piste qui te parle. Tu pourras l'ajuster avant de l'enregistrer." → tutoiement, anti-friction, transition vers step 3. Bien.
10. `PillarWizardSheet.tsx:125-126, 130` — messages d'erreur : "Donne un titre à ton pilier." / "Le titre fait plus de 3 mots — resserre." / "La description ne peut pas être vide." → tutoiement, ton conseiller. Bon.
11. `PillarWizardSheet.tsx:439` — "Description (2-3 phrases)" → hint. Bien.
12. `PillarWizardSheet.tsx:446` — placeholder description : "L'angle, ce qu'on filme/montre/raconte concrètement." → instructif. Bien.
13. `PillarWizardSheet.tsx:407` — placeholder title : "L'accident génial" → exemple narratif. Très bon.
14. **Vocabulaire interdit** : pas de "dashboard", "users", "engagement", "growth", "onboarding". RAS sur cet axe.
15. `PillarEditSheet.tsx:46` — title sheet "Affiner ce pilier" — cohérent avec "Affine ton pilier" du wizard. Bien.
16. `PillarsManager.tsx:43-45` — `window.confirm(\`Archiver « ${pillar.title} » ? Les posts existants restent reliés mais le pilier sort de la rotation.\`)` — usage de **window.confirm natif** au lieu d'une `<Sheet>` ou `<Dialog>` cohérent avec le reste de l'app. Le natif iOS/macOS ne respecte pas la palette CF + le tutoiement est dans la string mais le bouton "OK"/"Annuler" natif est en système. Anti-pattern doctrine signature.

### Verdict : **Recalé partiel**

### Justification

La copy du wizard est excellente, voix Floriane respectée bout-en-bout, vocabulaire interdit absent. **Une seule faille** : `window.confirm` natif pour l'archive, qui casse la signature et la copy ne peut pas être stylisée.

### Recommandations

- **P0** : Remplacer `window.confirm` dans `PillarsManager.tsx:43` par une `<Sheet>` ou `<Dialog>` glass v60 avec boutons stylés et copy contrôlée.
- **P2** : Tester avec Floriane si "Le conseiller prépare cinq questions sur mesure…" est trop "conseiller" — peut-être "Cinq questions arrivent." plus discret.

---

## Axe 4 — Marcus (Workflow)

### Observations

1. **Friction quantifiée** :
   - 1 click "+" pour ouvrir wizard
   - Attente génération questions ~5-10s (loading visible)
   - Min 1 réponse (max 5) saisies textarea
   - 1 click "Voir les pistes"
   - Attente génération propositions ~5-10s
   - 1 click sur une des 3 propositions
   - Édition title (peut être laissé tel quel) + description (peut être laissé tel quel)
   - 1 click "Enregistrer le pilier"
   - **Total minimum : 4 clics + 1 saisie + ~15-20s d'attente cumulée.**
2. **Pas de bouton "passer" sur les questions** — le pilote DOIT répondre à au moins 1 question (`PillarWizardSheet.tsx:94-97`). Friction acceptable car c'est l'input qui alimente le LLM.
3. **Pas de bouton "régénérer"** sur les propositions — si les 3 propositions ne plaisent pas, le pilote doit "Retour aux questions", modifier ses réponses, et relancer (consommant ~5-10s de plus). Anti-friction Marcus violé.
4. **Pas de bouton "passer aux propositions sans répondre"** — Sprint 37.K a refusé la friction nulle (le LLM a besoin d'input), mais on pourrait imaginer un mode "Propose-moi sans questions" avec un LLM en aveugle. Pas en V1, OK.
5. **Pas de "draft" persistant** — si le pilote ferme le sheet à mi-parcours, tout est perdu. Pas de session de wizard sauvegardée (contrairement à `brand_onboarding_sessions`). Acceptable pour un flow court mais une bonne pratique manque.
6. **Erreur LLM = blocage** — si Sonnet 4.6 timeout (30s) ET la fallback Sonnet 4.5 timeout aussi, le pilote voit `reason` brut en alert rouge (`PillarWizardSheet.tsx:198-214`). Pas de "Réessayer", pas de fallback "skip questions et propose-moi 3 piliers génériques".
7. **Optimistic update** : `PillarsManager.tsx:86-88` ajoute le pilier sans refetch. Si le revalidatePath rate, la rangée est OK localement mais désynchro avec le SSR au reload. Probablement OK.
8. **Cap 7 hard** : la carte "+" disabled à 7 piliers (`PillarsManager.tsx:200`). Le pilote doit archiver pour créer. Click sur la carte "+" disabled ne fait rien — pas de tooltip "archive d'abord". Friction sans explication.
9. **Édition step 3** : le pilote peut éditer librement le title proposé par le LLM. Le LLM propose typiquement 2-4 mots, l'UI hard cap à 3 mots. Tension : si le LLM propose 4 mots ("L'accident en atelier"), le pilote doit raboter. Sprint 37.K F89 spec dit "3 mots max" mais le LLM n'a peut-être pas reçu cette contrainte (à vérifier dans `lib/pillars/prompts.ts:100+`).
10. **Bouton "Retour" sur l'étape 3** ramène à l'étape 2 (propositions). Le pilote peut zigzaguer. Bien. Mais s'il modifie la proposition choisie en étape 3 puis revient en étape 2, son draft est conservé ? Le code (`PillarWizardSheet.tsx:114-118`) écrase draft au pick proposition — donc en revenant et en repickant, l'édit est perdu. Subtil.

### Verdict : **Recalé partiel**

### Justification

Le wizard est court (~30-40s end-to-end, 4 clics) et le hard cap 7 est doctrinal. Mais (a) pas de bouton "régénérer les propositions" oblige à rejouer toutes les questions, (b) erreur LLM = dead-end sans réessai, (c) pas de tooltip sur carte "+" disabled, (d) édit perdu si re-pick proposition.

### Recommandations

- **P0** : Ajouter "Régénérer 3 nouvelles pistes" au step 2 (à côté de "Retour aux questions"). Évite de rejouer 5 questions pour un cas pénible.
- **P0** : Ajouter "Réessayer" au state d'erreur LLM (au lieu de juste afficher la `reason`).
- **P1** : Tooltip ou helper text sur carte "+" disabled à 7 piliers : "Archive un pilier d'abord pour en créer un nouveau."
- **P2** : Préserver le draft entre re-picks de proposition (ou avertir "Cette modification annulera tes ajustements").

---

## Axe 5 — Hélène M. (Doctrine)

### Observations

1. **Le pilote pilote-t-il ?** Oui — il répond à 5 questions, choisit 1 proposition sur 3, édite librement. Pleine maîtrise. Doctrine Floriane respectée.
2. **Soft cap 5 / hard cap 7** — doctrinal (`PILLARS_SOFT_CAP_WARN = 5`, `PILLARS_HARD_CAP = 7` dans `lib/pillars/types.ts:27-28`). La copy warning "ils se diluent" est anti-bloat éditorial. Très bon.
3. **3 mots max sur title** — règle doctrinale stricte (`PillarWizardSheet.tsx:128-131`). Soutient l'éditorialité du pilier (pas un nom de catégorie générique).
4. **Système prompts Sonnet 4.6** (cf. `lib/pillars/prompts.ts:30-69`) explicitement "Pair senior. Vocabulaire éditorial. Tutoiement par défaut. Pas de tiret long, pas d'emoji, pas de markdown." → la posture conseiller est verrouillée dans le prompt. Bien aligné avec doctrine Hélène.
5. **Mauvaises questions à éviter** listées dans le system prompt (lignes 46-49) : "Quelles sont tes valeurs ?" (trop générique), "Veux-tu parler de tes produits ?" (fermée), "Quels sont tes objectifs business ?" (hors-sujet éditorial). Excellent garde-fou.
6. **`window.confirm`** pour archiver — déjà signalé Sarah. Anti-pattern signature CF.
7. **Coexistence pilier_id ↔ piliers_narratifs JSONB legacy** — le wizard crée des entries dans `pillars` (Sprint 37.K) mais `/ma-marque` continue d'afficher `MaMarqueDashboard` qui lit `brand.piliers_narratifs` JSONB (`page.tsx:152`). Le pilote voit donc DEUX listes de piliers : (a) `<MaMarqueDashboard>` JSONB legacy, (b) `<PillarsManager>` table normalisée. Confusion garantie.
8. **Génération auto-déclenchée** — le `useEffect` au open=true (PillarWizardSheet.tsx:57-87) appelle Sonnet 4.6 SANS attendre une action utilisateur. Si le pilote clique "+" par curiosité puis ferme, c'est un appel LLM gaspillé. Aucune consommation d'Anthropic credits est sourcing-side, mais éthiquement (et pour le throughput cache) c'est un appel-réflexe non maîtrisé.
9. **6 promesses CF** — sans la liste explicite, je note (a) tranquillité ✅ pas de gamif, (b) tutoiement Floriane ✅, (c) signature visuelle ✅ glass v60, (d) le pilote pilote ✅, (e) anti-bloat ✅ (cap 5/7).

### Verdict : **Validé**

### Justification

Le wizard pilier est l'un des morceaux du produit les plus alignés avec la doctrine CF : tutoiement bout-en-bout, copy Floriane, soft/hard caps anti-bloat, system prompt qui interdit la flatterie et les questions génériques. Quelques frictions Sarah/Marcus à corriger mais le cœur doctrinal est solide. Un seul accroc majeur sur la coexistence avec le JSONB legacy.

### Recommandations

- **P0** : Décider du retrait de `brand.piliers_narratifs` JSONB legacy de `<MaMarqueDashboard>` (le pilote ne doit voir qu'UNE liste de piliers — celle de la table `pillars`).
- **P1** : Lazy-load la génération questions — ne pas appeler Sonnet tant que l'utilisateur n'a pas vu le step 1 affiché (ou ajouter un état "Le wizard est ouvert, [Commencer]" qui déclenche l'appel sur clic explicite).
- **P2** : Documenter dans une ADR les caps 5/7 et la règle 3 mots max — anchoring doctrinal pour la suite.

---

## Synthèse du workflow

### Verdicts cumulés

| Axe | Verdict |
|---|---|
| Hiroshi UI | ⚠️ Recalé partiel |
| Elena Archi | ❌ Recalé |
| Sarah Copy | ⚠️ Recalé partiel |
| Marcus Workflow | ⚠️ Recalé partiel |
| Hélène Doctrine | ✅ Validé |

### Top fixes priorisés

- **P0** : Ajouter `.eq('tenant_id', tenantId)` aux server actions `updatePillar` / `archivePillar` — faille multi-tenant.
- **P0** : Ajouter contrainte UNIQUE `(brand_id, position)` sur table `pillars` — race condition position.
- **P0** : Remplacer `window.confirm` archive par un `<Sheet>` styled CF.
- **P0** : Retirer le doublon JSONB legacy `brand.piliers_narratifs` de `<MaMarqueDashboard>` — UNE liste de piliers, pas deux.
- **P0** : Ajouter "Régénérer 3 pistes" au step propositions.
- **P0** : Ajouter "Réessayer" sur erreur LLM.
- **P1** : Extraire `PrimaryButton`/`SecondaryButton` locaux vers `<Button>` partagé.
- **P1** : Remonter le `model` réel dans `generation_model` au lieu du hardcode.
- **P1** : Lazy-load la génération questions.
- **P2** : Sélecteur `color_hex` au step 3.
- **P2** : `<Spinner>` partagé.

### Verdict global workflow

**Recalé partiel** — le cœur fonctionnel et doctrinal est solide (copy excellente, system prompt verrouillé, soft/hard caps anti-bloat). Mais 4 failles sécu/UX impossibles à laisser en l'état avant Sprint 38 (multi-tenant, race, confirm natif, doublon JSONB).

### Friction quantifiée

- Nombre de clics du début à la fin : **4** (+ : "+" → "Voir les pistes" → pick proposition → "Enregistrer")
- Nombre de champs obligatoires : **1 réponse minimum** (sur 5 questions proposées) + title (héritable du LLM) + description (héritable du LLM)
- Nombre de redirections : **0** (tout en sheet sur `/ma-marque`)
- Latence LLM estimée : **~10-20s cumulée** (2 appels Sonnet 4.6 séquentiels)
- Temps total Floriane : **45-90s** selon le nombre de réponses saisies

### Anti-patterns détectés (cross-pages)

1. **Doublon piliers** : `MaMarqueDashboard` lit `brand.piliers_narratifs` JSONB et `PillarsManager` lit la table `pillars`. Deux sources, deux UI, sur la même page. Le pilote voit deux blocs piliers à `/ma-marque`.
2. **Composants UI redéfinis localement** : `PrimaryButton`, `SecondaryButton`, `LoadingBlock` dans `PillarWizardSheet.tsx` au lieu d'imports partagés. Va se reproduire sur d'autres wizards si pas systématisé.
3. **Server action `admin` sans filtre tenant** : `updatePillar` / `archivePillar` filtrent par `id` seul. Anti-pattern récurrent dans le repo (cf. aussi `brand-onboarding.ts` qui filtre manuellement mais avec admin).
4. **window.confirm natif** : cassure totale de signature visuelle CF, copy non maîtrisable, jamais palette v60. Doit disparaître partout.
5. **Génération LLM auto-déclenchée au open** : pattern coûteux (1 appel LLM réflexe par ouverture/fermeture du wizard sans action métier). Lazy-load à privilégier.
6. **Hardcode `generation_model = 'sonnet-4-6'`** : la cascade peut fallback sur 4-5, l'audit en BDD ment.
