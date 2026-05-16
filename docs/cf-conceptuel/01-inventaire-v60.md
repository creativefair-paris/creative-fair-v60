# CF-INVENTAIRE-V60 — Étape 1 (cartographie factuelle)

**Date** : 16 mai 2026
**Branche** : `cf-conceptuel-0` (depuis `sprint-37` HEAD `eb0e72e`)
**Méthode** : lecture seule, extraction des données présentes dans le repo, aucune interprétation ni recommandation.
**Conventions** : `[ABSENT]` quand une donnée attendue n'est pas dans le repo, `[AMBIGU]` quand deux sources sont en conflit.

---

## 1. CONCEPT

### 1.1 Positionnement actuel

Sources lues : `README.md` (54 lignes), `package.json`, `CLAUDE.md`, `AGENTS.md`, `skills/00-CONCEPT.md`, `skills/00-MASTER.md`, `skills/V1_RECAP.md`, `skills/CAHIER_DES_CHARGES_v2.md` (extrait 80 premières lignes).

Le `README.md:1-5` décrit le projet comme :
> "Creative Fair — Conseiller en communication digitale pour les acteurs culturels et leurs marques. Multi-tenant Next.js 16 + Supabase + Anthropic Claude. Version V1 — taguée `v1.0.0`."

Le `skills/00-CONCEPT.md:7-13` formule en une phrase :
> "Creative Fair aide les dirigeants de marques établies à développer leur softpower digital sur Instagram, en alignant leur calendrier éditorial sur leur calendrier business réel."

Le `skills/CAHIER_DES_CHARGES_v2.md:9-23` formule différemment :
> "Creative Fair est une **creative suite Apple-grade** pour dirigeants de marques établies qui veulent reprendre le contrôle de leur communication digitale sans agence. Le produit s'inspire d'iWork dans son architecture (suite cohérente d'outils unifiés) et d'iOS 26 dans sa direction artistique. Standard de finition : Apple. Verbe central : Publier."

`[AMBIGU]` : le `00-CONCEPT.md` parle de "softpower Instagram", le cahier des charges v2 parle de "creative suite multi-outils sans agence". Les deux ne s'excluent pas mais ne sont pas explicitement mis en cohérence dans le repo.

Positionnement marketing court (`00-CONCEPT.md:16-19`) : *"Un plan. Un cadre. Une voix."*
Émotion centrale (`00-CONCEPT.md:21-26`) : *"Tranquillité."*

### 1.2 Persona canonique

`00-CONCEPT.md:30-38` :
> "Dirigeants de business établis (pas créatifs solo) :
> - Tournent déjà (chiffre, clients, structure en place)
> - Ont un lieu, une cause, une œuvre, une histoire
> - Veulent affirmer leur place culturelle / symbolique
> - Cherchent un cadre, pas un coach
> - Ne veulent pas déléguer leur voix à une agence
> - Ont peu de temps mais une ambition forte"

`[ABSENT]` : aucun fichier du repo ne mentionne explicitement "Floriane, 28 ans, brand manager pour Carlo Sarrabezolles". Ce persona figure dans la mémoire Lead et les audits Sprint 38, pas dans la doctrine repo.

### 1.3 Clients B2B signés

`README.md:36` : *"3 clients pré-configurés : `angelina`, `tous-en-tete`, `comptoir-general`."*

Confirmé par les seeds (`seeds/` contient 12 fichiers JSON, 4 par client) :

| Slug | Fichiers seeds | Source |
|---|---|---|
| `angelina` | `angelina-tenant.json`, `-theme.json`, `-brand-book.json`, `-business-calendar.json` | `seeds/` |
| `tous-en-tete` | `tous-en-tete-tenant.json`, `-theme.json`, `-brand-book.json`, `-business-calendar.json` | `seeds/` |
| `comptoir-general` | `comptoir-general-tenant.json`, `-theme.json`, `-brand-book.json`, `-business-calendar.json` | `seeds/` |

`[ABSENT]` : aucun montant de CA (12K€ / 15K€) n'est documenté dans le repo. Pricing évoqué dans `00-CONCEPT.md:54-65` (V1 : "12 K€ setup + 15 K€/an" pour B2B custom ; V2 : "49 €/mois à confirmer").

### 1.4 Les 6 promesses CF (`00-CONCEPT.md:41-51`, verbatim)

> "1. **Programmation** — Calendar fonctionnel
> 2. **Génération texte** — Post Creator (Anecdote Live + Custom)
> 3. **Calendrier business-driven** — L'IA lit le business calendar
> 4. **Brand book qui pilote l'IA** — Visible via badges
> 5. **Coaching adaptatif quotidien** — Généré chaque matin
> 6. **Conseiller 24/7** — Streaming, contextuel, juste"

### 1.5 Tonalité de marque

`00-CONCEPT.md:127-150` (verbatim) :

**Vocabulaire interdit** :
> "users, audience, dashboard, workflow, pipeline, tokens, radar, viral, boost, growth hack, engagement maximisé, bientôt, à venir, coming soon, Title Case, emojis, exclamations"

**Vocabulaire encouragé** :
> "ta voix (pas 'ton ton'), ce que tu publies (pas 'ton contenu'), ton Instagram (pas 'ton profil'), ta communauté (pas 'tes followers'), raconter (pas 'communiquer'), crédits (pas 'tokens'), le dirigeant (jamais 'le user')"

Règles complémentaires (`10-SACRED.md:53-67`) :
> "Pas d'emoji, pas d'exclamation. Dans aucune copie utilisateur. Aucun cas d'exception."

`02-VOICE_SHEET.md` contient 3 lignes uniquement : *"À enrichir pendant les sprints suivants."* `[SOURCE PRESENTE MAIS QUASI VIDE]`.

`V1_RECAP.md:78-83` cite une liste plus courte de mots interdits :
> "pipeline, dashboard, tokens, sync, workflow, widget."

`[AMBIGU]` : les deux listes diffèrent. `00-CONCEPT.md` est plus exhaustive et plus récente (mai 2026 v60) que `V1_RECAP.md` (état v1.0.0, 6 mai 2026).

---

## 2. ARCHITECTURE

### 2.1 Stack technique

Source : `package.json`.

| Dépendance | Version | Type |
|---|---|---|
| `next` | `16.2.4` | runtime |
| `react` / `react-dom` | `19.2.4` | runtime |
| `@supabase/ssr` | `^0.10.2` | runtime |
| `@supabase/supabase-js` | `^2.105.3` | runtime |
| `@anthropic-ai/sdk` | `^0.94.0` | runtime |
| `clsx` | `^2.1.1` | runtime |
| `lucide-react` | `^1.14.0` | runtime |
| `replicate` | `^1.4.0` | runtime |
| `tailwind-merge` | `^3.5.0` | runtime |
| `tailwindcss` | `^4` | dev |
| `@playwright/test` | `^1.60.0` | dev |
| `typescript` | `^5` | dev |
| `eslint` | `^9` | dev |

Scripts : `dev`, `build`, `start`, `lint`, `type-check`, `precommit`, `test:e2e`, `test:e2e:ui`, `test:e2e:install`.

### 2.2 Configuration Supabase

`skills/01-ARCHITECTURE.md:22-23` :
> "Supabase : ugfnokdxdqaqapylafeq (Frankfurt eu-west)"

`[ABSENT]` du repo : aucun `.env.example` lu. Variables d'env documentées dans `skills/01-ARCHITECTURE.md:232-238` : `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`.

### 2.3 Schéma tables RLS

26 migrations dans `supabase/migrations/` (de `001_initial_schema.sql` à `026_posts_pilier_id_fk.sql`). 73 `create policy` cumulées (grep).

Tables créées par les migrations (ordre chronologique de création) :

| Table | Migration source | Colonnes clés observées | RLS / tenant-scoped |
|---|---|---|---|
| `tenants` | `001_initial_schema.sql` | racine multi-tenant | RLS via `id = public.user_tenant_id()` |
| `profiles` | `001_initial_schema.sql` | `id` (=`auth.users.id`), `tenant_id` | ✓ |
| `brands` | `001_initial_schema.sql` | `tenant_id`, `brand_book` jsonb, `business_calendar` jsonb, `piliers_narratifs` jsonb (legacy) | ✓ |
| `onboarding_answers` | `001_initial_schema.sql` | `tenant_id` | ✓ |
| `uploads` | `001_initial_schema.sql` | `tenant_id` | ✓ |
| `posts` | `001_initial_schema.sql` (recréée `006_posts.sql`) | `tenant_id`, `pilier_nom` TEXT (legacy), `pilier_id` UUID (FK, migration 026) | ✓ |
| `conversations` | `001_initial_schema.sql` | `tenant_id`, `user_id` | ✓ |
| `daily_coaching` | `001_initial_schema.sql` | unique `(brand_id, date)` | ✓ |
| `analytics_events` | `001_initial_schema.sql` | append-only, service_role writes | ✓ (read-only users) |
| `credits_usage` | `001_initial_schema.sql` | append-only | ✓ (read-only users) |
| `programmes` | `005_programmes.sql` | `tenant_id`, `brand_id` | ✓ |
| `alerts` | `012_alerts.sql` | `tenant_id` | ✓ |
| `channel_waitlist` | `010_channel_waitlist.sql` | non-tenant scoped (waitlist publique) | `[À VÉRIFIER]` |
| `brand_archives` | `009_brand_completeness.sql` | `tenant_id`, `brand_id` | ✓ |
| `conseiller_conversations` | `015_conseiller_conversations.sql` | `tenant_id`, `user_id` | ✓ |
| `reviews` | `017_reviews.sql` | `tenant_id` | ✓ |
| `library_documents` | `018_library_documents.sql` | `tenant_id` | ✓ |
| `programme_creation_sessions` | `019_programme_creation_sessions.sql` | `tenant_id` | ✓ |
| `brand_metrics` | `020_brand_metrics.sql` | `tenant_id`, `brand_id` | ✓ |
| `brand_onboarding_sessions` | `021_brand_onboarding_sessions.sql` | `tenant_id` | ✓ |
| `pillars` | `025_pillars.sql` (Sprint 37.K F89) | `tenant_id`, `brand_id`, `title`, `description`, `position`, `archived_at` | ✓ |

`[ÉCART]` documenté : `skills/01-ARCHITECTURE.md:30-43` annonce 10 tables. Le repo en contient 20 effectives + table racine `tenants`. Les 10 historiques (V1) sont créées dans `001_initial_schema.sql`. Les 10 suivantes sont des extensions Sprint 5 → 37.K.

`skills/03-MULTI_TENANT.md:130-132` (verbatim) :
> "Concept abandonné — pas de table `programmes` ... Si un sprint te demande de créer une table `programmes`, arrête-toi et signale-le — c'est probablement un prompt obsolète."

Or `005_programmes.sql` crée bien la table `programmes`. `[CONFLIT DOCTRINE ↔ MIGRATION]` constaté.

### 2.4 Conventions code observées

Structure réelle de `app/` (route groups Next.js 16) :

```
app/
├── (accueil)/page.tsx                  ← accueil public
├── (admin)/tenants/{,[slug],new}/      ← admin Ulysse
├── (aujourd-hui)/aujourd-hui/          ← nav 1
├── (auth)/login/                       ← magic link
├── (compte)/compte/{mon-compte, parametres, ma-marque/*}/
├── (dev)/dev/split-brief/              ← page développement
├── (ma-marque)/ma-marque/              ← nav 3
├── (onboarding)/onboarding/analyse-marque/
├── (outils)/outils/{,bibliotheque,conseiller,messages,moodboard,
│                   post-creator,reviews,variations}/
└── (programme)/programme/{,bienvenue,create,post/[postId],
                           posts/[postId],retombees,strategie}/
```

Server Actions sous `app/_actions/` (20 fichiers) :
`ask-mini-chat`, `brand-onboarding`, `catch-up-overdue-posts`, `create-library-document`, `create-review`, `ensure-profile`, `estimate-programme-outcomes`, `find-resumable-session`, `generate-pedagogy`, `generate-pillar-wizard`, `generate-plan-from-form`, `generate-plan-from-wizard`, `mark-conseiller-timeout`, `pillars`, `propose-piliers`, `run-conseiller-turn`, `run-review-check`, `strategie-events-intention`, `update-post-retombees`, `update-post`.

Autres actions : `lib/posts/actions.ts`.

`skills/01-ARCHITECTURE.md:163` (verbatim) :
> "proxy.ts (export proxy) — PAS middleware.ts"

### 2.5 Sécurité 5 niveaux

`skills/01-ARCHITECTURE.md:58-72` (verbatim, V1) :
> "Authentification — Magic link Supabase. Session via cookies, refresh dans proxy.ts."
> "Autorisation — Routes user : RLS Supabase via createClient(). Routes admin : triple gate (proxy + layout + requireAdmin)."
> "Service role — createAdmin() (service_role) utilisé uniquement pour : 1. Provisioning tenant ... 2. Logging crédits ... 3. Lecture admin des tenants pour la liste."

`skills/03-MULTI_TENANT.md:78-88` (verbatim) :
> "Le client admin (service_role) bypasse RLS. Cas légitimes uniquement : 1. Création d'un nouveau tenant ... 2. Migrations / seeds. 3. Cron jobs server-side ... 4. Webhooks. Jamais pour servir une requête venant d'un user."

`[FAIT OBSERVÉ]` (constaté Sprint 38 audit) : plusieurs Server Actions sous `app/_actions/` utilisent `createAdmin()` pour des mutations user-facing (`pillars.ts:167`, `pillars.ts:196`, etc.) — cf. section 7.

### 2.6 Skills CFS

`/skills/` dans le repo contient 9 fichiers :

| Fichier | Lignes | Statut |
|---|---|---|
| `00-MASTER.md` | 42 | Table des matières |
| `00-CONCEPT.md` | 182 | Doctrine produit (V1) |
| `01-ARCHITECTURE.md` | 269 | Stack + multi-tenant (V1) |
| `02-VOICE_SHEET.md` | 3 | Stub |
| `03-MULTI_TENANT.md` | 138 | Pattern RLS détaillé |
| `04-DESIGN_SYSTEM.md` | 147 | Liquid Glass tokens |
| `10-SACRED.md` | 146 | Règles non-négociables |
| `V1_RECAP.md` | ~150 | Snapshot V1 |
| `CAHIER_DES_CHARGES_v2.md` | `[non lu intégralement]` | Cahier des charges v2 7 mai 2026 |

`[HORS REPO]` selon CF-INVENTAIRE-V60.md fourni par Lead : 13 skills sœurs (`cfs-apple-audit`, `cfs-communication-task-force`, etc.) hébergées côté Claude Code Lead, pas dans le repo applicatif.

---

## 3. DESIGN SYSTEM v60

### 3.1 Palette définie dans `app/globals.css`

Tokens CSS extraits via grep (`app/globals.css:13-35`) :

| Variable | Valeur |
|---|---|
| `--color-background` | `#FBFAF7` |
| `--color-surface-elevated` | `#FFFFFF` |
| `--color-surface-grouped` | `#FFFFFF` |
| `--color-label` | `#000000` |
| `--color-secondary-label` | `rgba(60, 60, 67, 0.6)` |
| `--color-tertiary-label` | `rgba(60, 60, 67, 0.3)` |
| `--color-separator` | `rgba(60, 60, 67, 0.29)` |
| `--color-system-blue` | `#007AFF` |
| `--color-system-blue-pressed` | `#0051D5` |
| `--color-system-red` | `#FF3B30` |
| `--color-system-green` | `#34C759` |
| `--color-system-orange` | `#FF9500` |
| `--color-accent` (alias) | `var(--color-system-blue)` |
| `--color-primary` (alias) | `var(--color-system-blue)` |
| `--color-error` (alias) | `var(--color-system-red)` |

Hex uniques détectés dans `globals.css` (1901 lignes, grep `#[0-9A-Fa-f]{6}`) :
`#000000`, `#0051D5`, `#0052A8`, `#0066D6`, `#007AFF`, `#1C1C1E`, `#1F4937`, `#34C759`, `#E8943E`, `#FBFAF7`, `#FF3B30`, `#FF9500`, `#FFFFFF`.

`[FOREST GREEN ENCORE PRÉSENT DANS LE FICHIER]` : `#1F4937` apparaît dans `globals.css:1241` et `globals.css:1318` dans deux commentaires *"Sprint 36.C — Lot 4 : remplacement #1F4937 déprécié par tint iOS canonique"*. Le contexte de ces lignes montre que la valeur active a été remplacée par `var(--color-accent)` ; la chaîne `#1F4937` reste donc présente uniquement en commentaire textuel. La présence est constatée, pas qualifiée.

### 3.2 Patterns visuels canoniques

Fichiers de composants observés (extraits) :
- `components/layout/Sheet.tsx` (44 lignes) : pattern `glass-thick` bottom sheet iOS
- `components/layouts/SplitBrief.tsx` `[À VÉRIFIER PRÉSENCE]` — referencé dans `app/(aujourd-hui)/aujourd-hui/page.tsx:17`
- `components/today/TaskRow.tsx` `[À VÉRIFIER PRÉSENCE]` — referencé idem
- Tokens Liquid Glass dans `app/globals.css` documentés dans `skills/04-DESIGN_SYSTEM.md:30-39` :
  | Niveau | Classe | Usage doctriné |
  |---|---|---|
  | z1 | `.glass-z1` | Chips, sous-cartes, contrôles légers |
  | z2 | `.glass-z2` | Cartes principales, sections, sidebars |
  | z3 | `.glass-z3` | Modals, popovers, sheets flottantes |

`[À VÉRIFIER]` : les classes `.glass-z1/z2/z3` sont-elles définies dans `liquid-glass.css` mentionné dans `skills/04-DESIGN_SYSTEM.md:9` ou dans `globals.css` ? Fichier `liquid-glass.css` aperçu dans le listing mais pas lu intégralement.

### 3.3 Typographie

`app/globals.css:38-41` :
> `--font-system: -apple-system, system-ui, sans-serif;`
> `--font-display: var(--font-system);`
> `--font-body: var(--font-system);`
> `--font-mono: ui-monospace, SFMono-Regular, monospace;`

Pas de police custom chargée. `[FAIT OBSERVÉ]` : `--font-display` et `--font-body` pointent vers la même stack système, alors que `skills/00-CONCEPT.md:108-109` annonce *"System fonts (SF Pro Display + SF Pro Text)"* comme deux familles distinctes.

### 3.4 Nav v60

Composants nav présents : `components/layout/NavigationBar.tsx` (136 lignes), `components/layout/PageHeader.tsx` (147 lignes).

`[À VÉRIFIER]` : contenu exact des destinations (le fichier n'a pas été lu in extenso ici). Le grep des routes (aujourd-hui, programme, ma-marque, outils, conseiller) dans `NavigationBar.tsx` n'a pas retourné de match direct — le composant utilise probablement une liste centralisée ailleurs.

Routes effectives existantes (`find app -name page.tsx`) confirment 5 zones principales : `/aujourd-hui`, `/programme`, `/ma-marque`, `/outils`, `/outils/conseiller`.

`[ÉCART DOCTRINE]` : `skills/00-CONCEPT.md:80-86` documente 4 destinations (Aujourd'hui, Calendrier, Ma Marque, Conseiller). `skills/10-SACRED.md:36-44` réaffirme *"Navigation 4 destinations. Jamais 5 destinations. Jamais."* Le code livre 5 routes principales. `V1_RECAP.md:7-13` parle aussi de "4 destinations utilisateur" pour V1.

---

## 4. MODULES PRODUIT

### 4.1 Pages principales

`find app -name page.tsx` retourne 30 fichiers. Distribution :

| Route | Fichier | Lignes | État |
|---|---|---|---|
| `/` (accueil public) | `app/(accueil)/page.tsx` | `[lignes non comptées]` | présent |
| `/login` | `app/(auth)/login/page.tsx` | 100 | présent |
| `/aujourd-hui` | `app/(aujourd-hui)/aujourd-hui/page.tsx` | `[~200+]` | présent (refonte Sprint 36.G) |
| `/onboarding/analyse-marque` | `app/(onboarding)/onboarding/analyse-marque/page.tsx` | `[à vérifier]` | présent |
| `/ma-marque` | `app/(ma-marque)/ma-marque/page.tsx` | 200 | présent (+ PillarsManager Sprint 37.K) |
| `/programme` | `app/(programme)/programme/page.tsx` | `[à vérifier]` | présent |
| `/programme/bienvenue` | `app/(programme)/programme/bienvenue/page.tsx` | `[à vérifier]` | présent |
| `/programme/create` | `app/(programme)/programme/create/page.tsx` | `[à vérifier]` | présent |
| `/programme/post/[postId]` | dynamic | `[à vérifier]` | présent |
| `/programme/posts/[postId]` | dynamic | 284 | présent (doublon route `post/posts` apparent) |
| `/programme/retombees` | `app/(programme)/programme/retombees/page.tsx` | 190 | présent |
| `/programme/strategie` | `app/(programme)/programme/strategie/page.tsx` | 303 | présent |
| `/outils` | `app/(outils)/outils/page.tsx` | `[à vérifier]` | présent (catalogue) |
| `/outils/conseiller` | `app/(outils)/outils/conseiller/page.tsx` | `[à vérifier]` | présent |
| `/outils/post-creator` | `app/(outils)/outils/post-creator/page.tsx` | `[à vérifier]` | présent |
| `/outils/post-creator/[format]` | dynamic | `[à vérifier]` | présent |
| `/outils/bibliotheque` | idem | `[à vérifier]` | présent |
| `/outils/moodboard` | idem | `[à vérifier]` | présent (audit Sprint 38 indique "stub") |
| `/outils/variations` | idem | `[à vérifier]` | présent (audit Sprint 38 indique "stub") |
| `/outils/reviews` | idem | `[à vérifier]` | présent |
| `/outils/messages` | idem | `[à vérifier]` | présent |
| `/compte/mon-compte` | `app/(compte)/compte/mon-compte/page.tsx` | `[à vérifier]` | présent |
| `/compte/parametres` | idem | `[à vérifier]` | présent |
| `/compte/ma-marque` | idem | `[à vérifier]` | présent (legacy probable) |
| `/compte/ma-marque/brand-book` | idem | `[à vérifier]` | présent |
| `/compte/ma-marque/business-calendar` | idem | `[à vérifier]` | présent |
| `/dev/split-brief` | `app/(dev)/dev/split-brief/page.tsx` | `[à vérifier]` | présent (page dev) |
| `/tenants` | `app/(admin)/tenants/page.tsx` | `[à vérifier]` | présent (admin) |
| `/tenants/[slug]` | dynamic | `[à vérifier]` | présent (admin) |
| `/tenants/new` | idem | `[à vérifier]` | présent (admin) |

### 4.2 Outils sous `/outils/*`

Source : `components/outils/OutilsCatalog.tsx:1-15` (verbatim) :
> "Sections (F23 reclassification) :
>   - Piloter : Conseiller (héros), Bibliothèque
>   - Créer : Post Creator, Moodboard, Variations, Reviews
>   - À venir : Messages, Emailing, Reels, Films"

Items "À venir" rendus avec badge "Bientôt" (statut `disabled`).

`[FAIT OBSERVÉ]` : la doctrine `00-CONCEPT.md:135` interdit le mot "bientôt" en UI. La string "Bientôt" est mentionnée en commentaire dans `OutilsCatalog.tsx:14` — usage runtime à vérifier.

### 4.3 Onboarding

1 page : `app/(onboarding)/onboarding/analyse-marque/page.tsx`. État multi-step présumé interne (cf. audits Sprint 38 / `03-` à `06-` qui parlent de 4 steps).

Composants associés présumés sous `components/onboarding-marque/` (cf. memory) — `[À VÉRIFIER PRÉSENCE EXACTE]` (pas listé in extenso).

### 4.4 Conseiller

Route : `/outils/conseiller`. Source : `app/(outils)/outils/conseiller/page.tsx`.

Intégration Anthropic : Server Action `app/_actions/run-conseiller-turn.ts`. Modèle attendu (`V1_RECAP.md:36`) : *"`/api/ai/chat` — Conseiller streaming Opus 4.7"*. À confirmer côté server action exact.

---

## 5. WORKFLOWS UTILISATEUR

### 5.1 Workflow signup → onboarding → première marque

`[ABSENT du repo]` : pas de page `/signup` (cf. audit Sprint 38 `02-page-signup.md`).

Flow réel observable :
1. `/login` (magic link `app/(auth)/login/page.tsx` + `app/(auth)/login/actions.ts:sendMagicLink`)
2. Redirection `/auth/callback` (présence de dossier `app/auth/` constatée)
3. Redirection conditionnelle `/onboarding/analyse-marque` si pas de marque
4. Server Actions : `app/_actions/ensure-profile.ts`, `app/_actions/brand-onboarding.ts`, `app/_actions/find-resumable-session.ts`
5. Aboutissement `/aujourd-hui`

### 5.2 Workflow création pilier (Sprint 37.K F89)

Entry point : `/ma-marque` → `<PillarsManager>` (`components/pillars/PillarsManager.tsx`).

3 étapes :
1. `<PillarWizardSheet>` étape "questions" → Server Action `app/_actions/generate-pillar-wizard.ts:generatePillarQuestions(brandId)` → Anthropic Sonnet 4.6
2. Étape "propositions" → `generatePillarPropositions(brandId, answers)` → Sonnet 4.6
3. Étape "edit" → Server Action `app/_actions/pillars.ts:createPillar(input)`

Persistance : table `pillars` (migration 025).

### 5.3 Workflow création post

Entry point : `/outils/post-creator` (hub) ou `/outils/post-creator/[format]` (vue par format dynamique).

6 formats canoniques (`lib/i18n/formats.ts:14-21`) :
> `anecdote, produit, evenement, manifeste, question, coulisses`

Server Action save : `app/_actions/update-post.ts` ou `lib/posts/actions.ts:createPost`.

`[FAIT OBSERVÉ]` Sprint 38 audit `22-workflow-creation-post.md` : `posts.pilier_id` (FK migration 026) n'est consommée par aucun fichier. Le rattachement post→pilier passe par `posts.pilier_nom` TEXT legacy.

### 5.4 Workflow navigation cross-pages

Composants nav : `components/layout/NavigationBar.tsx`, `components/layout/PageHeader.tsx`. `[CONTENU EXACT NON LU IN EXTENSO]`.

---

## 6. ÉTAT DES SPRINTS

### 6.1 Tags chronologiques

Source : `git log --tags --simplify-by-decoration` (12 tags présents).

| Tag | Date | Commit |
|---|---|---|
| `v1.0.0` | 2026-05-06 19:17 | 1010683 |
| `v1.0.1` | 2026-05-07 09:12 | 9c1dc56 |
| `v1.1.0` | 2026-05-07 12:15 | dc1f661 |
| `v1.1.1` | 2026-05-07 13:51 | 7bc56d8 |
| `v1.1.5` | 2026-05-09 14:23 | cff9445 |
| `v1.2.0` | 2026-05-09 14:30 | 6c591e4 |
| `v1.3.0` | 2026-05-11 17:13 | de34c40 |
| `v1.4.0` | 2026-05-11 18:23 | 2212017 |
| `v1.5.0` | 2026-05-12 00:03 | 910fff7 |
| `v1.6.0` | 2026-05-12 17:56 | 99ae686 |
| `v1.7.0` | 2026-05-13 00:55 | bc1302d |
| `v1.7.2` | 2026-05-13 12:52 | 43db3a4 |

`[ABSENT]` : pas de tag `v1.7.1` dans la liste (numérotation passe de 1.7.0 à 1.7.2). Pas d'explication trouvée dans le repo.

### 6.2 État des branches

Source : `git rev-list main..origin/<branche> --count`.

| Branche | Commits depuis main | Dernier commit |
|---|---|---|
| `main` | 0 | 2026-05-13 16:47 (`75e2a76` "docs(sprint-37): doctrine conseiller v3 + fiche execution") |
| `sprint-37` | 125 | 2026-05-16 14:39 (`eb0e72e` "docs(sprint-37-n): audit rollback ciblé doctrine") |
| `sprint-38` | 128 | 2026-05-16 12:37 (`05493c5` "docs(sprint-38): synthèse exécutive...") |

Autres branches `sprint-*` locales : `sprint-32-5-and-33`, `sprint-34`, `sprint-35`, `sprint-36-c-2`, `sprint-36-e`, `sprint-36-g`, `sprint-36-h`, `sprint-36-i`, `sprint-37-spec`. Toutes en remote `origin/` aussi pour partie.

### 6.3 Dossiers `audits/`

29 dossiers `audits/sprint-*` dans le repo (locaux) + `audits/sprint-38/` sur `origin/sprint-38` uniquement.

Tailles des decisions.md (ordre récent → ancien) :

| Dossier | Lignes decisions.md |
|---|---|
| `audits/sprint-36-b-3` | (présence non quantifiée) |
| `audits/sprint-36-b-4` à `-b-8` | 79 → 234 selon les sous-sprints |
| `audits/sprint-36-c` | 234 |
| `audits/sprint-36-c-2` | 199 |
| `audits/sprint-36-e` | 145 |
| `audits/sprint-36-g` | 233 |
| `audits/sprint-36-h` | 224 |
| `audits/sprint-36-i` | 208 |
| `audits/sprint-37-*` (i, k, l, m, n) | présents sur `sprint-37` HEAD |
| `audits/sprint-38/` (28 fichiers) | sur `origin/sprint-38` uniquement, 8009 lignes cumulées |

### 6.4 Anomalies Git observées factuellement

- `sprint-37` a **125 commits depuis main**, dernier commit du 16 mai (jour J), pas de tag posé après `v1.7.2` (13 mai). Écart : 3 jours entre dernier tag et dernier commit.
- `sprint-38` est une branche d'audit en lecture seule (aucune modification de code source vs `sprint-37`, vérifié par audit Sprint 38 lui-même).
- Branche `sprint-37-spec` présente mais usage non documenté.
- 12 branches locales `sprint-*` présentes, dont 3 (32-5-and-33, 34, 35) avec équivalents remote — d'autres restent locales uniquement.
- Pas de tag `v1.7.1`.

---

## 7. DETTE TECHNIQUE OBSERVÉE

Source primaire : `origin/sprint-38:audits/sprint-38/90-priorisation-p0-p1-p2.md` (474 lignes, lu via `git show`).

### 7.1 P0 (18 items uniques, Sprint 39 cible)

Catégorie Archi (5 items) :
- **P0.A.1** — `app/_actions/pillars.ts:167` `updatePillar` : `.eq('id', id)` sans `.eq('tenant_id', tenantId)` via admin client. Effort S, impact ★★★★★.
- **P0.A.2** — `app/_actions/pillars.ts:196` `archivePillar` : idem. Effort XS, impact ★★★★★.
- **P0.A.3** — `updatePostFields` + autres server actions post : mutations via admin sans re-filtre `tenant_id`. Effort M, impact ★★★★★.
- **P0.A.4** — Brancher `posts.pilier_id` FK end-to-end (PostEditor, Bibliothèque, programme). Effort XL, impact ★★★★★.
- **P0.A.5** — Backfill `brands.piliers_narratifs` JSONB → table `pillars`. Effort L, impact ★★★★★.

Catégorie Doctrine (4 items) :
- **P0.D.1** — Mettre à jour `skills/00-CONCEPT.md` (nav 4 → nav 5, forest green → palette v60). Effort S.
- **P0.D.2** — Mettre à jour `skills/01-ARCHITECTURE.md` (routes obsolètes). Effort S.
- **P0.D.3** — Mettre à jour `skills/10-SACRED.md`. Effort XS.
- **P0.D.4** — Mettre à jour `skills/04-DESIGN_SYSTEM.md` (Palette v60 explicite). Effort S.

Catégorie Copy/UI (5 items) :
- **P0.C.1** — Retirer `#1F4937` de `app/globals.css` (et `ConseillerIntro.tsx:143`). Effort XS.
- **P0.C.2** — Retirer "onboarding" en UI utilisateur (4 occurrences `BrandOnboardingSheet`, `BrandOnboardingHeaderCta` ×2, `ResumeChoiceSheet`). Effort S.
- **P0.C.3** — "Conseiller" → "conseiller" minuscule (`OutilsCatalog.tsx:122`, `app/(outils)/outils/conseiller/page.tsx:138-139`). Effort XS.
- **P0.C.4** — Compléter `completeBrandOnboarding` : `responses['1'].audience_principale` et `responses['3'].ton_adjectifs` non transférés à `brands`. Effort S.
- **P0.C.5** — Retirer fragments internes "TF Ads", "Sub-prompt", "Sprint 38+" exposés dans `OutilsCatalog.tsx`. Effort XS.

Catégorie Workflow (4 items) :
- **P0.W.1** — `loading.tsx` + `error.tsx` sur nav 5. Effort S.
- **P0.W.2** — Coexistence deux blocs piliers sur `/ma-marque` (legacy JSONB + nouveau `<PillarsManager>`). Effort M, impact ★★★★★.
- **P0.W.3** — Étendre `lib/post-creator/roadmaps.ts` aux 6 formats (actuellement 4, divergence avec `lib/i18n/formats.ts`). Effort S.
- **P0.W.4** — Tests isolation 5/5 sur `pillars` + `posts`. Effort M.

### 7.2 P1 (43 items uniques, Sprint 40 cible)

Catégorie UI / Design system (16 items) : migration hex hardcodés `BrandOnboardingStep.tsx`, Things 3 task states sur `/aujourd-hui`, empty states unifiés outils, touch targets ≥ 44px sur `<PillarCard>`, confirmation sheet iOS au lieu de `window.confirm`, refonte `ConseillerIntro` palette v60, unifier sheet patterns, breadcrumb "Outils" → "Mes Outils", halos cohérents cross-pages, suppression `<PiliersSheet>` legacy, refonte étape piliers onboarding via wizard nouveau, gradient `<PillarCard>` accentué, header `<BrandOnboardingHeaderCta>` cohérence, audit emoji, animations cohérentes, format compteur FR cross-pages.

Catégorie Copy (8 items) : hook pre-commit vocab interdit, sentence case audit, microcopie d'erreur empathique, "le user / les users" jamais en UI, "ta voix" pas "ton ton", "raconter" pas "communiquer", "crédits" pas "tokens", "ta communauté" pas "tes followers".

Catégorie Archi (11 items) : cacheable prompts à vérifier, tests isolation ALL tables, doc `VOICE_SHEET_RULES`, refactor `BrandOnboardingStep.tsx` 243 lignes useState, migration drop `posts.pilier_nom`, drop `brands.piliers_narratifs`, source vérité unique `lib/post-creator/roadmaps.ts`, audit complet `createAdmin()` usage, helper `getUserTenantId()`, `'use server'` audit complet, cycles d'import grep.

Catégorie Workflow (8 items) : loading/error sur sous-routes programme, focus auto inputs, retour naturel post-save, toast iOS-style, cascade redirect onboarding, breadcrumb retour explicite `/programme/post/[postId]`, confirmation explicite suppression brand archive, état vide cohérent `/programme` semaine vide.

Catégorie Performance (4 items) : Lighthouse score nav 5, `prefers-reduced-motion`, `prefers-reduced-transparency`, Axe-core WCAG AA.

### 7.3 Écarts consignés / reports / aborts

Source : audits Sprint 36-37 + decisions Sprint 38.

- `audits/sprint-36-b-3/abort-log.md` à `sprint-36-b-8/abort-log.md` présents (chaque sous-sprint a son log d'aborts).
- Sprint 38 `decisions.md` : 9 pages skippées explicitement (compte/*, programme sous-routes, accueil, post-creator/[format], dev/split-brief) — reportées Sprint 41.
- Sprint 38 : screenshots Playwright reportés (script livré, exécution déférée Lead — auth Supabase requise).
- Sprint 38 : volume 8009 lignes (limite basse du target 8K-12K) — assumé.
- Sprint 37.M Recalé doctrine par Lead (visual placeholder saturé) → Sprint 37.N rollback livré.

---

## 8. CHIFFRES CLÉS PRODUIT

| Métrique | Valeur | Source |
|---|---|---|
| Pages (`find app -name page.tsx`) | 30 | repo |
| Composants TSX (`find components -name '*.tsx'`) | 177 | repo |
| Fichiers lib TS (`find lib -name '*.ts'`) | 85 | repo |
| Migrations Supabase (`ls supabase/migrations`) | 26 | repo |
| Tables actives (audit migrations) | ~21 (10 V1 + 11 extensions) | repo |
| Policies RLS (`grep create policy`) | 73 occurrences | repo |
| Skills repo (`ls skills/`) | 9 fichiers | repo |
| Audits dossiers (`ls -d audits/sprint-*`) | 29 dossiers locaux | repo (sprint-38 sur origin uniquement) |
| Lignes audits/sprint-38/ cumulées | 8009 | `origin/sprint-38` |
| LOC app/ (`.tsx + .ts`) | 12 657 | repo |
| LOC components/ | 33 638 | repo |
| LOC lib/ | 7 099 | repo |
| LOC globals.css | 1 901 | repo |
| Commits sprint-37 depuis main | 125 | `git rev-list` |
| Commits sprint-38 depuis main | 128 (125 base + 3 audits) | `git rev-list` |
| Tags totaux | 12 | `git tag` |
| Server Actions sous `app/_actions/` | 20 | repo |
| Seeds JSON clients (`ls seeds/`) | 12 (3 clients × 4 fichiers) | repo |
| Branches Git locales `sprint-*` | 12 | `git branch` |

`[NON DOCUMENTÉ DANS LE REPO]` : CA garanti, nombre exact d'utilisateurs en prod, nombre de posts générés, Apple Grade actuel, métriques d'usage.

---

## 9. PHILOSOPHIE EN VIGUEUR

### 9.1 Règle d'or (`00-CONCEPT.md:179-182`)

> "**Quand on hésite : on enlève.**
>
> La soustraction précède toujours l'addition. Apple n'ajoute pas — Apple retire."

Réaffirmée verbatim dans `10-SACRED.md:140-146`.

### 9.2 Les 8 piliers Apple (`00-CONCEPT.md:153-162`)

> "1. Human Interface & Craftsmanship
> 2. Frictionless Ecosystem & State Management
> 3. Time-to-Wow & Delight (< 2 min)
> 4. Aspirational Storytelling & Clarity
> 5. Transparent Value Exchange
> 6. Uncompromising Polish (zéro 'bientôt')
> 7. Native Synergy
> 8. Out of the Box Experience"

### 9.3 Émotion centrale (`00-CONCEPT.md:21-26`)

> "**Tranquillité.**
>
> C'est le filtre absolu pour toute décision UI, copy, feature : 'Est-ce que ça apporte de la tranquillité au dirigeant ?' Si non, c'est recalé."

### 9.4 Citation anchor (référencée par les audits Sprint 38 + CF-INVENTAIRE-V60 fourni)

> "lui faire croire que c'est lui qui pilote et que tout est sous contrôle avec un vrai tableau de bord, simple et efficace."
> — Ulysse, 12 mai 2026

`[ABSENT du repo]` : cette citation n'a pas été trouvée dans les fichiers skills/ lus. Elle figure dans les audits Sprint 38 (`origin/sprint-38`) et dans le CF-INVENTAIRE-V60.md fourni par Lead.

### 9.5 Décisions abandonnées (`00-CONCEPT.md:166-174`)

> "À ne JAMAIS proposer de réintégrer sans Apple Board explicite :
> - Méthode 4 mois pédagogique
> - Module 'Mon Programme' dédié
> - Couleur cuivre #C77D3A
> - Bulle flottante Conseiller
> - Onboarding 10 questions
> - Plans b2c_solo / b2c_pro / b2c_studio en V1"

`[CONFLIT OBSERVÉ]` : "Module 'Mon Programme' dédié" est listé comme abandonné, alors que `app/(programme)/programme/` existe et que la route `/programme` (label nav "Mon Programme" en doctrine externe Lead) est livrée.

---

## 10. ZONES NON DOCUMENTÉES

Pendant cette cartographie, les questions suivantes n'ont pas trouvé de réponse explicite dans le repo. Hypothèses d'origine de l'info entre `()`.

1. **Persona Floriane (28 ans, brand manager Carlo Sarrabezolles)** — absent des skills/ repo. (mémoire Lead / audits Sprint 38)
2. **CA garanti 81K€ première année** — absent. (mémoire Lead)
3. **Citation anchor 12 mai 2026** verbatim — non trouvée dans skills/ repo. (origine audits Sprint 38 + Lead)
4. **Apple Grade 61/80 V1** — non documenté dans le repo. (mémoire Lead / audit historique externe)
5. **Trilogie Organique / Outreach / Libre** — référencée par Lead, non trouvée en code ou skills/.
6. **Phase 1 anecdotique vs Phase 2 programme 3 mois** — non explicité dans repo.
7. **Détail des permissions internes Owner / Editor / Viewer** — non trouvé.
8. **Différenciation V1 vs V2 module par module** — partielle (`docs/roadmap-v2.md` cité en README mais non lu).
9. **Pricing exact V2 (49€/mois)** — mention partielle (`00-CONCEPT.md:60-65`), pas de tableau définitif.
10. **VOICE_SHEET_RULES** dans `lib/ai/prompts/system.ts` — fichier cité comme "sacré" dans `10-SACRED.md:10-18` et `01-ARCHITECTURE.md:140` mais non lu dans cet inventaire.
11. **`liquid-glass.css`** — fichier mentionné dans `skills/04-DESIGN_SYSTEM.md:9` mais pas vérifié dans cet inventaire (le grep tokens a porté sur `globals.css`).
12. **Détail du composant `<SplitBrief>`** — référencé par `app/(aujourd-hui)/aujourd-hui/page.tsx:17`, fichier `components/layouts/SplitBrief.tsx` non lu.
13. **Comportement offline / PWA** — `01-ARCHITECTURE.md` mentionne PWA dans les "Pending validation" (`l. 248-256`) — état exact dans le code non vérifié.
14. **`app/(outils)/outils/post-creator/[format]/page.tsx`** — page dynamic existe, contenu non lu ici (6 formats canoniques sont définis dans `lib/i18n/formats.ts`, branchement runtime non vérifié).
15. **13 skills CFS sœurs** (cfs-apple-audit, cfs-communication-task-force, etc.) — non présentes dans le repo. (hébergées côté Claude Code Lead selon CF-INVENTAIRE fourni).
16. **Doublon route `/programme/post/[postId]` vs `/programme/posts/[postId]`** — deux dossiers `post/` et `posts/` coexistent dans `app/(programme)/programme/`, raison d'être non lue.
17. **Channel waitlist** — table `channel_waitlist` (migration 010) crée une waitlist non tenant-scoped. Usage en UI non vérifié.

---

## 11. FIN ÉTAPE 1

Cet inventaire pose l'état factuel du repo Creative Fair v60 au 16 mai 2026, branche `sprint-37` HEAD. 26 migrations actives, 30 routes Next.js, 177 composants, 20 server actions, 9 skills repo + skills CFS sœurs externes. Trois branches Git actives (`main` à `v1.7.2`, `sprint-37` à `eb0e72e`, `sprint-38` à `05493c5`). Dette technique cartographiée par l'audit Sprint 38 : 18 P0, 43 P1, ~30 P2.

Aucun jugement n'est porté ici sur ce qui devrait évoluer. Aucune recommandation n'est formulée.

**Étapes suivantes (référencées sans préempter)** :
- **Étape 2** : inventaire des outils intimes (iMessage, Instagram, WhatsApp, Apple Calendar, Photos, Notes) que Floriane utilise déjà.
- **Étape 3** : mapping module CF ↔ outil intime, arbitrage tranquillité vs moat.
- **Étape 4** : verdict V1.1 — ce qu'on garde, refonds, pivote → backlog Sprint 39+.

---

**FIN DOCUMENT 01-inventaire-v60.md**
