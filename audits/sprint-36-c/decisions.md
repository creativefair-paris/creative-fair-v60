# Sprint 36.C — Audit consolidé (5 lots)

Branche `sprint-36-c` (basée sur `main` HEAD `99ae686`).
5 commits intermédiaires. Build OK, tsc OK, lint OK (11 warnings pré-existants, 0 erreur).
Pas de push, pas de tag, pas de merge.

## Récapitulatif des 5 lots

| Lot | Commit | Lignes |
|---|---|---|
| 1 — Page Aujourd'hui + Pattern A | `812b65b` | +1050 / -61 |
| 2 — Éditeur pilier + Claude Opus | `1e66636` | +1055 / -31 |
| 3 — Suppression 7 composants legacy | `4daefa3` | +0 / -1231 |
| 4 — Harmonisation UI cross-pages | `08fa48a` | +5 / -3 |
| 5 — 5 patches doctrinaux skills CFS | (hors repo) | — |

Total app code : **+2110 / -1326** (net +784 lignes pour 4 lots produit).

## Lot 1 — Page Aujourd'hui

**Nouvelle home `/aujourd-hui`** — la racine `/` redirige désormais
vers cette route pour les utilisateurs auth + brand complète. La page
ancienne (BifurcationCards) est obsolète mais le composant reste en tree
(pas de suppression aggressive — cleanup futur si besoin).

**Routing :**
- `app/auth/callback/route.ts` : `/aujourdhui` (sans hyphen, dangling) → `/aujourd-hui` (avec hyphen, vraie route)
- `components/ui/Breadcrumb.tsx` : `HOME_HREF` `/programme` → `/aujourd-hui`
- `app/(accueil)/page.tsx` : redirect direct vers `/aujourd-hui`

**Fichiers créés :**
- `app/(aujourd-hui)/layout.tsx`
- `app/(aujourd-hui)/aujourd-hui/page.tsx`
- `components/aujourd-hui/AujourdhuiContent.tsx` (orchestrateur)
- `components/aujourd-hui/DateHeader.tsx` (FR locale + ISO 8601)
- `components/aujourd-hui/SectionLabel.tsx` (uppercase iOS Settings)
- `components/aujourd-hui/SectionAujourdhui.tsx` (posts du jour)
- `components/aujourd-hui/SectionCetteSemaine.tsx` (posts + blocs prioritaires + BarreFondations)
- `components/aujourd-hui/SectionMarquePrendForme.tsx` (Pattern A)
- `components/aujourd-hui/SectionBrouillons.tsx` (stub V1)
- `components/aujourd-hui/TaskItem.tsx` (pastilles 3 états)
- `components/aujourd-hui/StatBlock.tsx` (gros chiffre 40px tabular-nums)
- `lib/aujourd-hui/load-data.ts` (loader server-side)
- `lib/aujourd-hui/compute-stats.ts` (semaines tenues, piliers distincts)
- `lib/aujourd-hui/dates-fr.ts` (Intl + ISO week, sans deps)

**Pattern A — chiffres factuels :**
- `Cette semaine` : posts publiés, piliers travaillés, programme tenu (Oui/—)
- `Depuis le début` : posts total, semaines tenues (ISO 8601 distinct), fondations N/14
- Source : `posts.statut='publie'` + snapshot Ma Marque réel. Si Floriane vient d'arriver : `0` partout, honnête.

**Décisions :**
- `computeProgrammeTenuCetteSemaine` retourne `true` par défaut quand pas de post `planifie` en retard. Heuristique V1 simple, à raffiner Sprint 38.
- `SectionBrouillons` retourne `null` quand `drafts.length === 0` (pas de placeholder fake). La structure DOM est en place pour Sprint 37 (table `drafts`).
- Le breadcrumb sur la home affiche juste `Aujourd'hui` (un seul item, non-clickable).

## Lot 2 — Éditeur pilier individuel

**SubSheetPilier** : modal overlay `z-index: 200` au-dessus de la sheet
Piliers narratifs. Ouvert via bouton "Affiner ce pilier" présent dans
chaque carte pilier de `PiliersContext` (n'écrase pas l'édition inline
existante avec sliders).

**Champs édition :**
- Nom (60 chars max)
- Description (200 chars max, 4 lignes)
- Mots-clés : chips (max 5, Entrée ou virgule pour ajouter, × pour retirer)
- Part du programme : slider 0-100%

**Génération propositions :**
- Endpoint `POST /api/brand/pilier-propositions`
- Cascade Claude Opus : `claude-opus-4-5` → `claude-opus-4-1` → `claude-sonnet-4-5`
- Timeout 30s, max_tokens 768, temperature 0.85
- Prompt système strict : doctrine éditoriale (pas IA, pas exclamation, pas emoji)
- Retour : 3 propositions `{ titre_court, teaser, type_contenu }` validées server-side
- Coût : ~quelques centimes par génération. Pas de cache. Rate-limit naturel via latence cascade (4-10s).

**Persistance :**
- `onSave(updated)` émis depuis SubSheetPilier
- `PiliersSheet` intègre le pilier dans son state et appelle son `persister` existant
- Persister envoie le tableau complet via `PATCH /api/brand/update` field=`piliers_narratifs`, value=array de 3
- Pas de migration DB : `brands.piliers_narratifs` est JSONB

**Types étendus (rétro-compatibles) :**
- `PilierNarratif.mots_cles?: string[]` (max 5, chaînes ≤ 30 chars)
- `PilierNarratif.couleur?: string` (hex `#RRGGBB`)
- `PilierEditable` idem
- Validator `validatePiliersNarratifs` : préserve `mots_cles` et `couleur` si présents, ignore les autres champs inconnus

**Décisions :**
- Pas d'endpoint nested `/api/brand/[brandId]/pilier/[pilierId]/propositions` comme le brief suggérait : un pilier n'a pas d'`id` DB stable (JSONB array). Le pilier est passé en body, le brand context est résolu server-side via auth. Plus simple et plus sûr.
- Layout single-column (modal centré) plutôt que 40/60 Split Brief : la sub-sheet est déjà imbriquée par-dessus une sheet Split Brief — empiler un autre 40/60 aurait été visuellement chargé. Le single-column reste lisible et focalisé sur un seul pilier.

## Lot 3 — Suppression 7 composants legacy

7 composants notés en dette à Sprint 36.B.3, vérifiés sans import live
ni route active. Tous supprimés :

- `components/ma-marque/piliers/PiliersBloc.tsx`
- `components/ma-marque/objectifs/ObjectifsBloc.tsx`
- `components/ma-marque/calendrier/CalendrierBusinessBloc.tsx`
- `components/ma-marque/ressources/RessourcesBloc.tsx`
- `components/ma-marque/MaMarqueFields.tsx`
- `components/programme/Timeline.tsx`
- `components/programme/HeroSemaine.tsx`

Vérification post-suppression : `grep -rln` retourne 0 référence pour
chaque composant. Seul résidu = un commentaire historique de patch
dans `CalendarToggle.tsx` ligne 2 (`"retrait du segment Timeline (la vue
cards verticales a disparu)"`) — conservé comme contexte de patch.

**Aucun build cassé.** -1231 lignes nettes.

## Lot 4 — Harmonisation UI cross-pages

**Audit catégoriel** sur les 6 pages mères. La plupart des composants
sont déjà conformes (Sprints 36.B.2 à 36.B.8 ont posé le canon).

**2 patches appliqués :**

1. `app/globals.css` : 2 occurrences résiduelles de `#1F4937` (vert
   forêt déprécié) remplacées par `var(--color-accent)` (= iOS system
   blue `#007AFF`). Concerne `.cfs-vue-semaine__col.is-today
   .cfs-vue-semaine__day-number` et `.cfs-vue-mois__cell.is-today
   .cfs-vue-mois__cell-num` — la mise en exergue d'aujourd'hui dans
   les vues semaine/mois.

2. `components/ma-marque/canaux/SheetCanaux.tsx` : toggle iOS green
   littéral `'#34C759'` remplacé par `var(--color-system-green)`.

**Décisions documentées (non patchées, low-value/high-risk) :**

- Littéraux `#1C1C1E` (couleur label iOS, = `var(--color-label)`) restent
  inline dans ~10 composants. Migration mécanique sans gain visuel.
- `cfs-h1` / `cfs-h2` utility classes existent dans `globals.css`
  (Sprint 36.B.4) mais ne sont référencées nulle part. Gardées comme
  source canonique pour future adoption.
- Convention de boutons : `.cfs-btn-primaire` / `.cfs-btn-secondaire` /
  `.cfs-btn-destructif` (français). Le brief mentionnait des noms
  anglais (`primary`/etc.), treated as typo — pas de rename.
- Slider piliers : `<input type="range">` en browser default. Pas
  d'override custom du track — accepté pour V1.

**Anti-régression finale :**
- `#1F4937` dans code source : **0** (2 mentions en commentaires uniquement)
- Emoji décoratifs : **0** (déjà aucun avant le sprint)
- Jargon (`audience`/`dashboard`/`workflow`) : les matches restants
  sont domaine acceptable (BrandBook schema, OnboardingFlow, commentaires
  internes). Pas de patch nécessaire.

## Lot 5 — 5 patches doctrinaux skills CFS

**Localisation effective des skills :**
`/Users/ulysselemoine/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/<id>/<id>/skills/`

(et non `~/.claude/skills/` comme indiqué dans le brief — `~/.claude/`
ne contient pas de skills sur cette machine).

**Backup** : `skills.backup-pre-sprint-36-c/` (frère du dossier `skills/`).

**Patches appliqués (vérifiés via `grep -q`) :**

1. `cfs-communication-task-force/SKILL.md` :
   - Section "Frontière avec /cfs-apple-audit" + Mode 6 conjoint
   - Insérée avant "## Liste des 12 Skills Sœurs"

2. `cfs-communication-task-force/SKILL.md` :
   - Règle d'or 16 (Plafond cognitif 4 TF max)
   - Insérée après règle 15

3. `cfs-veille-task-force/SKILL.md` :
   - Section "Frontière avec /cfs-analytics-task-force"
   - Insérée avant "## Modes d'Interaction"

4. `cfs-analytics-task-force/SKILL.md` :
   - Section "Frontière avec /cfs-veille-task-force"
   - Insérée avant "## Modes d'Interaction"

5. `cfs-coups-viralite-task-force/SKILL.md` :
   - Règle 10 (Veto Création Visuelle limité au créatif)
   - **Renumérotée 10** (et non 9 comme dans le brief) car règle 9
     "Tao 🌐 valide le timing culturel" existait déjà.

**CHANGELOG.md créé** à la racine du dossier `skills/`.

**Note** : ces patches sont hors du dépôt git `creative-fair-v60`.
Aucun commit git ne les capture. Ils sont stockés au niveau du système
de fichiers de Claude Code. Le backup `.backup-pre-sprint-36-c` permet
un rollback en 1 commande `cp -r` si nécessaire.

## Gate final

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `eslint --quiet` | 0 erreur (11 warnings pré-existants) |
| 3 | `next build` | succès, 40 routes générées incluant `/aujourd-hui` |
| 4 | Anti-régression `#1F4937` dans code | 0 (2 mentions commentaires) |
| 5 | Emoji décoratifs nouveaux | 0 |
| 6 | 7 composants legacy supprimés | 7/7 ✓ |
| 7 | 5 patches doctrinaux skills | 5/5 ✓ |
| 8 | `/aujourd-hui` opérationnelle | route compilée |
| 9 | Push / merge / tag | aucun |
| 10 | Migrations DB | aucune touchée |

## Action Lead

1. Vérifier visuellement `/aujourd-hui` avec un compte test :
   - Date FR + semaine ISO en tête
   - Section "Aujourd'hui" : empty state ou liste posts
   - Section "Cette semaine" : posts + blocs prioritaires + BarreFondations
   - Section "Ta marque prend forme" : 6 StatBlock 40px (chiffres DB réels)
   - Section "Brouillons" : disparue si aucun draft (normal V1)
2. Tester un click "Affiner ce pilier" depuis Ma Marque → Piliers narratifs
   - SubSheetPilier ouvre par-dessus
   - Bouton "Régénérer" génère 3 propositions via Claude Opus
   - "Enregistrer" persiste (PATCH /api/brand/update)
3. Vérifier que `/programme/post/<id>` reste accessible (les TaskItem
   pointent vers ces URLs)
4. Si OK : push `sprint-36-c` → merge `main` → tag `v1.7.0`

**Filet de sécurité :**
- Repo : `git checkout main` revient à `99ae686` en < 1 s
- Skills : `rm -rf skills && mv skills.backup-pre-sprint-36-c skills`
  restaure l'état pré-patches en 1 s

## Reportés au Sprint 37

- Table `drafts` (la section Brouillons est stubée vide en V1)
- Flux conversationnel de génération du programme
- Raffinement de `computeProgrammeTenuCetteSemaine` avec données réelles
- Suppression du `BifurcationCards` (composant orphelin après que `/` redirect direct)
- Migration des littéraux `#1C1C1E` vers `var(--color-label)` (mécanique, low-value)
- Factorisation `loadUserMeta` entre NavigationBar et PageHeader (dette 36.B.5)
