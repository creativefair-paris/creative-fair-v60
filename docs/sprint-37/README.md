# Sprint 37 — Cadrage du flux conversationnel de génération du programme

Spec documentaire produite par Sprint 37-SPEC. Aucune ligne de code
application. Le Lead arbitre, puis Sprint 37 exécution est dispatché
sur cette base.

## Résumé exécutif (200 mots max)

Le flux conversationnel de génération du programme est l'acte
stratégique qui transforme la promesse Creative Fair (*« un plan, un
cadre, une voix »*) en posts concrets sur 4 à 6 semaines. Pas un chat
ouvert, pas la création d'un seul post : c'est une session courte
(8-15 minutes) en 4 tours de conversation max, qui produit 8 à 14
drafts validables par le user, ancrés sur le business_calendar de la
marque. Trois portes d'entrée envisagées (CTA `/aujourd-hui`,
suggestion `/conseiller`, lien `/programme`) ; V1 prioritaire est la
porte CTA `/aujourd-hui`. Le livrable côté user est une vue de
restitution où il valide tout d'un coup, retravaille un post, ou en
rejette/régénère individuellement — pattern Apple : prévisualisation
avant programmation. Stack technique : 2 nouvelles tables
(programme_generation_sessions, drafts), prompts Claude Opus à 3
couches (doctrine cachée, contexte marque caché, état dynamique), cost
~11-14 centimes par session avec cache. Sprint exécution estimé à 19
commits en 6 lots (DB → prompts → UI → activation → tests → audit),
faisable en 1 nuit autonome si tous les *À ARBITRER LEAD* sont
tranchés en amont.

## Table des matières

| # | Doc | Sujet |
|---|---|---|
| 1 | `01-vision.md` | Quoi, quand, pourquoi. Différence avec /conseiller et /post-creator. |
| 2 | `02-grammaire-conversationnelle.md` | Comment Creative Fair parle. 10 exemples concrets. |
| 3 | `03-ancres-business-calendar.md` | Comment le flux s'ancre sur calendrier_business. |
| 4 | `04-prompts-systeme-claude.md` | Architecture 3 couches + cache strategy. |
| 5 | `05-etats-flux.md` | Machine à états + schéma DB proposé. |
| 6 | `06-restitution-livrable.md` | Vue de proposition + actions user. |
| 7 | `07-edge-cases-erreurs.md` | 10 cas non-nominaux à couvrir. |
| 8 | `08-plan-execution.md` | Découpe Sprint 37 en 19 commits. |

## Points "À ARBITRER LEAD" — index consolidé

Liste exhaustive des arbitrages doctrinaux ou techniques que cette
spec laisse au Lead. **À acquitter avant lancement Sprint 37 exécution.**

### Doctrine produit
- Rythme nominal trimestriel vs mensuel vs bi-trimestriel (doc 01)
- Porte d'entrée 3 (régénération depuis `/programme`) en V1 ou V2 (doc 01)
- Porte d'entrée 2 (suggestion depuis `/conseiller`) en V1 ou V2 (doc 01)
- Programme libre (sans ancre business) autorisé en V1 ? (doc 03)
- Création automatique d'un `programmes.arc_narratif` au *Tout valider* ? (doc 06)

### UX
- 4 tours de conversation max : adapté ? (doc 02)
- Reprise asynchrone (session dormante 7 jours) : cas attendu V1 ? (doc 02)
- Étape *« Aperçu calendrier »* avant *Tout valider* ? (doc 06)
- *Demander un remplacement* : motif guidé (4 boutons + textarea) ou
  textarea libre ? (doc 06)
- Badge *« édité »* sur les drafts modifiés ? (doc 06)

### Backend
- Source business calendar : `business_calendar` ou `calendrier_business` ?
  Fusion ou choix unique ? (doc 03)
- Ratios par importance d'ancre (3-2-1 pour pivot, 2-1-0 majeur,
  1-0-0 mineur) : valeurs par défaut OK ? (doc 03)
- Opus exclusif vs cascade Opus→Sonnet pour ce flux ? (doc 04)
- Naming table : `programme_generation_sessions` vs
  `conversations_programme` ? (doc 05)
- `programme_id` direct vs `programme_session_id` côté drafts ? (doc 05)
- TTL avant `abandonne` (7 jours proposé) ? (doc 05)
- Une seule session active par user en V1 ? (doc 05)
- Schéma JSON `programme` : inclure visuel ou rester texte ? (doc 04)
- Server actions vs API routes ? (doc 08)
- Quotas Anthropic V1 : limit-then-hide ou unlimited + monitoring ? (doc 07)
- Seuil *« déjà un programme récent »* (21 jours proposé) ? (doc 07)
- Conflit date avec posts manuels : tolérer ou bloquer ? (doc 07)
- Ancres expirées : régénération auto ou demande user ? (doc 07)
- Programme par défaut en fallback Claude down : proposer ou reporter ?
  (doc 07)
- Limite max 3 régénérations par draft : V1 ou unlimited ? (doc 06)

### Sprint planification
- Sprint 36.F (refactor `/conseiller`) avant 37 ou non ? (doc 08)
- Tests E2E Sprint 37 : appel Claude réel ou mock ? (doc 08)
- Budget Anthropic dev/test Sprint 37 ? (doc 08)

## Comment consommer cette spec

1. **Première lecture** : `README.md` + `01-vision.md`. Donne la
   posture stratégique en 10 minutes.
2. **Lecture doctrinale** : `02-grammaire-conversationnelle.md` +
   `06-restitution-livrable.md`. Le ton et la finalité.
3. **Lecture technique** : `04-prompts-systeme-claude.md` +
   `05-etats-flux.md`. Architecture sous le capot.
4. **Lecture exécution** : `08-plan-execution.md`. Plan de bataille.
5. **Lecture robustesse** : `03-ancres-business-calendar.md` +
   `07-edge-cases-erreurs.md`. Tout ce qui peut mal tourner.

## Que faire au réveil

1. Trancher les arbitrages ci-dessus (index "À ARBITRER LEAD")
2. Si validation OK : merge `sprint-37-spec` sur main (pas de tag)
3. Lancer Sprint 37 exécution avec la spec validée comme référence
4. Si refonte spec nécessaire : amender les docs sur la branche
   `sprint-37-spec` avant merge
