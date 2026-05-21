# Sprint 40 — Synthèse exécutive

> Phase 1 — Audit lecture seule.
> Branche : `sprint-40-audit-purge`.
> Émise le 21 mai 2026.

---

## Verdict global

Le repo Creative Fair v60 est **massivement décalé de la doctrine V2.0** figée le 21 mai 2026 (commit `46e3ebe`). Le code actuel est en grande partie un legacy V1 organisé autour de l'ancien Conseiller (avec ses scénarios A/B/C/D/E, son wizard immersif, sa pédagogie 4 mois) et de la nav 4 destinations top-level désormais caduque.

### Statistiques sur l'ensemble du repo

| Verdict | Fichiers de code | % |
|---|---|---|
| **Validés** | ~45 | ~15 % |
| **À refactorer** | ~140 | ~46 % |
| **Recalés** | ~120 | ~39 % |
| **Total fichiers audités** | ~305 | 100 % |

Sont également identifiés :
- **~25 fichiers cibles à créer** (Messages, Rappels, Calendrier top-level, Hélène + 12 Experts) — hors scope Sprint 40, planifiés Sprint 43+.
- **38 sprints d'audits historiques** : tous conservés (valeur traçable).
- **1 branche dormante** (`cf-conceptuel-0`) : à tagger + supprimer Phase 2.

---

## Top 5 des écarts doctrinaux majeurs

### 1. Module Conseiller V1 entièrement Recalé (~60 fichiers)

L'écosystème Conseiller historique débordant sur Messages, Mes Outils et Mon Programme :

- `app/(outils)/outils/conseiller/page.tsx`
- `app/(outils)/outils/messages/page.tsx` (placeholder "Reporté V2")
- `components/conseiller/*` + `wizard-steps/*` (~33 fichiers)
- `components/outils/conseiller/*` (3 fichiers, déjà marqués "SUPPRESSION CANDIDATE Sprint 36")
- `components/outils/mockups/ConseillerIPhoneMockup.tsx`
- `lib/conseiller/*` (~10 fichiers + 15 scénarios A/B/C/D/E)
- `app/_actions/run-conseiller-turn.ts`, `mark-conseiller-timeout.ts`, `find-resumable-session.ts`, `generate-pedagogy.ts`, `wizard-session.ts`
- `app/api/ai/chat/route.ts`, `app/api/ai/coaching/route.ts`
- `components/programme/ConseillerAccess.tsx`, `NewPlanPedagogyOverlay.tsx`, `CoachingCard.tsx`, `CoachingGenerator.tsx`

**Référence doctrine :** `00-CONCEPT.md` §14 "Conseiller comme page séparée (fusionné dans Messages avec Hélène M. pinned)" · `10-SACRED.md` "L'ancienne nav 4 destinations (Aujourd'hui / Calendrier / Ma Marque / Conseiller) est caduque depuis le 20 mai 2026."

**Impact Phase 2 :** Suppression en bloc (en plusieurs lots validés Lead via `proposed-deletions.md`). Backup `archive/v1-leftovers/conseiller-*/`.

---

### 2. Faille P0 multi-tenant — 23 fichiers utilisent `createAdmin()` côté user

Pattern interdit `04-MULTI_TENANT.md` : `createAdmin()` + `.eq('id', ...)` sans filtre `tenant_id`, qui bypasse RLS et expose les données de tous les tenants à un attaquant connaissant un ID.

Fichiers concernés (hors cas légitimes admin/credits/ensure-profile) :

```
app/(ma-marque)/ma-marque/page.tsx
app/_actions/pillars.ts (3 occurrences)
app/_actions/brand-onboarding.ts (5 occurrences)
app/_actions/propose-piliers.ts (2 occurrences)
app/_actions/generate-pillar-wizard.ts (2 occurrences)
app/_actions/generate-plan-from-form.ts, generate-plan-from-wizard.ts
app/_actions/estimate-programme-outcomes.ts
app/_actions/strategie-events-intention.ts
app/_actions/catch-up-overdue-posts.ts
app/_actions/update-post.ts, update-post-retombees.ts
app/_actions/create-library-document.ts
app/_actions/create-review.ts, run-review-check.ts, upload-review-visual.ts
app/_actions/ask-mini-chat.ts
app/api/brand/waitlist/route.ts (3 occurrences)
app/api/brand/update/route.ts, upload/route.ts
app/api/brand/archives/route.ts, archives/[id]/route.ts
app/api/ma-marque/regenerer-piliers/route.ts
app/api/onboarding/complete/route.ts
app/(programme)/programme/strategie/page.tsx
```

**Référence doctrine :** `04-MULTI_TENANT.md` "Le pattern fautif… est interdit. Il est à éradiquer **avant tout client en production**." `10-SACRED.md` "`createAdmin()` jamais côté user".

**Impact Phase 2 :** **Documentation précise dans `10-transverse.md` §1**. Le patch concret (~23 fichiers à modifier sur leur logique métier) est explicitement **laissé à un Sprint 41 dédié sécurité** — modification métier sur 23 fichiers = risque hors scope Sprint 40 (qui est une purge, pas un refactor de logique).

---

### 3. Pages top-level absentes (architecture nav doctrinale V2.0 non implémentée)

`01-ARCHITECTURE.md` §1 attend 10 pages dont 5 ne sont pas implémentées au bon emplacement :

| Page V2.0 | Statut actuel |
|---|---|
| **Aujourd'hui** | Existe (`/aujourd-hui`) mais layout obsolète (Sprint 36.G Split Brief, pas la sidebar 8 dest + 3 widgets + Roadmap canonique) |
| **Messages** | **Absente** au top-level. Le legacy Conseiller occupe la fonction |
| **Calendrier** | **Absente** au top-level. 10 composants `Calendar*` / `Vue*` dans `components/programme/` |
| **Rappels** | **Absente** entièrement. Seul `components/today/TaskRow.tsx` existe (utilisable plus tard) |
| **Bibliothèque** | Existe mais sous `(outils)/outils/bibliotheque/` au lieu du top-level |
| **Mon Programme** | Existe (`/programme`) mais avec route obsolète + layout Split Brief 40/60 + 12 imports Conseiller V1 + Coaching daily + Retombées V1 |
| **Ma Marque** | Existe ✓ (avec architecture 14 blocs + sub-arbre piliers F89 récent conforme) |
| **Mes Outils** | Existe (`/outils`) mais sous-arbre Conseiller / Messages placeholder / Bibliothèque à dégager |
| **Compte** | Existe mais sous-routes `/compte/ma-marque/*` à dégager (Ma Marque a sa route top-level) |
| **Aide** | **Absente** entièrement |

**Référence doctrine :** `01-ARCHITECTURE.md` §1 + §2 + §3.

**Impact Phase 2 :** Pas de création Sprint 40 (purge ≠ création). Sprint 43+ création des routes absentes + déplacements.

---

### 4. Métriques inventées et concepts gamifiés à dégager

`00-CONCEPT.md` §3 "Pas de métriques inventées qui simulent un contrôle (Cohérence/Équilibre/Densité/Profondeur sont retirées du produit)." §14 "Apple Santé avec 4 indicateurs vitaux Cohérence/Équilibre/Densité/Profondeur dans Mon Programme (exploration cf-conceptuel-0, jamais validée)."

Traces dans le code :

- `components/strategie/IndicateursEditorialsList.tsx` — concept "indicateurs éditoriaux" à auditer (4 indicateurs vitaux dégagés ?).
- `lib/programme/compute-indicateurs-editoriaux.ts` — calcul des indicateurs (idem).
- `components/jalons/JalonHero.tsx` + `JalonGuardDialog.tsx` + `lib/jalons/check-jalons.ts` — système jalons fondations = gamification soft, méthode pédagogique 4 mois (dégagée §14).
- `components/today/DemarrerCard.tsx` — card onboarding en home.
- `components/ma-marque/BarreFondations.tsx` — barre de progression "fondations" (frontière mince avec gamification).
- `components/programme/CoachingCard.tsx`, `CoachingGenerator.tsx` — coaching daily (anti-doctrine "ce n'est pas Headspace").
- `app/api/ai/coaching/route.ts` + `lib/ai/prompts/coaching.ts` — backend coaching daily.
- `app/(programme)/programme/retombees/page.tsx` + `components/retombees/*` (3 fichiers) + `components/programme/RetombeesEditor.tsx` — Retombées (vanity metrics hors V1).
- Table SQL `daily_coaching`.
- Table SQL `brand_metrics` (à auditer).

**Impact Phase 2 :** Suppression en bloc (Coaching, Jalons, Retombées). Documenter Sprint 41 audit `IndicateursEditorialsList` (Recalé si Cohérence/Équilibre/Densité/Profondeur, conservé sinon).

---

### 5. Système Hélène + 12 Experts entièrement à créer (Sprint 43+)

`02-EXPERTS.md` (intégral) définit Hélène M. (Opus 4.7, orchestratrice pinned dans Messages) et les 12 Experts (Sofia, Léa, Capucine, Jonas, Albane, Marc, Inès, Sébastien, Valentine, Antoine, Camille, Élise) avec leur LLM par rôle.

Aucun de ces fichiers n'existe :
- `lib/ai/prompts/helene.ts` (absent)
- `lib/ai/prompts/experts/*.ts` (12 fichiers absents)
- `lib/experts/types.ts` (absent)
- `lib/experts/routing.ts` (absent)
- `components/messages/*` (sous-arbre absent)
- `components/messages/HeleneListensBanner.tsx` (banner "Hélène suit cette conversation" obligatoire §4.3)
- Pattern carnet des Experts (§5)

**Impact Phase 2 :** Aucune Sprint 40 (création hors scope). Le Sprint 40 nettoie pour que le Sprint 43+ puisse construire.

---

## Estimation de l'effort Phase 2

| Catégorie | Nombre estimé |
|---|---|
| **Suppressions de fichiers (validation Lead individuelle)** | ~95 fichiers Recalés (Conseiller V1 ~60, Coaching ~4, Retombées ~6, Jalons ~3, Dev ~3, Mockups Conseiller ~1, Compte/ma-marque sous-arbre ~3, OnboardingFlow legacy ~2, divers ~13) |
| **Refactors de fichiers (modifications partielles automatiques)** | ~30 fichiers (retrait halos sur 3 pages, retrait sections "À venir" / "Bientôt" sur `OutilsCatalog.tsx`, retrait imports Conseiller dans `page.tsx` divers, marquage `@deprecated` Split Brief / Dashboard nominaux) |
| **Modifications partielles dans commentaires / docs** | ~15 fichiers (audit doctrinal des commentaires d'en-tête + docs/user) |
| **Tag + suppression branche** | 1 (cf-conceptuel-0) |
| **Création archive/v1-leftovers/** | ~5 sous-dossiers de backup |

**Temps estimé Phase 2 :** 10-15 heures, dont environ 4-6 heures bloquées en attente de validation Lead pour les suppressions (`proposed-deletions.md`).

---

## Risques identifiés

### 1. Cache Anthropic (90%)

**Risque majeur.** Toute modification de `lib/ai/prompts/system.ts` (VOICE_SHEET_RULES SACRED) et des system prompts des Experts (`lib/ai/prompts/helene.ts` et `experts/*.ts`, inexistants aujourd'hui) casse le prompt cache à 90% → **explosion de la facture Anthropic + régression qualité immédiate sur tous les outputs IA**.

**Mitigation :** Sprint 40 NE TOUCHE PAS à `lib/ai/prompts/system.ts`. Documentation dans `decisions.md`. La refonte voice sheet attend un Sprint dédié Lead.

### 2. Cassure de dépendances par suppression du Conseiller V1

**Risque :** ~60 fichiers à supprimer sont importés par d'autres composants (`<ConseillerAccess>` dans `/programme/page.tsx`, `<NewPlanPedagogyOverlay>` idem, `runConseillerTurn` server action, etc.).

**Mitigation :** Phase 2 procède en lots ordonnés — **d'abord retirer les imports** dans les pages consommatrices (refactor automatique), **ensuite supprimer** les fichiers Conseiller (avec backup). L'ordre des commits compte.

### 3. Migration de schéma = hors scope

**Risque :** Les tables `conversations`, `daily_coaching`, `programme_creation_sessions`, `brand_metrics` portent du legacy. Les modifier en Sprint 40 = risque de migration ratée.

**Mitigation :** Aucune modification de schéma Sprint 40. Documentation laissée à Sprint 41 schéma dédié.

### 4. Renommages de routes URL = impact router massif

**Risque :** Renommer `/programme` → `/mon-programme`, `/outils` → `/mes-outils`, `/onboarding` → `/premiers-pas` impacte les URL existantes (bookmarks, liens externes, search engine).

**Mitigation :** Aucun renommage de route URL Sprint 40. Documentation laissée à Sprint 41+.

### 5. Régression visuelle par retrait des halos sur pages métier

**Risque mineur :** Retirer les `bg-halo-1..5` sur `/outils`, `/outils/bibliotheque`, `/outils/messages` peut surprendre visuellement (page subitement plus "plate").

**Mitigation :** Conformité doctrine §3.4 prime. La page Aujourd'hui conserve les halos, les autres pages reviennent au wallpaper neutral (crème nuancée) — c'est le comportement attendu.

### 6. Cohabitation `MaMarqueDashboard` legacy + `PillarsManager` F89

**Risque :** Cohabitation des deux systèmes piliers (migration progressive Sprint 38 P0.W.2).

**Mitigation :** Sprint 40 marque `@deprecated` le legacy sans suppression. Résolution Sprint 41+.

---

## Recommandation au Lead

**Sprint 40 Phase 1 est livré.** Le repo a été audité contre la doctrine V2.0 figée le 21 mai 2026. Onze fichiers d'audit sont produits (`00-synthese.md` + `01-aujourd-hui.md` à `10-transverse.md` + `decisions.md`), totalisant **~6500 lignes** dans la fourchette attendue (5000-9000 lignes).

**Pour Phase 2, deux décisions Lead sont attendues :**

1. **GO PHASE 2 explicite** via commit Lead `lead: GO PHASE 2 sprint-40` sur la branche `sprint-40-audit-purge`. Sans ce commit, Claude Code STOP.

2. **Validation du `proposed-deletions.md`** une fois Phase 2 démarrée : ~95 fichiers à supprimer, regroupés en blocs logiques (Conseiller V1, Coaching, Retombées, Jalons, Dev split-brief, Compte/ma-marque sous-arbre obsolète, docs/user/conseiller, OnboardingFlow legacy). Le Lead met VALIDÉ devant chaque bloc qu'il approuve.

**Ce qui doit absolument être fait en Phase 2 :**

- Suppression de l'écosystème Conseiller V1 (le plus gros gain de propreté).
- Suppression Coaching / Retombées / Jalons / DemarrerCard (anti-doctrine claire).
- Retrait halos `bg-halo-N` sur pages métier (3 pages).
- Retrait sections "À venir" / "Bientôt" dans Mes Outils.
- Tag + suppression branche `cf-conceptuel-0`.
- Création `archive/v1-leftovers/` avec backups.

**Ce qui peut attendre Sprint 41+ :**

- Patch sécurité multi-tenant (23 fichiers — Sprint 41 dédié sécurité).
- Renommage routes URL (`/programme` → `/mon-programme`, `/outils` → `/mes-outils`, `/onboarding` → `/premiers-pas`).
- Refactor structurel Split Brief 40/60 → sub-sidebar 260px.
- Refonte VOICE_SHEET_RULES (Sprint dédié cache).
- Audit complet des hex hardcodés (Sprint 41+).
- Audit copies UI fine (vocabulaire encouragé `00-CONCEPT.md` §10 — Sprint 41+).
- Migration schéma (Sprint 41 dédié).

**Ce qui est explicitement hors V1 (Sprint 43+) :**

- Création Hélène M. + 12 Experts (prompts + UI Messages + carnet).
- Création routes Calendrier, Rappels, Bibliothèque top-level.
- Création route Aide.
- Création des 10 pages V2.0 reconstruites depuis les HTML Claude Design.

**Le Sprint 40 nettoie. Le Sprint 41 sécurise. Le Sprint 43+ construit.**

---

## Indicateurs de santé du repo

| Indicateur | État | Cible doctrinale V2.0 |
|---|---|---|
| Vert forêt `#1F4937` dans code actif | ✅ 0 occurrence | 0 ✓ |
| `middleware.ts` à la racine | ✅ Absent | Absent ✓ |
| `proxy.ts` à la racine | ✅ Présent | Présent ✓ |
| Phosphor installé | ✅ Non | Non ✓ |
| Lucide React | ✅ `^1.14.0` | Présent ✓ |
| RLS sur toutes les tables | ✅ Conforme | Conforme ✓ |
| `createAdmin()` côté user (P0) | ❌ 23 fichiers fautifs | 0 fichier (cas légitimes ≤ 3) |
| Sections "À venir" / "Bientôt" en UI | ❌ Présentes (`OutilsCatalog.tsx`) | 0 occurrence |
| Wallpaper saturated hors Aujourd'hui | ❌ Présent sur 3 pages | Réservé Aujourd'hui |
| Module Conseiller V1 | ❌ ~60 fichiers actifs | Supprimé ✓ |
| Module Coaching daily | ❌ 4 fichiers actifs | Supprimé ✓ |
| Module Retombées V1 | ❌ 6 fichiers actifs | Supprimé ✓ |
| Module Jalons fondations | ❌ 3 fichiers actifs | Supprimé ✓ |
| Route `/messages` top-level | ❌ Absente | Créer Sprint 43+ |
| Route `/calendrier` top-level | ❌ Absente | Créer Sprint 43+ |
| Route `/rappels` top-level | ❌ Absente | Créer Sprint 43+ |
| Route `/aide` | ❌ Absente | Créer Sprint 43+ |
| Système Hélène + 12 Experts | ❌ Absent | Créer Sprint 43+ |
| F89 wizard piliers | ✅ Présent et conforme | Présent ✓ |
| Branche `cf-conceptuel-0` | ❌ Active | Tag + delete Phase 2 |
| TypeScript strict | ✅ Conforme | Conforme ✓ |
| Test isolation multi-tenant | ✅ Script en place | Conforme ✓ |

**Score doctrinal V2.0 : 9/22 conforme — 41%.**

## Top 10 fichiers / modules les plus problématiques

Hiérarchisés par impact négatif sur la doctrine V2.0 :

1. **`lib/conseiller/` (24 fichiers)** — module Conseiller V1 entier, anti-doctrine §14, recommandation Sprint 40 Phase 2 suppression en masse.
2. **`components/conseiller/` (33 fichiers)** — UI Conseiller V1 + wizard A1 immersif, idem.
3. **23 server actions avec `createAdmin()` fautif** — faille P0 multi-tenant, P0 Sprint 41 dédié sécurité.
4. **`components/programme/ConseillerAccess.tsx` + `NewPlanPedagogyOverlay.tsx`** — 4 entrées Conseiller depuis /programme, anti-doctrine.
5. **`app/(programme)/programme/retombees/page.tsx` + `components/retombees/*`** — Retombées V1 vanity metrics, hors scope V1 §8.
6. **`app/(outils)/outils/messages/page.tsx`** — placeholder "Reporté V2", anti-pilier 6 Uncompromising Polish.
7. **`components/today/DemarrerCard.tsx` + `components/jalons/*`** — onboarding visible en home + jalons fondations, anti-pilier 8 + anti-gamification.
8. **`components/programme/CoachingCard.tsx` + `app/api/ai/coaching/route.ts`** — coaching daily, anti-doctrine "Ce n'est pas Headspace".
9. **`components/outils/OutilsCatalog.tsx`** — section "À venir" + items "Bientôt", vocabulaire interdit absolu §9.
10. **`app/(compte)/compte/ma-marque/` sous-arbre** — duplication route, anti-doctrine §4 séparation Compte ≠ Ma Marque.

## Synthèse opérationnelle Phase 2

- **~95 fichiers à supprimer** (validation Lead par bloc dans `proposed-deletions.md`).
- **~30 fichiers à refactorer automatiquement** (halos, sections, imports, marquage @deprecated).
- **1 branche à archiver** (`cf-conceptuel-0` → tag + delete).
- **5+ sous-dossiers à créer** dans `archive/v1-leftovers/` pour les backups.

**Temps estimé Phase 2** : 10 heures Claude Code + N heures Lead pour valider `proposed-deletions.md`.

**À l'issue de Phase 2** : le repo est nettoyé du legacy V1 le plus contradictoire. Sprint 41 peut alors attaquer la sécurité multi-tenant (P0) + l'audit copies fine + les renommages de routes. Sprint 42 finalise l'admin Lead. Sprint 43+ construit les 4 pages absentes (Messages, Calendrier, Rappels, Aide) + Hélène + 12 Experts.
