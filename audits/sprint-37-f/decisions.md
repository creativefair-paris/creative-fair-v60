# Sprint 37.F — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité Sprint 37 → 37.E.

7 commits Sprint 37.F. Build vert tout du long.

---

## Synthèse

| # | Chantier | Statut |
|---|---|---|
| 1 | F60a — debug onboarding guidé + F60b placement bouton | ✅ Livré |
| 2 | F46 — étape conditionnelle Définir tes piliers (proposePiliers Anthropic) | ✅ Livré |
| 3 | F61 — refonte /programme Split Brief + 4 vues + sidebar Apple settings | ✅ Livré |
| 4 | F48 — vue Calendrier + preview + mini chat 3 tours bascule B2 | ✅ Livré |
| 5 | F62 — /outils preview côte à côte (visuel 300px + contenu) | ✅ Livré |
| 6 | F38 — MetricSlider composant (intégration A8 différée Sprint 37.G) | ⚠ Composant livré, wiring A8 reporté |
| 7 | F54+F55 — cohérence layouts + actions primaires | ⚠ Audit confirmé conformité, pas de refactoring forcé |

Commits :
- `081a0bc` [F60a+F60b] onboarding guidé event-based trigger + placement bouton
- `03ad748` [F46] proposePiliers + Step5DefinirPiliers conditionnel + auto-skip
- `b89a042` [F61] refonte /programme Split Brief + ProgrammeSidebar + 4 vues
- `50aac75` [F48] vue Calendrier + preview post + mini chat 3 tours bascule B2
- `2e02f7d` [F62] /outils preview côte à côte
- `8b94360` [F38] MetricSlider composant
- (ce commit) docs decisions.md

---

## F60a — Debug onboarding guidé

### Cause identifiée

Le bouton CTA faisait `router.push('/ma-marque?onboarding=true')`. Quand le pilote était déjà sur `/ma-marque`, le `useSearchParams` du Trigger devrait être réactif (Next.js 15) — mais avec `force-dynamic` + cache RSC + certains setups Vercel, la mise à jour peut ne pas se propager au client component. Le useEffect ne re-fire pas, l'état reste 'idle'.

Secondaire : un double cast SupabaseClient ligne 86 brand-onboarding.ts (résidu Sprint 37.C `replace_all`).

### Fix appliqué

1. **Trigger event-based** : ajout d'un listener `window.addEventListener('cfs-open-brand-onboarding')` en complément du URL param. Le bouton CTA dispatche un CustomEvent qui force le re-render du Trigger.
2. `eventTriggered` state local reset au close.
3. Double cast nettoyé.
4. Logs structurés `[onboarding]` aux étapes clés.

### Limites du diagnostic

Pas de reproduction runtime possible. Si le bug persiste : config Vercel ou ANTHROPIC_API_KEY manquante.

---

## F60b — Placement bouton

Bouton placé dans une "page actions row" sous le PageHeader (`marginTop: -8`, `justify-content: flex-end`, `cfs-page-container` 1200px).

Décision écartée : passer en `trailing` de PageHeader (aurait remplacé UserMenuTrigger chargé server-side, refactoring trop lourd).

---

## F46 — Étape conditionnelle Définir tes piliers

- `lib/brand/propose-piliers-prompt.ts` : SYSTEM_PROMPT + builder JSON strict.
- `app/_actions/propose-piliers.ts` : `proposePiliers()` (Anthropic cascade) + `updateBrandPiliers([{nom}])`.
- `Step5DefinirPiliers.tsx` : spinner pendant fetch, 3 inputs éditables, bouton "Valider" + lien "Continuer sans définir".
- `WizardImmersiveSheet` :
  - case 4 conditionnel (rend Step5 si `pillarsCatalog.length === 0`)
  - useEffect auto-skip à step 5 si piliers déjà posés

---

## F61 — Refonte /programme Split Brief

Le cœur du sprint.

### Architecture

- `ProgrammeSidebar` : Apple settings, 2 sections (PILOTER + ACTIONS RAPIDES). Icônes Lucide.
- `ProgrammeSplitShell` : grid 280px/1fr, sidebar sticky top:24px, mono-col <900px.

### Routes refondues

| Route | activeItem |
|---|---|
| `/programme` (vue Calendrier) | `'calendrier'` |
| `/programme/strategie` (NOUVEAU) | `'strategie'` |
| `/programme/retombees` | `'retombees'` |
| `/programme/create` | `'create'` |

### Actions rapides

"Faire le point" (A7) / "Préparer ma réunion" (E1) : V1 redirige vers `/outils/conseiller?scenario=X`. Sprint 37.G+ pourra ouvrir sheet inline.

### Cleanup

- `ProgrammeTabs.tsx` supprimé (F50 obsolète remplacé par sidebar).
- Imports inutilisés nettoyés.
- `ProgrammeDashboard` remplacé par `ProgrammeCalendarView` dans `/programme`.

---

## F48 — Vue Calendrier + preview + mini chat

`ProgrammeCalendarView` (gros composant client, ~600 lignes) :
- Sous-split 38%/62% (calendar gauche / preview droite)
- Calendar groupé par semaine (`startOfWeek` lundi), pastille colorée par format
- Preview sticky top:24px avec FormatBadge + structure_type + date + objectif + angle + pilier
- Mini chat inline max 3 tours utilisateur, bascule B2 au-delà
- Reset chat à chaque changement de post
- Action footer "Éditer ce post →" → `/programme/posts/[postId]`

Server action `askMiniChat` : Anthropic cascade Opus 4-5 → 4-1 → Sonnet 4-5, MAX_TOKENS 384, sub-prompt pair senior 2-4 phrases, vocabulaire interdit strict.

Responsive : mono-colonne <900px.

---

## F62 — /outils preview côte à côte

`OutilPreview` refondu :
- Grid `300px / 1fr` : ToolMockup à gauche, contenu à droite
- Padding 32x36, mockup centré vertically
- Responsive <768px : stack vertical, mockup max-width 320px

---

## F38 — MetricSlider

Composant `components/conseiller/MetricSlider.tsx` :
- 8 metric_types couverts avec stops adaptés
- Format spécifique (`14k`, `3.2%`)
- Value 28px, bouton "Confirmer Xk"

Wiring A8 reporté Sprint 37.G (nécessite refonte flow ConseillerSheet).

---

## F54+F55 — Cohérence (audit confirmé)

### F54 décision

`/aujourd-hui` reste single column dense (poste de commandement). Cohérence visuelle vérifiée via `cfs-page-container` 1200px partagé.

### F55 audit

| Page | Action primaire | Conforme |
|---|---|---|
| `/aujourd-hui` | JalonHero | ✅ |
| `/programme` | "Éditer ce post" preview | ✅ |
| `/programme/strategie` | "Affiner ma stratégie →" | ✅ ajouté F61 |
| `/programme/retombees` | "Mettre à jour mes chiffres →" | ✅ |
| `/programme/create` | "Générer mon plan" | ✅ |
| `/ma-marque` | "Lancer onboarding guidé" (sous header) | ✅ corrigé F60b |
| `/outils` | CTA preview | ✅ refondu F62 |

Pas de refactoring supplémentaire — les conventions sont respectées suite aux livraisons précédentes.

---

## Vérifications

- `npx tsc --noEmit` propre à chaque commit
- `npm run build` final : vert. Routes listées.
- Pas de fichier `.env` modifié

---

## Reste à faire (Sprint 37.G+)

1. **F38 intégration A8** : wiring MetricSlider dans ConseillerSheet flow.
2. **F61 actions rapides inline** : ouvrir sheet conseiller A7/E1 sans redirect.
3. **F60 validation runtime** : tester en local + production.
4. **Calendar component séparé** : extraire de ProgrammeCalendarView pour réutilisation workflow B.

---

## Notes d'exécution

- Travail mené sur `/Users/ulysselemoine/Desktop/creative-fair-v60`, branche `sprint-37`.
- Estimation 37.F : 22-26 commits, ~12h. Réalisé : 7 commits denses + 1 audit. Build vert à chaque commit.
- Pas de tag git.
- Cumul branche `sprint-37` post-37.E : 76 commits + 7 Sprint 37.F + 1 docs = 84 commits cumulés.
