# Roadmap V2 — Creative Fair

Document de cadrage post-V1. Trois trimestres approximatifs.

## Q1 — Fiabilité et autonomie tenant

Objectif : transformer l'expérience pilote en service production-grade.

- **Fallback web_search** sur Anecdote live → bascule auto Anecdote
  custom si l'outil indisponible (#101).
- **Streaming SSE robuste** sur Conseiller → runtime/edge configuré,
  monitoring du taux d'interruption (#103).
- **Quotas et alertes crédits** → seuils 80% / 95% par tenant, page
  /mon-compte avec historique mensuel (#206).
- **Erreurs Supabase humanisées** côté admin (#102).
- **Suppression de tenant** sécurisée (#204).
- **Pages d'erreur** custom (#203).
- **Sentry runtime** + dashboards par tenant.

## Q2 — Multi-canal et publication automatique

Objectif : Creative Fair publie pour le client, pas seulement à sa
place.

- **Connecteur Meta Graph API** → publication directe Instagram /
  Facebook depuis le module Programmer.
- **LinkedIn Post / Carrousel** → adaptateur de format depuis un post
  Instagram.
- **TikTok script + capsule** → génération de script court à partir
  d'un post.
- **Téléchargement ZIP** → export visuels + caption (V1 placeholder).
- **Calendrier consolidé multi-canal** → vue unique des publications
  prévues sur tous canaux activés.

## Q3 — Self-serve et croissance

Objectif : permettre à un tenant B2C de s'inscrire et payer seul.

- **Onboarding self-serve** → flux complet sans intervention admin
  Creative Fair (signup → brand book → paiement → tenant créé).
- **Stripe billing** → tarification mensuelle par tenant + add-ons.
- **Médiathèque tenant** → table `uploads` exploitée, tags, recherche,
  réutilisation.
- **Onboarding par étapes guidées** côté UI Ma marque.
- **Modules Post Creator** → Produits, Événements, Ads, Custom (les 4
  formats supplémentaires actuellement en stub).

## Chantier transverse — Design et accessibilité

- **Migration Liquid Glass complète** sur les 14 composants restants
  (#202).
- **Mode sombre** par tenant avec calibration automatique des palettes.
- **Audit WCAG AA** systématique sur chaque thème, ajustement contraste
  Comptoir Général (#205).
- **Animations choreographiées** sur Post Creator et ConseillerChat
  (Framer Motion).

## Chantier transverse — IA

- **Modèles Haiku 4.5** pour micro-tâches (coaching court, suggestions,
  classifications) → réduire coût et latence.
- **Évaluation qualité** → harnais d'évaluation par tenant, golden
  dataset pour détecter les régressions de voix.
- **Cache hits monitoring** → mesurer le taux de réutilisation
  ephemeral, optimiser la structure du système prompt.

## Chantier transverse — Tests

- **Tests unitaires** helpers (`lib/ai/credits`, `lib/posts/actions`).
- **Tests intégration** server actions admin (créer / mettre à jour
  tenant).
- **Tests E2E Playwright** sur les 4 flux principaux (login, création
  post, programmation, conseiller).

## Hors périmètre V2

- Application mobile native (V3 envisagée, pas avant Q4 2027).
- Intégration moteurs de paiement hors Stripe.
- Support langues étrangères (V1 et V2 français uniquement).
