# Sprint 40 — Audit produit & purge V1

> Brief Lead pour Claude Code.
> Mission : auditer le repo Creative Fair v60 contre la doctrine V2.0, puis purger ce qui contredit, en deux temps avec validation Lead intermédiaire.
> Branche : `sprint-40-audit-purge`, depuis `sprint-39-doctrine` HEAD `46e3ebe`.
> Émis le 21 mai 2026 par le Lead.

---

## 1. Contexte non-négociable

La doctrine V2.0 a été figée le 21 mai 2026 dans le commit `46e3ebe` sur la branche `sprint-39-doctrine`. Elle est constituée de 7 fichiers dans `skills/` :

- `00-MASTER.md` — Routage, règles absolues code
- `00-CONCEPT.md` — Positionnement, persona, doctrine, vocabulaire, piliers Apple
- `01-ARCHITECTURE.md` — Navigation, pages, layouts, stack, helpers, workflow
- `02-EXPERTS.md` — Hélène M., 12 Experts, modèle de conversation, LLM par rôle
- `03-VOICE_SHEET.md` — Règles éditoriales
- `04-MULTI_TENANT.md` — RLS Supabase, helpers, patterns sécurité
- `10-SACRED.md` — Règles non-négociables, synthèse condensée

**Ces 7 fichiers sont la source de vérité unique du présent audit.** Toute confrontation se fait par rapport à eux, et eux seuls.

Les 10 pages HTML produites avec Claude Design (Aujourd'hui v3, Mes Outils v2, Mon Programme, Bibliothèque v2, Messages, Contacts, Ma Marque, Compte, Calendrier, Rappels) sont la **spec visuelle de référence**. Elles incarnent la doctrine V2.0 sur le plan UI. Elles sont disponibles en local chez le Lead, pas dans le repo.

Toute branche autre que `sprint-39-doctrine` HEAD est considérée comme **caduque ou en quarantaine** : le code actuel (`sprint-37`, mergé partiellement ou non) contient du legacy V1 qui n'a pas été aligné sur la doctrine V2.0. C'est l'objet du présent audit.

---

## 2. Objectifs et découpage temporel

Sprint 40 se déroule en **deux phases avec point d'arrêt obligatoire entre les deux**.

### Phase 1 — AUDIT (lecture seule, autonome)

Estimation : 10-15 heures de travail autonome Claude Code.

Produit livrable : 11 fichiers dans `audits/sprint-40/` (voir §4).

**À la fin de la Phase 1, Claude Code commit, push, et S'ARRÊTE.** Pas de purge, pas de modification de code. Le Lead lit le rapport et donne son go pour la Phase 2.

### Phase 2 — PURGE & CARTOGRAPHIE (modifications, semi-autonome)

Estimation : 10-15 heures de travail Claude Code, avec interruptions pour validation Lead sur les actes lourds.

Démarrage : uniquement après go explicite du Lead via un commit Lead `lead: go phase 2 sprint-40` sur la branche `sprint-40-audit-purge`.

Si ce commit n'existe pas dans la branche au démarrage Phase 2 : **STOP, écrire dans `audits/sprint-40/abort-log.md` et attendre**.

---

## 3. Scope de l'audit

### 3.1 Scope inclus

Tout le repo, par axe produit (10 pages cibles) :

- `app/` : toutes les routes et pages
- `components/` : tous les composants UI
- `lib/` : helpers, prompts IA, types, server actions
- `supabase/migrations/` : 24+ migrations existantes
- `styles/` : `cf-tokens.css`, `liquid-glass.css`
- `audits/sprint-1/` à `audits/sprint-38/` : historique d'audits (à classer)
- `docs/` : documentation user et admin
- `scripts/` : scripts utilitaires
- Branches dormantes : `cf-conceptuel-0` (voir §3.3)

### 3.2 Scope exclu

- `node_modules/` : évident
- `.next/`, `.vercel/` : artefacts de build
- `.git/` : métadonnées
- Fichiers de config racine non doctrinaux (`package.json`, `tsconfig.json`, `next.config.ts`, etc.)
- Tests automatisés (`tests/`, `*.test.ts`) : on les remettra à jour quand le code aura été purgé, sinon on documente du caduc

### 3.3 Cas particulier — branche cf-conceptuel-0

La branche `cf-conceptuel-0` (4524 lignes, 7 docs conceptuels) est traitée en Phase 2 selon le pattern suivant :

1. Audit Phase 1 : produire un verdict global "exploration V2/V3, non validée Lead"
2. Phase 2 : tagger la branche `archive/cf-conceptuel-0-2026-05` et la supprimer de la liste active des branches du repo, pour clarifier l'arborescence git.

---

## 4. Livrables Phase 1 — 11 fichiers

À produire dans `audits/sprint-40/` selon ce plan exact :

```
audits/sprint-40/
├── 00-synthese.md                      ← synthèse exécutive
├── 01-aujourd-hui.md                   ← audit page Aujourd'hui
├── 02-mes-outils.md                    ← audit page Mes Outils
├── 03-mon-programme.md                 ← audit page Mon Programme
├── 04-ma-marque.md                     ← audit page Ma Marque
├── 05-messages.md                      ← audit page Messages (Conseiller fusionné)
├── 06-bibliotheque.md                  ← audit page Bibliothèque
├── 07-calendrier.md                    ← audit page Calendrier
├── 08-rappels.md                       ← audit page Rappels
├── 09-compte.md                        ← audit page Compte + Aide
├── 10-transverse.md                    ← audit code transverse (lib/, prompts, multi-tenant, tokens, etc.)
└── decisions.md                        ← log des décisions de Claude Code
```

Volumes attendus : 400-800 lignes par fichier page, 200-400 lignes pour `00-synthese.md`, 600-1000 lignes pour `10-transverse.md`, 200 lignes max pour `decisions.md`. Volume cumulé attendu : 5000-9000 lignes.

### 4.1 Structure d'un fichier page (`01-aujourd-hui.md` à `09-compte.md`)

Chaque fichier suit cette structure stricte :

```markdown
# Audit Sprint 40 — Page <Nom>

> Verdict global : Validé / À refactorer / Recalé
> Doctrine de référence : 00-CONCEPT.md, 01-ARCHITECTURE.md (sections X.Y), 02-EXPERTS.md si applicable

## 1. Périmètre audité

Liste exhaustive des fichiers du repo concernant cette page :
- app/(app)/<route>/page.tsx
- app/(app)/<route>/loading.tsx
- app/(app)/<route>/error.tsx
- components/<nom>/* : tous les composants
- lib/<feature>/* : helpers liés
- supabase/migrations/* : migrations liées
- Server Actions liées

## 2. Confrontation à la doctrine

Pour chaque fichier ou composant :

### <chemin/du/fichier>
- Statut doctrinal : Validé / À refactorer / Recalé
- Référence doctrine : citation précise du document doctrinal (ex: "00-CONCEPT.md §11 palette canonique")
- Constat factuel : ce que le fichier contient
- Écart constaté : ce qui contredit la doctrine, précisément
- Action proposée Phase 2 : supprimer / refactorer / garder tel quel

## 3. Confrontation à la spec HTML

Pour la page concernée, on compare l'état actuel du code à ce que livre le HTML Claude Design correspondant.

Note : Claude Code n'a pas accès aux 10 HTML. Cette section se base sur ce que la doctrine V2.0 décrit (notamment 01-ARCHITECTURE.md §3 layouts, navigation, et les mentions de chaque page).

## 4. Résumé chiffré

- Fichiers Validés : N
- Fichiers À refactorer : N
- Fichiers Recalés : N
- Total fichiers audités : N

## 5. Recommandation pour Phase 2

Synthèse claire des actions à entreprendre en Phase 2 pour aligner cette page sur la doctrine V2.0.
```

### 4.2 Structure de `00-synthese.md`

```markdown
# Sprint 40 — Synthèse exécutive

## Verdict global

Statistiques sur l'ensemble du repo :
- Fichiers Validés : N (X%)
- Fichiers À refactorer : N (X%)
- Fichiers Recalés : N (X%)

## Top 5 des écarts doctrinaux majeurs

Les 5 écarts les plus structurants, hiérarchisés par impact.

## Estimation de l'effort Phase 2

- Suppressions de fichiers : N
- Refactors de fichiers : N
- Modifications partielles (retrait de mentions, etc.) : N
- Temps estimé Phase 2 : X heures

## Risques identifiés

Les risques techniques ou doctrinaux que la Phase 2 va engendrer (dépendances cassées, prompts cache invalidé, etc.).

## Recommandation au Lead

Synthèse en 5-10 lignes : ce qui doit absolument être fait en Phase 2, ce qui peut attendre Sprint 41+.
```

### 4.3 Structure de `10-transverse.md`

Couvre tout ce qui n'est pas attaché à une page particulière :

```markdown
# Audit transverse

## 1. Multi-tenant et sécurité
Confrontation à 04-MULTI_TENANT.md. Liste exhaustive des Server Actions, vérification du pattern `createAdmin()`, identification de la faille P0.

## 2. Prompts IA
Confrontation à 02-EXPERTS.md et 03-VOICE_SHEET.md. Liste des prompts existants dans `lib/ai/prompts/`, vérification de l'alignement avec la nomenclature Hélène + 12 Experts.

## 3. Tokens et design system
Confrontation à 00-CONCEPT.md §11. Mentions de forest green #1F4937, vert forêt, couleurs hex hardcodées, vocabulaire interdit dans le code visible UI.

## 4. Vocabulaire dans les copies UI
Grep des mots interdits (00-CONCEPT.md §9) dans le code accessible utilisateur.

## 5. Schéma Supabase
Confrontation à 04-MULTI_TENANT.md. Tables présentes, RLS active partout, FK cross-tables.

## 6. Conventions code
TypeScript strict, proxy.ts vs middleware.ts, server components par défaut.

## 7. Historique audits/
Classement des 38 sprints d'audits accumulés. Lesquels sont encore pertinents, lesquels sont obsolètes.

## 8. Branche cf-conceptuel-0
Verdict global "exploration V2/V3, non validée Lead, à archiver Phase 2".
```

---

## 5. Méthode d'audit — règles strictes

### 5.1 Système de verdict (trinaire)

Pour chaque fichier audité, **un seul verdict** parmi trois :

| Verdict | Définition | Action Phase 2 |
|---|---|---|
| **Validé** | Le fichier respecte la doctrine V2.0 et incarne la cible. À garder tel quel. | Aucune |
| **À refactorer** | Le concept porté par le fichier est conforme à la doctrine, mais l'implémentation contient des écarts (vocabulaire, design tokens, structure). À réécrire en gardant l'idée. | Modification ciblée |
| **Recalé** | Le fichier porte un concept qui contredit la doctrine V2.0 (ancienne nav 4 destinations, forest green, gamification, Conseiller séparé, Contacts séparé, métriques inventées Mon Programme, etc.). À dégager. | Suppression définitive |

**Pas de verdict "Validé partiel" ou "Recalé partiel".** Si tu hésites entre Validé et À refactorer, mets À refactorer. Si tu hésites entre À refactorer et Recalé, c'est Recalé. **Le doute appelle l'action.**

### 5.2 Source de vérité unique

Chaque verdict doit être **traçable** par référence précise à la doctrine. Format obligatoire :

```
- Verdict : Recalé
- Référence : 00-CONCEPT.md §14 "Vert forêt #1F4937 (déprécié 6 mai 2026)"
- Constat : le fichier contient 14 occurrences de #1F4937 dans des styles inline
- Action Phase 2 : suppression (le composant n'a pas d'équivalent dans les 10 HTML Claude Design)
```

Pas de verdict sans citation doctrine.

### 5.3 Refus de l'invention

Si Claude Code ne trouve pas dans la doctrine de référence claire pour juger un fichier : **statuer "À refactorer" par défaut**, avec mention `[doctrine silencieuse]` dans la justification. Ne jamais inventer une règle pour justifier un verdict.

### 5.4 Refus de l'extrapolation

Les 10 HTML Claude Design ne sont **pas** disponibles dans le repo. Claude Code ne doit donc **pas** affirmer "le HTML montre que cette page doit avoir X". La référence est la doctrine écrite (`skills/`), pas les HTML. Si un point n'est pas couvert par la doctrine écrite, c'est `[doctrine silencieuse]`.

### 5.5 Évaluation des écarts par familles

Pour accélérer l'audit, certains écarts récurrents peuvent être audités en batch :

- **Forest green / #1F4937** : grep global, lister tous les fichiers concernés, verdict groupé.
- **Vocabulaire interdit en UI** : grep global de la liste 00-CONCEPT.md §9, lister tous les fichiers concernés.
- **`createAdmin()` côté user** : grep + analyse manuelle de chaque occurrence.
- **`middleware.ts` vs `proxy.ts`** : présence du fichier interdit.
- **Mentions Conseiller, Contacts comme pages séparées** : grep des routes correspondantes.

Ces batches sont auditables ensemble dans `10-transverse.md`, plus rapidement que page par page.

---

## 6. Méthode de purge (Phase 2)

### 6.1 Déclenchement Phase 2

Phase 2 ne démarre **que** si :

1. Le commit `lead: go phase 2 sprint-40` existe dans la branche `sprint-40-audit-purge`.
2. Le message de ce commit contient au minimum la chaîne `GO PHASE 2`.

Sinon : `audits/sprint-40/abort-log.md` mentionne "Phase 2 non démarrée — pas de go Lead".

### 6.2 Système hybride (acté Sprint 39)

**Suppression de fichiers entiers = validation individuelle.** Avant de supprimer un fichier, Claude Code écrit dans `audits/sprint-40/proposed-deletions.md` :

```markdown
## Suppressions proposées (en attente de go Lead)

### <chemin/du/fichier>
- Verdict Phase 1 : Recalé
- Référence doctrine : <citation>
- Raison : <justification courte>
- Statut : EN ATTENTE
```

Le Lead lit ce fichier, met "VALIDÉ" en face de chaque suppression qu'il approuve (en commit Lead), et Claude Code exécute uniquement celles qui sont marquées VALIDÉ.

**Modifications dans des fichiers existants = automatique.** Retrait d'occurrences forest green, retrait de mentions vocabulaire interdit, remplacement de #1F4937 par var CSS appropriée, etc. : Claude Code exécute, commit par lot avec message clair.

### 6.3 Commits Phase 2

Un commit par lot logique :

```
refactor(sprint-40): purge mentions forest green dans <chemin>
refactor(sprint-40): retrait vocabulaire interdit dans copies UI <chemin>
chore(sprint-40): suppression fichiers Recalés <liste>
refactor(sprint-40): renommage Conseiller → Messages dans <chemin>
```

Jamais de commit qui mélange suppression et refactor. Granularité fine = revert ciblé possible.

### 6.4 Backup obligatoire avant suppression

Avant toute suppression de fichier, Claude Code vérifie que :
1. Le fichier est dans git (tracké, donc récupérable via reflog)
2. Si le fichier porte de la valeur historique (audit, doc, schéma), il est d'abord copié dans `archive/v1-leftovers/` à la racine du repo, puis supprimé de son emplacement actif

### 6.5 Cas cf-conceptuel-0

En fin de Phase 2 :

```bash
git tag archive/cf-conceptuel-0-2026-05 cf-conceptuel-0
git push origin archive/cf-conceptuel-0-2026-05
git push origin --delete cf-conceptuel-0
git branch -D cf-conceptuel-0
```

Tracer dans `audits/sprint-40/decisions.md` : "Branche cf-conceptuel-0 taggée et supprimée le <date>, contenu récupérable via tag archive/cf-conceptuel-0-2026-05".

---

## 7. Livrables Phase 2 — état final attendu

À la fin de Phase 2, l'état du repo doit être :

- **Code repo aligné sur doctrine V2.0** : zéro mention forest green dans le code actif (les archives gardent leur trace historique), zéro vocabulaire interdit dans les copies UI visible utilisateur, zéro `createAdmin()` côté user, zéro `middleware.ts`.
- **Aucune page "Conseiller" ni "Contacts"** comme route distincte. Les composants liés sont soit supprimés, soit déplacés vers `components/messages/`.
- **Schéma Supabase audité** : les éventuelles tables sans RLS ou avec policies trop laxes sont identifiées dans `audits/sprint-40/10-transverse.md` §5. Les corrections de schéma sont laissées à un Sprint 41 ou 42 dédié (modification de schéma = risque, hors scope purge).
- **Faille P0 multi-tenant identifiée précisément** dans `audits/sprint-40/10-transverse.md` §1. Le patch concret est laissé à un Sprint dédié.
- **Branche cf-conceptuel-0 taggée et supprimée**.
- **Dossier `archive/v1-leftovers/`** à la racine contient les fichiers de valeur historique dégagés du code actif.

---

## 8. Anti-patterns à refuser

Claude Code refuse en autonomie les actions suivantes, même si une lecture rapide pourrait le suggérer :

- **Ne pas toucher au commit `46e3ebe` ni à la branche `sprint-39-doctrine`.** La doctrine est figée, non négociable.
- **Ne pas modifier les 7 fichiers `skills/*.md`** pendant Sprint 40. Si un écart entre doctrine et code apparaît, c'est le code qui plie, pas la doctrine.
- **Ne pas inventer de nouveaux verdicts** ("Validé conditionnel", "Recalé partiel", "À voir"). Trois verdicts, point.
- **Ne pas démarrer Phase 2 sans go Lead explicite.**
- **Ne pas supprimer de fichier sans qu'il soit listé dans `proposed-deletions.md` validé Lead.**
- **Ne pas modifier des fichiers hors scope §3.1** (notamment pas de `tests/`, pas de configs racine, pas de `node_modules`).
- **Ne pas tagger ni pusher sur `main`.** Branche `sprint-40-audit-purge` uniquement.
- **Ne pas produire de document de plus de 1000 lignes** sans découpe (cap fixé en cohérence avec 00-MASTER.md anti-patterns).
- **Ne pas modifier `lib/ai/prompts/system.ts` ni les system prompts SACRÉS** des Experts. Si une mention contradictoire est repérée, la signaler dans `10-transverse.md` §2 et passer.

---

## 9. Workflow opérationnel attendu

### 9.1 Setup initial Claude Code

```bash
cd /Users/ulysselemoine/Desktop/creative-fair/creative-fair-v60
export PATH="/Users/ulysselemoine/.local/node/bin:$PATH"
git checkout sprint-39-doctrine
git pull
git checkout -b sprint-40-audit-purge
mkdir -p audits/sprint-40
```

### 9.2 Boucle de travail Phase 1

Pour chaque page (1 à 9) :
1. Identifier les fichiers du repo concernant cette page (grep, ls, recherche dans `app/`, `components/`, `lib/`).
2. Lire le fichier doctrine de référence (`00-CONCEPT.md`, `01-ARCHITECTURE.md`, etc.) pour les sections pertinentes.
3. Rédiger `audits/sprint-40/<NN>-<page>.md` selon §4.1.
4. Commit `docs(sprint-40-phase-1): audit page <nom>`.

Puis :
5. Rédiger `audits/sprint-40/10-transverse.md` selon §4.3.
6. Commit `docs(sprint-40-phase-1): audit transverse`.
7. Rédiger `audits/sprint-40/00-synthese.md` selon §4.2.
8. Rédiger `audits/sprint-40/decisions.md` (log des décisions et arbitrages Claude Code).
9. Commit `docs(sprint-40-phase-1): synthese et decisions`.
10. Push branche.
11. **STOP**. Attendre go Lead.

### 9.3 Boucle de travail Phase 2

Démarrage uniquement sur commit Lead `lead: GO PHASE 2 sprint-40`.

Puis pour chaque action :
1. Si suppression de fichier : ajouter à `proposed-deletions.md`, attendre validation Lead.
2. Si modification ciblée (vocabulaire, tokens, forest green) : exécuter, commit clair par lot.
3. Tagger et supprimer `cf-conceptuel-0` en toute fin de Phase 2.

### 9.4 Auto-évaluation finale

À la fin de Phase 2, Claude Code rédige `audits/sprint-40/zz-auto-evaluation.md` qui répond aux questions suivantes :

1. Tous les fichiers Recalés Phase 1 ont-ils été traités Phase 2 ?
2. Tous les fichiers À refactorer Phase 1 ont-ils été traités Phase 2 ?
3. Zéro mention forest green / #1F4937 dans le code actif ?
4. Zéro vocabulaire interdit dans les copies UI visibles utilisateur ?
5. Branche cf-conceptuel-0 archivée et supprimée ?
6. Aucun fichier hors scope §3.1 n'a été modifié ?
7. Aucun commit poussé sur `main` ?
8. Volume des audits Phase 1 dans la fourchette 5000-9000 lignes ?

Verdict binaire par question. Si une seule réponse est NON : `decisions.md` mentionne ce qui reste à faire et un Sprint 40 ter peut être planifié.

---

## 10. Critères d'acceptation Lead

Le Lead valide Sprint 40 si et seulement si :

- Le rapport Phase 1 (11 fichiers) est livré, dans les volumes attendus, avec verdicts traçables.
- Le `proposed-deletions.md` est lisible et permet une validation rapide.
- La Phase 2 a respecté la double règle (suppressions validées individuellement, refactors automatiques).
- L'auto-évaluation §9.4 est honnête (toute réponse NON est mentionnée dans `decisions.md`).
- Aucun fichier doctrinal `skills/*.md` n'a été modifié.
- Aucun commit sur `main`.
- Aucune modification hors scope §3.1.

---

## 11. Pour l'orchestration nocturne

Le présent brief est conçu pour deux nuits autonomes minimum, séparées par une validation Lead manuelle :

- **Nuit 1** : Phase 1 (audit, lecture seule).
- **Journée intermédiaire** : Lead lit, valide, donne le go via commit.
- **Nuit 2** : Phase 2 (purge et refactor, semi-autonome).

Si Phase 1 ou Phase 2 ne tient pas en une nuit, le travail est repris la nuit suivante au point d'arrêt, traçable par les commits déjà poussés. Pas de panique, pas d'accélération artificielle.

---

*Brief Sprint 40 émis le 21 mai 2026. Toute proposition d'amendement du brief avant lancement passe par commit Lead sur la branche `sprint-40-audit-purge`.*
