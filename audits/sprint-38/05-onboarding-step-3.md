# Page : Onboarding Ma Marque — Step 3/4 (Piliers narratifs)

## Métadonnées
- Route : `/ma-marque?onboarding=true` (wizard step `current_step = 2`)
- Fichier source principal : `components/onboarding-marque/BrandOnboardingStep.tsx` (lignes 53-60 — case 2 du dispatcher → `Step5Piliers`) + composant `Step5Piliers` lignes 239-300
- Fichier chrome partagé : `components/onboarding-marque/BrandOnboardingSheet.tsx` (audité fichier 03)
- Composants principaux : `<Step5Piliers>`, `<StepShell>`, `<TextField>`, `<TextAreaField>`
- Server / Client : Client Component (`'use client'`)
- Screenshot : à produire côté Lead via `_capture.mjs` (auth + onboarding actif requis)
- Label step (cf. `lib/brand-onboarding/types.ts:49`) : "Piliers narratifs"
- Type response (cf. `types.ts:25`) : `'2'?: { piliers: ReadonlyArray<{ nom: string; description?: string }> }`

## Lecture rapide
Step 3 du wizard (index 2) — "Tes 3 piliers narratifs". Demande **3 piliers** avec chacun nom (TextField) + description optionnelle (TextAreaField rows=2). Initialisation par défaut à 3 piliers vides (`[{nom:''}, {nom:''}, {nom:''}]`). Validation soft : `canContinue` exige **au moins 1 pilier rempli** (filtré `length >= 1`). Placeholders références doctrine Albane R. : "Ex. Détail qui tue", "Ex. Querelles de créateurs", "Ex. Accident génial" — vocabulaire éditorial magazine pur. C'est le step le plus doctrinal du wizard, celui qui structure toute la narration. La copie est très bonne, l'UX répétitive 3× est tolérable, mais la primitive utilise des hex/rgba hardcodés et l'UX manque de hiérarchie pour distinguer les 3 piliers.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. Step 3 hérite du chrome `BrandOnboardingSheet` (halos signature v60, header Liquid Glass, indigo eyebrow, animation 280ms, `#1F4937` absent ✅) — audité fichier 03.
2. `BrandOnboardingStep.tsx:267-298` — `Step5Piliers` rend 3 cards piliers en colonne via `piliers.map((p, i) => ...)`.
3. `BrandOnboardingStep.tsx:270-278` — chaque card pilier : `padding: '14px 16px'`, `background: 'rgba(0, 0, 0, 0.02)'`, `border: '1px solid rgba(0, 0, 0, 0.05)'`, `borderRadius: 12`. **Tout hardcodé**, aucun token. Drift Hiroshi sévère. Le `rgba(0,0,0,0.02)` est un gris fantôme — devrait être `var(--color-surface-subtle)` ou `color-mix(in srgb, var(--color-label) 2%, transparent)`.
4. `BrandOnboardingStep.tsx:280-282` — eyebrow "Pilier 1 / 2 / 3" : `fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-tertiary-label)'`. Eyebrow style **conforme** Hiroshi pattern. ✅
5. `BrandOnboardingStep.tsx:283-288` — TextField "Nom du pilier" avec placeholder différencié par index. Bon pattern UX. Style hérité de `inputStyle` (hardcodé).
6. `BrandOnboardingStep.tsx:289-295` — TextAreaField "Description (optionnel)" `rows={2}`. Plus court que step 2 (rows=5), cohérent avec l'attente plus courte.
7. **Absence d'indicateur visuel** distinguant pilier rempli vs pilier vide. Les 3 cards sont visuellement identiques même quand Floriane n'a rempli que le premier. Pas de checkmark, pas de border accent sur pilier complété. Drift hiérarchie.
8. **Pas de couleur d'accent par pilier**. Doctrine v60 a 6 halos signature (crème, lilas, rose, bleu, indigo, orange). Marquer chaque pilier d'un mini-dot de couleur (cohérent avec les pastels existants) signerait visuellement la promesse "tes piliers signent ta marque". Aujourd'hui les 3 cards sont en monochrome gris.
9. **Pas d'animation à l'ajout** ou au focus d'une card. Acceptable doctrine sobriété.
10. Touch target TextField : `padding: 12px 14px` → ~44px ✅.
11. Touch target TextAreaField : ~52px ✅ (rows=2 + padding).
12. Espacement : `gap: 8` à l'intérieur de la card (lignes 273), `gap: 14` entre cards (StepShell children container). Mix grille (8 OK, 14 hors-grille).
13. Pas de gamification visuelle. ✅
14. Pas de halos rotation/pulse. ✅
15. Le titre H2 "Tes 3 piliers narratifs" + desc passent par `titleStyle` / `descStyle` — tokens propres. ✅
16. **Drag-and-drop reorder absent** : Floriane ne peut pas réordonner les 3 piliers. Acceptable V1 (cf. Marcus).
17. **Pas de bouton "+ Ajouter un 4e pilier"** : intentionnel selon doctrine (3 piliers signature, ni plus ni moins). ✅

### Verdict : **Recalé**

### Justification
Step 3 hérite des drifts Hiroshi du chrome (tokens hardcodés) + ajoute son propre drift : cards piliers en gris-fantôme `rgba(0,0,0,0.02)` non-tokenisé, pas de différenciation visuelle des piliers entre eux (chaque pilier devrait avoir sa couleur signature dans la palette pastel v60), pas d'indicateur visuel pilier rempli vs vide. Sur le step le plus emblématique du wizard (les piliers structurent toute la narration), Hiroshi attend mieux. Recalé.

### Recommandations
- **P0** : Hériter des fixes P0 fichier 03 (tokenisation hex/rgba).
- **P1** : Différencier visuellement les 3 piliers : mini-dot 8px coloré (palette pastels v60 : lilas, rose, bleu — pas indigo qui est déjà sur l'eyebrow "Ma Marque") à gauche de l'eyebrow "Pilier 1 / 2 / 3".
- **P1** : Border accent + opacity reduce sur pilier complété (visual feedback). Card vide = border standard, card avec nom rempli = border `var(--color-accent)` à 30% opacity.
- **P2** : Considérer un cas "pilier vide après save" : si Floriane ne remplit que 2 piliers, la 3e card reste vide. Soit on la cache silencieusement à l'écran suivant `/ma-marque`, soit on l'affiche en "placeholder" doux. Décision produit.
- **P2** : Tokeniser `rgba(0,0,0,0.02)` en `--color-surface-subtle`. Probablement réutilisable ailleurs.

---

## Axe 2 — Elena (Archi)

### Observations
1. `BrandOnboardingStep.tsx:239-300` — `Step5Piliers` (le nom "Step5" est un vestige Sprint 37.E où le wizard avait 14 étapes ; ramené à 4 étapes, "Step5" est devenu "Step 3 user-facing" mais le composant garde son ancien nom). **Drift naming** : un futur dev pourrait croire à un step 5. Renommer en `Step2Piliers` ou `PiliersStep`.
2. `BrandOnboardingStep.tsx:243-245` — initial state : `useState(props.initial.length > 0 ? props.initial : [{ nom: '' }, { nom: '' }, { nom: '' }])`. Pattern OK : si reprise, on hérite ; sinon 3 piliers vides. Mais **mutation potentielle** si `props.initial` est une référence partagée (la doctrine impose `ReadonlyArray` — vérifié ligne 240, OK).
3. `BrandOnboardingStep.tsx:247-249` — `updatePilier(i, patch)` : `piliers.map((p, idx) => idx === i ? { ...p, ...patch } : p)`. **Immutabilité respectée**. ✅
4. `BrandOnboardingStep.tsx:251` — `canContinue = piliers.filter((p) => p.nom.trim().length > 0).length >= 1`. **Minimum 1 pilier** — pas 3, donc Floriane peut avancer avec un seul. Cohérent doctrine "tu pilotes" mais incohérent avec le titre "Tes 3 piliers narratifs". Tension doctrine.
5. `BrandOnboardingStep.tsx:259` — `const cleaned = piliers.filter((p) => p.nom.trim().length > 0)` : envoie au server uniquement les piliers non-vides. Propre.
6. `BrandOnboardingStep.tsx:261` — `props.onSave(idx, props.responseKey, { piliers: cleaned })`. Shape conforme au type `BrandOnboardingResponses['2']`.
7. `app/_actions/brand-onboarding.ts:208-210` — côté `completeBrandOnboarding` :
   ```ts
   if (responses['2']?.piliers && responses['2'].piliers.length > 0) {
     updates.piliers_narratifs = responses['2'].piliers
   }
   ```
   Transfert vers `brands.piliers_narratifs` (colonne JSON probable). **Pas de validation forme du contenu** — si client a envoyé `[{nom: '<script>'}]`, c'est stocké tel quel. Risque XSS si rendu sans escape ailleurs.
8. **Schema DB `brands.piliers_narratifs`** : probablement JSON ou JSONB. À vérifier que la colonne existe (cf. fichier 06 / migration files). Si la colonne n'existe pas, l'UPDATE échoue silencieusement (côté Supabase ça renvoie une erreur — mais ici l'erreur n'est pas remontée à l'UI).
9. `BrandOnboardingStep.tsx:243` — initial = `ReadonlyArray<{ nom: string; description?: string }>` mais setPiliers ligne 246 accepte `ReadonlyArray<{ nom: string; description?: string }>`. Cohérent.
10. **Pas de validation Zod côté server** sur la shape des piliers. Mêmes risques signalés fichiers 03-04.
11. **Pas de cacheable Anthropic** sur ce step. N/A.
12. Pas de circular import. ✅
13. Le composant n'a pas de cleanup useEffect (aucun side effect). Conforme.

### Verdict : **Recalé**

### Justification
La logique est correcte côté UI (immutabilité, filtrage des vides), mais le **naming `Step5Piliers`** est obsolète (sprint 37.E a ramené à 4 étapes), **la validation min/max piliers est laxiste** (1 minimum alors que le titre dit 3), et **la validation server est absente** (risque XSS si pilier nom contient HTML/JS). Plus l'absence d'erreur remontée si la colonne `piliers_narratifs` n'existe pas en DB. Recalé sur les dettes accumulées.

### Recommandations
- **P0** : Renommer `Step5Piliers` → `Step2Piliers` ou `PiliersStep`. Cohérence post-Sprint 37.E.
- **P0** : Validation Zod côté server actions (déjà signalé fichiers 03-04). Schéma : `{ piliers: z.array(z.object({ nom: z.string().min(1).max(80), description: z.string().max(280).optional() })).min(1).max(3) }`.
- **P1** : Décision doctrine : minimum 3 piliers requis (cohérent avec titre) ou 1 pilier suffit (cohérent avec actuel) ? Si 3 requis, `canContinue = piliers.filter(...).length >= 3`. Si 1 suffit, modifier titre en "Tes piliers narratifs (jusqu'à 3)".
- **P1** : Remonter l'erreur server à l'UI si UPDATE `brands` échoue (la table n'a pas la colonne, ou contrainte CHECK rejette).
- **P2** : Escape HTML systématique côté affichage des piliers ailleurs dans l'app (cf. `/ma-marque` page native).

---

## Axe 3 — Sarah (Copy)

### Observations
1. `BrandOnboardingStep.tsx:255` — titre "Tes 3 piliers narratifs" : **tutoiement** ✅ ("Tes"). Affirmatif, doctrinal.
2. `BrandOnboardingStep.tsx:256` — desc "Les territoires de contenu signature de ta marque. Le conseiller s'en sert pour structurer chaque programme." : **tutoiement** ✅, **doctrine pure** :
   - "territoires de contenu signature" : vocabulaire Albane R. magazine.
   - "Le conseiller s'en sert" : conseiller minuscule, conforme.
   - "structurer chaque programme" : Phase 2 doctrine.
   Excellent. ✅
3. `BrandOnboardingStep.tsx:280-282` — eyebrow "Pilier 1 / 2 / 3" : sobre, numéroté. RAS.
4. `BrandOnboardingStep.tsx:284` — label "Nom du pilier" : sobre. RAS.
5. `BrandOnboardingStep.tsx:287` — placeholders :
   - "Ex. Détail qui tue" (Pilier 1) — vocabulaire éditorial magazine, doctrine Hélène/Albane. ✅
   - "Ex. Querelles de créateurs" (Pilier 2) — pareil. ✅
   - "Ex. Accident génial" (Pilier 3) — pareil. ✅
   **Trois placeholders Floriane-tier**. C'est la copie la plus doctrinale de tout le wizard.
6. `BrandOnboardingStep.tsx:291` — label "Description (optionnel)" : `(optionnel)` parenthèsé. Sobre, clair. ✅
7. `BrandOnboardingStep.tsx:293` — placeholder description "En 1-2 phrases : pourquoi ce pilier, comment il se manifeste." : tutoiement neutre ("ce pilier"), instructionnel. ✅
8. Aucun vocabulaire interdit : pas de "audience" ici (contrairement à Step 2 — bonne nouvelle !), pas de "users", "dashboard", "workflow", "engagement", "viral", "boost", "growth hack", "streak". RAS.
9. "Conseiller" minuscule cohérent doctrine. ✅
10. Pas de gamification verbale. ✅
11. **Pas de "onboarding" en UI** dans ce step (seulement dans le chrome aria-label cf. fichier 03).
12. **Tension** : titre "Tes 3 piliers narratifs" implique 3, mais `canContinue` accepte 1 (cf. Elena). Floriane peut conclure "ok 3 obligatoires" et essayer d'en sortir avec 1, ou inversement croire 1 suffit alors qu'on attend 3. Drift copie/comportement.

### Verdict : **Validé**

### Justification
La copie de Step 3 est **la plus doctrinale du wizard** : tutoiement, vocabulaire éditorial Albane R., placeholders Floriane-tier, conseiller minuscule, "territoires de contenu signature" qui colle au registre magazine. La seule réserve est la tension titre 3 vs comportement 1 — c'est un problème de produit/Elena, pas de copie. Sarah valide.

### Recommandations
- **P0** : Aucun.
- **P1** : Aligner titre et comportement (cf. Elena P1). Si on garde 1-minimum, ajuster titre en "Tes piliers narratifs (jusqu'à 3)" ou similaire.
- **P2** : Considérer un mot d'introduction sous la desc qui rassure : "C'est ok de poser un pilier d'abord, tu pourras compléter plus tard depuis Ma Marque." Sobre, doctrinal.

---

## Axe 4 — Marcus (Workflow)

### Observations
1. Step 3 hérite du chrome (loading, error, Escape, ExitConfirmDialog, indicateur 3/4, halos) — audité fichier 03.
2. `BrandOnboardingStep.tsx:243-245` — état initial 3 piliers vides : Floriane voit immédiatement 3 cards à remplir. **Cohérent attente "Tes 3 piliers"**. ✅
3. **Pas d'autofocus** sur le TextField du pilier 1. Friction signalée fichier 03 et confirmée ici.
4. **Pas de tab order custom** : Tab navigue dans l'ordre du DOM (nom pilier 1, desc pilier 1, nom pilier 2, desc pilier 2, etc). Acceptable.
5. **Pas de drag-and-drop reorder** : si Floriane se rend compte que son "Pilier 3" est plus important que son "Pilier 1", elle doit recopier manuellement. Friction acceptable V1, à signaler V2.
6. **Pas de suppression de pilier** : Floriane ne peut pas retirer une card. Elle peut laisser vide (filtrée au save) mais ne peut pas la cacher. Acceptable.
7. **Pas d'ajout d'un 4e pilier** : conforme doctrine (3 piliers signature). RAS.
8. **Pas de validation intelligente** : Floriane peut taper "X" en nom pilier 1 et avancer. Acceptable doctrine "tu pilotes" mais discutable.
9. **Validation soft** : `canContinue = 1 pilier rempli`. Floriane peut avancer avec seulement le premier rempli. Cohérent posture "haute main" Creative Fair (l'équipe complète après) mais incohérent avec le titre. Drift workflow.
10. **Pas de prévisualisation** de ce qui sera enregistré (les piliers nettoyés). Acceptable doctrine sobriété.
11. **Pas de bouton "Aide" / "Pas sûre des piliers ? Le conseiller peut t'aider"**. Sur un step potentiellement difficile (les piliers narratifs sont un concept Albane R. qui peut paraître abstrait à une Floriane junior), un pont vers le conseiller serait précieux. Friction.
12. Touch targets corrects (TextField/TextAreaField ~44px). ✅
13. Loading state sur "Suivant" via `disabled={!canContinue || saving}` + texte "Enregistrement…". ✅
14. **Pas de feedback explicite** quand Floriane remplit le pilier 1 (rien de visible ne change : pas d'indicateur "1/3 piliers rempli"). Drift micro-feedback.

### Verdict : **Recalé**

### Justification
Step 3 est correct sur les fondamentaux (loading, error, Escape, 3 cards visibles d'entrée), mais accumule les frictions déjà signalées (pas d'autofocus) + des frictions spécifiques : pas de feedback de progression intra-step (1/3, 2/3, 3/3 piliers rempli), pas de pont vers conseiller, validation soft désalignée avec le titre. Pour le step le plus emblématique du wizard, Marcus attend plus. Recalé.

### Recommandations
- **P0** : Hériter des fixes P0 fichier 03 (autofocus, touch targets — déjà OK ici).
- **P1** : Mini-indicateur "1/3 piliers" / "2/3" / "3/3" sous la desc ou en haut. Donne un feedback de progression intra-step sans gamifier.
- **P1** : Lien "Pas sûre des piliers ? Le conseiller peut t'aider" → `/outils/conseiller?scenario=piliers`. Conforme doctrine.
- **P1** : Aligner validation et titre (cf. Elena P1, Sarah P2).
- **P2** : Permettre de marquer un pilier comme "à compléter plus tard" sans bloquer (déjà le cas implicitement, mais sans visualiser).
- **P2** : Drag-and-drop reorder piliers — V2.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. **Floriane (28 ans, brand manager)** : Step 3 demande l'exercice doctrinal le plus pointu du wizard. Floriane junior peut hésiter — le placeholder ("Détail qui tue", "Querelles de créateurs", "Accident génial") l'inspire. Conforme.
2. **Citation anchor "tableau de bord simple et efficace, contrôle, pilote"** : Step 3 est pilotage pur. ✅
3. **6 promesses CF — "Tu pilotes"** : Floriane structure ses piliers, le conseiller s'en sert. Conforme.
4. **6 promesses CF — "Pas d'IA qui décide"** : aucun pré-remplissage automatique. Si Sprint 38+ ajoute du pré-remplissage par le conseiller, garder validation explicite. Conforme.
5. **Tranquillité narrative** : 3 cards calmes, placeholders chaleureux-éditoriaux, desc claire. Conforme.
6. **Anti-gamification** : pas de jauge "complétude piliers 67%". Le risque V2 serait un indicateur "Score piliers : 2/5" — à éviter absolument. Aujourd'hui : ✅.
7. **Anti-jargon SaaS** : "piliers narratifs", "territoires de contenu signature" — vocabulaire magazine Albane R., pas SaaS. ✅
8. **Cohérence Angelina / Comptoir / Tous en Tête** : les 3 marques ont des piliers identifiables (Angelina : pâtisseries de salon de thé / hommage Angelina Belge / décor Belle Époque ; Comptoir : lieu hybride / héritage colonial revisité / mixité culturelle ; Tous en Tête : témoignages bénévoles / actions terrain / impact mesurable). Le wizard les laisse formuler librement. Conforme.
9. **Doctrine Albane R.** : "Détail qui tue" / "Querelles de créateurs" / "Accident génial" sont **directement des concepts éditoriaux magazine**. C'est de l'incarnation doctrine pure dans la copie. **Le placeholder seul fait de Step 3 le meilleur step doctrinalement** de tout le wizard.
10. **B2B custom 12K€** : Floriane qui sèche peut être épaulée hors-app. Mais un pont in-app vers conseiller serait précieux (Marcus P1).
11. **Phase 1 / Phase 2** : les piliers alimenteront directement la **trilogie Organique/Outreach/Libre** Phase 2. Conforme.
12. **Trilogie Organique/Outreach/Libre** : N/A direct, mais les piliers structurent toute la production future.
13. **Anti-agressivité commerciale** : aucune. ✅
14. **Drift skills/** : `skills/00-CONCEPT.md`, `skills/01-ARCHITECTURE.md`, `skills/10-SACRED.md` désalignés. Cross-cutting Sprint 38.
15. **Notes Sprint 36.A** (commentaire ligne 1 OnboardingFlow.tsx, et `BrandOnboardingStep.tsx:31` "Wizard ramené à 4 étapes critiques") : cohérent avec l'audit. Sprint 37.E a fait du tri doctrinal, Step 3 (Piliers) est resté car critique.

### Verdict : **Validé**

### Justification
Step 3 est **le step doctrinalement le plus aligné de tout le wizard** : titre, desc, placeholders, vocabulaire, conseiller minuscule, anti-gamification, tranquillité narrative — tout signe la doctrine Hélène et Albane R. Les seules frictions signalées (tension validation/titre, manque de pont conseiller in-app) relèvent de Marcus/Elena, pas de doctrine pure. Hélène valide.

### Recommandations
- **P0** : Aucun.
- **P1** : Vérifier que le pré-remplissage Sprint 38+ par le conseiller (si mis en place) garde une validation explicite Floriane sur chaque pilier. Sinon promesse "Tu pilotes" cassée.
- **P1** : Pont conseiller in-app (cf. Marcus P1).
- **P2** : Documenter dans `skills/04-DESIGN_SYSTEM.md` ou équivalent que les piliers narratifs sont le concept doctrinal central + référencer les placeholders comme exemples canoniques.

---

## Synthèse de la page

### Verdicts cumulés
| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé |
| Elena Archi | ❌ Recalé |
| Sarah Copy | ✅ Validé |
| Marcus Workflow | ❌ Recalé |
| Hélène Doctrine | ✅ Validé |

### Top fixes priorisés
- **P0** :
  1. Hériter des fixes fichier 03 (tokenisation hex/rgba hardcodés).
  2. Renommer `Step5Piliers` → `Step2Piliers` ou `PiliersStep` (cohérence post-Sprint 37.E).
  3. Validation Zod côté server actions (cf. fichiers 03-04).
- **P1** :
  1. Décision doctrine : 3 piliers requis ou 1 suffit. Aligner titre + comportement.
  2. Différencier visuellement les 3 piliers (dot couleur palette pastels v60).
  3. Border accent sur pilier rempli.
  4. Mini-indicateur "1/3 piliers" feedback intra-step.
  5. Lien conseiller "Pas sûre des piliers ?".
  6. Remonter l'erreur server à l'UI si UPDATE échoue.
- **P2** :
  1. Tokeniser `rgba(0,0,0,0.02)` en `--color-surface-subtle`.
  2. Cas "pilier vide" décision produit.
  3. Drag-and-drop reorder — V2.
  4. Phrase rassurante sous desc "C'est ok de poser un pilier d'abord".
  5. Documenter placeholders comme exemples canoniques dans skills/.

### Verdict global page
**Recalé partiel** (2 axes Validés sur 5)

Step 3 est **doctrinalement excellent** (Sarah + Hélène ✅) mais souffre d'une dette technique (Hiroshi naming + tokens, Elena validation server, Marcus frictions). C'est paradoxal : le step le plus doctrinal du wizard est aussi celui où le code est resté en l'état le plus longtemps (`Step5Piliers` est un nom Sprint 37 vestige). Refactoring ciblé d'1 jour pour passer en Validé global.

---

## Note drift skills/ (Axe 5 cross-cutting)

Step 3 expose une opportunité : les **placeholders piliers** ("Détail qui tue", "Querelles de créateurs", "Accident génial") sont des **références canoniques doctrine Hélène/Albane R.** qui mériteraient d'être documentées dans `skills/04-DESIGN_SYSTEM.md` ou `skills/02-VOICE_SHEET.md` comme exemples de référence. Aujourd'hui, ces placeholders sont enterrés dans le code et ne sont pas codifiés ailleurs.

Plus largement : `skills/00-CONCEPT.md`, `skills/01-ARCHITECTURE.md`, `skills/10-SACRED.md` toujours désalignés sur l'ancien produit (forest green, nav 4 destinations, routes sans tiret). Cross-cutting Sprint 38, P0 doctrinal.
