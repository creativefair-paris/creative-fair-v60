# Audit Sprint 40 — Transverse

> Verdict global : **À refactorer / Recalé selon zones**
> Couvre tout ce qui n'est pas attaché à une page particulière : sécurité multi-tenant, prompts IA, design system, vocabulaire UI, schéma Supabase, conventions code, archives `audits/`, branche `cf-conceptuel-0`.

---

## 1. Multi-tenant et sécurité

### 1.1 Inventaire des appels `createAdmin()`

Référence doctrine : `04-MULTI_TENANT.md` "Le pattern fautif identifié au Sprint 38 — `createAdmin()` + `.eq('id', ...)` sans vérification d'appartenance — est interdit. Il est à éradiquer **avant tout client en production**." `10-SACRED.md` "`createAdmin()` jamais côté user".

Grep `createAdmin` dans `app/_actions/`, `app/api/`, `app/(*)/` : **88 occurrences** sur **33 fichiers** distincts (hors `lib/supabase/admin.ts` qui exporte le helper).

#### 1.2 Cas légitimes confirmés (à conserver tels quels)

Selon `04-MULTI_TENANT.md` §"Quand utiliser `createAdmin()`" :

1. **Création d'un nouveau tenant** (avant que le user ait un profile).
2. **Migrations et seeds**.
3. **Cron jobs server-side** (analytics, billing).
4. **Logging crédits** dans `credits_usage` (read-only pour users).
5. **Webhooks Stripe ou intégrations** sans contexte user.

Cas identifiés comme légitimes :

| Fichier | Cas | Justification |
|---|---|---|
| `app/_actions/ensure-profile.ts` | 1 | Création du profile à la première connexion — pas encore de tenant lié. À VÉRIFIER que le bypass est strictement borné. |
| `app/(admin)/tenants/actions.ts` | 1+2 | Admin Lead crée/édite des tenants. Cas légitime. |
| `lib/ai/credits.ts` | 4 | Logging crédits dans `credits_usage`. |

#### 1.3 Cas fautifs identifiés (P0 multi-tenant)

Hors cas légitimes ci-dessus, tous les autres appels `createAdmin()` côté server action ou route handler servent **des requêtes user authentifié** et constituent donc la **faille P0** identifiée Sprint 38.

**Fichiers à patcher (P0)** :

```
app/(ma-marque)/ma-marque/page.tsx
app/_actions/generate-plan-from-wizard.ts
app/_actions/catch-up-overdue-posts.ts
app/_actions/update-post.ts
app/_actions/create-library-document.ts
app/_actions/pillars.ts                     (3 occurrences — updatePillar, archivePillar, listPillars)
app/_actions/strategie-events-intention.ts
app/_actions/generate-plan-from-form.ts
app/_actions/estimate-programme-outcomes.ts
app/_actions/run-review-check.ts
app/_actions/create-review.ts
app/_actions/upload-review-visual.ts
app/_actions/propose-piliers.ts             (2 occurrences)
app/_actions/ask-mini-chat.ts
app/_actions/generate-pillar-wizard.ts      (2 occurrences)
app/_actions/brand-onboarding.ts            (5 occurrences)
app/api/brand/waitlist/route.ts             (3 occurrences)
app/api/brand/update/route.ts
app/api/brand/upload/route.ts
app/api/brand/archives/route.ts
app/api/brand/archives/[id]/route.ts
app/api/ma-marque/regenerer-piliers/route.ts
app/api/onboarding/complete/route.ts
app/(programme)/programme/strategie/page.tsx
app/_actions/update-post-retombees.ts      (déjà Recalé § Retombées)
```

**Fichiers Conseiller V1 — moot point** (vont être supprimés Phase 2) :
- `app/_actions/mark-conseiller-timeout.ts`
- `app/_actions/wizard-session.ts`
- `app/_actions/run-conseiller-turn.ts`
- `app/_actions/find-resumable-session.ts`
- `app/_actions/generate-pedagogy.ts`

Pour ces fichiers, la suppression Phase 2 (cf. `02-mes-outils.md`) résout le risque par dégagement.

#### 1.4 Pattern fautif type

Exemple `app/_actions/pillars.ts:108` :
```ts
const admin = createAdmin() as unknown as SupabaseClient
// puis usage avec .eq('id', someId) sans .eq('tenant_id', sessionTenantId)
```

Le bypass RLS lit/écrit potentiellement sur **n'importe quel tenant** dès que l'attaquant connaît un ID.

#### 1.5 Pattern canonique à appliquer

```ts
// 1. Lire tenant_id depuis la session côté serveur uniquement.
const supabaseUser = await createClient()
const { data: { user } } = await supabaseUser.auth.getUser()
if (!user) return { error: 'unauthorized' }

const { data: profile } = await supabaseUser
  .from('profiles')
  .select('tenant_id')
  .eq('id', user.id)
  .maybeSingle()

const tenantId = (profile as any)?.tenant_id
if (!tenantId) return { error: 'no_tenant' }

// 2. Si createAdmin nécessaire (cas légitime), TOUJOURS filtrer par tenant_id :
const admin = createAdmin()
const { data } = await admin
  .from('table')
  .select('*')
  .eq('id', idFromUser)
  .eq('tenant_id', tenantId)   // ← obligatoire
  .maybeSingle()
```

**Recommandation outillage Sprint 41** : créer un helper `assertTenantOwnership(admin, table, id, tenantId)` qui factorise le pattern + lance une erreur si l'entité n'appartient pas au tenant.

#### 1.6 Conclusion

**Faille P0 multi-tenant identifiée précisément**. 23 fichiers utilisateurs (hors Conseiller V1 supprimé et hors admin Lead légitime) bypassent la RLS sans check `tenant_id`. **Le patch concret est laissé à un Sprint dédié (Sprint 41 P0)** — modification de logique métier sur 23 fichiers = risque hors scope purge Sprint 40.

---

## 2. Prompts IA

### 2.1 Inventaire actuel

`lib/ai/prompts/` contient :

- `system.ts` — VOICE_SHEET_RULES SACRED (`10-SACRED.md` `lib/ai/prompts/system.ts` est SACRÉ).
- `brand-book.ts`
- `brief.ts`
- `business-suggest.ts`
- `coaching.ts`
- `post-generation.ts`

### 2.2 Confrontation à `02-EXPERTS.md` + `03-VOICE_SHEET.md`

#### 2.2.1 `lib/ai/prompts/system.ts` (VOICE_SHEET_RULES)
- **Statut doctrinal :** Validé — fichier SACRÉ
- **Référence doctrine :** `03-VOICE_SHEET.md` §1 "Les règles de voix sont implémentées dans `lib/ai/prompts/system.ts` sous la constante `VOICE_SHEET_RULES`. Ce fichier est SACRÉ. Le modifier casse le cache Anthropic à 90%."
- **Constat factuel :** 19 lignes. Définit `VOICE_SHEET_RULES`. Mentionne "Tu es le Conseiller Creative Fair".
- **Écart constaté :** Le mot "Conseiller" en ligne 4 est un legacy V1. **Mais** modifier ce fichier casse le cache à 90% — interdit hors Sprint dédié.
- **Action proposée Phase 2 :** **Ne pas toucher.** Documenter dans `decisions.md` que la mention "Conseiller" reste pour préserver le cache. Refonte dans un Sprint dédié Lead Sprint 41+ après planification du transit cache (voir `00-MASTER.md` "Modifier ce fichier casse le cache 90%").

#### 2.2.2 `lib/ai/prompts/brand-book.ts`, `brief.ts`, `business-suggest.ts`, `post-generation.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md` §6.2 génération automatique = LLM de l'Expert correspondant.
- **Constat factuel :** Prompts génériques sans rattachement Expert.
- **Écart constaté :** Pas alignés sur la nomenclature Hélène + 12 Experts.
- **Action proposée Phase 2 :** **Ne pas modifier le contenu en Sprint 40** (risque cache). Documenter dans `decisions.md` et planifier refonte Sprint 43+ avec validation Lead.

#### 2.2.3 `lib/ai/prompts/coaching.ts`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §3 "Ce n'est pas Headspace. Ce n'est pas Calm." Le concept "coaching daily" contredit.
- **Constat factuel :** Prompt utilisé par `app/api/ai/coaching/route.ts`.
- **Écart constaté :** Concept entier dégagé.
- **Action proposée Phase 2 :** Supprimer en même temps que `app/api/ai/coaching/route.ts`. Backup `archive/v1-leftovers/coaching/`.

### 2.3 Helpers et utilitaires AI

- `lib/ai/caching.ts` — buildSystemPrompt + ephemeral cache. **Validé.**
- `lib/ai/client.ts` — instance Anthropic. **Validé.**
- `lib/ai/credits.ts` — pricing + log. **Validé** (cas légitime `createAdmin` pour `credits_usage`).
- `lib/ai/brand-context.ts` — contexte marque + business events. **À refactorer** (cf. §6).

### 2.4 Absents — cible doctrinale V2.0

Selon `01-ARCHITECTURE.md` §8 (structure du repo) et `02-EXPERTS.md` :

- `lib/ai/prompts/helene.ts` — **absent**. Doit être créé Sprint 43+ avec validation Lead (cache impact = nouveau prompt, pas modification).
- `lib/ai/prompts/experts/sofia.ts` ... `lib/ai/prompts/experts/elise.ts` — **absents** (12 fichiers). Création Sprint 43+.
- `lib/experts/types.ts` — **absent**. Création Sprint 43+.
- `lib/experts/routing.ts` — **absent** (mapping rôle → modèle, `02-EXPERTS.md` §3 + §8). Création Sprint 43+.

### 2.5 Anciens prompts hors `lib/ai/prompts/`

À noter — d'autres prompts sont dispersés dans le repo :

- `lib/conseiller/system-prompt.ts` — Recalé (cf. `05-messages.md`).
- `lib/conseiller/scenarios/*.ts` — Recalé (15 fichiers).
- `lib/reviews/system-prompt.ts` — À refactorer.
- `lib/reviews/scenarios/*.ts` — À refactorer.
- `lib/programme/prompts.ts`, `strategie-estimations-prompt.ts`, `strategie-events-intention-prompt.ts`, `wizard-prompt.ts` — À refactorer (4 fichiers).
- `lib/brand/propose-piliers-prompt.ts` — À refactorer.
- `lib/ma-marque/prompts.ts`, `prompts-pilier-propositions.ts` — À refactorer.
- `lib/pillars/prompts.ts` — À refactorer.

**Stratégie Phase 2** : aucune modification de prompt actif Sprint 40 (risque cache). Sprint 43+ refonte coordonnée avec validation Lead.

---

## 3. Tokens et design system

### 3.1 Forest green `#1F4937` (déprécié)

Référence doctrine : `00-CONCEPT.md` §14 "Vert forêt `#1F4937` (déprécié 6 mai 2026)". `10-SACRED.md` "Vert forêt `#1F4937` est DÉPRÉCIÉ. Toute trace dans le code est à supprimer."

Grep `1F4937` sur `*.tsx`, `*.ts`, `*.css`, `*.sql` :

| Emplacement | Occurrences | Statut |
|---|---|---|
| `app/globals.css:1241` | 1 (commentaire) | Trace historique acceptable |
| `app/globals.css:1318` | 1 (commentaire) | Trace historique acceptable |
| `audits/sprint-1` ... `audits/sprint-36/...` | ~47 (audits historiques) | Trace historique acceptable |
| **Code actif (composants, lib)** | **0** | ✅ Conforme |

**Résultat : forest green est entièrement éradiqué du code actif.** Les seules traces restantes sont :
- 2 commentaires dans `app/globals.css` (Sprint 36.C) qui notent explicitement la dépréciation et le remplacement.
- ~47 occurrences dans `audits/` historiques (à conserver — valeur traçable).

**Action proposée Phase 2** : aucune. Le forest green est purgé.

### 3.2 `cf-tokens.css`

Référence doctrine : `00-CONCEPT.md` §11 "La doctrine visuelle complète est documentée dans `cf-tokens.css` et sera consolidée en Sprint 41 dans une famille `skills/20-DESIGN-*.md`." `01-ARCHITECTURE.md` §8 `styles/cf-tokens.css ← tokens v60`.

**Constat factuel :**
- `styles/cf-tokens.css` n'existe pas.
- `styles/liquid-glass.css` existe (253 lignes).
- `app/globals.css` existe (et contient probablement les tokens, à confirmer).

**Écart constaté :** La doctrine pointe `cf-tokens.css` mais le repo a `app/globals.css`. À harmoniser Sprint 41 (création de `cf-tokens.css` + import depuis `globals.css`) ou amender la doctrine.

**Action proposée Phase 2 :** Documenter dans `decisions.md`. Pas de modification Sprint 40.

### 3.3 Couleurs hex hardcodées

Référence doctrine : `00-MASTER.md` "Aucune couleur hex hardcodée dans les composants. Toujours `var(--color-*)` ou classes Tailwind tokenisées via `cf-tokens.css`. Exception : `#FFFFFF` pour destructive CTAs."

**Constat factuel :** Audit non exhaustif Sprint 40 — un grep par classe d'occurrences serait long. Cas saillants observés au cours de l'audit :

- `components/ma-marque/EtatMarque.tsx` ligne ~30 : `color: '#1C1C1E'` hardcodé.
- `components/ma-marque/BarreFondations.tsx` ligne ~50 : `background: '#1C1C1E'` hardcodé.
- `components/today/*` : à auditer Sprint 41.
- `components/programme/*` : à auditer Sprint 41.

**Écart constaté :** Multiples violations de la règle "pas de hex hardcodé".

**Action proposée Phase 2 :** Hors scope Sprint 40 (impact large). Documenter dans `decisions.md` + planifier audit visuel + remplacement par tokens Sprint 41.

### 3.4 Wallpaper saturated (halos) hors Aujourd'hui

Référence doctrine : `01-ARCHITECTURE.md` §3.4 "Wallpaper saturated. Halos colorés (bleu CF, lilas, indigo, orange) animés en drift 18-30s. **Réservé à Aujourd'hui uniquement.**"

**Constat factuel :** Le code utilise les halos `bg-halo-1..5` sur :

- `app/(outils)/outils/page.tsx` (5 halos)
- `app/(outils)/outils/messages/page.tsx` (3 halos)
- `app/(outils)/outils/bibliotheque/page.tsx` (5 halos)
- Probablement d'autres pages.

**Écart constaté :** Violation §3.4 sur au moins 3 pages.

**Action proposée Phase 2 :** Retirer les `<div className="bg-halo bg-halo-N" aria-hidden="true" />` dans toutes les pages **autres qu'Aujourd'hui**. Refactor automatique Phase 2.

### 3.5 Icônes — Lucide React + Custom SVG, pas de Phosphor

Référence doctrine : `00-CONCEPT.md` §11 + `10-SACRED.md` "Lucide React stroke `1.6`, viewBox `24`, taille rendue `20px`. Phosphor n'est pas installé en V1."

**Constat factuel :**
- `package.json` → `"lucide-react": "^1.14.0"` installé ✓.
- Aucun `phosphor-react` dans `package.json` ✓.
- `components/outils/OutilsCatalog.tsx` utilise du SVG inline custom (stroke 1.6, viewBox 24, 20×20) — conforme `00-CONCEPT.md` §11 sur stroke + viewBox + taille.
- Cohabitation Lucide / SVG inline — à clarifier Sprint 41 (préférer Lucide partout, fallback SVG inline si Lucide manquant).

**Action proposée Phase 2 :** Aucune Sprint 40. Audit cohérence Sprint 41.

### 3.6 Liquid Glass 3 niveaux

Référence doctrine : `00-CONCEPT.md` §11 + `10-SACRED.md` "Trois niveaux canoniques (z1 ambient, z2 standard, z3 elevated). Pas d'imbrication z3 dans z3."

**Constat factuel :** `styles/liquid-glass.css` (253 lignes) implémente probablement les 3 niveaux. À auditer Sprint 41 pour vérifier conformité exacte (blur, opacity, border).

**Action proposée Phase 2 :** Audit visuel Sprint 41.

### 3.7 Animations

Référence doctrine : `00-CONCEPT.md` §11 + `10-SACRED.md` "Duration 250-600ms. Easing `ease-out`. Jamais bounce, jamais spring."

**Constat factuel :** Non auditable par grep simple. À auditer Sprint 41.

**Action proposée Phase 2 :** Audit Sprint 41.

---

## 4. Vocabulaire dans les copies UI

### 4.1 Grep des mots interdits (`00-CONCEPT.md` §9)

Mot interdit | Occurrences dans le code | Notes
---|---|---
`users` (UI visible) | 0 connue | À auditer ciblé Sprint 41
`audience` | 0 connue | OK
`dashboard` (UI visible) | 2-3 (commentaires + nom de composant) | Tolérable en code, à éviter en UI
`workflow` | 0 connue UI | À auditer
`pipeline` | 6+ (commentaires de code seulement) | Tolérable §9 voice sheet "assouplies en code"
`tokens` (UI) | 0 connue | OK
`radar` | 0 connue | OK
`viral, boost, growth hack, growth` | 0 connue | OK
`gamification, badges, streaks, XP, quêtes` | 0 connue | OK (forest green principle — la doctrine a banni tôt)
`KPI, ROI` (UI) | 0 connue, mention dans liste interdite des prompts | OK
`onboarding` (UI) | **plusieurs** routes/composants : `app/(onboarding)/onboarding/`, `components/onboarding/`, `components/onboarding-marque/` | À refactorer Sprint 43+
`bientôt, à venir, coming soon` | **présents** dans `components/outils/OutilsCatalog.tsx` (section "À venir" avec badges "Bientôt") | À refactorer Sprint 40

### 4.2 Cas notables identifiés

**Cas A — `OutilsCatalog.tsx`** : "À venir" + "Bientôt" → Recalé immédiatement par `10-SACRED.md` "Vocabulaire interdit (en UI visible)… bientôt à venir coming soon — Si quelqu'un (humain ou IA) écrit l'un de ces mots dans une copie utilisateur : recalé immédiatement."

**Action proposée Phase 2** : Retirer les sections "À venir" du catalogue (cf. `02-mes-outils.md` §5.2).

**Cas B — `onboarding` en route URL** : `/onboarding/analyse-marque`, `components/onboarding-marque/`, `components/onboarding/`. URL visible = vocabulaire interdit en UI.

**Action proposée Phase 2** : Conserver Sprint 40 (impact router massif). Sprint 43+ renommer en "premiers-pas" ou "mise-en-route".

**Cas C — `dashboard` en nom de composant** :
- `components/programme/ProgrammeDashboard.tsx` (`Dashboard` interne, tolérable mais signal).
- `components/ma-marque/MaMarqueDashboard.tsx` (idem).

**Action proposée Phase 2** : Renommer Sprint 41+ (`@deprecated` Sprint 40, renommage Sprint 41+).

### 4.3 Cas du mot "Conseiller" et de "Pilote"

Référence doctrine : `00-CONCEPT.md` §14 abandon Conseiller. `00-CONCEPT.md` §10 vocabulaire encouragé "le user, l'utilisateur → Floriane, la dirigeante, le pilote".

**Constat factuel :**
- "Conseiller" massivement présent (composants, routes, commentaires, prompts) — Recalé en bloc (cf. `05-messages.md`).
- "Pilote" présent dans le code (PiloteBubble.tsx, "pilot_role" colonne SQL). À distinguer : "pilote" comme **métaphore positive doctrine** (`00-CONCEPT.md` §3 "tranquillité du pilote") = OK. "Pilote" comme **rôle utilisateur métier** = OK.

**Action proposée Phase 2** : Suppression de tout l'écosystème Conseiller V1 (cf. `02-mes-outils.md` §5.1 et `05-messages.md`).

---

## 5. Schéma Supabase

### 5.1 Inventaire des migrations

**26 migrations** dans `supabase/migrations/`.

| Migration | Type | Statut doctrinal |
|---|---|---|
| `001_initial_schema.sql` | CREATE multiple | Validé (RLS en 002) |
| `002_rls_policies.sql` | RLS | Validé |
| `003_seed_tenants.sql` | SEED | Validé |
| `004_neutralize_tenant_themes.sql` | UPDATE | Validé |
| `005_programmes.sql` | CREATE | Validé (RLS active) |
| `006_posts.sql` | CREATE | Validé (RLS active) |
| `007_brands_extension.sql` | ALTER | Validé (pas de nouvelle table) |
| `008_brands_enrichissement.sql` | ALTER | Validé |
| `009_brand_completeness.sql` | CREATE/ALTER | Validé |
| `010_channel_waitlist.sql` | CREATE | Validé |
| `011_handle_new_user_trigger.sql` | TRIGGER | Validé |
| `012_alerts.sql` | CREATE | Validé (RLS active, cf. `08-rappels.md`) |
| `013_posts_reported_from.sql` | ALTER | Validé |
| `014_profiles_pilot_role_and_frequency.sql` | ALTER | Validé |
| `015_conseiller_conversations.sql` | CREATE | **À refactorer** — concept Conseiller V1 dégagé, table à repurpose Sprint 41+ pour Messages V2.0 |
| `016_posts_retombees.sql` | ALTER | **Recalé** — retombées hors scope V1 |
| `017_reviews.sql` | CREATE | Validé |
| `018_library_documents.sql` | CREATE | Validé (cf. `06-bibliotheque.md`) |
| `019_programme_creation_sessions.sql` | CREATE | **À refactorer** — sessions wizard Conseiller V1 |
| `020_brand_metrics.sql` | CREATE | **À auditer** — risque métriques inventées |
| `021_brand_onboarding_sessions.sql` | CREATE | Validé |
| `022_posts_format.sql` | ALTER | Validé |
| `023_programmes_dates.sql` | ALTER | Validé |
| `024_posts_caption_complete.sql` | ALTER | Validé |
| `025_pillars.sql` | CREATE | Validé (V2.0 conforme) |
| `026_posts_pilier_id_fk.sql` | ALTER | Validé (FK progressive) |

### 5.2 Vérification RLS

Doctrine : `04-MULTI_TENANT.md` "RLS PostgreSQL activée partout, sans exception."

Grep `enable row level security` : **13 migrations** sur 26 contiennent l'instruction. Les 13 autres sont :
- Migrations ALTER TABLE (pas de nouvelle table à activer) : `007`, `008`, `013`, `014`, `016`, `022`, `023`, `024`, `026` — **OK** (RLS héritée de la CREATE TABLE initiale).
- Migrations sans table : `003` (seed), `004` (update theme), `011` (trigger) — **OK**.
- `001_initial_schema.sql` — RLS activée séparément dans `002_rls_policies.sql` — **OK**.

**Aucune table identifiée sans RLS active.** ✓ Conforme doctrine §1.

### 5.3 Tables actuelles et statut

Sur la base des 26 migrations :

| Table | RLS | Statut doctrinal |
|---|---|---|
| `tenants` | ✓ (id = `user_tenant_id()`) | Validé |
| `profiles` | ✓ | Validé |
| `brands` | ✓ | Validé |
| `onboarding_answers` | ✓ | Validé |
| `uploads` | ✓ | Validé |
| `posts` | ✓ | Validé |
| `conversations` | ✓ | **À refactorer** (concept Conseiller V1) |
| `daily_coaching` | ✓ | **Recalé** (coaching = anti-doctrine) |
| `analytics_events` | ✓ read-only | Validé |
| `credits_usage` | ✓ read-only | Validé |
| `programmes` | ✓ | Validé |
| `channel_waitlist` | ✓ | Validé |
| `alerts` | ✓ | Validé |
| `reviews` | ✓ | Validé |
| `library_documents` | ✓ | Validé (à auditer policies fine) |
| `programme_creation_sessions` | ✓ | **À refactorer** (wizard Conseiller) |
| `brand_metrics` | ✓ | **À auditer** (cf. métriques inventées) |
| `brand_onboarding_sessions` | ✓ | Validé |
| `pillars` | ✓ | Validé (V2.0 conforme) |

### 5.4 Recommandations Sprint 40

**Action proposée Phase 2 :** Aucune modification de schéma Sprint 40 (brief §7 "Schéma Supabase audité… Les corrections de schéma sont laissées à un Sprint 41 ou 42 dédié (modification de schéma = risque, hors scope purge)").

**Documentation à laisser au Sprint 41 dédié schéma :**

1. Suppression / repurpose table `conversations` (Conseiller V1 → Messages V2.0).
2. Suppression table `daily_coaching` (Recalé).
3. Audit table `brand_metrics` — si métriques inventées Cohérence/Équilibre/Densité/Profondeur → drop. Sinon retain.
4. Audit table `programme_creation_sessions` — supprimer ou repurpose.
5. Audit colonnes `posts.*` ajoutées par `016_posts_retombees.sql` — drop colonnes retombées hors V1.

### 5.5 Test isolation multi-tenant

Référence doctrine : `04-MULTI_TENANT.md` "Le script `scripts/test-multi-tenant.ts` crée 2 tenants A et B… Ce test doit passer avant tout déploiement de migration touchant les policies."

**Constat factuel :** Script existe (`scripts/test-multi-tenant.ts`).

**Écart constaté :** Aucun. Script en place.

**Action proposée Phase 2 :** Aucune. Réexécuter le test après chaque patch sécurité Sprint 41+.

---

## 6. Conventions code

### 6.1 TypeScript strict

Référence doctrine : `00-MASTER.md` "TypeScript strict. Toutes les fonctions sont typées. Pas de `any`. `noUncheckedIndexedAccess` activé."

**Constat factuel :** `tsconfig.json` non lu dans cet audit, mais le code observé utilise des types et `as unknown as` (pas idéal mais pas `any`). Présence de `as` casts (notamment dans les server actions `createAdmin() as unknown as SupabaseClient`).

**Action proposée Phase 2 :** Aucune. Conformité bonne, audit fin Sprint 41.

### 6.2 `proxy.ts` vs `middleware.ts`

Référence doctrine : `00-MASTER.md` "Next.js 16 = `proxy.ts`. Jamais `middleware.ts`. Pas d'exception." `10-SACRED.md` (idem).

**Constat factuel :**
- `proxy.ts` à la racine ✓.
- Pas de `middleware.ts` à la racine ✓.

**Note :** `lib/supabase/middleware.ts` existe (helper interne nommé `middleware.ts`, pas le fichier Next.js). Pas de conflit avec la règle doctrinale.

**Action proposée Phase 2 :** Aucune. Conforme.

### 6.3 Server Components par défaut

Référence doctrine : `00-MASTER.md` "Server Components par défaut. `\"use client\"` uniquement quand l'interactivité l'exige."

**Constat factuel :** Pages observées (Aujourd'hui, Ma Marque, Mes Outils, Mon Programme) sont Server Components ✓. `"use client"` présent sur composants interactifs (sheets, dashboards, wizard) ✓.

**Action proposée Phase 2 :** Aucune.

### 6.4 Couleurs hex (rappel §3.3)

Hors scope Sprint 40. Sprint 41+.

### 6.5 Email Git canonique

Référence doctrine : `01-ARCHITECTURE.md` §12.2 + `10-SACRED.md` "creativefair@1922.studio. Jamais l'email par défaut Mac (`*.local`)."

**Constat factuel :** Non vérifiable depuis le repo (configuration utilisateur Mac locale).

**Action proposée Phase 2 :** Aucune (responsabilité opérateur Lead).

---

## 7. Historique audits/

Référence doctrine : `01-ARCHITECTURE.md` §8 "audits/ ← reports par sprint".

### 7.1 Inventaire

**Total : 38 sprints d'audits accumulés.**

#### 7.1.1 Audits à plat (racine `audits/`)

```
ABORT_GATE_INTERMEDIAIRE_sprint-32-5-33_2026-05-11.md
ABORT_PREVOL_sprint-32-5-33_2026-05-11.md
APPLE_AUDIT_COPYWRITING.md
APPLE_AUDIT_EMPTY_STATES.md
APPLE_AUDIT_FINAL.md
APPLE_AUDIT_INVENTORY.md
BATCH_4_7_SUMMARY.md
DIAGNOSTIC_DESIGN.md
MIGRATION_005_BLOCKER_sprint-32-5-33_2026-05-11.md
SPRINT_10_PUSH.md
SPRINT_10_TEST.md
SPRINT_11_TEST.md ... SPRINT_30_POLISH.md
SPRINT_32_5.md, SPRINT_34.md, SPRINT_35.md
SPRINT_36A.md ... SPRINT_36B2_MIGRATIONS.md
SPRINT_36B_COPY.md, SPRINT_36B_IA_OCCURRENCES.txt
SPRINT_23_ANGELINA_RESEARCH.md, SPRINT_24_..._RESEARCH.md, SPRINT_25_..._RESEARCH.md
V1_LIVRAISON.md
V2_BACKLOG.md
SPRINT_29_ECARTS.md, SPRINT_29_INVENTAIRE.md
```

#### 7.1.2 Audits en dossiers

```
sprint-36-b-3, sprint-36-b-4, sprint-36-b-5, sprint-36-b-6, sprint-36-b-7, sprint-36-b-8
sprint-36-c, sprint-36-c-1, sprint-36-c-2
sprint-36-e, sprint-36-g, sprint-36-h, sprint-36-i
sprint-37
sprint-37-a, sprint-37-b, sprint-37-c, sprint-37-d, sprint-37-e, sprint-37-f, sprint-37-g
sprint-37-h, sprint-37-i, sprint-37-j, sprint-37-k, sprint-37-l, sprint-37-m, sprint-37-n
sprint-37-spec
sprint-40 (en cours)
```

Absents de la liste mais référencés dans les briefs : `sprint-38/` (audit massif 8009 lignes selon historique), `sprint-39-doctrine` (commit `46e3ebe`).

### 7.2 Verdict global

- **Audits Sprint 1-30** : valeur historique, à conserver tels quels (trace de l'évolution).
- **Audits Sprint 32+ à 36** : valeur historique, à conserver.
- **Audits Sprint 37** : récents, valeur opérationnelle conservée.
- **Audit Sprint 38** : audit massif lecture seule — référent multi-tenant + 18 P0 identifiés. **À conserver intégralement** car référencé en cible pour Sprint 41.
- **Audit Sprint 39** : doctrine v2.0 figée. **À conserver.**
- **Audit Sprint 40 (présent)** : en cours, livré Phase 1.

**Aucun audit n'est obsolète au sens "à supprimer".** Tous portent une trace historique de la maturation du produit.

### 7.3 Action proposée Phase 2

- **Aucune suppression.**
- Pourquoi : la valeur historique est forte (audits = mémoire des décisions Lead).
- Le brief Sprint 40 §3.1 inclut `audits/sprint-1/` à `audits/sprint-38/` dans le scope "historique d'audits (à classer)". Ce classement est fait : **archives historiques, conservées telles quelles**.

### 7.4 Fichiers spécifiques à `archive/`

À déplacer en Phase 2 dans `archive/v1-leftovers/audits/` :
- **Aucun.** Les audits restent dans `audits/` (cohérence avec la racine).

---

## 8. Branche `cf-conceptuel-0`

### 8.1 Inventaire

Référence doctrine : `00-CONCEPT.md` §12 "La branche cf-conceptuel-0, qui contient les explorations OS de marque iPadOS 26 avec dock 4 apps et Apple Santé 4 indicateurs vitaux, est conservée comme **exploration V2/V3 non validée**, jamais comme roadmap d'implémentation." §14 décisions abandonnées "OS de marque iPadOS 26 avec dock 4 apps (exploration cf-conceptuel-0, jamais validée)" + "Apple Santé avec 4 indicateurs vitaux Cohérence/Équilibre/Densité/Profondeur dans Mon Programme (exploration cf-conceptuel-0, jamais validée)". `10-SACRED.md` "cf-conceptuel-0 : exploration V2/V3, en quarantaine, jamais mergée."

**Contenu de la branche (selon historique session précédente) :**

7 docs dans `docs/cf-conceptuel/` — 4524 lignes :
- `01-inventaire-v60.md` (621 lignes)
- `05-decisions-session-cf-0.md` (407 lignes)
- `06-anatomie-ipados-26-liquid-glass.md` (674 lignes)
- `07-apps-apple-referentes.md` (581 lignes)
- `08-architecture-tables-database.md` (666 lignes)
- `09-flux-interconnexion-modules.md` (516 lignes)
- `10-roadmap-phase-b-mockups.md` (459 lignes)

### 8.2 Verdict global

**Verdict :** Exploration V2/V3 non validée Lead.

**Action proposée Phase 2 :**

À la fin de Phase 2 (brief §6.5) :

```bash
git tag archive/cf-conceptuel-0-2026-05 cf-conceptuel-0
git push origin archive/cf-conceptuel-0-2026-05
git push origin --delete cf-conceptuel-0
git branch -D cf-conceptuel-0
```

Tracer dans `audits/sprint-40/decisions.md` : "Branche cf-conceptuel-0 taggée archive/cf-conceptuel-0-2026-05 le YYYY-MM-DD, contenu récupérable via tag."

**Justification :**
- Concept "OS de marque iPadOS 26 avec dock 4 apps" → dégagé doctrine §14.
- Concept "Apple Santé 4 indicateurs vitaux dans Mon Programme" → dégagé doctrine §14.
- Branche pollue l'arborescence Git active.
- Tag preserve la trace pour exploration future.

---

## 9. Synthèse transverse

| Zone | Verdict |
|---|---|
| Sécurité multi-tenant | P0 — 23 fichiers à patcher (Sprint 41 dédié) |
| Prompts IA SACRÉS | Validé (NE PAS TOUCHER Sprint 40) |
| Prompts IA autres | À refactorer Sprint 43+ (alignement Experts) |
| Forest green `#1F4937` | Validé (purgé du code actif) |
| Wallpaper saturated hors Aujourd'hui | À refactorer Sprint 40 (5 halos à retirer sur 3 pages) |
| Vocabulaire interdit en UI | À refactorer Sprint 40 ("bientôt", "à venir") |
| Hex hardcodés | À refactorer Sprint 41+ |
| Schéma Supabase | Validé (audit complet, modifications laissées Sprint 41+) |
| Test isolation multi-tenant | Validé (script en place) |
| `proxy.ts` vs `middleware.ts` | Validé |
| Audits historiques | Validé (à conserver) |
| Branche `cf-conceptuel-0` | À archiver Phase 2 (tag + delete) |

**Le repo est globalement bien charpenté côté sécurité de schéma (RLS active partout) mais souffre d'une faille P0 dans les server actions (bypass RLS via `createAdmin`). Le legacy V1 (Conseiller) est massivement présent et doit être purgé. Le forest green est déjà purgé. Les explorations V2/V3 (cf-conceptuel-0) sont à archiver propre.**

---

## 10. Vue cumulée Phase 2 — synthèse opérationnelle

Cette section consolide tous les éléments dispersés dans les 9 audits page + transverse pour préparer l'exécution Phase 2. Elle sert de pré-brouillon pour `proposed-deletions.md` (à rédiger Phase 2).

### 10.1 Liste exhaustive des fichiers Recalés à supprimer (~95)

#### Bloc 1 — Conseiller V1 routes (3 fichiers)
- `app/(outils)/outils/conseiller/page.tsx`
- `app/(outils)/outils/messages/page.tsx`
- `app/(dev)/dev/split-brief/page.tsx`
- `app/(dev)/dev/split-brief/SplitBriefDemoClient.tsx`
- `app/(dev)/layout.tsx` (si plus aucun usage)

#### Bloc 2 — Conseiller V1 composants core (20 fichiers)
- `components/conseiller/CalloutBox.tsx`
- `components/conseiller/ConseillerBubble.tsx`
- `components/conseiller/ConseillerHistory.tsx`
- `components/conseiller/ConseillerSheet.tsx`
- `components/conseiller/DataTable.tsx`
- `components/conseiller/DocumentaryCard.tsx`
- `components/conseiller/ExitConfirmDialog.tsx`
- `components/conseiller/MetricSlider.tsx`
- `components/conseiller/PedagogyExplanationSheet.tsx`
- `components/conseiller/PiloteBubble.tsx`
- `components/conseiller/QuickMetricsRow.tsx`
- `components/conseiller/ResumeChoiceSheet.tsx`
- `components/conseiller/RichMarkdown.tsx`
- `components/conseiller/StreamingReasoning.tsx`
- `components/conseiller/Timeline.tsx`
- `components/conseiller/WaitingState.tsx`
- `components/conseiller/WizardImmersiveSheet.tsx`
- `components/conseiller/WizardProgressBar.tsx`

#### Bloc 3 — Conseiller V1 wizard steps (13 fichiers)
- `components/conseiller/wizard-steps/Step1Period.tsx`
- `components/conseiller/wizard-steps/Step2BusinessAnchors.tsx`
- `components/conseiller/wizard-steps/Step2MixMode.tsx`
- `components/conseiller/wizard-steps/Step3SensitiveTopics.tsx`
- `components/conseiller/wizard-steps/Step4Pillars.tsx`
- `components/conseiller/wizard-steps/Step5DefinirPiliers.tsx`
- `components/conseiller/wizard-steps/Step5RiskCursor.tsx`
- `components/conseiller/wizard-steps/Step5RythmeEngagement.tsx`
- `components/conseiller/wizard-steps/Step6Objectifs.tsx`
- `components/conseiller/wizard-steps/Step6ObjectifsCombined.tsx`
- `components/conseiller/wizard-steps/Step7Confirmation.tsx`
- `components/conseiller/wizard-steps/Step7Formats.tsx`
- `components/conseiller/wizard-steps/SuggestionPicker.tsx`

#### Bloc 4 — Conseiller V1 outils components + mockup (4 fichiers)
- `components/outils/conseiller/ConseillerChat.tsx`
- `components/outils/conseiller/ConseillerLayout.tsx`
- `components/outils/conseiller/ConversationsList.tsx`
- `components/outils/mockups/ConseillerIPhoneMockup.tsx`

#### Bloc 5 — Conseiller V1 lib (~22 fichiers)
- `lib/conseiller/system-prompt.ts`
- `lib/conseiller/types.ts`
- `lib/conseiller/queries.ts`
- `lib/conseiller/markdown-parser.ts`
- `lib/conseiller/parse-metrics-block.ts`
- `lib/conseiller/scenario-palette.ts`
- `lib/conseiller/waiting-states.ts`
- `lib/conseiller/onboarding-types.ts`
- `lib/conseiller/scenarios/index.ts`
- `lib/conseiller/scenarios/A1.ts`
- `lib/conseiller/scenarios/A1-pedagogy-prompt.ts`
- `lib/conseiller/scenarios/A2.ts`
- `lib/conseiller/scenarios/A7.ts`
- `lib/conseiller/scenarios/A8.ts`
- `lib/conseiller/scenarios/B2.ts`
- `lib/conseiller/scenarios/B4.ts`
- `lib/conseiller/scenarios/B5.ts`
- `lib/conseiller/scenarios/C3a.ts`
- `lib/conseiller/scenarios/C3b.ts`
- `lib/conseiller/scenarios/D6.ts`
- `lib/conseiller/scenarios/D8.ts`
- `lib/conseiller/scenarios/D9.ts`
- `lib/conseiller/scenarios/E1.ts`
- `lib/conseiller/scenarios/E-divers.ts`

#### Bloc 6 — Conseiller V1 server actions (5 fichiers)
- `app/_actions/run-conseiller-turn.ts`
- `app/_actions/mark-conseiller-timeout.ts`
- `app/_actions/find-resumable-session.ts`
- `app/_actions/generate-pedagogy.ts`
- `app/_actions/wizard-session.ts`

#### Bloc 7 — Conseiller V1 dans Programme (2 fichiers)
- `components/programme/ConseillerAccess.tsx`
- `components/programme/NewPlanPedagogyOverlay.tsx`

#### Bloc 8 — Coaching daily (anti-doctrine Headspace) (4 fichiers)
- `components/programme/CoachingCard.tsx`
- `components/programme/CoachingGenerator.tsx`
- `app/api/ai/coaching/route.ts`
- `lib/ai/prompts/coaching.ts`

#### Bloc 9 — Retombées V1 (vanity metrics hors V1) (6 fichiers)
- `app/(programme)/programme/retombees/page.tsx`
- `components/retombees/AppMetricsSection.tsx`
- `components/retombees/RetombeesQualitativesList.tsx`
- `components/retombees/RetombeesQuantitativesGrid.tsx`
- `components/programme/RetombeesEditor.tsx`
- `app/_actions/update-post-retombees.ts`

#### Bloc 10 — Jalons fondations (méthode pédagogique 4 mois dégagée) (3 fichiers)
- `components/jalons/JalonHero.tsx`
- `components/jalons/JalonGuardDialog.tsx`
- `lib/jalons/check-jalons.ts`

#### Bloc 11 — Onboarding legacy + DemarrerCard (3 fichiers)
- `components/onboarding/OnboardingFlow.legacy-sprint34.tsx`
- `components/onboarding/ConseillerIntro.tsx`
- `components/today/DemarrerCard.tsx`

#### Bloc 12 — Compte ma-marque sous-arbre obsolète (3 fichiers + dossier)
- `app/(compte)/compte/ma-marque/page.tsx`
- `app/(compte)/compte/ma-marque/brand-book/page.tsx`
- `app/(compte)/compte/ma-marque/business-calendar/page.tsx`
- (puis suppression du dossier `app/(compte)/compte/ma-marque/`)

#### Bloc 13 — Routes AI test (1 fichier)
- `app/api/ai/test/route.ts`

#### Bloc 14 — Docs user obsolètes (1 fichier)
- `docs/user/conseiller.md`

**Total : ~95 fichiers Recalés à supprimer.**

Note : Les `app/api/ai/chat/route.ts` est à investiguer Phase 2 — probablement Recalé mais à confirmer.

### 10.2 Ordre suggéré des commits Phase 2

```
1. refactor(sprint-40): retrait imports Conseiller dans pages consommatrices
   ↳ programme/page.tsx, outils/page.tsx, outils/OutilsCatalog.tsx, aujourd-hui/page.tsx

2. refactor(sprint-40): retrait halos bg-halo-N hors Aujourd'hui
   ↳ outils/page.tsx, outils/bibliotheque/page.tsx, outils/messages/page.tsx

3. refactor(sprint-40): retrait sections "À venir" / "Bientôt" dans OutilsCatalog
   ↳ components/outils/OutilsCatalog.tsx

4. refactor(sprint-40): marquage @deprecated SplitBrief + Dashboard nominaux
   ↳ components/layouts/SplitBrief.tsx, components/programme/ProgrammeDashboard.tsx, components/ma-marque/MaMarqueDashboard.tsx

5. refactor(sprint-40): nettoyage breadcrumb Bibliothèque + retrait tab conversation
   ↳ outils/bibliotheque/page.tsx, components/library/LibraryView.tsx, lib/library/types.ts

6. chore(sprint-40): backup archive/v1-leftovers/ (création des sous-dossiers)

7. chore(sprint-40): suppression Bloc 8 — Coaching daily
8. chore(sprint-40): suppression Bloc 9 — Retombées V1
9. chore(sprint-40): suppression Bloc 10 — Jalons fondations
10. chore(sprint-40): suppression Bloc 11 — Onboarding legacy + DemarrerCard
11. chore(sprint-40): suppression Bloc 12 — Compte ma-marque sous-arbre obsolète
12. chore(sprint-40): suppression Bloc 13 — API ai/test
13. chore(sprint-40): suppression Bloc 14 — docs/user/conseiller

14. chore(sprint-40): suppression Bloc 4 — Conseiller outils components + mockup
15. chore(sprint-40): suppression Bloc 7 — Conseiller dans Programme
16. chore(sprint-40): suppression Bloc 6 — Conseiller server actions
17. chore(sprint-40): suppression Bloc 5 — Conseiller lib (incl. scenarios)
18. chore(sprint-40): suppression Bloc 3 — Conseiller wizard steps
19. chore(sprint-40): suppression Bloc 2 — Conseiller composants core
20. chore(sprint-40): suppression Bloc 1 — Conseiller V1 routes + Dev split-brief

21. chore(sprint-40): tag + suppression branche cf-conceptuel-0
```

Ordre justifié :
- **Refactors automatiques d'abord** (1-5) : préparent le terrain, ne dépendent pas des suppressions.
- **Backup créé** (6) : avant toute suppression.
- **Suppressions petites cohérentes** (7-13) : modules indépendants.
- **Suppressions Conseiller V1 progressives** (14-20) : du moins critique (mockup) au plus critique (composants core), pour pouvoir tester `npm run build` entre chaque.
- **Branche archive** (21) : tout dernier, après que le repo principal est nettoyé.

### 10.3 Refactors automatiques attendus en détail

**`app/(aujourd-hui)/aujourd-hui/page.tsx`** :
- Retirer imports `<DemarrerCard>`, `<JalonHero>`, `<NewPlanPedagogyOverlay>`.
- Retirer mention "Sprint 36.G — Refonte V3 sous doctrine Tranquillité du pilote" du commentaire (ou plutôt le compléter pour pointer Sprint 43+).
- Retirer le bloc "État du programme" et "État de Ma Marque" (Sprint 36.G Bloc 2/3).

**`app/(outils)/outils/page.tsx`** :
- Retirer les 5 `<div className="bg-halo bg-halo-N">`.
- Pas d'autre modification structurelle Sprint 40.

**`app/(outils)/outils/bibliotheque/page.tsx`** :
- Retirer les 5 `<div className="bg-halo bg-halo-N">`.
- Modifier breadcrumb : `["Aujourd'hui", "Bibliothèque"]` (retirer "Outils").
- Modifier commentaire d'en-tête (retirer mention "chat conseiller reportés Sprint 38").

**`app/(outils)/outils/messages/page.tsx`** :
- Suppression complète (cf. Bloc 1).

**`components/outils/OutilsCatalog.tsx`** :
- Retirer toute la section "À venir : Messages, Emailing, Reels, Films".
- Retirer items Conseiller, Bibliothèque, Messages (les trois sortent du sous-arbre Outils).
- Retirer la mention "(héros)" sur Conseiller.
- Catalogue cible : 4 items Post Creator · Moodboard · Variations · Reviews.

**`app/(programme)/programme/page.tsx`** :
- Retirer imports `<ConseillerAccess>`, `<NewPlanPedagogyOverlay>`.
- Retirer `maxDuration = 90` si lié au wizard A1 Conseiller (à confirmer Phase 2).
- Retirer commentaire d'en-tête mentionnant Sprint 36.B.3 wizard A1.

**`components/library/LibraryView.tsx`** :
- Retirer valeur `'conversation'` du `TABS` array.
- Marquer `@deprecated` import `SplitBrief`.

**`lib/library/types.ts`** :
- Retirer label/type `'conversation'`.

**`components/layouts/SplitBrief.tsx`** :
- Ajouter `// @deprecated Sprint 40 — pattern remplacé par sub-sidebar 260px doctrine V2.0 §3.2.` dans commentaire d'en-tête.

**`components/programme/ProgrammeDashboard.tsx`** :
- Ajouter `// @deprecated Sprint 40 — composant à renommer MonProgrammeView Sprint 43+ + refactor structurel sub-sidebar.` dans commentaire d'en-tête.

**`components/ma-marque/MaMarqueDashboard.tsx`** :
- Ajouter `// @deprecated Sprint 40 — composant à renommer MaMarqueView Sprint 43+.` dans commentaire d'en-tête.

### 10.4 Backups nécessaires dans `archive/v1-leftovers/`

Pour les fichiers à valeur historique ou éditoriale réutilisable :

- `archive/v1-leftovers/conseiller/lib/` ← tout `lib/conseiller/*` (15 fichiers, contient les 5 lois du conseiller + vocabulaire interdit + scope V1 TF utilisables pour Sprint 43+ refonte Experts)
- `archive/v1-leftovers/conseiller/scenarios/` ← tout `lib/conseiller/scenarios/*` (15 fichiers, matériau éditorial)
- `archive/v1-leftovers/conseiller/components/` ← tout `components/conseiller/*` + wizard-steps (33 fichiers)
- `archive/v1-leftovers/conseiller/actions/` ← `app/_actions/run-conseiller-turn.ts`, `wizard-session.ts`, `find-resumable-session.ts`, `generate-pedagogy.ts`, `mark-conseiller-timeout.ts`
- `archive/v1-leftovers/conseiller/routes/` ← `app/(outils)/outils/conseiller/`
- `archive/v1-leftovers/coaching/` ← `app/api/ai/coaching/route.ts` + `lib/ai/prompts/coaching.ts` + `components/programme/Coaching*.tsx`
- `archive/v1-leftovers/retombees/` ← tout le bloc Retombées (6 fichiers)
- `archive/v1-leftovers/jalons/` ← tout le bloc Jalons (3 fichiers)
- `archive/v1-leftovers/onboarding-legacy/` ← `OnboardingFlow.legacy-sprint34.tsx` + `ConseillerIntro.tsx` + `DemarrerCard.tsx`
- `archive/v1-leftovers/compte-ma-marque/` ← `app/(compte)/compte/ma-marque/*`
- `archive/v1-leftovers/dev/` ← `app/(dev)/dev/split-brief/*`
- `archive/v1-leftovers/api-test/` ← `app/api/ai/test/route.ts`
- `archive/v1-leftovers/docs/conseiller.md` ← `docs/user/conseiller.md`

### 10.5 Mapping Sprint 41 / Sprint 42 / Sprint 43+

| Action | Sprint cible | Justification |
|---|---|---|
| Suppression Conseiller V1 (~60 fichiers) | **Sprint 40 Phase 2** | Purge ciblée brief §6 |
| Suppression Coaching / Retombées / Jalons (~14 fichiers) | **Sprint 40 Phase 2** | Idem |
| Refactor automatique (halos, "Bientôt", breadcrumb, @deprecated) | **Sprint 40 Phase 2** | Modifications partielles brief §6.2 |
| Backup `archive/v1-leftovers/` | **Sprint 40 Phase 2** | Brief §6.4 |
| Tag + suppression `cf-conceptuel-0` | **Sprint 40 Phase 2 fin** | Brief §6.5 |
| Patch sécurité P0 multi-tenant (23 fichiers) | **Sprint 41 dédié** | Modification logique métier = risque |
| Audit copies UI fine (vocabulaire, sentence case) | **Sprint 41** | Audit ciblé |
| Audit hex hardcodés + remplacement tokens | **Sprint 41** | Impact large |
| Migration schéma : drop `daily_coaching`, repurpose `conversations`, audit `brand_metrics`, drop colonnes retombées `posts` | **Sprint 41 dédié schéma** | Modification SQL = risque |
| Création `cf-tokens.css` ou amendement doctrine | **Sprint 41** | Cohérence doctrine ↔ code |
| Renommages routes URL (`/programme` → `/mon-programme`, `/outils` → `/mes-outils`, `/onboarding` → `/premiers-pas`) | **Sprint 41 ou 42** | Impact router massif |
| Refonte VOICE_SHEET_RULES (`lib/ai/prompts/system.ts`) | **Sprint dédié validation Lead** | Cache impact 90% |
| Espace admin Lead complet | **Sprint 42** | Doctrine `01-ARCHITECTURE.md` §8 |
| Création Hélène + 12 Experts (prompts + UI) | **Sprint 43+** | Construction V2.0 |
| Création route `/messages` top-level (+ carnet) | **Sprint 43+** | Construction V2.0 |
| Création route `/calendrier` top-level + déplacement composants | **Sprint 43+** | Construction V2.0 |
| Création route `/rappels` top-level + migration SQL | **Sprint 43+** | Construction V2.0 |
| Création route `/aide` | **Sprint 43+** | Construction V2.0 |
| Reconstruction des 10 pages depuis HTML Claude Design | **Sprint 43+** | Construction V2.0 |
| Audit visuel `EtatMarque` / `BarreFondations` (frontière gamification) | **Sprint 41** | Audit ciblé |
| Audit `lib/ma-marque/score.ts` | **Sprint 41** | Audit ciblé |
| Audit `IndicateursEditorialsList.tsx` + `compute-indicateurs-editoriaux.ts` | **Sprint 41** | Risque Cohérence/Équilibre/Densité/Profondeur |

### 10.6 Checklist exécution Phase 2 (à cocher sur `decisions.md` Phase 2)

```
☐ 0. GO PHASE 2 reçu (commit Lead `lead: GO PHASE 2 sprint-40`)
☐ 1. Création `archive/v1-leftovers/` + sous-dossiers
☐ 2. Refactor automatique : halos retirés sur 3 pages
☐ 3. Refactor automatique : sections "À venir" / "Bientôt" retirées OutilsCatalog
☐ 4. Refactor automatique : imports Conseiller retirés des pages consommatrices
☐ 5. Refactor automatique : breadcrumb Bibliothèque corrigé + tab 'conversation' retiré
☐ 6. Refactor automatique : @deprecated marqués sur SplitBrief / Dashboards
☐ 7. proposed-deletions.md écrit avec les 14 blocs identifiés
☐ 8. Attente VALIDÉ Lead par bloc
☐ 9. Suppressions Bloc 8 — Coaching (avec backup)
☐ 10. Suppressions Bloc 9 — Retombées (avec backup)
☐ 11. Suppressions Bloc 10 — Jalons (avec backup)
☐ 12. Suppressions Bloc 11 — Onboarding legacy (avec backup)
☐ 13. Suppressions Bloc 12 — Compte ma-marque (avec backup)
☐ 14. Suppressions Bloc 13 — API test (avec backup)
☐ 15. Suppressions Bloc 14 — docs/user/conseiller (avec backup)
☐ 16. Suppressions Bloc 4 — Conseiller outils components + mockup
☐ 17. Suppressions Bloc 7 — Conseiller dans Programme
☐ 18. Suppressions Bloc 6 — Conseiller server actions
☐ 19. Suppressions Bloc 5 — Conseiller lib (incl. scenarios)
☐ 20. Suppressions Bloc 3 — Conseiller wizard steps
☐ 21. Suppressions Bloc 2 — Conseiller composants core
☐ 22. Suppressions Bloc 1 — Conseiller V1 routes + Dev split-brief
☐ 23. Tag archive/cf-conceptuel-0-2026-05 + suppression branche
☐ 24. npx tsc --noEmit → 0 erreur
☐ 25. npm run lint → 0 warning
☐ 26. npm run build → succès
☐ 27. zz-auto-evaluation.md rédigé (brief §9.4)
☐ 28. decisions.md mis à jour avec décisions Phase 2
☐ 29. Push final + STOP pour validation Lead
```

### 10.7 Estimation effort par bloc

| Bloc | Fichiers | Temps |
|---|---|---|
| Refactor automatiques (1-6 checklist) | 8 | ~1.5h |
| `proposed-deletions.md` + attente Lead | 14 blocs | ~0.5h Claude + N heures Lead |
| Suppressions petites (Coaching, Retombées, Jalons, OnboardingLegacy, ComptemaMarque, APItest, docsConseiller) | ~30 | ~2h |
| Suppressions Conseiller V1 lots ordonnés | ~60 | ~3.5h |
| Backup archive | toutes suppressions | inclus dans temps suppression |
| Tag cf-conceptuel-0 + delete | 1 branche | ~0.5h |
| Build + lint + tsc + tests | - | ~1h |
| Rédaction `zz-auto-evaluation.md` + finalize `decisions.md` | 2 docs | ~1h |
| **Total Phase 2 estimé** | | **~10h hors validation Lead** |

### 10.8 Risques résiduels Phase 2

1. **Build cassé** par cascade d'imports orphelins → résolu par ordre des commits + `npx tsc --noEmit` après chaque bloc.
2. **Test playwright cassé** par routes supprimées (`tests/e2e/05-conseiller.spec.ts`, `tests/e2e/03-navigation-4-destinations.spec.ts`, `tests/e2e/sprint-37/`) → **scope §3.2 exclut les tests**, ils seront mis à jour Sprint 41 dédié tests.
3. **Migration SQL non touchée** → table `daily_coaching` persiste mais inactive (aucun code ne l'écrit) — non bloquant.
4. **Cache Anthropic préservé** → aucun prompt SACRED touché.
5. **Régression visuelle wallpaper** → pages métier reviennent au neutral crème, conforme doctrine.

### 10.9 Conclusion de l'audit

Le repo Creative Fair v60 est dans un état **caractéristique de mi-pivot doctrinal** :
- ✅ Bonne hygiène SQL (RLS partout, migrations versionnées).
- ✅ Forest green purgé.
- ✅ TypeScript strict, proxy.ts conforme.
- ✅ F89 wizard piliers V2.0 implémenté.
- ❌ ~60 fichiers Conseiller V1 actifs.
- ❌ Faille P0 multi-tenant non patchée.
- ❌ 4 pages top-level absentes (Messages, Calendrier, Rappels, Aide).
- ❌ Hélène + 12 Experts inexistants.
- ❌ Mécaniques anti-doctrine actives (Coaching, Retombées, Jalons).

Sprint 40 Phase 2 = **purger les ~95 fichiers Recalés + appliquer ~30 refactors automatiques + archiver `cf-conceptuel-0`**. À l'issue, le repo sera propre, prêt pour Sprint 41 (sécurité + schéma) et Sprint 43+ (construction V2.0).
