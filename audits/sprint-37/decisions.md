# Sprint 37 — Journal de décisions techniques

Sprint conseiller en situation V1. Doctrine canonique :
`docs/sprint-37/09-modele-conseiller-en-situation.md`.

Branche `sprint-37`. Commits poussés au fil de l'eau.

---

## Préambule

État de départ (commit `75e2a76` sur main) :
- Sprint 36.I déjà mergé (Patch UX 7 findings)
- Tag `v1.7.2` posé
- `docs/sprint-37/09-modele-conseiller-en-situation.md` + `09bis-fiche-execution-sprint37.md`
  versionnés sur main (commit `75e2a76`)
- Branche `sprint-37` pré-créée à `75e2a76`
- `package.json` / `package-lock.json` modifiés mais non commités
  (bump Playwright 1.48 → 1.60, dotenv 16.4.5 → 16.6.1)
- 12 arbitrages techniques tranchés par le Lead (voir brief Sprint 37
  section "12 arbitrages techniques tranchés")

---

## Lot 0 — Pre-commit bump deps

**Commit** `chore(sprint-37): [lot 0] bump playwright + dotenv devDeps`

Rationnel : le lockfile pointait sur des versions plus récentes
que celles déclarées dans `package.json`. Pas de surface API
modifiée, pas de nouvelle dépendance. Nécessaire pour Lot 8 (E2E
Playwright).

---

## Lot 1 — Onboarding amendé

### Commit 1.1 — Migration 014

**Fichier** [supabase/migrations/014_profiles_pilot_role_and_frequency.sql](../../supabase/migrations/014_profiles_pilot_role_and_frequency.sql)

Décisions :
- 2 colonnes nullable sur `profiles` (pas de NOT NULL pour
  rester compatible avec les profils existants + ne pas casser
  les seeds pré-Sprint 37).
- CHECK constraints en `DO` blocks idempotents → migration
  rejouable sans erreur.
- Naming : `pilot_role` + `publication_frequency` (anglais,
  cohérent avec convention `tenants`, `profiles`, `brands`).
  Décision technique #10 du brief.

### Commit 1.2 — Onboarding amendé (composants + API)

**Fichiers**
- [components/onboarding/OnboardingChoiceStep.tsx](../../components/onboarding/OnboardingChoiceStep.tsx) (nouveau)
- [components/onboarding/ConseillerIntro.tsx](../../components/onboarding/ConseillerIntro.tsx) (nouveau)
- [components/onboarding/OnboardingFlow.tsx](../../components/onboarding/OnboardingFlow.tsx) (amendé)
- [app/api/onboarding/complete/route.ts](../../app/api/onboarding/complete/route.ts) (amendé)

**Écarts au brief**

1. **Naming `/mon-programme` vs `/programme`**
   Doc 09 utilise systématiquement `/mon-programme` comme
   destination. Réalité du code : la route Next.js est
   `/programme` (cf. `app/(programme)/programme/`). Le label
   produit est "Mon Programme" (cf. user-menu Sprint 36.I).
   J'utilise `/programme` partout dans le code (cohérent avec
   l'existant) et garde "Mon Programme" comme label visible.

2. **Sortie écran 3 mini-onboarding**
   `/programme?action=create-plan` au lieu de
   `/mon-programme` ouverture sheet. Le paramètre URL sera
   lu par /programme côté Lot 4 pour ouvrir la sheet "Créer
   mon prochain plan" au mount. Convention plus simple qu'un
   state global.

**Décisions de design (mini-onboarding)**

- 3 écrans dans un seul composant client `ConseillerIntro`.
  Affiché in-place dans OnboardingFlow (pas une nouvelle
  route) → pas de double layout, pas de breaking back.
- Illustrations sobres rendues en CSS pur (pas d'image
  importée) : 3 vignettes stylisées (sheet, bulle, plan).
  Sprint 38+ pourra les remplacer par de vraies captures.
- Bouton primaire "créer mon plan" (sentence case) + lien
  secondaire "plus tard" (transparent button). Lignes 1 et 2
  ont "suivant" + "passer".
- Indicateurs de progression 3 dots en haut, le dot actif
  s'élargit (largeur 18px vs 6px). Cohérent avec la sobriété
  iOS.

**TODOs identifiés (à traiter en Lot 4)**

- /programme doit savoir lire `?action=create-plan` au mount
  et ouvrir la sheet de sélection période. Sera fait Lot 4.

---

## À faire encore

- Lot 2 (Sheet conversationnelle, ~5-6 commits)
- Lot 3 (Page /outils/conseiller historique)
- Lot 4 (Voies d'accès /programme — y compris `?action=create-plan`)
- Lot 5 (Voies d'accès /aujourd-hui + modération)
- Lot 6 (Prompt système conseiller + scénarios + server action)
- Lot 7 (Champ Retombées sur fiche post + A2/A7)
- Lot 8 (E2E + audit final)
