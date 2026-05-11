# Patch Sprint 36.B.1 — Suppression Timeline + CTA

- **SHA HEAD** : `4540c9d3caa5034333ef1c8a8e6ccfe950cf0e55`
- **Branche** : `sprint-36-b-1` (amendée — push après ce rapport)
- **Durée** : ~25 min

## Suppressions

- Composant `components/programme/PostCard.tsx` (supprimé, plus aucune référence)
- Segment `'timeline'` retiré de `CalendarToggle.tsx` → 2 segments (Semaine · Mois)
- Type `ViewMode` réduit à `'semaine' | 'mois'`
- Bloc conditionnel `view === 'timeline'` retiré de `Timeline.tsx` (cards verticales + mapping `PostCard`)
- CTA `Affine ta marque avec Creative Fair →` retiré (doublon avec la chip "Enrichir ma marque" en haut)
- Import `PostCard` retiré de `Timeline.tsx`
- Sélecteurs CSS morts retirés :
  - `styles/liquid-glass.css` : `.programme-wrapper.is-welcome .post-card` (et `:nth-of-type(1..3)`), `.programme-wrapper.is-welcome .cta-affiner`, et leur override `prefers-reduced-motion`
  - `app/globals.css` : override `.cfs-timeline-root.view-semaine .cfs-mini-post { animation: none }` (devenu inutile)

## État final UI `/programme`

- Hero (intro + arc narratif + 3 chips piliers) — **affiché en permanence** au-dessus du toggle
- Toggle 2 segments : **Semaine · Mois**
- **Vue Semaine par défaut** (7 colonnes lundi → dimanche)
- `PostDetailSheet` au tap d'une `MiniPostCard`
- **Plus de CTA bas**
- Chips "Voir un post" et "Enrichir ma marque" toujours présentes au-dessus de la Timeline (haut de page)

## Animation welcome

Désormais limitée au hero uniquement :
- `.intro-subtle` (delay 200ms)
- `.arc-narratif` (delay 500ms)
- `.piliers-chips` (delay 700ms)

Plus de cascade sur `.post-card` ni `.cta-affiner` (sélecteurs morts retirés).

## Gate — 8/8 verts

| # | Check | Statut |
|---|---|---|
| V1 | `npx tsc --noEmit` | ✅ exit 0 |
| V2 | `npm run lint` | ✅ 0 errors (11 warnings legacy, pré-existants) |
| V3 | `npm run build` | ✅ exit 0 |
| V4 | `PostCard.tsx` absent | ✅ |
| V5 | Aucune référence à `\bPostCard\b` (exact, hors `MiniPostCard`/`CalendarPostCard`) | ✅ |
| V6 | `'timeline'` absent de `CalendarToggle.tsx` et `Timeline.tsx` | ✅ |
| V7 | `Affine ta marque` absent du codebase | ✅ |
| V8 | Routes intactes (dev server) | ✅ `/programme`/ `/ma-marque`/ `/outils` → 307 |

## Tests visuels Lead

- [ ] `/programme` : titre **Mon Programme** + 2 chips actions + toggle **2 segments**
- [ ] **Vue Semaine par défaut**
- [ ] Pas de cards verticales sous la vue calendrier
- [ ] Pas de bouton **Affine ta marque** en bas
- [ ] Click mini-card → Sheet détail (inchangé)

## Note V5 — interprétation de la règle

La règle gate V5 littérale (`grep -rn "PostCard"`) aurait matché `MiniPostCard` et `CalendarPostCard`, ce qui était évidemment hors intention. Interprétation appliquée : **mot exact `\bPostCard\b`**, ce qui isole l'ancien composant. Résultat : 0 référence — `MiniPostCard` (Chantier D) et `CalendarPostCard` (legacy, `CalendarView.tsx`) conservés intacts.
