# Page : Onboarding Ma Marque — Step 1/4 (Identité)

## Métadonnées
- Route : `/ma-marque?onboarding=true` (déclenche `BrandOnboardingTrigger` qui monte `BrandOnboardingSheet`, step initial `current_step = 0`)
- Fichier source principal : `components/onboarding-marque/BrandOnboardingStep.tsx` (576 lignes, fonction `Step0Identity` lignes 77-109)
- Fichiers contexte : `components/onboarding-marque/BrandOnboardingSheet.tsx` (305 lignes) — chrome sheet ; `components/onboarding-marque/BrandOnboardingTrigger.tsx` (266 lignes) — déclencheur ; `app/_actions/brand-onboarding.ts` (252 lignes) — server actions ; `lib/brand-onboarding/types.ts` — types et constantes (TOTAL_STEPS = 4)
- Composants principaux : `<BrandOnboardingSheet>`, `<Step0Identity>` (inline dans Step dispatcher), `<StepShell>`, `<TextField>`, `<TextAreaField>`, `<WizardProgressBar>`, `<ExitConfirmDialog>`
- Server / Client : **Client Component** (`'use client'` ligne 8) avec Server Actions (`updateBrandOnboardingStep`, `completeBrandOnboarding`)
- Screenshot : à produire côté Lead via `_capture.mjs` (auth + onboarding actif requis)

## Lecture rapide
Step 1 (index 0) du wizard guidé Ma Marque — "Comment s'appelle ta marque ?". Demande **2 champs** : nom (input texte) + description courte (textarea). Le wizard tourne dans une sheet fullscreen avec header sticky, barre de progression, halos signature, et footer Retour/Suivant. La copie est tutoyée. L'architecture wizard-session est solide (persistance pas-à-pas, reprise IN_PROGRESS, dispatcher dispatchstep). En revanche, la palette visuelle du step contient des hardcoded inputs hors-token, le contraste accent `#5856D6` (indigo) sur l'eyebrow "Ma Marque" est cohérent avec la signature v60 mais isolé, et certaines micro-frictions (autofocus, validation, hierarchy CTA) trahissent un wizard encore en rodage Sprint 37.E.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. `BrandOnboardingSheet.tsx:126` — `background: '#FBFAF7'` hardcodé en hex. **Crème v60** OK mais **devrait être tokenisé** (`var(--color-background)`). Drift mineur.
2. `BrandOnboardingSheet.tsx:135-140` — `<div className="bg-halo bg-halo-1..6" />` × 6. Halos signature v60 statiques injectés DANS le wizard pour traverser le z-index 1200. **Conforme** spec halos statiques + signature v60.
3. `BrandOnboardingSheet.tsx:152` — header `background: 'rgba(251, 250, 247, 0.85)'` + `backdropFilter: 'blur(20px) saturate(1.5)'`. **Liquid Glass conforme** mais la rgba crème est hardcodée numériquement au lieu de passer par un token. Doublon de la couleur crème.
4. `BrandOnboardingSheet.tsx:170` — `background: '#5856D6'` (indigo iOS) sur la pastille eyebrow "Ma Marque". **Couleur signature v60 ok** (indigo fait partie de la palette pastels) mais hex hardcodé au lieu de `var(--color-system-indigo)`. À tokeniser.
5. `BrandOnboardingSheet.tsx:218` — `color: '#C0392B'` sur l'erreur. **Rouge non-iOS** (`var(--color-system-red)` = `#FF3B30` canonique). Hex hardcodé incohérent avec le reste des couleurs iOS de l'app.
6. `BrandOnboardingStep.tsx:552-562` — `inputStyle` : `padding: '12px 14px'`, `borderRadius: 10`, `border: '1px solid rgba(0, 0, 0, 0.08)'`, `background: 'rgba(255, 255, 255, 0.6)'`. **Toutes les valeurs hardcodées**. Aucun `var(--color-separator)`, aucun `var(--radius-medium)`. Drift Hiroshi.
7. `BrandOnboardingStep.tsx:275-278` — Step5Piliers wrapper : `background: 'rgba(0, 0, 0, 0.02)'`, `border: '1px solid rgba(0, 0, 0, 0.05)'`, `borderRadius: 12`. Hardcodé.
8. `BrandOnboardingStep.tsx:563-575` — `tagStyle` : `border: '1px solid rgba(0, 122, 255, 0.18)'`, `background: 'rgba(0, 122, 255, 0.08)'`. Accent `#007AFF` v60 utilisé proprement, mais en rgba numérique hardcodé. Aurait dû être `color-mix(in srgb, var(--color-accent) 18%, transparent)` ou tokenisé.
9. `BrandOnboardingStep.tsx:528-543` — `titleStyle`, `descStyle`, `labelStyle` : utilisent `var(--font-system)`, `var(--color-label)`, `var(--color-secondary-label)`, `var(--color-tertiary-label)`. **Tokens v60 corrects**. Hiroshi valide sur ces 3 styles.
10. `BrandOnboardingSheet.tsx:259-266` — animation `cfs-wizard-in` (`opacity 0→1`, `transform scale 0.98→1`, 280ms ease-out) + respect `prefers-reduced-motion`. **Conforme** Hiroshi (pas de rotation, pas de pulse, animation d'entrée discrète, prefers-reduced-motion respecté).
11. **AUCUN `#1F4937` détecté** dans ce step ni dans le chrome sheet. ✅
12. Espacements : `gap: 24`, `gap: 14`, `gap: 6`, `padding: '14px 16px'`, `padding: '18px 22px'`. Mix de multiples de 4 (24, 16, 8, 4) et de valeurs non-canoniques (14, 22, 6). Drift grille 4/8/12/16/24/32.
13. Touch target Croix header : 32×32px (`closeBtnStyle` lignes 271-283). **Sous 44px**. Recalé.
14. Touch target CTA primaire footer : `padding: '10px 14px'` via `inputStyle` ou via `btn-primary` (classe CSS externe — à vérifier dans `globals.css`). Si `btn-primary` n'a pas `min-height: 44px`, recalé.
15. Police titre H2 : `fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3`. **Conforme** typographie SF Pro v60.
16. Pas de gamification visuelle (pas de jauges, pas de streaks, pas de compteurs gamifiés). RAS.
17. Halos statiques (pas de rotation/pulse). RAS.
18. `WizardProgressBar` (composant externe non lu ici) : à auditer en fichier dédié, mais le pattern barre fine + indicateur "N / 4" header (ligne 188) est conforme.

### Verdict : **Recalé**

### Justification
Le wizard sheet a fait l'effort de signer (halos, Liquid Glass header, indigo pastille, animation d'entrée respectueuse), mais le **détail des champs et primitives est encore en hardcoded rgba** au lieu d'être tokenisé v60. Plus de 8 occurrences de couleurs/radius/borders en valeurs numériques brutes. Sur un wizard qui est censé incarner la doctrine Liquid Glass v60, cette accumulation crée une dette visuelle subtile mais réelle. Touch target croix sous 44px confirme.

### Recommandations
- **P0** : Remplacer tous les hex et rgba hardcodés par des tokens : `#FBFAF7` → `var(--color-background)`, `#5856D6` → `var(--color-system-indigo)`, `#C0392B` → `var(--color-system-red)`, `rgba(0,0,0,0.08)` → `var(--color-separator)` etc.
- **P0** : Croix header 32×32 → 44×44 (ou min-touch wrapper 44×44 avec icône 32×32 centrée).
- **P1** : Vérifier que `btn-primary` (classe CSS dans `globals.css` ou `styles/`) garantit `min-height: 44px`. Sinon ajouter.
- **P1** : Aligner espacements sur la grille 4/8/12/16/24/32 — virer `6, 14, 22, 10` partout où c'est gratuit.
- **P2** : `inputStyle` ligne 552 devrait être promu en classe CSS `.cfs-wizard-input` dans `globals.css` au lieu d'inline-style. Permet d'avoir un `:focus` état (border accent + ring) qui manque actuellement (pas de transition focus visible).
- **P2** : Background `rgba(251, 250, 247, 0.85)` header → token `--color-surface-elevated` ou `--color-background-glass`.

---

## Axe 2 — Elena (Archi)

### Observations
1. `BrandOnboardingTrigger.tsx:31-148` — orchestration triggered → loading → resume-choice ou sheet. **Pattern propre** Sprint 37.G (F67) avec fix documenté en commentaire (lignes 78-89) sur le bug `phase.kind` dans les deps.
2. `BrandOnboardingTrigger.tsx:90-129` — useEffect avec `eslint-disable react-hooks/exhaustive-deps`. **Justifié et documenté** (commentaire fix bug F67). Acceptable Elena.
3. `BrandOnboardingTrigger.tsx:48-55` — second useEffect (listener `CustomEvent`). Deps `[]` mount-only. Propre.
4. `BrandOnboardingSheet.tsx:35-96` — état local minimal : `session`, `showExitDialog`, `saving`, `error`. Pas de redondance avec server. Conforme.
5. `BrandOnboardingSheet.tsx:57-84` — `saveStep` appelle Server Action `updateBrandOnboardingStep`, met à jour la session locale avec la réponse, gère le saving + error. **Pattern Server Action + état optimiste-soft propre**.
6. `BrandOnboardingStep.tsx:27-73` — dispatcher `switch` sur `stepIndex`. **4 cases** (0, 1, 2, 3), `default: return null`. Conforme Sprint 37.E. La doctrine 4-steps tient.
7. `BrandOnboardingStep.tsx:77-109` — `Step0Identity` : `useState` local pour `nom` et `desc`, appel `onSave(0, '0', { nom, description_courte: desc })`. **Validation côté UI** : `canContinue={nom.trim().length > 0}` (description non-required, intentionnel ?).
8. `app/_actions/brand-onboarding.ts:1-3` — `'use server'` en tête. Conforme.
9. `app/_actions/brand-onboarding.ts:58-75` — `getCurrentTenantId` : auth check + lookup profile.tenant_id. Pattern multi-tenant doctrine. ✅
10. `app/_actions/brand-onboarding.ts:86, 113, 142, 186, 240` — usage de `createAdmin()` (service_role Supabase) pour les écritures sur `brand_onboarding_sessions`. **À justifier** : pourquoi pas le client utilisateur avec RLS ? La table a sans doute des contraintes RLS strictes que le service_role bypasse — mais alors le `eq('tenant_id', ctx.tenantId)` à chaque query devient le seul garde-fou multi-tenant. Si un dev oublie un `eq('tenant_id')` quelque part, leak inter-tenant. **Risque Elena**.
11. `app/_actions/brand-onboarding.ts:130-176` — `updateBrandOnboardingStep` : lit l'existant, merge `responses[stepIndex] = response`, update. Pattern correct.
12. `app/_actions/brand-onboarding.ts:181-233` — `completeBrandOnboarding` : transfère responses → table `brands` (colonnes `nom`, `piliers_narratifs`, `ton`). Mapping documenté en commentaire 197-201.
13. `app/_actions/brand-onboarding.ts:215-220` — update `brands` `WHERE tenant_id = ctx.tenantId`. **Pas de check d'unicité brand par tenant** : si 2 brands existent par tenant (bug), le UPDATE écrase les deux. Edge case mais possible.
14. `app/_actions/brand-onboarding.ts:153-156` — merge des responses : `{ ...row.responses, [String(input.stepIndex)]: input.response }`. Pas de validation Zod de `input.response`. Si client envoie n'importe quoi, on stocke n'importe quoi. **Trust client = anti-pattern Elena**.
15. `BrandOnboardingTrigger.tsx:11-21` — imports propres. Pas de circular.
16. `BrandOnboardingSheet.tsx:42-51` — listener Escape sur keydown → ouvre ExitConfirmDialog. Conforme accessibilité.
17. `BrandOnboardingStep.tsx:88` — `useState(initialNom)` initialisé via prop. **Pattern OK pour un wizard** (l'état ne traverse pas les steps, chaque step a sa propre instance).
18. **Pas de cacheable prompt Anthropic** sur step 1 (pure data entry). N/A.
19. Console.info/warn/error pollue le code (`BrandOnboardingTrigger.tsx:50, 94, 97, 99, 106, 111, 118, 121`). Acceptable en debug Sprint 37, à nettoyer pour V1.

### Verdict : **Recalé**

### Justification
L'architecture du wizard est globalement bien pensée (orchestration trigger, séparation dispatch, server actions cohérentes), mais deux points doctrinaux Elena fâchent : (a) **usage de `createAdmin` (service_role) systématique** au lieu de Supabase client utilisateur + RLS, ce qui fait porter toute la sécurité multi-tenant aux `eq('tenant_id', ctx.tenantId)` manuels — un seul oubli = leak ; (b) **absence de validation côté serveur** sur la forme des `responses` reçues du client. Si un client malveillant envoie `{ nom: <2MB de texte>, description_courte: <JSON exploit> }`, on stocke. Plus les console.info à nettoyer + le risque "deux brands par tenant" non-couvert.

### Recommandations
- **P0** : Ajouter validation Zod sur `input.response` côté `updateBrandOnboardingStep` selon le `stepIndex`. Sinon `responses` est un junkyard.
- **P0** : Documenter explicitement (en commentaire dans `actions.ts`) pourquoi `createAdmin` est utilisé au lieu du client user + RLS. Idéalement, créer un wrapper `withTenantScope(admin, ctx.tenantId)` qui force le `eq('tenant_id', ctx.tenantId)` sur toute query, pour empêcher l'oubli.
- **P1** : Nettoyer tous les `console.info/warn/error` de `BrandOnboardingTrigger.tsx` ou les passer derrière un flag `process.env.NEXT_PUBLIC_DEBUG_ONBOARDING`.
- **P1** : Ajouter un check d'unicité `brands` par tenant côté `completeBrandOnboarding` (ou contrainte SQL).
- **P2** : Considérer migrer `brand_onboarding_sessions` writes vers le client user + RLS strict (policy `tenant_id = user_tenant_id()`). Refacto plus lourd, V2.

---

## Axe 3 — Sarah (Copy)

### Observations
1. `BrandOnboardingStep.tsx:93` — titre "Comment s'appelle ta marque ?" : **tutoiement** ✅. Question directe, sobre.
2. `BrandOnboardingStep.tsx:94` — desc "Le nom officiel + une description courte (1-2 phrases)." : **neutre/instructionnel**, pas de tutoiement explicite mais pas de vouvoiement. Acceptable.
3. `BrandOnboardingStep.tsx:100` — label TextField "Nom de la marque" : sobre, RAS.
4. `BrandOnboardingStep.tsx:102` — label TextArea "Description courte" : sobre, RAS.
5. `BrandOnboardingStep.tsx:105` — placeholder "Ex. Maison de joaillerie héritière fondée en 1923 à Paris." : **exemple inspirant** dans la veine Veja / Hermès Métiers — cohérent doctrine. Bon point.
6. `BrandOnboardingSheet.tsx:160-161` — `aria-label="Fermer l'onboarding"` sur la croix. **Le mot "onboarding"** apparaît en aria-label, donc visible aux utilisateurs lecteurs d'écran. Doctrine v60 interdit "onboarding" en UI utilisateur. **Recalé Sarah strict**. Alternatives : "Fermer", "Sortir de la configuration", "Fermer le guide".
7. `BrandOnboardingSheet.tsx:171` — eyebrow pastille "Ma Marque" : **possessif "Ma"** ✅. Conforme doctrine nav v60.
8. `BrandOnboardingSheet.tsx:174` — `BRAND_ONBOARDING_STEP_LABELS[currentStep]` = "Identité marque" (cf. `lib/brand-onboarding/types.ts:47`). Tutoiement non-applicable (label), neutre. Acceptable.
9. `BrandOnboardingSheet.tsx:188` — "{currentStep + 1} / {BRAND_ONBOARDING_TOTAL_STEPS}" = "1 / 4". Strict numérique. RAS.
10. `BrandOnboardingStep.tsx:458, 467` — boutons footer : "Enregistrement…", "Terminer", "Suivant". **Tutoiement neutre** (pas de pronom). Acceptable. Notes : "Enregistrement…" est froid, alternative "On enregistre…" plus chaleureux.
11. `BrandOnboardingStep.tsx:448` — "Retour" : sobre. RAS.
12. `BrandOnboardingStep.tsx:142` — "Passer cette étape" : tutoiement neutre. RAS.
13. `BrandOnboardingTrigger.tsx:215` — "Tu as déjà commencé" : **tutoiement** ✅. Chaleureux.
14. `BrandOnboardingTrigger.tsx:226` — "Tu en es à l'étape {currentStep + 1} sur {totalSteps}. Tu veux reprendre où tu en étais ou tout recommencer ?" : tutoiement parfait, ton Floriane tranquillité. ✅
15. `BrandOnboardingTrigger.tsx:235-236` — "Reprendre où j'en étais (étape X sur N)" : tutoiement implicite via "j'en étais". Conforme.
16. `BrandOnboardingTrigger.tsx:243` — "Recommencer un nouvel onboarding" : **mot "onboarding" en UI utilisateur**. Recalé doctrine.
17. `BrandOnboardingTrigger.tsx:259` — "Plus tard" : sobre. ✅
18. `BrandOnboardingHeaderCta.tsx:46-47` — labels : "Reprendre l'onboarding guidé →" / "Lancer un onboarding guidé →". **Double occurrence du mot "onboarding" dans le CTA principal de /ma-marque**. Recalé doctrine Sarah strict.
19. Aucun "users", "audience" (sauf au titre légitime de Step 1 "Audience cible" — exempté car concept business), "dashboard", "workflow", "feature", "engagement", "viral", "boost", "growth hack", "streak", "level up", "unlock". RAS sur le reste du vocabulaire interdit.
20. Pas de gamification verbale. RAS.

### Verdict : **Recalé**

### Justification
3 occurrences du mot **"onboarding"** en UI utilisateur (aria-label croix, label resume choice, CTA header `/ma-marque`). La doctrine v60 interdit strictement "onboarding" en UI — c'est du jargon SaaS qui casse la voix Creative Fair. Tout le reste de la copy est bien tutoyé et sobre. Mais le mot interdit revient 3 fois sur un même flow → Recalé Sarah.

### Recommandations
- **P0** : Remplacer toutes les occurrences "onboarding" en UI :
  - `aria-label="Fermer l'onboarding"` → "Fermer le guide" ou "Fermer".
  - "Recommencer un nouvel onboarding" → "Recommencer depuis le début".
  - "Lancer un onboarding guidé" → "Lancer le guide" ou "Configurer ma marque".
  - "Reprendre l'onboarding guidé" → "Reprendre le guide".
- **P1** : "Enregistrement…" → "On enregistre…" (plus chaleureux, sur la même chaîne).
- **P2** : Tester un wording plus narratif sur le titre desc Step 0 : "Donne-moi le nom officiel + une description courte de ta marque." (tutoiement explicite). Optionnel.

---

## Axe 4 — Marcus (Workflow)

### Observations
1. `BrandOnboardingTrigger.tsx:90-129` — flow d'ouverture : URL `?onboarding=true` OU event → loading → check resumable → soit resume-choice soit create-session. **3 niveaux possibles** (idle / resume-choice / sheet). Cascade contrôlée, pas > 2 visibles côté Floriane (loading invisible si rapide).
2. `BrandOnboardingTrigger.tsx:78-89` — commentaire détaillant la chasse au bug F67 (phase bloqué en `loading` à cause des deps). **Bonne discipline** mais surtout : ça signale que le wizard a eu un bug "Floriane bloquée sur écran loading" qui est désormais fixé. Risque résiduel : si le commentaire est ignoré par un futur dev qui rajoute `phase.kind` aux deps, le bug revient.
3. `BrandOnboardingSheet.tsx:42-51` — Escape key ouvre `ExitConfirmDialog`. Conforme accessibilité + workflow.
4. `BrandOnboardingSheet.tsx:58-84` — saving state : `setSaving(true)` avant call, `setSaving(false)` finally. Visible côté UI via `disabled={!canContinue || saving}` et texte "Enregistrement…" (`BrandOnboardingStep.tsx:467, 458`). **Loading state propre**. ✅
5. `BrandOnboardingSheet.tsx:40` — `error` state : affiché ligne 211-225 dans une bannière `role="alert"`. **Error state propre**. ✅
6. `BrandOnboardingStep.tsx:88-89` — `useState(initialNom)` + `useState(initialDesc)`. **Pas d'autofocus** sur l'input. Floriane qui arrive sur Step 0 doit cliquer manuellement dans le champ. Friction.
7. `BrandOnboardingStep.tsx:98` — `canContinue={nom.trim().length > 0}` : description courte non-required. Floriane peut avancer sans description. **Choix produit acceptable** mais inconsistant avec la copie ligne 94 "Le nom officiel + une description courte" qui sous-entend que les deux sont attendus.
8. `BrandOnboardingStep.tsx:95` — `onNext={() => onSave(0, '0', { nom, description_courte: desc })}` : envoie même si desc vide. Cohérent avec `canContinue`. RAS technique.
9. `BrandOnboardingStep.tsx:447-470` — footer Retour / Suivant. Step 0 : `onBack={null}` (cf. ligne 93), donc juste un `<span />` à gauche. **Asymétrie visuelle** acceptable.
10. Touch target croix 32×32px : **sous 44px**. Recalé.
11. Touch target inputs : `padding: '12px 14px'` → hauteur ~44px. Conforme.
12. Touch target boutons footer : dépend de `btn-primary` / `btn-choice` (classes CSS externes). À vérifier dans `globals.css`.
13. `BrandOnboardingSheet.tsx:247-256` — `ExitConfirmDialog` : montré quand croix ou Escape. Bon réflexe Marcus (confirmation action destructive).
14. **Pas de validation côté UI** pour la longueur min/max du nom ou de la description. Floriane peut taper "X" comme nom et avancer. Sur un wizard premium, max 80 caractères et alerte si > seuil serait attendu (cf. `OnboardingFlow.tsx:51` original qui avait `maxLength: 80`).
15. **Pas d'autosave** explicite : le step n'est sauvegardé que sur clic "Suivant". Si Floriane ferme l'onglet en plein milieu de la frappe, perte de saisie. La session est persistée mais la frappe en cours ne l'est pas. Acceptable pour V1, à signaler.
16. `BrandOnboardingTrigger.tsx:57-61` — `cleanUrl` retire `?onboarding=true` via `router.replace('/ma-marque')`. **Bon réflexe URL clean**.
17. `BrandOnboardingTrigger.tsx:131-148` — render final : 4 phases distinctes (sheet / resume-choice / loading invisible / idle null). **Pas de flash de contenu**.
18. **Pas de keyboard navigation explicite** entre les champs nom et description (Tab navigue mais aucun fokus management custom). Acceptable.

### Verdict : **Recalé**

### Justification
Le wizard est globalement bien-pensé Marcus (loading + error + Escape + ExitConfirmDialog + resume choice), mais accumule 3 frictions sur le step 1 : (a) **pas d'autofocus** sur le premier input du wizard (Floriane perd 1 clic), (b) **touch target croix 32×32** sous 44px, (c) **pas de maxLength** sur les inputs (Floriane peut taper 5000 caractères). Plus le risque résiduel du bug F67 si un futur dev casse les deps. Recalé sur les frictions accumulées, pas un échec catastrophique.

### Recommandations
- **P0** : Autofocus sur l'input nom au mount Step 0. `useEffect(() => inputRef.current?.focus(), [])`.
- **P0** : Touch target croix header → 44×44px.
- **P1** : Ajouter `maxLength` sur TextField (80) et TextAreaField (400) cohérent avec `OnboardingFlow.tsx`.
- **P1** : Compteur caractères discret sous la textarea description (ex : "120 / 400") quand approche du max.
- **P2** : Considérer un autosave debounced (1500ms) en plus du save sur "Suivant" pour ne pas perdre la frappe si Floriane ferme l'onglet.
- **P2** : Ajouter un test e2e qui couvre le scénario F67 (open → loading → sheet) pour empêcher la régression.
- **P2** : Préciser dans la copy si `description_courte` est obligatoire ou non. Actuellement ambigu (UI permet vide, copy suggère que les 2 sont attendus).

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. **Cible Floriane** : le wizard guidé "Ma Marque" est exactement la friction-low experience que Floriane attend. 4 étapes, sobres, focus identité+audience+piliers+ton. Conforme.
2. **Citation anchor "tableau de bord simple et efficace, contrôle, pilote"** : le wizard est pile dans la veine "contrôle, pilote" — Floriane structure les fondations de sa marque, le conseiller s'en sert après.
3. **6 promesses CF** : promesse "Tu pilotes" implémentée via les choix manuels à chaque step. Promesse "Tu ne signes rien à l'aveugle" implémentée via desc + placeholder qui montrent l'exemple. Conforme.
4. **Tranquillité narrative** : la sheet est calme, halos crème, animation 280ms ease-out, header sticky discret. Conforme.
5. **Anti-gamification** : pas de jauge, pas de score, pas de badges. Indicateur "1 / 4" est sobre. ✅
6. **Anti-jargon SaaS** : "onboarding" en UI (cf. Sarah) = drift jargon SaaS. Recalé Hélène aussi.
7. **Vouvoiement** : zéro vouvoiement détecté dans Step 0 (Sarah validé sur ce point ; le seul Recalé est sur "onboarding").
8. **Cohérence Angelina / Comptoir / Tous en Tête** : le placeholder ligne 105 "Maison de joaillerie héritière fondée en 1923 à Paris" est dans le même registre qu'Angelina (maison de salon de thé), Comptoir (lieu hybride parisien), Tous en Tête (humanitaire). Sobre, sourcé, narratif. ✅
9. **Modèle B2B custom 12K€ setup** : un wizard à 4 étapes critiques avec passage rapide possible (canContinue n'exige que le nom) est cohérent avec une posture "haute main" — Creative Fair pré-remplit beaucoup côté équipe, Floriane valide / ajuste.
10. **Tranchant "Ma Marque" + pastille indigo** : le marquage de section visuelle (eyebrow + accent indigo) signe Creative Fair. Cohérent doctrine Hiroshi+Hélène.
11. **Drift code ↔ skills/** :
    - `skills/00-CONCEPT.md`, `skills/01-ARCHITECTURE.md`, `skills/10-SACRED.md` décrivent encore l'ancien produit (forest green, nav 4 destinations, routes sans tiret). Le code Step 0 lui-même est aligné spec v60 (palette, accent indigo, pastels), donc **alignement code ↔ spec OK, désalignement code ↔ skills/**. Cross-cutting Sprint 38.
    - **Désalignement secondaire** : `skills/02-VOICE_SHEET.md` (à vérifier) pourrait encore mentionner "onboarding" comme vocabulaire autorisé. À ré-aligner.
12. **Phase 1 / Phase 2** : N/A direct (le wizard pose les fondations, pas le programme).
13. **Trilogie Organique / Outreach / Libre** : N/A direct.
14. **6 promesses CF — promesse "Pas d'IA qui décide"** : la copie Sprint 37+ documente que les responses peuvent être "pré-remplies par le conseiller" (cf. commentaire `BrandOnboardingStep.tsx:5-7`). Tant que c'est pré-remplissage **suggestion**, conforme. Si ça devient remplissage automatique sans validation → recalé Hélène.

### Verdict : **Recalé**

### Justification
Le step 1 est doctrinalement très propre sur le fond (tranquillité, Floriane, piliers narratifs, anti-gamification, tutoiement implicite, B2B custom). Mais **le mot "onboarding" qui apparaît 3 fois dans le flow autour** (aria-label, resume choice label, CTA header) suffit à faire basculer Hélène en Recalé : c'est du jargon SaaS interdit, et c'est sur le CTA d'entrée du wizard. La voix Creative Fair est cassée par ce mot.

### Recommandations
- **P0** : Bannir "onboarding" de l'UI utilisateur (cf. Sarah P0 — c'est aussi Hélène P0).
- **P1** : Vérifier `skills/02-VOICE_SHEET.md` pour s'assurer que "onboarding" est listé en vocabulaire interdit.
- **P1** : Mettre à jour `skills/00-CONCEPT.md`, `skills/01-ARCHITECTURE.md`, `skills/10-SACRED.md` pour aligner sur la spec v60 (cross-cutting Sprint 38).
- **P2** : Garde-fou "pré-remplissage = suggestion + validation explicite". Si Sprint 38+ ajoute du pré-remplissage par le conseiller, garder UN bouton "Valider la suggestion" explicite ; ne JAMAIS remplir et avancer automatiquement sans clic Floriane. Sinon promesse "Tu pilotes" cassée.

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
  1. Bannir "onboarding" de l'UI (aria-label croix, resume choice label, CTA header /ma-marque). Sarah + Hélène.
  2. Remplacer tous les hex et rgba hardcodés par des tokens v60 (`#FBFAF7`, `#5856D6`, `#C0392B`, `rgba(0,0,0,0.08)`, `rgba(255,255,255,0.6)` etc).
  3. Validation Zod côté `updateBrandOnboardingStep` selon `stepIndex`.
  4. Documenter ou wrapper le pattern `createAdmin` + `eq('tenant_id')` pour empêcher l'oubli.
  5. Touch target croix 32×32 → 44×44.
  6. Autofocus sur l'input nom au mount Step 0.
- **P1** :
  1. Vérifier `btn-primary` min-height 44px.
  2. Aligner espacements sur grille 4/8/12/16/24/32.
  3. `maxLength` sur TextField (80) + TextAreaField (400).
  4. Compteur caractères sous textarea desc.
  5. Nettoyer `console.info/warn/error` dans BrandOnboardingTrigger.
  6. Check unicité brand par tenant côté `completeBrandOnboarding`.
  7. Mettre à jour skills/ pour aligner sur v60.
  8. "Enregistrement…" → "On enregistre…".
- **P2** :
  1. Migrer writes vers client user + RLS strict (V2).
  2. Promouvoir `inputStyle` en classe CSS avec `:focus` état.
  3. Autosave debounced.
  4. Test e2e scénario F67.
  5. Préciser obligation description_courte.

### Verdict global page
**Recalé** (0 axe Validé sur 5)

Le wizard step 0 cumule des frictions sur les 5 axes. Aucune n'est catastrophique individuellement, mais l'accumulation est nette. Le mot "onboarding" en UI est le P0 le plus visible (touche Sarah ET Hélène), suivi des tokens hardcodés (touche Hiroshi) et de la validation manquante côté server (touche Elena). Un sprint de polish ciblé (1-2 jours) suffit à passer ce step en Validé.

---

## Note drift skills/ (Axe 5 cross-cutting)

Observé sur ce step : alignement **code ↔ spec v60 partiellement OK** (palette signature OK, halos OK, indigo accent OK), mais désalignement code ↔ skills/. Les fichiers `skills/00-CONCEPT.md`, `skills/01-ARCHITECTURE.md`, `skills/10-SACRED.md` décrivent encore l'ancien produit (forest green, nav 4 destinations, routes sans tiret). À ré-aligner — cross-cutting Sprint 38, P0 doctrinal.

De plus, si `skills/02-VOICE_SHEET.md` autorise encore "onboarding" en UI, il faut le passer en interdit explicite et lister les alternatives ("guide", "configuration", "premiers réglages").
