# Apple Grade Audit — Phase 1 · Inventaire

Date : 2026-05-06. Auditeur : Lead Senior Product Designer (Cupertino).

## Périmètre audité

### `app/` — pages
- **(app)** : `aujourdhui/`, `calendrier/{,[postId]}`, `conseiller/`, `ma-marque/{,brand-book,parametres,business-calendar,onboarding}`, `mon-compte/`, `mon-programme/`, `post-creator/{,[postId]}`, `layout.tsx`
- **(admin)** : `tenants/{,new,[slug]}`, `layout.tsx`
- **(auth)** : `login/{,actions.ts}`, `signup/`, `logout/`
- **api/ai** : `coaching`, `business-suggest`, `post-generation`, `brief`, `chat`, `brand-book`, `test`
- **racine** : `layout.tsx`, `page.tsx`, `auth/callback/route.ts`

### `components/`
- **layout** : `Header`, `Sidebar`, `BottomNav`, `CreditsIndicator`
- **aujourdhui** : `CoachingCard`, `CoachingGenerator`, `NextAction`
- **calendar** : `CalendarView`, `CalendarPostCard`, `SuggestionsPanel`, `NewPostModal`, `DeletePostButton`
- **post-creator** : `PostCreatorLayout`, `ContextColumn`, `PreviewIOS`, `AnecdoteLive`, `AnecdoteCustom`, `BriefExterne`, `Programmer`
- **conseiller** : `ConseillerLayout`, `ConseillerChat`, `ConversationsList`
- **ma-marque** : `OnboardingFlow`, `BrandBookGeneration`
- **ui** : `AdaptedBadge`, `ContextualSuggestion`

### `lib/`, `styles/`
- `lib/{ai,auth,calendar,posts,supabase,theme,utils.ts}`
- `styles/liquid-glass.css`

## Constats critiques (à fixer)

### Pilier 6 · Polish — placeholders visibles
- `app/(app)/mon-programme/page.tsx` : « Page Mon Programme (placeholder) » — orphelin (aucun lien entrant côté UI)
- `app/(app)/mon-compte/page.tsx` : « Page Mon Compte (placeholder) » — **lié depuis Header**
- `app/(auth)/signup/page.tsx` : « Page Signup (placeholder) » — orphelin (magic link only)
- `app/(app)/ma-marque/parametres/page.tsx` : « Bientôt disponible. » — **lié depuis Ma marque**
- `components/post-creator/Programmer.tsx` : onglets « Télécharger » et « Multi-canal » → « Disponible bientôt. »

### Pilier 4 · Clarity — vocabulaire
- `app/(app)/ma-marque/brand-book/page.tsx` : titre de section « Audience » + « Aspirational » (anglicisme)
- `components/ma-marque/OnboardingFlow.tsx` : question « Décris ton audience »

### Pilier 1 · Craftsmanship — couleurs hardcodées
- `#9B2828` (rouge erreur) répété dans 4 fichiers : `Programmer.tsx:227`, `AnecdoteLive.tsx:140`, `AnecdoteCustom.tsx:151`, `DeletePostButton.tsx:53` → doit passer par `var(--color-error)`
- Admin (#13171B / #E8E6E1 / etc.) : autorisé par design system, OK.
- `PreviewIOS.tsx` : couleurs Instagram authentiques, OK (mockup natif).

### Pilier 7 · Native Synergy — animations
- `CoachingGenerator.tsx:89` : `duration-700` (hors fourchette 160-420ms du design system)

### Pilier 4 · Voice
- `proxy.ts` : `/mon-programme` listée comme route protégée → orpheline, à supprimer.

## Points validés

- Navigation : 4 destinations cohérentes (Aujourd'hui, Calendrier, Ma marque, Conseiller) sur Sidebar ET BottomNav.
- Tokens CSS : background, text, accent, border tous variabilisés.
- Liquid Glass appliqué : `glass-bar` sur Header/Sidebar/BottomNav, `glass-z3` sur popovers.
- Empty states présents : `aujourdhui` (CoachingGenerator + NextAction), `calendrier` (no-upcoming), `brand-book` (EmptyState dédié).
- One next action : chaque page user a 1 CTA primaire visible.
