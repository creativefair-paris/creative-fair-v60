# V2 — Backlog post-V1

Cet inventaire consolide les chantiers identifiés pendant le batch
sprints 9-29. Chaque entrée est triée par criticité et par effort
estimé.

## Critiques V2 (à traiter en priorité)

### Fiabilité IA
- **Fallback web_search Anecdote live** — si l'outil n'est pas
  disponible, basculer automatiquement vers une saisie manuelle
  d'actualité (#101).
- **Streaming SSE robuste** — `runtime='edge'` ou maxDuration adapté
  selon plan Vercel, monitoring du taux d'interruption (#103).
- **Gestion des quotas crédits** — alertes 80% / 95% mensuels, page
  /mon-compte avec historique mensuel (#206).

### Polish admin
- **Erreurs Supabase humanisées** — mapping technique → message
  utilisable (#102).
- **Suppression tenant** — server action + UX double confirmation
  + cascade RLS sécurisée (#204).
- **Logs admin applicatifs** — qui a fait quoi sur quel tenant.

### Accessibilité
- **Contraste Comptoir Général** — ajustement teinte ou règle d'usage
  (#205).
- **Pages d'erreur** — `app/not-found.tsx`, `app/error.tsx` (#203).

## Évolutions design

### Migration Liquid Glass complète
14 composants des sprints 9-21 utilisent encore les surfaces opaques
(#202) :
- aujourdhui/* (CoachingCard, CoachingGenerator)
- calendar/* (CalendarView, NewPostModal, SuggestionsPanel)
- conseiller/ConseillerChat
- post-creator/* (Layout, AnecdoteLive, AnecdoteCustom, BriefExterne,
  ContextColumn, Programmer)
- ma-marque/OnboardingFlow
- pages app/(app)/{calendrier, ma-marque, ma-marque/brand-book,
  ma-marque/business-calendar}.

### Animations choreographiées
Framer Motion sur Post Creator (transitions entre étapes), ConseillerChat
(entrée des messages), modals.

### Mode sombre
Le système Liquid Glass supporte déjà `prefers-color-scheme: dark` au
niveau des tints. Reste à calibrer chaque palette tenant pour fournir
un dark theme propre.

## Évolutions produit

### Post Creator — modules à venir
- **Produits** — créer un post à partir d'un produit (e-commerce).
- **Événements** — créer un post à partir d'un événement business.
- **Ads** — création de visuels publicitaires.
- **Custom** — éditeur libre.

### Multi-canal
La V1 ne publie qu'Instagram. À ajouter :
- LinkedIn (post + carrousel)
- TikTok (script + capsule)
- Facebook (cross-post Instagram)
- YouTube Shorts

### Téléchargement de visuels
Module Programmer onglet Télécharger actuellement « Disponible
bientôt ». Implémenter export ZIP des slides + caption.

### Programmation native
Connexion Meta Graph API + LinkedIn API pour publication directe sans
copy-paste manuel.

### Onboarding tenant guidé
Aujourd'hui, l'admin Creative Fair configure tout. V2 : flux
self-serve où le client B2C remplit son brand book seul, paye, et
accède à son tenant.

### Médiathèque tenant
Table `uploads` existe mais peu exploitée. Construire une
médiathèque par tenant avec tags, recherche, réutilisation cross-post.

## Évolutions IA

### Modèles Haiku 4.5 pour micro-tâches
Coaching, suggestions courtes, classification → migrer vers Haiku 4.5
(plus rapide, moins cher) en gardant Opus 4.7 pour les tâches
créatives.

### Cache hits monitoring
Les `cache_control: ephemeral` posent un cache de 5 minutes. Mesurer
le taux de hit dans les logs Anthropic et optimiser la structure
système pour maximiser la réutilisation.

### Voix par tenant en pré-warming
Pré-charger le contexte tenant + brand book dans un cache long si on
détecte une session active.

### Évaluation qualité
Mettre en place un harnais d'évaluation IA (golden dataset par
tenant) pour détecter régressions de voix après chaque changement de
prompt.

## Évolutions techniques

### Tests
Aucun test automatisé en V1. Cibler V2 :
- Tests unitaires sur helpers (`lib/ai/credits`, `lib/posts/actions`).
- Tests intégration server actions admin.
- Tests E2E Playwright sur les 4 flux principaux.

### Observabilité
- Sentry ou équivalent pour erreurs runtime.
- Métriques business : posts créés / programmés / publiés par tenant.

### Skills SACRED enrichis
Documenter dans skills/ ce qui est aujourd'hui dans le code (#201).

### Migration de pages héritées
Pages des sprints 1-8 (login, mon-compte, mon-programme, ma-marque
onboarding) gagneraient à être revues sous le prisme Liquid Glass et
audit visuel.
