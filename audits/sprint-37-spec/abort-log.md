# Sprint 37-SPEC — Journal des écarts

Aucun abort déclenché. La spec a été livrée dans son périmètre :
8 docs + README + decisions + ce fichier.

## Conditions évaluées

### A1 — "Si la spec révèle que Sprint 37 nécessite un refacto préalable de /conseiller ou /calendrier : documenter dans 08 et flagger"

**Flag levé partiellement.** Cf. `08-plan-execution.md` section
*Prérequis avant Sprint 37 exécution* : un Sprint 36.F refactor
`/conseiller` est nécessaire **uniquement si** la porte d'entrée 2
(suggestion depuis `/conseiller`) est activée en V1. Si V1 reste sur
la seule porte 1 (CTA `/aujourd-hui`), pas de prérequis sprint.

Décision à arbitrer par Lead. Si oui → Sprint 36.F avant 37. Si non →
Sprint 37 direct.

### A2 — "Si la doctrine produit semble entrer en contradiction avec les capacités techniques : documenter le conflit, proposer 2-3 résolutions"

**Trois conflits identifiés et résolus** (cf. `decisions.md` section
*Conflits doctrine / technique identifiés*) :

1. Reprise asynchrone vs interdiction de notification intrusive →
   tradeoff accepté, pas de relance, ligne discrète dans
   `/aujourd-hui` au retour.
2. Anti-gamification vs feedback pendant la génération (5-15s
   d'attente Claude) → phrase courte + pulse visuel sobre glass-thin,
   sans % ni spinner.
3. Pilier 5 (Transparent Value Exchange) vs masquage du coût Anthropic
   → V1 sans affichage de coût, V2 peut introduire compteur en zone
   admin si besoin.

Aucun conflit bloquant. Sprint 37 peut démarrer sur la spec actuelle
si Lead acquitte les arbitrages.

## Écarts par rapport au brief

1. **Numérotation des docs** : 01 à 08 comme demandé. Pas d'écart.

2. **Branche source** : `sprint-36-c-2` au lieu de `main` (v1.7.0 pas
   encore taguée). Documenté dans `decisions.md`. Même justification
   que Sprint 36.E. Rebase trivial.

3. **Spec rédigée en vouvoiement implicite** (s'adresse au Lead) mais
   les exemples de phrases Creative Fair → user sont en tutoiement.
   Cohérent avec la séparation rôle. Brief demande "Pas d'emoji, pas
   d'exclamation. Tests nommés en français court" — respecté.

4. **Aucune exclamation/emoji utilisée comme expression**. Validation
   par grep :
   ```
   grep -rE "[🚀🔥💪⭐🎯✨🎉]" docs/sprint-37/
   → 0 résultat
   ```
   Deux occurrences de `!` apparaissent dans `02-grammaire-conversationnelle.md`
   lignes 101-102, à l'intérieur d'une section *« Surtout pas : »* qui
   liste des phrases interdites comme exemples en négation. Ce sont des
   anti-modèles cités pour être bannis, jamais des phrases prononcées
   par Creative Fair.

5. **Aucune ligne de code application** modifiée. Validation :
   ```
   git diff sprint-36-c-2 --stat
   → uniquement docs/sprint-37/* et audits/sprint-37-spec/*
   ```

## Notes d'implémentation

- Le brief mentionne 7 livrables (01-07) puis ajoute *08-plan-execution.md*
  + *README.md* + *audits/*, soit 8+ docs au total. Compté comme une
  même feuille de route. Numérotation finale : 01-08.

- La doctrine v60 est rappelée en intro de chaque doc où c'est
  pertinent (notamment 02 grammaire et 04 prompts). Redondance
  intentionnelle pour qu'un futur lecteur puisse plonger dans un seul
  doc sans tout relire.

- Le format JSON strict de la sortie Claude (doc 04) est documenté
  comme contrat technique stable. Tout changement ultérieur nécessite
  une migration des prompts système, pas un patch ad hoc.

- Les 24 arbitrages "À ARBITRER LEAD" sont consolidés dans le
  `README.md` de la spec. Index unique pour le Lead.
