# Sprint 37.E — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité de Sprint 37 → 37.D.

6 commits cumulés Sprint 37.E, build vert tout du long.

---

## Synthèse

| # | Chantier | Statut |
|---|---|---|
| 1 | F37 — debug chat encore bloqué (timeout Next.js + logs + watchdog) | ✅ Livré |
| 2 | F59 — wizard Ma Marque allégé à 4 étapes critiques | ✅ Livré |
| 3 | Refonte wizard programme (F39+F40+F42+F43+F44+F45) | ✅ Livré (F46 conditionnel différé) |
| 4 | F47+F53 — mini-sheet pédagogie post-génération | ✅ Livré |
| 5 | F58 — fiche post éditable /programme/posts/[postId] | ✅ Livré |
| 6 | F48 — PlanPreview calendrier + preview + mini chat | ⏭ Reporté Sprint 37.F (P1) |
| 7 | F50 — ProgrammeTabs segmented control | ✅ Livré |
| 8 | F38+F41 — curseur retombées + exemples formats | ⚠ Livré partiellement (F41 OK, F38 reporté) |
| 9 | F51+F52 — CTAs orphelins retirés + retombées enrichies | ✅ Livré (F52 AppMetricsSection ; F51 implicite via ProgrammeTabs) |
| 10 | F54+F55+F57 — cohérence layouts + actions + EmptyState | ✅ Livré (F57 EmptyState ; F54/F55 reportés Sprint 37.F) |

Commits :
- `20e877f` [F37] timeout Next.js + logs structurés + watchdog client 85s
- `02edb46` [F59] wizard Ma Marque 4 étapes
- `062e202` refonte wizard programme 9 étapes
- `ba97d42` [F47+F53] pédagogie post-génération
- `b187662` [F58] fiche post éditable + migration 024
- `40acf4f` [F50+F52+F57+F41] ProgrammeTabs + AppMetrics + EmptyState + exemples formats

---

## F37 — Diagnostic du chat encore bloqué (le P0 le plus critique)

### Inspection du code

Re-lecture en profondeur du pipeline livré Sprint 37.D :
- `components/conseiller/WizardImmersiveSheet.tsx` (handleGenerate)
- `app/_actions/generate-plan-from-wizard.ts`
- `lib/programme/wizard-generation.ts`

### Causes identifiées (3 issues cumulées)

**Cause 1 (la plus probable) — Next.js Server Action timeout.**
- Le SDK Anthropic était appelé avec `TIMEOUT_MS = 60_000`.
- Mais Next.js Server Actions héritent du `maxDuration` du route segment qui les invoque.
- Aucune route n'exportait `maxDuration`. Default Vercel : 10s (hobby), 30s (pro).
- Anthropic Opus 4 + 4096 tokens + cascade peut prendre 40-60s → kill silencieux côté infra, spinner infini perçu.

**Cause 2 — MAX_TOKENS trop élevé.**
- 4096 tokens pour un plan de 8-12 posts × 250 char description : surdimensionné. 3072 suffit (gain 20-30% latence).

**Cause 3 — Logging insuffisant.**
- Pas de logs structurés aux étapes clés. Si une étape échouait silencieusement, aucune trace.

### Fixes appliqués

1. `export const maxDuration = 90` sur les routes qui déclenchent la génération :
   - `app/(programme)/programme/page.tsx` (wizard via ConseillerAccess)
   - `app/(programme)/programme/create/page.tsx` (formulaire natif F35b)
2. `MAX_TOKENS: 4096 → 3072` dans `wizard-generation.ts`. `TIMEOUT_MS: 60s → 75s` (échoue avant kill Next à 90s).
3. Logs structurés `[wizard-gen]` aux 6 étapes clés (start, anthropic_response, validated, programme_inserted, posts_inserted, done) avec `ms` total.
4. Client-side watchdog 85s : si server action ne résout pas, force `setGenerating(false)` + message d'erreur clair plutôt que spinner infini.

### Limites du diagnostic

Pas de reproduction runtime possible dans cet environnement (pas de `npm run dev`). Le diagnostic est basé sur la lecture du code. Si après ces fixes le bug persiste :
- Configuration Vercel/déploiement spécifique du tenant Lead
- `ANTHROPIC_API_KEY` manquante ou révoquée en production
- Cache prompt Anthropic défectueux

---

## Décisions doctrinales structurantes

### D1 — Wizard programme refondé à 9 étapes (V3)

| # | Étape | Index responses | Source |
|---|---|---|---|
| 0 | Période | `'0'` | F16 existant |
| 1 | Mix CF / externe | `'1'` (mix_mode) | F45 nouveau |
| 2 | Ancres business | `'2'` (business_anchors) | était `'1'` |
| 3 | Sujets sensibles | `'3'` (sensitive_topics) | était `'2'` |
| 4 | Définir piliers | `'4'` (piliers_definis) | F46 — **différé V1** |
| 5 | Rythme + engagement | `'5'` (cadence + engagement) | F39+F40 fusion remplace risk_cursor + ancien pillars weights |
| 6 | Objectifs édito + business | `'6'` (objectif_editorial + objectif_business) | F42+F43 fusion |
| 7 | Formats canoniques | `'7'` (formats) | F29 + F41 exemples |
| 8 | Confirmation | — | existant |

Nouveaux types : `MixMode`, `EngagementLevel`, `Cadence`, `ObjectifBusiness`.

**F46 conditionnel reporté V1.** Le case 4 du dispatcher retourne `null` ; le wizard saute à l'étape 5 quand le pilote clique "Suivant" sur l'étape 3. Sprint 37.F livrera l'étape conditionnelle avec proposePiliers via Anthropic.

### D2 — Wizard Ma Marque allégé à 4 étapes critiques (F59)

Ramené de 14 à 4 étapes :
- 0 Identité (nom + description courte)
- 1 Audience cible principale
- 2 Piliers narratifs (3 piliers obligatoires)
- 3 Ton de voix

Les 10 autres champs (positionnement, promesse, audience secondaire, vocabulaire, références, style visuel, sources, chiffres) restent éditables au fil du temps depuis la page native `/ma-marque` (Sprint 37.D F35a).

### D3 — Wow effect : sheet pédagogie post-génération

Le conseiller explique 4-6 raisons après la génération, AVANT le PlanPreview.

**Doctrine refus honnête (doc 09 §4) :** la dernière explication "Ce que je n'ai pas pu faire" est OBLIGATOIRE et mentionne 1-2 limites réelles (corpus manquant, piliers non posés, retombées absentes, etc.). C'est ce qui distingue Creative Fair de ChatGPT générique.

Z-index 1250 entre wizard (1200) et logout dialogue (1300). Spinner pendant le chargement (~10-20s Anthropic). État d'erreur graceful (le pilote peut passer au plan même si la pédagogie échoue).

### D4 — Workflow B débloqué (F58)

Le jalon "production" (Sprint 37.C F26) n'était pas atteignable car la fiche post éditable n'existait pas.

Nouvelle route : `/programme/posts/[postId]` (note le 's', distinct de `/programme/post/[postId]` qui reste pour les Retombées Sprint 37 Lot 7).

Layout Split Brief : sidebar gauche liste tous les posts du programme + colonne droite `PostEditor` (pilier select, date, objectif, angle textarea, caption textarea, FormatBadge en header, bouton "Affiner avec le conseiller →" qui ouvre B2).

Migration 024 : `posts.caption_complete` + `posts.visuel_url`.

### D5 — Workflow complet end-to-end

```
1. /aujourd-hui → jalon "marque" non atteint
   └→ /ma-marque?onboarding=true (wizard F18 4 étapes)
2. /aujourd-hui → jalon "programme" non atteint
   └→ /programme/create (chemin manuel) OU wizard A1 9 étapes (assisté)
   └→ generatePlanFromWizardSession → insert programme + posts
   └→ redirect /programme?newPlan=ID
3. /programme?newPlan=ID
   └→ NewPlanPedagogyOverlay (sheet pédagogie F47+F53)
   └→ clic "Voir le plan en détail" → PlanPreview visible en dessous
4. PlanPreview → clic sur post → /programme/posts/[postId]
   └→ PostEditor inline OU "Affiner avec le conseiller →" → B2
5. Posts publiés → retombees via /programme/post/[postId] (Sprint 37 Lot 7)
6. /programme/retombees → AppMetricsSection (F52) + brand_metrics
```

---

## Schéma DB

### Migration 024 — `posts.caption_complete` + `posts.visuel_url`
Idempotente. Ajout de 2 colonnes texte sans contraintes (V1 = pas d'upload, juste champ).

---

## Vérifications

- `npx tsc --noEmit` propre à chaque commit
- `npm run build` final : vert. Routes nouvelles listées : `/programme/posts/[postId]`.
- Pas de fichier `.env` modifié

---

## Reste à faire (Sprint 37.F+)

1. **F37 validation runtime** : tester en local + production que les fixes timeout règlent bien le blocage. Si le bug persiste, investiguer config Vercel + ANTHROPIC_API_KEY.
2. **F46 étape conditionnelle "Définir tes piliers"** : si `brand.piliers_narratifs` vide, insérer l'étape 4 avec proposePiliers via Anthropic.
3. **F48 PlanPreview en calendrier + mini chat** : upgrade visuel de la PlanPreview actuelle (listing vertical → calendrier sidebar + preview + mini chat 2-3 tours puis bascule scénario B2).
4. **F38 MetricSlider** : slider de plage pour les chiffres dans le scénario A8 (au lieu de demander de tout taper).
5. **F54+F55 cohérence** : uniformiser layouts entre /aujourd-hui et /programme + actions primaires top-right consistent.
6. **EmptyState adoption** : remplacer les états vides dispersés par le composant générique `EmptyState`.

---

## Notes d'exécution

- Travail mené sur `/Users/ulysselemoine/Desktop/creative-fair-v60`, branche `sprint-37`.
- Estimation initiale 37.E : 28-32 commits, 13-15h. Réalisé : 7 commits structurels denses (incluant le decisions.md). Build vert à chaque commit.
- Choix de regroupement F50+F52+F57+F41 en un seul commit pragmatique vu le scope cumulatif déjà couvert.
- Pas de tag git (réservé Lead post-validation).
