# Plan d'exécution du Sprint 37

Découpe en livrables atomiques pour le sprint suivant. Estimations
en **commits unitaires** (pas en heures, pas en jours).

## Prérequis avant Sprint 37 exécution

À acquitter par le Lead avant lancement :

1. Toutes les questions "À ARBITRER LEAD" des docs 01-07 doivent être
   tranchées
2. Migration 011 (Sprint 36.C.2) doit être appliquée en prod
3. Tag v1.7.0 doit être posé sur main
4. Sprint 36.C.2 et 36.C.1 doivent être mergés sur main

**Prérequis sprint préalable potentiel : Sprint 36.F**

Si Lead décide :
- d'activer la porte d'entrée 2 (suggestion depuis `/conseiller`) → un
  Sprint 36.F refactor `/conseiller` est nécessaire pour exposer un
  hook *intention détectée → redirect*. **À FLAGGER.**
- de partager du contenu visuel généré dans le programme (et pas
  seulement texte titre + teaser) → un Sprint 36.G visuel-bridge est
  nécessaire avant 37.

Si V1 reste sur porte d'entrée 1 (CTA `/aujourd-hui`) + texte uniquement
dans la restitution : **pas de prérequis sprint préalable**, Sprint 37
peut démarrer directement.

## Lot 1 — Schéma DB et types (3 commits)

### 1.1 Migration 012 — table programme_generation_sessions
- Fichier : `supabase/migrations/012_programme_generation_sessions.sql`
- Contenu : la table + index `idx_pgs_user_active` (cf. doc 05)
- Validation : grep RLS policies + insert/select admin

### 1.2 Migration 013 — table drafts
- Fichier : `supabase/migrations/013_drafts.sql`
- Contenu : la table + index `idx_drafts_brand_status`,
  `idx_drafts_session`
- Validation : la section *Brouillons* de `/aujourd-hui` (stub V1 dans
  Sprint 36.C) peut maintenant lire `drafts`

### 1.3 Types TypeScript partagés
- Fichier : `types/programme-generation.ts`
- Contenu : `ProgrammeGenerationSession`, `Draft`, `SessionEtat`,
  `DraftStatus`, `MessageJson` (le format JSON strict de Claude)
- Validation : import successful depuis `types/index.ts`

## Lot 2 — Prompts Claude + génération côté serveur (5 commits)

### 2.1 Module prompts statiques
- Fichier : `lib/programme/conversational/prompts/doctrine.ts`
- Contenu : la chaîne longue (couche 1 du doc 04), exportée
- Validation : longueur stable, pas de mot interdit

### 2.2 Constructeur contexte marque
- Fichier : `lib/programme/conversational/build-context.ts`
- Contenu : `async function buildBrandContext(brandId): Promise<string>`
- Validation : lit `brands` + `calendrier_business` + posts récents,
  output text < 4000 tokens

### 2.3 Wrapper Anthropic
- Fichier : `lib/programme/conversational/anthropic-call.ts`
- Contenu : `async function callClaude(systemBlocks, userMsg,
  maxRetries=2)`. Cascade opus-4-5 → opus-4-1 → sonnet-4-5. Gestion
  prompt caching. Parse JSON. Retry sur invalide.
- Validation : test unitaire mock + integration test (1 appel réel
  Opus, optionnel)

### 2.4 Server actions du flux
- Fichier : `app/_actions/programme-generation.ts`
- Contenu :
  - `startSession()` — crée la session, premier tour
  - `submitChoice(sessionId, choiceId)` — tour suivant
  - `submitAddedAnchor(sessionId, anchor)` — ajoute ancre + relance
  - `finalize(sessionId)` — génère le programme final
  - `regenerateDraft(draftId, motif)` — régénère 1 seul draft
  - `validateAll(sessionId)` — drafts → posts, session → termine
  - `abandon(sessionId)` — manual cleanup
- Validation : test unitaire chacune

### 2.5 API routes (wrappers HTTP optionnels)
- Décision : utiliser **server actions** directement depuis les
  composants client OU créer des routes `/api/programme/generation/*` ?
  Server actions plus moderne et économe en code. Choix : server
  actions, sauf si besoin webhook tiers.

## Lot 3 — UI client (6 commits)

### 3.1 Route + layout du flux
- Fichier : `app/(programme)/programme/generation/[sessionId]/page.tsx`
- Fichier : `app/(programme)/programme/generation/layout.tsx`
- Contenu : server component qui charge la session, render selon
  `etat`
- Validation : route accessible, redirect si session inexistante ou
  non-propriétaire

### 3.2 Composant conversationnel principal
- Fichier : `components/programme-generation/ConversationView.tsx`
- Contenu : affiche `phrase`, propose les `choix`, gère soumission
- Validation : un tour de conversation rond, état persisté

### 3.3 Mini-form ajout ancre depuis le flux
- Fichier : `components/programme-generation/AddAnchorForm.tsx`
- Contenu : titre, date, type, importance ; submit appelle server
  action ; UI rentre dans le flux à l'étape suivante
- Validation : INSERT dans `calendrier_business` constaté

### 3.4 Vue de restitution
- Fichier : `components/programme-generation/RestitutionView.tsx`
- Contenu : liste par semaine, cartes draft, sticky footer
- Validation : *Tout valider* fonctionne end-to-end

### 3.5 Carte de draft individuel
- Fichier : `components/programme-generation/DraftCard.tsx`
- Contenu : affichage + boutons Modifier/Rejeter/Demander remplacement
- Validation : *Demander remplacement* régénère 1 carte sans toucher
  aux autres

### 3.6 Entrée CTA dans `/aujourd-hui`
- Fichier : modification de `components/aujourd-hui/SectionCetteSemaine.tsx`
- Contenu : bouton *« Poser le rythme des prochaines semaines »*
  conditionnel (cf. doc 01 porte 1)
- Validation : visible quand pertinent, invisible sinon

## Lot 4 — Activation section Brouillons (2 commits)

### 4.1 Activer SectionBrouillons sur /aujourd-hui
- Fichier : modification de `components/aujourd-hui/SectionBrouillons.tsx`
  (actuellement stub V1)
- Contenu : lit `drafts` du tenant en `status='propose' OR 'modifie'`,
  affiche une ligne par session en attente

### 4.2 Loader extension
- Fichier : modification de `lib/aujourd-hui/load-data.ts`
- Contenu : query drafts en parallèle des autres données

## Lot 5 — Tests E2E (2 commits)

### 5.1 Spec 07-programme-generation.spec.ts
- Couvre : lancement flux, 4 tours, restitution, *Tout valider*,
  vérification posts créés en DB

### 5.2 Spec 08-programme-generation-edges.spec.ts
- Couvre : brand incomplete bloque le flux, calendar vide propose
  programme libre, déjà un programme récent demande confirmation

## Lot 6 — Audit + docs (1 commit)

### 6.1 Audit final
- `audits/sprint-37/decisions.md` — résumé des choix doctrinaux finaux
- `audits/sprint-37/abort-log.md` — écarts éventuels
- Mise à jour `docs/sprint-37/*` si la spec a été ajustée à
  l'exécution

## Estimation totale

| Lot | Commits | Risque |
|---|---|---|
| 1 | 3 | Faible (migrations + types) |
| 2 | 5 | Moyen (prompts Claude, gestion cascade) |
| 3 | 6 | Moyen (UI conversationnelle, états multiples) |
| 4 | 2 | Faible (activation section déjà stubée) |
| 5 | 2 | Moyen (tests dépendent d'Anthropic en CI ou mock) |
| 6 | 1 | Faible |
| **Total** | **19 commits** | |

Sprint nuit autonome : faisable en 1 nuit si docs spec complète et
ARBITRER LEAD tous tranchés. Sinon 2 nuits.

## Ordre d'exécution recommandé

1. **Lot 1** d'abord — la DB est le socle. Sans la table `drafts`,
   rien d'autre ne marche.
2. **Lot 2** ensuite — les server actions sont testables sans UI.
3. **Lot 3** après — l'UI consomme les server actions.
4. **Lot 4** en parallèle de Lot 3.6 si capacité (ils touchent tous
   deux `/aujourd-hui` et `lib/aujourd-hui`).
5. **Lot 5** en dernier, après que tout marche en local.
6. **Lot 6** clôture.

## Critères de validation par lot

| Lot | Validation |
|---|---|
| 1 | Migrations 012/013 appliquées en local, `select * from programme_generation_sessions limit 1;` répond, types compilent |
| 2 | Test unitaire `buildBrandContext` retourne string non-vide pour brand de test ; `callClaude` retourne JSON parsable pour prompt minimal |
| 3 | E2E manuel : démarrage → 4 tours → restitution → tout valider → posts visibles dans `/programme` |
| 4 | Section Brouillons visible quand un user a une session en `restitution`, invisible sinon |
| 5 | `npm run test:e2e` passe les 8 specs (Sprint 36.E + 37) sans flake |
| 6 | Audit relu et signé par le Lead |

## Abort conditions Sprint 37 exécution

- Si Lot 1 casse une migration existante : ABORT, rollback, ne pas
  poursuivre.
- Si Lot 2 cascade Claude échoue systématiquement (> 50% des appels
  test) : ABORT, instrumenter et investiguer côté Anthropic avant de
  continuer.
- Si Lot 3 dépasse 8 commits (vs 6 estimés) : pause, replanifier la
  découpe.
- Si plus de 3 "À ARBITRER LEAD" se révèlent en cours d'exécution :
  pause, attendre arbitrage avant de poursuivre.
- Si la facture Anthropic dépasse 5 € sur les tests Sprint 37 :
  ABORT, mocker, attendre validation Lead avant relance.

## Points à valider par le Lead

- 19 commits estimés : ambition raisonnable pour une nuit ?
- Server actions vs API routes : décision avant Lot 2.4/2.5.
- Sprint 36.F (refactor `/conseiller`) doit-il être planifié AVANT
  Sprint 37 ou la porte 2 est reportée V2 ?
- Tests E2E Sprint 37 : doivent-ils faire un appel Claude réel ou
  bien on mocke ? Décision conditionne la robustesse + le coût CI.
- Budget Anthropic Sprint 37 dev/test : combien d'euros autorisés ?
