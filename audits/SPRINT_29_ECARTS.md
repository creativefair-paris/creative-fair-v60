# Sprint 29 — Analyse des écarts
# Prod vs Documents canoniques — 2026-05-07

> Phase 2 — Lecture seule. Diagnostic uniquement.
> Chaque problème est croisé avec le pilier Apple concerné,
> le symptôme observable, la cause probable, et les fichiers impactés.

---

## Méthode

Croisement entre :
1. `audits/SPRINT_29_INVENTAIRE.md` — état réel du code (Phase 1).
2. `audits/APPLE_AUDIT_FINAL.md` — score 61/80, recommandations post-audit.
3. `audits/SPRINT_27_BUGS.md` — bugs P1/P2 ouverts.
4. Les 8 piliers Apple définis dans `skills/cfs-apple-audit`.

---

## Tableau des 8 problèmes observés

| # | Pilier | Règle canonique violée | Symptôme observable | Cause probable | Fichiers impactés |
|---|---|---|---|---|---|
| 1 | Pilier 3 — Time-to-Wow | Le coaching du jour doit s'afficher sans friction. Pas de "0 crédits ce mois" visible avant que la marque soit utile. | `CreditsIndicator` affiche "0 crédits ce mois" dès le premier login, même si brand incomplète. Charge cognitive inutile : l'utilisateur voit une métrique sans contexte. | La props `creditsTotal` est toujours transmise au `Header` depuis `layout.tsx`, sans condition sur `brand_book_status`. | `components/layout/CreditsIndicator.tsx`, `app/(app)/layout.tsx` |
| 2 | Pilier 4 — Aspirational Storytelling | Vocabulaire humain. Zéro répétition. Chaque mot gagne sa place. | L'eyebrow "Ma marque" sur `/ma-marque` répète ce que la sidebar / bottom nav indique déjà. L'eyebrow tenant sur `/aujourdhui` répète le nom de la marque visible dans la nav. | Copy par défaut du Sprint 9 jamais challengé sur la redondance. Sprint 28 a corrigé les mots interdits mais pas les doublets structurels. | `app/(app)/aujourdhui/page.tsx` ligne 112, `app/(app)/ma-marque/page.tsx` ligne 46 |
| 3 | Pilier 4 — Aspirational Storytelling | Ton tranquillité : affirmatif, jamais fataliste. Ne pas constater un manque comme une fatalité. | `NextAction` affiche "En toute tranquillité — tu avances à ton rythme." quand l'utilisateur n'a rien planifié. La phrase constate un vide au lieu d'ouvrir une possibilité. | Copy Sprint 9, conservé lors de l'audit Sprint 28 (focus sur mots interdits, pas sur la tonalité fataliste). | `components/aujourdhui/NextAction.tsx` ligne 46 |
| 4 | Pilier 6 — Uncompromising Polish | Zéro état vide non conçu. Chaque surface a son empty state intentionnel. | Pas de composant `EmptyStateBrand` unifié. Aujourd'hui, Calendrier, Ma marque, Conseiller gèrent chacun leur état no-brand différemment (ou pas du tout). Le Conseiller n'a aucun guard. | La garde no-brand a été ajoutée au niveau layout et auth/callback (Sprint 27 + fix v1.0.1) mais les composants-feuille n'ont pas de fallback local. | `components/ui/` (absent), `components/conseiller/ConseillerLayout.tsx`, `components/calendar/CalendarView.tsx`, `components/aujourdhui/CoachingGenerator.tsx` |
| 5 | Pilier 8 — Out of the Box Experience | Le premier contact avec le Conseiller doit être honnête : si la marque n'est pas définie, l'IA n'a rien à apporter. | `/conseiller` charge `ConseillerLayout` avec un chat vide sans context — pas d'empty state no-brand. L'utilisateur peut envoyer un message et obtenir une réponse générique non contextualisée. | `conseiller/page.tsx` et `ConseillerLayout` ne vérifient pas `brand_book_status`. La garde layout redirige vers `/ma-marque/onboarding` si pas de brand row, mais si brand row existe avec `brand_book_status = 'incomplete'`, le chat est accessible sans contexte utile. | `app/(app)/conseiller/page.tsx`, `components/conseiller/ConseillerLayout.tsx` |
| 6 | Pilier 1 — Human Interface & Craftsmanship | Cohérence visuelle absolue. Un seul langage de surface dans le produit. | 14 composants métier utilisent `backgroundColor: 'var(--color-surface)'` inline au lieu de `.glass-z2`. Le chrome (Header/Sidebar/BottomNav) parle Liquid Glass ; les cartes contenu parlent encore CSS inline. | Sprint 26 a migré le chrome uniquement. La migration des composants métier a été planifiée en "V2 cosmétique progressif" (SPRINT_26_LIQUID_GLASS.md). | `components/aujourdhui/CoachingCard.tsx`, `components/aujourdhui/CoachingGenerator.tsx`, `components/calendar/NewPostModal.tsx`, `components/conseiller/ConseillerChat.tsx`, etc. (14 fichiers listés dans SPRINT_26) |
| 7 | Pilier 2 — Frictionless Ecosystem | L'outil doit savoir où en est l'utilisateur et adapter la surface en conséquence. | Le thème par défaut produit un `--color-primary` = `#1F4937` (vert forêt) partout, y compris sur l'eyebrow Aujourd'hui. Or l'eyebrow utilise `var(--color-primary)` (alias de `accent`) — si un tenant n'a pas de thème personnalisé, la couleur accent apparaît en eyebrow de label informatif (rôle secondaire confondu avec rôle d'accentuation). | `apply-theme.ts` mappe `--color-primary` sur `accent` pour compat Tailwind. L'eyebrow devrait utiliser `var(--color-text-muted)` non `var(--color-primary)`. | `app/(app)/aujourdhui/page.tsx` ligne 112 (`color: 'var(--color-primary)'`), `app/(app)/ma-marque/page.tsx` ligne 46 (idem) |
| 8 | Pilier 5 — Transparent Value Exchange | Ne jamais afficher une métrique dont l'utilisateur ne comprend pas la valeur. "0 crédits" sans repère de quota est une métrique opaque. | Aucun seuil d'alerte (80% / 95%) ni de quota visible. Mais plus immédiatement : "0 crédits ce mois" en header dès l'onboarding est perturbant et sans valeur. | Bug P2 #206 ouvert mais jamais addressé. Le fix minimal (masquer si 0) est distinct du fix complet (alertes seuil). | `components/layout/CreditsIndicator.tsx` |

---

## Synthèse des causes profondes

### Cause racine A — Migration Liquid Glass incomplète (Pilier 1)
Sprint 26 a posé les fondations mais la migration est explicitement déclarée "V2 progressif". Résultat : deux langages visuels coexistent. Le chrome respire, les cartes contenu restent opaques.

**Impact** : dissonance perçue dès l'ouverture de n'importe quelle page métier.

### Cause racine B — Copy jamais challengé sur la tonalité post-Sprint 9 (Pilier 4)
Sprint 28 a ciblé les mots interdits et l'anglicisme "Audience". La phrase "En toute tranquillité — tu avances à ton rythme." a passé le filtre car elle n'utilise aucun mot interdit. Mais elle émet un jugement sur le rythme de l'utilisateur — c'est exactement ce que le ton tranquillité doit éviter.

**Impact** : petit bruit fataliste sur la page la plus vue (Aujourd'hui).

### Cause racine C — Logique de visibilité des crédits jamais conditionnée (Piliers 3, 5)
`CreditsIndicator` est monté inconditionnellement dans le Header depuis Sprint 11. La logique de condition (`brand_book_status = 'complete'` ET `creditsTotal > 0`) n'a jamais été ajoutée.

**Impact** : "0 crédits ce mois" visible dès le premier écran post-login — charge cognitive sans valeur.

### Cause racine D — Eyebrows structurellement redondants (Pilier 4)
L'eyebrow pattern (petit label uppercase au-dessus du titre H1) sert à contextualiser une page dans un système plus large — utile quand la navigation n'est pas visible (ex: email, PWA). Dans un layout avec sidebar / BottomNav toujours visibles, l'eyebrow "Ma marque" est redondant. L'eyebrow nom-du-tenant sur Aujourd'hui l'est aussi : le login est tenant-spécifique par construction.

**Impact** : densité d'information en surface sans valeur ajoutée.

### Cause racine E — Guard no-brand au mauvais niveau d'abstraction (Piliers 6, 8)
La garde "pas de brand row" est implémentée au niveau layout (redirect vers `/ma-marque/onboarding`). Mais un utilisateur dont la brand row existe avec `brand_book_status = 'incomplete'` accède au Conseiller sans contexte de marque — il obtient des réponses génériques sans signal. L'état honnête "Avant de continuer, configure ta marque" manque au niveau composant.

**Impact** : expérience trompeuse au premier contact avec le Conseiller.

---

## Recommandations Phase 3 (ordre d'exécution)

Les 7 corrections sont ordonnées du plus impactant au plus local :

1. **`fix(theme)`** — Confirmer `#1F4937`. Vérifier `var(--color-primary)` vs `var(--color-text-muted)` sur eyebrows.
2. **`fix(liquid-glass)`** — Migrer les composants de contenu les plus visibles (CoachingCard, CoachingGenerator, ConseillerChat) vers `.glass-z2`.
3. **`feat(empty-states)`** — Créer `components/ui/EmptyStateBrand.tsx` — composant unifié réutilisé par Aujourd'hui, Calendrier, Ma marque, Conseiller.
4. **`fix(copy)`** — Réécrire la ligne fataliste dans `NextAction.tsx`.
5. **`fix(eyebrows)`** — Retirer l'eyebrow Aujourd'hui et Ma marque.
6. **`fix(credits)`** — Masquer `CreditsIndicator` si brand incomplète OU crédits = 0.
7. **`fix(conseiller)`** — Ajouter état no-brand honnête dans `ConseillerLayout` quand `brand_book_status !== 'complete'`.
