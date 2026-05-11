# Sprint 35 — Rapport de mission

**Branche :** `sprint-35`
**Tag visé :** `v1.4.0`
**Base :** `main` (commit `6d25140`, Sprint 34 final)
**Date :** 2026-05-11
**Mode :** Exécution autonome (sans validation humaine intermédiaire)

---

## Périmètre exécuté

### Chantier A — Page Programme état vide
- `app/(programme)/programme/page.tsx` réécrite en Server Component
- Auth chain : `getUser()` → `profiles.tenant_id` → `getBrandByTenantId()` → redirect `/login` ou `/onboarding/analyse-marque` selon état
- 5 halos atmosphériques (`bg-halo-1` à `bg-halo-5`)
- `NavigationBar` avec `trailing={<ProgrammeOutilsToggle />}`
- Empty state Apple-strict : `<h1>` Large Title 28px + paragraphe Body 17px + bouton désactivé "Générer mon programme"
- Aucune donnée factice, aucun placeholder, aucune référence temporelle visible

### Chantier B — Page Outils catalogue + 5 sub-pages stub
- `app/(outils)/outils/page.tsx` réécrite en Server Component (auth chain identique, 5 halos, NavigationBar + Toggle)
- `components/outils/CatalogueOutils.tsx` créé : 5 `ListCell` (Post Creator, Moodboard, Variations, Reviews, Conseiller) avec icônes SVG inline 44×44 glass-thin radius 10, chevron, description secondaire
- `components/ui/ListCell.tsx` étendu avec prop `description?: ReactNode`
- `app/globals.css` — règles `.cfs-list-cell` (transparent over halos, min-height 60px), `.cfs-list-cell__content`, `.cfs-list-cell__description`, `.cfs-outil-link`
- 5 sub-pages (`post-creator`, `moodboard`, `variations`, `reviews`, `conseiller`) refactorisées en **stub titre seul** (Pilier 6 strict : pas de paragraphe, pas de "page en construction", aucune référence temporelle)
- 10 composants v1 conservés intacts dans `components/outils/` avec marker `// SUPPRESSION CANDIDATE Sprint 36`

### Pré-vol (étape 0)
- Polyfill `timeout` perl-based ajouté à `scripts/env.sh` (macOS sans coreutils)
- 3 artefacts d'une mission antérieure (Sprint 32.5+33 avorté) archivés sous suffixe `_sprint-32-5-33_2026-05-11.md`, contenu préservé
- Note `audits/SPRINT_35_PREFLIGHT_NOTE.md` documente les deux décisions

---

## Gate — 10 vérifications

| # | Vérif | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | ✅ EXIT=0 |
| 2 | `npm run lint` (eslint) | ✅ EXIT=0 (11 warnings préexistants `_*` unused vars, 0 errors) |
| 3 | `npm run build` (production) | ✅ EXIT=0, toutes routes présentes |
| 4 | Routes `/`, `/programme`, `/outils`, `/outils/{post-creator,moodboard,variations,reviews,conseiller}` | ✅ 8/8 HTTP 200 après follow redirect |
| 5 | Halos sur `/programme` + `/outils` | ✅ 5 halos chaque (static-source check, runtime exige auth) |
| 6 | Anti-régression vert forêt `#1F4937` | ✅ 0 match |
| 7 | Anti-régression `serif` raw | ✅ 0 match Sprint 35 (matches préexistants admin tenants intacts) |
| 8 | Vocabulaire interdit (Pipeline, Dashboard, Workflow, Widget, Boost, Viral, Growth hack) | ✅ 0 match Sprint 35 |
| 9 | `Bientôt\|bientot\|coming soon\|soon\b` UI visible | ✅ 0 match Sprint 35 |
| 10 | Lockfile / package.json non modifiés | ✅ 0 diff vs `main` |

---

## Commits

```
a7cc5a8 feat(outils): catalogue 5 outils Apple-strict (Sprint 35 — Chantier B)
38d517c feat(programme): page état vide Apple-strict (Sprint 35 — Chantier A)
206ebb5 chore(infra): polyfill timeout macOS + archive artefacts Sprint 32.5+33
```

---

## Décisions prises seul (à valider par le Lead a posteriori)

1. **Cahier §5.1 vs prompt Sprint 35** — Le cahier mentionne une "grille de cartes" pour le catalogue Outils ; le prompt impose `ListCell`. J'ai suivi le **prompt** (mission > référence cahier) car `ListCell` est plus iOS-natif et plus cohérent avec le reste de l'app (TableView style).
2. **Empty state `Programme` — bouton désactivé** — Le bouton "Générer mon programme" est rendu mais `disabled`. Pas de tooltip explicatif visible (aurait introduit une référence temporelle).
3. **Markers `// SUPPRESSION CANDIDATE Sprint 36`** — Marqueurs internes (commentaires), pas visibles UI : aucune violation Pilier 6. Permet une suppression chirurgicale au Sprint 36.
4. **Archive des artefacts Sprint 32.5+33** — Mission antérieure avortée. Suffixe daté `_sprint-32-5-33_2026-05-11.md`, contenu préservé pour traçabilité (préféré à `git rm`).
5. **Sub-pages stub titre seul** — `<h1>{Nom}</h1>` dans un `<main>` sans halos, sans NavigationBar. Choix : un titre seul affirme l'existence sans mentir sur la complétude (lecture stricte du Pilier 6). Le retour vers `/outils` se fait via swipe back natif iOS / navigation header browser.

---

## Port checklist (pour le Lead à l'ouverture)

1. `cd /Users/ulysselemoine/Desktop/creative-fair-v60`
2. `git checkout sprint-35`
3. `source scripts/env.sh` (charge timeout polyfill)
4. `npm run dev` puis ouvrir `http://localhost:3000/programme`
5. Valider visuellement :
   - 5 halos visibles, fond clair
   - Toggle Programme/Outils en haut à droite, état "Programme" sélectionné
   - Empty state : Large Title + paragraphe + bouton désactivé
6. Cliquer "Outils" → 5 cellules avec icônes 44×44, descriptions secondaires, chevrons droite
7. Cliquer chaque sub-page → titre seul, retour swipe back
8. Si visuel validé : `git push -u origin sprint-35 && git push origin v1.4.0`
