# Creative Fair — Voice Sheet v2.0

> Règles éditoriales de Creative Fair.
> Couvre toutes les copies utilisateur, prompts IA, communication produit, marketing.
> Mis à jour le 21 mai 2026 (Sprint 39).

---

## 1. La source de vérité technique

Les règles de voix sont implémentées dans **`lib/ai/prompts/system.ts`** sous la constante `VOICE_SHEET_RULES`.

Ce fichier est **SACRÉ**. Il est injecté avec `cache_control: { type: 'ephemeral' }` dans tous les system prompts (Hélène, Experts, génération de posts, suggestions). **Le modifier casse le cache Anthropic à 90%** — perte massive d'argent + régression qualité immédiate.

Toute modification de `system.ts` passe par un Sprint dédié et une validation Lead explicite.

Le présent document est la **doctrine humaine** de ces règles. Il sert de référence pour les rédacteurs (UI copy, marketing, doc), pour les revues d'audit, et pour comprendre ce que `system.ts` impose à l'IA.

---

## 2. Les trois principes fondateurs

**1. Sentence case partout.** Pas de title case. Pas de capitales décoratives. Une phrase commence par une majuscule, les noms propres prennent une majuscule, point.

```
✓ Mon programme
✗ Mon Programme    (sauf nom de page, qui suit le naming convention)
✓ Aujourd'hui
✗ AUJOURD'HUI      (sauf eyebrow typographique avec uppercase CSS)
```

**Note :** les noms de pages canoniques (Aujourd'hui, Mon Programme, Ma Marque, Mes Outils, Calendrier, Rappels, Bibliothèque, Messages, Compte) sont en title case parce qu'ils sont traités comme noms propres du produit. C'est la seule exception.

**2. Pas d'emoji dans les copies d'interface.** Aucun cas d'exception. Les emojis dans les conversations utilisateur (input Floriane) sont autorisés — c'est sa parole, pas la nôtre.

**3. Pas de point d'exclamation.** Aucun cas d'exception. Le calme passe par la mesure du verbe. Un "Bienvenue !" devient "Bienvenue".

---

## 3. Le vocabulaire interdit

Liste exhaustive maintenue dans `00-CONCEPT.md` §9. À grep avant chaque livraison.

Synthèse des familles :

- **Jargon SaaS :** users, audience, dashboard, workflow, pipeline, onboarding (en UI).
- **Jargon growth/ad-tech :** viral, boost, growth hack, growth.
- **Anti-doctrine :** gamification, badges, streaks, XP, quêtes.
- **Jargon corporate/finance :** KPI, ROI (en UI).
- **Anti-Apple polish :** bientôt, à venir, coming soon (= retirer le composant si pas prêt).
- **Jargon API en UI :** tokens, sync, widget.
- **Jargon militaire :** radar.

Si Floriane apprenait un de ces mots **par Creative Fair**, l'app aurait échoué.

---

## 4. Le vocabulaire encouragé

Liste maintenue dans `00-CONCEPT.md` §10. Synthèse :

| Au lieu de | Préférer |
|---|---|
| ton contenu | ce que tu publies |
| ton profil | ton Instagram (ou LinkedIn, etc.) |
| tes followers | ta communauté |
| communiquer | raconter |
| ton ton | ta voix |
| le user, l'utilisateur | Floriane, la dirigeante, le pilote |
| la cible | la communauté, les lecteurs |
| publier du contenu | publier |
| tokens (en UI) | crédits |

---

## 5. La tonalité d'Hélène et des Experts

Hélène et les douze Experts ont chacun leur voix singulière, définie dans `02-EXPERTS.md` §9. Quelques principes communs cependant :

- **Pas de sycophancie.** Hélène et les Experts ne flattent pas Floriane. Ils ne disent pas "excellente question". Ils répondent à la question.
- **Pas de phrases d'ouverture creuses.** Pas de "Je suis ravie de t'aider", pas de "C'est avec plaisir". On entre dans le sujet directement.
- **Pas d'auto-référence inutile.** Pas de "En tant qu'IA, je peux..." ni "Permettez-moi de...". L'Expert répond, pas l'IA.
- **Verdict assumé.** Quand Hélène ou un Expert a un avis, il le donne. Quand ils refusent quelque chose, ils expliquent pourquoi, sans noyer.
- **Tutoiement par défaut.** Floriane et les Experts se tutoient. C'est cohérent avec une équipe éditoriale, pas avec un service client.
- **Phrases courtes, paragraphes courts.** Une idée par paragraphe. Pas de listes à puces dans les conversations sauf si la structure l'exige vraiment.

---

## 6. Les microcopies critiques

Certains éléments d'interface méritent une attention particulière.

### 6.1 Les vides

Quand une page est vide (pas encore de publications, pas encore de rappels), la copie d'absence doit être **inspirante, pas suppliante**.

```
✓ Ton calendrier est vide. C'est le moment d'ajouter ta première publication.
✗ Vous n'avez aucune publication. Cliquez ici pour en créer une !
```

### 6.2 Les confirmations

Pas de "Êtes-vous sûr ?". Préférer un verbe d'action clair en bouton, avec une description sobre.

```
✓ Cette action supprimera la publication définitivement.
  [Supprimer]  [Annuler]

✗ Êtes-vous sûr de vouloir supprimer cette publication ?
  [OK]  [Annuler]
```

### 6.3 Les états de chargement

Une seconde au-delà de laquelle il faut afficher un état. Préférer un libellé descriptif court à un spinner seul.

```
✓ Hélène prépare ta roadmap…
✗ Loading...
```

### 6.4 Les erreurs

Reformuler en termes humains. Jamais le message technique brut.

```
✓ La connexion a échoué. Vérifie ta connexion internet et réessaie.
✗ NetworkError: failed to fetch (status 500)
```

---

## 7. Le ton marketing

La voix marketing de Creative Fair (landing, communications, emails) suit les mêmes règles que la voix produit, avec une intensité légèrement supérieure sur le verbe central : **piloter**.

Le verbe central est **piloter**, pas créer, pas produire, pas gérer. Floriane pilote sa marque. C'est elle qui tient le manche.

La promesse d'ouverture (en haut de la landing, dans le pitch) :

> **Un espace de travail sur mesure.**
> **La communication, sans la charge mentale.**

Cette formulation est canonique. Toute variation passe par un amendement de `00-CONCEPT.md`.

---

## 8. La voix des Experts en signature

Quand un livrable est généré par un Expert (un post, une suggestion, un brief), une **mention en signature** indique l'auteur.

Format canonique :

```
Généré par Hélène M.
```

```
Avec l'avis d'Antoine F. · Création visuelle
```

Pour les contenus collaboratifs (plusieurs Experts) :

```
Avec Hélène M., Antoine F. (visuel) et Albane R. (éditorial)
```

Cette signature renforce la transparence (pilier Apple #5, Transparent Value Exchange) et incarne le modèle d'équipe éditoriale plutôt que de boîte noire IA.

---

## 9. Le cas particulier du code

Dans le code TypeScript et SQL, les contraintes de vocabulaire sont **assouplies** :

- Les identifiants de variables peuvent contenir des termes techniques (`workflowId`, `pipelineState`) — ils ne sont pas vus par Floriane.
- Les noms de tables Supabase suivent les conventions techniques (`posts`, `conversations`, `analytics_events`).
- Les commentaires de code peuvent utiliser le vocabulaire technique courant.

**Mais :** dès qu'une variable contient une string qui peut se retrouver en UI (label, titre, message d'erreur affiché), elle est soumise à la voice sheet stricte.

```ts
// ✓ OK — nom technique interne
const userPipeline = await loadPipeline()

// ✓ OK — label UI conforme
const label = "Ton parcours aujourd'hui"

// ✗ KO — label UI utilisant un mot interdit
const label = "Ton pipeline éditorial"   // → utiliser "calendrier" ou "programme"
```

---

## 10. Les revues d'audit

Chaque sprint qui touche à des copies utilisateur produit un audit dédié dans `audits/sprint-X/voice-review.md` qui :

1. Liste les nouvelles copies introduites
2. Vérifie l'absence du vocabulaire interdit
3. Vérifie le respect du sentence case, l'absence d'emoji et d'exclamation
4. Note les éventuels écarts avec un verdict **Validé** ou **Recalé**

Le format de l'audit suit le pattern `decisions.md` des autres audits, avec verdict binaire.

---

*Document v2.0 du 21 mai 2026. Toute proposition de modification passe par un Sprint dédié, jamais en passant.*
