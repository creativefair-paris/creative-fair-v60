# Sprint 36.B.3 — Journal des écarts et abandons

## 2026-05-12 — Pré-vol : branche basée sur sprint-36-b-2 et non sur main

**Constat.** Le spec V1 mentionne `main HEAD = 8cba9ad (merge sprint-36-b-1)`
et V4 demande `git checkout main && git checkout -b sprint-36-b-3`. Or :

- main est bien à `8cba9ad` (v1.5.0).
- sprint-36-b-2 est en avance de 5 commits et contient les sheets
  Piliers / Calendrier / Ressources / Objectifs que le LOT 2 prévoit
  explicitement de patcher ("déjà existante, à modifier").
- sprint-36-b-2 a été poussée sur origin mais pas mergée sur main
  (validation Lead pendante).

**Décision.** Brancher sprint-36-b-3 sur sprint-36-b-2 (HEAD `94825b4`)
plutôt que sur main. Sans cela, les patches du LOT 2 portent dans le vide
et le pattern "14 rangs" prévu par le LOT 1.6 ne peut pas réutiliser les
4 blocs déjà construits.

Aucune fusion vers main, aucune modification du tag v1.5.0, aucun push.
Le filet de sécurité reste intact : `git checkout main` revient à v1.5.0.

