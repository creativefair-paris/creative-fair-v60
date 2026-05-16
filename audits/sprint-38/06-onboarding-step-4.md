# Page : Onboarding Ma Marque — Step 4/4 (Ton de voix) + Trigger

## Métadonnées
- Route : `/ma-marque?onboarding=true` (wizard step `current_step = 3`, dernier step)
- Fichier source principal : `components/onboarding-marque/BrandOnboardingStep.tsx` (lignes 61-69 — case 3 du dispatcher → `Step6Ton`) + composant `Step6Ton` lignes 304-375
- Fichiers contexte : `components/onboarding-marque/BrandOnboardingTrigger.tsx` (266 lignes), `components/onboarding-marque/BrandOnboardingHeaderCta.tsx` (50 lignes), `components/onboarding-marque/BrandOnboardingSheet.tsx` (audité fichier 03), `app/_actions/brand-onboarding.ts` (252 lignes)
- Composants principaux : `<Step6Ton>`, boutons toggle adjectifs, `<TextAreaField>`, `<BrandOnboardingTrigger>`, `<BrandOnboardingHeaderCta>`
- Server / Client : Client Component (`'use client'`)
- Screenshot : à produire côté Lead via `_capture.mjs` (auth + onboarding actif requis)
- Label step (cf. `lib/brand-onboarding/types.ts:50`) : "Ton de voix"
- Type response (cf. `types.ts:26`) : `'3'?: { ton_adjectifs: ReadonlyArray<string>; ton_texte: string }`
- À la complétion : `completeBrandOnboarding()` → update `brands.nom`, `brands.piliers_narratifs`, `brands.ton` → router.push('/ma-marque')

## Lecture rapide
Step 4 final du wizard (index 3) — "Quel est ton ton de voix ?". Deux champs combinés : (a) un set de **10 adjectifs toggle** (cap max 3 sélections), et (b) une textarea libre "Comment ta marque parle ?". Validation : au moins 1 adjectif sélectionné OU 1 caractère dans la textarea. Au clic "Terminer", appel server `completeBrandOnboarding` → transfert vers `brands.ton` → redirect `/ma-marque`. Step terminal du wizard, c'est là que Floriane scelle la voix de sa marque pour le conseiller. Plus de ce step, ce fichier audite **le composant `BrandOnboardingTrigger`** qui orchestre l'ensemble du flow et porte la majorité de la logique métier (resume, create, event listener, URL param).

---

## Axe 1 — Hiroshi (UI)

### Observations
1. Step 4 hérite du chrome `BrandOnboardingSheet` (halos, header Liquid Glass, indigo eyebrow, animation 280ms, pas de `#1F4937` ✅) — audité fichier 03.
2. `BrandOnboardingStep.tsx:343-365` — set d'adjectifs : 10 boutons `btn-choice` en flex-wrap. Style : `padding: '8px 14px'`, `background: 'rgba(0, 122, 255, 0.16)'` si sélectionné / `'rgba(0, 122, 255, 0.06)'` sinon, `borderColor: 'rgba(0, 122, 255, 0.5)'` si sélectionné / `'rgba(0, 122, 255, 0.18)'` sinon, `opacity: 0.5` si disabled (cap 3 atteint).
3. **Accent #007AFF** (rgba 0,122,255) **utilisé proprement** sur les chips adjectifs sélectionnés. Conforme palette v60. ✅
4. Mais **rgba numériques hardcodés** (`rgba(0, 122, 255, 0.16)`, `0.06`, `0.5`, `0.18`) au lieu de `color-mix(in srgb, var(--color-accent) X%, transparent)` ou tokens dédiés. Drift Hiroshi.
5. Touch target chips adjectifs : `padding: 8px 14px` + texte 14px → hauteur ~34px. **Sous 44px**. Recalé sur les chips (input cliquable interactif).
6. `BrandOnboardingStep.tsx:343` — `flexWrap: 'wrap'` + `gap: 8`. Layout correct, ok mobile.
7. `BrandOnboardingStep.tsx:366-372` — TextAreaField "Comment ta marque parle ?" rows=4. Hérite `inputStyle` hardcodé (cf. fichier 03).
8. **Pas de mini-preview** de la voix : Floriane sélectionne "sang-froid", "documenté", "chaleureux" mais ne voit aucune phrase d'exemple générée. Drift UX, mais doctrine sobriété accepte.
9. **Cap 3 adjectifs** : disabled style avec `opacity: 0.5`. Discret mais pas explicite — pas de message "Max 3 sélections". Floriane comprend par essais.
10. Espacements : `gap: 8`, `padding: '8px 14px'`. Mix grille (8 OK, 14 hors).
11. Aucune animation gratuite. ✅
12. **Pas de feedback animation au toggle adjectif** : Floriane clique, le style change instantanément. Acceptable sobriété.
13. Le titre H2 "Quel est ton ton de voix ?" passe par `titleStyle` (tokens propres). ✅
14. La desc "Coche jusqu'à 3 adjectifs + décris en 1-2 phrases comment ta marque parle." passe par `descStyle` (tokens propres). ✅
15. **BrandOnboardingTrigger UI** : `ResumeChoiceMiniSheet` (lignes 150-265) — sheet de reprise. Halos absents (ce mini-sheet n'a pas les halos signature v60, contrairement à BrandOnboardingSheet). Inconsistance signature. **Drift visuel**.
16. `BrandOnboardingTrigger.tsx:188` — `className="glass-regular"` utilisée sur le ResumeChoiceMiniSheet. ✅ Liquid Glass conforme.
17. `BrandOnboardingTrigger.tsx:199` — `background: 'rgba(251, 250, 247, 0.96)'` : crème hardcodée. Drift token.
18. `BrandOnboardingTrigger.tsx:200` — `boxShadow: '0 24px 60px rgba(0, 0, 0, 0.18)'` : shadow lourd, conforme sheet flottante.
19. `BrandOnboardingTrigger.tsx:233-240` — `<button className="btn-primary">` et `<button className="btn-choice">`. Pattern partagé. ✅
20. `BrandOnboardingHeaderCta.tsx:34-44` — CTA header `/ma-marque` : `padding: '10px 16px'`, `background: 'rgba(0, 122, 255, 0.06)'`, `borderColor: 'rgba(0, 122, 255, 0.18)'`, `color: '#007AFF'`. **Accent #007AFF hardcodé** et rgba hardcodés. Drift token. Touch target ~38px : **sous 44px**.

### Verdict : **Recalé**

### Justification
Step 4 hérite des drifts Hiroshi du chrome + ajoute les chips adjectifs en sub-touch-target (34px au lieu de 44px), les rgba accent hardcodés sur les chips, et l'inconsistance halos absents sur ResumeChoiceMiniSheet + BrandOnboardingHeaderCta. Sur 3 composants visuels (chips, mini-sheet, header CTA), 3 drifts visuels distincts. Recalé.

### Recommandations
- **P0** : Chips adjectifs touch target ≥ 44px (`padding: '12px 16px'` au minimum, ou `min-height: 44px`).
- **P0** : Hériter des fixes tokenisation fichiers 03-05.
- **P1** : Remplacer `rgba(0, 122, 255, X)` par `color-mix(in srgb, var(--color-accent) <X*100>%, transparent)`.
- **P1** : Ajouter halos signature v60 sur `ResumeChoiceMiniSheet` (ou cohérence assumée : seul le wizard a halos, le mini-sheet est en `glass-regular` pur — à formaliser).
- **P1** : Message explicite "Max 3 sélections" quand cap atteint, plutôt qu'opacity 0.5 silencieux.
- **P2** : Mini-preview de la voix (1 phrase de démo) ferait gagner Floriane sur la confirmation.

---

## Axe 2 — Elena (Archi)

### Observations
1. `BrandOnboardingStep.tsx:317-376` — `Step6Ton` : `useState` adjectifs + texte. Toggle adjectif avec cap 3 (`if (adjectifs.length < 3) setAdjectifs([...adjectifs, a])`). Logique propre.
2. `BrandOnboardingStep.tsx:325-328` — `toggleAdj` : immutabilité respectée. ✅
3. `BrandOnboardingStep.tsx:336-338` — `onNext={() => onSave(idx, responseKey, { ton_adjectifs: adjectifs, ton_texte: texte })}`. Shape conforme `BrandOnboardingResponses['3']`.
4. `BrandOnboardingStep.tsx:341` — `canContinue = adjectifs.length > 0 || texte.trim().length > 0`. **OR logique** — au moins un des deux. Acceptable doctrine (Floriane pose un signal).
5. `BrandOnboardingStep.tsx:304-315` — `TON_ADJECTIFS_OPTIONS` : 10 adjectifs hardcoded en module-scope. **Constante magique** : pas typée, pas exportée, pas commentée. Si Sprint 38+ veut tester d'autres adjectifs, modif manuelle ici.
6. `BrandOnboardingSheet.tsx:86-96` — `handleComplete` : appelle `completeBrandOnboarding({ sessionId })` → `router.push('/ma-marque')` → `onClose()`. **Pas de validation côté UI** que les 4 steps ont bien été remplis avant `completeBrandOnboarding`. Si Floriane saute Step 4 (impossible techniquement car `canContinue` exige > 0), ok. Mais si Floriane saute Step 2 par exploit (pas le cas dans le UI mais théoriquement le server actions le permettrait via call direct), `completeBrandOnboarding` accepterait. Risque latent.
7. `app/_actions/brand-onboarding.ts:181-233` — `completeBrandOnboarding` : 
   - Lit `responses` de la session.
   - Mappe responses → brands (nom, piliers_narratifs, ton).
   - **N'utilise QUE responses['0'].nom, responses['2'].piliers, responses['3'].ton_texte**. **responses['1'].audience_principale est ignorée** (cf. commentaire ligne 201 "stocké brand_book Sprint 38+").
   - Update `brands WHERE tenant_id`.
   - Update session state `COMPLETED`.
   - **PAS de transaction**. Si UPDATE brands réussit mais UPDATE sessions échoue, on a une brand modifiée + session encore IN_PROGRESS. Inconsistance possible.
8. `app/_actions/brand-onboarding.ts:201` — commentaire "stocké brand_book Sprint 38+" : **dette technique annoncée**. L'audience cible n'est PAS transférée vers `brands` aujourd'hui. Si l'app affiche `brands.audience` ailleurs, elle est null. Sprint 38 doit le faire.
9. `app/_actions/brand-onboarding.ts:215-220` — `WHERE tenant_id = ctx.tenantId` sans `eq('id', brandId)`. Si plusieurs brands existent par tenant (interdit en V1 mais théoriquement possible), update toutes. Cf. fichier 03 P1.
10. `BrandOnboardingTrigger.tsx:36-129` — orchestration trigger entière : URL param + event listener + resume check + create session. **3 niveaux d'orchestration**, bug F67 fixé, mais le code est complexe (130 lignes). Console.info debug à nettoyer.
11. `BrandOnboardingTrigger.tsx:25-29` — type `Phase` discriminant union à 4 cas. Pattern TypeScript propre. ✅
12. `BrandOnboardingHeaderCta.tsx:23-26` — `window.dispatchEvent(new CustomEvent('cfs-open-brand-onboarding'))` puis `router.push(...)`. **Double trigger** justifié en commentaire (cf. ligne 19-22) pour palier useSearchParams non-réactif sur certains setups Vercel. Pattern défensif acceptable mais signal d'une fragilité Next.js / Vercel.
13. **Pas de cacheable Anthropic** sur Step 4 (data entry). N/A. Mais : Sprint 38+ devrait considérer un cacheable prompt qui pré-remplit le ton de voix à partir des réponses précédentes (nom + audience + piliers). Si fait, cacher le prompt système + cacher les responses précédentes.
14. `app/_actions/brand-onboarding.ts:74` — `if (!tenantId) return { ok: false, reason: 'Tenant non provisionné' }`. Bonne erreur explicite.
15. **Pas de cleanup des sessions COMPLETED** : à long terme, `brand_onboarding_sessions` accumule des rows. Acceptable V1 (3 clients), à monitorer.

### Verdict : **Recalé**

### Justification
3 dettes architecturales : (a) **dette annoncée `responses['1'].audience_principale` non transférée** (commentaire Sprint 38+ → c'est précisément Sprint 38 maintenant, à fixer ou repousser explicitement V2), (b) **pas de transaction** entre UPDATE brands et UPDATE sessions (inconsistance possible), (c) **complexité BrandOnboardingTrigger** (130 lignes orchestration, console.info en prod, double-trigger défensif). Plus la validation Zod absente déjà signalée fichiers 03-05.

### Recommandations
- **P0** : Décision Sprint 38 sur `responses['1'].audience_principale` : (i) ajouter colonne `brands.audience_cible_principale` et transférer, (ii) ajouter colonne `brands.brand_book` JSON et stocker dedans, (iii) repousser explicitement V2 (mais alors retirer le commentaire promesse).
- **P0** : Validation Zod côté `completeBrandOnboarding` que les 4 responses sont présentes (au moins responses['0'].nom non vide).
- **P0** : Wrap `completeBrandOnboarding` UPDATE brands + UPDATE sessions dans une RPC Postgres ou une transaction (Supabase JS ne supporte pas les transactions multi-table directement → RPC SQL est la voie).
- **P1** : Nettoyer console.info/warn/error dans BrandOnboardingTrigger (cf. fichier 03 P1).
- **P1** : Exporter `TON_ADJECTIFS_OPTIONS` depuis `lib/brand-onboarding/types.ts` au lieu de le hardcoder en module-scope.
- **P2** : Cacheable prompt Anthropic pour pré-remplir ton (Sprint 38+).
- **P2** : Cleanup périodique des sessions COMPLETED > 90 jours.

---

## Axe 3 — Sarah (Copy)

### Observations
1. `BrandOnboardingStep.tsx:332` — titre "Quel est ton ton de voix ?" : **tutoiement** ✅, question directe.
2. `BrandOnboardingStep.tsx:333` — desc "Coche jusqu'à 3 adjectifs + décris en 1-2 phrases comment ta marque parle." : **tutoiement** ✅, instructionnel mais clair.
3. `BrandOnboardingStep.tsx:304-315` — adjectifs :
   - "sang-froid" — doctrine Hélène (Valentine D. Crise). ✅
   - "documenté" — doctrine Albane R. Magazine. ✅
   - "chaleureux" — Floriane tranquillité. ✅
   - "précis" — Hiroshi. ✅
   - "narratif" — Albane R. ✅
   - "sobre" — doctrine universelle. ✅
   - "érudit" — magazine. ✅
   - "tranchant" — doctrine Hélène. ✅
   - "doux" — Floriane. ✅
   - "fier" — doctrine. ✅
   **10 adjectifs Floriane-tier, parfaitement doctrinaux**. ✅✅✅
4. `BrandOnboardingStep.tsx:367` — label TextArea "Comment ta marque parle ?" : tutoiement implicite ("ta marque"). ✅
5. `BrandOnboardingStep.tsx:370` — placeholder "Ex. Phrases courtes, jamais d'exclamation. Pas de marketing. On affirme, on documente." : **placeholder doctrine pure** — interdiction exclamation, refus marketing, affirmation+documentation. Albane R. tier. ✅
6. `BrandOnboardingSheet.tsx:174` — label header "Ton de voix" (depuis `BRAND_ONBOARDING_STEP_LABELS[3]`). Sobre. ✅
7. **Pas de "audience" ici**. Soulagement après step 2.
8. **Pas de "onboarding"** ici (seulement dans chrome aria-label + Trigger). Cohérent.
9. `BrandOnboardingTrigger.tsx:215` — "Tu as déjà commencé" : tutoiement ✅.
10. `BrandOnboardingTrigger.tsx:226` — "Tu en es à l'étape {currentStep + 1} sur {totalSteps}. Tu veux reprendre où tu en étais ou tout recommencer ?" : tutoiement parfait. ✅
11. `BrandOnboardingTrigger.tsx:235-236` — "Reprendre où j'en étais (étape X sur N)" : tutoiement implicite via "j'en étais". ✅
12. `BrandOnboardingTrigger.tsx:243` — "Recommencer un nouvel onboarding" : **mot "onboarding" en UI**. ❌ Recalé. Alternative : "Recommencer depuis le début".
13. `BrandOnboardingTrigger.tsx:259` — "Plus tard" : sobre. ✅
14. `BrandOnboardingHeaderCta.tsx:46-47` — "Reprendre l'onboarding guidé →" / "Lancer un onboarding guidé →" : **DEUX occurrences "onboarding" sur le CTA d'entrée principal**. ❌❌ Recalé fort. Cf. fichier 03 P0.
15. Bouton final wizard "Terminer" (depuis `StepShell` ligne 458) : sobre. ✅
16. Pas de gamification verbale. ✅
17. Pas d'agressivité commerciale. ✅
18. Aucun "users", "viewers", "dashboard", "workflow", "engagement", "viral", "boost", "growth hack", "streak", "level up", "unlock". RAS hors "onboarding".

### Verdict : **Recalé**

### Justification
La copie du **Step 4 lui-même est exceptionnellement doctrinale** (10 adjectifs Floriane-tier, placeholder Albane R. tier, tutoiement systématique). Mais le composant `BrandOnboardingTrigger` et `BrandOnboardingHeaderCta` autour qui orchestrent l'entrée/sortie du wizard **utilisent 3 fois le mot "onboarding" en UI** (déjà signalé fichier 03). Sur le pilier d'entrée du flow (CTA header `/ma-marque`), c'est doublement visible. Recalé Sarah strict.

### Recommandations
- **P0** : Bannir "onboarding" en UI (cf. fichiers 03, 04, 05). Touche 3 emplacements : aria-label sheet, ResumeChoiceMiniSheet label, BrandOnboardingHeaderCta.
- **P1** : Aucun sur Step 4 lui-même. La copie du step est exemplaire.
- **P2** : Documenter les 10 adjectifs dans `skills/02-VOICE_SHEET.md` comme palette canonique. Aujourd'hui ils sont enterrés.
- **P2** : Documenter le placeholder ("Phrases courtes, jamais d'exclamation. Pas de marketing. On affirme, on documente.") comme **règle doctrine** dans `skills/02-VOICE_SHEET.md`.

---

## Axe 4 — Marcus (Workflow)

### Observations
1. Step 4 hérite du chrome (loading, error, Escape, ExitConfirmDialog, indicateur 4/4, halos) — audité fichier 03.
2. `BrandOnboardingStep.tsx:341` — `canContinue = adjectifs.length > 0 || texte.trim().length > 0`. **OR souple** — Floriane peut soit cocher 1 adjectif, soit écrire 1 caractère. Friction minimale.
3. **Cap 3 adjectifs avec disabled silencieux** (opacity 0.5) : Floriane qui essaye un 4e voit que rien ne réagit. Pas de toast, pas de message. Friction.
4. **Pas d'autofocus** sur le 1er adjectif ou la textarea. Friction signalée fichier 03.
5. **Touch target chips adjectifs ~34px** : sous 44px. Recalé Marcus aussi.
6. `BrandOnboardingStep.tsx:454` — `onComplete` au lieu de `onNext` car `isLastStep` true. Bouton "Terminer" au lieu de "Suivant". ✅
7. `BrandOnboardingSheet.tsx:86-96` — `handleComplete` : `setSaving(true)` → `completeBrandOnboarding({ sessionId })` → `router.push('/ma-marque')` → `onClose()`. **Pas de toast de succès** entre le clic Terminer et l'arrivée sur `/ma-marque`. Floriane voit "Enregistrement…" puis pop sur `/ma-marque` sans transition. Friction.
8. **Pas de fallback si `completeBrandOnboarding` échoue** : `setError(err.message)`, mais Floriane reste dans le wizard, doit recliquer Terminer. Acceptable mais sec.
9. **Reload sur `/ma-marque`** : pas explicite, mais `router.push('/ma-marque')` après UPDATE brands → page native re-fetch. Risque race condition si Supabase écriture pas propagée (rare).
10. `BrandOnboardingTrigger.tsx:131-148` — render conditionnel : sheet / resume-choice / null. **Pas de flash de contenu** entre les états.
11. `BrandOnboardingTrigger.tsx:90-129` — useEffect avec 3 awaits possibles (`getResumableBrandOnboardingSession`, `createBrandOnboardingSession`). **Latence cumulée** non visible côté UI (juste `phase.kind === 'loading'` qui rend `null`). Si serveur Supabase lent (>2s), Floriane voit le bouton CTA disparaître sans feedback. Friction.
12. `BrandOnboardingHeaderCta.tsx:33-44` — bouton CTA `/ma-marque` toujours visible (même quand wizard ouvert ?). À vérifier côté `app/(ma-marque)/ma-marque/page.tsx` (non lu ici).
13. **ExitConfirmDialog** : montré sur Escape ou croix. **Mais** : à Step 4 (dernier), si Floriane sort sans valider, la session reste IN_PROGRESS — au prochain login elle aura le ResumeChoiceMiniSheet. Friction acceptable.
14. **Pas de keyboard shortcut "Cmd+Enter" pour valider** la textarea + soumettre. Acceptable.
15. Loading state sur "Terminer" via `disabled={!canContinue || saving}` + texte "Enregistrement…". ✅
16. **Pas de feedback post-redirect** : après `router.push('/ma-marque')`, aucune bannière "Ta marque est prête !" sur la page d'arrivée. Floriane arrive sur `/ma-marque` sans confirmation explicite. Friction.

### Verdict : **Recalé**

### Justification
Step 4 hérite des frictions communes (pas d'autofocus, touch target chips) + ajoute ses propres : cap 3 adjectifs silencieux, pas de toast/transition post-Terminer, pas de feedback sur `/ma-marque` post-redirect. Plus le risque "loading invisible" du Trigger si serveur lent. Sur le step terminal du wizard (le moment de la consécration), Marcus attend un peu plus de cérémonie/feedback. Recalé.

### Recommandations
- **P0** : Touch target chips ≥ 44px (cf. Hiroshi P0).
- **P0** : Hériter des fixes communs (autofocus).
- **P1** : Message visible "Max 3 sélections" quand cap atteint.
- **P1** : Toast / mini-transition post-Terminer ("Bien reçu, on prépare ta marque" 800ms) avant redirect.
- **P1** : Bannière de confirmation sur `/ma-marque` au premier render post-onboarding (query param ou flag local) : "Ta marque est prête. Tu peux maintenant créer ton premier programme." Doctrine Floriane tranquillité.
- **P2** : Spinner ou indicateur visible pendant `phase.kind === 'loading'` du Trigger (au lieu de `return null`).
- **P2** : Keyboard shortcut Cmd+Enter pour valider.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. **Floriane (28 ans, brand manager)** : Step 4 est l'exercice ton-de-voix classique brand. Floriane saura répondre. Conforme.
2. **Citation anchor "tableau de bord simple et efficace, contrôle, pilote"** : Step 4 scelle la voix de la marque. Pilotage pur. ✅
3. **6 promesses CF — "Tu pilotes"** : Floriane choisit ses adjectifs et écrit son ton. ✅
4. **6 promesses CF — "Pas d'IA qui décide"** : aucun pré-remplissage automatique. Conforme.
5. **Tranquillité narrative** : chips sobres, textarea calme, copy doctrinale. Conforme.
6. **Anti-gamification** : pas de score "ton de voix complet à 80%". ✅
7. **Anti-jargon SaaS** : "ton de voix", "adjectifs", "phrases courtes" — vocabulaire brand. ✅. MAIS "onboarding" dans Trigger/HeaderCta. ❌
8. **10 adjectifs doctrine pure** : sang-froid, documenté, chaleureux, précis, narratif, sobre, érudit, tranchant, doux, fier. **C'est la palette ton-de-voix Creative Fair canonique**. Hélène valide à 100%.
9. **Placeholder "Phrases courtes, jamais d'exclamation. Pas de marketing. On affirme, on documente."** : **règles doctrinales pures** — c'est presque la voice sheet Sarah condensée en une phrase. ✅
10. **Cohérence Angelina / Comptoir / Tous en Tête** : les 3 marques pourraient choisir 3 sous-ensembles différents (Angelina : chaleureux+précis+narratif ; Comptoir : tranchant+érudit+fier ; Tous en Tête : sang-froid+sobre+chaleureux). Le wizard les laisse libres. ✅
11. **B2B custom 12K€** : conforme posture haute main.
12. **Phase 1 / Phase 2** : la voix posée ici alimente toutes les productions Phase 2 (programme, séries, posts).
13. **Trilogie Organique/Outreach/Libre** : la voix est unique pour les 3 modes (le ton organique est le ton de référence ; Outreach et Libre dérivent). Conforme.
14. **Cap 3 adjectifs** : doctrine "moins c'est plus", choix forcé. ✅ Conforme philosophie Hiroshi/Hélène.
15. **Transfert à la complétion** : `brands.ton = responses['3'].ton_texte`. **L'adjectifs n'est PAS transféré** vers `brands` (seul le texte libre l'est). Dette technique annoncée comme audience cible. Cf. Elena P0.
16. **Drift skills/** : `skills/02-VOICE_SHEET.md` devrait codifier ces 10 adjectifs + le placeholder règle doctrinale. À vérifier — si absent, drift documentation.
17. `skills/00-CONCEPT.md`, `skills/01-ARCHITECTURE.md`, `skills/10-SACRED.md` toujours désalignés v60. Cross-cutting Sprint 38.

### Verdict : **Recalé**

### Justification
Step 4 lui-même est doctrinalement **excellent** (adjectifs canoniques, placeholder règles, tutoiement, anti-gamification, cap 3 doctrinal). Mais **deux problèmes doctrinaux** : (a) "onboarding" en UI sur le Trigger/HeaderCta autour (déjà signalé) — Sarah/Hélène strict ; (b) **dette de transfert** — `ton_adjectifs` ET `audience_principale` ne sont pas transférés vers `brands`. Si Floriane termine le wizard et va sur `/ma-marque`, elle perd ses adjectifs (sauf si la page native lit `brand_onboarding_sessions` — peu probable). C'est une **promesse brisée** au sens Hélène : "tu as répondu, on garde tout, tu peux modifier après". Si on jette une partie, on triche.

### Recommandations
- **P0** : Trancher la dette `responses['1'].audience_principale` + `responses['3'].ton_adjectifs` non transférées vers `brands`. Cf. Elena P0.
- **P0** : Bannir "onboarding" en UI (cf. Sarah P0).
- **P1** : Codifier les 10 adjectifs + le placeholder "Phrases courtes, jamais d'exclamation. Pas de marketing. On affirme, on documente." dans `skills/02-VOICE_SHEET.md` comme palette/règles canoniques.
- **P1** : Mettre à jour skills/ pour v60 (cross-cutting Sprint 38).
- **P2** : Considérer un screen "Confirmation marque" entre Terminer wizard et `/ma-marque` qui résume les 4 réponses ("Voici ta marque : Angelina Paris. Audience : [...]. Piliers : [...]. Ton : [...]. Tu peux modifier à tout moment."). Doctrine tranquillité + contrôle. V2 si jugé surcharge.

---

## Synthèse de la page

### Verdicts cumulés
| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé |
| Elena Archi | ❌ Recalé |
| Sarah Copy | ❌ Recalé |
| Marcus Workflow | ❌ Recalé |
| Hélène Doctrine | ❌ Recalé |

### Top fixes priorisés
- **P0** :
  1. **Dette transfert** : trancher `responses['1'].audience_principale` + `responses['3'].ton_adjectifs` non transférées vers `brands`. Soit ajouter colonnes (`audience_cible_principale`, `ton_adjectifs`) et transférer, soit ajouter colonne `brand_book` JSON, soit repousser explicitement V2.
  2. **Bannir "onboarding"** en UI : aria-label sheet, ResumeChoiceMiniSheet "nouvel onboarding", BrandOnboardingHeaderCta. 3 emplacements.
  3. **Touch target chips adjectifs ≥ 44px** + touch target BrandOnboardingHeaderCta.
  4. **Validation Zod côté `completeBrandOnboarding`** (présence responses['0'].nom au minimum).
  5. **Transaction (RPC SQL)** entre UPDATE brands + UPDATE sessions dans completeBrandOnboarding.
  6. Hériter des fixes P0 fichiers 03-05.
- **P1** :
  1. Message "Max 3 sélections" quand cap chips atteint.
  2. Toast / mini-transition post-Terminer + bannière de confirmation sur `/ma-marque`.
  3. Nettoyer console.info/warn/error dans BrandOnboardingTrigger.
  4. Exporter `TON_ADJECTIFS_OPTIONS` depuis `lib/brand-onboarding/types.ts`.
  5. Codifier les 10 adjectifs + placeholder règle dans `skills/02-VOICE_SHEET.md`.
  6. Halos signature sur ResumeChoiceMiniSheet (ou cohérence assumée).
  7. Remplacer rgba accent hardcodés par `color-mix(...)`.
  8. Mettre à jour skills/ pour v60.
- **P2** :
  1. Mini-preview ton de voix.
  2. Cacheable Anthropic prompt pour pré-remplir ton à partir des réponses précédentes (V2).
  3. Spinner pendant `phase.kind === 'loading'` Trigger.
  4. Screen confirmation marque entre Terminer et /ma-marque.
  5. Cleanup périodique sessions COMPLETED.
  6. Keyboard shortcut Cmd+Enter.

### Verdict global page
**Recalé** (0 axe Validé sur 5)

Step 4 + Trigger + HeaderCta cumulent les frictions des 3 steps précédents + ajoutent une **dette technique critique** (transfert partiel `responses` → `brands`). Sur le step terminal, c'est doublement visible : Floriane termine le wizard et certains de ses choix sont silencieusement perdus. C'est la friction la plus grave de tout le flow d'onboarding et le P0 le plus important du Sprint 38. Réparation : 1-2 jours sur la dette transfert + 1 jour sur les renamings/UI/copy. Step 4 est très près du Validé doctrinal pur (Sarah/Hélène ont validé le step en soi, seulement coulé par le contour).

---

## Note drift skills/ (Axe 5 cross-cutting)

Step 4 expose **trois opportunités de codification skills/** :
1. **Les 10 adjectifs ton-de-voix** (sang-froid, documenté, chaleureux, précis, narratif, sobre, érudit, tranchant, doux, fier) sont une **palette canonique Creative Fair**. À codifier dans `skills/02-VOICE_SHEET.md` ou équivalent.
2. **Le placeholder règle** : "Phrases courtes, jamais d'exclamation. Pas de marketing. On affirme, on documente." est **la voice sheet condensée**. À codifier comme règle de référence.
3. **La dette `responses` non-transférées** : à documenter dans `skills/03-MULTI_TENANT.md` ou un doc dédié "Modèle de données brand" pour empêcher la dette de se reproduire.

Plus largement : `skills/00-CONCEPT.md`, `skills/01-ARCHITECTURE.md`, `skills/10-SACRED.md` toujours désalignés sur l'ancien produit (forest green, nav 4 destinations, routes sans tiret). Cross-cutting Sprint 38, P0 doctrinal — c'est la même observation depuis les 6 fichiers de cet audit. À traiter en synthèse Sprint 38 prioritairement.
