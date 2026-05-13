# Sprint 37.A — Journal de décisions au fil de l'eau

Branche : `sprint-37` (mêmes commits que Sprint 37, on continue dessus).
Doctrine canonique : `docs/sprint-37/09-modele-conseiller-en-situation.md` + section 8.
Mandat Lead : 10 findings UX/UI + 4 amendements Apple, sur la même branche.

---

## Tokens visuels Apple-grade (préambule obligatoire)

Ajoutés en bloc unique à la fin de `app/globals.css` :

- `.btn-primary` — CTA majeur (`#007AFF`, 5 états)
- `.btn-choice` (+ variante `.btn-choice-sm`) — secondaire / boutons-choix
- `.btn-send-inactive` / `.btn-send-active` — bouton envoyer du chat
- Palette statuts : `--status-draft`, `--status-published`,
  `--status-archived`, `--status-pending` + `.status-badge`
  modifiers
- `.segmented-control` — pattern iOS (Bibliothèque F9)
- `.bulle-conseiller` — line-height 1.6, spacing entre paragraphes

Tous les composants Sprint 37.A doivent s'y référer. Pas
d'invention locale.

---

## Findings en cours

(Rempli au fil de l'eau, un § par finding.)
