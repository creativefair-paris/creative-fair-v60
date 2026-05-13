# Sprint 36.H — Polish /aujourd-hui (9 findings) + report auto retards

Branche `sprint-36-h` (basée sur `sprint-36-g` HEAD `00f8847`, comme les
sprints sœurs 36.E et 36.G — main n'a pas encore reçu le merge).
9 commits atomiques (8 features + 1 audit). Build OK, tsc OK, lint OK
(11 warnings pré-existants, 0 erreur). Pas de push, pas de tag.

## Récapitulatif des 9 commits

| # | Commit | Findings traités |
|---|---|---|
| 1 | `4a4e696` | Migration 013 — posts.reported_from + index partial |
| 2 | `963fc1f` | catchUpOverduePosts server action + wiring load-data |
| 3 | `af73d29` | Header refondu (H1 + sous-titre + Bloc A titre) — Findings 1+2 |
| 4 | `e1ce63c` | Liquid Glass 4 cartes + /mon-programme → /programme — Findings 3+5 |
| 5 | `6e397f1` | Pastille redesign + menu contextuel supprimé + label reporté — Findings 4+6+7 affichage |
| 6 | `d881700` | CTA spécifique au signal — Finding 8 |
| 7 | `ac1df54` | Animations stagger + hover signatures — Findings 9b–d |
| 8 | `6e8157c` | Audit usage `#007AFF` parcimonieux — Finding 9e |
| 9 | (ce commit) | Audits decisions.md + abort-log.md |

## 1. Liquid Glass appliqué

3 classes canoniques existaient dans `styles/liquid-glass.css` (`glass-thin`,
`glass-regular`, `glass-thick`) avec @supports fallback et media
prefers-reduced-transparency. **Aucune nouvelle classe créée** — A1 abort
non déclenché.

| Bloc | Classe | Niveau Spec |
|---|---|---|
| Bloc 1 Prochaine action | `glass-regular` | Niveau 2 (dominance) |
| Bloc 2 État Programme | `glass-thin` | Niveau 1 |
| Bloc 3 État Ma Marque | `glass-thin` | Niveau 1 |
| Bloc C Suggéré pour toi | `glass-thin` | Niveau 1 |
| Bouton Commencer | (aucun) | Plein noir #1C1C1E, conforme spec |

## 2. Pastilles vs Things 3

Le Sprint 36.G utilisait des cercles 20×20 px avec contour qui
ressemblaient à des cases à cocher non-cochées (suggestion d'action
erronée — la pastille indique un STATUT, pas une action).

**Redesign Sprint 36.H** :
- États `todo`/`ready`/`alert` : point plein 8×8 px, couleurs iOS
  (gris #C7C7CC / bleu #007AFF / orange #FF9500)
- État `published` : check ✓ inline 14×14 px en gris sombre, la ligne
  entière reçoit `opacity: 0.5` + `text-decoration: line-through`
  côté TaskRow
- Pastille position : à gauche du titre, gap 12 px géré par TaskRow
  (déjà en place Sprint 36.G)

Le composant `StateCircle` est conservé sous le même nom (rename
"StatusPill" jugé non-nécessaire — le sémantique d'état est déjà claire
via le `state` prop).

## 3. Simplification menu contextuel

Sprint 36.G livrait un bouton "..." par TaskRow avec 6 actions
(Reporter ±1/2/3, Avancer ±1/2/3) + "Demander au Conseiller".

**Sprint 36.H** : suppression intégrale du menu, remplacé par un lien
latent **"Demander →"** à droite de chaque ligne. Opacité 0.4 au repos,
0.8 au hover de la ligne, 0.7 forcée sur mobile (touch — pas de
hover natif).

**Composants supprimés** (zero usage post-refacto) :
- `components/ui/context-menu/ContextMenu.tsx`
- `components/ui/context-menu/use-long-press.ts`
- `app/_actions/shift-post-date.ts`

Le dossier `components/ui/context-menu/` est retiré.

Justification : la modification de date d'un post passe désormais par
le Conseiller (cf. doctrine "modifications programme via Conseiller
au-delà de ±3 jours" — V1 simplifie à "tout passe par Conseiller").

## 4. Report automatique des retards (Finding 7)

### Migration 013

```sql
alter table posts add column if not exists reported_from timestamptz;

create index if not exists idx_posts_catchup
  on posts(tenant_id, date_prevue, heure_prevue)
  where reported_from is null;
```

Index partiel : seules les rows `reported_from IS NULL` sont scannées
lors du catch-up. Cohérent avec doctrine d'idempotence (un post reporté
ne re-rentre plus dans la boucle).

### catchUpOverduePosts server action

Appelée par `loadAujourdhuiData()` AVANT le SELECT des posts à afficher :

```ts
await catchUpOverduePosts()
// puis SELECT posts ...
```

Algorithme :
1. SELECT `tenant_id = X AND statut = 'planifie' AND reported_from IS NULL`
2. Filtre côté JS sur `(date_prevue + heure_prevue) < now()` (volume
   tenant négligeable en V1, évite raw SQL)
3. Pour chaque post en retard :
   - `lateDays = ceil((now - scheduledAt) / day)`
   - `daysToAdd = max(1, min(30, lateDays))` — garde anti-runaway
   - UPDATE `date_prevue += daysToAdd`, `reported_from = now()`
4. Logger un warning si `lateDays > 30` (le post reste légèrement en
   retard mais ne boucle plus)

**Note statut** : le brief écrivait `statut = 'draft'` mais la colonne
live est `posts.statut` (FR) avec valeurs `'planifie' | 'genere' |
'publie' | 'archive'`. `planifie` = pendant doctrinal de `draft`
(cf. mapping `lib/types/post.ts` Sprint 36.G).

### Label "Reporté de N jours"

Helper `reportedLabel()` dans `lib/aujourd-hui/dates-fr.ts` :
- Si `date_prevue = today` ET `reported_from NOT NULL` → "Reporté de hier"
- Si `date_prevue > today + 1` ET `reported_from NOT NULL` →
  "Reporté de N jours" (N = today - DATE(reported_from))
- Sinon → null (pas de label)

Rendu sous le sous-titre dans `TaskRow` : font-size 12, italique,
opacity 0.85, color `rgba(0,0,0,0.55)` — discret mais informatif.

`BlocCetteSemaine` + `page.tsx` passent `today={now}` au TaskRow pour
le calcul.

## 5. Animations stagger à l'entrée

**Pas de framer-motion** (pas dans `package.json`) — CSS pur conformément
à l'abort A4. Aucune dépendance ajoutée.

Keyframe `cfs-stagger-in` (400 ms, Apple ease-out `cubic-bezier(0.16, 1,
0.3, 1)`) + 9 classes utilitaires `cfs-stagger-1..9` avec
`animation-delay` de 0 à 640 ms par pas de 80 ms.

Application sur la page (server-rendered HTML, les classes pré-rendues
déclenchent l'animation au paint navigateur) :

| Élément | Classe |
|---|---|
| PageHeader | (immédiat, pas de stagger) |
| Bloc 1 Prochaine action | `cfs-stagger-2` (80 ms) |
| Bloc A section | `cfs-stagger-3` (160 ms) |
| Bloc 2 État Programme | `cfs-stagger-6` (400 ms) |
| Bloc 3 État Ma Marque | `cfs-stagger-7` (480 ms) |
| Bloc B Cette semaine | `cfs-stagger-8` (560 ms) |
| Bloc C Signal Veille | `cfs-stagger-9` (640 ms) |

Les TaskRow individuelles ne sont **pas** staggered (compromis lisibilité
performance — 8+ rows × 40 ms peut alourdir la perception). Au lieu de
cela, le Bloc A entier apparaît d'un coup au tick 160 ms.

`@media (prefers-reduced-motion: reduce)` : animation forced none,
opacity 1, transform none — apparition instantanée.

## Hover signatures (Findings 9c-d)

- TaskRow : background `rgba(0,0,0,0.02)` au hover + reveal du lien
  "Demander →" à opacity 0.8.
- Bouton Commencer : `transform: scale(1.02) + box-shadow 0 6px 20px
  rgba(0,0,0,0.12)` au hover, 200 ms ease-out.
- Bloc 2 (lien `/programme`) : `background: rgba(255,255,255,0.75)` au
  hover — renforce le Liquid Glass.
- Tous les hovers sont neutralisés sur `@media (hover: none)` (touch).

## Audit usage `#007AFF` (Finding 9e)

5 occurrences trouvées dans le scope :

| Fichier | Usage | Conforme spec ? |
|---|---|---|
| `StateCircle.tsx` | COLOR_READY (pastille état ready) | ✓ |
| `TaskRow.tsx` | Lien "Demander →" | ✓ |
| `SuggestedSignal.tsx` | Lien `ctaLabel` ("Et nous ?") | ✓ |
| `page.tsx` | Lien "Compléter Ma Marque →" | ✓ |
| `BlocCetteSemaine.tsx` | CTA "Vois ta semaine dans Mon Programme →" | ✗ → corrigé |

Le CTA hebdo n'apparaissait pas dans la liste canonique spec
(`Compléter Ma Marque`, `Et nous ?`, `Demander →`). Remplacé par
`rgba(0,0,0,0.7)` gris sombre.

## Gate final

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `eslint --quiet` | 0 erreur (11 warnings pré-existants) |
| 3 | `next build` | succès, 40 routes (incluant `/aujourd-hui`) |
| 4 | `#1F4937` dans code | 0 (1 mention documentaire en commentaire) |
| 5 | `/mon-programme` live (hors commentaires) | 0 |
| 6 | Routage `/programme/post/[id]` préservé | ✓ |
| 7 | `/programme` (route active) non touché | ✓ |
| 8 | `/mon-programme` (route séparée) non touché | ✓ |
| 9 | Schéma `profiles`/`tenants`/`brands` | non modifié |
| 10 | Migrations DB | 1 nouvelle (013) — `posts.reported_from` |
| 11 | Push / merge / tag | aucun |

## Action Lead

1. Appliquer migration 013 en local
2. Validation visuelle `/aujourd-hui` :
   - Header : H1 "Aujourd'hui" + sous-titre "Semaine du X au Y mois",
     plus de breadcrumb
   - Bloc A titre : "Aujourd'hui, 13 mai"
   - 4 cartes en Liquid Glass (1 niveau 2, 3 niveau 1)
   - Pastilles 8×8 px (todo/ready/alert) ou check inline (published)
   - Plus de bouton "..." sur TaskRow, lien "Demander →" latent à droite
   - Bloc C Suggéré avec CTA "Et nous ?"
   - Animations stagger à l'arrivée (visible au refresh)
3. Test du report auto :
   - Insérer manuellement un post avec `statut='planifie'`,
     `date_prevue` 3 jours dans le passé, `reported_from IS NULL`
   - Refresh `/aujourd-hui` → le post doit avoir `date_prevue = today + 1`
     (ou today selon heure_prevue), `reported_from` NOT NULL, et
     apparaître dans Bloc A ou B avec label "Reporté de 3 jours"
4. Si OK : merge `sprint-36-h` → main (pas de tag)

**Filet** : `git checkout sprint-36-g` revient à l'état pré-sprint
en < 1 s. Migration 013 NON appliquée tant que validation Lead non faite.
