# Sprint 36.A — Flux inversé Marcus — Rapport final

**Branche** : `sprint-36-a`
**Base** : `main` @ `2212017` (post-Sprint 35 v1.4.0)
**Commits** : 4 (A → B → C → D)
**Statut** : Code prêt. Validation visuelle Lead requise avant tag `v1.5.0` + push.

---

## Chantiers livrés

| Chantier | Commit | Périmètre |
|----------|--------|-----------|
| A — Migrations | `26f3fcd` | `006_posts.sql` + `007_brands_extension.sql` |
| B — Onboarding 4Q | `3757bcb` | 4 questions essentielles (`nom`/`secteur`/`ton`/`singularite`), écran d'attente halo pulse |
| C — Endpoint + IA | `2b2c74d` | `POST /api/onboarding/complete` + génération Claude Opus 4-5 (fallback 4-1) |
| D — Timeline | `60369b1` | `HeroSemaine`, `PostCard`, `Timeline`, page `bienvenue`, refonte `/programme` |

---

## Action Lead avant validation visuelle — appliquer migrations 006 + 007 (60s)

Les migrations Sprint 36.A ne sont **pas encore appliquées** en base. Étapes :

1. Ouvrir **Supabase Studio → SQL Editor** pour le projet du tenant test
2. Copier-coller le contenu de `supabase/migrations/006_posts.sql` → **Run**
3. Copier-coller le contenu de `supabase/migrations/007_brands_extension.sql` → **Run**
4. Vérifier dans Table Editor :
   - Table `posts` existe avec 4 policies RLS (tenant isolation)
   - Table `brands` contient les nouvelles colonnes `secteur`, `ton`, `singularite`, `piliers_narratifs`

Le détail SQL + queries de vérification se trouve dans `audits/SPRINT_36A_MIGRATIONS.md`.

---

## Gate 12 vérifications

| # | Vérification | Statut | Détail |
|---|-------------|--------|--------|
| 1 | `tsc --noEmit` | ✅ | EXIT=0 |
| 2 | `eslint` | ✅ | 0 errors, 11 warnings (legacy stubs `_param`) |
| 3 | `next build` | ✅ | 34/34 pages générées, EXIT=0 |
| 4 | Routes HTTP | ✅ | `/`, `/login`, `/programme`, `/programme/bienvenue`, `/outils`, `/compte/ma-marque`, `/onboarding/analyse-marque`, `/api/onboarding/complete` — tous résolvent (307 redirect ou 200/405 attendu) |
| 5 | Endpoint réellement implémenté | ✅ | `POST` exporté + `GET/PUT/DELETE → 405` + smoke 401 sans auth |
| 6 | Migrations 006 + 007 présentes | ✅ | `supabase/migrations/006_posts.sql` + `007_brands_extension.sql` |
| 7 | Onboarding 4 questions | ✅ | `nom`, `secteur`, `ton`, `singularite` dans `OnboardingFlow.tsx` |
| 8 | Anti-régression vert forêt `#1F4937` | ✅ | 0 occurrence (sauf commentaire `globals.css:8`) |
| 9 | Anti-régression serif | ⚠️ | Hors zone Marcus : reliquat `Playfair Display` dans `app/(admin)/tenants/*` (legacy, surface admin) |
| 10 | Vocab interdit | ⚠️ | Reliquat `Workflow` dans `app/(programme)/programme/post/[postId]/page.tsx` (page Sprint 37, **non-accessible Sprint 36.A** — PostCard non-cliquable) |
| 11 | `ANTHROPIC_API_KEY` jamais leakée | ✅ | Lecture exclusivement via `process.env.ANTHROPIC_API_KEY` côté serveur |
| 12 | Lockfile cohérent | ✅ | `package-lock.json` présent, working tree clean post-commits |
| Bonus | 5 halos sur routes clés | ✅ | `/programme`, `/outils`, `/onboarding/analyse-marque` : 5 halos chacun |

**Résultat** : **10 verts / 2 jaunes (hors surface Marcus Sprint 36.A)** — Gate considéré passé.

---

## Décisions prises seul

1. **Migration 007 étendue** — Le prompt ne listait que `singularite` + `piliers_narratifs`, mais Chantier B référence `brands.secteur` et `brands.ton`. Décision soustractive : tout regrouper dans `007_brands_extension.sql` plutôt que créer un `008`. Documenté dans `SPRINT_36A_MIGRATIONS.md`.
2. **`brands.nom` vs `brands.name`** — Colonne DB existante = `name`. Le payload utilise `nom` (vocabulaire Marcus). Persistance via `name`, type `BrandData.nom` côté code. Aucune migration de renommage (Pilier 6 : pas de churn pour cosmétique).
3. **Type cast étroit dans route handler** — Stub `types/database.ts` permissif (`Record<string, unknown>`) faisait perdre les types sur `.from('brands').insert(...)`. Création d'un cast custom `adminBrands` dans `route.ts` pour préserver la sécurité de type sur les écritures.
4. **Écran d'attente client-side** — Halo pulse 220×220 + keyframe `halo-pulse` 3.2s avec override `prefers-reduced-motion`. Pas de spinner ni progressbar (Pilier 3 — tranquillité narrative).
5. **Modèle IA `claude-opus-4-5` + fallback `claude-opus-4-1`** — Catch ciblé sur `APIError.status === 404` pour bascule auto.

---

## Dettes ouvertes pour Sprint 36.B / 37

- **Page détail post** (`app/(programme)/programme/post/[postId]/page.tsx`) — placeholder `<h1>Workflow Publier</h1>` à remplacer. Rendre les `PostCard` cliquables (lien vers `/programme/post/[id]`) une fois la page conçue. Pilier 4 sera nettoyé en même temps.
- **Zone admin `(admin)/tenants/`** — usage `Playfair Display` legacy. Hors périmètre Marcus mais à auditer si la zone reste accessible.
- **Régénération de programme** — Sprint 36.A couvre génération initiale uniquement. L'extension hebdomadaire (`/api/programme/etendre`) reste un stub à activer Sprint 36.B.
- **Bouton "Générer mon programme"** dans empty state `/programme` — actuellement `disabled` (cohérent avec le flux inversé : la génération se déclenche depuis l'onboarding). À reconsidérer si on autorise une re-génération manuelle ultérieurement.

---

## Tests visuels à valider par le Lead

Sur dev server local (`npm run dev` après application migrations) :

1. **`/onboarding/analyse-marque` (non-auth)** — login redirect OK
2. **Onboarding 4Q post-login** — 4 questions enchaînées, transitions iOS 26, textarea/input limites de caractères respectées
3. **Submit → écran d'attente** — halo pulse + "Nous préparons ton programme." (3-4s pendant appel IA)
4. **`/programme/bienvenue`** — redirect transparent vers `/programme`
5. **`/programme` avec programme actif** — `HeroSemaine` + 3 `PostCard` verticales, glass-thin propre
6. **`/programme` sans programme actif** — empty state Sprint 35 préservé
7. **`/outils` + 5 sub-pages** — non-régression Sprint 35

---

## Prochaines étapes (après validation Lead)

```bash
git tag -a v1.5.0 -m "Sprint 36.A — Flux inversé Marcus"
git push -u origin sprint-36-a
git push origin v1.5.0
```

Le merge sur `main` reste à la discrétion du Lead.
