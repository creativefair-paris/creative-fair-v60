# Sprint 41-secu-compte — Decisions Claude Code

> Log des décisions et arbitrages techniques pris pendant l'exécution des
> 4 chantiers A (sécurité multi-tenant P0), B (tests E2E obsolètes),
> C (dette lint), D (renommage route /compte).
> Branche : `sprint-41-secu-compte`.

---

## Décision 1 — Anomalie du brief

Le fichier `audits/sprint-41-secu-compte/brief.md` (commit `840eac5`) contient en réalité une **copie verbatim de l'ancien brief Sprint 43-stable** (lignes 1-660 identiques au brief Sprint 43-stable livré). Le titre, le nom de branche, la liste des 7 pages, le §4.2 "Patterns CSS depuis les HTML mockups", etc. correspondent tous à Sprint 43-stable, pas à Sprint 41-secu-compte.

**Décision :** je documente l'anomalie et j'**infère la mission** depuis :

1. Le nom de la branche `sprint-41-secu-compte`.
2. Le message du commit Lead `docs(sprint-41-secu-compte): brief Lead - patch P0 + tests + lint + route compte`.
3. La demande utilisateur explicite "4 chantiers A/B/C/D".
4. Le contenu déjà identifié dans Sprint 40 `10-transverse.md` §1 (faille P0 multi-tenant, 23 fichiers, pattern canonique).
5. L'auto-évaluation Sprint 43-stable qui flague la dette lint (4 erreurs + 31 warnings) et le renommage `/compte/mon-compte → /compte` comme reportés.

**Plan d'exécution dérivé** :
- **A — Sécurité multi-tenant P0** : patcher les 23 fichiers listés `10-transverse.md` §1.3 selon pattern canonique §1.5 (créer un helper `assertTenantOwnership()` partageable + adapter chaque fichier).
- **B — Tests E2E obsolètes** : identifier les tests qui référencent du code Conseiller V1 supprimé Sprint 40 Phase 2B et les marquer `.skip` ou les supprimer.
- **C — Dette lint** : résoudre les 4 erreurs lint pré-existantes (3 setState dans useEffect + 1 entité non-échappée). Warnings 31 = à arbitrer Lead.
- **D — Renommage route Compte** : déplacer `app/(compte)/compte/mon-compte/page.tsx` → `app/(compte)/compte/page.tsx` (URL `/compte` au lieu de `/compte/mon-compte`).

---

## Décision 2 — Ordre d'exécution

Je procède dans l'ordre **D → B → A → C** :

- **D** (renommage Compte) en premier : refactor structurel propre, peu d'impact.
- **B** (tests E2E) : nettoyer avant les patches code pour ne pas confondre les régressions.
- **A** (sécurité P0) : cœur du sprint, gros chantier.
- **C** (lint) : finalisation, juste après le gros chantier.

---

## Décision 3 — Pattern canonique multi-tenant (chantier A)

Selon `04-MULTI_TENANT.md` + `10-transverse.md` §1.5, deux patterns acceptables :

**Pattern A1 (préférable) — supprimer `createAdmin()` et utiliser `createClient()`** :
```ts
const supabase = await createClient()
const { data } = await supabase.from('table').select('*').eq('id', someId)
// → RLS filtre automatiquement par tenant_id
```

**Pattern A2 (si `createAdmin()` nécessaire pour cas particulier) — filtrer manuellement** :
```ts
const supabaseUser = await createClient()
const { data: { user } } = await supabaseUser.auth.getUser()
if (!user) return { error: 'unauthorized' }

const { data: profile } = await supabaseUser
  .from('profiles')
  .select('tenant_id')
  .eq('id', user.id)
  .maybeSingle()
const tenantId = (profile as { tenant_id?: string } | null)?.tenant_id
if (!tenantId) return { error: 'no_tenant' }

const admin = createAdmin()
const { data } = await admin
  .from('table')
  .select('*')
  .eq('id', idFromUser)
  .eq('tenant_id', tenantId)   // ← obligatoire
```

**Décision** : je privilégie **Pattern A1** quand c'est possible (la majorité des cas RLS fait le travail). Pattern A2 seulement quand `createAdmin()` est requis pour une raison technique (ex: jointures inaccessibles avec anon role).

---

## Décision 4 — Helper `assertTenantOwnership`

Création d'un helper partagé `lib/supabase/tenant-guard.ts` qui factorise :
1. Lecture `tenant_id` depuis profile (user.id).
2. Vérification d'appartenance d'une entité au tenant.

Signature proposée :
```ts
export async function getCurrentTenantId(): Promise<string | null>
export async function assertOwnership(
  table: 'posts' | 'brands' | 'pillars' | ...,
  id: string,
  tenantId: string,
): Promise<boolean>
```

---

## Décision 5 — Stratégie tests E2E (chantier B)

Tests E2E concernés (cf. Sprint 40 auto-évaluation Q6) :
- `tests/e2e/05-conseiller.spec.ts` : tout le module Conseiller V1 supprimé.
- `tests/e2e/sprint-37/*` : tests Sprint 37 référençant Conseiller V1.
- `tests/e2e/03-navigation-4-destinations.spec.ts` : ancienne nav 4 destinations dégagée.

**Décision :** je supprime les tests obsolètes (avec backup dans `archive/v1-leftovers/tests-e2e-obsolete/`) plutôt que de les marquer `.skip`. Raison : ces tests ne pourront jamais être réactivés tels quels (le code testé n'existe plus). La re-création de tests E2E pour V2.0 est un sprint dédié futur (Sprint 44+).

Le brief Sprint 43-stable §3.2 listait "Pas de tests E2E ajoutés ni mis à jour — Sprint 44+ dédié". Le présent Sprint 41-secu-compte ne crée pas de nouveaux tests V2.0 — il supprime juste l'obsolescence pour assainir.

---

## Décision 6 — Stratégie dette lint (chantier C)

Les 4 erreurs pré-existantes :

1. `components/ma-marque/piliers/PiliersBanner.tsx:41` — setState dans useEffect.
2. `components/onboarding-marque/BrandOnboardingTrigger.tsx:226` — apostrophe non échappée.
3. `components/pillars/PillarWizardSheet.tsx:59` — setState dans useEffect.
4. `components/programme/ProgrammeCalendarView.tsx:35` — setState dans useEffect.

**Décision :** patches chirurgicaux sans modifier la logique métier :
- Apostrophe : remplacer `'` par `&apos;` ou `&#39;` dans JSX.
- setState dans useEffect : refactor minimal pour appeler setState **avant** le useEffect (pattern initialState calculé) ou avec dépendances correctes.

Pour les 31 warnings : je résous les unused-vars/imports faciles. Les autres (exhaustive-deps, eslint-disable directive inutile) sont laissées au sprint UI polish.

---

## Décision 7 — Renommage route Compte (chantier D)

Déplacement `app/(compte)/compte/mon-compte/page.tsx` → `app/(compte)/compte/page.tsx`.

Pourquoi `(compte)/compte/` au lieu de `(app)/compte/` :
- Brief Sprint 43-stable §5.1 demandait `(app)/compte/` mais decisions Sprint 43-stable §1 = structure mixte conservative conservée (groupes existants).
- Cohérent avec les autres pages Sprint 43-stable refactorées en place (aujourd-hui, programme, ma-marque).
- URL canonique V2.0 = `/compte` (top-level, doctrine `01-ARCHITECTURE.md §1`).

Impact router :
- `/compte/mon-compte` → 404 après le déplacement.
- Tous les liens existants pointant vers `/compte/mon-compte` doivent être mis à jour vers `/compte`.

---

*Document complété au fil de l'exécution. Décisions supplémentaires ajoutées au fur et à mesure.*
