# Audit Sprint 40 — Page Calendrier

> Verdict global : **À refactorer** (concept partiellement implémenté dans Mon Programme, doctrine attend une page top-level distincte)
> Doctrine de référence : `00-CONCEPT.md` §5 promesse 3 "Le Calendrier (publications futures), les Rappels (tâches à faire), la Bibliothèque (publications passées) sont trois apps système distinctes mais reliées." · §7 territoire Programmation · `01-ARCHITECTURE.md` §1 (Calendrier, section Travail, top-level) · §6 cross-pages (une publication peut exister dans Bibliothèque archivée + Calendrier programmée + Mon Programme vue trimestrielle + Messages discutée).

---

## 1. Périmètre audité

### 1.1 Route cible doctrinale V2.0

- `app/(app)/calendrier/page.tsx` (cible top-level) — **n'existe pas dans le repo**.

### 1.2 Implémentation actuelle (sous Mon Programme)

Le code Calendrier vit aujourd'hui dans `components/programme/` :

- `components/programme/CalendarListView.tsx`
- `components/programme/CalendarMonthView.tsx`
- `components/programme/CalendarPostCard.tsx`
- `components/programme/CalendarToggle.tsx`
- `components/programme/CalendarView.tsx`
- `components/programme/CalendarViewSwitcher.tsx`
- `components/programme/CalendarWeekView.tsx`
- `components/programme/ProgrammeCalendarView.tsx`
- `components/programme/VueMois.tsx`
- `components/programme/VueSemaine.tsx`

### 1.3 Calendrier business (Ma Marque — distinct)

- `components/ma-marque/calendrier/CalendrierBusinessSheet.tsx`
- `components/ma-marque/calendrier/CalendrierContext.tsx`
- `components/ma-marque/calendrier/CalendrierPreview.tsx`

Ce sous-arbre concerne le **calendrier business** (ancrages éditoriaux récurrents, doctrine §5 promesse 2 "calendriers business" rattachés à Ma Marque), pas le Calendrier top-level (publications futures programmées).

### 1.4 Helpers calendrier

- `lib/calendar/dates.ts` — utilitaires de dates (`startOfWeek`, `endOfWeek`, `addDays`, `startOfDay`).

### 1.5 Types

- `types/business-calendar.ts` (pour le calendrier business, déduit de l'import dans `page.tsx` Aujourd'hui).
- `types/programme.ts` (PostRow, PilierNarratif).

### 1.6 Migrations Supabase liées

- `006_posts.sql` — table `posts` (publications avec date programmée).
- `023_programmes_dates.sql` — dates programme.

---

## 2. Confrontation à la doctrine

### Inexistence de la route `/calendrier` top-level
- **Statut doctrinal :** À créer (hors scope Sprint 40)
- **Référence doctrine :** `01-ARCHITECTURE.md` §1 "Calendrier · Vue temporelle des publications futures et événements · Travail (top-level)".
- **Constat factuel :** Aucun fichier `app/(app)/calendrier/page.tsx`. Le Calendrier vit confondu dans `/programme`.
- **Écart constaté :** Architecture doctrinale V2.0 attend trois apps système distinctes (Calendrier · Rappels · Bibliothèque). Le code les confond ou les sous-empile.
- **Action proposée Phase 2 :** Création hors scope Sprint 40. Sprint 43+ : création de la route + déplacement des composants `Calendar*` depuis `components/programme/` vers `components/calendrier/`.

### `components/programme/CalendarListView.tsx`, `CalendarMonthView.tsx`, `CalendarPostCard.tsx`, `CalendarToggle.tsx`, `CalendarView.tsx`, `CalendarViewSwitcher.tsx`, `CalendarWeekView.tsx`, `VueMois.tsx`, `VueSemaine.tsx`, `ProgrammeCalendarView.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §1 (Calendrier top-level) + `00-CONCEPT.md` §5 promesse 6 (Mon Programme = pilotage trimestriel + heatmap 30 jours).
- **Constat factuel :** 10 composants de vue calendrier dans `components/programme/`.
- **Écart constaté :** Confusion entre :
  1. La **heatmap calendrier 30 jours** de Mon Programme (vue de pilotage, agrégée).
  2. Le **Calendrier des publications futures** top-level (vue temporelle, post-by-post).
  Les deux sont distincts en doctrine V2.0 mais mélangés dans le code.
- **Action proposée Phase 2 :** Sprint 40 — marquer `@deprecated` dans les commentaires d'en-tête + ajouter un commentaire pointant vers la cible. Sprint 43+ — déplacer + séparer.

### `lib/calendar/dates.ts`
- **Statut doctrinal :** Validé
- **Référence doctrine :** Utilitaires neutres.
- **Constat factuel :** Helpers de dates réutilisables.
- **Écart constaté :** Aucun.
- **Action proposée Phase 2 :** Aucune.

### `components/ma-marque/calendrier/*` (Calendrier business)
- **Statut doctrinal :** Validé
- **Référence doctrine :** `00-CONCEPT.md` §5 promesse 2 (calendriers business rattachés à Ma Marque).
- **Constat factuel :** Sub-arbre Ma Marque dédié au calendrier business.
- **Écart constaté :** Aucun, sous réserve audit copies.
- **Action proposée Phase 2 :** Audit copies Sprint 41.

### `types/business-calendar.ts` (déduit, à vérifier)
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Aucune.

### Migration `006_posts.sql`, `023_programmes_dates.sql`
- **Statut doctrinal :** Validé
- **Référence doctrine :** `04-MULTI_TENANT.md` + `00-CONCEPT.md` §5.
- **Action proposée Phase 2 :** Audit RLS dans `10-transverse.md` §5.

### Cible doctrinale V2.0 — création hors scope
- **Statut doctrinal :** À créer (Sprint 43+)
- **Référence doctrine :** §1.
- **Action proposée Phase 2 :** Aucune. Création planifiée Sprint 43+ :
  - Route `app/(app)/calendrier/page.tsx`.
  - Migration ou ré-import des composants `Calendar*` vers `components/calendrier/`.
  - Distinction claire heatmap 30j (Mon Programme) vs vue temporelle publications futures (Calendrier).

---

## 3. Confrontation à la spec HTML

**[doctrine silencieuse sur le détail visuel Calendrier]**.

Doctrine couverte :
- `01-ARCHITECTURE.md` §1 destination Calendrier = Travail (top-level).
- `00-CONCEPT.md` §5 promesse 3 "trois apps système distinctes".
- §6 piliers Apple #2 Frictionless Ecosystem & State Management.
- `01-ARCHITECTURE.md` §6 cross-pages publication = entité partagée (posts.id).

---

## 4. Résumé chiffré

| Verdict | Nombre |
|---|---|
| Validés | 5 |
| À refactorer | 10 |
| Recalés | 0 |
| À créer (hors scope Sprint 40) | ~6 fichiers cibles |
| Total fichiers Calendrier audités | 15 |

À refactorer : les 10 composants `Calendar*` / `Vue*` dans `components/programme/`.

Validés :
1. `lib/calendar/dates.ts`
2. `components/ma-marque/calendrier/CalendrierBusinessSheet.tsx`
3. `components/ma-marque/calendrier/CalendrierContext.tsx`
4. `components/ma-marque/calendrier/CalendrierPreview.tsx`
5. Migrations `006_posts.sql`, `023_programmes_dates.sql` (groupés)

---

## 5. Recommandation pour Phase 2

### 5.1 Refactor automatique

Dans `components/programme/CalendarView.tsx`, `ProgrammeCalendarView.tsx`, `VueMois.tsx`, `VueSemaine.tsx` (et autres) :

- Ajouter dans le commentaire d'en-tête : `// @deprecated — composant à migrer vers components/calendrier/ Sprint 43+ (cible doctrinale V2.0 = Calendrier top-level distinct de Mon Programme).`

Pas de suppression. Pas de déplacement. Juste marquage.

### 5.2 Pas de suppression directe

Aucun fichier Calendrier n'est Recalé. La purge attendra le Sprint 43+ qui créera la route cible.

### 5.3 Hors scope Sprint 40 (Sprint 43+)

- Création de la route `app/(app)/calendrier/page.tsx`.
- Déplacement des composants `Calendar*` et `Vue*` depuis `components/programme/` vers `components/calendrier/`.
- Séparation claire :
  - **Calendrier (top-level)** : vue temporelle publications futures + événements (post-by-post).
  - **Mon Programme** : heatmap éditoriale 30 jours agrégée (dimension pilotage).
- Liaison cross-pages doctrinale (`?from=calendrier&context=postId`).

---

## 6. Cible doctrinale V2.0 — spec détaillée pour Sprint 43+

### 6.1 Structure de fichiers cible

```
app/(app)/calendrier/
├── layout.tsx
├── page.tsx                            ← Server Component
├── loading.tsx
└── error.tsx

components/calendrier/
├── CalendrierView.tsx                  ← orchestrateur
├── CalendrierMonthView.tsx             ← vue mois (grille 7 colonnes)
├── CalendrierWeekView.tsx              ← vue semaine (timeline 7 jours)
├── CalendrierListView.tsx              ← vue liste (chronologique)
├── CalendrierToggle.tsx                ← switch mois/semaine/liste
├── CalendrierPostCard.tsx              ← card publication dans la grille
├── CalendrierEventCard.tsx             ← card événement business (ancres calendrier business)
├── CalendrierDayCell.tsx               ← cellule jour individuelle
├── CalendrierNavigator.tsx             ← précédent/suivant + aujourd'hui
└── NewPostFromCalendrier.tsx           ← création publication depuis la grille

lib/calendrier/
├── queries.ts                          ← loadCalendrier(supabase, range)
├── types.ts                            ← CalendrierItem (post + event), CalendrierRange
└── range.ts                            ← calcul des ranges de date
```

### 6.2 Spec visuelle (lue depuis la doctrine)

`01-ARCHITECTURE.md` §1 + §3.2 :
- **Layout** : sub-sidebar 260px (mini-calendrier + filtres piliers + bouton "nouvelle publication") + content pane droit.
- **Vue par défaut** : Mois.
- **Référence produit** : `00-CONCEPT.md` §3 "Notion Calendar version simplifiée pour l'organisation du temps".

`00-CONCEPT.md` §11 :
- Crème `#FBFAF7` en fond.
- Cellules de jour glassmorphism z2 standard.
- Animations 250ms ease-out sur les transitions de mois.

### 6.3 Liens cross-pages

- Depuis Calendrier, ouvrir une publication → `?from=calendrier&context=postId` vers détail post.
- Depuis Calendrier, "Préparer ce post" → ouvre Post Creator avec date pré-remplie.
- Depuis Aujourd'hui, widget Calendrier (cf. §3.1) → renvoie à Calendrier vue semaine courante.
- Depuis Mon Programme heatmap 30j, cliquer un jour → renvoie à Calendrier vue jour.

### 6.4 Pas de nouveau schéma SQL

La table `posts` (avec `date_prevue`, `statut`) couvre déjà l'usage. Les événements business viennent de `brand_business_calendar` (jsonb dans `brands`) ou d'une future table dédiée.

### 6.5 Distinction Calendrier vs Mon Programme

Doctrine confirme deux pages distinctes :

| Aspect | Calendrier (top-level Travail) | Mon Programme (Éditorial) |
|---|---|---|
| **But** | Voir ce qui vient (publications + événements) | Piloter la stratégie éditoriale trimestrielle |
| **Vue principale** | Mois / Semaine / Liste (post-by-post) | Heatmap 30 jours (agrégée) + suggestions semaine + piliers actifs |
| **Granularité** | Une cellule = un post précis avec sa publication | Une cellule = densité éditoriale (X publications ce jour) |
| **Action principale** | Cliquer un post = ouvrir détail | Cliquer un jour = explorer la stratégie de la semaine |
| **Public** | Tout le monde (Floriane utilise quotidiennement) | Pilote (Floriane mensuel pour ajuster) |

Cette distinction est doctrinale et doit être préservée à la création Sprint 43+.
