# Sprint 39 — Plan de remédiation

> **Sécurité + Doctrine + Branchement pilier_id**
>
> 1 semaine, ~18 items P0. Aucune nouvelle feature.
> Critère ABORT : si la sécurité multi-tenant n'est pas restaurée à 5/5,
> ne pas mettre le sprint en prod.

---

## Objectif global

Éliminer les **3 failles structurelles** identifiées par l'audit Sprint
38 :

1. **Faille sécurité multi-tenant** sur server actions admin
2. **Migration progressive Sprint 37.K F89 non terminée** (pilier_id pas
   branchée, JSONB legacy non retiré)
3. **Doctrine documentation drift** (skills/ obsolètes)

À l'issue du Sprint 39, le code et la documentation doivent à nouveau
être alignés sur la doctrine v60 réelle, et la sécurité multi-tenant
doit passer 5/5 sur toutes les tables (existantes + `pillars` ajoutée
au Sprint 37.K).

---

## Périmètre exact (par axe)

### Axe Sécurité multi-tenant (P0.A.1 → P0.A.5)

#### S39.SEC.1 — Helper `assertTenantOwnership`

Créer `lib/supabase/tenant-guard.ts` :

```ts
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Vérifie qu'une row appartient bien au tenant courant AVANT toute
 * mutation via admin client. Lève une erreur sinon.
 *
 * Pattern :
 *   await assertTenantOwnership(admin, 'pillars', id, tenantId)
 *   await admin.from('pillars').update(...).eq('id', id) // safe
 */
export async function assertTenantOwnership(
  admin: SupabaseClient,
  table: string,
  rowId: string,
  tenantId: string,
): Promise<void> {
  const { data, error } = await admin
    .from(table)
    .select('tenant_id')
    .eq('id', rowId)
    .maybeSingle()
  if (error) throw new Error(`tenant_guard: ${table} read failed`)
  const ownerTenantId = (data as { tenant_id?: string } | null)?.tenant_id
  if (ownerTenantId !== tenantId) {
    throw new Error(`tenant_guard: ${table}#${rowId} owned by another tenant`)
  }
}
```

#### S39.SEC.2 — Refactor `updatePillar`

`app/_actions/pillars.ts:167` :
```ts
// AVANT
const { data, error } = await admin
  .from('pillars')
  .update({ ...updates, updated_at: new Date().toISOString() })
  .eq('id', id)
  .select(...)

// APRÈS
await assertTenantOwnership(admin, 'pillars', id, tenantId)
const { data, error } = await admin
  .from('pillars')
  .update({ ...updates, updated_at: new Date().toISOString() })
  .eq('id', id)
  .eq('tenant_id', tenantId)  // double-belt + suspenders
  .select(...)
```

#### S39.SEC.3 — Refactor `archivePillar` (idem pattern)

#### S39.SEC.4 — Audit cross-fichiers `createAdmin()` usage

Grep complet :
```bash
grep -rn "createAdmin()" --include="*.ts" app/_actions/ lib/
```

Pour chaque résultat, vérifier que la mutation suit :
1. `tenantId` lu via `profiles.tenant_id` du user authentifié
2. `assertTenantOwnership(admin, table, rowId, tenantId)` avant la mutation
3. `.eq('tenant_id', tenantId)` dans la mutation elle-même

Fichiers attendus (liste non exhaustive — à confirmer Sprint 39 startup) :
- `app/_actions/pillars.ts`
- `app/_actions/programme.ts` (si existe — pour création post)
- `app/_actions/brand-onboarding.ts`
- `app/_actions/propose-piliers.ts`
- `app/_actions/run-conseiller-turn.ts`
- `app/_actions/generate-pedagogy.ts`
- `app/_actions/estimate-programme-outcomes.ts`
- `app/_actions/run-review-check.ts`
- `app/_actions/strategie-events-intention.ts`

#### S39.SEC.5 — Étendre `scripts/test-multi-tenant.ts`

Ajouter tests isolation :
- Tenant A ne peut PAS update Tenant B `pillars`
- Tenant A ne peut PAS archive Tenant B `pillars`
- Tenant A ne peut PAS update Tenant B `posts`
- Tenant A ne peut PAS lire les `pillars` archivées de Tenant B

Cible : 5/5 sur les nouvelles tables.

### Axe Migration pilier_id (P0.A.4 + P0.A.5 + P0.W.2)

#### S39.MIG.1 — Backfill script `scripts/backfill-pillars.ts`

```ts
// Pseudo-code
for (const brand of allBrandsActive) {
  const jsonbPillars = brand.piliers_narratifs as Array<{ nom: string; description?: string }>
  if (!Array.isArray(jsonbPillars)) continue
  for (const [i, p] of jsonbPillars.entries()) {
    await admin.from('pillars').insert({
      brand_id: brand.id,
      tenant_id: brand.tenant_id,
      title: p.nom.slice(0, 50),
      description: p.description ?? 'À renseigner.',
      position: i,
      generation_model: 'backfill-sprint-39',
    })
  }
}
```

Exécution : sur staging Supabase d'abord, validation Lead, puis prod.

#### S39.MIG.2 — Brancher `pilier_id` dans création post

Fichiers à modifier :
- `app/_actions/<post-create-action>.ts` (à identifier — probable
  `programme.ts` ou `programme/<route>/actions.ts`)
- Schema input : ajouter `pilierId: string` au lieu de `pilierNom: string`
- DB insert : passer `pilier_id` au lieu de `pilier_nom`
- Si compat backward nécessaire pour validation : persister les deux pendant
  Sprint 39, drop `pilier_nom` au Sprint 40.

#### S39.MIG.3 — Brancher `pilier_id` dans `PostEditor`

`components/programme/PostEditor.tsx` :
- Remplacer le select `pilier_nom` (texte libre ?) par un `<select>`
  de `pillars` chargés via server action `listPillars(brandId)`
- Stocker `pilier_id` dans le state, pas `pilier_nom`
- Au save, mutation `updatePostFields` accepte `pilier_id`

#### S39.MIG.4 — Brancher `pilier_id` dans Bibliothèque

Audit confirme : `components/library/*` query+render+types utilisent
`pilier_nom`. Migrer.

#### S39.MIG.5 — Résoudre coexistence `/ma-marque`

Décision Apple Board recommandée : **retirer le bloc legacy** de
`<MaMarqueDashboard>` pour ne garder que `<PillarsManager>`. La
phrase contextuelle Sprint 36.G ("Pilier 4 aspirational storytelling")
peut survivre dans `<EtatMarque>` sans dépendre du JSONB legacy.

Action :
- Retirer `snapshot.piliers` du calcul de `<EtatMarque>`
- Retirer `<PiliersSheet>` du switch `openSheet === 'piliers'`
- Retirer `<MarqueRow row="piliers">` du tableau

#### S39.MIG.6 — Migration drop JSONB (PRÉPARÉE, pas appliquée)

Créer `supabase/migrations/027_drop_legacy_pillars.sql` :
```sql
-- ⚠️ À APPLIQUER UNIQUEMENT APRÈS validation backfill sur 3 clients pilotes.
-- Migration préparée Sprint 39, appliquée Sprint 40 prod (Sprint 39 staging).
alter table brands drop column if exists piliers_narratifs;
alter table posts drop column if exists pilier_nom;
```

Ne pas exécuter en prod tant que :
- ✅ Backfill exécuté sur les 3 tenants pilotes
- ✅ Tests isolation 5/5 passent
- ✅ Aucun consumer ne référence plus le JSONB (grep complet)

### Axe Doctrine documentation (P0.D.1 → P0.D.4)

#### S39.DOC.1 — Refonte `skills/00-CONCEPT.md`

Sections à modifier :
- **Navigation** : "Architecture de navigation (FIXE — jamais 5 destinations)"
  → "Architecture de navigation (5 destinations — état v60 Sprint 33-37)" :
  1. Aujourd'hui (`/aujourd-hui`)
  2. Mon Programme (`/programme`)
  3. Ma Marque (`/ma-marque`)
  4. Mes Outils (`/outils`)
  5. Conseiller (`/outils/conseiller` — accès via icône header + lien outils)

  Ajouter note : "La nav 4 antérieure (avec `/calendrier`) a été reversée
  Sprint 33. La 5e destination `/outils` est née de la décomposition du
  Post Creator en hub + sub-pages."

- **Couleurs** : "Accent unique : #1F4937 vert forêt" → "Palette v60 (mai 2026) :"
  - Background `#FBFAF7` (crème) — inchangé
  - Surface `#FFFFFF` — inchangé
  - Accent primaire `#007AFF` (bleu iOS) — remplace forest green
  - Accent secondaire : lilas + indigo
  - Accent tertiaire : orange + pastels
  - Note : "Forest green `#1F4937` deprecated 6 mai 2026."

- **Décisions abandonnées** : ajouter
  "✗ Forest green `#1F4937` (deprecated 6 mai 2026 — palette v60)"
  "✗ Navigation 4 destinations (étendu à 5 Sprint 33)"

- En-tête : ajouter `> Validité : v60 (Sprint 37+). Dernière mise à jour : Sprint 39, 16 mai 2026.`

#### S39.DOC.2 — Refonte `skills/01-ARCHITECTURE.md`

Sections à modifier :
- **Structure du repo** : remplacer
  ```
  ├── (app)/aujourdhui/
  ├── (app)/calendrier/
  ├── (app)/post-creator/[postId]/
  ```
  par
  ```
  ├── (aujourd-hui)/aujourd-hui/
  ├── (programme)/programme/
  ├── (ma-marque)/ma-marque/
  ├── (outils)/outils/
  │   ├── conseiller/
  │   ├── post-creator/[format]/
  │   ├── bibliotheque/
  │   ├── moodboard/
  │   ├── variations/
  │   ├── reviews/
  │   └── messages/
  ├── (onboarding)/onboarding/analyse-marque/
  ├── (compte)/compte/{mon-compte,parametres,ma-marque}/
  ├── (auth)/login/
  ├── (admin)/tenants/
  ```

- **Tables Supabase** : ajouter `pillars` (Sprint 37.K F89) à la liste des
  10 tables. La nouvelle liste a 11 tables.

- **Modèles par tâche** : ajouter `claude-sonnet-4-6` pour wizard piliers.

- En-tête : date validité.

#### S39.DOC.3 — Refonte `skills/10-SACRED.md`

Sections à modifier :
- **Navigation** : 4 → 5 destinations (cf. S39.DOC.1)
- **Vert forêt unique accent** : retirer la section ou la convertir en
  "Décision reversée 6 mai 2026"
- En-tête : date validité.

#### S39.DOC.4 — Refonte `skills/04-DESIGN_SYSTEM.md`

- Ajouter section "Palette v60" explicite avec les hex canoniques
- Confirmer les 3 niveaux Liquid Glass z1/z2/z3 toujours actifs
- En-tête : date validité.

### Axe Copy / UI urgent (P0.C.1 → P0.C.5)

#### S39.UI.1 — Retirer `#1F4937` de `app/globals.css`

Grep ligne précise + remplacement par `var(--color-accent)` ou suppression
si dead code.

#### S39.UI.2 — Retirer `#1F4937` de `ConseillerIntro.tsx:143`

Idem.

#### S39.UI.3 — Vocab interdit "onboarding"

Sed-style remplacement :
- `BrandOnboardingSheet.tsx` aria-label : "onboarding marque" → "questions guidées sur ta marque"
- `BrandOnboardingHeaderCta.tsx` label CTA non-resumable : "Commencer l'onboarding" → "Démarrer les questions"
- `BrandOnboardingHeaderCta.tsx` label CTA resumable : "Reprendre l'onboarding" → "Reprendre les questions"
- `ResumeChoiceSheet.tsx` : "Démarrer un nouvel onboarding" → "Recommencer les questions"

#### S39.UI.4 — "Conseiller" → "conseiller"

`OutilsCatalog.tsx:122` + `app/(outils)/outils/conseiller/page.tsx:138-139`

#### S39.UI.5 — `completeBrandOnboarding` complet

`app/_actions/brand-onboarding.ts` ou similaire — ajouter au transfert :
- `responses['1'].audience_principale` → `brands.audience_principale`
- `responses['3'].ton_adjectifs` → `brands.ton` (concat ou structuré)

#### S39.UI.6 — Retirer "TF Ads / Sub-prompt / Sprint 38+" en UI

`OutilsCatalog.tsx` — supprimer fragments internes visibles.

### Axe Workflow urgent (P0.W.1 + P0.W.3 + P0.W.4)

#### S39.WF.1 — `loading.tsx` + `error.tsx` sur nav 5

Créer 10 fichiers :
- `app/(aujourd-hui)/aujourd-hui/loading.tsx` + `error.tsx`
- `app/(programme)/programme/loading.tsx` + `error.tsx`
- `app/(ma-marque)/ma-marque/loading.tsx` + `error.tsx`
- `app/(outils)/outils/loading.tsx` + `error.tsx`
- `app/(outils)/outils/conseiller/loading.tsx` + `error.tsx`

Pattern minimum :
```tsx
// loading.tsx
export default function Loading() {
  return (
    <div className="glass-z2 min-h-screen flex items-center justify-center">
      <div className="cfp-spinner" aria-label="Chargement" />
    </div>
  )
}

// error.tsx
'use client'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="glass-z2 min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>
        Quelque chose a glissé. On peut réessayer ?
      </p>
      <button onClick={reset} className="glass-control px-4 py-2">Réessayer</button>
    </div>
  )
}
```

#### S39.WF.2 — `roadmaps.ts` aux 6 formats

`lib/post-creator/roadmaps.ts` :
- Ajouter `manifeste` et `question` aux exports
- Mêmes champs (slug, label, description, color) que les 4 existants
- Référencer `lib/i18n/formats.ts` comme source de vérité (importer
  FORMAT_LABELS et dériver)

#### S39.WF.3 — Tests isolation 5/5 sur `pillars` + `posts`

`scripts/test-multi-tenant.ts` étendu — 10 cas de test :
- 2 tenants A et B avec données seed
- 5 attempt mutations cross-tenant sur `pillars`
- 5 attempt mutations cross-tenant sur `posts`
- Tous doivent renvoyer erreur `tenant_guard`

---

## Effort total estimé

| Axe | Items | Effort cumulé |
|---|---|---|
| Sécurité | 5 | 2 jours |
| Migration pilier_id | 6 | 3 jours |
| Doctrine | 4 | 1 jour |
| Copy/UI urgent | 6 | 1 jour |
| Workflow urgent | 3 | 1 jour |
| **Total** | **24 items** | **~8 jours-homme** |

Pour 1 dev senior : Sprint 39 = 5 jours ouvrés serrés. Si tension :
prioriser Sécurité + Doctrine et reporter Migration pilier_id à Sprint 40
(mais alors la coexistence sur `/ma-marque` reste affichée — moins idéal).

---

## Critères de succès Sprint 39 (Validé/Recalé)

### Hard requirements

- ✅ ZERO `createAdmin()` mutation sans `assertTenantOwnership` (audit
  automatisé via grep dans le hook pre-commit)
- ✅ `scripts/test-multi-tenant.ts` passe 5/5 sur les nouvelles tables
- ✅ Aucun consumer ne lit `brands.piliers_narratifs` (grep)
- ✅ Aucun consumer ne lit `posts.pilier_nom` (grep)
- ✅ `posts.pilier_id` FK consommée par PostCreator, PostEditor,
  Bibliothèque, Programme
- ✅ `skills/00, 01, 04, 10` mis à jour avec date validité
- ✅ ZERO `#1F4937` dans `app/*` et `components/*` (sauf `audits/` historique)
- ✅ ZERO "onboarding" en UI utilisateur (aria-label, copy visible)
- ✅ "conseiller" minuscule partout en UI
- ✅ `loading.tsx` + `error.tsx` sur les 5 routes nav

### Soft requirements (nice to have)

- ✅ Documentation `VOICE_SHEET_RULES` étendue (P1.A.3)
- ✅ Helper `getUserTenantId()` factorisé (P1.A.9)
- ✅ Migration 027 drop legacy préparée (pas appliquée)

### Critères Recalé Sprint 39

- ❌ Si un seul Hard requirement échoue → Sprint 39 Recalé
- ❌ Si tests isolation pas à 5/5 → Sprint 39 NE PAS METTRE EN PROD
- ❌ Si backfill expose plus de 5 incohérences JSONB par tenant → revoir
  approche avec Lead

---

## Risques + plans B

### Risque 1 — Backfill `pillars` expose incohérences JSONB legacy

Probabilité : moyenne. Les JSONB stockent du texte libre, certains titres
peuvent dépasser 50 char ou 3 mots, certaines descriptions être vides.

Plan B :
- Avant backfill prod : script de validation `validate-jsonb-pillars.ts`
  qui liste tous les écarts par tenant
- Nettoyer manuellement les 3 tenants pilotes (Angelina, Tous en Tête,
  Comptoir) avant backfill
- Document de communication au Lead avec preview des changements

### Risque 2 — `.eq('tenant_id', X)` casse des flows admin légitimes

Probabilité : faible mais réelle pour `app/(admin)/tenants/*`.

Plan B :
- Pour les pages admin, garder l'admin client BYPASS RLS mais filtrer
  explicitement le tenant en query params (`?tenant=slug`)
- Ne pas appliquer `assertTenantOwnership` aux server actions sous
  `app/_actions/admin/*` (à créer si pas existant)

### Risque 3 — skills/ mis à jour mais agents IA en cache

Probabilité : élevée pour les agents Claude actifs.

Plan B :
- Communiquer dans `audits/sprint-39/RESET_REQUIRED.md` que tous les
  agents doivent recharger les skills
- Date de validité visible dans chaque skill évite ce piège pour les
  prochains sprints

### Risque 4 — `loading.tsx` rate des cas edge (Suspense boundary mal placé)

Probabilité : faible.

Plan B :
- Tester chaque route en throttling 3G via DevTools
- Ajouter Suspense boundaries explicites si la loading.tsx ne capture
  pas

### Risque 5 — Sprint 39 déborde sur Sprint 40

Probabilité : moyenne (estimation 8 jours pour 5 ouvrés).

Plan B :
- Si fin Sprint 39 dépassement > 1 jour : faire un Sprint 39.5 entre 39
  et 40 plutôt que d'amputer 40
- Migration pilier_id peut être splittée en deux : PostCreator/PostEditor
  Sprint 39, Bibliothèque/Programme Sprint 39.5

---

## Communication clients pilotes

À envoyer après backfill staging validation :

- **Angelina Paris** : "Nous avons réorganisé la gestion des piliers
  narratifs pour une vraie persistance. Vos 3 piliers existants ont été
  migrés sans perte. Tu vas voir un wizard simplifié sur Ma Marque."
- **Tous en Tête** : idem
- **Le Comptoir Général** : idem + mention spécifique "Lieu refuge" qui
  était un pilier exemple dans nos system prompts.

Pas de notification interruption service prévue. Backfill non bloquant.

---

## Post-Sprint 39 — État attendu

- 0 P0 ouvert
- skills/ alignés sur produit réel
- Sécurité multi-tenant 5/5
- Migration pilier_id 100% (sauf drop colonnes legacy = Sprint 40)
- 5 routes nav avec loading + error
- ~6 P1 secondaires non traités (acceptable, vont en Sprint 40)

Le Sprint 39 livre une **plateforme propre** prête à recevoir le polish
UI massif Sprint 40 sans accumuler de dette technique nouvelle.
