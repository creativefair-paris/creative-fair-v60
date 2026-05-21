# Amendement Sprint 40 — Brief Phase 2

> Amendement au brief `audits/sprint-40/brief.md` (commit `9e3cbf5`).
> Acté par le Lead le 21 mai 2026 après lecture de l'audit Phase 1.
> **Ce document complète le brief, il ne le remplace pas.** Les anti-patterns §8 et anti-patterns du brief restent intégralement applicables.

---

## 1. Contexte

L'audit Phase 1 a été livré dans 11 fichiers + `decisions.md` sur la branche `sprint-40-audit-purge`. Le Lead a lu et validé l'audit le 21 mai 2026, avec trois arbitrages et une précision de méthode pour Phase 2.

Le présent amendement consigne ces décisions Lead. Claude Code doit **lire ce fichier ET le brief original** avant de démarrer Phase 2.

---

## 2. Arbitrage Lead #1 — Validation des suppressions PAR BLOCS COHÉRENTS

Brief original §6.2 disait : *"Suppression de fichiers entiers = validation individuelle."*

**Arbitrage Lead :** validation **par blocs cohérents**, pas fichier par fichier.

**Définition d'un bloc cohérent :** un ensemble de fichiers qui partagent :
- La même justification doctrinale (même citation de la doctrine V2.0)
- Le même verdict (Recalé)
- Le même type d'action (suppression par exemple)
- Un périmètre fonctionnel commun (par exemple : tous les composants Conseiller V1, ou toutes les server actions liées à F89 piliers déprécié)

**Interdiction explicite :** un bloc ne doit JAMAIS mélanger des fichiers de natures différentes. Pas de bloc fourre-tout type "divers Recalés".

Si un fichier ne tombe dans aucun bloc cohérent existant, il fait l'objet d'un **bloc individuel** dans `proposed-deletions.md`.

---

## 3. Arbitrage Lead #2 — `BarreFondations` et `EtatMarque` = À refactorer

Décision 15 de `decisions.md` Phase 1 : Claude Code statuait À refactorer avec note "audit visuel Sprint 41 — si la barre crée pression visuelle → Recalé".

**Arbitrage Lead :** maintenu **À refactorer** (pas Recalé).

Action Phase 2 :
- Marquage `@deprecated` dans le commentaire d'en-tête du fichier `components/ma-marque/BarreFondations.tsx` et `EtatMarque.tsx`.
- Mention dans `audits/sprint-40/proposed-deletions.md` que ces deux fichiers sont **explicitement exclus** de la Phase 2.
- Documentation dans `decisions.md` Phase 2 : "Audit visuel `BarreFondations` + `EtatMarque` reporté Sprint 41, sur décision Lead acté 21 mai 2026."

---

## 4. Arbitrage Lead #3 — `lib/ai/prompts/system.ts` (SACRÉ) avec mention "Conseiller" = accepté

Décision 2 de `decisions.md` Phase 1 : Claude Code refusait de toucher au fichier pour ne pas casser le prompt cache à 90%.

**Arbitrage Lead :** validé. Le fichier reste intouché Sprint 40.

Action Phase 2 :
- Aucune modification de `lib/ai/prompts/system.ts`.
- Aucune modification d'aucun system prompt sacré d'Expert (`lib/ai/prompts/helene.ts`, `lib/ai/prompts/experts/*.ts` s'ils existent).
- Documentation dans `decisions.md` Phase 2 : "Refonte VOICE_SHEET_RULES + system prompts Experts = Sprint 41-prompts dédié, à planifier."

---

## 5. Précision méthodologique — Phase 2 en DEUX NUITS avec validation Lead intermédiaire

Le brief original §2 prévoyait : Phase 1 → STOP → GO Lead → Phase 2 complète.

**Précision Lead :** Phase 2 elle-même se déroule en **deux étapes avec validation Lead intermédiaire** :

### 5.1 Étape 2A — Production du `proposed-deletions.md` (lecture seule sur le code)

Claude Code démarre Phase 2 par la **production exhaustive** du fichier `audits/sprint-40/proposed-deletions.md` selon la structure §6 ci-dessous. **Aucune modification de code, aucune suppression, aucun tag, aucun refactor n'est exécuté à cette étape.**

À la fin de l'Étape 2A :
- Commit unique `docs(sprint-40-phase-2a): proposed-deletions par blocs cohérents`
- Push
- **STOP**

### 5.2 Validation Lead intermédiaire

Le Lead lit `proposed-deletions.md`, met le marqueur `VALIDÉ` devant chaque bloc qu'il approuve, laisse vide devant ceux qu'il refuse, commit son fichier édité, push.

Le commit Lead de validation a pour message :

```
lead: VALIDATE PHASE 2B sprint-40 - blocs X/Y/Z approuves
```

(Avec X/Y/Z = identifiants des blocs validés, à titre indicatif.)

### 5.3 Étape 2B — Exécution

Claude Code lit `proposed-deletions.md` après son édition Lead. Il exécute :

1. Toutes les suppressions des blocs marqués `VALIDÉ` (et **uniquement** ceux-là).
2. Tous les refactors automatiques décrits dans les 11 audits Phase 1 (forest green, vocabulaire interdit, halos hors Aujourd'hui, etc.).
3. Le tag + delete `cf-conceptuel-0` selon brief §6.5.
4. La création du dossier `archive/v1-leftovers/` pour les fichiers de valeur historique.
5. L'auto-évaluation finale `audits/sprint-40/zz-auto-evaluation.md` (brief §9.4).

À la fin de l'Étape 2B :
- Commits multiples par lot logique (brief §6.3)
- Push
- Auto-évaluation
- STOP final

### 5.4 Discipline d'attente

Comme pour Phase 1, Claude Code **ne démarre pas Étape 2B** sans le commit Lead `lead: VALIDATE PHASE 2B sprint-40 ...`. Sans ce commit, `abort-log.md` consigne "Étape 2B non démarrée — pas de validation Lead."

---

## 6. Structure obligatoire de `proposed-deletions.md`

Le fichier suit cette structure stricte :

```markdown
# Sprint 40 — Propositions de suppression Phase 2

> Lead : marquer `VALIDÉ` devant chaque bloc à exécuter.
> Laisser vide pour refuser un bloc.
> Tout bloc sans `VALIDÉ` ne sera PAS exécuté.

---

## Bloc 1 — <nom court descriptif>

**Statut Lead :** [   ]
**Justification doctrinale :** citation précise de la doctrine V2.0 (ex: `00-CONCEPT.md §14 décisions abandonnées — Conseiller comme page séparée fusionné dans Messages`)
**Type d'action :** suppression définitive | suppression avec backup dans `archive/v1-leftovers/`
**Nombre de fichiers :** N
**Risque technique :** faible | moyen | élevé

**Fichiers concernés :**
- `path/du/fichier-1.tsx`
- `path/du/fichier-2.tsx`
- ...

**Dépendances cassées attendues :**
- `import X from './fichier-1'` dans `path/Y.tsx` → à neutraliser par retrait de l'import
- ...

**Vérification post-suppression :**
- `npm run build` doit passer après le retrait des imports cassés
- Aucune route 404 introduite

---

## Bloc 2 — ...

[etc.]

---

## Récapitulatif

| # | Bloc | Fichiers | Statut |
|---|---|---|---|
| 1 | <nom> | N | [   ] |
| 2 | ... | ... | [   ] |
| ... | | | |

Total fichiers proposés : N
Total fichiers validés Lead : à remplir après validation
```

**Pour valider un bloc**, le Lead remplace `[   ]` par `[VALIDÉ]` dans l'en-tête du bloc ET dans la ligne du récapitulatif.

---

## 7. Anti-patterns Phase 2 (renforcement)

En complément des anti-patterns du brief original §8, Phase 2 ajoute :

- **Ne pas exécuter un bloc non validé.** Le test est strict : présence de `[VALIDÉ]` dans l'en-tête. Tout autre marquage = non validé.
- **Ne pas inventer de bloc en cours d'exécution.** Si Claude Code, en exécutant l'Étape 2B, découvre un fichier qui aurait dû être dans un bloc mais qui ne l'est pas, il **n'agit pas** sur ce fichier. Il consigne dans `decisions.md` Phase 2 le constat, et le fichier attend un Sprint suivant.
- **Ne pas modifier `BarreFondations.tsx` ni `EtatMarque.tsx` au-delà du marquage `@deprecated`.** Arbitrage Lead #2.
- **Ne pas toucher à `lib/ai/prompts/system.ts` ni aucun prompt Expert sacré.** Arbitrage Lead #3.

---

## 8. Critères d'acceptation Lead pour clôturer Sprint 40

Le Lead clôture Sprint 40 si et seulement si :

- Étape 2A a livré `proposed-deletions.md` en blocs cohérents conformes §6.
- Validation Lead intermédiaire a été tracée par commit `lead: VALIDATE PHASE 2B ...`.
- Étape 2B n'a exécuté que les blocs `VALIDÉ`.
- Refactors automatiques (forest green, vocabulaire interdit, halos, etc.) appliqués sans erreur de build.
- `cf-conceptuel-0` taggée et supprimée.
- `archive/v1-leftovers/` créé et peuplé.
- `zz-auto-evaluation.md` honnête (toute réponse NON est tracée dans `decisions.md` Phase 2).
- Aucun commit sur `main`.
- Aucune modification de `skills/`, de `lib/ai/prompts/system.ts`, de `BarreFondations.tsx`, de `EtatMarque.tsx` (hors `@deprecated`).
- `npm run build` passe sur la branche `sprint-40-audit-purge` au commit final.

---

## 9. Workflow opérationnel Phase 2 (synthèse)

```
[Lead]    commit lead: GO PHASE 2 sprint-40
              ↓
[CC]      Étape 2A — produire proposed-deletions.md (lecture seule)
              ↓
[CC]      commit docs(sprint-40-phase-2a): proposed-deletions par blocs
              ↓
[CC]      push + STOP
              ↓
[Lead]    lit, marque VALIDÉ devant les blocs approuvés, commit
[Lead]    commit lead: VALIDATE PHASE 2B sprint-40 - blocs X/Y/Z
              ↓
[CC]      Étape 2B — exécuter suppressions validées + refactors automatiques
              + tag/delete cf-conceptuel-0 + archive/v1-leftovers/
              ↓
[CC]      commits multiples par lot (refactor + chore)
              ↓
[CC]      auto-évaluation zz-auto-evaluation.md
              ↓
[CC]      push + STOP final
              ↓
[Lead]    validation finale + critères §8 ci-dessus
```

---

*Amendement émis le 21 mai 2026 par le Lead. À lire conjointement avec `audits/sprint-40/brief.md` (commit `9e3cbf5`). Toute proposition de modification de cet amendement passe par commit Lead sur la branche `sprint-40-audit-purge`.*
