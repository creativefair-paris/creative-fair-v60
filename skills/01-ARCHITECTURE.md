# 01 — Architecture Creative Fair v60

> **Source de vérité technique. À lire avant tout code.**

============================================================
## Stack

```
FRONTEND
  Next.js 16.2.4 (App Router, Turbopack)
  React 19
  TypeScript strict + noUncheckedIndexedAccess + noImplicitReturns
  TailwindCSS v4

BACKEND
  Supabase (PostgreSQL + Auth + Storage + RLS)
  Vercel Edge Functions
  Anthropic API

INFRASTRUCTURE
  GitHub privé : creativefair-paris/creative-fair-v60
  Vercel : creative-fair-v60.vercel.app
  Supabase : ugfnokdxdqaqapylafeq (Frankfurt eu-west)
```

============================================================
## Architecture multi-tenant

### 10 tables avec Row Level Security Postgres

```
tenants               — Marques clients
profiles              — Users liés à un tenant + rôle
brands                — Brand book + business calendar (JSON)
onboarding_answers    — 3 questions de l'onboarding
uploads               — Fichiers uploadés par tenant
posts                 — Posts générés et programmés
conversations         — Historiques Conseiller
daily_coaching        — Coaching généré chaque jour
analytics_events      — Événements pour analytics
credits_usage         — Logging par génération IA
```

### Isolation prouvée

Helper Postgres : `public.user_tenant_id()` filtre tout.
Tests isolation : 5/5 (script `scripts/test-multi-tenant.ts`).
Aucun user ne peut voir les données d'un autre tenant.

============================================================
## Structure du repo

```
/Users/ulysselemoine/Desktop/creative-fair-v60/

app/
├── (auth)/login/                   ← Magic link
├── (app)/aujourdhui/               ← Coaching IA
├── (app)/calendrier/               ← Vue posts
│   └── [postId]/
├── (app)/ma-marque/                ← Hub
│   ├── brand-book/
│   ├── business-calendar/
│   └── onboarding/
├── (app)/post-creator/[postId]/    ← Génération posts
├── (app)/conseiller/               ← Chat streaming
├── (app)/mon-compte/               ← Email + crédits
├── (admin)/tenants/                ← Admin only (Ulysse)
└── api/ai/                         ← Edge functions

components/
├── layout/                         ← Header, Sidebar, BottomNav
├── aujourdhui/
├── calendar/
├── post-creator/
├── ma-marque/
├── conseiller/
└── ui/                             ← Card, Button, Modal, Input

lib/
├── ai/
│   ├── client.ts
│   ├── caching.ts
│   ├── tenant-context.ts
│   └── prompts/system.ts           ← VOICE_SHEET_RULES (SACRÉ)
├── supabase/
│   ├── client.ts                   ← browser
│   ├── server.ts                   ← cookies
│   ├── admin.ts                    ← service_role (RLS bypass)
│   └── middleware.ts
├── theme/
└── auth/admin.ts

skills/                              ← SOURCES DE VÉRITÉ
├── 00-CONCEPT.md
├── 01-ARCHITECTURE.md
└── 10-SACRED.md

styles/
└── liquid-glass.css                ← Tokens iOS 26

supabase/migrations/                ← 3 fichiers SQL

scripts/
├── test-multi-tenant.ts
└── configure-tenant.ts

seeds/                               ← Pré-remplis 3 clients
audits/                              ← Reports par sprint
docs/                                ← User + admin
proxy.ts                             ← Next.js 16
```

============================================================
## Anthropic — Modèles et caching

### Cache obligatoire

Tous les system prompts utilisent
`cache_control: { type: 'ephemeral' }`.
**90% d'économie**. Ne pas modifier ces prompts sans
concertation.

### Modèles par tâche

```
Opus 4.7
  coaching, post generation, conseiller,
  brand book generation, suggestions

Sonnet 4.6
  brief externe, auth, UI tools rapides

Haiku 4.5
  tâches très rapides, classification
```

### VOICE_SHEET_RULES (SACRÉ)

Fichier : `/lib/ai/prompts/system.ts`
Contenu : règles de voix éditoriale appliquées partout.
**Modifier ce fichier casse le cache 90%.**
Toute modification = perte massive d'argent + qualité.

============================================================
## Règles de code

### TypeScript

- Strict mode obligatoire
- `noUncheckedIndexedAccess` activé → guard les array access
- Jamais de `any`
- Server components par défaut, `"use client"` minimal

### Couleurs

- **Aucune couleur hex hardcodée** dans les composants
- Toujours `var(--color-*)` ou classes Tailwind tokenisées
- Exception : `#FFFFFF` pour destructive CTAs

### Next.js 16

- `proxy.ts` (export `proxy`) — PAS `middleware.ts`
- App Router exclusivement
- Server Actions pour les mutations DB

### Supabase

- 3 helpers distincts : `client.ts` / `server.ts` / `admin.ts`
- RLS systématique sur toutes les tables
- `createAdmin()` jamais utilisé côté user — admin only

### Animations

- Duration 250-600ms
- Easing `ease-out` toujours
- `prefers-reduced-motion` respecté

============================================================
## Configuration locale Mac

### PATH Node (NON installé système)

```bash
export PATH="/Users/ulysselemoine/.local/node/bin:$PATH"
```

À ajouter en début de chaque session Terminal.

### Email Git canonique

```
user.email   creativefair@1922.studio
user.name    Ulysse Lemoine
```

### Démarrer le dev local

```bash
cd /Users/ulysselemoine/Desktop/creative-fair-v60
export PATH="/Users/ulysselemoine/.local/node/bin:$PATH"
npm run dev
# → http://localhost:3000
```

============================================================
## Workflow de livraison

### Avant chaque commit

```bash
npx tsc --noEmit            # check TypeScript
npm run lint                # check lint
npm run build               # build complet (CRITIQUE)
```

Si l'un échoue : NE PAS COMMIT. Fix d'abord.

### Avant chaque tag de version

- Build local OK
- Test fonctionnel manuel OK
- Aucun bug P0/P1 connu

### Après push

Vercel rebuild automatiquement.
Vérifier le déploiement sur creative-fair-v60.vercel.app.

============================================================
## Variables d'environnement Vercel

```
ANTHROPIC_API_KEY              ← sk-ant-...
NEXT_PUBLIC_SUPABASE_URL       ← https://ugf...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  ← sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY      ← sb_secret_...
NEXT_PUBLIC_APP_URL            ← https://creativefair.fr
```

============================================================
## Bugs connus à NE PAS retravailler en V1

À retrouver dans `/audits/V2_BACKLOG.md`.
P2 documentés, traitement en V2 mois 4-6.

============================================================
## Pending validation

```
☐ Tests fonctionnels manuels page par page
☐ web_search_20250305 activé sur console.anthropic.com
☐ Domaine creativefair.fr configuré (Hostinger → Vercel)
☐ 3 visios B2B avec Angelina, Tous en Tête, Comptoir
☐ Configuration tenants via scripts/configure-tenant.ts
☐ Walkthroughs clients + récolte feedback
```

============================================================
## Anti-patterns à éviter

- Modifier VOICE_SHEET_RULES sans concertation
- Push sans `npm run build` local OK
- Tag de version avant validation fonctionnelle
- Hardcoder une couleur hex dans un composant
- Utiliser `middleware.ts` (Next 16 → `proxy.ts`)
- `createAdmin()` côté user
- Ajouter une 5e destination de navigation
- Ajouter un emoji ou exclamation dans une copie UI
