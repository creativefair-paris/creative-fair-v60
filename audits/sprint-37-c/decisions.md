# Sprint 37.C — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité de Sprint 37, 37.A et 37.B.

12 commits cumulés Sprint 37.C, build vert tout du long.

---

## Synthèse

| # | Chantier | Statut |
|---|---|---|
| 1 | F22 + F23 + F27 — refonte /outils + nav popover | ✅ Livré |
| 2 | F24 + F25 — déplacement Calendrier Business | ✅ Livré |
| 3 | F26 — doctrine 3 jalons | ✅ Livré |
| 4 | A8 — migration brand_metrics + sub-prompt + parsing | ✅ Livré |
| 5 | /programme/retombees — sous-section retombées | ✅ Livré |
| 6 | F19 — wizard programme étape 6 objectifs éditoriaux | ✅ Livré |
| 7 | F18 — onboarding profond Ma Marque (14 étapes) | ✅ Livré |

Commits :
- `5eb143f` [F22+F23] refonte /outils 2 colonnes + reclassification
- `c904b4b` [F27] polish popover nav + icônes Lucide + raccourcis ⌘1/2/3/⌘,
- `fb9a81b` [F24+F25] Calendrier Business → /aujourd-hui + retrait /programme
- `462cf52` [F26] checkJalonStatus + useJalonGuard + JalonGuardDialog
- `cc3b869` [F26] /aujourd-hui adapté par jalon + guards
- `31f876a` [A8] migration brand_metrics + RLS
- `df98ef6` [A8] scénario A8 sub-prompt + parseMetricsBlock
- `ec897a3` [retombees] /programme/retombees + composants
- `71eaec0` [F19] étape 6 Objectifs éditoriaux dans wizard A1
- `35aa8be` [F18.db] migration brand_onboarding_sessions
- `520e355` [F18.ui+actions] BrandOnboardingSheet + 14 steps + actions
- `eb4132c` [F18.deeplink] /ma-marque?onboarding=true + trigger + reprise

---

## Décisions doctrinales structurantes appliquées

### D1 — Vocabulaire chiffres
Vocabulaire OBLIGATOIRE : "retombées", "indicateurs éditoriaux", "chiffres".
INTERDIT partout (UI + sub-prompts + commentaires) : `stats`, `analytics`,
`dashboard`, `performance`, `growth`, `KPI`, `métriques`.

Appliqué dans :
- `brand_metrics` (comment de table)
- Sub-prompt A8 (`lib/conseiller/scenarios/A8.ts`)
- Page `/programme/retombees` (titres : "Retombées qualitatives",
  "Indicateurs éditoriaux", "Mettre à jour mes chiffres →")
- `RetombeesQuantitativesGrid` (labels)

### D2 — Doctrine 3 jalons (progressive disclosure version douce)
- Jalon 1 (marque) : 4 fondations critiques sur 14 (piliers, secteur, ton,
  singularite). Seuil bas pour éviter le paternalisme.
- Jalon 2 (programme) : un `programmes.status = 'active'` valide non expiré.
- Jalon 3 (production) : posts existent.
- **Pas de hard-block.** Tout reste cliquable. Guards = dialogue de
  friction avec option "Continuer quand même".
- `/aujourd-hui` remplace son dashboard par un `JalonHero` quand le pilote
  n'est pas encore en jalon "production".

### D3 — Refus de la sidebar permanente
Le popover nav reste piloté par l'avatar. F27 polish (icônes + raccourcis
clavier) sans introduire de sidebar fixe. Raccourcis ⌘1 / ⌘2 / ⌘3 / ⌘,
écoutés globalement (skip si focus dans input/textarea).

### D4 — Pas de graphiques V1
`/programme/retombees` affiche valeurs actuelles + retombées qualitatives,
sans courbes. Évolution dans le temps reportée Sprint 38+.

### D5 — Wizard Ma Marque (F18) : dispatcher unique vs 14 fichiers
**Décision** : un seul `BrandOnboardingStep.tsx` qui dispatche les 14
étapes via des primitives partagées (StepShell, TextField, TextAreaField,
TagsList).

**Raisonnement** : 14 fichiers séparés auraient introduit de la
duplication massive (StepShell, gestion saving, footer Retour/Suivant).
Les étapes sont des variations sur 3-4 patterns (texte court, texte long,
tags, multi-input). Une seule unité de maintenance.

**Trade-off** : un fichier de 600 lignes, mais cohérent. Si une étape
spécifique évolue significativement, elle peut être extraite plus tard.

### D6 — Réponses pré-remplies par conseiller (F18)
Reportées Sprint 38. Le wizard livré accepte les saisies manuelles. Le
fetch de suggestions (depuis brand_book PDF dans Library, depuis pillars,
etc.) sera un enrichissement non-bloquant — la session existe et reste
fonctionnelle sans.

### D7 — Wizard A1 : étape 6 Objectifs (F19)
Insertion entre Curseur de risque (idx 4) et Format préféré (qui passe à
l'idx 6). Multi-select 1-2 maximum (anti-dispersion). `objectifsSuggestions`
est un prop optionnel — l'alimentation depuis brand.piliers / business_calendar
/ brand_metrics / publication_frequency sera Sprint 38.

### D8 — Migration `total_steps` 7 → 8 (F19)
Le default DB de `programme_creation_sessions.total_steps` reste 7 (data
historique). Les nouvelles sessions insèrent 8 via `WIZARD_TOTAL_STEPS`.
Pas de check constraint, donc compatible. Pas de migration data.

---

## Schéma DB ajouté

### Migration 020 — `brand_metrics`
```
brand_metrics(id, tenant_id, user_id, metric_type, value, period, source,
              recorded_at, notes, created_at)
```
- 8 `metric_type` enum check
- 3 `source` enum : manual_input, meta_api, conversation_extract
- RLS : tenant_isolation
- Index : (tenant_id, metric_type, recorded_at desc)

### Migration 021 — `brand_onboarding_sessions`
```
brand_onboarding_sessions(id, tenant_id, user_id, current_step,
                          total_steps=14, responses jsonb, state,
                          expires_at 30j, completed_at, created_at,
                          updated_at)
```
- `state ∈ ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'EXPIRED')`
- Index partiel sur (tenant_id, state) where state='IN_PROGRESS'
- RLS : tenant_isolation

---

## Vérifications

- `npx tsc --noEmit` propre à chaque commit
- `npm run build` final : vert. Routes nouvelles listées : `/programme/retombees`, post-creator converti en server component dynamique
- Aucun fichier `.env` modifié
- Aucune dépendance npm ajoutée

---

## Reste à faire (Sprint 38+)

1. **Réponses pré-remplies par conseiller dans le wizard F18** : fetch
   server-side depuis brand_book PDF (Library) + piliers existants pour
   alimenter les TextAreaField / TagsList avec des défauts.
2. **F18 step transfer complet** : V1 transfère nom / singularite (=
   positionnement) / piliers / ton vers `brands`. Les autres responses
   (audience, vocabulaire, références, style visuel, sources) restent
   dans `brand_onboarding_sessions.responses`. Migrations pour des
   colonnes dédiées (ou champ JSONB enrichi sur `brand_book`) Sprint 38.
3. **Graphiques d'évolution `brand_metrics`** : courbes V2 sur
   `/programme/retombees`.
4. **`objectifsSuggestions` côté serveur** : alimentation depuis
   pilier_principal / calendar / current_rhythm / current_metrics.
5. **Bouton CTA "Lancer l'onboarding guidé →"** sur `/ma-marque` quand
   le wizard F18 n'est pas terminé (V1 : trigger uniquement par deep-link
   depuis /aujourd-hui jalon marque).

---

## Notes d'exécution

- Travail mené sur le projet réel `/Users/ulysselemoine/Desktop/creative-fair-v60`
  (branche `sprint-37`), pas dans le worktree d'entrée.
- Estimation initiale : 18-22 commits. Réalisé : 12 commits, plus dense
  par commit (regroupement F22+F23 ; A8 migration + sub-prompt en 2 commits ;
  F26 en 2 commits ; F18 en 3 commits structurels). Choix de cohésion plutôt
  que d'atomicité absolue.
- Pas de tag git (réservé Lead post-validation).
