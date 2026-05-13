# Sprint 37-SPEC — Décisions doctrinales structurantes

Branche `sprint-37-spec` (basée sur `sprint-36-c-2` HEAD `bc1302d`).
1 commit. Aucune ligne de code application — docs uniquement.

## Décisions tranchées par cette spec

Les choix listés ici sont **proposés** dans les docs et reposent sur
la doctrine v60 existante + le travail technique des sprints 36.A à
36.C.2. Si le Lead souhaite arbitrer différemment, les sections "À
ARBITRER LEAD" de chaque doc (consolidées dans `docs/sprint-37/README.md`)
listent les leviers.

### 1. Le flux génère des drafts, pas des publications

Le livrable final côté user = **drafts validables**, pas posts
programmés automatiquement. Pattern Apple : prévisualiser avant
programmer. Décision conditionne 50% du Sprint 37 exécution. Cohérent
avec doctrine v60 (jamais d'action irréversible sans validation
explicite).

### 2. 4 tours de conversation max

Au-delà, le user remplit un formulaire. La promesse *« une dizaine de
minutes »* impose un plafond. Si la conversation déborde, on dégrade
sur une proposition par défaut éditable post-restitution. Anti-friction
cognitive (Pilier 2 / Frictionless ecosystem).

### 3. Format JSON strict côté Claude

Pas de markdown, pas de texte libre. Validation server-side avec max
2 retries correctifs. Évite la dérive éditoriale et permet de hooker
des boutons UI sur la sortie.

### 4. Doctrine cachée + contexte marque caché + état conversationnel
   non-caché

Architecture 3 couches optimisée pour le prompt caching Anthropic.
Hit rate attendu ~95% sur les 3 derniers tours d'une session. Économie
mesurée : ~50% de tokens facturés vs sans cache (3 derniers tours).

### 5. Opus en cascade vs Opus exclusif : laissé au Lead

La spec propose la cascade par défaut (cohérent avec Sprint 36.A+),
mais signale que le flux a un rôle plus stratégique que la simple
génération de propositions. Opus exclusif = qualité prévisible mais
× 1.5 coût.

### 6. Naming : `programme_generation_sessions`

Choisi sur `conversations_programme` car :
- Évite collision future avec table `conversations` (chat
  `/conseiller`)
- Évite collision avec table `programmes` existante
- Plus explicite : "session de génération d'un programme"

### 7. Création nouvelles tables : drafts + programme_generation_sessions

Sprint 37 introduit 2 nouvelles tables. Pas de modification de tables
existantes (brands, programmes, posts inchangées). Migrations 012
(sessions) et 013 (drafts) à créer.

### 8. Section Brouillons de /aujourd-hui : activation Sprint 37

Le stub V1 de Sprint 36.C devient fonctionnel : lit les drafts en
status `propose` ou `modifie`. Une seule session en attente affichée.
Si plusieurs : garder la plus récente.

### 9. Tests E2E sans appel Claude réel (proposition)

Sprint 37 doit mocker l'appel Claude pour les tests E2E (coût + flake).
Implémentation suggérée : route handler de test
`/api/test/mock-programme-generation` qui retourne un JSON déterministe.
Décision finale par Lead.

### 10. Sprint 36.F préalable potentiel

Si Lead active la porte d'entrée 2 (suggestion depuis `/conseiller`),
un Sprint 36.F est requis avant 37. Si V1 reste sur porte 1 (CTA
`/aujourd-hui`), aucun prérequis sprint préalable.

## Décisions explicitement reportées au Lead

Cf. `docs/sprint-37/README.md` section *Points "À ARBITRER LEAD" —
index consolidé*. ~24 arbitrages listés, regroupés par catégorie
(Doctrine produit / UX / Backend / Sprint planification).

## Méthodologie de rédaction

- 8 docs structurés, chacun ~300-500 lignes
- Chaque doc se termine par *« Points à valider par le Lead »*
- Exemples concrets (10 phrases types, wireframe textuel, schéma SQL
  proposé) priorisés sur abstractions
- Tutoiement absent dans la spec elle-même (spec écrite pour le Lead,
  vouvoiement implicite ; tutoiement réservé aux exemples de phrases
  Creative Fair → user)
- Pas d'emoji, pas d'exclamation
- Aucune dépendance externe proposée — toute la spec tient avec la
  stack déjà en place (Supabase + Anthropic SDK + Next.js)

## Conflits doctrine / technique identifiés

### Conflit 1 : Doctrine *« pas de notification intrusive »* vs reprise
session abandonnée

Le user abandonne une session, n'a aucune relance. Sa session reste
en DB jusqu'à 7 jours. Au retour, il voit *« Tu peux reprendre »* dans
`/aujourd-hui`.

Pas de mail, pas de toast push. Conforme doctrine. Mais : si le user
ne revient jamais, il ne saura jamais qu'il a une session abandonnée.

**Proposition** : accepter ce tradeoff. Si Lead veut une relance,
prévoir Sprint 38+ avec emails opt-in.

### Conflit 2 : Doctrine *« anti-gamification »* vs feedback de
génération

Le tour 4 (génération finale) prend 5-15 secondes côté Claude. Pendant
ce temps, le user voit quoi ?

- Pas de barre de progression chiffrée (interdit)
- Pas de *« Veuillez patienter... »* (jargon, sycophant)
- Pas de spinner décoratif

**Proposition** : phrase courte de Creative Fair affichée pendant
l'attente, *« Je structure ton programme... »*, suivie d'un indicateur
visuel sobre (3 points qui pulsent en thème glass-thin). Conforme.

### Conflit 3 : Pilier 5 (Transparent Value Exchange) vs aucun
affichage de coût Anthropic

Le user ne sait pas combien coûte une session. Pilier 5 dit *« modèle
économique clair »*. Mais doctrine v60 dit *« pas de gamification »*.

**Proposition** : ne rien afficher en V1. La valeur perçue est le
programme livré, pas le coût du calcul. Si V2 ajoute un compteur
*« sessions ce mois »*, ce sera dans un écran admin/compte, pas dans
le flux lui-même.

## Limites de cette spec

- Pas de wireframe visuel (Figma) — uniquement wireframes textuels
- Pas de chiffrage horaire — uniquement chiffrage en commits unitaires
- Pas de plan de rollback Sprint 37 — à décider en Sprint 37 audit
- Aucun test de prompt Claude effectué — les phrases d'exemple sont
  des propositions doctrinales, à valider en mesure réelle dès Sprint 37
