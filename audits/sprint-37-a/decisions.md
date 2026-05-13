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

### F4 — Bug duplication message (cause exacte)

**Cause confirmée** : `runTurn()` populait DEUX surfaces avec le
même contenu :
1. `setCurrentReply(result.message)` qui alimentait un bloc de
   rendu séparé `<ConseillerBubblesFromText text={currentReply} ...>`
2. `setHistory(prev => [...prev, { role: 'conseiller', content: ... }])`
   qui alimentait la `history.map(...)` au-dessus

Quand le state passait à non-`THINKING_*`, les DEUX rendus
étaient actifs simultanément → bulle doublée à l'écran.

**Fix** :
- Suppression complète de l'état `currentReply` (variable et
  setter).
- `history` est désormais la source UNIQUE des bulles
  conseiller.
- `currentChoices` rattaché à la dernière bulle conseiller de
  `history` (via index check `i === history.length - 1`).
- Push dans history avec garde anti-doublon (même contenu ET
  `created_at` à <500ms d'écart) — filet pour les cas exotiques.
- Anti-race : `inflightTokenRef` incrémenté à chaque tour, le
  callback rejette les résultats stale qui arriveraient après
  qu'un nouveau tour a été lancé.
- Anti-double-clic : `lastSubmitAtRef` debounce 300ms côté
  `handleSubmit`.

Pas d'AbortController explicite ajouté — la server action
non-streamée n'a pas de stream à abort. L'effet équivalent est
atteint par le `inflightTokenRef` (les setters sont gardés
côté client).
