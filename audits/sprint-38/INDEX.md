# Sprint 38 — Index des 27 fichiers d'audit

> Navigation rapide. Cliquer sur un fichier pour ouvrir l'audit complet.
>
> Ordre de lecture recommandée pour le Lead :
> 1. `00-synthese-executive.md` (TL;DR + top 10 P0)
> 2. `90-priorisation-p0-p1-p2.md` (valider priorités)
> 3. `91-plan-remediation-sprint-39.md` (à lancer)
> 4. Le reste à la demande

---

## Synthèse (4 fichiers, ~2400 lignes)

| Fichier | Rôle | Lignes |
|---|---|---|
| [`00-synthese-executive.md`](./00-synthese-executive.md) | TL;DR + top P0/P1 + recommandations stratégiques | 474 |
| [`90-priorisation-p0-p1-p2.md`](./90-priorisation-p0-p1-p2.md) | 91 items priorisés (18 P0 + 43 P1 + 30 P2) | 474 |
| [`91-plan-remediation-sprint-39.md`](./91-plan-remediation-sprint-39.md) | Sécurité + doctrine + pilier_id (1 sem) | 492 |
| [`92-plan-remediation-sprint-40.md`](./92-plan-remediation-sprint-40.md) | Polish UI + Copy + Archi (1-2 sem) | 641 |
| [`93-plan-remediation-sprint-41.md`](./93-plan-remediation-sprint-41.md) | Angles morts + P2 cosmétique (1 sem) | 409 |
| [`decisions.md`](./decisions.md) | Méta audit + auto-évaluation | 385 |

## Pages auditées (18 fichiers, ~3700 lignes)

### Auth (2 fichiers)

| Fichier | Page | Verdict global | Lignes |
|---|---|---|---|
| [`01-page-login.md`](./01-page-login.md) | `/login` | Recalé partiel | 223 |
| [`02-page-signup.md`](./02-page-signup.md) | `/signup` (absente) | Recalé partiel | 187 |

### Onboarding (4 fichiers)

| Fichier | Page | Verdict | Lignes |
|---|---|---|---|
| [`03-onboarding-step-1.md`](./03-onboarding-step-1.md) | Step 1 | Recalé | 247 |
| [`04-onboarding-step-2.md`](./04-onboarding-step-2.md) | Step 2 | Recalé | 217 |
| [`05-onboarding-step-3.md`](./05-onboarding-step-3.md) | Step 3 (piliers JSONB) | Recalé partiel | 232 |
| [`06-onboarding-step-4.md`](./06-onboarding-step-4.md) | Step 4 (complete) | Recalé | 266 |

### Nav 5 principales (5 fichiers)

| Fichier | Page | Verdict | Lignes |
|---|---|---|---|
| [`07-aujourd-hui.md`](./07-aujourd-hui.md) | `/aujourd-hui` | Validé | 207 |
| [`08-mon-programme.md`](./08-mon-programme.md) | `/programme` | Recalé partiel | 215 |
| [`09-ma-marque.md`](./09-ma-marque.md) | `/ma-marque` (coexistence piliers !) | Recalé | 229 |
| [`10-mes-outils.md`](./10-mes-outils.md) | `/outils` | Recalé partiel | 216 |
| [`11-conseiller.md`](./11-conseiller.md) | `/outils/conseiller` | Recalé partiel | 240 |

### Outils sub-pages (6 fichiers)

| Fichier | Page | Verdict | Lignes |
|---|---|---|---|
| [`12-outils-post-creator.md`](./12-outils-post-creator.md) | `/outils/post-creator` (CENTRAL) | Recalé partiel | 240 |
| [`13-outils-bibliotheque.md`](./13-outils-bibliotheque.md) | `/outils/bibliotheque` | Recalé partiel | 252 |
| [`14-outils-moodboard.md`](./14-outils-moodboard.md) | `/outils/moodboard` (stub) | Recalé | 165 |
| [`15-outils-variations.md`](./15-outils-variations.md) | `/outils/variations` (stub) | Recalé | 164 |
| [`16-outils-reviews.md`](./16-outils-reviews.md) | `/outils/reviews` | Recalé partiel | 264 |
| [`17-outils-messages.md`](./17-outils-messages.md) | `/outils/messages` | Recalé | 178 |

## Workflows end-to-end (4 fichiers, ~1200 lignes)

| Fichier | Workflow | Verdict | Lignes |
|---|---|---|---|
| [`20-workflow-onboarding-complet.md`](./20-workflow-onboarding-complet.md) | A — Signup → Onboarding → Aujourd-hui | Recalé partiel | 293 |
| [`21-workflow-creation-pilier.md`](./21-workflow-creation-pilier.md) | B — Wizard piliers Sprint 37.K F89 | Recalé partiel | 299 |
| [`22-workflow-creation-post.md`](./22-workflow-creation-post.md) | C — Post Creator → preview → save | Recalé | 293 |
| [`23-workflow-navigation.md`](./23-workflow-navigation.md) | D — Navigation cross-pages | Recalé partiel | 331 |

## Annexes

- [`_capture.mjs`](./_capture.mjs) — script Playwright pour captures
  (à exécuter côté Lead avec auth Supabase)
- [`99-screenshots/README.md`](./99-screenshots/README.md) — instructions
  capture
- [`99-screenshots/`](./99-screenshots/) — dossier captures (vide en
  session Claude Code, à remplir côté Lead)

---

## Statistiques globales

| Métrique | Valeur |
|---|---|
| Pages auditées | 21 (sur 30 routes inventoriées dans `app/`) |
| Workflows audités | 4 / 4 |
| Volume markdown total | ~8 000 lignes |
| P0 uniques identifiés | 18 |
| P1 uniques identifiés | 43 |
| P2 uniques identifiés | 30 |
| % Validé (axe moyenne) | 26% |
| Failles structurelles | 3 |

## Failles structurelles (rappel)

1. **Sécurité multi-tenant** — `createAdmin()` sans re-filtre `tenant_id`
   sur ~5 server actions. → Sprint 39 P0
2. **Migration pilier_id incomplète** — table `pillars` + FK existent,
   non consommées. JSONB legacy coexiste. → Sprint 39 P0
3. **Doctrine documentation drift** — `skills/00, 01, 04, 10` décrivent
   l'ancien produit. → Sprint 39 P0

## Calendrier remédiation suggéré

```
Sprint 39 (1 sem, 18 P0)  : Sécurité + doctrine + branchement pilier_id
Sprint 40a (1 sem, ~24 P1): Polish UI + Copy + drop colonnes legacy
Sprint 40b (1 sem, ~23 P1): Archi + Workflow + Performance
Sprint 41 (1 sem, ~45 P2) : Audit 9 pages skipped + polish cosmétique
```

À l'issue du Sprint 41 : produit V1.5 prêt pour scale-up B2B ou
décision Apple Board V2.

---

## Liens utiles

- Branche audit : `sprint-38` (sur `origin`)
- Branche source : `sprint-37` (post-37.M validé)
- Commits Sprint 38 :
  - `b785906` Setup audit massif + script Playwright
  - `5163d23` Audit auth + onboarding 4 steps
  - `6f5e853` Audit nav 5
  - `145d609` Audit outils sub-pages
  - `324b37b` Audit 4 workflows
  - (à venir) Synthèse + plans + decisions

## Doctrine appliquée

- Spec audit Sprint 38 (12 mai 2026) = autorité primaire
- Citation anchor : "lui faire croire que c'est lui qui pilote et que
  tout est sous contrôle avec un vrai tableau de bord, simple et
  efficace." — Ulysse, 12 mai 2026
- 5 axes : Hiroshi UI, Elena Archi, Sarah Copy, Marcus Workflow,
  Hélène M. Doctrine
- Verdict binaire Validé/Recalé. Jamais "Presque", jamais "Partiellement"
  (sauf catégorie globale page "Recalé partiel" = 2-3 axes Validé).
