# Sprint 40 — Plan de remédiation

> **Polish UI + Copy + Archi**
>
> 1-2 semaines (split possible 40a + 40b). ~47 items P1.
> Critère ABORT : si Sprint 39 n'a pas livré 100% des P0, on ne lance pas 40.

---

## Objectif global

Nettoyer les 47 P1 cross-pages identifiés par l'audit Sprint 38. Le Sprint
40 transforme un produit "techniquement propre" (sortie Sprint 39) en
produit "visuellement cohérent et copy-précis".

Aucune nouvelle feature. Aucune migration de schéma majeure (sauf drop
des colonnes legacy `piliers_narratifs` + `pilier_nom`, ces drops étant
le complément naturel du Sprint 39).

---

## Découpage suggéré : Sprint 40a + Sprint 40b

### Sprint 40a (1 semaine) — UI + Copy

- 16 P1 UI (P1.U.1 → P1.U.16)
- 8 P1 Copy (P1.C.1 → P1.C.8)
- Migration drop colonnes legacy (P1.A.5 + P1.A.6)

### Sprint 40b (1 semaine) — Archi + Workflow + Performance

- 11 P1 Archi (P1.A.1 → P1.A.11 sauf 5+6)
- 8 P1 Workflow (P1.W.1 → P1.W.8)
- 4 P1 Performance (P1.P.1 → P1.P.4)

Si le Lead préfère un Sprint 40 unique : faire 40a en priorité visible
(le Lead constate les améliorations en navigant) et 40b en arrière-plan.

---

## Sprint 40a — Périmètre détaillé

### S40a.UI.1 — Migrer hex hardcodés `BrandOnboardingStep.tsx`

Fichier : `components/onboarding-marque/BrandOnboardingStep.tsx`

Hex à migrer (audit Sprint 38 mentionnait `#FBFAF7`, `#5856D6`, `#C0392B`,
rgba accents) :
- `#FBFAF7` → `var(--color-background)`
- `#5856D6` → `var(--color-accent-lilas)` (à créer si pas existant)
- `#C0392B` → `var(--color-error)`
- rgba accents → tokens correspondants

Pré-requis : étendre `app/globals.css` avec les variantes manquantes :
```css
:root {
  --color-accent: #007AFF;
  --color-accent-lilas: #5856D6;
  --color-accent-indigo: #4F46E5;
  --color-accent-orange: #FB923C;
  --color-pastel-rose: #FFB5C5;
  --color-pastel-lilac: #C8B5FF;
  --color-pastel-blue: #B5D5FF;
}
```

### S40a.UI.2 — Things 3 task states sur `<TaskRow>` `/aujourd-hui`

Fichier : `components/today/TaskRow.tsx`

Doctrine Things 3 :
- État `todo` : cercle vide (border 2px, fill transparent)
- État `doing` : barre dans le cercle (strikethrough simulée)
- État `done` : checkmark dans cercle plein accent

Vérifier que les états visuels matchent les états de données
(`mapStatutToState` dans `lib/types/post.ts`).

### S40a.UI.3 — Empty states unifiés outils sub-pages

6 pages outils — chacune doit avoir un empty state cohérent :

```tsx
// components/outils/EmptyState.tsx
export function EmptyStateOutil({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: Props) {
  return (
    <div className="glass-z1 flex flex-col items-center gap-4 p-8 text-center">
      <Icon size={48} style={{ color: 'var(--color-text-muted)' }} />
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{title}</h3>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: 320 }}>{description}</p>
      {ctaLabel ? <Link href={ctaHref}>{ctaLabel}</Link> : null}
    </div>
  )
}
```

Empty states à créer :
- Bibliothèque vide : "Aucun document pour l'instant. Ajoute ton brand
  book pour commencer."
- Reviews vide : "Pas de fact-check encore. Donne-moi une affirmation."
- Moodboard vide : "Compose ton moodboard à partir de tes archives."
- Variations vide : "Choisis une image source pour démarrer."
- Messages vide : "Pas de messages."
- Post-creator vide : déjà gérée via les 6 cartes formats

### S40a.UI.4 — Touch targets ≥ 44px `<PillarCard>` bouton archiver

Fichier : `components/pillars/PillarCard.tsx`

Le bouton "Archiver" est probablement ~24-28px de haut. Cible : 44px
minimum (zone tactile iOS).

```tsx
// AVANT
<button style={{ padding: '4px 10px', fontSize: 11 }}>Archiver</button>

// APRÈS
<button
  style={{
    padding: '10px 14px',
    fontSize: 13,
    minHeight: 44,
    minWidth: 44,
  }}
>
  Archiver
</button>
```

### S40a.UI.5 — Confirmation actions destructrices via Sheet iOS

Fichier : `components/pillars/PillarsManager.tsx`

Remplacer `window.confirm()` natif par un sheet bottom iOS :

```tsx
// AVANT
const handleArchive = useCallback(async (pillar) => {
  const confirmed = window.confirm(`Archiver « ${pillar.title} » ?`)
  if (!confirmed) return
  // ...
}, [])

// APRÈS
const [confirmTarget, setConfirmTarget] = useState<PillarRow | null>(null)

const handleArchive = (pillar) => setConfirmTarget(pillar)
const handleConfirm = async () => {
  if (!confirmTarget) return
  await archivePillar(confirmTarget.id)
  setConfirmTarget(null)
}

// JSX
{confirmTarget && (
  <ConfirmArchiveSheet
    pillar={confirmTarget}
    onConfirm={handleConfirm}
    onCancel={() => setConfirmTarget(null)}
  />
)}
```

### S40a.UI.6 — Refonte ConseillerIntro pour palette v60

Fichier : `components/conseiller/ConseillerIntro.tsx:143`

`#1F4937` (déjà retiré P0 Sprint 39) — vérifier le rendu global après
migration vers `var(--color-accent)`.

### S40a.UI.7 — Unifier sheet patterns

Composants à consolider :
- `components/layout/Sheet.tsx` (canonique)
- `components/ma-marque/SheetMaMarque.tsx` (variant)
- Sheets ad-hoc dans `components/conseiller/*` (à fusionner)

Cible : 1 composant `<Sheet>` paramétrable (taille, position, glass level)
+ variants déclaratifs via props.

### S40a.UI.8 — Breadcrumb "Outils" → "Mes Outils"

Fichiers à modifier :
- `app/(outils)/outils/bibliotheque/page.tsx` (breadcrumb)
- `app/(outils)/outils/reviews/page.tsx`
- `app/(outils)/outils/messages/page.tsx`

Probable composant unique `<Breadcrumb>` paramétré — modifier le label
"Outils" → "Mes Outils".

### S40a.UI.9 — Halos signature CF densité homogène

Audit cross-pages :
- `/aujourd-hui` : 6 halos (cf. déjà observé)
- `/ma-marque` : 6 halos
- `/programme` : à vérifier
- `/outils` : à vérifier
- `/outils/conseiller` : à vérifier

Cible : densité 6 halos partout, positions/couleurs adaptées au contenu
mais ratio surface/halo cohérent.

### S40a.UI.10 — Suppression `<PiliersSheet>` legacy

Pré-requis : Sprint 39 a retiré le bloc `<MaMarqueDashboard>` lié aux
piliers JSONB (P0.W.2). Sprint 40 peut alors supprimer le composant
mort :
- `components/ma-marque/piliers/PiliersSheet.tsx`
- `components/ma-marque/piliers/PiliersBanner.tsx`
- `components/ma-marque/piliers/PiliersContext.tsx`
- `components/ma-marque/piliers/PiliersPreview.tsx`
- `components/ma-marque/piliers/SubSheetPilier.tsx`

Grep cross-files avant suppression.

### S40a.UI.11 — Refonte `BrandOnboardingStep` étape piliers

Remplacer la collecte des 3 piliers JSONB par un lancement du nouveau
`<PillarWizardSheet>` à l'issue de l'onboarding.

Décision design : le pilote crée ses 3 premiers piliers via le wizard
nouveau, dans la foulée de l'onboarding marque. UX cohérente avec le
flow `/ma-marque` post-onboarding.

### S40a.UI.12 — `<PillarCard>` gradient si `color_hex` défini

Fichier : `components/pillars/PillarCard.tsx`

Actuellement le bandeau 3px en tête est une couleur plate. Améliorer :
```tsx
background: pillar.color_hex
  ? `linear-gradient(135deg, ${pillar.color_hex} 0%, ${pillar.color_hex}99 100%)`
  : 'rgba(0, 122, 255, 0.18)'
```

### S40a.UI.13 — Header `<BrandOnboardingHeaderCta>` cohérence

Décision Apple Board : le CTA "Démarrer les questions" doit-il apparaître
uniquement sur `/ma-marque` ou aussi sur `/aujourd-hui` quand
`questionsAnswered < 14` ?

Recommandation : laisser sur `/ma-marque` uniquement. Le `/aujourd-hui`
a déjà un bloc "Démarrer" via `<DemarrerCard>`.

### S40a.UI.14 — ZERO emoji audit complet

```bash
grep -rEn "[\u{1F300}-\u{1F9FF}]" --include="*.tsx" --include="*.ts" components/ app/
```

Devrait retourner ZERO en UI utilisateur (les mockups Instagram peuvent
contenir ❤ etc. mais dans SVG, pas en texte UI).

### S40a.UI.15 — Animations cohérentes 250-600ms ease-out

Grep `transition:` cross-files. Vérifier :
- Toutes les durées dans [250, 600] ms
- Toutes les easing `cubic-bezier(0.32, 0.72, 0, 1)` (Apple iOS) ou
  `ease-out`
- Aucun `bounce`, `spring`, `elastic`

### S40a.UI.16 — Compteurs FR (espace insécable) cross-pages

Étendre le helper `formatCount()` de `InstagramIOSMockup.tsx:39-50` à
`lib/i18n/format-count.ts` partagé.

### S40a.C.1 → S40a.C.8 — Copy P1

#### S40a.C.1 — Hook pre-commit vocab interdit

`.husky/pre-commit` :
```bash
#!/bin/sh
FORBIDDEN="users|audience|viewers|dashboard|tableau de bord|workflow|pipeline|viral|boost|growth hack|onboarding"
HITS=$(git diff --cached --name-only --diff-filter=ACM | grep -E "\.(tsx?|md)$" | xargs grep -lEi "$FORBIDDEN" 2>/dev/null || true)
if [ -n "$HITS" ]; then
  echo "❌ Vocabulaire interdit détecté dans : $HITS"
  echo "Mots à éviter : $FORBIDDEN"
  exit 1
fi
```

Caveat : grep risque false positives (`users` dans un type TS, par exemple).
Filtrer par regex contextuelle ("users" en JSX text only).

#### S40a.C.2 — Sentence case audit

Spot-check cross-pages :
- Headers : "Ma Marque" (case naturel français), "Mon Programme" — OK
- Buttons : "Voir les pistes" — OK
- Labels : "Adresse email" — OK
- Pas de Title Case anglo-saxon

#### S40a.C.3 — Microcopie erreur empathique

Audit messages d'erreur cross-fichiers. Pattern doctrine :
- ❌ "Erreur 500. Réessayez."
- ✅ "Quelque chose a glissé. On peut réessayer ?"

#### S40a.C.4 — "le user" / "les users" en UI

Grep + remplacement par "le pilote" / "les pilotes" en UI utilisateur.
Code TypeScript reste libre.

#### S40a.C.5 — "ta voix" pas "ton ton"

Audit copy onboarding + conseiller.

#### S40a.C.6 — "raconter" pas "communiquer"

Idem.

#### S40a.C.7 — "crédits" pas "tokens"

Page `/compte/mon-compte` à auditer.

#### S40a.C.8 — "ta communauté" pas "tes followers"

Audit copy programme + outils.

### S40a.A.5 + S40a.A.6 — Drop colonnes legacy

Après validation finale Sprint 39 backfill :

#### S40a.A.5 — `posts.pilier_nom` drop

```sql
-- supabase/migrations/028_drop_posts_pilier_nom.sql
alter table posts drop column if exists pilier_nom;
```

#### S40a.A.6 — `brands.piliers_narratifs` drop

```sql
-- supabase/migrations/029_drop_brands_piliers_narratifs.sql
alter table brands drop column if exists piliers_narratifs;
```

Apply order : 028 puis 029. Migration 027 (Sprint 39) avait préparé les
deux ensemble — désormais splittées pour rollback granularité.

---

## Sprint 40b — Périmètre détaillé

### S40b.A.1 — Cacheable prompts audit

Fichiers à vérifier :
- `app/_actions/run-conseiller-turn.ts`
- `app/_actions/estimate-programme-outcomes.ts`
- `app/_actions/generate-pedagogy.ts`
- `app/_actions/run-review-check.ts`
- `app/_actions/strategie-events-intention.ts`
- `app/_actions/ask-mini-chat.ts`

Pattern attendu :
```ts
system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }]
```

Si un système prompt change à chaque appel (interpolation user data dedans),
le cache est cassé → 0% hit. Identifier ces cas et déplacer la donnée
variable dans le user message.

### S40b.A.2 — Tests isolation 5/5 sur ALL tables

Étendre `scripts/test-multi-tenant.ts` aux tables :
- tenants
- profiles
- brands
- onboarding_answers
- uploads
- posts
- conversations
- daily_coaching
- analytics_events
- credits_usage
- pillars (déjà ajouté Sprint 39)
- programmes (si existe)
- brand_archives (si existe)
- library_documents (si existe)

Total : ~14 tables × 5 cas = 70 tests isolation.

### S40b.A.3 — Documentation `VOICE_SHEET_RULES`

Ajouter dans `skills/` un nouveau fichier `05-VOICE_SHEET.md` qui :
- Documente les règles éditoriales appliquées dans
  `lib/ai/prompts/system.ts`
- Explique procédure de modification (passe par Apple Board, casse cache)
- Liste les modèles concernés (Opus 4.7, Sonnet 4.5/4.6, Haiku 4.5)

### S40b.A.4 — Refactor `BrandOnboardingStep.tsx`

243 lignes de useState — trop d'état local. Découper :
- `BrandOnboardingStep.tsx` reste orchestrateur
- `BrandOnboardingStepPiliers.tsx` (étape piliers)
- `BrandOnboardingStepAudience.tsx`
- `BrandOnboardingStepTon.tsx`
- ...

Pattern : chaque step est un composant client avec son propre state,
le orchestrateur consolide à la fin via `completeBrandOnboarding`.

### S40b.A.7 — `roadmaps.ts` source de vérité unique

Refonte : `lib/post-creator/roadmaps.ts` importe `FORMAT_LABELS` de
`lib/i18n/formats.ts` et dérive ses 6 entrées. Plus de dup.

### S40b.A.8 — Audit complet `createAdmin()` (post-Sprint 39)

Vérifier que tous les sites de mutation passent désormais par
`assertTenantOwnership` (introduit Sprint 39).

### S40b.A.9 — Helper `getUserTenantId()`

Pattern récurrent :
```ts
const { data: rawProfile } = await supabase
  .from('profiles')
  .select('tenant_id')
  .eq('id', user.id)
  .maybeSingle()
const tenantId = (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
```

Factoriser en `lib/supabase/get-tenant-id.ts` :
```ts
export async function getUserTenantId(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .maybeSingle()
  return (data as { tenant_id?: string | null } | null)?.tenant_id ?? null
}
```

Migrer ~15 occurrences cross-fichiers.

### S40b.A.10 — `'use server'` audit complet

Grep `'use server'` partout — vérifier qu'aucune fonction client n'est
exécutée par accident.

### S40b.A.11 — Cycles d'import

```bash
npx madge --circular app/ components/ lib/
```

Doit renvoyer aucun cycle.

### S40b.W.1 — `loading.tsx` + `error.tsx` sur sous-routes programme

Compléter Sprint 39 :
- `/programme/strategie/loading.tsx` + `error.tsx`
- `/programme/post/[postId]/loading.tsx` + `error.tsx`
- `/programme/posts/[postId]/loading.tsx` + `error.tsx`
- `/programme/retombees/loading.tsx` + `error.tsx`
- `/programme/bienvenue/loading.tsx` + `error.tsx`
- `/programme/create/loading.tsx` + `error.tsx`

### S40b.W.2 — Focus auto inputs

Audit cross-sheets :
- `<PillarWizardSheet>` étape 1 : focus auto premier textarea
- `<PillarEditSheet>` : focus auto input title
- Sheets onboarding : focus auto premier input
- Login : focus auto email (déjà via `autoFocus` HTML ?)

### S40b.W.3 — Retour naturel post-save

Audit redirections :
- Après création pilier : reste sur `/ma-marque` (déjà OK)
- Après save post : retour `/programme` (à vérifier)
- Après update brand : retour `/ma-marque` (à vérifier)

### S40b.W.4 — Toast iOS-style

Créer `components/ui/Toast.tsx` :
- Position : bottom-center
- Style : glass-z3, padding 12px 16px, border-radius 12px
- Auto-dismiss 3s
- Animation enter : slide up + fade in 280ms ease-out
- Animation exit : slide down + fade out 280ms ease-out

Hook `useToast()` à exposer.

Utilisation cross-pages : remplacer les `console.info('...done')` par
des toasts visibles.

### S40b.W.5 — Cascade redirect onboarding

Vérifier flow :
1. `/login` magic link → callback → `/aujourd-hui`
2. Si pas de marque → `/onboarding/analyse-marque`
3. Si onboarding incomplet → reste sur `/onboarding`
4. Si complet → `/aujourd-hui`

Max 2 sauts. Auditer `app/(auth)/callback/route.ts` (si existe).

### S40b.W.6 — Breadcrumb retour explicite

`/programme/post/[postId]` doit avoir un bouton retour visible vers
`/programme`.

### S40b.W.7 — Confirmation suppression brand archive

`components/library/*` ou `components/ma-marque/archives/*` — sheet de
confirmation iOS avant suppression brand_archives.

### S40b.W.8 — État vide `/programme` semaine vide

Si la semaine courante n'a aucun post, afficher un empty state cohérent
au lieu d'une grille vide.

### S40b.P.1 → S40b.P.4 — Performance

#### S40b.P.1 — Lighthouse score

Cible : 90+ sur Performance/Accessibility/Best Practices pour les 5 nav.

Captures Playwright avec Lighthouse plugin → `audits/sprint-40/lighthouse/`.

#### S40b.P.2 — `prefers-reduced-motion`

Vérifier en DevTools que toutes les animations s'arrêtent. Cf.
`liquid-glass.css:75-78` mentionne le respect — confirmer.

#### S40b.P.3 — `prefers-reduced-transparency`

Idem. Cf. `liquid-glass.css:79-82`.

#### S40b.P.4 — Axe-core audit accessibility

Integration `axe-core` dans Playwright headless. Cible : 0 violation
Serious/Critical.

---

## Effort total Sprint 40

| Sous-sprint | Items | Effort |
|---|---|---|
| 40a UI (16) | 16 | 3 jours |
| 40a Copy (8) | 8 | 1 jour |
| 40a Archi drop (2) | 2 | 0.5 jour |
| 40b Archi (9) | 9 | 3 jours |
| 40b Workflow (8) | 8 | 2 jours |
| 40b Performance (4) | 4 | 1 jour |
| **Total** | **47 items** | **~10.5 jours-homme** |

Pour 1 dev senior : Sprint 40a = 5 jours, Sprint 40b = 5 jours.
Découpage recommandé.

---

## Critères de succès Sprint 40 (Validé/Recalé)

### Hard requirements

- ✅ Migrations 028 + 029 appliquées en prod (drop legacy)
- ✅ ZERO hex hardcodé en composants (sauf mockups Instagram assumés
  + `liquid-glass.css` system tokens)
- ✅ Touch targets ≥ 44px partout (audit Playwright dimensions)
- ✅ Toutes routes nav 5 + sous-routes programme ont loading + error
- ✅ Tests isolation 5/5 sur 14 tables
- ✅ Lighthouse Performance ≥ 90 sur les 5 nav
- ✅ Axe-core 0 Serious/Critical
- ✅ Hook pre-commit vocab interdit actif
- ✅ Helper `getUserTenantId()` factorisé (15+ usages migrés)

### Soft requirements

- ✅ Toast iOS pattern unifié
- ✅ Sheets unifiés (1 composant + variants)
- ✅ Empty states unifiés outils
- ✅ skills/05-VOICE_SHEET.md créé

---

## Risques + plans B

### Risque 1 — Drop colonnes legacy casse une migration tierce non identifiée

Probabilité : faible (Sprint 39 a normalement validé qu'aucun consumer
ne lit plus le JSONB / TEXT).

Plan B : `pg_dump --schema-only` avant migrations 028/029, en cas de
rollback rapide.

### Risque 2 — Refactor `BrandOnboardingStep` casse l'onboarding existant

Probabilité : moyenne.

Plan B : feature flag `NEW_ONBOARDING_FLOW` qui permet de switcher entre
ancien et nouveau code. Désactivé par défaut, activé pour les 3 clients
pilotes après tests.

### Risque 3 — Pre-commit hook bloque des commits légitimes (false positives)

Probabilité : élevée.

Plan B : `--no-verify` autorisé temporairement (sinon dev productivity
chute). Hook progressivement raffiné via regex contextuelle.

### Risque 4 — Lighthouse 90+ non atteint sur `/ma-marque` (page lourde)

Probabilité : élevée (page contient `<MaMarqueDashboard>` + `<PillarsManager>`
+ multiples sheets).

Plan B :
- Code-splitting : `<PillarsManager>` en lazy import
- Sheets en dynamic import quand ouverts
- Cible : 80+ acceptable pour `/ma-marque` (la plus complexe)

---

## Post-Sprint 40 — État attendu

- 0 P1 majeur ouvert
- Performance ≥ 90 sur les 5 nav (sauf `/ma-marque` ≥ 80)
- Accessibility WCAG AA passé (Axe-core 0 Serious)
- Cohérence visuelle bout-en-bout (tokens, animations, sheets)
- Cohérence copy bout-en-bout (vocab, tutoiement, microcopie)
- Migration legacy 100% complète (JSONB + TEXT dropped)
- ~6 P2 cosmétique reportés Sprint 41 (acceptable)

Le Sprint 40 livre un produit **prêt pour la prod B2B premium**. Les 3
clients pilotes peuvent expérimenter sans tomber sur des incohérences
visuelles ou des bugs sécurité.
