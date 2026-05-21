# Creative Fair V1 — Récapitulatif

État de la V1 au moment du tag `v1.0.0`. À lire en premier par toute
nouvelle personne contribuant au projet.

## Périmètre livré

- **4 destinations utilisateur** : Aujourd'hui, Calendrier, Ma marque,
  Conseiller.
- **3 formats Post Creator** : Anecdote live, Anecdote custom, Brief
  externe.
- **Multi-tenant** : 3 clients pré-configurés (Angelina, Tous en Tête,
  Le Comptoir Général).
- **Interface admin** : provisioning et configuration tenant pour
  `creativefair@1922.studio`.
- **Design Liquid Glass** : tokens + 3 niveaux + accessibilité.

## Architecture

### Stack
- Next.js 16 App Router, route groups `(app)`, `(admin)`, `(auth)`.
- Supabase SSR, RLS multi-tenant.
- Anthropic SDK 0.94 (Opus 4.7 par défaut, Sonnet 4.6 pour brief
  externe + admin).
- Tailwind v4 + CSS variables par tenant.

### Tables Supabase
10 tables : `tenants`, `profiles`, `brands`, `onboarding_answers`,
`uploads`, `posts`, `conversations`, `daily_coaching`,
`analytics_events`, `credits_usage`.

### Routes IA
- `/api/ai/coaching` — coaching quotidien Opus 4.7.
- `/api/ai/business-suggest` — suggestions calendrier Opus 4.7.
- `/api/ai/post-generation` — 6 étapes Opus 4.7 (web_search step 1).
- `/api/ai/brief` — brief externe Sonnet 4.6.
- `/api/ai/chat` — Conseiller streaming Opus 4.7.

Tous utilisent `buildSystemPrompt` (`lib/ai/caching.ts`) avec
`cache_control: ephemeral` sur la dernière partie système.

### Helpers IA
- `lib/ai/client.ts` — instance Anthropic.
- `lib/ai/caching.ts` — `buildSystemPrompt` + ephemeral.
- `lib/ai/credits.ts` — pricing + log via `createAdmin`.
- `lib/ai/brand-context.ts` — `buildStructuredBrandContext` +
  `findNearestBusinessEvent`.
- `lib/ai/prompts/` — un fichier par feature, VOICE_SHEET sacrée.

### Server Actions
- `lib/posts/actions.ts` : createPost, deletePost, updatePostSchedule,
  schedulePost, updatePostStatus.
- `app/(admin)/tenants/actions.ts` : createTenant, updateTenantTheme,
  updateTenantBrandBook, updateTenantBusinessCalendar, inviteUser.

## Sécurité

### Authentification
- Magic link Supabase.
- Session via cookies, refresh dans `proxy.ts`.

### Autorisation
- **Routes user** : RLS Supabase via `createClient()`.
- **Routes admin** : triple gate (proxy + layout + requireAdmin).
- **Allowlist admin** : centralisée `lib/auth/admin.ts`, dupliquée
  inline dans `proxy.ts` (edge runtime).

### Service role
`createAdmin()` (service_role) utilisé uniquement pour :
1. Provisioning tenant (avant que l'user n'ait de profil).
2. Logging crédits dans `credits_usage`.
3. Lecture admin des tenants pour la liste.

## Voice sheet

Source vivante : `lib/ai/prompts/system.ts`. Règles :

- Sentence case partout.
- Pas d'emoji, pas de point d'exclamation.
- Vocabulaire interdit dans les textes utilisateurs : pipeline,
  dashboard, tokens, sync, workflow, widget.
- Identifiants de code et noms de tables : libres (post, brand, story
  autorisés en code).

## Limites V1 documentées

Voir `audits/SPRINT_27_BUGS.md` et `audits/V2_BACKLOG.md`.

P1 ouverts en V1 (à fixer rapidement) :
- Fallback web_search Anecdote live.
- Erreurs Supabase humanisées admin.
- Streaming SSE Conseiller en production.

## Documentation

- **User** : `docs/user/` (6 fichiers).
- **Admin** : `docs/admin/` (3 fichiers).
- **Roadmap V2** : `docs/roadmap-v2.md`.
- **Audits sprints** : `audits/SPRINT_*.md` + `BATCH_4_7_SUMMARY.md`.

## Comment lancer le projet

```bash
npm install
cp .env.example .env.local   # remplir les clés
npm run dev
```

Provisionner les 3 clients :

```bash
npx tsx scripts/configure-tenant.ts angelina
npx tsx scripts/configure-tenant.ts tous-en-tete
npx tsx scripts/configure-tenant.ts comptoir-general
```
