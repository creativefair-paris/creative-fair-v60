# Page : Onboarding Ma Marque — Step 2/4 (Audience cible principale)

## Métadonnées
- Route : `/ma-marque?onboarding=true` (wizard step `current_step = 1`)
- Fichier source principal : `components/onboarding-marque/BrandOnboardingStep.tsx` (lignes 41-52 — case 1 du dispatcher → `SingleTextArea`) + primitive `SingleTextArea` lignes 113-147
- Fichier chrome partagé : `components/onboarding-marque/BrandOnboardingSheet.tsx` (audité fichier 03, repris ici sur ses points step-spécifiques)
- Composants principaux : `<SingleTextArea>` (primitive réutilisable), `<StepShell>`, `<TextAreaField>`
- Server / Client : Client Component (`'use client'`)
- Screenshot : à produire côté Lead via `_capture.mjs` (auth + onboarding actif requis)
- Label step (cf. `lib/brand-onboarding/types.ts:48`) : "Audience cible principale"

## Lecture rapide
Step 2 du wizard (index 1) — une seule textarea, question "Qui est ton audience cible principale ?" + desc "Profil sociologique, attentes, comportements. Sois précis." Placeholder très long et inspirant : "Ex. Femmes 35-55, CSP+, déjà clientes joaillerie haute, attachées à la matière brute, lectrices Le Monde M Magazine." Pas de tags, pas de multi-segment, juste un texte libre. La primitive `SingleTextArea` est réutilisable (step 1, et historiquement step 2/3/4/10 avant Sprint 37.E qui a ramené à 4 étapes). Le mot **"audience"** est dans le titre du step, ce qui crée une tension avec le vocabulaire interdit Sarah — voir ci-dessous, car c'est ici un terme métier légitime (pas un vocabulaire d'analytics gamifié).

---

## Axe 1 — Hiroshi (UI)

### Observations
1. Step 2 hérite du chrome `BrandOnboardingSheet` audité fichier 03 (halos signature v60 OK, header Liquid Glass OK, animation entrée OK, indigo eyebrow OK, `#1F4937` absent ✅).
2. `BrandOnboardingStep.tsx:113-147` — `SingleTextArea` primitive. Pas de styling propre, hérite de `StepShell` (lignes 418-474) et `TextAreaField` (lignes 501-526).
3. `BrandOnboardingStep.tsx:134` — `<TextAreaField value={value} onChange={setValue} placeholder={props.placeholder} rows={5} />`. **`rows={5}` hardcodé**, pas tokenisé. Acceptable car contrainte HTML native.
4. `BrandOnboardingStep.tsx:501-526` — `TextAreaField` primitive : style `{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }`. `resize: 'vertical'` autorise Floriane à agrandir, mais visuellement le coin du textarea sera natif système (poignée OS), pas custom Creative Fair. Drift Liquid Glass.
5. `BrandOnboardingStep.tsx:552-562` — `inputStyle` partagé (cf. fichier 03) : hex hardcodés (`rgba(255,255,255,0.6)`, `rgba(0,0,0,0.08)`, `borderRadius: 10`). Tous les drifts Hiroshi identifiés fichier 03 s'appliquent ici. ❌
6. `BrandOnboardingStep.tsx:544-551` — `labelStyle` : `fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em'`. **Conforme eyebrow style**. ✅ Note : sur `SingleTextArea`, **pas de label** (le `label` prop de `TextAreaField` est optionnel ligne 508 et n'est pas passé ligne 134). La textarea apparaît donc directement sous le titre du step. Choix produit acceptable.
7. **Pas de focus state visible** sur la textarea (pas de `:focus` border accent dans `inputStyle`). Floriane ne sait pas visuellement quand elle est dans le champ.
8. **Pas de compteur caractères** affiché malgré un texte attendu long (placeholder ~120 caractères, réponses réelles 200-500 caractères selon doctrine). Drift UX subtle.
9. Espacement vertical entre titre/desc/textarea : `gap: 24` (StepShell), `gap: 14` (children container), `gap: 6` (header). Mix grille non-canonique (24 OK, 14 hors-grille, 6 hors-grille).
10. Aucun bouton "Passer" sur ce step (la primitive `SingleTextArea` accepte `allowSkip` ligne 121 mais Step 2 ne le passe pas). Cohérent doctrine : audience cible est critique, non-skippable.
11. Touch target textarea : padding 12px × 14px × `rows={5}` × `lineHeight: 1.5` × `fontSize: 14` → hauteur ~ 130-140px. Largement au-dessus 44px. ✅
12. Touch target boutons footer Retour / Suivant : dépend `btn-choice` / `btn-primary` (classes CSS externes). À vérifier dans `globals.css`.
13. Pas de halos dans la zone scroll (les halos sont en `position: fixed` cf. fichier 03). Conforme — la zone main scrolle, les halos ne scrollent pas.
14. Pas de gamification visuelle, pas d'animation gratuite. ✅
15. Le titre `<h2>` ligne 440 utilise `titleStyle` (fontSize 22, fontWeight 700, letterSpacing -0.01em). Conforme typographie SF Pro v60.

### Verdict : **Recalé**

### Justification
Step 2 hérite des drifts Hiroshi du chrome (audités fichier 03) + ajoute son propre drift : absence de focus state visible sur la textarea, absence de compteur caractères, et primitive `inputStyle` partagée non-tokenisée. Le step lui-même n'aggrave pas grand-chose, mais ne corrige rien non plus. Recalé par accumulation.

### Recommandations
- **P0** : Hériter des fixes P0 fichier 03 (tokenisation `inputStyle`, `closeBtnStyle`, etc).
- **P1** : Ajouter `:focus` état sur `inputStyle` (border `var(--color-accent)`, ring 3px `color-mix(in srgb, var(--color-accent) 25%, transparent)`).
- **P1** : Compteur caractères discret sous la textarea ("280 / 600" par exemple). Important sur step audience où Floriane écrit long.
- **P2** : `resize: 'vertical'` → considérer auto-grow JavaScript (textarea qui s'agrandit avec le contenu) pour rester dans le langage Liquid Glass sans poignée OS native. Optionnel.

---

## Axe 2 — Elena (Archi)

### Observations
1. `BrandOnboardingStep.tsx:42-52` — case 1 du dispatcher : appel `<SingleTextArea title="..." desc="..." placeholder="..." initial={r['1']?.audience_principale ?? ''} responseKey="1" fieldKey="audience_principale" {...props} />`. **Mapping propre** : `responseKey="1"` correspond à `stepIndex=1`, `fieldKey="audience_principale"` correspond au type `BrandOnboardingResponses['1'].audience_principale`.
2. `BrandOnboardingStep.tsx:113-147` — `SingleTextArea` primitive : prend `initial`, `responseKey`, `fieldKey`. `useState(props.initial)` local. **Pas de prop drilling excessif**, mais l'API a 8 props ce qui commence à être lourd.
3. `BrandOnboardingStep.tsx:123` — `const stepIdx = parseInt(props.responseKey, 10)`. **Conversion string→int implicite** : si `responseKey` est jamais passé non-numérique, NaN, save échoue silencieusement. Pas de garde-fou côté primitive.
4. `BrandOnboardingStep.tsx:129` — `props.onSave(stepIdx, props.responseKey, { [props.fieldKey]: value })` : `[props.fieldKey]: value` construit dynamiquement la shape. **Faiblement typé** : si Sprint 38+ change `fieldKey` côté types mais oublie côté call site, runtime bug.
5. `lib/brand-onboarding/types.ts:24` — `'1'?: { audience_principale: string }` : type strict côté responses. Mais côté primitive `SingleTextArea`, `fieldKey` est `string` brut. Drift type sécurité.
6. Côté serveur `app/_actions/brand-onboarding.ts:153-156` — merge `responses[stepIndex] = response` sans validation Zod. **Le serveur fait confiance au client**. Si client envoie `{ audience_principale: 'X' }` ou `{ audience: 'X' }` ou `{ audience_principale: 12345 }`, tout passe. Risque déjà signalé fichier 03.
7. `BrandOnboardingSheet.tsx:57-84` — `saveStep` est partagé entre tous les steps. Conforme.
8. `BrandOnboardingSheet.tsx:99` — `stepsAnswered = Object.keys(session.responses ?? {}).length` : utilisé par ExitConfirmDialog. Comptage propre.
9. **Pas de cacheable Anthropic** sur Step 2 (data entry pure, pas d'appel LLM). N/A.
10. **Tenant scoping** identique aux autres steps : `eq('tenant_id', ctx.tenantId)` côté server actions. Risque identique signalé fichier 03.
11. `BrandOnboardingStep.tsx:122` — `useState(props.initial)` : si Floriane reprend une session, l'`initial` est rempli avec la réponse précédente. Reprise fonctionnelle. ✅
12. Pas de circular import, pas de duplicate logic. ✅

### Verdict : **Recalé**

### Justification
La primitive `SingleTextArea` est correctement abstraite et réutilisable, mais le **typage faible** (`fieldKey: string` brut au lieu d'un type generic-contraint sur les clés de `BrandOnboardingResponses[stepIndex]`) crée une brèche entre les types stricts côté `types.ts` et le call site dynamique. Combiné à l'absence de validation Zod côté server (signalé fichier 03), c'est une dette technique latente. Pas catastrophique, mais Elena ne valide pas un wizard où le typing s'arrête au bord de la primitive.

### Recommandations
- **P0** : Hériter des fixes P0 fichier 03 (Zod validation côté server actions).
- **P1** : Typer `SingleTextArea` avec un generic contraint :
  ```ts
  function SingleTextArea<K extends keyof BrandOnboardingResponses>(
    props: { responseKey: K, fieldKey: keyof NonNullable<BrandOnboardingResponses[K]>, ... }
  )
  ```
  Lourd mais étanche.
- **P1** : Garde-fou `parseInt` ligne 123 : `const stepIdx = Number(props.responseKey); if (Number.isNaN(stepIdx)) throw new Error(...)`.
- **P2** : Considérer remplacer la primitive 8-props par un component `<AudienceStep>` dédié au step 2, plus lisible. Coût : duplication mineure si re-utilisé. Bénéfice : typing strict.

---

## Axe 3 — Sarah (Copy)

### Observations
1. `BrandOnboardingStep.tsx:46` — titre "Qui est ton audience cible principale ?" : **tutoiement** ✅, structure interrogative directe.
2. **MOT "audience"** dans le titre du step. La doctrine v60 liste "audience" en vocabulaire interdit (vocabulaire d'analytics gamifié type "tes 10K d'audience"). **Mais** : ici, "audience cible" est un terme métier brand/marketing classique (équivalent "cible", "persona"), pas un terme d'analytics. **Tension doctrinale réelle**. Décision Hélène/Sarah requise : strict (Recalé) ou contextuel (Validé). Auditer ici sur le strict → Recalé.
3. Alternatives possibles : "Qui est ta cible principale ?", "À qui tu parles ?", "Qui sont tes clients principaux ?", "Pour qui ta marque existe ?". La dernière est la plus poétique et doctrine Floriane.
4. `BrandOnboardingStep.tsx:47` — desc "Profil sociologique, attentes, comportements. Sois précis." : **tutoiement** ✅ ("Sois précis"). Sec, instructionnel, mais cohérent avec le ton "tu pilotes" doctrine. Acceptable.
5. `BrandOnboardingStep.tsx:48` — placeholder "Ex. Femmes 35-55, CSP+, déjà clientes joaillerie haute, attachées à la matière brute, lectrices Le Monde M Magazine." : **excellent placeholder**, dans la veine doctrine (Le Monde M Magazine = référence éditoriale Albane R., joaillerie haute = Angelina-style premium). Inspirant. ✅
6. **Pas de label sur la textarea** (ligne 134 — `TextAreaField` sans `label` prop). Floriane voit le titre H2 + desc + textarea directement. RAS copy.
7. `BrandOnboardingStep.tsx:466` — bouton "Suivant" sur footer (depuis `StepShell`). Tutoiement neutre. ✅
8. `BrandOnboardingStep.tsx:448` — "Retour" : sobre. ✅
9. `BrandOnboardingStep.tsx:459` — "Enregistrement…" : pendant le saving. Froid, déjà signalé fichier 03.
10. **Indicateur "Audience cible principale"** affiché dans le header sheet ligne 174 (depuis `BRAND_ONBOARDING_STEP_LABELS[1]`). Le mot "audience" est donc affiché DEUX fois (titre H2 + label header). Recalé renforcé.
11. Aucun "users", "viewers", "dashboard", "workflow", "feature", "engagement" (autre que légitime), "viral", "boost", "growth hack", "streak", "level up", "unlock". RAS.
12. Pas de gamification verbale. ✅
13. "onboarding" en UI : présent indirectement via aria-label header (cf. fichier 03), pas dans Step 2 lui-même.

### Verdict : **Recalé**

### Justification
Le mot **"audience"** apparaît 2× dans le step (titre H2 + label header), et figure dans la liste de vocabulaire interdit Sarah doctrine v60. La tension est réelle (terme métier brand vs jargon analytics) mais l'audit applique le strict comme demandé. Le reste de la copy est propre (tutoiement, placeholder Floriane-tier, desc directe). Si Hélène décide d'autoriser "audience" en contexte brand-management, le step passe en Validé Sarah.

### Recommandations
- **P0** : Décision Hélène/Sarah requise : "audience" est-il interdit absolu, ou autorisé en contexte brand (par opposition à contexte analytics) ? Si interdit : remplacer titre et `BRAND_ONBOARDING_STEP_LABELS[1]` par "Cible principale" / "À qui tu parles" / "Pour qui ta marque existe".
- **P1** : Si "audience" autorisé en contexte brand : documenter explicitement dans `skills/02-VOICE_SHEET.md` les contextes autorisés vs interdits. Sinon ambigu pour futurs développeurs.
- **P2** : Considérer une variante plus narrative : "Pour qui ta marque existe ?" (doctrine Floriane tranquillité, registre Albane R.).

---

## Axe 4 — Marcus (Workflow)

### Observations
1. Step 2 hérite du chrome `BrandOnboardingSheet` (loading state, error state, Escape, ExitConfirmDialog, indicateur 2/4, halos). Tous audités fichier 03.
2. `BrandOnboardingStep.tsx:132` — `canContinue={props.allowSkip || value.trim().length > 0}` : non-skippable sur Step 2 (allowSkip non passé), donc Floriane doit remplir au moins 1 caractère pour avancer. Garde-fou minimal.
3. **Pas de min-length** : Floriane peut taper "X" et avancer. Acceptable pour une textarea audience où la pression doit rester souple.
4. **Pas d'autofocus** sur la textarea au mount du step. Floriane doit cliquer dans le champ. Friction déjà signalée fichier 03.
5. `BrandOnboardingStep.tsx:135-144` — bouton "Passer cette étape" si `allowSkip` : pas affiché sur Step 2 car `allowSkip` non passé. Cohérent.
6. `BrandOnboardingStep.tsx:128` — `onNext` appelle `onSave(stepIdx, responseKey, { [fieldKey]: value })`. Pas de confirmation, pas de double-clic guard explicite — mais `disabled={!canContinue || saving}` côté footer empêche double-submit. ✅
7. **Touch target textarea** : ~130px hauteur. ✅
8. **Touch target bouton Suivant** : dépend `btn-primary`. À vérifier.
9. **Pas d'aide contextuelle** : si Floriane sèche sur l'audience cible, aucune aide n'est proposée (pas de "Pas sûre ? Le conseiller peut t'aider", pas de lien vers `/outils/conseiller`). Sur un step potentiellement difficile (audience est l'exercice premier de marketing), c'est une friction.
10. **Pas de prévisualisation** de ce que sera l'audience cible une fois enregistrée. Floriane tape dans le vide sans voir comment ça apparaîtra ailleurs dans l'app.
11. **Pas de validation intelligente** : Floriane peut taper "blablabla" et avancer. Acceptable pour V1, mais sur un produit premium 12K€ setup, un check côté server "désolé, peut-être trop court pour être utilisable par le conseiller, tu veux préciser ?" ajouterait de la valeur. V2.
12. **Pas de gestion mobile spécifique** sur la textarea (5 rows × 14px font + 24px gap → ~250px sur petit écran). Acceptable.

### Verdict : **Recalé**

### Justification
Step 2 est correct sur les bases workflow (loading, error, Escape, Retour disponible, indicateur progression), mais accumule les frictions déjà signalées (pas d'autofocus, pas de compteur caractères, pas d'aide contextuelle) + une absence spécifique au step : pas de pont vers le conseiller pour aider Floriane à formuler son audience. Sur un step potentiellement difficile pour un brand manager junior, c'est une friction évitable.

### Recommandations
- **P0** : Hériter des fixes P0 fichier 03 (autofocus, touch target).
- **P1** : Ajouter un lien discret "Pas sûre ? Le conseiller peut t'aider" sous le placeholder, qui ouvre `/outils/conseiller?scenario=audience` ou équivalent. Conforme doctrine "Conseiller minuscule".
- **P2** : Compteur caractères discret sous textarea ("250 / 600" recommandé visuel).
- **P2** : Considérer un check de qualité côté server post-save (longueur min 80 caractères ? présence de chiffres / catégories démographiques ?) avec un feedback non-bloquant "Tu veux préciser quelques éléments démographiques ?". V2.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. **Floriane (28 ans, brand manager)** : Step 2 demande un exercice classique de marketing brand. Floriane saura répondre — c'est son métier. Conforme.
2. **Citation anchor "tableau de bord simple et efficace, contrôle, pilote"** : Step 2 est un input de pilotage marque. ✅
3. **6 promesses CF — "Tu pilotes"** : Floriane décide de son audience, le conseiller s'aligne après. Conforme.
4. **6 promesses CF — "Pas d'IA qui décide"** : aucun pré-remplissage automatique sur Step 2 (à ce jour). Conforme.
5. **Tranquillité narrative** : la textarea calme + placeholder inspirant + desc directe. Pas d'urgence, pas de "Vite vite !". Conforme.
6. **Anti-gamification** : pas de score "complétude audience 80%", pas de barre dédiée audience. ✅
7. **Anti-jargon SaaS** : "audience" terme métier brand, pas analytics — mais tension doctrine (cf. Sarah).
8. **Cohérence Angelina / Comptoir / Tous en Tête** : le placeholder "Femmes 35-55 CSP+ lectrices Le Monde M" est exactement le type d'audience qu'aurait Angelina. Conforme.
9. **B2B custom 12K€** : Floriane qui hésite sur l'audience peut être épaulée par l'équipe Creative Fair (humain). Conforme posture haute main. Mais l'app elle-même devrait au moins offrir un pont vers le conseiller (cf. Marcus P1).
10. **Phase 1 / Phase 2** : N/A direct (le wizard pose les fondations qui alimenteront Phase 2).
11. **Trilogie Organique / Outreach / Libre** : l'audience cible posée ici alimente toute la chaîne narrative (notamment Outreach et seeding micro-influence). Cohérent.
12. **Drift skills/** : `skills/00-CONCEPT.md`, `skills/01-ARCHITECTURE.md`, `skills/10-SACRED.md` toujours désalignés sur l'ancien produit (cf. fichiers 01, 02, 03). Cross-cutting Sprint 38.
13. **Drift potentiel `skills/02-VOICE_SHEET.md`** : à vérifier si "audience" est listé comme interdit absolu ou autorisé contextuellement. Si pas documenté, drift latent.

### Verdict : **Recalé**

### Justification
Step 2 est doctrinalement cohérent sur le fond (pilotage, anti-gamification, Floriane, placeholder doctrine, tranquillité). Le **mot "audience"** force le Recalé Sarah strict (cf. fichier 03), donc Hélène ne peut pas valider tant que la décision contextuel-vs-interdit n'est pas tranchée. Mineure mais doctrinalement nécessaire.

### Recommandations
- **P0** : Décision Hélène requise sur "audience" en contexte brand (cf. Sarah P0).
- **P1** : Documenter formellement dans `skills/02-VOICE_SHEET.md`.
- **P1** : Mettre à jour skills/ pour aligner v60 (cross-cutting Sprint 38).
- **P2** : Lien vers conseiller pour épauler Floriane junior (cf. Marcus P1) renforce la doctrine "pas d'IA qui décide mais un conseiller disponible".

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
  1. Décision Hélène : "audience" interdit absolu ou autorisé en contexte brand. Si interdit, remplacer titre + label.
  2. Hériter des fixes fichier 03 : tokenisation hex hardcodés, autofocus, touch targets.
  3. Validation Zod côté server selon stepIndex.
- **P1** :
  1. `:focus` état visible sur textarea.
  2. Compteur caractères discret sous textarea.
  3. Typer `SingleTextArea` avec generic contraint sur `BrandOnboardingResponses[stepIndex]`.
  4. Garde-fou `parseInt` ligne 123.
  5. Lien discret "Pas sûre ? Le conseiller peut t'aider" sous placeholder.
  6. Documenter "audience" dans `skills/02-VOICE_SHEET.md`.
- **P2** :
  1. Auto-grow textarea sans poignée OS native.
  2. Component `<AudienceStep>` dédié au lieu de primitive 8-props.
  3. Check qualité server post-save (V2).
  4. Variante titre narrative ("Pour qui ta marque existe ?").
  5. Mettre à jour skills/ pour v60.

### Verdict global page
**Recalé** (0 axe Validé sur 5)

Step 2 hérite des problèmes du chrome (fichier 03) + ajoute son propre cas doctrinal ("audience" dans le titre). Aucun problème nouveau majeur sur l'architecture ou le workflow — la majorité des fixes sont partagés avec Step 1. Le P0 spécifique de ce step est la décision Hélène sur "audience". 1 jour de polish ciblé pour passer en Validé une fois Step 1 fixé.

---

## Note drift skills/ (Axe 5 cross-cutting)

Step 2 expose un drift potentiel spécifique sur `skills/02-VOICE_SHEET.md` : le mot "audience" est listé dans la liste de vocabulaire interdit doctrine sprint-38, mais le code de Step 2 l'utilise dans un contexte métier brand légitime. Soit :
- (a) Hélène tranche que "audience" est interdit absolu → code à modifier.
- (b) Hélène tranche que "audience" est autorisé contextuellement → `skills/02-VOICE_SHEET.md` à modifier pour documenter les contextes.

Quelle que soit la décision, la **documentation skills/** doit suivre. C'est un cas d'école du drift code ↔ doctrine ↔ skills/ qui mérite synthèse Sprint 38.

Plus largement : `skills/00-CONCEPT.md`, `skills/01-ARCHITECTURE.md`, `skills/10-SACRED.md` toujours désalignés sur l'ancien produit (cf. fichiers 01-03). P0 cross-cutting Sprint 38.
