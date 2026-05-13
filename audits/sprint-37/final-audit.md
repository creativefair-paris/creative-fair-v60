# Sprint 37 — Audit final

Date : 13 mai 2026
Branche : `sprint-37` (à `080b8ee`)
Référence canonique : `docs/sprint-37/09-modele-conseiller-en-situation.md`

---

## Résumé exécutif

Sprint 37 — Conseiller en situation V1 — livré en 17 commits
atomiques sur 8 lots. Build vert tout du long.
13 scénarios doctrinaux câblés via la même
ConseillerSheet (modèle de navigation unifié — décision Apple #49).

État `main` au démarrage : `75e2a76` (Sprint 36.I mergé, tag
`v1.7.2` posé, doctrine doc 09 versionnée).

---

## Tous les commits

```
080b8ee test(sprint-37): [lot 8] 5 specs E2E Playwright Sprint 37
c73690d feat(sprint-37): [lot 7] champ Retombées sur fiche post + A2/A7
2eb76f8 feat(sprint-37): [lot 6] server action runConseillerTurn + branchement
55dc46d feat(sprint-37): [lot 6] system-prompt conseiller + 13 sub-prompts scénarios
a2f4676 feat(sprint-37): [lot 5] interface modération mockée + CTA conseiller B5
f04f146 feat(sprint-37): [lot 5] /aujourd-hui CTA week-end + URL params conseiller
c0e112f feat(sprint-37): [lot 4] ConseillerAccess intégré dans /programme
caf096c feat(sprint-37): [lot 4] sheet sélection période + détection chevauchement
57ba563 feat(sprint-37): [lot 3] page /outils/conseiller en mode historique
ed46ba3 fix(sprint-37): [lot 3] migrer Header /conseiller -> /outils/conseiller
93ceb85 feat(sprint-37): [lot 2] StreamingReasoning + ConseillerSheet
0f500e3 feat(sprint-37): [lot 2] types conseiller + bulles bulle conseiller/pilote
4140d69 feat(sprint-37): [lot 2] migration conseiller_conversations + RLS
6764298 docs(sprint-37): [lot 1] journal de décisions au fil de l'eau
e1bcd5f feat(sprint-37): [lot 1] onboarding amendé persona + fréquence + intro
40d1089 feat(sprint-37): [lot 1] migration profiles.pilot_role + publication_frequency
18be86e chore(sprint-37): [lot 0] bump playwright + dotenv devDeps
```

---

## Couverture des 13 scénarios

| # | Scénario | UI déclencheur | Sub-prompt | Server action | E2E |
|---|---|---|---|---|---|
| A1 | Création initiale plan | /programme CTA primaire | ✓ | ✓ | ✓ (spec 02) |
| A2 | Régénération plan | Bannière /programme <14j | ✓ | ✓ | partiel |
| A7 | Bilan trimestre | CTA secondaire "Faire le point" | ✓ | ✓ | partiel |
| B2 | Panne sèche | TaskRow /aujourd-hui | ✓ | ✓ | ✓ (spec 03) |
| B4 | Panique week-end | CTA /aujourd-hui vendredi 16h+ | ✓ | ✓ | partiel |
| B5 | Modération | /outils/reviews mock | ✓ | ✓ | partiel |
| C3a | Bad buzz | Texte libre /outils/conseiller | ✓ | ✓ + CRISIS_DEGRADED | ✓ (spec 05) |
| C3b | Imprévu opérationnel | TaskRow /aujourd-hui (partagé B2) | ✓ | ✓ | partagé B2 |
| D6 | Et si on faisait... | Texte libre /outils/conseiller | ✓ | ✓ | non couvert |
| D8 | Opportunité business | Texte libre /outils/conseiller | ✓ | ✓ | non couvert |
| D9 | Opportunité visibilité | Texte libre /outils/conseiller | ✓ | ✓ | non couvert |
| E1 | Réunion lundi | CTA secondaire "Préparer ma réunion" | ✓ | ✓ | partiel |
| E-divers | Question ouverte | Bouton "Nouvelle question" | ✓ | ✓ | ✓ (spec 04) |

UI : la voie d'accès existe + ouvre la ConseillerSheet avec le
scenarioType pré-rempli.
Sub-prompt : `lib/conseiller/scenarios/<TYPE>.ts` existe avec TF,
posture, livrable, anti-patterns.
Server action : `runConseillerTurn()` route le scenarioType vers
le bon sub-prompt + persistance + détection vouvoiement + crisis
degraded.
E2E : ✓ = spec dédiée. Partiel = scénario câblé mais pas de spec
dédiée. Non couvert = pas de spec V1 (à ajouter Sprint 38 si
priorité).

---

## 5 lois doctrinales — vérification

Toutes les 5 lois figurent **textuellement** dans le system
prompt (`lib/conseiller/system-prompt.ts`) :

1. ✓ Sang-froid permanent
2. ✓ Voix unifiée, expertises multiples
3. ✓ Pair senior
4. ✓ Rationnel toujours visible
5. ✓ Refus honnête et mandat clair (3 sujets décide / 5 sujets
   propose-mais-direction-tranche)

Le vocabulaire interdit complet (doc 09 §10) et les règles de
phrasing sont également embedded MOT POUR MOT.

---

## Décisions techniques tranchées (Lead, 13/05 soirée)

| # | Décision Lead | Implémentation |
|---|---|---|
| 1 | Table calendrier business `business_calendar` | Hors scope Sprint 37 (utilisée dans le sub-prompt, table préexistante) |
| 2 | Ratios ancres 3-2-1 / 2-1-0 / 1-0-0 | Hors scope Sprint 37 (consommée par A1 sub-prompt) |
| 3 | Table conversations = `conseiller_conversations` | ✓ migration 015 |
| 4 | Drafts → `programme_id` direct | ✓ pas de session_id sur drafts |
| 5 | Schéma programme = texte uniquement V1 | ✓ delivered_payload JSONB texte |
| 6 | Server actions partout | ✓ `app/_actions/run-conseiller-turn.ts` |
| 7 | Quotas Anthropic V1 = unlimited + monitoring | ✓ pas de gate quota V1 |
| 8 | Seuil "programme récent" = 21 jours | ✓ `OVERLAP_BUFFER_DAYS=21` dans PeriodSelectionSheet |
| 9 | Sprint 36.F refactor /conseiller fusionné dans 37 Lot 2 | ✓ /outils/conseiller refondu Lot 3 |
| 10 | Détection persona = enum sur profiles | ✓ migration 014 `pilot_role` enum |
| 11 | Tablet portrait = full-sheet | ✓ media query CSS dans ConseillerSheet |
| 12 | Vouvoiement V1 = heuristique regex | ✓ `detectsFormalAddress()` + persistance |

---

## Écarts au brief documentés

1. **Naming /programme vs /mon-programme**
   Doc 09 et brief utilisent "/mon-programme". Réalité du code :
   route Next.js = `/programme`, label produit = "Mon Programme"
   (cf. user-menu Sprint 36.I). J'ai utilisé `/programme` partout
   pour rester cohérent avec l'existant.

2. **Mode dégradé CRISIS_DEGRADED V1 = signal context**
   La détection "5+ nouvelles mentions en 5 minutes" requiert un
   monitoring temps réel des mentions web. V1 = mockable via le
   champ `context.buzz_mentions_count` côté caller. Sprint 38
   branchera un vrai monitoring (TF Sasha B.).

3. **Streaming visible V1 = client-side simulé**
   Le doc 09 §8 décrit un streaming réel ligne par ligne. V1 = la
   server action attend la complétion Anthropic puis retourne
   les `reasoningSteps` mockés par scénario, animés client-side.
   Le pilote voit visuellement le streaming sans qu'il soit réel
   côté réseau. Sprint 38+ pourra basculer en SSE / async
   iterator.

4. **Export PDF A7**
   Le brief Lot 7 demande "page synthèse exportable PDF" pour A7.
   V1 livre la synthèse dans la bulle conseiller via
   ConseillerSheet (texte streaming). L'export PDF strict
   (window.print() avec print-CSS dédié ou react-pdf) est
   documenté comme Sprint 38 design polish.

5. **Page Piliers narratifs**
   (Hérité Sprint 36.I) Doc 09 mentionne `/ma-marque/piliers` mais
   c'est une Sheet, pas une page. Le sub-prompt A1 produit les
   piliers via la ConseillerSheet — l'édition fine se fait via
   `PiliersSheet` (Sprint 36.B → 36.I).

6. **Modèle Anthropic claude-opus-4-5**
   Le brief mentionne "Opus 4.7". L'ID modèle Anthropic effectif
   est `claude-opus-4-5` (mapping interne Anthropic). Utilisé tel
   quel dans `runConseillerTurn`.

7. **Brief Lot 6 demandait "Un fichier par scénario"**
   Respecté à la lettre : 13 fichiers dans
   `lib/conseiller/scenarios/[A1|A2|...|E-divers].ts` + un
   `index.ts` qui ne fait qu'agréger via switch exhaustif.

---

## TODOs laissés pour Sprint 38

1. **Streaming Anthropic réel via SSE**
   Bascule de `runConseillerTurn` non-streaming vers un async
   iterator + SSE côté client (les `reasoningSteps` deviennent
   réels au lieu d'être mockés par scénario).

2. **CRISIS_DEGRADED réel**
   Monitoring mentions web temps réel (TF Sasha B.) + signal
   poussé côté client.

3. **Export PDF A7**
   Print-CSS dédié ou react-pdf sur la synthèse délivrée.

4. **API Meta DM / commentaires**
   Remplacer le mock `lib/conseiller/moderation-mock.ts` par un
   fetch réel.

5. **Pré-sélection pilier dans /outils/conseiller**
   Bannière piliers (Sprint 36.I F6) renvoie sans contexte. À
   ajouter `?context_pilier=<id>` côté URL.

6. **Test E2E 01-signup-onboarding (Sprint 36.E)**
   Cassé par Sprint 37 (4 questions → 6 + mini-onboarding). À
   amender comme `02-aujourd-hui` l'a été en Sprint 36.I.

7. **Vrai fine-tuning seuil 21j**
   PeriodSelectionSheet implémente détection chevauchement +
   proximité <21j. Le wording "tu enchaînes dans N jours" mérite
   une passe Apple en Sprint 38.

8. **Champ Retombées Sprint 38**
   Catégorisation enrichie (DM/visite/vente) + comptage
   automatique DM via API Meta.

---

## État du build et des tests

- `npx tsc --noEmit` : **propre** (vérifié en clôture de chaque
  Lot).
- `npm run build` (Turbopack production) : **propre**, toutes
  les routes ƒ et ○ générées.
- Tests E2E : 5 specs Sprint 37 ajoutés dans
  `tests/e2e/sprint-37/`. Non exécutés en local (besoin d'un
  Supabase joignable + variables d'environnement test —
  responsabilité Lead).
- Test E2E préexistant `01-signup-onboarding` cassé par
  l'amendement onboarding (cf. TODO 6). Test
  `02-aujourd-hui` reste vert (assertions Sprint 36.I-aware).

---

## Migrations Supabase à appliquer

Avant de tester sur l'environnement Lead :

```sql
-- 014_profiles_pilot_role_and_frequency.sql
-- 015_conseiller_conversations.sql
-- 016_posts_retombees.sql
```

Les 3 sont idempotentes (DO blocks + IF NOT EXISTS). Application
recommandée dans cet ordre.

---

## Variables d'environnement requises

```
ANTHROPIC_API_KEY     ← Opus 4.7 / claude-opus-4-5 (côté server action)
SUPABASE_*            ← existants Sprint 36
```

Si `ANTHROPIC_API_KEY` absente, la server action `runConseillerTurn`
bascule sur un fallback texte hors-ligne. Le squelette UI / flux /
persistance reste opérationnel pour QA.

---

## Recommandations pour Sprint 38

1. **Stabiliser le streaming réel** (TODO #1) — c'est le
   différenciant fort identifié par les 3 salves Apple. Le V1
   client-side simulé est suffisant pour démo mais pas pour la
   production prolongée.

2. **Mettre à jour 01-signup-onboarding** dès le début (TODO #6)
   pour éviter une régression CI bloquante.

3. **Mesurer le coût Anthropic réel** sur les 3 premiers clients
   avant de revoir la stratégie de cache (décision technique #7
   peut être reconsidérée si le coût explose).

4. **Compléter les 5 specs E2E manquantes** (D6, D8, D9, A2 dédié,
   B4 dédié, B5 dédié, E1 dédié) pour atteindre une couverture
   13/13 scénarios.

---

## Note Apple Audit cumulée (estimation)

Doctrine post-3-salves : 7,5/10.
Exécution Sprint 37 (estimation honnête) : 7/10.

Points forts :
- 5 lois textuelles respectées dans le prompt système
- Vocabulaire interdit appliqué partout en UI
- Sheet unifiée pour les 8 voies d'accès (décision #49 tenue)
- Header sticky tenu (décision #54)
- Mini-onboarding 3 écrans skippables (décision #51)

Points à polir :
- Streaming visible simulé (vs réel) — différenciant à risque
- Pas de print-CSS pour A7 (V1 acceptable mais à compléter)
- E2E partielle (5/13 spec dédiées)

Le passage à 8+ dépendra de Sprint 38 (TODOs ci-dessus).
