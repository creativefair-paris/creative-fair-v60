# Sprint 29 — Inventaire factuel
# État de la codebase au 2026-05-07 (tag v1.0.1, commit 9c1dc56)

> Phase 1 — Lecture seule. Aucune modification de code dans ce fichier.
> Colonnes : # | Sprint | Objectif déclaré | État réel du code | Déployé en prod ?

---

| # | Sprint | Objectif déclaré | État réel du code | Déployé en prod ? |
|---|---|---|---|---|
| 1 | Multi-tenant RLS | Isolation Supabase — tables tenants/profiles/brands, RLS, createClient/createAdmin | ✓ Implémenté. 5/5 tests RLS passés (SPRINT_1_TEST.md). `createClient` pour écritures user, `createAdmin` pour crédits + admin. | Oui |
| 2 | Config Supabase | Redirect URLs, Site URL, magic link | ✓ Documentation manuelle fournie (SPRINT_2_SUPABASE_CONFIG.md). Requiert actions dashboard Supabase. | Oui (actions manuelles exécutées) |
| 3 | Theming par tenant | CSS variables depuis `tenants.theme` jsonb, `buildThemeVars` | ✓ Implémenté. `lib/theme/apply-theme.ts` mappe toutes les variables. `defaultTheme.colors.accent = '#1F4937'` (vert forêt). Alias `--color-primary` présent pour compat. | Oui |
| 4 | Layout principal | Header, Sidebar, BottomNav — 4 destinations | ✓ Implémenté. `glass-bar` appliqué aux 3. Avatar avec initiales, dropdown Mon compte / Se déconnecter. | Oui |
| 5 | Route /api/ai/chat | Streaming SSE Claude → conseiller, contexte marque | ✓ Réécrit au Sprint 20 (Opus 4.7, `buildStructuredBrandContext`). Fonctionnel. Réserve : timeout SSE Vercel non résolu (bug P1 #103). | Oui |
| 6 | Brand book V1 | Page `/ma-marque/brand-book` — lecture, état vide vers onboarding | ✓ Implémenté. 7 sections en prose. État vide élégant. `brand_book_status` visible. | Oui |
| 7 | Calendrier business | `/ma-marque/business-calendar` — 4 sections, Server Actions | ✓ Implémenté. CRUD récurrents, lancements, saisonnalité, industry events. `revalidatePath` après chaque action. | Oui |
| 8 | Génération brand book | `/ma-marque/onboarding` — 3 questions → Opus 4.7 → `brand_book_status = complete` | ✓ Implémenté. `BrandBookGeneration` avec skeleton pulse + phrases rotatives. `onboarding_answers` persisté. Redirect vers `/ma-marque/brand-book` à la fin. | Oui |
| 9 | Page Aujourd'hui | 3 zones (header date + eyebrow tenant, NextAction, CoachingCard/Generator) | ✓ Implémenté (commit `c8454fb`). Eyebrow affiche `tenantLabel` (nom du tenant via `tenants.name`). Date française. ⚠ Copy NextAction : "En toute tranquillité — tu avances à ton rythme." (à corriger Phase 3). | Oui |
| 10 | Coaching IA quotidien | `/api/ai/coaching` — Opus 4.7, idempotent `(brand_id, date)`, log crédits | ✓ Implémenté (commit `4922e61`). `CoachingGenerator` client avec skeleton pulsant + phrases. Table `daily_coaching`. Idempotence garantie par index unique. No-brand guard ajouté (fix v1.0.1). | Oui |
| 11 | Visibilité brand book + crédits | Badge "Adapté" sur coaching, `CreditsIndicator` dans header | ✓ Implémenté (commit `a173973`). `AdaptedBadge.tsx` réutilisable. ⚠ `CreditsIndicator` affiche "0 crédits ce mois" même si brand incomplète ou crédits nuls (à corriger Phase 3). | Oui |
| 12 | Calendrier semaine/mois | `/calendrier` — vue semaine/mois, posts par statut, events business | ✓ Implémenté (commit `50f1fa1`). Toggle semaine/mois. Navigation temporelle. Posts colorés par statut (⚠ hex hardcodés non tokenisés — bug P2 #201). | Oui |
| 13 | Suggestions calendrier | `SuggestionsPanel` — IA business-driven, Opus 4.7 | ✓ Implémenté (commit `5f44a19`). `/api/ai/business-suggest`. Contexte `findNearestBusinessEvent` fenêtre 14j. | Oui |
| 14 | NewPostModal + détail post | Modal création rapide + `/calendrier/[postId]` + deletePost | ✓ Implémenté (commit `84101f5`). Server Actions `createPost` / `deletePost`. `updatePostStatus`. | Oui |
| 15 | Layout Post Creator | `/post-creator/[postId]` double colonne — ContextColumn + PreviewIOS | ✓ Implémenté (commit `ef76640`). `/post-creator` redirige vers `/calendrier`. Responsive : preview empilée mobile. | Oui |
| 16 | Anecdote live | Route `/api/ai/post-generation` — 6 étapes Opus 4.7, web_search étape 1 | ✓ Implémenté (commit `16454b6`). ⚠ Bug P1 ouvert : 502 si `web_search_20250305` désactivé sur le compte Anthropic. Fallback non implémenté. | Oui |
| 17 | Anecdote custom | 6 étapes sans web_search, textarea saisie libre | ✓ Implémenté (commit `d8267b2`). `AnecdoteCustom.tsx` complet. `userInput` propagé dans `workingDraft.actualite`. | Oui |
| 18 | Brief externe | Sonnet 4.6, markdown structuré, copier presse-papier | ✓ Implémenté (commit `1071fd5`). `BriefExterne.tsx`. UX plus rugueuse que Anecdote (pas de steps). Copier fonctionnel. | Oui |
| 19 | Module Programmer | Toggle Édition/Programmer, datetime-local J+1 9h00, `schedulePost` | ✓ Implémenté (commit `9c8eecd`). Onglets Télécharger / Multi-canal supprimés lors de l'audit Apple (Sprint 28). Toggle visible si `status === 'ready'` ou si draft a hook ou brief. | Oui |
| 20 | Conseiller refonte | Deux colonnes, Opus 4.7, persistance conversations | ✓ Implémenté (commit `3516be3`). Liste conversations + chat SSE. ⚠ Pas d'état no-brand : le chat charge sans contexte si brand absente (à corriger Phase 3). | Oui |
| 21 | Suggestions contextuelles | `ContextualSuggestion` dismissible — état `brand_book_status` + posts 7j | ✓ Implémenté (commit `50470df`). Deux conditions : brand incomplète OU aucun post cette semaine. Dismiss via localStorage. | Oui |
| 22 | Interface admin | `/admin/tenants` — CRUD, triple gate sécurité | ✓ Implémenté (commits `566901e`, `1eda40f`). Triple gate : proxy + layout admin + `requireAdmin()`. 4 onglets config. ⚠ Bug P1 ouvert : erreur Supabase brute remontée si email déjà existant. | Oui |
| 23 | Seeds Angelina | Données pilote Angelina Raynard — brand book + calendrier business | ✓ Implémenté (commit `f825190`). Script `scripts/configure-tenant.ts`. Recherche déontologique documentée. | Oui |
| 24 | Seeds Tous en Tête | Données pilote Tous en Tête | ✓ Implémenté (commit `1e5464a`). | Oui |
| 25 | Seeds Le Comptoir Général | Données pilote Le Comptoir Général | ✓ Implémenté (commit `e5b3326`). ⚠ Ratio contraste accent/fond estimé 3.8:1 (sous WCAG AA — bug P2 #205). | Oui |
| 26 | Liquid Glass | Design system — tokens + classes + accessibilité (z1/z2/z3, bar, control) | ⚠ Partiel (commit `69f25e0`). CSS `styles/liquid-glass.css` installé, importé dans `globals.css`. Chrome migré : Header, Sidebar, BottomNav en `.glass-bar`. **14 composants métier non migrés** (CoachingCard, CoachingGenerator, CalendarView, NewPostModal, ConseillerChat, PostCreator*, MaMarque*) — encore sur `backgroundColor: 'var(--color-surface)'`. | Oui (partiel) |
| 27 | Bugs P0/P1/P2 + QA | Fix P0 bloquants + audit 8 flux | ✓ P0 corrigés : page racine placeholder, metadata HTML, fichier mort `tenant-context.ts`. P1 ouverts (3 : web_search, erreur admin, SSE Vercel). P2 backlog (5). | Oui |
| 28 | Apple Grade Audit | Audit 8 piliers Apple — 61/80 + 2 commits correctifs | ✓ Corrections appliquées (commits `e7ad46b`, `c6c2846`) : Audience→Public, #9B2828→`var(--color-error)`, pages placeholder supprimées, onglets Programmer retirés. Score 61/80. Build cassé par guillemets typographiques + `pathname` dupliqué → retaggé v1.0.1 (commit `9c1dc56`). | Oui (tag v1.0.1) |
| 29 | Réconciliation prod/docs | Inventaire + écarts + 7 corrections ciblées | Phase 1 (ce fichier) en cours. | Non |

---

## Synthèse — Écarts entre doc et code

### Ce qui est conforme

- Architecture multi-tenant RLS : conforme.
- Theming par tenant (`buildThemeVars`, CSS vars) : conforme. Vert forêt `#1F4937` par défaut.
- Liquid Glass sur le chrome (Header, Sidebar, BottomNav) : conforme.
- Toutes les routes IA (coaching, post-generation, business-suggest, brief, chat) : conformes.
- Onboarding brand book 3 questions → Opus 4.7 : conforme.
- Flows Post Creator (Anecdote live, custom, Brief externe, Programmer) : conformes.
- Interface admin triple-gate : conforme.
- Seeds 3 tenants pilotes : conformes.

### Écarts réels identifiés (à corriger Phase 3)

| Écart | Fichier(s) concerné(s) | Priorité |
|---|---|---|
| Liquid Glass partiel — 14 composants métier sur `backgroundColor: 'var(--color-surface)'` | `components/aujourdhui/*`, `components/calendar/*`, `components/conseiller/*`, `components/post-creator/*` | P2 (cosmétique) |
| `CreditsIndicator` visible même à 0 crédits et sans brand complète | `components/layout/CreditsIndicator.tsx`, `app/(app)/layout.tsx` | P1 |
| Eyebrow `{tenantLabel}` sur Aujourd'hui (nom tenant répété, info redondante) | `app/(app)/aujourdhui/page.tsx` ligne 112 | P1 |
| Eyebrow "Ma marque" hardcodé sur Ma marque (doublon sidebar) | `app/(app)/ma-marque/page.tsx` ligne 46 | P1 |
| Copy NextAction : "En toute tranquillité — tu avances à ton rythme." constate un manque | `components/aujourdhui/NextAction.tsx` ligne 46 | P1 |
| Pas de composant `EmptyStateBrand` unifié — chaque page gère son propre état no-brand | Absent de `components/ui/` | P1 |
| Conseiller sans état no-brand honnête — charge le chat sans contexte si brand absente | `app/(app)/conseiller/page.tsx`, `components/conseiller/ConseillerLayout.tsx` | P1 |

### Bugs P1 non corrigés (Sprint 27, hors périmètre Phase 3)

- **#101** — Anecdote live 502 si `web_search_20250305` désactivé.
- **#102** — Erreur Supabase brute sur `inviteUserByEmail` (admin).
- **#103** — Streaming SSE Conseiller Vercel timeout (runtime non edge).
