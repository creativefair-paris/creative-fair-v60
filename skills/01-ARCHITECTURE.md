# Creative Fair — Architecture v2.0.1

> Document doctrinal complémentaire à `00-CONCEPT.md`.
> Couvre la navigation, les layouts canoniques, le stack, les helpers, le workflow.
> Mis à jour le 21 mai 2026 (Sprint 39).

---

## Partie I — Architecture produit

## 1. La carte du produit

Creative Fair compte dix pages principales en V1. Aucune autre page top-level n'est admise sans amendement de ce document.

| Page | Rôle | Section nav |
|---|---|---|
| **Aujourd'hui** | Hub central, point d'entrée systématique | (racine, hors section) |
| **Calendrier** | Vue temporelle des publications futures et événements | Travail |
| **Rappels** | Tâches à faire, format Things 3 | Travail |
| **Bibliothèque** | Mémoire éditoriale, publications passées format 4:5 | Travail |
| **Messages** | Conversations avec Hélène et les Experts, plus carnet | Travail |
| **Mon Programme** | Pilotage trimestriel et hebdomadaire de la marque | Éditorial |
| **Ma Marque** | Doctrine éditoriale, piliers, univers, ressources | Éditorial |
| **Mes Outils** | Catalogue des outils de création éditoriale | Éditorial |
| **Compte** | Profil utilisateur, plan, sécurité, apparence | Système (icône) |
| **Aide** | Support, à propos | Système (icône) |

**Contacts** n'est pas une page distincte. Le carnet de contacts est intégré dans **Messages** via un bouton "Voir tous les contacts" ou un onglet Carnet (à arbitrer à l'implémentation).

**Conseiller** n'est pas une page distincte. La conversation avec l'IA orchestratrice se fait via **Messages** où Hélène M. est pinned en permanence.

---

## 2. La navigation

### 2.1 Sidebar globale — visible dans Aujourd'hui uniquement

L'unique endroit où la navigation complète est exposée est la page **Aujourd'hui**. La sidebar globale liste les huit destinations principales groupées en deux sections nommées, plus une ligne d'icônes système en bas.

```
TRAVAIL
  ▸ Calendrier
  ▸ Rappels
  ▸ Bibliothèque
  ▸ Messages

ÉDITORIAL
  ▸ Mon Programme
  ▸ Ma Marque
  ▸ Mes Outils

[icône Compte]  [icône Aide]
```

Les icônes Compte et Aide sont sur **une seule ligne en bas de la sidebar**, sans label, juste l'icône. Tap dessus = ouverture de la page correspondante.

Les sections (TRAVAIL, ÉDITORIAL) sont des **eyebrows** typographiques `11px / 600 / uppercase / letter-spacing 0.08em / color rgba(60,60,67,0.45)`. Pas de séparateur visuel agressif.

### 2.2 Pas de sidebar globale ailleurs

Toutes les pages **autres qu'Aujourd'hui** sont autonomes. Elles n'affichent pas la sidebar globale. Elles utilisent leur propre **sub-sidebar interne** quand elles ont besoin d'une navigation secondaire.

La navigation entre pages se fait par :

1. **Le fil d'Ariane.** Chaque page affiche en haut un breadcrumb du type `Aujourd'hui › Ma Marque`. Cliquer sur "Aujourd'hui" renvoie au hub central.
2. **Les widgets cliquables d'Aujourd'hui.** Le widget Calendrier ouvre Calendrier, le widget Rappels ouvre Rappels, etc.
3. **Les deep-links contextuels.** Une publication dans Bibliothèque peut renvoyer vers Mon Programme avec un contexte `?from=bibliotheque&context=postId`.

Ce modèle est délibéré. Il garantit que **Floriane revient au hub central plusieurs fois par jour**, ce qui maintient la vue d'ensemble.

### 2.3 Pas de tabs, pas de bottom nav

Pas d'onglets en bas d'écran. Pas de tabs horizontaux qui changent radicalement de contexte. La navigation est verticale (sidebar) ou en breadcrumb. Point.

---

## 3. Le layout canonique

### 3.1 Layout d'Aujourd'hui (le hub)

```
┌──────────────────────────────────────────────────────────┐
│  page-header  (sticky, breadcrumb désactivé, H1 + date)   │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  Sidebar   │  Content pane                               │
│  globale   │  ├─ 3 widgets (Calendrier · Rappels · Mes.) │
│  10 items  │  └─ Roadmap "X étapes pour aujourd'hui"     │
│  + 2 icons │                                             │
│            │                                             │
└────────────┴─────────────────────────────────────────────┘
```

Densité Aujourd'hui = option α stricte minimale, actée Sprint 39 :

- Trois widgets visibles uniquement : Calendrier, Rappels, Messages.
- Un bloc Roadmap visible uniquement : le parcours du jour orchestré par Hélène.
- **Pas d'État du programme.** Pas de KPIs Cohérence/Équilibre/Densité/Profondeur. Aucune métrique inventée.
- **Pas de Dernière activité.** Cette section, sympathique mais non actionnable, est retirée.

La Roadmap n'a pas un nombre fixe d'étapes. Hélène génère 3 à 10 étapes selon la charge réelle du jour.

### 3.2 Layout des pages métier (toutes sauf Aujourd'hui)

```
┌──────────────────────────────────────────────────────────┐
│  page-header  (sticky, breadcrumb actif, H1, sous-titre)  │
├────────────┬─────────────────────────────────────────────┤
│  Sub-      │                                             │
│  sidebar   │  Content pane                               │
│  260px     │                                             │
│  (interne  │  (variant selon la page)                    │
│  à la      │                                             │
│  page)     │                                             │
│            │                                             │
└────────────┴─────────────────────────────────────────────┘
```

La sub-sidebar interne fait **260px** de large (constante actée). Sticky en haut (`top: 100px`), `height: fit-content`, fond `rgba(255,255,255,0.4)` avec `backdrop-filter: blur(16px)`, border `0.5px rgba(0,0,0,0.05)`, radius `14px`, padding `14px 12px`.

Le content pane occupe le reste, `gap: var(--s-6)` entre les deux panes.

En mobile (≤900px), le grid passe à une seule colonne et le sub-sidebar passe au-dessus du content.

### 3.3 Le page-header canonique

Tous les page-headers partagent la même grammaire :

- Sticky en haut, fond transparent (le wallpaper transparaît).
- Padding vertical 24px ouvert, 12px compacté (au scroll, classe `is-scrolled`).
- En contenu : breadcrumb `Aujourd'hui ›` (caché en mode compacté), H1 du nom de la page, sous-titre optionnel sous le H1.
- Avatar utilisateur trailing à droite, niveau de la ligne H1.

### 3.4 Le wallpaper

Deux variantes seulement :

- **Wallpaper neutral.** Crème nuancée diffuse, très léger gradient radial. Par défaut sur toutes les pages métier.
- **Wallpaper saturated.** Halos colorés (bleu CF, lilas, indigo, orange) animés en `drift` 18-30s. Réservé à Aujourd'hui uniquement.

---

## 4. Le mode mono-marque V1

Un utilisateur Creative Fair pilote une seule marque active. Conséquences architecturales :

- Pas de sélecteur de marque dans le header. Pas de switch.
- Compte > Marques n'affiche pas de liste — il y a un bloc unique "Ma Marque" qui renvoie vers la page Ma Marque.
- Ma Marque > sidebar > "Plan Pro · une marque active" est rédigé sans ambiguïté.

Le multi-marque est ouvert en V2 sur un Plan Studio. L'architecture doit dès V1 prévoir le `tenant_id` partout pour que la bascule V2 soit triviale. Mais l'UI V1 ne montre aucune mention multi-marque.

---

## 5. Le pattern de retour

Floriane doit pouvoir, depuis n'importe quel point du produit, revenir à Aujourd'hui en un clic.

Trois mécanismes garantissent ce retour :

1. **Le breadcrumb.** Toutes les pages ont `Aujourd'hui ›` cliquable en haut.
2. **Le raccourci clavier.** `Cmd/Ctrl + H` ramène à Aujourd'hui depuis n'importe où (à implémenter Sprint 43+).
3. **Le logo CF dans le page-header.** À ajouter en V1.1 dans le coin haut gauche, cliquable.

---

## 6. Les états cross-pages

Certaines données circulent entre pages :

- **Une publication** peut exister dans Bibliothèque (archivée), dans Calendrier (programmée), dans Mon Programme (vue trimestrielle), dans Messages (discutée avec Hélène). Toutes ces vues pointent vers la même entité backend `posts.id`.
- **Une tâche** dans Rappels peut être créée par Hélène en conversation Messages, ou créée manuellement, ou générée automatiquement par la Roadmap d'Aujourd'hui.
- **Un pilier** dans Ma Marque (table `pillars`) est référencé par les publications (`posts.pilier_id`), par le programme (Mon Programme > Piliers actifs), par les suggestions de série (Mon Programme > Suggestions).

Le pattern technique pour exposer ce cross-context est `?from=<module>&context=<id>` dans les query params, capturé par un composant `<ContextBanner>` en haut de la page de destination.

---

## Partie II — Architecture technique

## 7. Le stack

```
FRONTEND
  Next.js 16.2.4 (App Router, Turbopack)
  React 19
  TypeScript strict + noUncheckedIndexedAccess + noImplicitReturns
  TailwindCSS v4 (CSS-first, pas de config explicite)
  Lucide React pour les icônes

BACKEND
  Supabase (PostgreSQL + Auth + Storage + RLS)
  Vercel Edge Functions
  Anthropic API (Opus 4.7, Sonnet 4.6, Haiku 4.5)

INFRASTRUCTURE
  GitHub privé : creativefair-paris/creative-fair-v60
  Vercel : creative-fair-v60.vercel.app
  Supabase : ugfnokdxdqaqapylafeq (Frankfurt eu-west)
```

---

## 8. Structure du repo

```
/Users/ulysselemoine/Desktop/creative-fair/creative-fair-v60/

app/
├── (auth)/login/                   ← Magic link Supabase
├── (app)/aujourd-hui/              ← Hub central
├── (app)/calendrier/               ← Vue temporelle des publications
├── (app)/rappels/                  ← Tâches Things 3
├── (app)/bibliotheque/             ← Mémoire éditoriale
├── (app)/messages/                 ← Hélène + 12 Experts
├── (app)/mon-programme/            ← Pilotage trimestriel
├── (app)/ma-marque/                ← Doctrine éditoriale
├── (app)/mes-outils/               ← Catalogue outils création
├── (app)/compte/                   ← Profil utilisateur
├── (admin)/                        ← Espace Lead (Sprint 42+)
└── api/ai/                         ← Edge functions IA

components/
├── layout/                         ← page-header, sidebar globale
├── aujourd-hui/                    ← widgets, roadmap
├── messages/                       ← Hélène, Experts, conversation
├── mon-programme/                  ← suggestions, piliers, heatmap
├── ma-marque/                      ← piliers, identité éditoriale
├── outils/                         ← catalogue + post creator
└── ui/                             ← Card, Button, Modal, Input

lib/
├── ai/
│   ├── client.ts                   ← instance Anthropic
│   ├── caching.ts                  ← buildSystemPrompt + ephemeral
│   ├── credits.ts                  ← pricing + log
│   ├── brand-context.ts            ← contexte marque + business events
│   └── prompts/
│       ├── system.ts               ← VOICE_SHEET_RULES (SACRÉ)
│       ├── helene.ts               ← prompt Hélène orchestratrice
│       └── experts/                ← un fichier par Expert
├── experts/
│   ├── types.ts                    ← types Expert, conversation
│   └── routing.ts                  ← mapping rôle → modèle LLM
├── pillars/
│   ├── types.ts                    ← PillarRow, PillarLite
│   └── prompts.ts                  ← prompts wizard piliers
├── posts/
│   └── actions.ts                  ← Server Actions CRUD
├── supabase/
│   ├── client.ts                   ← browser
│   ├── server.ts                   ← cookies
│   ├── admin.ts                    ← service_role (RLS bypass)
│   └── middleware.ts               ← session refresh
├── theme/                          ← tokens CSS
└── auth/admin.ts                   ← allowlist Lead

skills/                              ← SOURCES DE VÉRITÉ DOCTRINALES
├── 00-MASTER.md
├── 00-CONCEPT.md
├── 01-ARCHITECTURE.md
├── 02-EXPERTS.md
├── 03-VOICE_SHEET.md
├── 04-MULTI_TENANT.md
└── 10-SACRED.md

styles/
├── cf-tokens.css                   ← tokens v60 (palette, glass, radius)
└── liquid-glass.css                ← classes z1/z2/z3

supabase/migrations/                ← migrations SQL versionnées

scripts/
├── test-multi-tenant.ts            ← test isolation 5/5
├── configure-tenant.ts             ← provisionning
└── dev-helpers.sh                  ← helpers shell

seeds/                              ← pré-remplis tenants test
audits/                             ← reports par sprint
docs/                               ← user + admin
proxy.ts                            ← Next.js 16 (NOT middleware.ts)
```

---

## 9. Le multi-tenant et la sécurité

Toutes les routes Server Actions, toutes les requêtes Supabase, doivent inclure un check `tenant_id` strict.

Le pattern fautif identifié au Sprint 38 — `createAdmin()` + `.eq("id", ...)` sans vérification d'appartenance — est interdit. Il est à éradiquer **avant tout client en production**.

Le pattern canonique côté Server Component / Route Handler :

```ts
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data } = await supabase.from('table').select('*')
// → RLS filtre automatiquement par tenant_id
```

Côté Server Action mutante, le RLS protège déjà, mais on ne filtre **jamais manuellement** par `tenant_id` envoyé depuis le client. Le `tenant_id` est lu côté serveur depuis la session uniquement.

Quand utiliser `createAdmin()` (service_role, bypass RLS) — cas légitimes uniquement :

1. Création d'un nouveau tenant (avant que le user ait un profile)
2. Migrations et seeds
3. Cron jobs server-side (analytics, billing)
4. Logging crédits dans `credits_usage` (la table est read-only pour les users)
5. Webhooks Stripe ou intégrations sans contexte user

**Jamais** pour servir une requête venant d'un user authentifié.

Détails complets dans `skills/04-MULTI_TENANT.md`.

---

## 10. Anthropic — Modèles, caching, et règles sacrées

### 10.1 Cache obligatoire

Tous les system prompts utilisent `cache_control: { type: 'ephemeral' }` via le helper `buildSystemPrompt` dans `lib/ai/caching.ts`. **90% d'économie sur les coûts.** Ne pas modifier ces prompts sans concertation.

### 10.2 VOICE_SHEET_RULES — fichier SACRÉ

Fichier : `lib/ai/prompts/system.ts`

Contenu : règles de voix éditoriale appliquées sur tous les outputs IA (Hélène, Experts, génération de posts, suggestions).

**Modifier ce fichier casse le cache 90%.** Toute modification = perte massive d'argent + régression qualité immédiate sur tous les outputs.

**Toute modification doit passer par un Sprint dédié et une validation Lead explicite.**

### 10.3 Modèles par rôle

| Rôle / Tâche | Modèle |
|---|---|
| Hélène M. (orchestratrice) | **Opus 4.7** |
| Experts conversationnels | **Opus 4.7 ou Sonnet 4.6** (jamais Haiku) — voir `02-EXPERTS.md` §3 |
| Génération de posts | Opus 4.7 (Post Creator) |
| Suggestions calendrier | Opus 4.7 |
| Brief externe | Sonnet 4.6 |
| Tâches utilitaires invisibles | Haiku 4.5 (titres, résumés, extraction d'entités) |
| Admin / classification | Haiku 4.5 |

**Règle stricte :** Haiku 4.5 n'est jamais utilisé pour générer un livrable signé d'un Expert. Voir `02-EXPERTS.md` §6.

---

## 11. Règles de code

### 11.1 TypeScript

- Strict mode obligatoire
- `noUncheckedIndexedAccess` activé → guard les array access
- Jamais de `any`
- Server components par défaut, `"use client"` minimal

### 11.2 Couleurs

- **Aucune couleur hex hardcodée** dans les composants
- Toujours `var(--color-*)` ou classes Tailwind tokenisées via `cf-tokens.css`
- Exception : `#FFFFFF` pour destructive CTAs

### 11.3 Next.js 16

- `proxy.ts` (export `proxy`) — **jamais** `middleware.ts`
- App Router exclusivement
- Server Actions pour les mutations DB

### 11.4 Supabase

- 3 helpers distincts : `client.ts` / `server.ts` / `admin.ts`
- RLS systématique sur toutes les tables
- `createAdmin()` jamais utilisé côté user (voir §9)

### 11.5 Animations

- Duration 250-600ms
- Easing `ease-out` toujours
- `prefers-reduced-motion` respecté

---

## 12. Configuration locale Mac

### 12.1 PATH Node (non installé système)

```bash
export PATH="/Users/ulysselemoine/.local/node/bin:$PATH"
```

À ajouter en début de chaque session Terminal, ou via `scripts/env.sh`.

### 12.2 Email Git canonique

```
user.email   creativefair@1922.studio
user.name    Ulysse Lemoine
```

Jamais l'email par défaut Mac (`*.local`).

### 12.3 Démarrer le dev local

```bash
cd /Users/ulysselemoine/Desktop/creative-fair/creative-fair-v60
export PATH="/Users/ulysselemoine/.local/node/bin:$PATH"
npm run dev
# → http://localhost:3000
```

---

## 13. Workflow de livraison

### 13.1 Avant chaque commit

```bash
npx tsc --noEmit            # check TypeScript, 0 erreur
npm run lint                # check lint, 0 warning
npm run build               # build complet, succès
```

Si l'un échoue : **ne pas commit**. Fix d'abord.

### 13.2 Avant chaque tag de version

- Build local OK
- Test fonctionnel manuel des 10 pages principales OK
- Aucun bug P0/P1 connu
- Audit Apple Grade ≥ 60/80
- Validation Lead explicite (Ulysse tagge, pas Claude Code)

### 13.3 Après push

Vercel rebuild automatiquement. Vérifier le déploiement sur `creative-fair-v60.vercel.app`.

### 13.4 Branches

- `main` : prod, jamais touchée directement, tags `v*.*.*` uniquement.
- `sprint-X` : branche de travail du sprint en cours.
- `cf-conceptuel-0` : exploration V2/V3, en quarantaine, jamais mergée.
- `archive/*` : branches archivées de l'historique.

---

## 14. Variables d'environnement Vercel

```
ANTHROPIC_API_KEY              ← sk-ant-...
NEXT_PUBLIC_SUPABASE_URL       ← https://ugf...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  ← sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY      ← sb_secret_...
NEXT_PUBLIC_APP_URL            ← https://creativefair.fr
```

---

## 15. Anti-patterns à éviter

- Modifier VOICE_SHEET_RULES sans concertation
- Push sans `npm run build` local OK
- Tag de version avant validation fonctionnelle Lead
- Hardcoder une couleur hex dans un composant
- Utiliser `middleware.ts` (Next 16 → `proxy.ts`)
- `createAdmin()` côté user
- Ajouter une destination de navigation sans amendement de `00-CONCEPT.md`
- Ajouter un emoji ou une exclamation dans une copie UI
- Ajouter une table Supabase sans migration versionnée + politique RLS + test isolation
- Utiliser Haiku 4.5 pour un Expert nommé
- Produire un document `.md` de plus de 200 lignes hors `audits/` sans validation Lead explicite préalable

---

## 16. Pending validation

Tâches techniques en attente, traçables sprint après sprint :

```
☐ Tests fonctionnels manuels page par page (Sprint 40)
☐ Patch sécurité multi-tenant sur server actions existantes (P0.1 Sprint 38)
☐ web_search_20250305 activé sur console.anthropic.com
☐ Domaine creativefair.fr configuré (Hostinger → Vercel)
☐ Configuration tenants via scripts/configure-tenant.ts
☐ Reconstruction des 10 pages Next.js depuis les HTML Claude Design (Sprint 43+)
```

---

*Document v2.0.1 du 21 mai 2026. Toute proposition de modification passe par un Sprint dédié, jamais en passant.*
