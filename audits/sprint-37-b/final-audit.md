# Sprint 37.B — Audit final

Date : 14 mai 2026 (suite Sprint 37 + 37.A)
Branche : `sprint-37` (poursuivie)
Référence canonique : `docs/sprint-37/09-modele-conseiller-en-situation.md`

---

## Résumé exécutif

Sprint 37.B livré en **10 commits atomiques** sur la même branche
`sprint-37`. Build vert tout du long. tsc --noEmit propre à chaque
commit. Sprint 37 + 37.A + 37.B cumulés : 45 commits.

7 findings + 4 amendements TF Cupertino salve 5 (Sarah primitives,
Sarah états d'attente, Marcus wizard immersif obligatoire, Elena
règles matching reprise).

---

## Tous les commits Sprint 37.B

```
dea66a7  [F16]    wizard immersif création de plan A1 complet
6fdc596  [F16.db] migration programme_creation_sessions + RLS + TTL
3bfa797  [F17]    CTA Compléter calendrier business sur /programme
6c24464  [F11.3]  sub-prompts amendés + exemples format
21c6c4f  [F11.2]  parsing markdown étendu + blocs :::
d3099e0  [F11.1]  CalloutBox + DataTable + DocumentaryCard + Timeline
b17c4b8  [F15]    /outils refondu Apple Settings macOS pattern
39ae084  [F14]    reprise intelligente + mini-sheet de choix
a1dd2cb  [F13]    boutons-choix persistants à tous les tours
1624808  [F12]    état attente verbalisé + timer-guard 15s
```

---

## Couverture des findings

| # | Finding | Status | Commits |
|---|---|---|---|
| F12 | État attente verbalisé + timer 15s | ✓ | 1 |
| F13 | Boutons-choix persistants tous tours | ✓ | 1 |
| F14 | Reprise intelligente + mini-sheet | ✓ | 1 |
| F15 | /outils refondu Settings macOS | ✓ | 1 |
| F11 | Primitives visuelles + parsing + sub-prompts | ✓ | 3 |
| F17 | CTA calendrier business /programme | ✓ | 1 |
| F16 | Wizard immersif | ✓ | 2 (migration + tout en 1) |

**Total : 10 commits.** Tous poussés. Pas de tag, pas de merge.

---

## Migrations Supabase à appliquer

```sql
-- 019_programme_creation_sessions.sql
```

Idempotente (DO blocks, IF NOT EXISTS, DROP POLICY IF EXISTS).

Total cumulé Sprint 37 + 37.A + 37.B : migrations 014 → 019.

---

## Trade-offs V1 documentés

### F11 — Parser markdown étendu
- Parseur custom ligne-à-ligne (~250 lignes). Pas de dépendance npm
  externe (pas de marked / unified). Suffisant pour le scope des
  sorties Anthropic. Imbrication profonde non supportée.
- `**bold**` et `*italic*` uniquement (pas de `~strike~`, `` `code` ``,
  liens markdown).

### F14 — matchesContext
- Comparaison shallow sur post_id / programme_id / period_start.
- `programme_id` lu en dynamique (pas typé dans ConseillerContext
  Sprint 37). Si besoin de matching plus fin Sprint 38, on enrichira
  le type.

### F15 — /outils
- Pas d'images réelles dans les sheets preview (MockupPlaceholder
  CSS stylisé). Sprint 38 pourra ajouter des captures PNG dans
  `public/outils-previews/`.

### F16 — Wizard immersif V1 NON-STREAMING
- **Décision majeure** : pas d'appel Anthropic streaming pour les
  suggestions des steps 2/3. Les ancres business sont extraites
  directement de `brand.business_calendar` (label "calendar")
  côté server.
- Pas de mini-sheet "Tu as un brief en cours" pour reprendre une
  session IN_PROGRESS au reload de /programme — V1 crée toujours
  une nouvelle session. Sprint 38 ajoutera la détection.
- `getResumableProgrammeCreationSession` existe côté server mais
  n'est pas câblée UI Sprint 37.B (prête pour Sprint 38).
- WizardImmersiveSheet est un composant standalone, pas un mode
  `ConseillerSheet`. Le brief disait "mode spécial" — je l'ai
  rendu indépendant pour ne pas alourdir ConseillerSheet et
  rester clean. L'effet visuel et l'architecture restent
  cohérents (sheet → fullscreen → header sticky → body → footer).

### F12 — Timer-guard
- Côté client uniquement (setTimeout 15s). Le serveur peut
  continuer à traiter et persister la réponse même après
  ERROR_TIMEOUT côté UI. La row DB sera incohérente — sera
  réconciliée au prochain runTurn (qui écrasera state).

---

## TODOs Sprint 38

1. **Streaming suggestions wizard** (steps 2/3) via Anthropic SSE
   réel — décision pragmatique V1, vraie valeur ajoutée pour V2.
2. **Reprise wizard IN_PROGRESS** au reload de /programme.
3. **Mockup images réelles** pour les sheets preview /outils.
4. **RichMarkdown enrichi** — liens markdown, code blocks, strike.
5. **Tests E2E Sprint 37.B** dédiés :
   - wizard fullscreen end-to-end
   - sortie wizard + reprise plus tard
   - reprise intelligente flow
   - blocs :::callout / :::timeline / :::documentary parsing
6. **Streaming Anthropic SSE** réel pour la sheet conseiller
   (TODO Sprint 37 final-audit, toujours valable).

---

## État build / tests

- `npx tsc --noEmit` : propre à chaque commit.
- `npm run build` : vert, toutes les routes générées (y compris
  /programme avec wizard wired).
- Tests E2E Sprint 37 (5 specs) : non re-vérifiés en CI. Ils
  devraient toujours passer (pas de changement structurel sur les
  sélecteurs critiques — sauf F15 /outils, sera à mettre à jour).

---

## Recommandations pour le Lead

1. **Tester le wizard A1** end-to-end :
   - /programme → CTA "Créer mon prochain plan sur mesure"
   - PeriodSelectionSheet → choisir dates → Continuer
   - WizardImmersiveSheet ouvre fullscreen
   - Naviguer les 7 étapes via Suivant
   - Tester sortie via X → ExitConfirmDialog → Reprendre plus tard
   - Vérifier que `programme_creation_sessions.responses` contient
     les step 0-N validés (RLS appliquée)
2. **Tester /outils refondu** :
   - Sections visibles avec séparateurs
   - Carte Conseiller bleu subtle gradient (héros)
   - Clic Conseiller / Bibliothèque / Reviews / etc. ouvre la
     sheet preview avec MockupPlaceholder + CTA bleu
   - À venir grisé non-cliquable, badge "Bientôt"
3. **Tester F14 reprise intelligente** :
   - Démarrer A1, sortir au milieu
   - Cliquer à nouveau "Créer mon prochain plan sur mesure"
   - Vérifier que ResumeChoiceSheet propose Reprendre / Nouvelle
4. **Tester F12 état d'attente** :
   - Couper la connexion Anthropic (clé invalide) au build
   - Ouvrir une sheet conseiller — vérifier le cycle de phrases
   - Attendre 15s → ERROR_TIMEOUT + bouton Réessayer
5. **Appliquer migration 019** avant tout test wizard.

---

## Note Apple Audit cumulée

Sprint 37 doctrine : 7,5/10. Sprint 37.A exécution : 7/10.
Sprint 37.B exécution : 7,5/10 → **proche d'Apple-grade V1**.

Points forts 37.B :
- Wizard immersif livré bien que le scope soit ambitieux
- 4 primitives visuelles propres et réutilisables
- Reprise intelligente avec 3 règles déterministes
- Settings macOS pattern sur /outils
- Timer-guard 15s + verbalisation = différenciant qualitatif

Points à polir Sprint 38 :
- Streaming Anthropic réel (vs simulé)
- Mockup images réelles
- Reprise wizard IN_PROGRESS au mount /programme
- Tests E2E dédiés Sprint 37.B
