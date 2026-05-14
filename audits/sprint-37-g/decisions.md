# Sprint 37.G — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité Sprint 37 → 37.F.

8 commits Sprint 37.G. Build vert tout du long.

---

## Synthèse

| # | Chantier | Statut |
|---|---|---|
| 1 | F67 — debug onboarding 3e tentative (self-cancelling effect) | ✅ Livré |
| 2 | F68 — config partagée wizard-steps + page native refondue | ✅ Livré |
| 3 | F63 — retrait 3 CTAs redondants vue Calendrier | ✅ Livré |
| 4 | F64 — toggle 3 vues Calendrier (Semaine / Mois / Liste) + localStorage | ✅ Livré |
| 5 | F65 — icônes Lucide Actions Rapides + cohérence animations | ✅ Livré |
| 6 | F66 — /outils preview swap colonnes (texte gauche, mockup droite) | ✅ Livré |
| 7 | F38 — MetricSlider wiré dans scénario A8 (QuickMetricsRow) | ✅ Livré |

Commits :
- `afb9376` [F67] cause identifiée + fix self-cancelling effect
- `40a6220` [F68.config] wizard-steps-config.ts
- `bab224e` [F68.page] /programme/create refondue
- `326f1e9` [F63] retrait CTAs redondants
- `a08e276` [F64] toggle 3 vues + persistance localStorage
- `7aa3007` [F65+F66] icônes Actions Rapides + swap /outils
- `cc92ef8` [F38] MetricSlider wiré scénario A8
- (ce commit) docs decisions.md

---

## F67 — Cause exacte du bug onboarding (3e tentative)

### Diagnostic console fourni par Lead
```
[onboarding] event received {phase: 'idle'}          ← BrandOnboardingTrigger:48
[onboarding] trigger fired, loading…                 ← BrandOnboardingTrigger:80
[onboarding] event received {phase: 'loading'}       ← BrandOnboardingTrigger:48
```
Phase passait à 'loading' mais ne franchissait jamais 'sheet' ou 'resume-choice'.

### Cause racine identifiée

`components/onboarding-marque/BrandOnboardingTrigger.tsx` — bug React classique
**"self-cancelling effect"** :

```typescript
useEffect(() => {
  if (!triggered || phase.kind !== 'idle') return
  let cancelled = false
  ;(async () => {
    setPhase({ kind: 'loading' })   // ← change phase.kind
    const resumable = await getResumableBrandOnboardingSession()
    if (cancelled) return            // ← VRAI car cleanup a déjà tiré
    setPhase({ kind: 'sheet', session: res.session })
  })()
  return () => { cancelled = true }
}, [triggered, phase.kind])          // ← phase.kind dans deps
```

Séquence :
1. Premier rendu : effet s'exécute, `setPhase('loading')` enqueue.
2. React applique : `phase.kind` passe à `'loading'`.
3. Les deps `[triggered, phase.kind]` ont changé → React appelle le **cleanup
   de l'effet précédent** → `cancelled = true`.
4. L'effet re-fire, mais le guard retourne tôt (phase.kind !== 'idle').
5. L'await initial de l'IIFE résout → `if (cancelled) return` → **on n'atteint
   jamais le `setPhase({ kind: 'sheet' })`**.

Phase restait bloqué en `'loading'` à vie.

### Fix appliqué

1. **Deps réduites à `[triggered]`** : le guard `phase.kind !== 'idle'` au
   début de l'effet (lu via closure) suffit à empêcher la double-exécution.
   Plus de cleanup intempestif. L'IIFE async résout proprement et appelle
   `setPhase('sheet')`.
2. **Listener CustomEvent : deps vidées (mount-only)** : évite remove/re-add
   à chaque changement de phase qui pouvait manquer des events pendant la
   transition.
3. **Logs structurés** ajoutés à chaque étape (`trigger_fired`,
   `before_resumable`, `server_returned`, `phase_set_to_sheet`,
   `cancelled_after_resumable`, etc.). Utiles si bug revient Sprint 37.H+.

### Test de validation attendu

Au clic "Lancer un onboarding guidé" :
1. `[onboarding] event received`
2. `[onboarding] trigger fired, loading…`
3. `[onboarding] before_resumable`
4. `[onboarding] server_returned {resumable: false}`
5. `[onboarding] before_create`
6. `[onboarding] phase_set_to_sheet {id: '...'}`
7. La `BrandOnboardingSheet` apparaît à l'écran.

---

## F68 — Config partagée + page native refondue

Page native `/programme/create` n'avait JAMAIS été refondue avec les 9 étapes
Sprint 37.E. Régression cachée depuis Sprint 37.D.

### Source unique de vérité

`lib/programme/wizard-steps-config.ts` :
- `PROGRAMME_WIZARD_STEPS` : 9 étapes typées (period, mix_mode, ancres, sensitive, definir_piliers conditionnel, rythme_engagement, objectifs, formats, confirmation)
- `getStepsForBrand({ hasPiliers })` : filtre les conditionnelles selon contexte
- `getStepLabel(id)` : helper lookup

Évite le drift constaté Sprint 37.D → 37.F.

### Page native refondue

`components/programme-create/ProgrammeCreateForm.tsx` :
- **AJOUT** fieldset 'Comment veux-tu construire ce programme ?' (F45 MixMode) — 2 cards radio (100% CF / Mix externe).
- **REMPLACEMENT** des 2 fieldsets 'Piliers weights' + 'Curseur de risque' par UN seul 'Rythme et niveau d'engagement' (F39+F40 fusion) : 2 sous-sections (Cadence radio + Engagement radio).
- **REMPLACEMENT** fieldset 'Objectif éditorial single' par 'Tes objectifs sur cette période' (F42+F43 fusion) : grid 2 colonnes (Objectif éditorial + Objectif business).
- Mapping `engagement → riskCursor legacy` pour préserver la server action existante (engage→risky, prudent→safe, pose→moderate).
- Pillars weights gardés en variable d'état mais non exposés en UI V1.

---

## F63 — Retrait CTAs redondants vue Calendrier

`components/programme/ConseillerAccess.tsx` — 3 CTAs retirés (redondants avec
la sidebar ProgrammeSidebar Sprint 37.F) :

- CTA primary 'Créer mon prochain plan sur mesure' → sidebar 'Refaire un programme'
- CTA secondaire 'Faire le point' → sidebar Actions Rapides (A7)
- CTA secondaire 'Préparer ma réunion' → sidebar Actions Rapides (E1)

Conservé : bannière régénération <14j (info contextuelle, pas redondante) +
helpers openCreatePlan/openBilan/openReunion utilisés par auto-open
`?action=create-plan`.

La vue Calendrier commence désormais directement par le calendrier interactif.

---

## F64 — Toggle 3 vues Calendrier

`CalendarViewSwitcher.tsx` : segmented control iOS (3 options).

`ProgrammeCalendarView.tsx` : 3 vues conditionnelles :
- **'week'** (default) : vue actuelle hebdomadaire.
- **'month'** : nouveau `MonthGrid`. Grille 7 col × 5-6 lignes. Jours hors mois en opacity 0.4, jours actuels en bg blanc 50%. Posts en pastilles courtes (3 lettres du format) colorées.
- **'list'** : nouveau `FlatList`. Listing chronologique vertical (jour 3 lettres + numéro 20px + FormatBadge + objectif + pilier).

Helper `buildMonthGrid(posts)` : dérive le mois du premier post, calcule
padding début (lundi) et fin (dimanche), regroupe par iso.

Persistance `localStorage 'cf:calendar-view'` lue au mount + sauvegardée à
chaque `changeView`. Default 'week' si rien stocké.

---

## F65 — Icônes + animations Actions Rapides

`components/programme/ProgrammeSidebar.tsx` :
- Ajout icônes Lucide aux 2 Actions Rapides : `ClipboardCheck` pour 'Faire le point', `Presentation` pour 'Préparer ma réunion'.
- `ActionItem` accepte désormais `icon` prop (rendu identiquement aux RouteItems : gap 12, color secondary-label).
- Micro-animation hover `translateX(2px)` ajoutée sur Actions Rapides ET RouteItems (cohérence). Respect `prefers-reduced-motion`.

---

## F66 — /outils preview swap colonnes

`components/outils/OutilsCatalog.tsx` `OutilPreview` :
- Ordre JSX inversé : contenu (titre + description + CTA) à gauche, ToolMockup à droite.
- `grid-template-columns: 300px 1fr` → `1fr 300px`.
- Le texte est désormais la colonne principale.

---

## F38 — MetricSlider wiré scénario A8

`components/conseiller/QuickMetricsRow.tsx` :
- Affichée uniquement quand `scenarioType === 'A8'` (entre body et footer ConseillerSheet).
- 6 metric_types principaux du sub-prompt A8 (followers, engagement, DM clients, mentions presse, commentaires, collaborations).
- État compact : chips bleus `+ Followers / + Engagement / ...`
- Click chip → expand `MetricSlider` inline + bouton 'Annuler'.
- Confirmer slider → formate la valeur (`14k`, `3.2%`) + envoie une phrase (`J'ai 14k followers.`) via `onSubmit` comme un message utilisateur.
- Le chip disparaît de la liste après confirmation (`submitted: Set<MetricType>`).
- Quand tous les metric_types renseignés, le row se cache.

`ConseillerSheet.tsx` : intégration conditionnelle `scenarioType === 'A8' && !isTerminal(state)`. `onSubmit` branché sur `handleSubmit` existant → la phrase entre dans l'historique comme message pilote, le conseiller répond, le bloc `METRICS:` dans la réponse est parsé et insère dans `brand_metrics` (pipeline Sprint 37.C A8 intact).

---

## Vérifications

- `npx tsc --noEmit` propre à chaque commit
- `npm run build` final : vert
- Pas de fichier `.env` modifié

---

## Reste à faire (Sprint 37.H+)

1. **F67 validation runtime** : tester en local + production que la sheet
   s'ouvre bien après le fix. Si bug persiste, investiguer les hypothèses
   secondaires (Vercel config, API key Anthropic).
2. **F68 wizard immersif** : vérifier qu'il consomme bien la nouvelle config
   `wizard-steps-config.ts` partagée. Sprint 37.G n'a refondu que la page
   native ; le wizard immersif a déjà l'ordre correct (Sprint 37.E), pas de
   modification nécessaire mais idéalement aligner sur la config partagée.
3. **F64 mois précédent/suivant** : MonthGrid V1 affiche le mois du premier
   post. Sprint 37.H+ : boutons ‹ › pour naviguer entre mois.
4. **F38 detection question courante** : V1, le pilote choisit quel metric
   il renseigne. V2 pourrait détecter automatiquement la question A8 en
   cours et afficher uniquement le slider du metric_type courant.

---

## Notes d'exécution

- Travail mené sur `/Users/ulysselemoine/Desktop/creative-fair-v60`, branche `sprint-37`.
- Estimation 37.G : 12-15 commits, ~7h45. Réalisé : 8 commits denses + 1 audit. Build vert à chaque commit.
- Pas de tag git.
- Cumul branche `sprint-37` : 83 commits Sprint 37.F + 8 Sprint 37.G + 1 docs = 92 commits cumulés.
