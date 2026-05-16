# Sprint 38 — Priorisation P0 / P1 / P2 consolidée

> Liste cross-pages de tous les findings après déduplication.
> Source : les 21 fichiers `01-` à `23-` du dossier sprint-38.
>
> Format par item :
> - **Titre** + page(s) d'origine
> - Catégorie : UI / Doctrine / Archi / Workflow / Performance
> - Effort estimé : XS (< 1h) / S (1-4h) / M (1-2j) / L (3-5j) / XL (>5j)
> - Impact : ★ à ★★★★★
> - Sprint cible suggéré : 39 / 40 / 41

---

## P0 — Bloquant (à traiter Sprint 39)

**18 items uniques après déduplication.**

### Catégorie Archi (5 items)

#### P0.A.1 — Sécuriser `updatePillar` (faille tenant_id)
- Source : `21-workflow-creation-pilier.md`, `22-workflow-creation-post.md`
- Fichier : `app/_actions/pillars.ts:167`
- Description : `.eq('id', id)` sans `.eq('tenant_id', tenantId)` via
  admin client → bypass RLS possible si un user forge un id.
- Effort : S | Impact : ★★★★★ | Sprint : **39**

#### P0.A.2 — Sécuriser `archivePillar` (idem)
- Source : `21`
- Fichier : `app/_actions/pillars.ts:196`
- Description : idem updatePillar, sur archive.
- Effort : XS | Impact : ★★★★★ | Sprint : **39**

#### P0.A.3 — Sécuriser `updatePostFields` + autres server actions post
- Source : `22`, `08-mon-programme.md`
- Fichier : à identifier — l'audit cite `updatePostFields` sans ligne
  précise. Recherche `app/_actions/*` à faire Sprint 39 startup.
- Description : mutations posts via admin sans re-filtre `tenant_id`.
- Effort : M | Impact : ★★★★★ | Sprint : **39**

#### P0.A.4 — Brancher `posts.pilier_id` FK end-to-end
- Source : `09`, `13`, `22`
- Fichiers à toucher :
  - `app/_actions/` (création post — l'action exacte à identifier)
  - `components/programme/PostEditor.tsx`
  - `components/library/*` queries
  - `app/(programme)/programme/page.tsx` rendering
  - `app/(programme)/programme/post/[postId]/page.tsx`
- Description : migration 026 a créé la FK, aucun consumer ne l'utilise.
  Le pilote continue à voir `pilier_nom` TEXT côté code.
- Effort : XL | Impact : ★★★★★ | Sprint : **39**

#### P0.A.5 — Backfill `brands.piliers_narratifs` JSONB → table `pillars`
- Source : `09`, `21`
- Description : script ponctuel à écrire dans `scripts/backfill-pillars.ts`.
  Lecture des JSONB des 3 clients pilotes (Angelina, Tous en Tête,
  Le Comptoir Général) → insertion lignes dans `pillars` avec
  `tenant_id` + `brand_id` corrects.
- Effort : L | Impact : ★★★★★ | Sprint : **39**

### Catégorie Doctrine (4 items)

#### P0.D.1 — Mettre à jour `skills/00-CONCEPT.md`
- Source : tous les audits Hélène
- Description : nav 4 → nav 5, forest green → palette v60, mention date
  validité.
- Effort : S | Impact : ★★★★★ | Sprint : **39**

#### P0.D.2 — Mettre à jour `skills/01-ARCHITECTURE.md`
- Source : tous
- Description : structure repo référencée est obsolète (`/aujourdhui`,
  `/calendrier`, `/post-creator/[postId]`). Vraies routes : `/aujourd-hui`,
  `/programme`, `/outils/post-creator`.
- Effort : S | Impact : ★★★★★ | Sprint : **39**

#### P0.D.3 — Mettre à jour `skills/10-SACRED.md`
- Source : tous
- Description : "Navigation 4 destinations" → nav 5. "Vert forêt unique"
  → palette v60.
- Effort : XS | Impact : ★★★★★ | Sprint : **39**

#### P0.D.4 — Mettre à jour `skills/04-DESIGN_SYSTEM.md`
- Source : audit Hiroshi cross-files
- Description : confirmer les 3 niveaux Liquid Glass z1/z2/z3 sont
  toujours canoniques. Ajouter section "Palette v60" explicite avec
  les hex `#FBFAF7`, `#007AFF`, lilas, indigo, orange, pastels.
- Effort : S | Impact : ★★★★ | Sprint : **39**

### Catégorie Copy / UI (5 items)

#### P0.C.1 — Retirer `#1F4937` de `app/globals.css`
- Source : `11-conseiller.md`, `23-workflow-navigation.md`
- Description : grep a confirmé `#1F4937` dans `app/globals.css`
  (référence forest green) et `components/conseiller/ConseillerIntro.tsx:143`.
- Effort : XS | Impact : ★★★★ | Sprint : **39**

#### P0.C.2 — Retirer "onboarding" de l'UI utilisateur (4 occurrences)
- Source : `03`, `04`, `05`, `06`
- Fichiers :
  - `components/onboarding-marque/BrandOnboardingSheet.tsx` aria-label
  - `components/onboarding-marque/BrandOnboardingHeaderCta.tsx` (2 labels)
  - `components/onboarding-marque/ResumeChoiceSheet.tsx` ("nouvel
    onboarding")
- Description : remplacer par "questions guidées" / "premières réponses".
- Effort : S | Impact : ★★★★ | Sprint : **39**

#### P0.C.3 — "Conseiller" → "conseiller" en UI partout
- Source : `10`, `11`, `23`
- Fichiers :
  - `components/outils/OutilsCatalog.tsx:122`
  - `app/(outils)/outils/conseiller/page.tsx:138-139`
- Description : doctrine "conseiller minuscule" violée systématiquement.
- Effort : XS | Impact : ★★★ | Sprint : **39**

#### P0.C.4 — Compléter transfert `completeBrandOnboarding`
- Source : `06-onboarding-step-4.md`
- Description : `responses['1'].audience_principale` et
  `responses['3'].ton_adjectifs` ne sont pas transférées vers la table
  `brands` à la fin de l'onboarding. Choix Floriane silencieusement
  perdus.
- Effort : S | Impact : ★★★★ | Sprint : **39**

#### P0.C.5 — Retirer fragments internes exposés en UI
- Source : `23-workflow-navigation.md`
- Description : `OutilsCatalog.tsx` expose "TF Ads", "Sub-prompt",
  "Sprint 38+" en copy visible. Le pilote ne doit pas voir ça.
- Effort : XS | Impact : ★★★ | Sprint : **39**

### Catégorie Workflow (4 items)

#### P0.W.1 — Ajouter `loading.tsx` + `error.tsx` sur nav 5
- Source : `07`, `08`, `09`, `10`, `11`
- Description : aucune route nav 5 n'a de fichier `loading.tsx` ni
  `error.tsx`. Network slow ou erreur 500 dégrade brutalement.
- Effort : S | Impact : ★★★★ | Sprint : **39**

#### P0.W.2 — Résoudre coexistence deux blocs piliers sur `/ma-marque`
- Source : `09-ma-marque.md`, `21`
- Description : `<MaMarqueDashboard>` (JSONB legacy) et `<PillarsManager>`
  (table pillars) coexistent dans la même page. Le pilote voit deux
  représentations différentes de la même donnée.
- Décision à prendre : retirer le bloc legacy (recommandé) OU les fusionner.
- Effort : M | Impact : ★★★★★ | Sprint : **39**

#### P0.W.3 — Étendre `lib/post-creator/roadmaps.ts` aux 6 formats canoniques
- Source : `12-outils-post-creator.md`
- Description : roadmaps définit 4 slugs (Anecdote, Produit, Événement,
  Coulisses) alors que `lib/i18n/formats.ts` définit 6 (+ Manifeste,
  Question). Drift schéma garanti.
- Effort : S | Impact : ★★★★ | Sprint : **39**

#### P0.W.4 — Tests isolation 5/5 sur table `pillars` + `posts`
- Source : déduit de P0.A.1 + P0.A.4
- Description : après ajout `.eq('tenant_id', ...)` partout, relancer
  `scripts/test-multi-tenant.ts` étendu aux nouvelles tables.
- Effort : M | Impact : ★★★★★ | Sprint : **39**

---

## P1 — Important (à traiter Sprint 40)

**47 items uniques.**

### Catégorie UI / Design system (16 items)

#### P1.U.1 — Migrer hex hardcodés `BrandOnboardingStep.tsx` → vars
- `#FBFAF7`, `#5856D6`, `#C0392B`, rgba accents → `var(--color-*)`
- Source : `03`, `04`, `05`, `06` | Effort : S | Sprint : **40**

#### P1.U.2 — Things 3 task states cohérents `<TaskRow>` sur `/aujourd-hui`
- Source : `07` | Effort : S | Sprint : **40**

#### P1.U.3 — Empty states unifiés sur les 6 outils sub-pages
- Pas de zones blanches brutales si pas de data
- Source : `12-17` | Effort : M | Sprint : **40**

#### P1.U.4 — Touch targets ≥ 44px sur boutons archive `<PillarCard>`
- Le bouton "Archiver" `PillarCard.tsx` est probablement < 32px de haut
- Source : `21` | Effort : XS | Sprint : **40**

#### P1.U.5 — Confirmation actions destructrices via Sheet iOS (pas `window.confirm`)
- `PillarsManager.tsx` utilise `window.confirm()` natif → recalé doctrine
- Source : `09` | Effort : S | Sprint : **40**

#### P1.U.6 — Refonte ConseillerIntro pour palette v60
- `components/conseiller/ConseillerIntro.tsx:143` contient `#1F4937`
- Source : `11`, `23` | Effort : S | Sprint : **40**

#### P1.U.7 — Unifier sheet patterns
- Sheet (`components/layout/Sheet.tsx`) vs SheetMaMarque vs ad-hoc
- Source : `09`, `21`, `22` | Effort : M | Sprint : **40**

#### P1.U.8 — Breadcrumb "Outils" → "Mes Outils"
- biblio, reviews, messages
- Source : `13`, `16`, `17` | Effort : XS | Sprint : **40**

#### P1.U.9 — Halos signature CF cohérents bout-en-bout
- Densité variable selon les pages (audit cross workflow D)
- Source : `23` | Effort : M | Sprint : **40**

#### P1.U.10 — Suppression `<PiliersSheet>` legacy + composants associés
- `components/ma-marque/piliers/PiliersSheet.tsx`, `PiliersBanner`,
  `PiliersContext`, `PiliersPreview`, `SubSheetPilier`
- Source : `09` | Effort : S | Sprint : **40** (après P0.A.5 backfill)

#### P1.U.11 — Refonte `BrandOnboardingStep` étape piliers
- Remplacer par le wizard nouveau Sprint 37.K F89
- Source : `06`, `21` | Effort : M | Sprint : **40**

#### P1.U.12 — Cards `<PillarCard>` avec couleur accentuée si `color_hex` défini
- Le bandeau 3px en tête utilise `color_hex` mais le rendu peut être
  amélioré (gradient au lieu de couleur plate)
- Source : `21` | Effort : XS | Sprint : **40**

#### P1.U.13 — Header `<BrandOnboardingHeaderCta>` cohérent sur autres pages
- Apparaît sur `/ma-marque` uniquement — incohérence ou intentionnel ?
- Source : `23` | Effort : S | Sprint : **40**

#### P1.U.14 — Vérifier qu'aucun emoji ne traîne en UI
- Doctrine SACRED interdit emoji. Spot-check.
- Source : doctrine 10 | Effort : XS | Sprint : **40**

#### P1.U.15 — Animations cohérentes (250-600ms, ease-out)
- Audit cross-pages des `transition` CSS
- Source : doctrine | Effort : M | Sprint : **40**

#### P1.U.16 — Format compteur FR (espace insécable) déjà OK dans `<InstagramIOSMockup>` → étendre aux compteurs Programme et Retombees
- Source : déduit | Effort : S | Sprint : **40**

### Catégorie Copy (8 items)

#### P1.C.1 — Audit grep complet vocab interdit avant chaque commit
- Hook pre-commit à ajouter dans `.husky/`
- Source : doctrine | Effort : S | Sprint : **40**

#### P1.C.2 — Sentence case partout (pas Title Case)
- Audit visuel cross-pages
- Source : doctrine 00-CONCEPT | Effort : S | Sprint : **40**

#### P1.C.3 — Microcopie d'erreur empathique (vs accusatoire)
- Spot-check tous les messages d'erreur
- Source : Marcus | Effort : M | Sprint : **40**

#### P1.C.4 — "le user" / "les users" jamais en code utilisateur facing
- (Côté code TS c'est OK, c'est l'UI qui compte)
- Source : doctrine | Effort : XS | Sprint : **40**

#### P1.C.5 — "ta voix" pas "ton ton"
- Spot-check copy onboarding
- Source : doctrine | Effort : XS | Sprint : **40**

#### P1.C.6 — "raconter" pas "communiquer"
- Spot-check
- Source : doctrine | Effort : XS | Sprint : **40**

#### P1.C.7 — "crédits" pas "tokens"
- Spot-check `/compte/mon-compte`
- Source : doctrine | Effort : XS | Sprint : **40**

#### P1.C.8 — "ta communauté" pas "tes followers"
- Spot-check copy
- Source : doctrine | Effort : XS | Sprint : **40**

### Catégorie Archi (11 items)

#### P1.A.1 — Cacheable prompts à vérifier sur `propose-piliers`
- Cf. `app/_actions/propose-piliers.ts:40-46` — semble OK mais audit
  approfondi sur autres actions LLM (run-conseiller-turn, estimate-programme,
  generate-pedagogy)
- Source : audit cross | Effort : S | Sprint : **40**

#### P1.A.2 — Tests isolation multi-tenant 5/5 sur ALL tables
- Cf. `scripts/test-multi-tenant.ts` à étendre
- Source : doctrine + audit | Effort : M | Sprint : **40**

#### P1.A.3 — Documentation `VOICE_SHEET_RULES` au-delà SACRED
- Référence complète de la voix éditoriale + procédure de modification
- Source : SACRED | Effort : S | Sprint : **40**

#### P1.A.4 — Refactor `BrandOnboardingStep.tsx` (243 lignes useState)
- Trop d'état pour un Server-friendly component
- Source : `04`, `05`, `06` | Effort : M | Sprint : **40**

#### P1.A.5 — Migrer `posts.pilier_nom` TEXT → drop after backfill
- Migration Sprint 40 après validation Sprint 39
- Source : `13`, `22` | Effort : S | Sprint : **40**

#### P1.A.6 — Migration drop `brands.piliers_narratifs` JSONB
- Idem
- Source : `09` | Effort : S | Sprint : **40**

#### P1.A.7 — `lib/post-creator/roadmaps.ts` source de vérité unique
- Référencer `lib/i18n/formats.ts` plutôt que dupliquer
- Source : `12` | Effort : S | Sprint : **40**

#### P1.A.8 — Auditer toutes les `createAdmin()` uses
- Recensement complet + helper `assertTenantOwnership`
- Source : workflow B + C | Effort : M | Sprint : **40**

#### P1.A.9 — Helper `getUserTenantId()` partout
- Pattern récurrent `select tenant_id from profiles where id = user.id`
  à factoriser
- Source : pattern observé | Effort : S | Sprint : **40**

#### P1.A.10 — `'use server'` audit complet (rien de Client par accident)
- Source : doctrine | Effort : S | Sprint : **40**

#### P1.A.11 — Cycles d'import à grep
- `madge --circular` à intégrer pre-commit
- Source : doctrine | Effort : S | Sprint : **40**

### Catégorie Workflow (8 items)

#### P1.W.1 — `loading.tsx` + `error.tsx` également sur sous-routes programme
- `/programme/strategie`, `/programme/post/[postId]`, etc.
- Source : déduit | Effort : S | Sprint : **40**

#### P1.W.2 — Focus auto sur input principal de chaque sheet
- `<PillarWizardSheet>`, `<PillarEditSheet>`, sheets onboarding
- Source : Marcus | Effort : S | Sprint : **40**

#### P1.W.3 — Retour naturel vers `/aujourd-hui` après save partout
- Audit redirections post-save
- Source : Marcus | Effort : S | Sprint : **40**

#### P1.W.4 — Feedback visuel après save (toast iOS-style)
- Pattern unifié à choisir : toast vs sheet vs nothing
- Source : Marcus | Effort : M | Sprint : **40**

#### P1.W.5 — Cascade redirect onboarding sans boucle
- Vérifier `redirect('/login')` puis `redirect('/onboarding')` puis
  `redirect('/aujourd-hui')` — 3 sauts max
- Source : workflow A | Effort : S | Sprint : **40**

#### P1.W.6 — Breadcrumb retour explicite sur `/programme/post/[postId]`
- Source : déduit | Effort : XS | Sprint : **40**

#### P1.W.7 — Confirmation explicite avant suppression brand archive
- Source : `13` | Effort : XS | Sprint : **40**

#### P1.W.8 — État vide cohérent sur `/programme` (semaine vide)
- Source : `08` | Effort : S | Sprint : **40**

### Catégorie Performance (4 items)

#### P1.P.1 — Lighthouse score audit sur 5 nav principales
- À faire Sprint 40 avec captures Playwright
- Source : audit anti-évaluation | Effort : S | Sprint : **40**

#### P1.P.2 — Audit `prefers-reduced-motion` respecté
- Cf. `liquid-glass.css` mentionne fallback mais à vérifier en runtime
- Source : doctrine | Effort : S | Sprint : **40**

#### P1.P.3 — Audit `prefers-reduced-transparency` respecté
- Idem
- Source : doctrine | Effort : S | Sprint : **40**

#### P1.P.4 — Audit accessibility WCAG AA (contraste + alt + aria)
- Axe-core integration
- Source : audit anti-évaluation | Effort : M | Sprint : **40**

---

## P2 — Polish (à traiter Sprint 41+)

**72 items uniques. Sélection des 30 plus pertinents.**

### Catégorie UI (15 items)

| # | Item | Effort | Sprint |
|---|---|---|---|
| P2.U.1 | Animations `glass-fade-in` / `glass-pop-in` cohérentes | XS | 41 |
| P2.U.2 | Border-radius système (`--radius-sm/md/lg`) appliqué partout | S | 41 |
| P2.U.3 | Halo signature CF densité homogène cross-pages | M | 41 |
| P2.U.4 | Backdrop-filter avec fallback `@supports` partout | S | 41 |
| P2.U.5 | Z-index hiérarchie documentée (sheet > modal > toast > popover) | XS | 41 |
| P2.U.6 | Margins/paddings système 4/8/12/16/24/32 uniformes | M | 41 |
| P2.U.7 | Icônes Lucide consistantes (vs SVG custom) | S | 41 |
| P2.U.8 | Compteurs FR (espace insécable) sur Programme + Retombees | S | 41 |
| P2.U.9 | Avatar `<DefaultBrandAvatar>` réutilisable hors mockup Instagram | S | 41 |
| P2.U.10 | Skeleton loaders unifiés (composant `<Skeleton>`) | M | 41 |
| P2.U.11 | Boutons primaires/secondaires/destructifs unifiés (`<PrimaryButton>` etc.) | M | 41 |
| P2.U.12 | Inputs unifiés (focus state, error state cohérent) | M | 41 |
| P2.U.13 | Toasts iOS-style sortis du Sprint 40 P1.W.4 | M | 41 |
| P2.U.14 | Spinner CF dégradé (vs spinner générique gris) | S | 41 |
| P2.U.15 | Empty state illustrations (au lieu de texte plat) | L | 41 |

### Catégorie Copy (10 items)

| # | Item | Effort | Sprint |
|---|---|---|---|
| P2.C.1 | Audit voix Floriane sur tous les system prompts LLM | M | 41 |
| P2.C.2 | Microcopie placeholders inputs (vs ex: "vous@exemple.com" → "ton@email.com") | XS | 41 |
| P2.C.3 | Microcopie boutons cohérente ("Enregistrer" vs "Sauvegarder" vs "Valider") | S | 41 |
| P2.C.4 | Tooltip explicatifs sur features peu intuitives | M | 41 |
| P2.C.5 | Aide contextuelle (icône `?`) sur sheets complexes | M | 41 |
| P2.C.6 | Messages d'attente "Le conseiller réfléchit…" cohérents | XS | 41 |
| P2.C.7 | Texte 404 page Floriane-friendly | XS | 41 |
| P2.C.8 | Texte erreur 500 empathique | XS | 41 |
| P2.C.9 | Confirmation email login plus chaleureuse | XS | 41 |
| P2.C.10 | Citation anchor visible quelque part en UI (about page ?) | XS | 41 |

### Catégorie Archi (5 items)

| # | Item | Effort | Sprint |
|---|---|---|---|
| P2.A.1 | Typage strict tous les retours server actions | M | 41 |
| P2.A.2 | Migration `.tsx` → `.tsx` (déjà fait, vérifier) | XS | 41 |
| P2.A.3 | Tree-shaking audit (bundle size par route) | S | 41 |
| P2.A.4 | Dependency audit (`npm audit`) | S | 41 |
| P2.A.5 | Schema types généré depuis Supabase (vs types manuels) | M | 41 |

---

## Synthèse priorisation

### Distribution par effort

| Effort | P0 | P1 | P2 | Total |
|---|---|---|---|---|
| XS | 3 | 11 | 7 | 21 |
| S | 7 | 19 | 12 | 38 |
| M | 5 | 13 | 9 | 27 |
| L | 2 | 0 | 2 | 4 |
| XL | 1 | 0 | 0 | 1 |
| **Total** | **18** | **43** | **30** | **91** |

Couverture audit : 91 items priorisés sur l'ensemble du repo v60 post-Sprint 37.

### Distribution par sprint cible

- **Sprint 39** : 18 P0 (effort cumulé : 18 × ~moyenne S/M ≈ 1.5 semaine homme)
- **Sprint 40** : 43 P1 (effort cumulé : ~3 semaines homme — peut nécessiter
  un split Sprint 40a / 40b)
- **Sprint 41** : 30 P2 + 9 pages angle mort à auditer (~2 semaines)

### Recommandation découpage

- **Sprint 39** = priorité absolue sécurité + doctrine + branchement pilier_id
- **Sprint 40a** = nettoyage UI (P1.U.*) + Copy (P1.C.*)
- **Sprint 40b** = Archi (P1.A.*) + Workflow (P1.W.*) + Performance (P1.P.*)
- **Sprint 41** = audit + polish des 9 pages skipped + P2 cosmétique

### Critères Sprint 39 réussi

- ✅ Tests isolation 5/5 sur toutes mutations admin
- ✅ ZERO `#1F4937` dans le repo (sauf historique audits/)
- ✅ ZERO "onboarding" en UI utilisateur
- ✅ skills/00, 01, 04, 10 mis à jour avec date validité
- ✅ `posts.pilier_id` consommée par Post Creator + Editor + Programme + Bibliothèque
- ✅ Backfill `pillars` exécuté sur clients pilotes
- ✅ `loading.tsx` + `error.tsx` sur nav 5

### Risques Sprint 39

- **Risque 1** : backfill pillars expose des incohérences JSONB legacy
  (titres > 3 mots, descriptions > 500 chars). Plan B : nettoyer
  manuellement les 3 brands avant backfill.
- **Risque 2** : `.eq('tenant_id', X)` sur server actions admin casse les
  flows qui supposaient un bypass tenant. Plan B : audit complet du flow
  admin (`(admin)/tenants/*`) avant.
- **Risque 3** : skills/ mis à jour mais agents IA en cours utilisent
  l'ancien cache. Plan B : communication + reset session.

---

## Notes méta

- Tous les efforts S/M/L/XL sont estimés en **journées-homme senior**.
- Les distributions impactent uniquement les fichiers cités. Le repo
  contient 200+ fichiers TSX, certains hors-périmètre audit Sprint 38.
- La priorisation est **conservative** : un item P0 peut être déclassé
  P1 si le Sprint 39 manque de temps, mais aucun item P1 ne devrait
  être promu P0 sans nouvelle preuve.
