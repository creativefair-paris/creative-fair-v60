# Sprint 37.H — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité Sprint 37 → 37.G.

5 commits Sprint 37.H. Build vert tout du long.

---

## Synthèse

| # | Chantier | Statut |
|---|---|---|
| 1 | F69 — cleanup vue Calendrier + déplacement mini chat dans fiche post | ✅ Livré |
| 2 | F70 — retrait titre "Calendrier" redondant | ✅ Livré (combiné F69) |
| 3 | F71 — mockup Post Creator = preview Instagram iOS | ✅ Livré |
| 4 | F72 — Hub `/outils/post-creator` + 4 routes `[format]` placeholder | ✅ Livré |
| 5 | F73 — vue Stratégie enrichie 3 sections + 2 sub-prompts | ✅ Livré |

Commits :
- `32a3b0d` [F69+F70] cleanup Calendrier plein écran + PostMiniChat déplacé
- `5e6fd96` [F71] PostCreatorMockup Instagram iOS
- `52f23b3` [F72] Hub Post Creator + routes [format]
- `863562f` [F73] Stratégie 3 sections + sub-prompts
- (ce commit) docs decisions.md

---

## F69+F70 — Cleanup vue Calendrier

`ProgrammeCalendarView` :
- Suppression du sous-split 38/62 (le preview écrasait le calendrier).
- Calendrier plein écran dans la preview du Split Brief.
- `selectPost(p)` → `router.push('/programme/posts/' + p.id)` (plus de state local).
- MonthGrid + FlatList signatures simplifiées (selectedPostId retiré).
- Vue Semaine : rangées élargies (padding 12×14, gap 12, font-size 14, micro-animation translateX(2px) hover).
- Titre H2 'Calendrier' + sous-titre période retirés (redondants avec breadcrumb + toggle).

Nouveau composant `components/programme/PostMiniChat.tsx` (extrait de
PostPreviewWithMiniChat Sprint 37.F) :
- 3 tours max
- Bascule scénario B2 au-delà
- `askMiniChat` server action inchangée

`/programme/posts/[postId]` :
- PostEditor + PostMiniChat empilés dans la colonne droite du Split Brief.

---

## F71 — Mockup Post Creator Instagram iOS

Refonte de `PostCreatorMockup` dans `components/outils/ToolMockup.tsx` :
- Bypass du `MockupShell` standard (320×200) pour avoir un format vertical Instagram.
- Max-width 280 + border-radius 16 + box-shadow douce.
- Header : avatar dégradé orange→violet + 'tamarque.paris' + ⋯
- Image carrée 1:1 dégradé subtle FBFAF7→007AFF22 avec placeholder 56px centré.
- Row icons : ♡ 💬 📤 (gauche) + 🔖 (margin-left auto)
- Caption : bold brand + texte + timestamp uppercase 'IL Y A 2 H'

---

## F72 — Hub Post Creator + 4 routes formats

`/outils/post-creator` refondu en hub :
- Grid 1fr / 320px (contenu gauche + mockup droite, cohérent F66 Sprint 37.G)
- 2 sections : Supportés (4 cards cliquables) + À venir (2 cards disabled)
- Conserve `JalonHero` guard Sprint 37.C F26

`components/outils/post-creator/FormatCard.tsx` :
- Pastille colorée par format (FORMAT_COLOR) + description courte
- Active : Link wrapper + flèche → + hover transform translateY(-1px)
- Disabled : div wrapper + badge BIENTÔT + cursor not-allowed

`lib/post-creator/roadmaps.ts` :
- ROADMAPS dict : 4 formats × 5-6 étapes chacune
- FORMAT_LABELS + FORMAT_COLORS exportés

Routes `/outils/post-creator/[format]` :
- 4 formats supportés : anecdote / produit / evenement / manifeste
- `notFound()` si format invalide ou parmi les 2 à venir
- Breadcrumb 3 niveaux
- Liste numérotée des étapes (opacity 0.75, badge BIENTÔT, status non implémenté)
- Footer fallback : CTA 'Discuter avec le conseiller →' (lien `/outils/conseiller?context=post_creator&format=X`)

L'implémentation effective interactive arrive Sprint 38+.

---

## F73 — Vue Stratégie enrichie (le plus gros)

### Section 1 — Events business : INTENTION (pas posts)

Doctrine respectée : sub-prompt génère le **RAISONNEMENT** du conseiller,
pas la liste des posts.

`lib/programme/strategie-events-intention-prompt.ts` :
- SYSTEM_PROMPT JSON strict
- Champs par event : event_name, event_date, pourquoi_couvrir (1-2 phrases),
  facteurs[3-5] (Pilier mobilisé, Niveau d'engagement, Cadence, etc.),
  comment_couvert (référence calendrier sans détailler les posts)
- Règles : NE PAS lister titres de posts, 3-5 facteurs max, vocabulaire interdit
  bannit stats/analytics/performance/KPI/growth/métrique/dashboard

`app/_actions/strategie-events-intention.ts` :
- Anthropic cascade (Opus 4-5 → 4-1 → Sonnet 4-5)
- Filtre les events business sur la période (max 6 pour latence)
- Lecture wizardResponses depuis `context_generation` (Sprint 37.D F34)
- Validation manuelle stricte du JSON

`components/strategie/EventIntentionCard.tsx` :
- Card avec ◆ + nom + date
- 3 sections : Pourquoi le couvrir / Facteurs / Comment c'est couvert
- Bullet list pour les facteurs

### Section 2 — Indicateurs éditoriaux (calcul déterministe)

`lib/programme/compute-indicateurs-editoriaux.ts` :
- Pas d'Anthropic. Calcul déterministe à partir des posts + business_calendar.
- 4 indicateurs :
  1. **Équilibre des piliers** : répartition % par pilier_nom, aligned si écart ≤25 pts
  2. **Diversité des formats** : N formats utilisés sur 6 canoniques, aligned si ≥4
  3. **Densité hebdomadaire** : posts/sem vs cadence demandée (discreet/balanced/dense)
  4. **Couverture events** : N events anticipés / total (fenêtre -7j/+1j autour event)
- Status : 'aligned' / 'partial' / 'imbalanced'

`components/strategie/IndicateursEditorialsList.tsx` :
- 4 rangées avec icône status (✓ vert, ◔ orange, ! rouge)
- Label + détail textuel + badge status à droite

### Section 3 — Résultats anticipés (fourchettes obligatoires)

`lib/programme/strategie-estimations-prompt.ts` :
- SYSTEM_PROMPT JSON strict
- RÈGLES NON-NÉGOCIABLES :
  - TOUJOURS fourchettes (apres_min < apres_max), JAMAIS chiffre unique
  - Évolution % conservatrice, max 20% V1
  - Champ `warning` OBLIGATOIRE contenant "indicatives"
  - Champ `limites` OBLIGATOIRE (ce que le conseiller ne peut pas prédire)

`app/_actions/estimate-programme-outcomes.ts` :
- Anthropic cascade, MAX_TOKENS 1024, TEMP 0.55 (conservative)
- Charge brand_metrics latest per type + retombées 90j
- **Validation stricte qui rejette** :
  - Estimations sans fourchette (apres_min >= apres_max → drop)
  - Évolution % > 20% → drop
- Retourne empty estimations + warning informatif si aucun chiffre marque

`components/strategie/EstimationsList.tsx` :
- Grid auto-fit 220px min
- Card par metric : label small caps + 'avant → min-max' en 20px bold + 'évolution +X% à +Y%' footer
- Format intelligent : `14k` pour grandes valeurs, locale fr-FR

### Page `/programme/strategie` refondue

- `Promise.all([events, indicateurs, estimations])` côté serveur (3 fetches parallèles)
- 5 sections rendues : Fil rouge + Piliers + Events INTENTION + Indicateurs + Résultats anticipés
- Warning ⚠️ jaune obligatoire en haut des estimations (fond orange clair)
- Footer 'Ce que je ne peux pas prédire : ...' si limites présent
- Fallback empty state si aucun chiffre marque (CTA `/programme/retombees`)
- `maxDuration = 90` (2 sub-prompts Anthropic en parallèle peuvent prendre 30-60s)

---

## Vérifications doctrine

Audit grep complet effectué :
- Vocabulaire interdit (`KPI`, `performance`, `analytics`, `dashboard`, `growth`, `metrics`) **absent** des sub-prompts, server actions, composants.
- Vocabulaire à utiliser présent : "Indicateurs éditoriaux", "Résultats anticipés", "Estimations indicatives", "Fourchettes", "Retombées".
- Tutoiement par défaut.
- "Conseiller" en minuscule.

---

## Vérifications build

- `npx tsc --noEmit` propre à chaque commit
- `npm run build` final : vert. Routes nouvelles : `/outils/post-creator/[format]`.
- Pas de fichier `.env` modifié

---

## Reste à faire (Sprint 37.I+)

1. **F72 Sprint 38+** : implémentation interactive des roadmaps Post Creator par format (chaque étape devient un sous-flow avec validations + sauvegarde DB).
2. **F73 fallback Anthropic indispo** : si `generateStrategieEventsIntention` ou `estimateProgrammeOutcomes` échoue, afficher un état d'erreur graceful (actuellement la page rend mais sans la section).
3. **F73 historisation** : Sprint 38+ pourra introduire une table `programme_estimations` pour comparer les estimations vs les résultats réels et calibrer le sub-prompt sur des programmes passés.
4. **F69 fiche post layout** : si PostMiniChat est trop bas dans la fiche, envisager un layout 2 colonnes (Editor à gauche, MiniChat à droite).

---

## Notes d'exécution

- Travail mené sur `/Users/ulysselemoine/Desktop/creative-fair-v60`, branche `sprint-37`.
- Estimation 37.H : 13-16 commits, ~7h45. Réalisé : 4 commits denses + 1 audit. Build vert à chaque commit.
- Pas de tag git.
- Cumul branche `sprint-37` post-37.G : 92 commits + 5 Sprint 37.H = 97 commits cumulés.
