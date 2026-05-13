# Sprint 36.I — Décisions et écarts au brief

Patch correctifs UX post-onboarding doctrinaux. Doctrine
"Tranquillité du pilote, pas contemplative".

Branche : `sprint-36-i` (départ : `main` @ 82ce3c0)
7 commits atomiques, un par finding. Pas de push, pas de tag.

---

## F1 — Fallback narratif si pas de post du jour

**Commit** `feat(aujourd-hui): fallback narratif si pas de post du jour (F1)`

**Fichiers touchés**
- [app/(aujourd-hui)/aujourd-hui/page.tsx](../../app/(aujourd-hui)/aujourd-hui/page.tsx)

**Décisions**
- Logique appliquée dans les deux blocs comme demandé : Bloc 1
  "Prochaine action" (colonne gauche) et Bloc A "Aujourd'hui,
  [date]" (colonne droite).
- Source du "prochain post" : `data.postsWeek[0]` — déjà
  ordonné par `date_prevue ASC, heure_prevue ASC` par le loader
  (Sprint 36.G). Pas de requête supplémentaire.
- Helper utilisé : `nomDuJourFr()` (existant Sprint 36.C) qui
  retourne le jour FR en minuscule via `Intl.DateTimeFormat`.

**Aucun TODO laissé.**

---

## F2 — TaskRow "Affiner avec le Conseiller" + pastille contrastée

**Commit** `fix(aujourd-hui): clarifier CTA TaskRow et hover row (F2)`

**Fichiers touchés**
- [components/today/TaskRow.tsx](../../components/today/TaskRow.tsx)
- [components/ui/state-circles/StateCircle.tsx](../../components/ui/state-circles/StateCircle.tsx)

**Décisions**
- Hover row déjà en place (Sprint 36.H) : `onMouseEnter` qui
  bascule le background à `rgba(0,0,0,0.02)`. Brief demandait
  "ajouter un hover sur la row entière" — déjà fait, laissé tel
  quel.
- Pastille statut : 8px conservé. Anneau ajouté via
  `box-shadow: 0 0 0 1px rgba(0,0,0,0.10)`. Le check ✓ pour
  l'état "published" n'est pas modifié (déjà bien lisible).
- Routage `/outils/conseiller?context=post_<id>` (route existante)
  — pas de TODO.

**Aucun TODO laissé.**

---

## F3 — Suppression mock signal de veille

**Commit** `feat(aujourd-hui): supprimer mock signal de veille (F3)`

**Fichiers touchés**
- `lib/mocks/daily-signal.ts` (supprimé)
- [lib/aujourd-hui/load-data.ts](../../lib/aujourd-hui/load-data.ts)
- [app/(aujourd-hui)/aujourd-hui/page.tsx](../../app/(aujourd-hui)/aujourd-hui/page.tsx)
- [components/today/SuggestedSignal.tsx](../../components/today/SuggestedSignal.tsx) (marqué DEPRECATED)

**Décisions**
- Le slot disparaît totalement de l'UI (pas de fallback "Aucun
  signal" — brief explicite).
- Le composant `SuggestedSignal.tsx` est conservé tel quel avec
  un commentaire d'en-tête DEPRECATED. Sprint 37 le réutilisera
  via les Task Forces. Si Sprint 37 ne le réutilise pas, le
  fichier pourra être supprimé sans risque.
- Champ `dailySignal: DailySignal | null` conservé sur
  `AujourdhuiData` (toujours `null` désormais) pour éviter de
  casser le type retourné. Sprint 37 le repeuplera.

**Aucun TODO laissé.**

---

## F6 — Bannière contextuelle piliers narratifs

**Commit** `feat(ma-marque): bannière contextuelle piliers + CTA Conseiller (F6)`

**Fichiers touchés**
- [components/ma-marque/piliers/PiliersBanner.tsx](../../components/ma-marque/piliers/PiliersBanner.tsx) (nouveau)
- [components/ma-marque/piliers/PiliersSheet.tsx](../../components/ma-marque/piliers/PiliersSheet.tsx)

**Écart au brief**
- Le brief mentionne "la page Piliers narratifs" (`app/(ma-marque)/ma-marque/piliers/page.tsx`)
  et un emplacement "sous le fil d'Ariane Ma Marque > Piliers narratifs,
  avant le H1".
- Réalité du code : il n'existe **pas** de page dédiée — les
  piliers sont rendus dans une Sheet (`PiliersSheet`) ouverte
  depuis le dashboard `Ma Marque`. La Sheet a déjà son propre
  breadcrumb + H1 (gérés par `SheetMaMarque`).
- Décision : injecter le composant `PiliersBanner` en tête du
  context column (40% gauche) de la Sheet, juste avant
  `PiliersContext`. Cela respecte l'intention doctrinale
  (rationnel visible + CTA Conseiller au-dessus de l'édition)
  sans toucher au shared component `SheetMaMarque` (qui sert à
  8+ autres sheets).
- L'intro existante de la Sheet ("Tes 3 piliers narratifs…")
  reste — la bannière la complète, ne la remplace pas.

**TODO laissé**
- CTA "Reprendre avec le Conseiller →" pointe vers
  `/outils/conseiller` sans paramètre. Le Sprint 37 (flux
  conversationnel) ajoutera un contexte pré-rempli mode
  "reprise piliers narratifs". Commenté dans le fichier
  `PiliersBanner.tsx`.

---

## F7 — État vide Benchmarks engageant

**Commit** `feat(ma-marque): état vide benchmarks engageant (F7)`

**Fichiers touchés**
- [components/ma-marque/benchmarks/SheetBenchmarks.tsx](../../components/ma-marque/benchmarks/SheetBenchmarks.tsx)

**Décisions**
- Texte appliqué tel que demandé.
- Couleur changée de `--color-tertiary-label` (gris faible) à
  `--color-secondary-label` (gris moyen) ; italique retiré — le
  ton engageant ne doit plus être perçu comme une note
  discrète.
- Label "Niveau d'exigence" et bouton "Ajouter une marque"
  inchangés.

**Aucun TODO laissé.**

---

## F8 — Page Mes Outils en 40/60

**Commit** `feat(outils): refonte page Mes Outils en 40/60 liste + preview (F8)`

**Fichiers touchés**
- [components/outils/CatalogueOutils.tsx](../../components/outils/CatalogueOutils.tsx)

**Décisions**
- Composant migré de Server Component vers Client Component
  (état local `selectedId` requis pour le pattern liste +
  preview). La page `app/(outils)/outils/page.tsx` reste server.
- Layout via `SplitBrief` existant (cf. /aujourd-hui) avec
  `mobileOrder="left-first"` : sur mobile, la liste reste en
  haut et la preview passe en dessous (cohérent avec brief).
- Item sélectionné : fond `glass-thin` (Liquid Glass niveau 1).
  Hover non-sélectionné : `rgba(0,0,0,0.03)`. Transition
  background 200ms ease-out.
- CTA "Ouvrir [Nom]" : style pill noir `var(--color-label)` →
  `var(--color-background)`. Aligné avec le CTA de Bloc 1
  "Prochaine action" (cohérence visuelle).
- 5 descriptions rédigées tel que brief.
- `components/ui/ListCell.tsx` reste — n'est plus utilisé par
  CatalogueOutils mais c'est un primitive générique. Pas de
  suppression hors scope.

**Aucun TODO laissé.**

---

## F9 — Suppression toggle Programme/Outils dans menu

**Commit** `refactor(menu): supprimer toggle Programme/Outils redondante (F9)`

**Fichiers touchés**
- [components/layout/UserMenuBubble.tsx](../../components/layout/UserMenuBubble.tsx)
- [components/layout/UserMenuTrigger.tsx](../../components/layout/UserMenuTrigger.tsx)
- [app/globals.css](../../app/globals.css)

**Décisions**
- Toggle + divider associé retirés du menu.
- Props `currentMode` et `onToggleMode` supprimées du contrat
  `UserMenuBubble`.
- Dans `UserMenuTrigger` : `detectMode`, `handleToggleMode`,
  `usePathname` supprimés (plus utilisés).
- CSS `.cfs-user-menu-toggle-wrapper` retirée de globals.css.
- Le primitive `components/layout/Toggle.tsx` est conservé : il
  n'est plus utilisé par le menu mais reste consommé par
  `components/layout/ProgrammeOutilsToggle.tsx` (composant
  orphelin lui aussi, mais hors scope F9 — la subtraction
  doctrinale ne dit pas d'aller chasser tout le code mort).

**Aucun TODO laissé.**

---

## Résumé

- 7/7 findings traités.
- 0 finding bloqué.
- 1 écart au brief documenté (F6 : pas de page, c'est une Sheet).
- 1 TODO laissé (F6 : pré-contexte Conseiller, attendu Sprint 37).
- 0 dépendance manquante.
- Pas de typecheck ni de build lancés en local (node
  indisponible dans cet environnement). Le Lead doit valider
  via CI ou au moins `tsc --noEmit && next build` avant merge.

## Recommandation au Lead

Avant merge :
1. `pnpm tsc --noEmit` (ou équivalent npm/yarn).
2. `pnpm next build`.
3. Test smoke en local sur /aujourd-hui, /ma-marque (ouvrir
   sheet Piliers + sheet Benchmarks), /outils, menu utilisateur.
4. Vérifier que la bannière piliers se masque bien via X et que
   la préférence persiste au rechargement de page.
