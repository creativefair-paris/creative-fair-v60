# Audit Sprint 40 — Page Messages

> Verdict global : **Recalé** (sur le périmètre legacy V1) — **À créer** (sur le périmètre V2.0 cible)
> Doctrine de référence : `00-CONCEPT.md` §5 promesse 4 "Tu n'es pas seule. Hélène M., orchestratrice intelligente, est ton interlocutrice principale. Elle s'appuie sur douze Experts spécialistes." · §14 "Conseiller comme page séparée (fusionné dans Messages avec Hélène M. pinned)" + "Contacts comme page séparée (fusionné dans Messages)" · `01-ARCHITECTURE.md` §1 (Messages, section Travail) · `02-EXPERTS.md` (intégral) · `10-SACRED.md` 13 personnages canoniques.

---

## 1. Périmètre audité

### 1.1 Cible doctrinale V2.0

La page **Messages** au top-level (groupe `(app)/messages/`) n'existe pas dans le repo. La doctrine attend :

- `app/(app)/messages/page.tsx` (cible) — conversation Hélène M. pinned + carnet des 12 Experts.
- `components/messages/` (cible) — composants conversation, carnet, fiche Expert, bannière "Hélène suit cette conversation".
- `lib/ai/prompts/helene.ts` (cible) — prompt Hélène M. Opus 4.7.
- `lib/ai/prompts/experts/*.ts` (cible) — un fichier par Expert (Sofia, Léa, Capucine, Jonas, Albane, Marc, Inès, Sébastien, Valentine, Antoine, Camille, Élise).
- `lib/experts/types.ts` + `lib/experts/routing.ts` (cible) — types Expert + mapping rôle → modèle.

**Aucun de ces fichiers n'existe.** La cible V2.0 est intégralement à construire en Sprint 43+.

### 1.2 Le legacy V1 équivalent (Recalé en masse, cf. `02-mes-outils.md`)

Tout l'écosystème Conseiller couvre la fonction qu'occuperait Messages en V2.0 :

- `app/(outils)/outils/conseiller/page.tsx` — page Conseiller historique (Recalé).
- `app/(outils)/outils/messages/page.tsx` — placeholder Sprint 37.A "reporté V2" (Recalé).
- `lib/conseiller/system-prompt.ts` — prompt Conseiller (cumulatif, non aligné Experts).
- `lib/conseiller/scenarios/*` — 14 sub-prompts par scénario (A1/A2/.../E1).
- `components/conseiller/*` — 20 composants UI Conseiller V1.
- `components/conseiller/wizard-steps/*` — 13 steps wizard A1 plan generation.
- `components/outils/conseiller/*` — 3 composants chat (déjà marqués "SUPPRESSION CANDIDATE").
- `components/outils/mockups/ConseillerIPhoneMockup.tsx` — mockup iPhone Conseiller.
- `app/_actions/run-conseiller-turn.ts`, `mark-conseiller-timeout.ts`, `ask-mini-chat.ts`, `find-resumable-session.ts`, `generate-pedagogy.ts`, `wizard-session.ts`.
- `components/programme/ConseillerAccess.tsx` — 4 entrées Conseiller depuis /programme.
- `app/api/ai/chat/route.ts` — endpoint chat Conseiller.

### 1.3 Migrations Supabase Conseiller V1

- `015_conseiller_conversations.sql` — table `conversations` (intitulée historiquement "Conseiller").
- `019_programme_creation_sessions.sql` — sessions wizard A1 (en partie).

Ces migrations ne sont **pas supprimées Phase 2** (modification de schéma = risque hors scope brief §7). Documentées dans `10-transverse.md` §5.

---

## 2. Confrontation à la doctrine

### Inexistence de la page V2.0 Messages
- **Statut doctrinal :** À créer (hors scope Sprint 40)
- **Référence doctrine :** `01-ARCHITECTURE.md` §1, `02-EXPERTS.md` §1 à §10, `10-SACRED.md` Hélène + 12 Experts.
- **Constat factuel :** Aucun fichier dans `app/(app)/messages/`, `components/messages/`, `lib/ai/prompts/experts/`, `lib/experts/`.
- **Écart constaté :** Cible V2.0 entièrement à construire.
- **Action proposée Phase 2 :** **Aucune** dans Sprint 40 (qui est un audit + purge, pas une création). À planifier Sprint 43+ avec un brief Lead dédié.

### `app/(outils)/outils/messages/page.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `01-ARCHITECTURE.md` §1 Messages = destination top-level (pas sous outils). `00-CONCEPT.md` §6 pilier 6 "Zéro 'bientôt'".
- **Constat factuel :** Placeholder "Reporté V2 avec API Meta" — concept "modération DM Instagram" inspiré du scénario Conseiller B5.
- **Écart constaté :** Route placeholder en prod + emplacement sous-arbre `outils` contredit l'architecture V2.0 (Messages top-level).
- **Action proposée Phase 2 :** Supprimer. Backup `archive/v1-leftovers/outils-messages-placeholder/`.

### `app/(outils)/outils/conseiller/page.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 "Conseiller comme page séparée (fusionné dans Messages)".
- **Constat factuel :** Page historique des conversations Conseiller + auto-ouverture sheet via query params (5-7 voies d'accès doc 09).
- **Écart constaté :** Concept entier Recalé.
- **Action proposée Phase 2 :** Supprimer. Backup. Voir `02-mes-outils.md` §5.1.

### `lib/conseiller/system-prompt.ts`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `02-EXPERTS.md` §1 "Hélène M. est l'orchestratrice" (pas "le Conseiller"). `02-EXPERTS.md` §9 voix singulière de chaque Expert. `03-VOICE_SHEET.md` §1 source de vérité = `lib/ai/prompts/system.ts` (VOICE_SHEET_RULES SACRED).
- **Constat factuel :** Prompt Conseiller cumulatif avec 5 lois + vocabulaire interdit + scope V1 TF + doctrine fondatrice. Distinct de VOICE_SHEET_RULES.
- **Écart constaté :** Concept Conseiller entier dégagé.
- **Action proposée Phase 2 :** Supprimer + **backup obligatoire** dans `archive/v1-leftovers/conseiller/system-prompt.ts` (contient de la doctrine éditoriale potentiellement utile à la réécriture des prompts Experts Sprint 43+ — les 5 lois, le vocabulaire interdit, le scope V1 TF sont des matériaux précieux).

### `lib/conseiller/scenarios/*` (14 sub-prompts + index + A1-pedagogy-prompt + scenario-palette)
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `02-EXPERTS.md` §10 "Pour éviter la dilution conceptuelle, certaines fonctions IA de Creative Fair ne sont pas portées par un Expert nommé". L'architecture A/B/C/D/E par scénario ≠ architecture par Expert.
- **Constat factuel :** 15 fichiers de scénarios + 1 index.
- **Écart constaté :** Concept entier dégagé.
- **Action proposée Phase 2 :** Supprimer. **Backup obligatoire** dans `archive/v1-leftovers/conseiller-scenarios/` (matériau éditorial réutilisable).

### `lib/conseiller/queries.ts`, `markdown-parser.ts`, `parse-metrics-block.ts`, `scenario-palette.ts`, `types.ts`, `waiting-states.ts`, `onboarding-types.ts`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer. Backup en bloc.

### `components/conseiller/*` (20 composants)
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `02-EXPERTS.md` §1 modèle Messages V2.0 ≠ wizard immersif Conseiller V1.
- **Constat factuel :** ConseillerSheet, ConseillerBubble, PiloteBubble, WizardImmersiveSheet, MetricSlider, CalloutBox, DocumentaryCard, RichMarkdown, StreamingReasoning, Timeline, ResumeChoiceSheet, PedagogyExplanationSheet, QuickMetricsRow, WizardProgressBar, ExitConfirmDialog, ConseillerHistory, WaitingState, DataTable, ConseillerChat (legacy).
- **Action proposée Phase 2 :** Supprimer. Backup en bloc dans `archive/v1-leftovers/conseiller-components/`.

### `components/conseiller/wizard-steps/*` (13 steps)
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 abandon wizard 10 questions / wizard A1 Conseiller.
- **Constat factuel :** 13 steps wizard A1 plan generation (Period, BusinessAnchors, MixMode, SensitiveTopics, Pillars, DefinirPiliers, RiskCursor, RythmeEngagement, Objectifs, ObjectifsCombined, Confirmation, Formats, SuggestionPicker).
- **Action proposée Phase 2 :** Supprimer. Backup.

### `components/outils/conseiller/ConseillerChat.tsx`, `ConseillerLayout.tsx`, `ConversationsList.tsx`
- **Statut doctrinal :** Recalé
- **Constat factuel :** Déjà marqués "SUPPRESSION CANDIDATE Sprint 36".
- **Action proposée Phase 2 :** Supprimer. Backup.

### `components/outils/mockups/ConseillerIPhoneMockup.tsx`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer. Backup.

### `components/programme/ConseillerAccess.tsx`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer. Voir `03-mon-programme.md`.

### `app/_actions/run-conseiller-turn.ts`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** Action centrale du Conseiller V1.
- **Action proposée Phase 2 :** Supprimer.

### `app/_actions/mark-conseiller-timeout.ts`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer.

### `app/_actions/ask-mini-chat.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md` §6.3 tâches utilitaires invisibles (Haiku) si bornées.
- **Constat factuel :** Mini-chat utilisé par `PostMiniChat` dans Programme.
- **Écart constaté :** Pas aligné Experts mais pourrait correspondre à une tâche utilitaire bornée.
- **Action proposée Phase 2 :** Conserver provisoirement, marquer `@deprecated`. À refondre Sprint 43+.

### `app/_actions/find-resumable-session.ts`
- **Statut doctrinal :** Recalé
- **Constat factuel :** Reprise de session wizard Conseiller A1.
- **Action proposée Phase 2 :** Supprimer.

### `app/_actions/generate-pedagogy.ts`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 "Méthode pédagogique 4 mois (V60-pre)" abandonnée.
- **Action proposée Phase 2 :** Supprimer.

### `app/_actions/wizard-session.ts`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer.

### `app/api/ai/chat/route.ts`
- **Statut doctrinal :** À investiguer (probable Recalé)
- **Référence doctrine :** `02-EXPERTS.md`.
- **Constat factuel :** Endpoint /api/ai/chat. Probablement utilisé par Conseiller V1.
- **Action proposée Phase 2 :** Investiguer. Si seul Conseiller V1 dépend → supprimer. Sinon refactor pour viser Hélène + Experts Sprint 43+.

### `app/_actions/catch-up-overdue-posts.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §3 anti-référence "pression artificielle".
- **Constat factuel :** Action server qui rattrape les posts en retard.
- **Écart constaté :** Concept "catch-up" pourrait créer pression. À auditer Sprint 41 pour vérifier que ce n'est pas vu par l'utilisateur.
- **Action proposée Phase 2 :** Audit Sprint 41 (fond du contenu).

### `app/api/ai/coaching/route.ts`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §3 "Ce n'est pas Headspace. Ce n'est pas Calm." `02-EXPERTS.md` §10 "L'onboarding F89 piliers est orchestré par Hélène… Pas d'Expert dédié à l'onboarding."
- **Constat factuel :** Route génération coaching quotidien.
- **Écart constaté :** Concept "coaching" daily = anti-doctrine.
- **Action proposée Phase 2 :** Supprimer. Backup.

### Carnet des Experts (concept doctrinal V2.0)
- **Statut doctrinal :** À créer (hors scope Sprint 40)
- **Référence doctrine :** `02-EXPERTS.md` §5 "Le carnet des Experts (intégré dans Messages)… Il n'y a pas de page 'Contacts' séparée. Le carnet vit à l'intérieur de Messages."
- **Constat factuel :** Aucune trace dans le repo. Pas de composant `Carnet`, `ContactsList`, `ExpertCard`.
- **Action proposée Phase 2 :** Aucune. Création Sprint 43+.

### Hélène M. — orchestratrice
- **Statut doctrinal :** À créer (hors scope Sprint 40)
- **Référence doctrine :** `02-EXPERTS.md` §2 "Hélène est l'interlocutrice principale… Pinned en haut, immédiatement disponible." `10-SACRED.md` "Hélène M. : Opus 4.7, sans exception".
- **Constat factuel :** Aucun fichier `lib/ai/prompts/helene.ts`, aucun composant `HeleneAvatar`, `HelenePinned`, `HeleneRoadmap`.
- **Action proposée Phase 2 :** Aucune. Création Sprint 43+.

### 12 Experts
- **Statut doctrinal :** À créer (hors scope Sprint 40)
- **Référence doctrine :** `02-EXPERTS.md` §3 tableau des 12 Experts + LLM par rôle. `10-SACRED.md` "Aucun Expert ajouté sans amendement de `02-EXPERTS.md`."
- **Constat factuel :** Aucun fichier `lib/ai/prompts/experts/sofia.ts`, `lea.ts`, ... `elise.ts`. Aucun composant Expert.
- **Action proposée Phase 2 :** Aucune. Création Sprint 43+.

### Pattern "Hélène écoute toujours"
- **Statut doctrinal :** À créer (hors scope Sprint 40)
- **Référence doctrine :** `02-EXPERTS.md` §4.3 "Cette écoute doit être visible. Dans toute conversation directe avec un Expert, en haut, une bannière discrète indique : 'Hélène suit cette conversation'."
- **Constat factuel :** Aucun composant `<HeleneListensBanner>` ou équivalent.
- **Action proposée Phase 2 :** Aucune. Création Sprint 43+.

### Migrations Supabase Conseiller V1
- `015_conseiller_conversations.sql`
- **Statut doctrinal :** À refactorer (schéma à modifier Sprint 41+)
- **Référence doctrine :** `04-MULTI_TENANT.md` "Tables actuelles (Sprint 1) — `conversations` ✓ (Conseiller — INSERT/UPDATE/DELETE ne sont autorisés que sur `user_id = auth.uid()`)".
- **Constat factuel :** Table `conversations` créée pour le Conseiller V1.
- **Écart constaté :** La table peut servir V2.0 (Messages) sous réserve qu'on revoit les colonnes. À refactorer schéma Sprint 41+ (hors scope Sprint 40 — modification de schéma = risque).
- **Action proposée Phase 2 :** Documenter dans `10-transverse.md` §5. Pas de modification ce sprint.

---

## 3. Confrontation à la spec HTML

**[doctrine silencieuse partiellement]** — la doctrine écrite couvre la grammaire conversationnelle :

- `02-EXPERTS.md` §2 Hélène pinned, fond singulier.
- §3 Tableau des 12 Experts (prénom + initiale + territoire + LLM).
- §4.1 Conversation principale Floriane ↔ Hélène.
- §4.2 Conversation directe Floriane ↔ Expert (autorisée mais discrète).
- §4.3 Mention "Hélène suit cette conversation" obligatoire.
- §4.4 Conversations de groupe sous section "Groupes".
- §5 Fiche d'Expert (avatar, territoire eyebrow, 3 pastilles spécialités, CTA Démarrer/Demander avis, doctrine de référence).
- §8 Marketing voix : signature "Avec l'avis de Antoine F. · Création visuelle".

Le HTML Messages Claude Design (non visible dans le repo) incarne probablement ces règles. Mais sa lecture pixel-près est laissée à Sprint 43+ quand la page sera construite.

---

## 4. Résumé chiffré

| Verdict | Nombre |
|---|---|
| Validés | 0 |
| À refactorer | 3 |
| Recalés | ~50 (totalité de l'écosystème Conseiller V1) |
| À créer (hors scope Sprint 40) | ~30 fichiers cibles |
| Total fichiers Messages audités | ~53 |

Les Recalés sont déjà listés dans `02-mes-outils.md` §5.1 (blocs A à E). Ils sont mentionnés ici pour mémoire et pour clarifier la **logique** : tout le legacy Conseiller V1 alimente la fonction qu'occupera Messages en V2.0. Le supprimer en Sprint 40 = nettoyer le terrain pour la construction de Messages en Sprint 43+.

À refactorer :
1. `app/_actions/ask-mini-chat.ts` (concerve provisoirement, deprecated)
2. `app/_actions/catch-up-overdue-posts.ts` (audit fond Sprint 41)
3. `app/api/ai/chat/route.ts` (à investiguer)

---

## 5. Recommandation pour Phase 2

### 5.1 Suppression massive — déjà listée dans `02-mes-outils.md`

Pas de doublon de listing. Voir `02-mes-outils.md` §5.1 blocs A à E.

### 5.2 Suppression spécifique Messages

- `app/api/ai/coaching/route.ts` (route coaching daily).

### 5.3 Refactor automatique

- Marquer `@deprecated` `app/_actions/ask-mini-chat.ts` dans son commentaire.
- Marquer `@deprecated` `app/_actions/catch-up-overdue-posts.ts` si vérification fond non concluante (Sprint 41).

### 5.4 Hors scope Sprint 40 (Sprint 43+)

Création complète de la page Messages V2.0 :

- Route `app/(app)/messages/page.tsx`.
- Composants `components/messages/HelenePinned`, `ConversationList`, `MessageThread`, `ExpertCard`, `Carnet`, `HeleneListensBanner`, `GroupConversation`, `ExpertSignature`.
- Prompts `lib/ai/prompts/helene.ts` (Opus 4.7).
- Prompts `lib/ai/prompts/experts/sofia.ts`, `lea.ts`, `capucine.ts`, `jonas.ts`, `albane.ts`, `marc.ts`, `ines.ts`, `sebastien.ts`, `valentine.ts`, `antoine.ts`, `camille.ts`, `elise.ts`.
- Types `lib/experts/types.ts`.
- Routing `lib/experts/routing.ts` (mapping rôle → modèle, voir `02-EXPERTS.md` §3).
- Migration schéma `conversations` pour V2.0 (refondre les colonnes).

---

## 6. Cible doctrinale V2.0 — spec détaillée pour Sprint 43+

### 6.1 Structure de fichiers cible Messages

```
app/(app)/messages/
├── layout.tsx
├── page.tsx                            ← Hélène pinned + liste conversations + carnet onglet
├── loading.tsx
├── error.tsx
├── helene/page.tsx                     ← conversation principale Floriane ↔ Hélène
├── expert/[slug]/page.tsx              ← conversation directe Floriane ↔ Expert
└── groupe/[id]/page.tsx                ← conversation de groupe

components/messages/
├── MessagesView.tsx                    ← orchestrateur layout (sub-sidebar 260px liste + content thread)
├── ConversationList.tsx                ← liste pinned + secondaire
├── HelenePinned.tsx                    ← entrée pinned d'Hélène en haut
├── ExpertConversationRow.tsx           ← rangée conversation directe Expert
├── GroupConversationRow.tsx            ← rangée conversation de groupe
├── MessageThread.tsx                   ← fil de messages
├── MessageBubble.tsx                   ← bulle individuelle (user / assistant / expert)
├── MessageInput.tsx                    ← input + envoi
├── HeleneListensBanner.tsx             ← bannière "Hélène suit cette conversation" obligatoire
├── ExpertSignature.tsx                 ← signature "Avec l'avis d'Antoine F. · Création visuelle"
├── CarnetView.tsx                      ← onglet carnet (12 Experts)
├── ExpertCard.tsx                      ← fiche détaillée Expert
├── HeleneCard.tsx                      ← fiche détaillée Hélène + équipe pilotée
└── ConfidentialDiscussionToggle.tsx    ← option "Discussion confidentielle" §4.3

lib/messages/
├── queries.ts                          ← loadConversations(supabase)
├── types.ts                            ← Message, Conversation, Participant
└── grouping.ts                         ← group by participant

lib/experts/
├── types.ts                            ← Expert, ExpertRole, LLMModel
├── routing.ts                          ← mapping rôle → modèle (selon 02-EXPERTS.md §3)
└── voice.ts                            ← métadonnées de voix de chaque Expert

lib/ai/prompts/
├── helene.ts                           ← system prompt Hélène M. Opus 4.7
└── experts/
    ├── sofia.ts                        ← Sofia P. (Ads, Sonnet 4.6)
    ├── lea.ts                          ← Léa Z. (Influence Premium, Opus 4.7)
    ├── capucine.ts                     ← Capucine V. (Communauté, Sonnet 4.6)
    ├── jonas.ts                        ← Jonas K. (Coups & Viralité, Opus 4.7)
    ├── albane.ts                       ← Albane R. (Éditorial Magazine, Opus 4.7)
    ├── marc.ts                         ← Marc D. (Veille, Sonnet 4.6)
    ├── ines.ts                         ← Inès B. (Ops, Sonnet 4.6)
    ├── sebastien.ts                    ← Sébastien L. (Analytics, Sonnet 4.6)
    ├── valentine.ts                    ← Valentine D. (Crise, Opus 4.7)
    ├── antoine.ts                      ← Antoine F. (Création Visuelle, Opus 4.7)
    ├── camille.ts                      ← Camille O. (Channels adjacents, Sonnet 4.6)
    └── elise.ts                        ← Élise M. (Archives, Opus 4.7)

app/_actions/messages/
├── send-message.ts                     ← envoi à Hélène ou Expert
├── invite-expert.ts                    ← inviter Expert dans conversation existante (option B §4.1)
├── start-conversation.ts               ← démarrer conversation directe avec Expert
├── toggle-confidential.ts              ← Discussion confidentielle on/off §4.3
└── list-conversations.ts               ← lister conversations user
```

### 6.2 Spec visuelle (de la doctrine)

`02-EXPERTS.md` §2 + `01-ARCHITECTURE.md` §3.2 :

- **Layout** : sub-sidebar 260px (Hélène pinned + ConversationList + onglet Carnet) + content pane droit (MessageThread actif).
- **Pinned Hélène** : 56px de hauteur, avatar à gauche, nom + dernier message tronqué, fond glass z2 standard distinct du reste.
- **Liste secondaire** : conversations directes Expert + groupes, fond glass z1 ambient, hover discret.
- **MessageThread** : bulles user à droite (bleu CF `#007AFF`), bulles Hélène/Expert à gauche (gris pâle), signature Expert en bas de bulle.
- **Bannière "Hélène suit cette conversation"** : sticky en haut du thread, fond glass z1, icône œil ouvert, 32px de hauteur.

### 6.3 Pattern conversation principale Hélène

`02-EXPERTS.md` §4.1 :

- Floriane parle à Hélène par défaut.
- Hélène a deux options pour les sujets Expert :
  - **Option A — Appel silencieux** : Hélène consulte l'Expert en arrière-plan, restitue la réponse signée "avec l'avis d'Antoine". 80% des cas.
  - **Option B — Invitation dans la conversation** : Hélène propose "veux-tu qu'on invite Antoine sur cette discussion ?". Si Floriane accepte, conversation passe en groupe.

Implémentation backend :
- `lib/experts/routing.ts` décide silencieux vs invité selon complexité + durée probable.
- Floriane peut surcharger via input direct : "demande à Antoine" ou "on invite Marc".

### 6.4 Pattern conversation directe Expert

`02-EXPERTS.md` §4.2 :

- Floriane peut démarrer une conversation directe depuis le Carnet.
- Discret dans l'UI : pas de raccourci proéminent qui inviterait Floriane à zapper Hélène.
- Liste secondaire, pas en évidence.
- Bannière "Hélène suit cette conversation" obligatoire (§4.3).

### 6.5 Pattern conversations de groupe

`02-EXPERTS.md` §4.4 :

- Hélène peut inviter plusieurs Experts dans une même conversation (lancement produit = Antoine + Albane + Camille + Hélène).
- Section "Groupes" dans la liste avec avatar collectif + participants visibles.

### 6.6 Pattern carnet des Experts

`02-EXPERTS.md` §5 :

- Onglet Carnet dans Messages (bouton "Voir tous les contacts" ou tab).
- Hélène pinned en haut, fiche détaillée.
- 12 Experts listés alphabétiquement par prénom.
- Fiche Expert :
  - Nom, avatar, territoire éditorial (eyebrow).
  - 3 pastilles spécialités.
  - CTA "Démarrer une conversation".
  - CTA "Demander un avis" (ouverture Messages avec prompt pré-rempli).
  - Doctrine de référence (skill Lead correspondante en résumé une ligne).
- Fiche Hélène :
  - Tout ce qui précède.
  - **+ "L'équipe qu'elle pilote · 12 Experts"** avec liste pastillée.
  - Mention "elle orchestre la Roadmap d'Aujourd'hui".

### 6.7 Reconstruction depuis le HTML Messages Claude Design

Le HTML "Messages" mentionné en brief §1 incarne la doctrine Messages V2.0. Sa lecture Sprint 43+ permettra de caler :
- Position exacte Hélène pinned (hauteur, padding, glass).
- Animation de drift de la bulle pinned.
- Styling des sections Travail / Carnet.
- Layout responsive mobile/tablette.
- Signature Expert format exact.

Sprint 40 prépare le terrain en dégageant le legacy Conseiller V1. Sprint 43+ construira Messages V2.0 propre.
