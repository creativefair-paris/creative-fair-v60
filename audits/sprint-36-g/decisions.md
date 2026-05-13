# Sprint 36.G — Refonte /aujourd-hui sous doctrine "Tranquillité du pilote"

Branche `sprint-36-g` (basée sur `sprint-36-c-2` HEAD `bc1302d`, comme
36.D et 36.E pour parallélisme). 7 commits atomiques.
Build OK, tsc OK, lint OK (11 warnings pré-existants, 0 erreur).
Pas de push, pas de tag.

## Récapitulatif des 7 commits

| # | Commit | Sujet |
|---|---|---|
| 1 | `ca5921d` | Migration 012 — table alerts + RLS tenant-scoped |
| 2 | `fb1a7c1` | UI primitives — StateCircle + ContextMenu + use-long-press |
| 3 | `ffe04ac` | SplitBrief layout 40/60 canonique |
| 4 | `f9b62db` | TaskRow + CriticalBanner + SuggestedSignal + shiftPostDate |
| 5 | `c3887e2` | Refonte /aujourd-hui V3 (assemblage + load-data) |
| 6 | `f2b2b4a` | Nettoyage globals.css (classes Sprint 36.C obsolètes) |
| (7) | (audits) | Decisions + abort-log (ce commit) |

Migration B "posts.status" du brief : **non créée** — décision tracée
section 2 ci-dessous.

## 1. Layout 40/60 — décisions

**Composant** : `components/layouts/SplitBrief.tsx`, déclaré canonique
pour toute page dense V60.

- Desktop ≥ 1024px : `grid-template-columns: 40% 60%` strict
- Mobile < 1024px : single column, ordre `mobileOrder='right-first'`
  (la colonne droite "le faire" prioritaire sur le contexte gauche
  selon la doctrine Tranquillité du pilote)
- Gap 40px desktop / 24px mobile (cohérence avec les autres layouts
  Sprint 36.B)
- Composant pur sans state, sans dépendances externes

**Tablet 768-1023px** : single column même cas (le brief mentionnait
"40/60 toujours" mais 40% sur tablet portrait donne ~300px de contexte
gauche illisible — choix défensif single column dès le breakpoint).
À ARBITRER LEAD si tablet portrait doit être 40/60 forcé.

## 2. États Things 3 — choix de mapping

**Décision majeure** : **pas de nouvelle colonne `posts.status`**. La
colonne `posts.statut` existe déjà (Sprint 36.A, valeurs FR
`'planifie' | 'genere' | 'publie' | 'archive'`). Le spec demandait
`'draft' | 'ready' | 'published' | 'failed'` — créer une 2e colonne
parallèle aurait dupliqué la sémantique et créé une source d'erreur
pour les futures écritures.

**Mapping appliqué** (dans `lib/types/post.ts`, fonction `mapStatutToState`) :

| statut DB | PostState UI | Visuel |
|---|---|---|
| `planifie` | `todo` | cercle vide gris #C7C7CC |
| `genere` | `ready` | cercle plein bleu iOS #007AFF |
| `publie` | `published` | cercle plein bleu + check blanc |
| `archive` | `published` | (idem — état "terminé") |
| _(aucun)_ | `alert` | cercle orange #FF9500 + "!" blanc |

**État `alert` jamais atteint en V1** — aucune colonne `failed_at` ou
équivalent en base. Le rendu existe (StateCircle gère les 4 états) pour
qu'un sprint futur ajoutant un champ `posts.failed_at` ou
`posts.publish_error` branche le mapping sans refacto UI.

L'abort condition spec "Si posts.status existe déjà avec un ENUM
différent : ABORT" ne s'applique pas — `posts.status` n'existe pas, seul
`posts.statut` existe. Aucune migration nécessaire.

**Composant** : `components/ui/state-circles/StateCircle.tsx` —
implémentation SVG inline, taille paramétrable (défaut 20px), transition
250ms ease-out entre états.

## 3. Menu contextuel ±3 jours — implémentation

**Composant** : `components/ui/context-menu/ContextMenu.tsx`. Position
absolue calculée par le parent via `getBoundingClientRect()`.

**7 items** dans le menu (cf. `TaskRow.tsx`) :
- Reporter d'1 jour
- Reporter de 2 jours
- Reporter de 3 jours (limite max, cohérent doctrine)
- Avancer d'1 jour
- Avancer de 2 jours
- Avancer de 3 jours (limite max)
- (séparateur)
- Demander au Conseiller → `/outils/conseiller?context=post_<uuid>`

**Au-delà de ±3 jours** : pas d'item dans le menu. Le user passe par le
Conseiller (item dédié). Doctrine respectée : *« Modifications programme
via menu contextuel ±3 jours, au-delà passage Conseiller »*.

**Mobile** : `use-long-press` hook maison
(`components/ui/context-menu/use-long-press.ts`). 500ms timer sur
touchstart, annulé sur touchmove/touchend/touchcancel. Aucune dépendance
externe (poids = 0 KB d'overhead bundle).

**Persistance** : server action `app/_actions/shift-post-date.ts`.
- UPDATE posts.date_prevue de ±N jours via service_role (admin client)
- Auth + tenant ownership vérifiés avant l'UPDATE
- `revalidatePath('/aujourd-hui')` invalide le cache Next, refetch
  immédiat au prochain render
- Garde-fou max ±3 jours côté serveur (cohérent avec l'UI)
- Retour structuré `{ok, newDatePrevue}` ou `{ok:false, reason}`

**Pas de gestion conflits date avec posts existants** en V1 — un user
peut reporter 2 posts sur la même date. À monitorer post-déploiement.

## 4. Adaptation contextuelle déterministe — règles serveur

Toutes les décisions de présentation sont calculées **server-side**
dans `app/(aujourd-hui)/aujourd-hui/page.tsx` pour éviter le flash de
contenu côté client.

**Variables d'entrée** :
- `now = new Date(data.todayISO)` — UTC
- `dayOfWeek` : `now.getDay()` (0 dim, 1 lun, …, 6 sam)
- `hour` : `now.getHours()`

**Règles appliquées** :

| Règle | Effet |
|---|---|
| `dayOfWeek === 1 && hour < 12` (lundi matin) | `BlocCetteSemaine initialOpen={true}` |
| `dayOfWeek === 5 && hour >= 16` (vendredi tardif) | `BlocCetteSemaine showWeekendCta={true}` — CTA "Vois ta semaine dans Mon Programme" sous Bloc B |
| `alerts.length > 0` | Zone Critique full-width au-dessus du Split Brief |
| `alerts.length === 0` | CriticalBanner retourne `null` (n'occupe aucun espace) |
| `questionsAnswered < 14` | Bloc 3 État Ma Marque visible |
| `questionsAnswered >= 14` | Bloc 3 absent |
| `prochain` (premier post non-publié du jour) absent | Bloc 1 affiche "Rien à préparer aujourd'hui." |
| `prochainState === 'todo'` | Bouton primaire "Commencer" |
| `prochainState === 'genere'` (ready) | Bouton primaire "Voir" |
| _(EN COURS draft non-implémenté V1)_ | Bouton "Reprendre" inactif V1 |

**Note "EN COURS"** : le brief mentionne un état EN COURS qui afficherait
"Reprendre". Cet état nécessite une colonne `posts.draft_saved_at` ou
similaire qui n'existe pas en base. En V1, on n'a que `planifie / genere
/ publie / archive`. Si Lead souhaite cet état actif, un nouveau champ
DB est requis. Reporté.

## 5. Bloc C "Suggéré pour toi" — mock V1

**Fichier** : `lib/mocks/daily-signal.ts`

```ts
export const SUGGESTED_SIGNAL_MOCK: DailySignal | null = {
  signalId: 'mock-veille-001',
  territory: 'SIGNAL DE VEILLE',
  message: 'Ami Paris a lancé une capsule maison dimanche soir.',
}
```

Le composant `SuggestedSignal` retourne `null` si la valeur exportée est
`null` — pour cacher le bloc, il suffira de remplacer la valeur par
`null` ou de modifier la condition d'export selon le tenant.

**Pour brancher un endpoint réel** au sprint futur : remplacer l'import
de `SUGGESTED_SIGNAL_MOCK` par un fetch server-side dans `load-data.ts`
(`await fetchDailySignal(brand.id)`). Aucune refacto du composant
`SuggestedSignal` requise — il consomme déjà le type `DailySignal`.

**CTA** → `/outils/conseiller?context=signal_<signalId>`, cohérent avec
le pattern de contexte des posts (`?context=post_<uuid>`).

## Composants créés (inventaire final)

| Chemin | Type | Sprint origine |
|---|---|---|
| `components/layouts/SplitBrief.tsx` | Server | nouveau |
| `components/ui/state-circles/StateCircle.tsx` | Server | nouveau |
| `components/ui/context-menu/ContextMenu.tsx` | Client | nouveau |
| `components/ui/context-menu/use-long-press.ts` | Client hook | nouveau |
| `components/today/TaskRow.tsx` | Client | nouveau |
| `components/today/CriticalBanner.tsx` | Server | nouveau |
| `components/today/SuggestedSignal.tsx` | Client | nouveau |
| `components/today/BlocCetteSemaine.tsx` | Client | nouveau |
| `lib/types/post.ts` | Types/utils | nouveau |
| `lib/mocks/daily-signal.ts` | Mock V1 | nouveau |
| `app/_actions/shift-post-date.ts` | Server action | nouveau |
| `supabase/migrations/012_alerts.sql` | Migration | nouveau |

## Composants supprimés (Sprint 36.C obsolètes)

| Chemin | Raison |
|---|---|
| `components/aujourd-hui/AujourdhuiContent.tsx` | Assembly remplacé par page.tsx |
| `components/aujourd-hui/SectionAujourdhui.tsx` | Remplacé par Bloc A inline + TaskRow |
| `components/aujourd-hui/SectionCetteSemaine.tsx` | Remplacé par BlocCetteSemaine |
| `components/aujourd-hui/SectionMarquePrendForme.tsx` | Compteurs migrent vers /mon-programme |
| `components/aujourd-hui/SectionBrouillons.tsx` | Stub V1 sans usage V3 |
| `components/aujourd-hui/TaskItem.tsx` | Remplacé par TaskRow (pattern Things 3) |
| `components/aujourd-hui/StatBlock.tsx` | Pattern A migre vers /mon-programme |
| `components/aujourd-hui/SectionLabel.tsx` | Inline dans page.tsx |
| `components/aujourd-hui/DateHeader.tsx` | Inline dans page.tsx (PageHeader title) |

## Gate final

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `eslint --quiet` | 0 erreur (11 warnings pré-existants) |
| 3 | `next build` | succès, 40 routes (incluant `/aujourd-hui`) |
| 4 | Anti-régression `#1F4937` dans code | 0 (2 mentions documentaires en commentaire) |
| 5 | Routage `/programme/post/[id]` préservé | confirmé (TaskRow click → router.push) |
| 6 | Aucune modification de `/mon-programme` | confirmé (route non touchée) |
| 7 | Push / merge / tag | aucun |
| 8 | Migrations DB | 1 nouvelle (012 alerts), pas de modif existantes |

## Action Lead

1. Appliquer migration `012_alerts.sql` en local et tester
2. Valider visuellement `/aujourd-hui` :
   - Header date FR + avatar
   - Zone Critique : insérer manuellement une alerte pour vérifier
     l'affichage : `INSERT INTO alerts (tenant_id, severity, message,
     source) VALUES ('<id>', 'warning', 'Test signal', 'crise');`
   - Bloc 1 Prochaine action visible / "Rien à préparer" sobre selon
     cas
   - Bloc 2 cliquable vers /mon-programme
   - Bloc 3 conditionnel sur questions_answered < 14
   - Bloc A liste posts avec cercles d'état
   - Bloc B collapsible, déplié si lundi matin
   - Bloc C affiche le mock signal de veille
   - Menu "..." sur TaskRow propose reporter/avancer ±3 jours
3. Sur sprint-36-e (parallèle), spec 02-aujourd-hui.spec.ts assertait
   `'AUJOURD\'HUI'` uppercase et `'TA MARQUE PREND FORME'` — DOM
   disparu en V3. Voir abort-log.md pour le détail. Le test devra
   être mis à jour au merge si 36.E est mergé après 36.G.
4. Si OK : push `sprint-36-g` → merge `main` → pas de tag (la refonte
   `/aujourd-hui` seule ne mérite pas un bump version produit ; tag
   v1.7.0 reste celui qui sera posé après les sprints 36.B → 36.C.2)

**Filet** : `git checkout sprint-36-c-2` revient à l'état pré-sprint
en < 1 s. Migration 012 NON appliquée tant que validation Lead non faite.
