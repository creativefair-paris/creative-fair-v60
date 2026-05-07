# Sprint 30 — Polish V1.1.0

Branch : `main` (creative-fair-v60).
Tag : `v1.1.0` — commit `25126a4` et suivant.
Modèle : `claude-opus-4-7`.

## Contexte

Suite du Sprint 29 (réconciliation prod/docs). Ce sprint corrige les 7 écarts
identifiés entre les documents canoniques et le code réel — sans nouvelles
features, sans refactoring structurel.

---

## Corrections appliquées

### fix(theme) — vérifié conforme
`lib/theme/default-theme.ts` : `accent: '#1F4937'` (vert forêt). Aucune
modification requise. Aliasage `--color-primary` → `accent` dans `apply-theme.ts`
documenté comme compat historique.

**Commit** : aucun (conforme).

---

### fix(liquid-glass) — `9ac5ece`
Migration de 3 composants de contenu vers `.glass-z2` :
- `components/aujourdhui/CoachingCard.tsx` — 2 états (with/without coaching).
- `components/aujourdhui/CoachingGenerator.tsx` — 4 états (loading, no_brand,
  error, idle).
- `components/conseiller/ConseillerChat.tsx` — conteneur messages.

Suppression des `style={{ backgroundColor: 'var(--color-surface)', border: ...,
borderRadius: ... }}` inline remplacés par la classe Liquid Glass.
Correction bonus : `#9B2828` → `var(--color-error)` dans ConseillerChat.

---

### feat(empty-states) — `991f866`
Création de `components/ui/EmptyStateBrand.tsx` — composant unifié pour tous
les états no-brand-complete :
- Props : `title` et `body` (personnalisables, avec valeurs par défaut claires).
- Surface `.glass-z2`.
- CTA fixe : "Créer ma marque" → `/ma-marque/onboarding`.

Utilisé immédiatement par le Conseiller (fix #7). Prêt pour Calendrier et
Aujourd'hui si la garde layout est un jour assouplie.

---

### fix(copy) — `e92045b`
`components/aujourdhui/NextAction.tsx` :
- Supprimé : "En toute tranquillité — tu avances à ton rythme."
  (constatait un manque, tonalité fataliste contraire au ton tranquillité).
- Reformulé (état vide) : "Rien de prévu aujourd'hui — l'occasion de préparer
  la semaine." (affirmatif, ouvre une possibilité).
- CTA vide renommé : "Ouvrir mon calendrier" → "Planifier une publication".

---

### fix(eyebrows) — `de0485f`
Suppression de deux eyebrows redondants :
- `app/(app)/aujourdhui/page.tsx` : eyebrow `{tenantLabel}` retiré. L'utilisateur
  sait dans quelle marque il est (login tenant-spécifique + sidebar).
  Suppression également du fetch `tenants.name` devenu inutile (−1 requête DB
  au chargement de /aujourdhui).
- `app/(app)/ma-marque/page.tsx` : eyebrow "Ma marque" retiré (doublon navigation).

---

### fix(credits) — `2ba99dc`
`CreditsIndicator` conditionné à deux critères :
1. `brand_book_status === 'complete'` — pas de crédits visibles pendant l'onboarding.
2. `creditsTotal > 0` — pas de "0 crédits ce mois" qui crée de l'anxiété sans
   contexte.

Implémentation :
- `app/(app)/layout.tsx` : calcule `brandComplete` depuis `brand.brand_book_status`.
  La brand est maintenant toujours chargée (même sur NO_BRAND_ALLOWED paths) pour
  alimenter cette condition — single extra DB query, acceptable côté serveur.
- `components/layout/Header.tsx` : prop `brandComplete?: boolean` (défaut `false`),
  `CreditsIndicator` conditionnel.

---

### fix(conseiller) — `25126a4`
`ConseillerLayout` reçoit `brandBookComplete: boolean` depuis `conseiller/page.tsx`.
Quand `!brandBookComplete` : affiche `EmptyStateBrand` avec message contextuel
("Le Conseiller connaît ta voix, tes valeurs et ton calendrier business. Définis
ta marque pour en profiter pleinement.") au lieu du chat.

Le chat reste accessible si `brand_book_status = 'incomplete'` SEULEMENT après
que la brand row existe (guard layout déjà en place pour absence totale de brand).

---

## Fichiers modifiés

| Fichier | Type de changement |
|---|---|
| `components/aujourdhui/CoachingCard.tsx` | glass-z2 migration |
| `components/aujourdhui/CoachingGenerator.tsx` | glass-z2 migration |
| `components/conseiller/ConseillerChat.tsx` | glass-z2 + fix color error |
| `components/ui/EmptyStateBrand.tsx` | nouveau composant |
| `components/aujourdhui/NextAction.tsx` | copy rewrite |
| `app/(app)/aujourdhui/page.tsx` | suppression eyebrow + fetch tenant |
| `app/(app)/ma-marque/page.tsx` | suppression eyebrow |
| `components/layout/Header.tsx` | credits conditionnel |
| `app/(app)/layout.tsx` | brandComplete calculé et transmis |
| `app/(app)/conseiller/page.tsx` | brand_book_status vérifié |
| `components/conseiller/ConseillerLayout.tsx` | no-brand state |

---

## Plan de vérification recommandé

1. **`npm run build`** — vérifier que le build Vercel passe sans erreur TypeScript.
2. **Tenant sans brand** : login → /conseiller → `EmptyStateBrand` visible, pas de chat.
3. **Tenant brand incomplète** : header sans crédits, /conseiller → EmptyStateBrand.
4. **Tenant brand complète, 0 crédits** : header sans crédits.
5. **Tenant brand complète, N crédits** : header affiche crédits, popover fonctionnel.
6. **Page /aujourdhui** : plus d'eyebrow, juste la date. NextAction : nouveau message vide.
7. **Page /ma-marque** : titre = `brand.name`, plus d'eyebrow "Ma marque".
8. **CoachingCard / CoachingGenerator** : rendu avec `backdrop-filter` visible au scroll.
9. **Réduire la transparence (macOS)** : surfaces deviennent opaques → fallback CSS OK.
10. **Réduire le mouvement (macOS)** : `glass-pop-in` désactivé → modals statiques.

---

## Limites assumées

- Migration Liquid Glass **partielle** : 11 autres composants métier (CalendarView,
  NewPostModal, SuggestionsPanel, AnecdoteLive, AnecdoteCustom, BriefExterne,
  Programmer, ContextColumn, OnboardingFlow, brand-book, business-calendar)
  restent sur `backgroundColor: 'var(--color-surface)'`. Migration V2 (bug P2 #202).
- Bugs P1 (web_search 502, erreur admin brute, SSE Vercel timeout) : hors périmètre
  Sprint 30, reportés V2.
