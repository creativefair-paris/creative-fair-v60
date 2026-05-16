# Page : /outils/bibliotheque

## Métadonnées
- Route : `/outils/bibliotheque`
- Fichier source : `app/(outils)/outils/bibliotheque/page.tsx` (64 lignes)
- Composants principaux :
  - `components/library/LibraryView.tsx` (280 lignes, `'use client'`)
  - `components/library/LibraryPreview.tsx` (474 lignes, `'use client'`)
  - `components/library/LibraryUploadSheet.tsx` (262 lignes, `'use client'`)
  - `components/layouts/SplitBrief` (layout 40/60)
  - `components/layout/PageHeader`
- Queries : `lib/library/queries.ts` (`loadLibrary`)
- Server Actions : `app/_actions/create-library-document.ts`
- Types : `lib/library/types.ts`
- Server / Client : Page Server Component (auth + data load), délègue à `<LibraryView>` Client pour l'interaction + 3 sheets/preview.
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise)

## Lecture rapide
Bibliothèque V1 : espace centralisé qui agrège brand book, documents uploadés, posts publiés, conversations conseiller, reviews, programmes. Split brief 40/60 : recherche + segmented control + liste à gauche, preview de l'item sélectionné à droite. Upload via sheet. Pas de RAG ni d'attachement chat en V1 (reporté Sprint 38). Architecture saine, mais la preview Post utilise encore le schéma legacy `pilier_nom TEXT` au lieu du nouveau `pilier_id UUID FK` introduit par Sprint 37.K F89.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. `app/(outils)/outils/bibliotheque/page.tsx:27` — `background: var(--color-background)` ✅ token v60 (crème `#FBFAF7`).
2. `app/(outils)/outils/bibliotheque/page.tsx:29-33` — 5 halos statiques (`bg-halo-1` à `bg-halo-5`) en `aria-hidden`. Halos statiques uniquement, conforme spec mai 2026.
3. `app/(outils)/outils/bibliotheque/page.tsx:45-48` — `<PageHeader>` avec subtitle "Tout ce que tu as, en un seul endroit." et breadcrumb 3 niveaux corrects.
4. `components/library/LibraryView.tsx:74-77` — subtitle dupliqué dans le corps si `items.length === 0` : "Tout ce que tu as, en un seul endroit." Doublon avec `PageHeader.subtitle` (visible deux fois si vide). À nettoyer.
5. `components/library/LibraryView.tsx:97` — bouton `.btn-primary` (token de classe globale). OK.
6. `components/library/LibraryView.tsx:134-145` — input search : `padding 10px 12px 10px 36px`, `border 1px solid var(--color-separator)`, `background rgba(255,255,255,0.6)`, `font var(--font-system)`. Tokens v60. ✅
7. `components/library/LibraryView.tsx:148` — `className="segmented-control"` : utilise le composant token global. ✅
8. `components/library/LibraryView.tsx:196-198` — `glass-thin` sur la row sélectionnée. Liquid Glass z1.
9. `components/library/LibraryView.tsx:206-207` — `background: isSelected ? undefined : 'transparent'` + `transition: background-color 200ms ease-out`. Micro-feedback cohérent.
10. `components/library/LibraryView.tsx:248-251` — `@media (prefers-reduced-motion: reduce)` désactivé. ✅
11. `components/library/LibraryView.tsx:262-273` — empty state preview : `glass-thin` + texte sobre "Sélectionne un item pour le prévisualiser." Pattern empty state unifié.
12. `components/library/LibraryPreview.tsx:132` — `background: rgba(0, 0, 0, 0.02)` pour le fallback image. Pas de token, mais valeur cohérente avec le pattern fill du repo.
13. `components/library/LibraryPreview.tsx:140` — `background: rgba(0, 0, 0, 0.03)` pour le bloc "non rendu". Hardcoded, pas de token `var(--color-fill-tertiary)`.
14. `components/library/LibraryPreview.tsx:209` — `background: rgba(0, 0, 0, 0.03)` pour le bloc code post. Idem hardcoded.
15. `components/library/LibraryPreview.tsx:108` — couleur erreur `#C0392B` hardcodée (rouge brique). Pas le rouge SF `#FF3B30` du design system. Drift palette.
16. `components/library/LibraryUploadSheet.tsx:153` — `background: 'rgba(0, 0, 0, 0.18)'` pour le backdrop. Cohérent avec ReviewSheet, ConseillerHistory etc.
17. `components/library/LibraryUploadSheet.tsx:170` — `background: 'rgba(251, 250, 247, 0.96)'` pour la sheet. Crème CF ✅.
18. `components/library/LibraryUploadSheet.tsx:171` — `boxShadow: '0 24px 60px rgba(0, 0, 0, 0.12)'`. Élevation contrôlée.
19. `components/library/LibraryUploadSheet.tsx:186` — `<input type="file">` non stylé : utilise le rendu natif browser. Drift Apple velvet — le button file natif est laid sur macOS/iOS. À envelopper dans un `<label>` stylé.
20. `components/library/LibraryUploadSheet.tsx:197` — couleur erreur `#C0392B` (idem drift palette).
21. `components/library/LibraryUploadSheet.tsx:218-220` — bouton "Annuler" : `padding 10px 18px`, `border-radius 22`, `background transparent`. Touch target ≥ 44 px (10 × 2 + texte ≈ 38 ... borderline). À vérifier visuellement.
22. `components/library/LibraryPreview.tsx:204-217` — bloc `<pre>` pour contenu post : `font-family var(--font-mono, ui-monospace, monospace)`. Affichage de JSON brut dans une preview est anti-doctrine (le pilote ne lit pas du JSON). Recalé hiroshi.
23. Aucune trace de `#1F4937` forest green dans l'ensemble du dossier `components/library/*`. ✅
24. Aucun gradient hardcodé. Aucune animation hors transitions 200 ms.
25. `components/library/LibraryView.tsx:222` — label item `fontSize: 14, fontWeight: 500` : sobre.

### Verdict : **Recalé partiel**

### Justification
La structure Liquid Glass, l'usage des tokens crème, les halos statiques, la segmented-control sont impeccables. Trois fautes : (1) couleur erreur `#C0392B` hardcodée au lieu du `#FF3B30` SF, (2) input file natif non stylé, (3) affichage de JSON brut en `<pre>` dans la preview Post — c'est une fuite de schéma DB dans une UI utilisateur.

### Recommandations
- **P0** : Stopper l'affichage de `JSON.stringify(data.contenu_genere)` dans `LibraryPreview.tsx:191-193`. Rendre proprement le `contenu_genere` typé (texte, slides carrousel, caption) ou afficher "Aperçu non disponible pour ce post".
- **P1** : Remplacer `#C0392B` par `var(--color-systemRed)` ou `#FF3B30` dans `LibraryPreview.tsx:108` et `LibraryUploadSheet.tsx:197`.
- **P1** : Styler l'input file de `LibraryUploadSheet.tsx:183-189` avec un pattern `<label>` custom + `<input type="file" hidden>` qui affiche le nom du fichier sélectionné dans un bloc velvet.
- **P2** : Remplacer `rgba(0, 0, 0, 0.02|0.03|0.04)` hardcodés par tokens `var(--color-fill-tertiary)` / `var(--color-fill-quaternary)`.
- **P2** : Retirer le doublon de subtitle "Tout ce que tu as, en un seul endroit." dans `LibraryView.tsx:71-83` (déjà dans `PageHeader`).

---

## Axe 2 — Elena (Architecture)

### Observations
1. `app/(outils)/outils/bibliotheque/page.tsx:13` — `export const dynamic = 'force-dynamic'`. Justifié (auth user + RLS-scoped data).
2. `app/(outils)/outils/bibliotheque/page.tsx:16-20` — auth check + redirect /login. Pattern standard, RLS implicite via `supabase.auth.getUser()`.
3. `app/(outils)/outils/bibliotheque/page.tsx:22` — `loadLibrary(supabase)` côté Server. Bonne séparation : data fetch Server, render Client.
4. `components/library/LibraryView.tsx:7` — `'use client'` correct (useState, useMemo).
5. `components/library/LibraryView.tsx:36-47` — `formatRelativeDate` côté client. OK pour affichage relatif (qui dépend de `Date.now()`).
6. `components/library/LibraryView.tsx:55-62` — `useMemo` pour le filtrage. Bonne pratique.
7. `components/library/LibraryPreview.tsx:14-15` — import `useState, useEffect`. ✅
8. `components/library/LibraryPreview.tsx:67-90` — `useEffect` pour signed URL fetch côté client. `cancelled` flag pour cleanup. Pattern correct.
9. `components/library/LibraryPreview.tsx:74` — `.createSignedUrl(data.file_path, 60 * 30)` — 30 minutes TTL. Acceptable pour preview, mais à documenter (un user qui laisse l'onglet 31 min verra "Lien indisponible" après refresh).
10. `components/library/LibraryUploadSheet.tsx:56` — `createLibraryDocument(fd)` Server Action invoquée. Pattern Server Action. ✅
11. `components/library/LibraryUploadSheet.tsx:60-61` — `router.refresh()` après succès. Bonne pratique pour invalider le cache RSC.
12. **DRIFT SCHÉMA pilier_nom vs pilier_id** : `lib/library/queries.ts:110` SELECT `pilier_nom` (legacy TEXT). `lib/library/queries.ts:124,135,146,147` manipule encore `pilier_nom`. `lib/library/types.ts:123` déclare `pilier_nom: string | null`. `components/library/LibraryPreview.tsx:198` consomme `data.pilier_nom`. Aucune trace de `pilier_id UUID FK` (Sprint 37.K F89). Confirmation : cette page est en retard sur la migration schéma. ❌
13. `lib/library/queries.ts` (non lu intégralement) : à vérifier — pas de SELECT * sauvage ? Le `'id, titre, type_contenu, pilier_nom, date_prevue, statut, contenu_genere, retombees, created_at'` ligne 110 est explicite ✅.
14. `components/library/LibraryView.tsx:65-67` — `selected` calculé via `useMemo`. Bon.
15. `components/library/LibraryView.tsx:52` — état initial `selectedId: items[0]?.id ?? null`. Acceptable mais si l'utilisateur change de tab et que `filtered.length > 0` mais `selectedId` ne matche aucun item filtré, la preview de droite affiche un item invisible dans la liste de gauche. Bug UX subtil.
16. `components/library/LibraryUploadSheet.tsx:46-69` — `handleSubmit` : try/catch + finally setPending. Pattern robuste.
17. `components/library/LibraryUploadSheet.tsx:53-55` — `fd.append('title', title.trim())` conditionnel sur non-vide. OK.
18. `components/library/LibraryUploadSheet.tsx:182-188` — `accept` mime types explicites pour PDF/DOCX/images. Pas de validation taille côté client (10 MB max annoncé ligne 138). La validation taille incombe à la Server Action. À vérifier dans `create-library-document.ts` (hors scope).
19. Pas de hook React dans le code Server. Pas de fuite client dans le Server. ✅
20. `components/library/LibraryView.tsx:26-34` — `TABS` typé `ReadonlyArray<LibraryTab>`. Type-safe.
21. `components/library/LibraryPreview.tsx:37-58` — `switch` exhaustif sur `preview.kind`. Default fallback en place.
22. `components/library/LibraryPreview.tsx:71` — `const supabase = createClient()` client-side dans `useEffect`. Crée un client Supabase Browser à chaque mount du composant Preview. Acceptable mais pourrait être lifté en provider context si la perf devient un sujet (chaque sélection re-instancie).

### Verdict : **Recalé partiel**

### Justification
La séparation Server/Client, l'auth, les Server Actions, le pattern signed URL sont solides. Le point dur est la persistance du legacy `pilier_nom TEXT` partout dans la chaîne library (query → type → render). Le drift schéma est isolé mais visible, et il faudra le résoudre avant d'introduire un éditeur de posts qui écrirait en `pilier_id` (sinon la bibliothèque affichera des posts sans pilier).

### Recommandations
- **P0** : Migrer `lib/library/queries.ts:110` du SELECT `pilier_nom` vers un JOIN sur `piliers` via `pilier_id`, retourner le nom via la relation. Migrer le type `lib/library/types.ts:123` et la consommation `LibraryPreview.tsx:198` en conséquence.
- **P1** : Documenter le TTL 30 min des signed URLs en commentaire `LibraryPreview.tsx:74` et éventuellement passer à 1h ou re-signer à la demande.
- **P1** : Corriger le bug subtle de `LibraryView.tsx:52` — quand `tab` change et `selectedId` n'est plus dans `filtered`, soit auto-select `filtered[0]?.id`, soit clear `selectedId`.
- **P2** : Lifter `createClient()` dans un context provider pour éviter une instanciation par sélection.
- **P2** : Ajouter une validation taille fichier côté client (file.size > 10 MB → erreur immédiate sans roundtrip Server Action).

---

## Axe 3 — Sarah (Copy)

### Observations
1. `app/(outils)/outils/bibliotheque/page.tsx:46` — titre "Bibliothèque" ✅.
2. `app/(outils)/outils/bibliotheque/page.tsx:47` — subtitle "Tout ce que tu as, en un seul endroit." Tutoiement direct, voix Floriane ✅.
3. `components/library/LibraryView.tsx:81` — "Tout ce que tu as, en un seul endroit." Doublon avec subtitle (point UI signalé).
4. `components/library/LibraryView.tsx:98` — bouton "Ajouter un document" : direct, sans jargon ✅.
5. `components/library/LibraryView.tsx:132-133` — placeholder "Rechercher dans la Bibliothèque" + aria-label idem ✅.
6. `components/library/LibraryView.tsx:172-173` — empty filtré : `Aucun résultat pour "${query}".` / `Aucun élément dans cette catégorie.` Voix sobre ✅.
7. `components/library/LibraryView.tsx:235-237` — `categoryLabel(it.category)` + `statusLabel(it.status)` + `formatRelativeDate(it.date)` : voir `lib/library/types.ts` pour les valeurs.
8. `components/library/LibraryView.tsx:271` — "Sélectionne un item pour le prévisualiser." Tutoiement ✅. Mot "item" = anglicisme. Préférer "élément" ou "document".
9. `components/library/LibraryUploadSheet.tsx:127` — "Ajouter un document" ✅.
10. `components/library/LibraryUploadSheet.tsx:138` — "PDF / DOCX / PNG / JPG / JPEG / WEBP. 10 MB maximum." Direct, technique mais nécessaire pour l'utilisateur.
11. `components/library/LibraryUploadSheet.tsx:143` — "Titre (optionnel)" ✅.
12. `components/library/LibraryUploadSheet.tsx:148` — "Auto-rempli depuis le nom du fichier" tutoiement absent (impersonnel). Préférer "Si tu n'en mets pas, on prend le nom du fichier."
13. `components/library/LibraryUploadSheet.tsx:161` — "Une note pour te rappeler pourquoi tu as gardé ce document." Voix Floriane parfaite ✅.
14. `components/library/LibraryUploadSheet.tsx:167` — "Catégorie" ✅.
15. `components/library/LibraryUploadSheet.tsx:182` — "Fichier" ✅.
16. `components/library/LibraryUploadSheet.tsx:237` — "Ajout…" / "Ajouter" pour bouton submit. OK.
17. `components/library/LibraryUploadSheet.tsx:312` — "Annuler" ✅.
18. `components/library/LibraryPreview.tsx:108` — "Lien indisponible." sobre.
19. `components/library/LibraryPreview.tsx:110` — "Chargement…" sobre ✅.
20. `components/library/LibraryPreview.tsx:148` — "Aperçu DOCX non rendu en navigateur. Télécharge le fichier pour le consulter." Tutoiement ✅.
21. `components/library/LibraryPreview.tsx:149` — "Aperçu non rendu pour ce type de fichier. Télécharge pour voir." Tutoiement ✅.
22. `components/library/LibraryPreview.tsx:157` — "Télécharger" ✅.
23. `components/library/LibraryPreview.tsx:201` — "Publié le {data.date_prevue}" ✅.
24. Vocabulaire interdit : aucune occurrence de "users", "audience", "dashboard", "workflow", "viral", "boost", "growth", "feature", "engagement", "métrique", "KPI", "stats", "analytics", "performance" dans `components/library/*`.
25. `app/(outils)/outils/bibliotheque/page.tsx:47` — breadcrumb mentionne "Outils" et pas "Mes Outils". Vérification : `breadcrumb={["Aujourd'hui", { label: 'Outils', href: '/outils' }, 'Bibliothèque']}`. Le possessif "Mes Outils" est utilisé ailleurs (cf. post-creator). Incohérence nav.

### Verdict : **Recalé partiel**

### Justification
Voix Floriane impeccable sur 90 % des messages. Trois fautes : (1) "Outils" sans possessif "Mes" dans le breadcrumb contredit le pattern utilisé sur les pages post-creator, (2) "item" anglicisme à remplacer par "élément", (3) "Auto-rempli depuis le nom du fichier" en mode impersonnel rompt le tutoiement systématique.

### Recommandations
- **P0** : Remplacer `{ label: 'Outils', href: '/outils' }` par `{ label: 'Mes Outils', href: '/outils' }` dans `app/(outils)/outils/bibliotheque/page.tsx:47`. Cohérence nav doctrine.
- **P1** : Remplacer "item" par "élément" dans `LibraryView.tsx:271` (`Sélectionne un élément pour le prévisualiser`).
- **P1** : Remplacer "Auto-rempli depuis le nom du fichier" par "Si tu n'en mets pas, on prend le nom du fichier" dans `LibraryUploadSheet.tsx:148`. Tutoiement systématique.
- **P2** : Retirer le doublon subtitle (`LibraryView.tsx:81`).

---

## Axe 4 — Marcus (Workflow)

### Observations
1. `components/library/LibraryView.tsx:69-101` — empty state avant tout filtre : juste un texte + le bouton "Ajouter un document". Friction minimale ✅.
2. `components/library/LibraryView.tsx:162-174` — empty state filtré bien différencié (avec ou sans query). ✅
3. `components/library/LibraryView.tsx:88-100` — bouton "Ajouter un document" en position top-right de la zone, accessible sans scroll.
4. `components/library/LibraryUploadSheet.tsx:56-60` — `handleClose` désactivé si `pending`. Bonne protection contre double-submit / close pendant upload.
5. `components/library/LibraryUploadSheet.tsx:148` — backdrop cliquable pour fermer (`onClick={handleClose}`). Pattern modal Apple.
6. `components/library/LibraryUploadSheet.tsx:230-237` — bouton submit disabled pendant pending. Loading text "Ajout…" ✅.
7. `components/library/LibraryUploadSheet.tsx:191-203` — affichage d'erreur dans la sheet, `role="alert"` ✅.
8. `components/library/LibraryUploadSheet.tsx:64-65` — try/catch global avec message extraction. Gestion d'erreur complète.
9. `components/library/LibraryPreview.tsx:107-110` — états de chargement / erreur sur la preview document. ✅
10. `components/library/LibraryPreview.tsx:67-90` — cleanup `cancelled` dans useEffect : évite les race conditions si l'utilisateur change rapidement d'item sélectionné.
11. `components/library/LibraryUploadSheet.tsx:189` — file input natif : touch target invisible (largeur dépend du browser/OS). Sur iOS, le file picker natif est OK ; sur desktop, bouton minuscule. UX dégradée.
12. `components/library/LibraryView.tsx:212-242` — `<button>` pour chaque row : touch target ~58 px hauteur. ✅ ≥ 44px.
13. `components/library/LibraryUploadSheet.tsx:216-228` — bouton "Annuler" : 10 + 10 + texte ≈ 38 px. **< 44 px.** Touch target sous le seuil.
14. `components/library/LibraryView.tsx:148-160` — `segmented-control` : touch target dépend de la classe globale. À vérifier hors scope.
15. `components/library/LibraryUploadSheet.tsx:46-49` — pas de validation côté client avant submit (taille, type vraiment supporté). Le bouton Submit est disabled seulement si `!file`. Si user uploade un .exe renommé .pdf, l'erreur n'apparaît qu'après round-trip Server Action.
16. Confirmation destructrice : aucune destruction depuis cette page (V1 lecture + upload uniquement). ✅
17. `components/library/LibraryView.tsx:53` — état `sheetOpen` géré localement. Bonne séparation.
18. `components/library/LibraryUploadSheet.tsx:230` — `disabled={pending || !file}` : critère minimum. Si l'utilisateur change la catégorie mais oublie de joindre un fichier, le bouton reste disabled : feedback implicite mais correct.
19. Navigation prévisible : breadcrumb 3 niveaux fonctionnel, retour `/outils` clair.
20. Pas de pagination ni de virtualisation sur la liste : si la bibliothèque dépasse 100+ items, la liste devient longue. Pas un blocker V1 mais à surveiller.

### Verdict : **Recalé partiel**

### Justification
La gestion d'erreur, le cleanup, les states pending sont robustes. Deux fautes : (1) bouton "Annuler" sous 44 px, (2) input file natif non stylé donne un UX dégradé sur desktop. Le filtrage / recherche est instantané sans loading state (acceptable pour une liste en mémoire).

### Recommandations
- **P0** : Augmenter le padding du bouton "Annuler" de `10px 18px` à `12px 20px` (minimum) ou `14px 22px` dans `LibraryUploadSheet.tsx:218-220` pour atteindre 44 px de haut.
- **P1** : Custom file input dans `LibraryUploadSheet.tsx:182-189` : pattern label/input hidden + zone drop + affichage du nom de fichier sélectionné.
- **P1** : Validation côté client de la taille `file.size > 10 * 1024 * 1024` → erreur immédiate sans round-trip.
- **P2** : Pagination ou virtualisation si > 100 items en liste (différable).

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. La Bibliothèque est l'incarnation produit de la skill TF Archives & Mémoire (Élise M.) — espace centralisé où la marque retrouve tout ce qu'elle a uploadé + tout ce qu'elle a produit (posts, conversations, reviews, programmes). Doctrine respectée à la lettre.
2. `app/(outils)/outils/bibliotheque/page.tsx:46-47` — titre "Bibliothèque" + subtitle "Tout ce que tu as, en un seul endroit." → narration "mémoire totale de la marque" Floriane.
3. `components/library/LibraryView.tsx:26-34` — TABS : `all | brand-book | document | post | conversation | review | programme` — couvre les 6 types d'artefacts d'une marque CF.
4. Aucun mécanisme de gamification : pas de "tu as ajouté 10 documents", pas de progression, pas de level-up. ✅
5. `components/library/LibraryPreview.tsx` — preview riche par type, mais l'item Post affiche son `pilier_nom` (legacy) et un `contenu_genere` en JSON brut. Drift schéma + drift doctrine "le pilote ne lit pas du JSON".
6. **Citation anchor "tableau de bord simple et efficace, contrôle, pilote"** — la Bibliothèque est précisément cet outil de contrôle : recherche, filtre, preview, action. Doctrine incarnée.
7. **Tranquillité narrative** : aucune notification, aucun nudge, aucune sollicitation. ✅
8. **6 promesses CF** : la promesse "Tu retrouves tout ce que tu as fait" est honorée (sauf que la preview Post montre du JSON, ce qui rompt la promesse implicite de "lecture humaine").
9. **Phase 1 / Phase 2** : la Bibliothèque est transverse aux deux phases — elle stocke les anecdotes (Phase 1) et les programmes (Phase 2). Cohérent.
10. **Trilogie Organique/Outreach/Libre** : non discriminée dans la Bibliothèque (un document est un document, pas un canal). OK.
11. **Drift doctrine connue** (skills/00-CONCEPT.md, etc.) : le forest green `#1F4937` n'apparaît nulle part dans `components/library/*` ni dans `app/(outils)/outils/bibliotheque/*`. La nav 4 sans `/outils` distinct n'a pas d'impact ici car la page est sous `/outils`. ✅
12. `components/library/LibraryView.tsx:97` — bouton "Ajouter un document" : seule action destructrice/constructive. Sobre, pas de "Upload now!" ✅.
13. Aucun ton de marketing SaaS. Aucune mention de "value", "ROI", "engagement". ✅
14. Le subtitle "Tout ce que tu as, en un seul endroit." est une promesse Floriane parfaite — elle ne promet pas la performance, elle promet la mémoire.
15. `components/library/LibraryUploadSheet.tsx:161` — "Une note pour te rappeler pourquoi tu as gardé ce document." → tutoiement + posture archiviste (Élise M.). Doctrine.

### Verdict : **Recalé partiel**

### Justification
La Bibliothèque est l'outil le plus doctrinalement aligné des outils sub-pages : mémoire totale, tutoiement, sobriété, zéro gamification. Le seul accroc doctrine est l'affichage JSON brut du `contenu_genere` Post (`LibraryPreview.tsx:204-217`) qui rompt la promesse "le pilote n'a pas à lire du JSON".

### Recommandations
- **P0** : Rendre proprement le `contenu_genere` Post selon son type : texte simple, slides carrousel, caption ; jamais `JSON.stringify` (`LibraryPreview.tsx:189-220`).
- **P1** : Ajouter un tag "Phase 1" / "Phase 2" sur les items Programme pour aider le pilote à se repérer dans sa propre temporalité doctrine.
- **P2** : Préparer V2 RAG + attachement chat conseiller (déjà reporté Sprint 38) — cohérent avec la promesse Archives & Mémoire transverse.

---

## Synthèse de la page

### Verdicts cumulés
| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé partiel |
| Elena Archi | ❌ Recalé partiel |
| Sarah Copy | ❌ Recalé partiel |
| Marcus Workflow | ❌ Recalé partiel |
| Hélène Doctrine | ❌ Recalé partiel |

### Top fixes priorisés

- **P0** :
  1. Migrer `lib/library/queries.ts:110`, `lib/library/types.ts:123`, `components/library/LibraryPreview.tsx:198` du legacy `pilier_nom TEXT` vers `pilier_id UUID FK` + JOIN piliers (Sprint 37.K F89 sync).
  2. Stopper `JSON.stringify(data.contenu_genere)` dans `LibraryPreview.tsx:191-193` : rendu propre selon type ou message "Aperçu non disponible".
  3. Remplacer `{ label: 'Outils' }` par `{ label: 'Mes Outils' }` dans `app/(outils)/outils/bibliotheque/page.tsx:47`.
  4. Augmenter padding bouton "Annuler" pour atteindre 44 px (`LibraryUploadSheet.tsx:218-220`).

- **P1** :
  1. Remplacer `#C0392B` par `#FF3B30` / `var(--color-systemRed)` (`LibraryPreview.tsx:108`, `LibraryUploadSheet.tsx:197`).
  2. Custom file input avec label/input hidden + drop zone (`LibraryUploadSheet.tsx:182-189`).
  3. Validation taille fichier côté client avant submit.
  4. Remplacer "item" par "élément" (`LibraryView.tsx:271`).
  5. Tutoiement "Si tu n'en mets pas, on prend le nom du fichier" (`LibraryUploadSheet.tsx:148`).
  6. Documenter TTL signed URLs 30 min (`LibraryPreview.tsx:74`).
  7. Corriger sélection orpheline quand tab change (`LibraryView.tsx:52`).

- **P2** :
  1. Tokens `var(--color-fill-tertiary)` pour les `rgba(0, 0, 0, 0.03)` hardcodés.
  2. Retirer doublon subtitle (`LibraryView.tsx:81`).
  3. Lifter `createClient()` en context provider.
  4. Pagination/virtualisation > 100 items.
  5. Tag Phase 1/Phase 2 sur les items Programme.

### Verdict global page
**Recalé partiel** — Bibliothèque est doctrinalement la page la plus alignée mais la dette technique (legacy `pilier_nom`, JSON.stringify en UI) la fait tomber sous le seuil "Validé". À corriger en priorité avant la V2 RAG.
