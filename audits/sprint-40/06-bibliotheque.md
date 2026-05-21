# Audit Sprint 40 — Page Bibliothèque

> Verdict global : **À refactorer** (page existante au mauvais emplacement, à promouvoir top-level + nettoyer)
> Doctrine de référence : `00-CONCEPT.md` §5 promesse 7 "Tu ne perds rien. Tout ce qui a été produit, écrit, archivé, brefé, validé, est retrouvable. La mémoire de la marque est totale et indexée par Élise M., Experte Archives & Mémoire." · §5 promesse 3 "Le Calendrier (publications futures), les Rappels (tâches à faire), la Bibliothèque (publications passées) sont trois apps système distinctes mais reliées." · `01-ARCHITECTURE.md` §1 (Bibliothèque, section Travail, top-level) · `02-EXPERTS.md` Élise M. = Opus 4.7 Archives.

---

## 1. Périmètre audité

### 1.1 Route actuelle (sous-arbre Outils)

- `app/(outils)/outils/bibliotheque/page.tsx` — Sprint 37.A, V1, breadcrumb "Aujourd'hui › Outils › Bibliothèque".

### 1.2 Composants Library

- `components/library/LibraryView.tsx` — orchestrateur Split Brief 40/60.
- `components/library/LibraryPreview.tsx`
- `components/library/LibraryUploadSheet.tsx`

### 1.3 Lib

- `lib/library/queries.ts` — `loadLibrary(supabase)`.
- `lib/library/types.ts` — types `LibraryItem`, `LibraryTab`, helpers d'affichage.

### 1.4 Server actions

- `app/_actions/create-library-document.ts`

### 1.5 Migrations Supabase

- `018_library_documents.sql` — table `library_documents`.

### 1.6 Cible doctrinale V2.0

- `app/(app)/bibliotheque/page.tsx` (cible top-level) — pas sous outils.
- `components/bibliotheque/` (cible) — composants au format 4:5 publications passées + filtres.
- `lib/bibliotheque/queries.ts` (cible).

---

## 2. Confrontation à la doctrine

### `app/(outils)/outils/bibliotheque/page.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §1 "Bibliothèque · Mémoire éditoriale, publications passées format 4:5 · Travail (top-level)". `00-CONCEPT.md` §5 promesse 3 "trois apps système distinctes".
- **Constat factuel :** Page Sprint 37.A. Server Component, charge `loadLibrary`. Breadcrumb mention "Outils".
- **Écart constaté :**
  1. Emplacement sous `(outils)` ≠ top-level.
  2. Breadcrumb mentionne Outils → contredit la structure cible.
  3. 5 `<div className="bg-halo bg-halo-1..5">` → wallpaper saturated réservé Aujourd'hui (`01-ARCHITECTURE.md` §3.4).
  4. Page V1 mentionne "RAG + attachment dans le chat conseiller reportés Sprint 38" → liaison Conseiller (Recalé).
  5. Subtitle "Tout ce que tu as, en un seul endroit." → conforme voice sheet (sentence case, pas d'exclamation).
- **Action proposée Phase 2 :**
  - Retirer les 5 `bg-halo`.
  - Retirer mention "Outils" du breadcrumb (deviendra `"Aujourd'hui › Bibliothèque"` une fois promue top-level).
  - Retirer la mention "chat conseiller" du commentaire d'en-tête.
  - **Hors scope Sprint 40 :** déplacement vers `app/(app)/bibliotheque/page.tsx` (impact router + URL — Sprint 43+).

### `components/library/LibraryView.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.2 sub-sidebar 260px ≠ Split Brief 40/60.
- **Constat factuel :** Split Brief 40/60. TABS = `all, brand-book, document, post, conversation, review, programme`.
- **Écart constaté :**
  1. Pattern Split Brief obsolète.
  2. Tab `conversation` indexe les conversations Conseiller V1 → à dégager une fois Conseiller supprimé.
  3. Pas de **format 4:5 publications passées** (`01-ARCHITECTURE.md` §1) — la cible visuelle V2.0 = grille 4:5 type Instagram (mémoire éditoriale post-by-post). Le code actuel = liste générique multi-type.
- **Action proposée Phase 2 :**
  - Retirer tab `conversation`.
  - Marquer `@deprecated` le Split Brief layout (refactor Sprint 43+).
  - Audit visuel grille 4:5 Sprint 43+.

### `components/library/LibraryPreview.tsx`, `LibraryUploadSheet.tsx`
- **Statut doctrinal :** À refactorer
- **Action proposée Phase 2 :** Audit copies Sprint 41 (vocabulaire), audit visuel Sprint 43+.

### `lib/library/queries.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `04-MULTI_TENANT.md` "Le pattern fautif `createAdmin()` + `.eq('id', ...)` est interdit."
- **Constat factuel :** `loadLibrary(supabase)`. À auditer pour vérifier qu'il n'utilise pas `createAdmin()` côté user.
- **Action proposée Phase 2 :** Patch sécurité dans `10-transverse.md` §1.

### `lib/library/types.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `03-VOICE_SHEET.md` §9 vocabulaire technique tolérable, sauf strings UI.
- **Constat factuel :** `categoryLabel`, `statusBadgeClass`, `statusLabel`, `tabLabel` exposent des libellés UI.
- **Écart constaté :** À auditer pour le mot "Conversation" qui restera vide une fois Conseiller dégagé.
- **Action proposée Phase 2 :** Retirer le label "Conversation" (et le type associé).

### `app/_actions/create-library-document.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `04-MULTI_TENANT.md`.
- **Constat factuel :** Utilise `createAdmin` (cf. grep `10-transverse.md` §1).
- **Action proposée Phase 2 :** Patch sécurité dans `10-transverse.md` §1.

### `supabase/migrations/018_library_documents.sql`
- **Statut doctrinal :** À refactorer (audit schéma à laisser Sprint 41+)
- **Référence doctrine :** `04-MULTI_TENANT.md` "Si tu écris une nouvelle table : `tenant_id uuid not null references tenants(id) on delete cascade` est obligatoire."
- **Constat factuel :** Migration créant `library_documents`.
- **Écart constaté :** À vérifier RLS active + policies SELECT/INSERT/UPDATE/DELETE. (Vérification à faire dans `10-transverse.md` §5.)
- **Action proposée Phase 2 :** Audit dans `10-transverse.md` §5.

### Cible doctrinale V2.0 — création hors scope Sprint 40
- **Statut doctrinal :** À créer (Sprint 43+)
- **Référence doctrine :** §5 promesse 3 + 7 + Élise M. Archives.
- **Constat factuel :** Le code actuel V1 est proche du concept mais à promouvoir + cleaning.
- **Action proposée Phase 2 :** Pas de création Sprint 40. Sprint 43+ :
  - Déplacer route `(outils)/outils/bibliotheque/` → `(app)/bibliotheque/`.
  - Refactor visuel grille 4:5 publications passées.
  - Liaison avec Élise M. (Opus 4.7) pour la recherche/RAG (V2 reporté).

---

## 3. Confrontation à la spec HTML

**[doctrine silencieuse sur le détail visuel Bibliothèque v2]**.

Doctrine couverte :
- `01-ARCHITECTURE.md` §1 destination top-level Travail.
- `00-CONCEPT.md` §5 promesse 3 + 7 + Élise M.
- `00-CONCEPT.md` §11 typographie système, sentence case.

Le format **4:5 publications passées** est cité dans `01-ARCHITECTURE.md` §1. Le code actuel n'implémente pas explicitement ce format.

---

## 4. Résumé chiffré

| Verdict | Nombre |
|---|---|
| Validés | 0 |
| À refactorer | 7 |
| Recalés | 0 |
| Total fichiers Bibliothèque audités | 7 |

Aucun Recalé direct sur Bibliothèque (la page est conforme dans son concept). Les écarts sont :
- Emplacement (sous outils au lieu de top-level).
- Liaison Conseiller (tab `conversation` + commentaire).
- Wallpaper saturated halos hors scope.
- Pattern Split Brief obsolète.
- Sécurité multi-tenant à patcher.

---

## 5. Recommandation pour Phase 2

### 5.1 Refactor automatique

Dans `app/(outils)/outils/bibliotheque/page.tsx` :
- Retirer les 5 `<div className="bg-halo bg-halo-N">`.
- Retirer la mention "Outils" du breadcrumb : `["Aujourd'hui", "Bibliothèque"]`.
- Retirer la mention "chat conseiller" du commentaire d'en-tête.

Dans `components/library/LibraryView.tsx` :
- Retirer la valeur `'conversation'` du `TABS` array.
- Marquer `@deprecated` l'import `SplitBrief`.

Dans `lib/library/types.ts` :
- Retirer le label/type `'conversation'`.

### 5.2 Pas de suppression directe

Aucune suppression de fichier Bibliothèque en Phase 2. Tous les fichiers gardent leur valeur fonctionnelle.

### 5.3 Hors scope Sprint 40 (Sprint 41+)

- Déplacement `(outils)/outils/bibliotheque/` → `(app)/bibliotheque/` (impact router + URL).
- Audit schéma `018_library_documents.sql` (RLS, policies).
- Patch sécurité `app/_actions/create-library-document.ts`.
- Refactor visuel grille 4:5 (Sprint 43+).
- Liaison Élise M. Archives (Sprint 43+).

---

## 6. Cible doctrinale V2.0 — spec détaillée pour Sprint 43+

Cette section consigne la cible que Sprint 43+ devra implémenter. Elle ne fait pas partie de la purge Sprint 40, mais sert de pré-brief pour le prochain sprint d'implémentation.

### 6.1 Structure de fichiers cible

```
app/(app)/bibliotheque/
├── layout.tsx                          ← shell minimaliste
├── page.tsx                            ← Server Component, charge la grille 4:5
├── loading.tsx                         ← état de chargement (squelette grille)
└── error.tsx                           ← état d'erreur

components/bibliotheque/
├── BibliothequeView.tsx                ← orchestrateur grille + filtres + recherche
├── BibliothequeGrid.tsx                ← grille 4:5 publications passées
├── BibliothequeItemCard.tsx            ← card 4:5 individuelle
├── BibliothequeFilters.tsx             ← filtres par pilier, période, format
├── BibliothequeSearch.tsx              ← recherche pleine texte (Élise M.)
├── BibliothequeDetailSheet.tsx         ← détail item au clic
└── BibliothequeEmptyState.tsx          ← état vide ("Ta bibliothèque est vide. Tes publications passées s'archivent ici automatiquement.")

lib/bibliotheque/
├── queries.ts                          ← loadBibliotheque(supabase, filters)
├── types.ts                            ← BibliothequeItem, BibliothequeFilter
└── search.ts                           ← recherche client + serveur (RAG via Élise M.)

app/_actions/bibliotheque/
├── archive-post.ts                     ← archiver post (post.statut → 'archive')
└── search-bibliotheque.ts              ← recherche IA via Élise M.
```

### 6.2 Spec visuelle (lue depuis la doctrine)

`01-ARCHITECTURE.md` §1 et §3.2 :

- **Layout** : sub-sidebar 260px gauche (filtres + recherche + segments) + content pane droit (grille 4:5).
- **Format publication** : 4:5 (ratio Instagram standard). Largeur fixe ~280px, hauteur ~350px.
- **Grille** : 3 colonnes en desktop, 2 en tablette, 1 en mobile. Gap 16px.
- **Card individuelle** : visuel 4:5 + métadonnée pilier (chip couleur) + date relative + tooltip caption à l'hover.

`00-CONCEPT.md` §11 :
- Crème `#FBFAF7` en fond.
- Glassmorphism iOS 26 sobre sur les filtres.
- Animation `ease-out` 250ms sur le hover des cards.

### 6.3 Intégration Élise M. (Sprint 43+)

`02-EXPERTS.md` §3 + §9 : Élise M. tourne sur **Opus 4.7** car son rôle exige du raisonnement long contexte. Sa voix est "Archiviste rigoureuse. Refus absolu d'inventer. Si l'archive ne dit rien, elle dit 'rien dans le corpus'."

Patterns d'intégration :
- **Recherche dans la bibliothèque** : `BibliothequeSearch.tsx` envoie la query à Élise M. (Opus 4.7) qui retourne soit la liste matching, soit la phrase "rien dans le corpus".
- **RAG sur les contenus archivés** : V2 (reporté). En V1, recherche textuelle simple suffit.
- **Auto-archivage** : un post passé en statut `published` ou `published_external` migre automatiquement vers la bibliothèque (visible immédiatement).

### 6.4 Liens cross-pages (`01-ARCHITECTURE.md` §6)

- Depuis Bibliothèque, ouvrir un item → renvoie sur le détail du post (`?from=bibliotheque&context=postId`).
- Depuis Messages, Hélène ou Élise peut citer une publication archivée → deep-link.
- Depuis Mon Programme, voir l'historique du pilier → renvoie vers Bibliothèque filtrée sur ce pilier.

### 6.5 Migration SQL (à confirmer Sprint 43+)

Aucune nouvelle table nécessaire. La table `posts` (migration `006_posts.sql`) avec la colonne `statut` couvre déjà :
- `programme` → Calendrier (publication programmée).
- `published` / `published_external` → Bibliothèque (publication passée).
- `archive` → Bibliothèque (archivée manuellement).

Ce périmètre est cohérent avec `01-ARCHITECTURE.md` §6 "une publication peut exister dans Bibliothèque (archivée), dans Calendrier (programmée), dans Mon Programme (vue trimestrielle)" — une seule entité, plusieurs vues filtrées par statut.

### 6.6 Phase 2 Sprint 40 — vue rétrospective

Sprint 40 prépare cette cible en :
1. Retirant les halos `bg-halo-N` qui contredisent §3.4.
2. Nettoyant le breadcrumb (sortir Outils).
3. Retirant le tab `conversation` (Conseiller dégagé).
4. Marquant `@deprecated` le Split Brief layout.

Quand Sprint 43+ arrivera, la base sera saine et la migration vers `app/(app)/bibliotheque/` se fera proprement.
