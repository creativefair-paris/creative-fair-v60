# Page : /outils/moodboard

## Métadonnées
- Route : `/outils/moodboard`
- Fichier source : `app/(outils)/outils/moodboard/page.tsx` (19 lignes — STUB)
- Composants liés : aucun (rendu hardcodé inline). Mockup catalogue : `components/outils/ToolMockup.tsx:134-151` (`MoodboardMockup`, 9 swatches gradients pastels).
- Server / Client : Server Component pur, sans auth ni data.
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise pour la nav, page elle-même sans auth check)

## Lecture rapide
Page stub Sprint 35 : un `<main>` + un `<h1>Moodboard</h1>` et rien d'autre. Aucune intégration v1, aucun composant, aucune auth, aucun PageHeader, aucun breadcrumb, aucun halos. La page est complètement inerte. Le mockup catalogue `<MoodboardMockup>` (9 swatches pastel) suggère une intention produit (palette / mood visuelle) mais aucune trace d'implémentation. Statut produit V60 : reporté.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. `app/(outils)/outils/moodboard/page.tsx:5` — `<main style={{ minHeight: '100vh', padding: 'var(--space-12) var(--space-5)' }}>` : tokens v60 utilisés. ✅
2. `app/(outils)/outils/moodboard/page.tsx:7-13` — `<h1>` : `fontSize var(--text-large-title-size)`, `fontWeight 700`, `letterSpacing var(--text-large-title-tracking)`, `color var(--color-label)`. Tokens v60 stricts. ✅
3. Aucun halo (`bg-halo-*` absent). Incohérence avec bibliotheque, reviews, messages, conseiller (toutes ces pages utilisent les halos statiques). La page est visuellement nue.
4. Aucun `PageHeader`. Incohérence avec le reste de l'app (chaque page outils utilise `<PageHeader>` avec breadcrumb).
5. Aucun `background: var(--color-background)` explicite. La page hérite du layout parent. À vérifier visuellement.
6. Aucun Liquid Glass, aucun `glass-thin`, aucun composant velvet. Page entièrement vide.
7. Aucune trace de `#1F4937` forest green. ✅ (par absence de code).
8. Aucun composant interactif → aucun touch target < 44 px → trivialement OK.
9. `components/outils/ToolMockup.tsx:121-132` — `MOODBOARD_SWATCHES` : 9 gradients pastels (bleu, vert, beige, lilas, rose, bleu pâle, jaune, vert d'eau, orange). Palette pastel cohérente v60.
10. `components/outils/ToolMockup.tsx:138-149` — grid 3×3 swatches dans le mockup, `gap: 6`, aspectRatio 1/1. Mini-rendu lisible.

### Verdict : **Recalé**

### Justification
La page est un stub muet — pas de halos, pas de PageHeader, pas de breadcrumb, pas de fond `var(--color-background)`. Comparée aux autres pages outils (bibliotheque, reviews, messages), Moodboard est l'enfant pauvre. Les tokens utilisés sur le seul h1 sont corrects, mais l'absence totale de chrome de page rompt la cohérence v60.

### Recommandations
- **P0** : Réécrire la page sur le pattern bibliotheque/reviews/messages : auth check, halos statiques, `<PageHeader>` avec breadcrumb 3 niveaux, `cfs-page-container`, fond `var(--color-background)`. Même si le contenu reste "Cet outil arrive bientôt", le chrome doit être cohérent.
- **P1** : Ajouter un composant placeholder qui réutilise le mockup `<MoodboardMockup>` du catalogue avec un message "Cet outil arrive bientôt".
- **P2** : Documenter dans un commentaire le statut "reporté V2 ou Sprint 38+".

---

## Axe 2 — Elena (Architecture)

### Observations
1. `app/(outils)/outils/moodboard/page.tsx:3` — `export default function MoodboardPage()` : Server Component (pas de `'use client'`, pas de hook). Trivialement correct.
2. Aucune auth check (`supabase.auth.getUser()`). La page est accessible publiquement. **Incohérence** : bibliotheque, reviews, messages exigent toutes l'auth. Si Moodboard reste public sans data sensible, OK ; si la V1 doit charger des moodboards user-specific, il faudra ajouter l'auth.
3. Aucun `export const dynamic = 'force-dynamic'`. Acceptable car la page est complètement statique — Next la SSG-era. Mais incohérent avec les autres pages outils.
4. Aucune Server Action, aucune query, aucune table DB référencée. Page sans état serveur.
5. Aucun composant tiers importé. Zéro dépendance.
6. Aucun hook dans Server. Trivial.
7. Le commentaire ligne 1 indique "Stub Pilier 6 strict" + "L'intégration v1 ou refonte Apple-strict est en attente Sprint 36". Sprint 36 est passé, Sprint 37 aussi, on est à Sprint 38 — la dette n'a pas été rattrapée.
8. Pas de schéma DB pour Moodboard documenté. Probablement à créer (`moodboards`, `moodboard_swatches`, `moodboard_images` ?).
9. Pas de RLS, pas de `tenant_id`. À prévoir dès qu'un schéma existera.

### Verdict : **Recalé**

### Justification
Stub vide qui n'a pas évolué depuis Sprint 35. La dette architecture (auth, data model, Server Actions) n'a même pas été ébauchée. La page existe pour réserver l'URL mais ne participe à aucun pipeline produit. Recalé non pour faute technique mais pour absence totale de progression.

### Recommandations
- **P0** : Décider si Moodboard reste reporté (alors transformer en `redirect('/outils')` 308 comme `post-creator/page.tsx`) ou s'il devient un placeholder doctrine cohérent avec `messages/page.tsx` (auth + PageHeader + "Cet outil arrive bientôt").
- **P1** : Documenter le schéma DB envisagé (`moodboards`, `moodboard_items` avec `tenant_id`, RLS, types) avant tout commencement d'implémentation.
- **P2** : Préparer un répertoire `app/_actions/moodboard/` avec stubs si Sprint 38 vise une implémentation.

---

## Axe 3 — Sarah (Copy)

### Observations
1. `app/(outils)/outils/moodboard/page.tsx:15` — un seul texte : "Moodboard". Mot anglicisé largement adopté en industrie créative. Acceptable mais à documenter dans le glossaire doctrine.
2. Aucun subtitle, aucune description, aucun call-to-action. Aucune voix Floriane n'est exprimée.
3. Aucun vocabulaire interdit (par absence de texte).
4. Aucun tutoiement, aucune posture (par absence de texte).
5. Aucun breadcrumb : pas d'occurrence "Mes Outils".

### Verdict : **Recalé**

### Justification
Pas de copy à juger → mais l'absence de copy est elle-même une faute Sarah : aucune voix Floriane n'accueille le pilote sur cette page. Comparé à Messages ("Cet outil arrive bientôt. Il te permettra de gérer tes DM clients..."), Moodboard est muet.

### Recommandations
- **P0** : Ajouter un message Floriane minimum : titre + 1 phrase de promesse + 1 phrase de fallback (renvoi conseiller ou bibliothèque). Pattern exact que `messages/page.tsx:78-91`.
- **P1** : Définir la promesse produit de Moodboard pour la doctrine — qu'est-ce que ça fait exactement ? Palette ? Inspirations photo ? Brand book visuel ?
- **P2** : Documenter "Moodboard" dans le glossaire doctrine (anglicisme assumé).

---

## Axe 4 — Marcus (Workflow)

### Observations
1. Aucun loading state, aucun error state. Trivial (rien à charger).
2. Aucun friction point : la page se charge instantanément, le pilote voit un titre et rien d'autre.
3. Aucune action utilisateur possible. Aucun feedback à fournir.
4. Aucune confirmation destructrice. Trivial.
5. Aucun touch target.
6. Navigation : la page est atteignable depuis `/outils` (via `OutilsCatalog`). Retour vers `/outils` via la nav globale. Pas de breadcrumb pour faciliter le retour contextuel.
7. État vide / empty state : la page entière EST un empty state non géré. Le pilote ne sait pas si la page est bugguée, en cours de chargement, ou simplement vide.

### Verdict : **Recalé**

### Justification
Le pilote qui clique sur "Moodboard" depuis `/outils` arrive sur une page muette. Aucun signal "outil pas encore disponible", aucun chemin de sortie clair vers le conseiller ou la bibliothèque. UX désertée.

### Recommandations
- **P0** : Au minimum, état vide expliqué + CTA fallback conseiller (pattern messages/page.tsx).
- **P1** : Breadcrumb 3 niveaux "Aujourd'hui > Mes Outils > Moodboard" pour faciliter le retour navigation.
- **P2** : Si Sprint 38 prévoit une V1, mocker l'écran cible (palette + 3-5 cartes inspirations) pour valider le workflow avant code.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. **Place doctrine** : Moodboard est cité dans le mockup catalogue (`ToolMockup.tsx:134-151`) avec 9 swatches pastel. C'est suggéré comme un outil de palette / direction visuelle de marque.
2. **Cohérence skills** : la skill `cfs-creation-visuelle-task-force` (Antoine F., Iris L.) couvre la création visuelle premium. Un Moodboard serait l'amorce visuelle de cette task force — espace où le pilote pose ses inspirations avant de briefer un photographe / un AD.
3. La doctrine 12 mai 2026 n'évoque pas explicitement Moodboard dans la liste centrale d'outils. À clarifier avec Hélène : Moodboard fait-il partie du V1 ou est-il reporté V2 ?
4. Aucune gamification. ✅ (par absence de code).
5. Aucune trace de `#1F4937`. ✅
6. **Citation anchor "tableau de bord simple et efficace"** — un Moodboard inerte ne contribue ni au contrôle, ni au pilotage. Il est juste là. Doctrine non incarnée.
7. **Tranquillité narrative** : pas de bruit, pas de nudge. ✅ (par absence).
8. **Phase 1 / Phase 2** : à clarifier si Moodboard appartient à Phase 0 (positionnement) ou Phase 1 (anecdotique) ou Phase 2 (programme).
9. **Trilogie Organique/Outreach/Libre** : Moodboard est en amont des trois, c'est un outil de direction artistique.
10. **6 promesses CF** : aucune n'est tenue par cette page actuelle.

### Verdict : **Recalé**

### Justification
La doctrine ne dit rien d'explicite sur Moodboard dans la spec mai 2026 — c'est un trou à clarifier. En l'état, la page existe pour réserver l'URL sans tenir aucune promesse. Si Hélène décide que Moodboard est V2 ou hors V1, la page doit l'expliciter ("Cet outil arrive bientôt") ou disparaître. Si Moodboard est V1, il doit être livré.

### Recommandations
- **P0** : Faire trancher Hélène sur le statut Moodboard V1 / V2 / hors scope. Si V2, transformer la page en placeholder doctrine cohérent (`messages/page.tsx` pattern). Si hors scope, supprimer la route et la carte du catalogue.
- **P1** : Si V1 est conservé, définir la promesse fonctionnelle de Moodboard — palette de couleurs marque ? bibliothèque d'inspirations photo ? rendu visuel des piliers ?
- **P2** : Documenter le lien avec la skill `cfs-creation-visuelle-task-force` (qui pourrait coordonner la production d'un brief moodboard).

---

## Synthèse de la page

### Verdicts cumulés
| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé |
| Elena Archi | ❌ Recalé |
| Sarah Copy | ❌ Recalé |
| Marcus Workflow | ❌ Recalé |
| Hélène Doctrine | ❌ Recalé |

### Top fixes priorisés

- **P0** :
  1. **Décision Hélène** : Moodboard V1 / V2 / hors scope ? Sans cette décision, la page est un trou.
  2. Si V2 / reporté : réécrire en placeholder doctrine sur le pattern exact de `messages/page.tsx` (auth + halos + PageHeader + breadcrumb + carte "Cet outil arrive bientôt" + CTA conseiller).
  3. Si hors scope : supprimer la route + retirer la carte de `OutilsCatalog`.

- **P1** :
  1. Définir la promesse fonctionnelle Moodboard pour pouvoir trancher V1/V2.
  2. Documenter le schéma DB envisagé (`moodboards`, RLS `tenant_id`).
  3. Breadcrumb 3 niveaux "Mes Outils > Moodboard" si la page est conservée.

- **P2** :
  1. Préparer `app/_actions/moodboard/` stubs.
  2. Mocker l'écran cible pour valider workflow.
  3. Documenter "Moodboard" dans le glossaire doctrine.

### Verdict global page
**Recalé** — Stub Sprint 35 jamais rattrapé. La page existe mais ne tient aucune promesse, n'a aucune cohérence v60, et bloque la doctrine sur sa propre identité produit. À transformer en placeholder doctrine ou à supprimer.
