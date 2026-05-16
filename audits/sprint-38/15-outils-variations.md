# Page : /outils/variations

## Métadonnées
- Route : `/outils/variations`
- Fichier source : `app/(outils)/outils/variations/page.tsx` (19 lignes — STUB identique à Moodboard)
- Composants liés : aucun (rendu hardcodé inline). Mockup catalogue : `components/outils/ToolMockup.tsx:155-196` (`VariationsMockup` : 1 source + 4 dérivés gradients bleus).
- Server / Client : Server Component pur, sans auth ni data.
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise pour la nav, page elle-même sans auth check)

## Lecture rapide
Page stub Sprint 35 strictement identique à Moodboard : `<main>` + `<h1>Variations</h1>` et rien d'autre. Aucun PageHeader, aucun halos, aucune auth. Le mockup catalogue (`VariationsMockup`) suggère un outil de déclinaison visuelle (1 source → 4 dérivés) cohérent avec la doctrine "1 anecdote → 1 post organique + 1 ad + 1 newsletter" (déclinaison cross-canal). Aucune implémentation.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. `app/(outils)/outils/variations/page.tsx:5` — `<main style={{ minHeight: '100vh', padding: 'var(--space-12) var(--space-5)' }}>` : tokens v60 ✅.
2. `app/(outils)/outils/variations/page.tsx:7-13` — `<h1>` tokens v60 stricts (font-size, font-weight 700, letter-spacing, color label). ✅
3. Aucun halo statique. Incohérence avec bibliotheque/reviews/messages.
4. Aucun `<PageHeader>` ni breadcrumb.
5. Aucun `background: var(--color-background)` explicite.
6. Aucun Liquid Glass, aucun `glass-thin`.
7. Aucune trace de `#1F4937`. ✅
8. Aucun composant interactif. Touch targets trivialement OK.
9. `components/outils/ToolMockup.tsx:159-167` — mockup source : gradient bleu `#BDD7EE → #6FA8DC`. Pastel v60.
10. `components/outils/ToolMockup.tsx:170-180` — badge "Source" overlay : `background rgba(255, 255, 255, 0.85)`, `border-radius 4`, `padding 2px 6px`. Sobre.
11. `components/outils/ToolMockup.tsx:183-191` — grille 2×2 dérivés en gradients bleus monochromes : cohérence palette. Bonne illustration "déclinaisons à partir d'une source".

### Verdict : **Recalé**

### Justification
Idem Moodboard : page muette sans chrome v60. Tokens du h1 corrects, mais l'absence totale de halos, PageHeader, fond `var(--color-background)` rend la page invisible / incohérente.

### Recommandations
- **P0** : Réécrire sur le pattern `messages/page.tsx` : auth + halos + PageHeader + breadcrumb + carte placeholder velvet + CTA conseiller.
- **P1** : Réutiliser le mockup `<VariationsMockup>` (source + 4 dérivés) dans le placeholder pour aider le pilote à visualiser l'intention produit.
- **P2** : Documenter le statut "reporté" en commentaire.

---

## Axe 2 — Elena (Architecture)

### Observations
1. `app/(outils)/outils/variations/page.tsx:3` — Server Component sans hook. Trivial.
2. Aucune auth check. Page publique.
3. Aucun `export const dynamic`. Statique.
4. Aucune Server Action, aucune query, aucune table DB.
5. Commentaire ligne 1 : "Stub Pilier 6 strict" + "L'intégration v1 ou refonte Apple-strict est en attente Sprint 36". Sprint 36/37 passés, Sprint 38 en cours — dette non rattrapée.
6. Pas de schéma DB envisagé documenté. À probable créer (`variations`, `variation_sources`, `variation_outputs`).
7. Pas de RLS, pas de `tenant_id`.
8. **Lien doctrine non encodé** : Variations est censé incarner la déclinaison cross-canal du programme IG vers LinkedIn/Newsletter/Site/GMB (skill `cfs-channels-task-force`). Aucun lien architectural avec les Channels.

### Verdict : **Recalé**

### Justification
Stub vide non évolué. Aucune piste de schéma, aucune Server Action, aucun lien avec la skill `cfs-channels-task-force`. Dette intégrale.

### Recommandations
- **P0** : Décider statut V1/V2 (cf. Moodboard).
- **P1** : Si V1 prévu Sprint 38, documenter schéma `variations` + lien avec les canaux adjacents (LinkedIn, Newsletter, Site, GMB). Préparer `app/_actions/variations/` stubs.
- **P2** : Documenter le pipeline conceptuel "1 source → N dérivés canal" pour cadrer la doctrine architecture.

---

## Axe 3 — Sarah (Copy)

### Observations
1. `app/(outils)/outils/variations/page.tsx:15` — un seul texte : "Variations". Mot français OK, suffisamment précis.
2. Aucun subtitle, aucune description, aucun CTA.
3. Aucun vocabulaire interdit (par absence).
4. Aucun tutoiement. Aucune voix Floriane.
5. Aucun breadcrumb : pas d'occurrence "Mes Outils".

### Verdict : **Recalé**

### Justification
Pas de copy → pas de voix Floriane. Même reproche que Moodboard : le pilote arrive sur une page sans message d'accueil, sans promesse, sans sortie.

### Recommandations
- **P0** : Ajouter un message Floriane minimum (titre + 1 phrase de promesse + 1 phrase fallback).
- **P1** : Formuler la promesse Variations : "À partir d'un post, on génère ses déclinaisons pour LinkedIn, ta newsletter, ton site." (ou équivalent doctrine `cfs-channels-task-force`).
- **P2** : Vérifier que "Variations" sonne Floriane (vs alternatives "Déclinaisons", "Multi-canal").

---

## Axe 4 — Marcus (Workflow)

### Observations
1. Aucun état (loading/error/empty) — trivial.
2. Aucune action utilisateur. Aucun feedback.
3. Aucune confirmation destructrice.
4. Aucun touch target.
5. Navigation : retour `/outils` via nav globale uniquement. Pas de breadcrumb.
6. État vide non géré : la page entière est un empty state silencieux.

### Verdict : **Recalé**

### Justification
Identique à Moodboard. Le pilote qui clique "Variations" depuis `/outils` ne sait pas pourquoi l'outil ne fonctionne pas.

### Recommandations
- **P0** : Placeholder doctrine avec CTA fallback conseiller.
- **P1** : Breadcrumb 3 niveaux.
- **P2** : Mocker l'écran cible V1 (source à gauche, dérivés à droite — réutiliser `<VariationsMockup>` étendu).

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. **Place doctrine** : Variations est l'outil produit qui sert la skill `cfs-channels-task-force` (Camille O., Bruno A.). Déclinaison du programme IG sur les 4 canaux adjacents V1 (LinkedIn, Newsletter, Site web, GMB). Aucun lien explicite dans le code.
2. **Doctrine 12 mai 2026** : la déclinaison cross-canal est explicitement V1. Variations devrait donc être un outil V1, pas un stub.
3. La doctrine refuse TikTok/X/YouTube/Facebook organique en V1. Le composant Variations doit donc se limiter aux 4 canaux validés.
4. **Trilogie Organique/Outreach/Libre** : Variations opère sur l'Organique en sortie (le canal IG est la source) et alimente les 3 autres canaux structurés.
5. Aucune gamification. ✅
6. Aucune trace `#1F4937`. ✅
7. **Citation anchor "tableau de bord simple et efficace"** — un outil Variations livré tiendrait directement cette promesse (1 post → N adaptations sans repenser à chaque fois). Doctrine non incarnée.
8. **Tranquillité narrative** : pas de bruit. ✅ (par absence).
9. **6 promesses CF** : aucune tenue à date.
10. **Cohérence avec Mon Programme** : un programme 3 mois sur IG (Phase 2) devrait pouvoir être décliné automatiquement vers les 4 canaux via Variations. Sans Variations, le pilote doit refaire le programme manuellement par canal.

### Verdict : **Recalé**

### Justification
Variations est un outil V1 selon la doctrine (déclinaison cross-canal explicitement scope V1 `cfs-channels-task-force`). Le stub est donc une dette produit doctrine : la promesse "Tu fais ton programme IG, on décline pour LinkedIn/Newsletter/Site/GMB" n'est tenue nulle part.

### Recommandations
- **P0** : Faire trancher Hélène + Camille O. (TF Channels) : Variations est-il V1 Sprint 38 ou différé ? Si V1, prioriser implémentation. Si différé, placeholder doctrine cohérent.
- **P1** : Documenter explicitement les 4 canaux adjacents V1 dans la doctrine de la page (LinkedIn / Newsletter / Site / GMB) pour bloquer toute tentative future d'ajouter TikTok/X/YouTube/Facebook.
- **P2** : Lier le pipeline Variations au pipeline Mon Programme (Phase 2) : un programme 3 mois doit déclencher la génération de variations sur chaque canal validé.

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
  1. **Décision Hélène + Camille O.** : Variations V1 Sprint 38 ou différé V2 ? Selon la doctrine `cfs-channels-task-force`, c'est V1.
  2. Si différé : placeholder doctrine cohérent `messages/page.tsx` pattern (auth + halos + PageHeader + carte velvet + CTA conseiller).
  3. Si V1 Sprint 38 : prioriser implémentation, documenter schéma `variations` + Server Actions + RLS `tenant_id`.

- **P1** :
  1. Formuler la promesse Floriane : "À partir d'un post IG, on prépare ses déclinaisons pour LinkedIn, ta newsletter, ton site et ta fiche GMB."
  2. Lier au pipeline Mon Programme (Phase 2).
  3. Documenter le verrou doctrine : V1 = 4 canaux uniquement (LinkedIn / Newsletter / Site / GMB), refus TikTok/X/YouTube/Facebook.

- **P2** :
  1. Mocker l'écran cible V1.
  2. Préparer `app/_actions/variations/` stubs.
  3. Vérifier que "Variations" est le bon mot Floriane (vs "Déclinaisons").

### Verdict global page
**Recalé** — Stub Sprint 35 jamais rattrapé. Variations est un outil V1 selon la doctrine `cfs-channels-task-force` mais reste un trou. Priorité Sprint 38 ou décision explicite de report V2 avec placeholder doctrine.
