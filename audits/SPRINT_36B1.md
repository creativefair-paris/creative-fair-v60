# Sprint 36.B.1 — Patch orientation complet

**Branche** : `sprint-36-b-1`
**Périmètre** : Possessifs + BackButton + menu rond avatar + chips actions + boutons Modifier Ma Marque + vue calendrier Semaine/Mois
**Mode** : autonome, sans validation humaine intermédiaire
**Durée estimée** : 14–16 h

---

## Commits

```
118e907 fix(gate): today utilise vert forêt #1F4937 (pas la var pilier-1 qui est bleue)
5b44f74 feat(programme): vue calendrier Semaine/Mois + PostDetailSheet (Chantier D)
311948e feat(actions): 2 chips Mon Programme + Modifier par bloc Ma Marque + endpoint update
dad368b feat(nav): menu rond avatar (server fetch + client trigger) + bulle 280px + Sheet logout
ee2204e feat(nav): BackButton créé + possessifs + suppression toggle haut-droit
fb067bc chore(scripts): script de vérification colonnes brands (DB schema check)
```

---

## Chantier A — Possessifs + BackButton + retrait toggle (commit `ee2204e`)

- Titres : **Mon Programme**, **Ma Marque**, **Mes Outils** (possessifs cohérents)
- Composant `BackButton` créé (`components/layout/BackButton.tsx`) — pas rendu sur les destinations racines (anti-pattern Apple)
- `ProgrammeOutilsToggle` retiré de la `NavigationBar` (top-right des 3 destinations racines), composant conservé pour usage futur
- `NavigationBar` accepte désormais un `trailing` optionnel (override)

## Chantier B — Menu rond avatar (commits `ee2204e` puis `dad368b`)

- `Avatar.tsx` (server-safe) : image OU initiale glass-thin
- `NavigationBar` devient **async server component** : fetch user + brand + prénom Supabase, fallback split email
- `UserMenuTrigger.tsx` (client) : bouton rond + bulle + Sheet logout
- `UserMenuBubble.tsx` : 280 px, 3 nav items (`/programme`, `/ma-marque`, `/outils`), toggle programme/outils contrôlé, Mon compte, Déconnexion (destructive)
- **Pas de `window.confirm`** : Sheet bottom avec 2 boutons (Annuler / Déconnexion)
- **Pas de lien `/conseiller`** : retiré du menu (décision actée)
- Pas de lien `/preferences` (route inexistante) : dette Sprint 36.B.2

## Chantier C — Chips + édition par bloc (commit `311948e`)

- `components/ui/ChipAction.tsx` : pill glass-thin réutilisable (`href` ou `onClick`)
- 2 chips sur `/programme` : « Voir un post » → ancre `#timeline-start`, « Enrichir ma marque » → `/ma-marque`
- `MaMarqueFields.tsx` (client) : 4 sections cliquables (Nom, Secteur, Voix, Singularité)
- `EditBlocSheet.tsx` : input / textarea + compteur + Annuler / Enregistrer
- **Mapping clé** : UI **« Voix »** ↔ colonne DB **`ton`** (acté)
- `app/api/brand/update/route.ts` : PATCH avec whitelist `{name, secteur, ton, singularite}`, `maxLength` validés (80/120/280/400), auth `createClient()` + RLS bypass `createAdmin()` post-auth
- **Piliers narratifs read-only** Sprint 36.B.1 (régénération différée)

## Chantier D — Vue calendrier Semaine / Mois (commit `5b44f74`)

- `lib/programme/colors.ts` : helper `colorForPilier` (source unique pour les 3 vues)
- `CalendarToggle.tsx` : **segmented control 3 segments** (Timeline / Semaine / Mois) — choix UX plus clair qu'un toggle binaire
- `MiniPostCard.tsx` : 2 variants
  - `semaine` : vertical, heure + titre 2 lignes + type
  - `mois` : compact horizontal, heure + titre ellipsis
- `VueSemaine.tsx` : 7 colonnes lundi → dimanche, jour today souligné en `#1F4937`
- `VueMois.tsx` : grille 5–6 lignes × 7 colonnes, +N si > 2 posts/jour
- `PostDetailSheet.tsx` : lecture seule — pilier, format, angle, date, heure
- `Timeline.tsx` refactor : **client component**, `useState<ViewMode>`, hero (`HeroSemaine`) conditionnel
- Animation welcome **retirée** des vues Semaine / Mois (override `animation: none` ciblé `.view-semaine`, `.view-mois`)

---

## Gate 12 vérifications

| # | Check | Statut |
|---|---|---|
| 1 | `npx tsc --noEmit` | ✅ exit 0 |
| 2 | `npm run lint` | ✅ 0 errors (11 warnings legacy : `CalendarView.tsx`, `_ctx`, `_inputs`, `_client`) |
| 3 | `npm run build` | ✅ exit 0 ; `/api/brand/update` enregistrée |
| 4 | Composants créés (14) | ✅ tous présents |
| 5 | Curl `/`, `/programme`, `/outils`, `/ma-marque` | ✅ 307 (redirect login, middleware OK) |
| 6 | Curl `/dev/split-brief` | ✅ 200 |
| 7 | Curl `PATCH /api/brand/update` sans session | ✅ 401 `{"error":"unauthorized"}` |
| 8 | Possessifs présents | ✅ Mon Programme / Ma Marque / Mes Outils |
| 9 | `ProgrammeOutilsToggle` retiré des pages | ✅ seul le fichier source survit |
| 10 | `/conseiller` absent du menu | ✅ |
| 11 | `window.confirm(` absent | ✅ (Sheet bottom à la place) |
| 12 | Vocabulaire interdit + #1F4937 + halos | ✅ aucun Pipeline/Tokens/Workflow/Radar dans le périmètre ; vert forêt présent ; 6 halos par page racine |

---

## Décisions seules (à valider Sprint 36.B.2)

1. **Toggle 3 segments** au lieu de toggle binaire pour l'UX calendrier — Timeline / Semaine / Mois sur un seul segmented control. Plus apple-grade qu'un état caché « calendrier vs liste ».
2. **Today highlight** utilise `#1F4937` en littéral (vert forêt brand), pas `var(--pilier-1)` qui pointe sur `#007AFF` (bleu = catégorie de contenu pilier #1). Distinction sémantique : pilier = contenu, today = repère temporel.
3. **`+N` overflow** en vue Mois : seuls 2 posts visibles par cellule, le reste compté en `+N` (cliquer ouvrirait une expansion — pas implémenté Sprint 36.B.1).
4. **`PostDetailSheet` strictement read-only** : pas de bouton Éditer / Supprimer cette release (différé Sprint 36.B.2).
5. **EditBlocSheet** : pattern `prevOpen` state au lieu de `useEffect + setState` (lint `react-hooks/set-state-in-effect`).

## Dettes Sprint 36.B.2

- `/preferences` route à créer (lien retiré du menu).
- Régénération piliers narratifs (édition différée).
- Expansion `+N` en vue Mois (modal ou page jour).
- Édition / suppression depuis `PostDetailSheet`.
- Animation welcome — comportement final à figer (actuellement bridée aux vues calendrier).

## Pré-vol — découverte critique

Script `scripts/check-brands-columns.mjs` (commit `fb067bc`) a révélé que la colonne brand s'appelle **`name`** (anglais) et non `nom` comme l'indiquait le prompt initial. **Toutes les références aval ont été corrigées** : `ALLOWED_FIELDS`, `FIELDS` constant dans `MaMarqueFields`, mapping initialValues. Sans ce pré-vol, perte estimée 1–2 h en debug post-build.
