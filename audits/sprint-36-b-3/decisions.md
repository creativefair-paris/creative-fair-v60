# Sprint 36.B.3 — Décisions architecturales

Branche `sprint-36-b-3` (basée sur `sprint-36-b-2` HEAD `94825b4`).

## Cadre doctrinal rappelé

- Palette : `#007AFF` + lilas + indigo + orange + pastels doux. `#1F4937` déprécié, ne pas en introduire.
- Anti-gamification absolue. Pas de pourcentage chiffré global. Score qualitatif acceptable.
- Voix : tutoiement partenaire complice. Pas d'exclamation, pas d'emoji.
- Pas de `window.confirm()`. Sheets bottom Apple-grade partout.
- Liquid Glass iOS 26 (`backdrop-filter`, 3 depth levels, fallback `@supports`, `prefers-reduced-motion`).
- Jamais "IA" — toujours "Creative Fair".

## Périmètre

- LOT 1 — Refactor `/ma-marque` en 14 rangs, 6 nouveaux blocs, migration 009.
- LOT 2 — Patches sheets existantes (Piliers, Calendrier, Ressources) + wrapping toutes sheets.
- LOT 3 — Refactor `/programme` en Split Brief 40/60.

