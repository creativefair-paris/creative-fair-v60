# Apple Grade Audit — Rapport final

Date : 2026-05-06.
Auditeur : Lead Senior Product Designer (Cupertino Task Force).
Périmètre : Creative Fair V1 (`v1.0.0`), 4 destinations utilisateur,
3 formats Post Creator, interface admin, 3 tenants pilotes.

---

## Score par pilier (X/10) — total /80

| # | Pilier | Score | Verdict |
|---|---|---|---|
| 1 | Human Interface & Craftsmanship | **8/10** | Validé après tokenisation des hex |
| 2 | Frictionless Ecosystem & State Management | **8/10** | Validé — flux fluides, zéro charge cognitive imposée |
| 3 | Time-to-Wow & Delight | **7/10** | Validé — coaching auto + generation visible < 2 min, mais effet de surprise faible |
| 4 | Aspirational Storytelling & Clarity | **9/10** | Validé après remplacement Audience → Public |
| 5 | Transparent Value Exchange | **6/10** | Recalé partiel — V1 facturation manuelle, pas de page tarifs claire |
| 6 | Uncompromising Polish | **9/10** | Validé après suppression des 4 placeholders et 2 onglets « Bientôt » |
| 7 | Native Synergy | **7/10** | Validé — Liquid Glass + reduced-motion + reduced-transparency, mais animations encore minimalistes |
| 8 | Out of the Box Experience | **7/10** | Validé — onboarding 3 questions + génération brand book auto |

**Total : 61/80 — Apple-grade pour une V1 pilote.**

---

## Pilier 1 — Human Interface & Craftsmanship · 8/10

### Validé
- Tokens CSS exhaustifs (`background`, `surface`, `text`, `text-muted`, `border`,
  `accent`, `accent-fg`, `error`).
- Système Liquid Glass appliqué au chrome (Header, Sidebar, BottomNav,
  popovers).
- Polices typées via `--font-display` / `--font-body` partout.
- Iconographie homogène (lucide-react), tailles 16/18/20.

### Recalé partiel
- `PreviewIOS.tsx` garde des hex Instagram (#FFFFFF, #EEEEEE, #262626,
  #8E8E8E, #F2F2F2, #385898) — **acceptable** car authentique au mockup
  natif Instagram, mais à isoler dans un fichier dédié si plus large.
- `CalendarPostCard.tsx` : trois hex (#E07B00, #2F7A45, rgba) pour les
  status. **Recalé léger** — devraient être `--color-status-*` en V2.

### Corrigé pendant l'audit
- 4 occurrences de `#9B2828` → `var(--color-error)` (Programmer,
  AnecdoteLive, AnecdoteCustom, DeletePostButton).

---

## Pilier 2 — Frictionless Ecosystem & State Management · 8/10

### Validé
- Server Components par défaut, RLS Supabase active partout.
- Optimistic UI sur les actions critiques (schedule, delete) via
  `useTransition`.
- Cache Anthropic ephemeral sur tous les system prompts → latence
  réduite tour 2.
- Aucune charge cognitive imposée sur l'écran d'accueil — date du jour,
  coaching auto, action suggérée.

### Recalé léger
- Pas de skeleton sur les listes de calendrier (post grid) — repose
  uniquement sur SSR qui est rapide mais pas instantané sur 4G.

---

## Pilier 3 — Time-to-Wow & Delight · 7/10

### Validé
- Onboarding brand book : 3 questions → génération automatique
  (`BrandBookGeneration` avec animation pulse).
- Première utilisation post-creator : moins de 2 minutes pour produire
  une publication via Anecdote live.

### Recalé partiel
- Pas de moment « Wow » signature à l'arrivée. Le coaching du jour est
  utile, mais ne déclenche pas le « Comment a-t-il deviné ? ».
- Aucune animation choreographiée à la génération du brand book — juste
  un pulse skeleton.
- Pas de confetti, ni de transition entre étapes Post Creator. V2 prévue
  Framer Motion (cf. roadmap).

---

## Pilier 4 — Aspirational Storytelling & Clarity · 9/10

### Validé après correction
- Vocabulaire 100% français côté utilisateur.
- Aucun emoji, aucun point d'exclamation.
- Sentence case respectée partout.
- Tutoiement chaleureux et constant (« Tu », « Ton »).

### Corrigé
- « Audience » → « Public » (brand book + onboarding)
- « Aspirational » → « Aspiration »
- Programmer.tsx : copie remplacée par l'essentiel (« Choisis quand cette
  publication doit partir »).

### Recalé léger
- « Brand book » est conservé tel quel — anglicisme, mais devenu courant
  dans l'écosystème français. Décision défendable, à challenger en V2.

---

## Pilier 5 — Transparent Value Exchange · 6/10

### Validé
- `CreditsIndicator` dans le Header, toujours visible, montre la
  consommation du mois.
- Page `/mon-compte` (réécrite Phase 3) ventile les crédits par feature.
- Aucun paywall trompeur, aucune feature cachée derrière un upgrade.

### Recalé
- **Pas de page tarifs / billing** — V1 fonctionne en facturation
  manuelle sans afficher de prix. L'utilisateur consomme sans visibilité
  sur le coût euro réel. C'est le principal angle mort de la V1.
- Pas d'alerte « 80% des crédits du mois consommés » (cf. roadmap V2 #206).
- Pas de comparatif valeur reçue / coût.

→ **À corriger en V2 (Q1)** — `docs/roadmap-v2.md` le prévoit.

---

## Pilier 6 — Uncompromising Polish · 9/10

### Validé après nettoyage
- Plus aucun « Bientôt disponible » visible utilisateur.
- Plus aucune page placeholder (suppression `/mon-programme`, `/signup`,
  `/ma-marque/parametres`).
- Onglets non implémentés retirés de `Programmer.tsx`.
- Routes orphelines retirées de `proxy.ts`.

### Recalé léger
- Le `BriefExterne` (3e format Post Creator) fonctionne mais l'UX est
  plus rugueuse que `AnecdoteLive` / `AnecdoteCustom` (pas de génération
  étape par étape). Polissage progressif attendu.

---

## Pilier 7 — Native Synergy · 7/10

### Validé
- `prefers-reduced-motion` + `prefers-reduced-transparency` respectés
  dans `liquid-glass.css`.
- `@supports not backdrop-filter` → fallback solide.
- BottomNav mobile + Sidebar desktop, transition fluide responsive.
- Form input dates : `<input type="datetime-local">` natif.

### Corrigé
- `duration-700` (700ms) → `duration-[420ms]` (cohérent avec
  `--duration-slow` du système).

### Recalé partiel
- Pas de haptic feedback sur les actions critiques (pas applicable web,
  mais à anticiper en PWA).
- `animate-pulse` Tailwind utilisé en skeleton (1.5s easing standard) —
  acceptable pour les loaders, mais pas du même langage que
  `--ease-out-soft` du design system.

---

## Pilier 8 — Out of the Box Experience · 7/10

### Validé
- Premier login → redirection automatique `/aujourdhui` via `app/page.tsx`.
- Si brand book vide → suggestion contextuelle vers Onboarding.
- Onboarding 3 questions → brand book généré automatiquement → page
  brand-book remplie en 1 clic.

### Recalé partiel
- Pas de tour guidé (coachmark) à la première visite.
- Pas de message de bienvenue personnalisé selon le tenant (chaque tenant
  a son thème mais l'expérience est identique).
- Pas de témoignage social / preuve d'usage à l'onboarding.

---

## Vérification des 6 promesses V1

| # | Promesse | Statut |
|---|---|---|
| 1 | 4 destinations utilisateur fonctionnelles | ✓ Aujourd'hui, Calendrier, Ma marque, Conseiller |
| 2 | 3 formats Post Creator | ✓ Anecdote live, Anecdote custom, Brief externe |
| 3 | Multi-tenant 3 pilotes | ✓ Angelina, Tous en Tête, Le Comptoir Général |
| 4 | Interface admin avec triple-gate | ✓ proxy + layout + requireAdmin |
| 5 | Design Liquid Glass | ✓ tokens + 3 niveaux + accessibilité |
| 6 | Voice sheet sacrée | ✓ `lib/ai/prompts/system.ts` source de vérité |

---

## Recommandations prioritaires V2

Par ordre de gain perçu :

1. **Page tarifs / quotas crédits** (Pilier 5) — combler le seul vrai
   angle mort de la V1.
2. **Animations choreographiées** Framer Motion (Pilier 3, 7) — sur
   Post Creator step transitions et BrandBookGeneration.
3. **Tour guidé première visite** (Pilier 8) — coachmarks 3 étapes max.
4. **Tokens status calendrier** (Pilier 1) — éliminer les 3 derniers hex
   hardcodés non-admin.
5. **Polissage `BriefExterne`** (Pilier 6) — aligner l'UX sur les deux
   autres formats.

---

## Verdict final

**Creative Fair V1 est Apple-grade pour un produit pilote.** 61/80 sur
les 8 piliers, après 2 commits correctifs ciblés (copywriting + empty
states + animations + hex). Le seul recalé majeur est Pilier 5 (Value
Exchange) — angle mort assumé de la V1, traité prioritairement en V2.

L'expérience est polie, fluide, française, sans jargon et sans bruit.
La voix de marque est tenue. Le chrome (Header, Sidebar, BottomNav)
respire le Liquid Glass. Les empty states sont conçus, pas cachés.

**Prêt pour les 3 tenants pilotes.**
