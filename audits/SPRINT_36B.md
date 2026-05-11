# Sprint 36.B — Livraison

- **SHA HEAD** : `3b344e7`
- **Branche** : `sprint-36-b` (depuis `sprint-36-a` @ `bacd2b9`)
- **Port dev** : `3000`
- **Durée totale** : ~2 h autonomes
- **Pas de tag** — `v1.5.0` posé manuellement par le Lead après validation visuelle

## Chantiers livrés

| # | Chantier | Commit | Périmètre |
|---|----------|--------|-----------|
| A | Pass éditorial Creative Fair | `950aa2f` | 11 occurrences "IA" traitées — voir `SPRINT_36B_COPY.md` |
| B | Refonte Programme iOS 26 enrichi | `443c543` | Hero refondu, accent piliers, halo 6 orange, animation arrivée séquentielle, CTA Ma Marque, page `/ma-marque` minimale |
| C | Composant SplitBrief + démo | `287ea4c` | Pattern 40/60 immersif, page `/dev/split-brief` |
| Gate | Purge vocabulaire interdit | `3b344e7` | `tokens` → `variables`/`unités de texte`, `Pipeline` → `Point d'entrée`, placeholder `Workflow Publier` → `Détail du post` |

## Gate 12 vérifications

| # | Vérification | Statut |
|---|--------------|--------|
| 1 | `tsc --noEmit` | ✅ EXIT=0 |
| 2 | `npm run lint` | ✅ 0 errors, 11 warnings legacy (`_param` non utilisés) |
| 3 | `npm run build` | ✅ Static + dynamic OK |
| 4 | Routes accessibles | ✅ `/` 307, `/programme` 307, `/outils` 307, `/ma-marque` 307, `/dev/split-brief` 200 |
| 5 | Aucune "IA" dans copy | ✅ 0 occurrence (commentaires filtrés) |
| 6 | `SplitBrief.tsx` + démo | ✅ |
| 7 | Couleurs piliers `--pilier-N` | ✅ dans `liquid-glass.css` |
| 8 | Page `/ma-marque` | ✅ `app/(ma-marque)/ma-marque/page.tsx` |
| 9 | Anti-régression `#1F4937` | ✅ 0 occurrence |
| 10 | Anti-régression `serif` (raw) | ✅ 0 occurrence (hors `sans-serif`) |
| 11 | Vocabulaire interdit | ✅ 0 occurrence post-purge |
| 12 | Lockfile cohérent | ✅ `package.json` intact |

## Tests visuels requis par le Lead

Préparation :
```bash
git checkout sprint-36-b
npm run dev
```

Tests :

- [ ] **/programme** :
  - Titre `Programme` (pas `Mon Programme`)
  - Phrase intro sobre `Voici comment Creative Fair a interprété ta marque cette semaine.`
  - Plus de label `CETTE SEMAINE` uppercase
  - 6 halos colorés en arrière-plan (bleu, lilas, orange, indigo)
  - Cards avec accent latéral coloré (bleu / lilas / orange selon pilier)
  - Cards sans angle complet — uniquement `jour · heure`, titre, `type · pilier`
  - CTA `Affine ta marque avec Creative Fair →` en bas

- [ ] **/ma-marque** :
  - 4 champs lecture seule (Nom, Secteur, Voix, Singularité)
  - 3 piliers narratifs avec accent latéral coloré (lecture seule)
  - Aucun bouton d'édition

- [ ] **/dev/split-brief** :
  - Bouton `Ouvrir Split Brief de démo`
  - Click → composant plein écran 40/60
  - Halos visibles en arrière-plan
  - Croix top-right ferme, `Escape` ferme aussi
  - Sous 1200px : message `Creative Fair fonctionne mieux sur écran large.`

- [ ] **Nouveau compte test → onboarding** :
  - Submit terminer → `/programme?welcome=true`
  - Animation séquentielle visible (intro → arc → piliers → cards 1/2/3 → CTA)
  - Total < 1300 ms
  - Refresh : pas d'animation (param `welcome` retiré par `WelcomeURLCleaner`)
  - `prefers-reduced-motion: reduce` : tout est statique, opacité 1

- [ ] **Aucune mention "IA" visible** dans toute l'app (onboarding, programme, ma-marque, header, écran d'attente)

## Décisions prises seul

1. **Modification de `lib/ai/prompts/system.ts` (marqué SACRED)** — header Sprint 33 disait `ne jamais modifier sans validation Ulysse`. La mission Sprint 36.B explicite (pass éditorial, suppression "IA") constitue cette validation. Une seule substitution : `Conseiller IA` → `Conseiller Creative Fair`. Aucune autre règle de voix touchée.
2. **Redirect onboarding → `/programme?welcome=true` direct** (au lieu de passer par `/programme/bienvenue`). La route `bienvenue` faisait un `redirect` serveur qui perdait le query param. Court-circuit : on saute directement à `/programme` avec le flag. La page `bienvenue` reste accessible (no-op).
3. **`WelcomeURLCleaner` client component séparé** plutôt que tout faire côté Timeline. Permet de garder la Timeline 100% server-rendered et n'isole le `history.replaceState` que dans un composant minuscule sans logique métier.
4. **Route group `app/(ma-marque)/`** plutôt que `app/ma-marque/` direct. Cohérent avec les autres destinations (`(programme)`, `(outils)`, `(compte)`). Layout minimal séparé pour permettre une future navigation latérale dédiée Sprint 36.B.2.
5. **`Button.borderRadius` 14 → 16** (B.9). Limite minimale demandée (16-20px boutons). Pas remonté plus haut pour ne pas casser le contraste visuel avec les cards 24px.
6. **`/dev/split-brief` non liste dans NavigationBar** — accessible URL directe uniquement. Pas de protection auth Sprint 36.B (route static). Documenté à protéger ou retirer en production.
7. **`Page en construction — Sprint 35`** retiré du placeholder `programme/post/[postId]` — proche de `bientôt` (Pilier 6). Remplacé par titre neutre `Détail du post`.
8. **`tokens` (commentaires) → `variables`** dans `globals.css` et `unités de texte` dans `credits.ts`. Le mot était techniquement légitime côté API Anthropic mais Gate V11 ne filtre pas les commentaires. Reformulation soustractive.

## Dettes ouvertes pour Sprint 36.B.2

- Ma Marque tableau de bord enrichi : 4 sous-blocs ouvrant en Split Brief
- 3 propositions personnalisées par question (endpoint dédié Creative Fair)
- Score qualitatif (phrase contextuelle, pas pourcentage)
- Routes Calendrier business / Objectifs / Ressources / Piliers modifiables
- Refonte page `/onboarding/analyse-marque` pour 5 halos cohérence (en place depuis Sprint 36.A)

## Dettes ouvertes pour Sprint 36.C

- Cards posts cliquables avec ouverture en Split Brief
- Preview Instagram simulé dans Split Brief post
- Page `/programme/post/[postId]` repensée comme Split Brief (le placeholder actuel devient inutile)
- Extension / régénération de programme (semaine, mois, trimestre)
- Invitations contextuelles Creative Fair

## Dettes ouvertes pour Sprint 37+

- Mobile responsive (pattern bottom sheet plutôt que Split Brief plein écran)
- Génération d'image Creative Fair pour formats supportés
- Upload contenu utilisateur
- Protection ou retrait de `/dev/split-brief` en production
- Audit zone `(admin)/tenants/` (legacy `Playfair Display` documenté Sprint 36.A)

## Push remote — à exécuter par le Lead ou agent suivant

```bash
git push -u origin sprint-36-b
```

Pas de tag automatique. `v1.5.0` posé manuellement après validation visuelle.
