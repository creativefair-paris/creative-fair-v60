# Sprint 37.D — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité de Sprint 37, 37.A, 37.B et 37.C.

9 commits cumulés Sprint 37.D, build vert tout du long.

---

## Synthèse

| # | Chantier | Statut |
|---|---|---|
| 1 | F32 + F33 + F36 — réparation wizard F16 (dialogue + boutons-choix + déblocage) | ✅ Livré |
| 2 | F34 — refonte plan généré en formats canoniques + migration posts.format | ✅ Livré |
| 3 | F29 — adoption 6 formats canoniques (wizard étape 7 + propagation) | ✅ Livré |
| 4 | F35a — Ma Marque page native + onboarding optionnel | ✅ Livré |
| 5 | F35b — /programme/create page native + wizard optionnel | ✅ Livré |
| 6 | F28 — refonte mockups /outils en exemples concrets | ✅ Livré |
| 7 | F30 — ajout outil Ads dans À venir | ✅ Livré (groupé avec F31) |
| 8 | F31 — polish popover nav hauteurs uniformes | ✅ Livré (groupé avec F30) |

Commits :
- `47db747` [F32+F33+F36] dialogue sortie + boutons-choix + déblocage redirect
- `68e9991` [F34.db] migration 022 posts.format + structure_type + objectif_editorial
- `82be663` [F34.subprompt+pipeline] sub-prompt JSON + validation + generateFromWizardSession
- `cfcf751` [F34.ui] PlanPreview + intégration /programme?newPlan=ID
- `30f103d` [F29] Step7Formats avec 6 formats canoniques + multi-select
- `96621fb` [F30+F31] Ads dans À venir + padding uniforme popover
- `4057af6` [F35a] Ma Marque page native + bouton onboarding guidé optionnel
- `815865d` [F35b] /programme/create page native + dual chemin
- `75a2452` [F28] refonte mockups /outils en 6 ToolMockup spécifiques

---

## Décisions doctrinales structurantes appliquées

### D1 — Les 6 formats canoniques (vocabulaire EXACT)

Vocabulaire OBLIGATOIRE partout : **Anecdote / Produit / Événement / Coulisses / Manifeste / Question**.

Migrations DB :
- `posts.format` text check enum (anecdote, produit, evenement, coulisses, manifeste, question)
- `posts.structure_type` text check enum (carrousel, photo, reel)
- `posts.objectif_editorial` text

Types TS :
- `CanonicalFormat` union de 6 valeurs (les exactes)
- `DominantFormat` legacy retenu pour compat sessions IN_PROGRESS de l'ancien wizard

Points d'usage :
- Wizard étape 7 (multi-select 1-3 max) via `Step7Formats`
- Plan généré (JSON strict du sub-prompt)
- `PlanPreview` avec FormatBadge coloré (6 couleurs canoniques)
- `ProgrammeCreateForm` (chemin manuel)
- `ToolMockup` Post Creator (preview des cards format)

### D2 — Dual chemin manuel/assisté (anti-paternalisme Apple)

**Le chat bot conseiller devient une option, pas une obligation.**

- `/ma-marque` : page native éditable (existant MaMarqueDashboard) + bouton optionnel `BrandOnboardingHeaderCta` en header pour lancer le wizard guidé F18.
- `/programme/create` : nouvelle page native avec formulaire 7 fieldsets + bouton optionnel "Préfère discuter avec le conseiller →" qui ouvre le wizard F16 via `/programme?action=create-plan`.
- Le CTA "Créer mon plan" sur `/programme` (ConseillerAccess) redirige désormais vers `/programme/create` (chemin manuel par défaut) au lieu d'ouvrir directement le wizard.

Le jalon guard (F26 Sprint 37.C) reste prioritaire avant tout : si la marque n'est pas posée, le pilote est redirigé vers Ma Marque avant Tout.

### D3 — Plan généré = formats actionnables, pas titres de semaines

Le sub-prompt `SYSTEM_PROMPT_WIZARD_PLAN` instruit Anthropic à retourner UNIQUEMENT du JSON valide avec :
- `arc_narratif` : 1 phrase fil rouge
- `plan[]` : posts avec `date`, `week_number`, `format`, `structure_type`, `pilier`, `objectif` (max 80 char), `description` (max 250 char)

Pas de markdown, pas de blocs `:::`, pas de texte avant ni après. Validation manuelle stricte côté serveur (validatePlan) — Zod non installé, on garde la cohérence avec le pattern existant (`generation.ts` Sprint 36.A).

Règles métier dans le prompt :
- 60-70% anecdote + coulisses (servent les piliers premium)
- 30-40% produit/evenement/manifeste/question
- Jamais 2 mêmes formats consécutifs
- Description = idée éditoriale CONCRÈTE (pas "Post engageant" / "Carrousel inspirant")

### D4 — Wizard F16 bugs critiques traités

**F32 — Dialogue de confirmation de sortie** :
- Backdrop renforcé de 0.18 à 0.4 (visibilité claire au-dessus du fond clair du wizard)
- Box-shadow Apple alert : `0 16px 48px rgba(0, 0, 0, 0.2)`
- Background blanc solide, border-radius 14px (au lieu de glass-regular)
- Le câblage croix → setShowExitDialog(true) → dialog était déjà en place ; le bug perçu venait probablement de la faible visibilité du backdrop.

**F33 — Boutons-choix systématiques** :
- Step1Period : 5 quick options + custom dates
- Step2BusinessAnchors : SuggestionPicker + bouton "Aucun événement à signaler"
- Step3SensitiveTopics : 4 choix génériques + "Préciser →"
- Step4Pillars, Step5Risk, Step6Objectifs, Step7Formats : déjà conformes

**F36 — Déblocage fin wizard** :
- Le bug : handleGenerate redirigait vers `/programme?action=create-plan` ce qui réouvrait le wizard en boucle infinie.
- Fix : génération réelle du plan via `generatePlanFromWizardSession` AVANT `completeProgrammeCreationSession`, puis redirect vers `/programme?newPlan=ID` (clean URL, pas de re-trigger wizard).
- UI loading prolongée visible (spinner Apple + "Je construis ton plan. Ça peut prendre 30 secondes.") pendant la génération.

### D5 — Mockups concrets, pas placeholder générique

`ToolMockup` rend un mini-mockup CSS spécifique par outil :
- Conseiller : bulle + 3 boutons-choix bleus labellisés
- Bibliothèque : split brief miniature 40/60
- Post Creator : 3 cards format avec FormatBadge
- Moodboard : grille 3×3 swatches colorés (gradients pastel)
- Variations : 1 source + 4 dérivés
- Reviews : exemple fact-check avec badge vert "Sourçable"

Dimensions ~320px × 200px, plus compact que l'ancien `MockupPlaceholder` qui surdimensionnait.

---

## Schéma DB

### Migration 022 — `posts.format + structure_type + objectif_editorial`
```
posts.format check ∈ ('anecdote', 'produit', 'evenement', 'coulisses', 'manifeste', 'question')
posts.structure_type check ∈ ('carrousel', 'photo', 'reel')
posts.objectif_editorial text
idx_posts_format
```

### Migration 023 — `programmes.date_debut + date_fin`
Colonnes référencées en code depuis Sprint 37.C mais absentes de la table jusqu'ici (bug latent : les requêtes `.select('date_fin')` retournaient toujours NULL, ce qui faisait que le jalon "programme" n'était jamais détecté). Index partiel sur `(status, date_fin) where status = 'active'`.

---

## Pipeline de génération du plan (F34)

```
WizardImmersiveSheet.handleGenerate()
  │
  ├─→ generatePlanFromWizardSession(sessionId)              [server action]
  │     │
  │     ├─→ Charge session + responses
  │     ├─→ Charge brand + piliers
  │     ├─→ Charge profile.publication_frequency
  │     └─→ generateFromWizardSession({admin, ...})
  │           │
  │           ├─→ buildWizardPlanUserPrompt() → string
  │           ├─→ callAnthropic() → text (cascade modèles)
  │           ├─→ extractJsonFromText() → JSON string
  │           ├─→ JSON.parse + validatePlan() → strict
  │           ├─→ INSERT programmes (status='active', date_debut, date_fin, arc_narratif)
  │           └─→ INSERT posts[] (format, structure_type, objectif_editorial)
  │
  ├─→ completeProgrammeCreationSession(sessionId)
  │
  └─→ router.push(`/programme?newPlan=${id}`)

ProgrammeCreateForm.handleSubmit()                          [chemin manuel F35b]
  │
  └─→ generatePlanFromForm({input})
        │
        ├─→ Crée session implicite avec responses
        ├─→ generateFromWizardSession(...)                  [même pipeline]
        └─→ Marque session COMPLETED
```

---

## Vérifications

- `npx tsc --noEmit` propre à chaque commit
- `npm run build` final : vert. Nouvelles routes listées : `/programme/create`. Toutes routes existantes intactes.
- Aucun fichier `.env` modifié
- Aucune dépendance npm ajoutée (validation manuelle au lieu de Zod, cohérent avec generation.ts Sprint 36.A)

---

## Reste à faire (Sprint 38+)

1. **F33 plus profond** : Step4Pillars a déjà une UI mais pourrait recevoir un slider de poids plus ergonomique. Step5Risk ok.
2. **F18 Step transfer complet** : transfert des 14 réponses onboarding marque vers les colonnes brands manquantes (audience_principale, vocabulaire, references_culturelles, style_visuel, sources_autorisees/interdites). Nécessite migration colonnes dédiées ou enrichissement brand_book jsonb.
3. **F34 enrichissements** : multi-objectifs sur le formulaire F35b (V1 = 1 seul champ libre), suggestions externes (TF Veille streaming Sprint 38).
4. **Tests E2E wizard** : Playwright tests pour valider le flow complet (déjà des tests dans `tests/`, à étendre).
5. **Tests de validation du JSON Anthropic** : ajouter des tests unitaires sur `validatePlan` avec divers cas malformés.
6. **Profile.publication_frequency type** : le type DB est `'discret' | 'equilibre' | 'dense'` mais le composant `PeriodSelectionSheet` exporte `'discreet' | 'balanced' | 'dense'`. Désalignement à régler Sprint 38.

---

## Notes d'exécution

- Travail mené sur le projet réel `/Users/ulysselemoine/Desktop/creative-fair-v60`, branche `sprint-37`.
- Estimation initiale Sprint 37.D : 20-25 commits, 10-12h en autonome. Réalisé : 9 commits structurels (regroupement F22+F23 et F30+F31), build vert à chaque commit.
- Pas de tag git (réservé Lead post-validation).
