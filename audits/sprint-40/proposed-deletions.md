# Sprint 40 — Propositions de suppression Phase 2

> Lead : marquer `[VALIDÉ]` devant chaque bloc à exécuter (en-tête `Statut Lead` ET ligne du récapitulatif §Récapitulatif).
> Laisser `[   ]` pour refuser un bloc.
> Tout bloc sans `[VALIDÉ]` ne sera PAS exécuté par Claude Code en Étape 2B.
>
> Doctrine de référence : `skills/00-CONCEPT.md`, `01-ARCHITECTURE.md`, `02-EXPERTS.md`, `03-VOICE_SHEET.md`, `04-MULTI_TENANT.md`, `10-SACRED.md` (commit `46e3ebe`).
> Amendement Phase 2 (`audits/sprint-40/amendement-phase-2.md`) §2 : validation par blocs cohérents (même justification doctrinale + même verdict + même type d'action + même périmètre fonctionnel).

---

## Préambule — fichiers explicitement EXCLUS de Phase 2

Sur arbitrage Lead amendement §3 et §4, les fichiers suivants **ne sont pas listés dans les blocs ci-dessous** et ne seront pas modifiés au-delà du marquage `@deprecated` dans leur commentaire d'en-tête (refactor automatique distinct de la purge) :

- `components/ma-marque/BarreFondations.tsx` (amendement §3 — audit visuel Sprint 41).
- `components/ma-marque/EtatMarque.tsx` (amendement §3 — idem).
- `lib/ai/prompts/system.ts` (amendement §4 — fichier SACRED, refonte Sprint 41-prompts dédié).
- `lib/ai/prompts/brand-book.ts`, `brief.ts`, `business-suggest.ts`, `post-generation.ts` (refonte signature Experts laissée Sprint 43+, pas de modification Sprint 40).

---

## Bloc 1 — Conseiller V1, prompt système + types core

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §14 décisions abandonnées — "Conseiller comme page séparée (fusionné dans Messages avec Hélène M. pinned)"`. `10-SACRED.md` "L'ancienne nav 4 destinations (Aujourd'hui / Calendrier / Ma Marque / Conseiller) est caduque depuis le 20 mai 2026."
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/conseiller/lib-core/`
**Nombre de fichiers :** 8
**Risque technique :** moyen (le prompt système + types sont importés par les scénarios, les composants UI Conseiller, et les server actions Conseiller — l'ordre des commits Étape 2B doit garantir que les consommateurs sont supprimés avant ce bloc)

**Fichiers concernés :**
- `lib/conseiller/system-prompt.ts`
- `lib/conseiller/types.ts`
- `lib/conseiller/onboarding-types.ts`
- `lib/conseiller/markdown-parser.ts`
- `lib/conseiller/parse-metrics-block.ts`
- `lib/conseiller/scenario-palette.ts`
- `lib/conseiller/waiting-states.ts`
- `lib/conseiller/queries.ts`

**Justification du backup :** `system-prompt.ts` contient les 5 lois du conseiller, le vocabulaire interdit complet, la doctrine fondatrice du 12 mai 2026, et le scope V1 par TF. Ces matériaux sont **réutilisables** Sprint 43+ pour la refonte des prompts Hélène + 12 Experts.

**Dépendances cassées attendues :**
- Tous les imports `from '@/lib/conseiller/...'` dans `components/conseiller/*`, `components/outils/conseiller/*`, `app/(outils)/outils/conseiller/page.tsx`, `app/_actions/run-conseiller-turn.ts`, `app/_actions/mark-conseiller-timeout.ts`, `app/_actions/find-resumable-session.ts`, `app/_actions/wizard-session.ts`, `app/_actions/generate-pedagogy.ts`, `components/programme/ConseillerAccess.tsx`, `components/programme/PostMiniChat.tsx`, `app/api/ai/chat/route.ts`.
- L'ordre des commits Étape 2B doit supprimer ces consommateurs avant ce bloc (Blocs 2-9 supprimés en premier, puis Bloc 1).

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur d'imports orphelins.
- `npm run build` doit passer.
- Aucune route 404 introduite (la route `/outils/conseiller` est supprimée par Bloc 7).

---

## Bloc 2 — Conseiller V1, scénarios A/B/C/D/E (architecture par scénario, abandonnée au profit de l'architecture par Expert nommé)

**Statut Lead :** [   ]
**Justification doctrinale :** `02-EXPERTS.md §10 "Pour éviter la dilution conceptuelle, certaines fonctions IA de Creative Fair ne sont pas portées par un Expert nommé. Le Post Creator… Le Moodboard… L'onboarding F89… Cette discipline évite l'inflation : on ne crée pas un treizième Expert chaque fois qu'on a besoin d'une nouvelle skill."`. L'architecture A/B/C/D/E ≠ architecture Hélène + 12 Experts canonique V2.0. `00-CONCEPT.md §14 — "Onboarding 10 questions (remplacé par F89 wizard piliers 5 questions)"` confirme l'abandon des wizards A1.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/conseiller/scenarios/`
**Nombre de fichiers :** 16
**Risque technique :** faible (importés seulement par `lib/conseiller/scenarios/index.ts` et `app/_actions/run-conseiller-turn.ts` — tous deux dans la purge)

**Fichiers concernés :**
- `lib/conseiller/scenarios/index.ts`
- `lib/conseiller/scenarios/A1.ts`
- `lib/conseiller/scenarios/A1-pedagogy-prompt.ts`
- `lib/conseiller/scenarios/A2.ts`
- `lib/conseiller/scenarios/A7.ts`
- `lib/conseiller/scenarios/A8.ts`
- `lib/conseiller/scenarios/B2.ts`
- `lib/conseiller/scenarios/B4.ts`
- `lib/conseiller/scenarios/B5.ts`
- `lib/conseiller/scenarios/C3a.ts`
- `lib/conseiller/scenarios/C3b.ts`
- `lib/conseiller/scenarios/D6.ts`
- `lib/conseiller/scenarios/D8.ts`
- `lib/conseiller/scenarios/D9.ts`
- `lib/conseiller/scenarios/E1.ts`
- `lib/conseiller/scenarios/E-divers.ts`

**Justification du backup :** Les 14 sub-prompts contiennent des matériaux éditoriaux denses (contextes business, ancrages calendrier, framings de questions). Réutilisables Sprint 43+ pour les Experts nommés (B2 → Albane sur affinage, C3a → Valentine sur crise, D8 → Marc sur opportunité business, etc.).

**Dépendances cassées attendues :**
- `getScenarioSubPrompt()` exporté par `index.ts` est importé par `app/_actions/run-conseiller-turn.ts` (dans la purge Bloc 6).

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur.
- `npm run build` doit passer.

---

## Bloc 3 — Conseiller V1, wizard immersif A1 (création de plan)

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §14 — "Onboarding 10 questions (remplacé par F89 wizard piliers 5 questions)"` + `"Méthode pédagogique 4 mois (V60-pre)"` abandonnée. Le wizard immersif A1 est l'incarnation UI de ces deux décisions caduques.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/conseiller/wizard-immersif/`
**Nombre de fichiers :** 15
**Risque technique :** faible (importé seulement par `app/(outils)/outils/conseiller/page.tsx` et `components/programme/ConseillerAccess.tsx`, tous deux dans la purge)

**Fichiers concernés :**
- `components/conseiller/WizardImmersiveSheet.tsx`
- `components/conseiller/WizardProgressBar.tsx`
- `components/conseiller/wizard-steps/Step1Period.tsx`
- `components/conseiller/wizard-steps/Step2BusinessAnchors.tsx`
- `components/conseiller/wizard-steps/Step2MixMode.tsx`
- `components/conseiller/wizard-steps/Step3SensitiveTopics.tsx`
- `components/conseiller/wizard-steps/Step4Pillars.tsx`
- `components/conseiller/wizard-steps/Step5DefinirPiliers.tsx`
- `components/conseiller/wizard-steps/Step5RiskCursor.tsx`
- `components/conseiller/wizard-steps/Step5RythmeEngagement.tsx`
- `components/conseiller/wizard-steps/Step6Objectifs.tsx`
- `components/conseiller/wizard-steps/Step6ObjectifsCombined.tsx`
- `components/conseiller/wizard-steps/Step7Confirmation.tsx`
- `components/conseiller/wizard-steps/Step7Formats.tsx`
- `components/conseiller/wizard-steps/SuggestionPicker.tsx`

**Justification du backup :** Le pattern wizard immersif (Sheet plein écran + ProgressBar + Step modulaires) est techniquement intéressant — Sprint 43+ pourra réutiliser le squelette pour d'autres wizards (premiers pas, configuration tenant).

**Dépendances cassées attendues :**
- `import { WizardImmersiveSheet } from '@/components/conseiller/WizardImmersiveSheet'` dans `components/programme/ConseillerAccess.tsx` (Bloc 8, supprimé en parallèle).
- Idem dans `app/(outils)/outils/conseiller/page.tsx` (Bloc 7).

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur.
- `npm run build` doit passer.

---

## Bloc 4 — Conseiller V1, composants UI conversation (sheets, bulles, sidebars)

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §14 — "Conseiller comme page séparée (fusionné dans Messages avec Hélène M. pinned)"`. `02-EXPERTS.md §2 + §4` — la conversation V2.0 vit dans Messages avec Hélène pinned, pas dans une sheet Conseiller dédiée.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/conseiller/components-ui/`
**Nombre de fichiers :** 16
**Risque technique :** faible

**Fichiers concernés :**
- `components/conseiller/CalloutBox.tsx`
- `components/conseiller/ConseillerBubble.tsx`
- `components/conseiller/ConseillerHistory.tsx`
- `components/conseiller/ConseillerSheet.tsx`
- `components/conseiller/DataTable.tsx`
- `components/conseiller/DocumentaryCard.tsx`
- `components/conseiller/ExitConfirmDialog.tsx`
- `components/conseiller/MetricSlider.tsx`
- `components/conseiller/PedagogyExplanationSheet.tsx`
- `components/conseiller/PiloteBubble.tsx`
- `components/conseiller/QuickMetricsRow.tsx`
- `components/conseiller/ResumeChoiceSheet.tsx`
- `components/conseiller/RichMarkdown.tsx`
- `components/conseiller/StreamingReasoning.tsx`
- `components/conseiller/Timeline.tsx`
- `components/conseiller/WaitingState.tsx`

**Justification du backup :** Plusieurs composants ont une valeur réutilisable Sprint 43+ : `RichMarkdown`, `StreamingReasoning`, `CalloutBox`, `Timeline`, `DataTable`, `DocumentaryCard`. Le pattern bubble (`PiloteBubble`, `ConseillerBubble`) inspirera les bulles Messages V2.0.

**Dépendances cassées attendues :**
- Tous les imports `from '@/components/conseiller/...'` dans `app/(outils)/outils/conseiller/page.tsx` (Bloc 7), `components/programme/ConseillerAccess.tsx` (Bloc 8), `components/programme/PostMiniChat.tsx` (à investiguer — voir note ci-dessous).
- `PostMiniChat.tsx` reste dans le repo (verdict À refactorer, pas Recalé). Si `PostMiniChat` importe un composant Conseiller, son import sera retiré en refactor automatique Étape 2B (Lead validation §5.3 amendement = "refactors automatiques décrits dans les 11 audits Phase 1").

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur.
- `npm run build` doit passer.

---

## Bloc 5 — Conseiller V1, composants UI outils (déjà signalés "SUPPRESSION CANDIDATE Sprint 36")

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §14`. Note opérationnelle : ces 3 composants portent eux-mêmes la mention "SUPPRESSION CANDIDATE Sprint 36" dans leur commentaire d'en-tête — confirmation interne de leur statut Recalé depuis 5 sprints.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/conseiller/components-outils/`
**Nombre de fichiers :** 3
**Risque technique :** faible

**Fichiers concernés :**
- `components/outils/conseiller/ConseillerChat.tsx`
- `components/outils/conseiller/ConseillerLayout.tsx`
- `components/outils/conseiller/ConversationsList.tsx`

**Justification du backup :** Trace historique du chat Conseiller streaming (pattern conversation avec streaming Anthropic) — valeur didactique.

**Dépendances cassées attendues :**
- Importés par `app/(outils)/outils/conseiller/page.tsx` (Bloc 7).

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur.

---

## Bloc 6 — Conseiller V1, server actions

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §14` + `04-MULTI_TENANT.md` (ces actions utilisent toutes `createAdmin()` côté user → faille P0 multi-tenant, résolue par dégagement).
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/conseiller/actions/`
**Nombre de fichiers :** 5
**Risque technique :** moyen (importées par les routes et composants Conseiller, dont la suppression est dans les blocs 3-5 et 7-8)

**Fichiers concernés :**
- `app/_actions/run-conseiller-turn.ts`
- `app/_actions/mark-conseiller-timeout.ts`
- `app/_actions/find-resumable-session.ts`
- `app/_actions/generate-pedagogy.ts`
- `app/_actions/wizard-session.ts`

**Justification du backup :** Pattern Server Action streaming + pattern reprise de session Anthropic = réutilisable Sprint 43+ pour Hélène orchestratrice.

**Dépendances cassées attendues :**
- `runConseillerTurn` importé par `components/conseiller/ConseillerSheet.tsx` (Bloc 4) + `components/programme/ConseillerAccess.tsx` (Bloc 8).
- `findResumableSession` importé par `components/programme/ConseillerAccess.tsx` + `app/(outils)/outils/conseiller/page.tsx` (Bloc 7).
- `markConseillerTimeout` importé par `components/conseiller/ConseillerSheet.tsx` (Bloc 4).
- `wizard-session.ts` importé par `components/conseiller/WizardImmersiveSheet.tsx` (Bloc 3) + `app/_actions/generate-plan-from-wizard.ts` (À refactorer Sprint 41, hors Phase 2 suppression).

**Note d'ordre Étape 2B :** Bloc 6 doit être supprimé **après** les Blocs 3, 4, 5, 7, 8 pour éviter les imports orphelins.

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur.
- `app/_actions/generate-plan-from-wizard.ts` ne dépend probablement plus de `wizard-session.ts` une fois la chaîne Conseiller V1 dégagée — à confirmer Étape 2B avant suppression.

---

## Bloc 7 — Conseiller V1, route + page historique

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §14` + `01-ARCHITECTURE.md §1` (Conseiller n'est pas une page top-level V2.0).
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/conseiller/route/`
**Nombre de fichiers :** 1
**Risque technique :** faible (suppression d'une page = 404 sur l'URL `/outils/conseiller` — comportement attendu, à compenser éventuellement Sprint 41+ par un redirect propre vers `/outils` ou `/messages` quand cette dernière sera créée Sprint 43+)

**Fichiers concernés :**
- `app/(outils)/outils/conseiller/page.tsx`

**Justification du backup :** Trace historique de la page Conseiller en mode historique avec auto-ouverture sheet via query params (pattern URL-driven sheet utile à connaître Sprint 43+).

**Dépendances cassées attendues :**
- Aucune en amont (une page n'est pas importée).
- En aval, les **liens internes** pointant vers `/outils/conseiller` deviendront des 404. Audit nécessaire Étape 2B :
  - `components/outils/OutilsCatalog.tsx` → item Conseiller sélectionné par défaut (refactor automatique : retirer item + sélectionner Post Creator).
  - `components/programme/ConseillerAccess.tsx` (Bloc 8) → ouvre directement la sheet, pas de redirect URL.
  - Tests E2E `tests/e2e/05-conseiller.spec.ts` → hors scope brief §3.2 mais s'ils existent, ils casseront.

**Vérification post-suppression :**
- `npm run build` doit passer.
- Naviguer manuellement vers `/outils/conseiller` retourne 404 — comportement attendu.

---

## Bloc 8 — Conseiller V1, entrées dans Programme (4 voies d'accès)

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §14`. Les 4 entrées (CTA Créer plan A1, bannière A2 régénération, CTA Faire le point A7, CTA Préparer réunion E1) sont rattachées au modèle Conseiller V1.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/conseiller/programme-entries/`
**Nombre de fichiers :** 2
**Risque technique :** moyen (`ConseillerAccess` est importé par `app/(programme)/programme/page.tsx` qui reste dans le repo)

**Fichiers concernés :**
- `components/programme/ConseillerAccess.tsx`
- `components/programme/NewPlanPedagogyOverlay.tsx`

**Justification du backup :** Le pattern "4 entrées hiérarchisées avec UN SEUL CTA primaire" est cohérent doctrine (décision Apple #48 doc 09) et réutilisable.

**Dépendances cassées attendues :**
- `import { ConseillerAccess } from '@/components/programme/ConseillerAccess'` dans `app/(programme)/programme/page.tsx` → retrait de l'import en refactor automatique Étape 2B.
- `import { NewPlanPedagogyOverlay } from '@/components/programme/NewPlanPedagogyOverlay'` idem.

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur après retrait des imports.
- `/programme` charge sans erreur (composants absents → simplement plus de CTA Conseiller, comportement attendu).

---

## Bloc 9 — Conseiller V1, mockup iPhone Messages style

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §14`. Un mockup d'un Conseiller standalone n'a plus d'objet — Sprint 43+ produira un mockup Messages avec Hélène pinned si nécessaire.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/conseiller/mockup/`
**Nombre de fichiers :** 1
**Risque technique :** faible (le mockup est référencé uniquement par `components/outils/ToolMockup.tsx` dans une branche conditionnelle qui sera neutralisée)

**Fichiers concernés :**
- `components/outils/mockups/ConseillerIPhoneMockup.tsx`

**Justification du backup :** Pattern iOS Messages style avec bulles alternées + input bar = réutilisable Sprint 43+ Messages V2.0.

**Dépendances cassées attendues :**
- `ToolMockup.tsx` importe `ConseillerIPhoneMockup` dans la branche `ConseillerMockup`. La branche sera retirée en refactor automatique Étape 2B (cf. `02-mes-outils.md` §5.2).

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur après retrait branche.

---

## Bloc 10 — Placeholder /outils/messages (route "Reporté V2 avec API Meta")

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §6 pilier 6 Uncompromising Polish — "Zéro 'bientôt', zéro 'à venir', zéro fonctionnalité visible mais désactivée sans raison claire. Si ce n'est pas prêt, ce n'est pas montré."` + `01-ARCHITECTURE.md §1` (Messages = destination top-level Travail, pas sous Outils).
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/outils-messages-placeholder/`
**Nombre de fichiers :** 1
**Risque technique :** faible

**Fichiers concernés :**
- `app/(outils)/outils/messages/page.tsx`

**Justification du backup :** Historique de la décision Sprint 37.A "Reporté V2 avec API Meta" — valeur traçable.

**Dépendances cassées attendues :**
- Item "Messages" dans `components/outils/OutilsCatalog.tsx` section "À venir" → sera retiré en refactor automatique (cf. Bloc N/A "refactor catalogue" décrit dans `02-mes-outils.md` §5.2).

**Vérification post-suppression :**
- `npm run build` doit passer.
- Navigation manuelle vers `/outils/messages` retourne 404 (comportement attendu).

---

## Bloc 11 — Route AI test exposée en prod

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §6 pilier 6 Uncompromising Polish — "Zéro 'bientôt', zéro 'à venir', zéro fonctionnalité visible mais désactivée sans raison claire."` Une route `/api/ai/test` exposée en prod = anti-pilier 6.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/api-test/`
**Nombre de fichiers :** 1
**Risque technique :** faible

**Fichiers concernés :**
- `app/api/ai/test/route.ts`

**Justification du backup :** Trace utile pour comprendre comment l'équipe testait l'API Anthropic en dev.

**Dépendances cassées attendues :**
- Aucune (route de test, pas d'import en amont).

**Vérification post-suppression :**
- `npm run build` doit passer.
- `/api/ai/test` retourne 404 (comportement attendu).

---

## Bloc 12 — Coaching daily (anti-doctrine Headspace)

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §3 — "Lecture erronée à éviter : tranquillité comme minimalisme contemplatif, Apple Health passif, méditation, slow design poétique. Ce n'est pas Headspace. Ce n'est pas Calm. Lecture correcte : tranquillité du pilote en cockpit."`. Le coaching daily = anti-doctrine.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/coaching/`
**Nombre de fichiers :** 4
**Risque technique :** faible (les composants Coaching sont importés probablement dans une zone du dashboard programme — à confirmer Étape 2B)

**Fichiers concernés :**
- `components/programme/CoachingCard.tsx`
- `components/programme/CoachingGenerator.tsx`
- `app/api/ai/coaching/route.ts`
- `lib/ai/prompts/coaching.ts`

**Justification du backup :** Le prompt `coaching.ts` peut contenir des éléments doctrinaux narratifs réutilisables. Les composants `CoachingCard` / `CoachingGenerator` documentent un pattern client/serveur AI.

**Dépendances cassées attendues :**
- Import de `CoachingCard` / `CoachingGenerator` dans `components/programme/ProgrammeDashboard.tsx` ou similaire → retrait en refactor automatique Étape 2B.
- Import de `lib/ai/prompts/coaching.ts` dans `app/api/ai/coaching/route.ts` (les deux supprimés ensemble).

**Note schéma SQL :** Table `daily_coaching` (migration `005_programmes.sql` ou `020_brand_metrics.sql` selon historique) **non touchée Phase 2** (brief §7 hors scope migration de schéma). Drop laissé Sprint 41 dédié schéma.

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur après retrait imports.
- `/api/ai/coaching` retourne 404.

---

## Bloc 13 — Retombées V1 (vanity metrics hors V1 §8)

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §8 — "Pas dans V1 : Pas d'analyse de performance des publications passées (vanity metrics, engagement rate, etc.). Ces données sont du bruit non-actionnable au stade V1."`
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/retombees/`
**Nombre de fichiers :** 6
**Risque technique :** moyen (la route `/programme/retombees` est référencée depuis le dashboard programme — refactor automatique nécessaire)

**Fichiers concernés :**
- `app/(programme)/programme/retombees/page.tsx`
- `components/retombees/AppMetricsSection.tsx`
- `components/retombees/RetombeesQualitativesList.tsx`
- `components/retombees/RetombeesQuantitativesGrid.tsx`
- `components/programme/RetombeesEditor.tsx`
- `app/_actions/update-post-retombees.ts`

**Justification du backup :** Pattern d'édition retombées qualitatives (texte libre, témoignages clients) = intéressant Sprint V2+ s'il revient avec un cadre éditorial différent.

**Dépendances cassées attendues :**
- Tout lien interne vers `/programme/retombees` (sidebar Programme, bouton "Voir retombées" éventuel) → refactor automatique.
- Import `RetombeesEditor` dans `PostDetailSheet.tsx` ou `PostEditor.tsx` → retrait import refactor automatique.
- Import `update-post-retombees` dans les composants Retombées (auto-suppression dans ce bloc).

**Note schéma SQL :** Colonnes `posts.*` ajoutées par `016_posts_retombees.sql` **non touchées Phase 2** (brief §7). Drop colonnes laissé Sprint 41 dédié schéma.

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur.
- `npm run build` doit passer.
- Naviguer vers `/programme/retombees` retourne 404.

---

## Bloc 14 — Jalons fondations (méthode pédagogique 4 mois dégagée §14)

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §14 — "Méthode pédagogique 4 mois (V60-pre)"` abandonnée. `10-SACRED.md — "Pas de gamification, jamais. Pas de streaks. Pas de badges. Pas de XP. Pas de quêtes."`. Le système jalons fondations est une mécanique de progression forcée = gamification soft.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/jalons/`
**Nombre de fichiers :** 3
**Risque technique :** moyen (`JalonHero` est référencé par `app/(aujourd-hui)/aujourd-hui/page.tsx` et possiblement par `MarqueGroup.tsx`)

**Fichiers concernés :**
- `components/jalons/JalonHero.tsx`
- `components/jalons/JalonGuardDialog.tsx`
- `lib/jalons/check-jalons.ts`

**Justification du backup :** Le pattern "garde-fou avant accès" peut servir Sprint V2+ pour d'autres contextes (paywall, plan supérieur), même si le mécanisme actuel est dégagé.

**Dépendances cassées attendues :**
- `import { JalonHero } from '@/components/jalons/JalonHero'` dans `app/(aujourd-hui)/aujourd-hui/page.tsx` → refactor automatique.
- `import { checkJalonStatus } from '@/lib/jalons/check-jalons'` idem dans `app/(aujourd-hui)/aujourd-hui/page.tsx` + possiblement `app/(programme)/programme/page.tsx`.
- `JalonGuardDialog` importé par `MarqueGroup.tsx` ou autres → retrait en refactor automatique.

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur après retrait imports.
- `npm run build` doit passer.
- La page Aujourd'hui charge sans le bandeau jalons (comportement attendu).

---

## Bloc 15 — DemarrerCard (onboarding visible en home, anti-pilier 8)

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §6 pilier 8 Out of the Box Experience — "Au premier login, Floriane voit déjà sa marque, ses piliers, son calendrier — pré-remplis intelligemment par l'onboarding initial."` + `01-ARCHITECTURE.md §3.1 densité α stricte minimale "Trois widgets visibles uniquement : Calendrier, Rappels, Messages. Un bloc Roadmap visible uniquement."`. Pas de card d'onboarding en home.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/today/`
**Nombre de fichiers :** 1
**Risque technique :** faible (importé uniquement par `app/(aujourd-hui)/aujourd-hui/page.tsx`)

**Fichiers concernés :**
- `components/today/DemarrerCard.tsx`

**Justification du backup :** Trace historique du modèle Sprint 36.G "Démarrer" — utile à connaître Sprint 43+ pour ne pas réinventer le même anti-pattern.

**Dépendances cassées attendues :**
- `import { DemarrerCard, type DemarrerStep } from '@/components/today/DemarrerCard'` dans `app/(aujourd-hui)/aujourd-hui/page.tsx` → refactor automatique.

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur.
- La page Aujourd'hui charge sans la card Démarrer.

---

## Bloc 16 — OnboardingFlow legacy + ConseillerIntro

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §14 — "Onboarding 10 questions (remplacé par F89 wizard piliers 5 questions)"` + `"Conseiller comme page séparée (fusionné dans Messages avec Hélène M. pinned)"`. Note opérationnelle : `OnboardingFlow.legacy-sprint34.tsx` porte explicitement `.legacy-sprint34` dans son nom.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/onboarding-legacy/`
**Nombre de fichiers :** 2
**Risque technique :** faible (composants legacy non importés sauf par d'anciens flux dont la suppression est traitée par ailleurs)

**Fichiers concernés :**
- `components/onboarding/OnboardingFlow.legacy-sprint34.tsx`
- `components/onboarding/ConseillerIntro.tsx`

**Justification du backup :** Trace historique de l'onboarding pré-F89.

**Dépendances cassées attendues :**
- À vérifier Étape 2B : si des composants `OnboardingChoiceStep.tsx`, `OnboardingFlow.tsx`, `OnboardingProgress.tsx`, `OnboardingStep.tsx` importent `ConseillerIntro` → retrait en refactor automatique.

**Vérification post-suppression :**
- `npx tsc --noEmit` : 0 erreur.

---

## Bloc 17 — Compte > ma-marque sous-arbre obsolète (§4 doctrine Compte ≠ Ma Marque)

**Statut Lead :** [   ]
**Justification doctrinale :** `01-ARCHITECTURE.md §4 — "Pas de sélecteur de marque dans le header. Pas de switch. Compte > Marques n'affiche pas de liste — il y a un bloc unique 'Ma Marque' qui renvoie vers la page Ma Marque."`. Le sous-arbre `/compte/ma-marque/*` duplique la page Ma Marque top-level Éditorial = anti-doctrine §4.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/compte-ma-marque/`
**Nombre de fichiers :** 3 + dossier
**Risque technique :** faible (routes orphelines, sans dépendances en amont)

**Fichiers concernés :**
- `app/(compte)/compte/ma-marque/page.tsx`
- `app/(compte)/compte/ma-marque/brand-book/page.tsx`
- `app/(compte)/compte/ma-marque/business-calendar/page.tsx`
- (puis suppression du dossier `app/(compte)/compte/ma-marque/`)

**Justification du backup :** Trace historique de la duplication de routes pré-doctrine §4.

**Dépendances cassées attendues :**
- Aucune en amont (pages = pas d'import).
- Liens internes vers `/compte/ma-marque/*` → audit Étape 2B (probablement dans `UserMenuBubble.tsx`).

**Vérification post-suppression :**
- `npm run build` doit passer.
- `/compte/ma-marque/*` retourne 404 (cohérent avec doctrine §4 = Ma Marque top-level Éditorial).

---

## Bloc 18 — Route demo dev split-brief (anti-pilier 6 Polish)

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §6 pilier 6 Uncompromising Polish — "Zéro 'bientôt', zéro 'à venir', zéro fonctionnalité visible mais désactivée sans raison claire. Si ce n'est pas prêt, ce n'est pas montré."`. Une route demo dev exposée en prod = anti-pilier 6.
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/dev/`
**Nombre de fichiers :** 3
**Risque technique :** faible

**Fichiers concernés :**
- `app/(dev)/dev/split-brief/page.tsx`
- `app/(dev)/dev/split-brief/SplitBriefDemoClient.tsx`
- `app/(dev)/layout.tsx`

**Justification du backup :** Le pattern demo dev pour visualiser un composant en isolation = réutilisable Storybook ou similaire Sprint 41+.

**Dépendances cassées attendues :**
- Aucune en amont.
- À vérifier qu'aucun lien interne pointe vers `/dev/split-brief`.

**Vérification post-suppression :**
- `npm run build` doit passer.
- `/dev/split-brief` retourne 404.

---

## Bloc 19 — Documentation utilisateur conseiller (doctrine V2.0 = Conseiller dégagé)

**Statut Lead :** [   ]
**Justification doctrinale :** `00-CONCEPT.md §14 — "Conseiller comme page séparée (fusionné dans Messages avec Hélène M. pinned)"`. Une doc user qui décrit le Conseiller est trompeuse pour Floriane (qui ne le verra plus dans Messages V2.0).
**Type d'action :** suppression avec backup dans `archive/v1-leftovers/docs/`
**Nombre de fichiers :** 1
**Risque technique :** faible (doc statique, aucune dépendance code)

**Fichiers concernés :**
- `docs/user/conseiller.md`

**Justification du backup :** Trace de la doc utilisateur V1 pour comparaison historique.

**Dépendances cassées attendues :**
- Aucune (markdown statique).

**Vérification post-suppression :**
- Aucun impact build.
- Liens internes éventuels depuis `docs/user/getting-started.md` ou autres → audit Étape 2B.

---

## Récapitulatif

| # | Bloc | Fichiers | Statut |
|---|---|---|---|
| 1 | Conseiller V1, prompt système + types core | 8 | [   ] |
| 2 | Conseiller V1, scénarios A/B/C/D/E | 16 | [   ] |
| 3 | Conseiller V1, wizard immersif A1 | 15 | [   ] |
| 4 | Conseiller V1, composants UI conversation | 16 | [   ] |
| 5 | Conseiller V1, composants UI outils ("SUPPRESSION CANDIDATE Sprint 36") | 3 | [   ] |
| 6 | Conseiller V1, server actions | 5 | [   ] |
| 7 | Conseiller V1, route + page historique | 1 | [   ] |
| 8 | Conseiller V1, entrées dans Programme (4 voies d'accès) | 2 | [   ] |
| 9 | Conseiller V1, mockup iPhone Messages style | 1 | [   ] |
| 10 | Placeholder /outils/messages (route "Reporté V2") | 1 | [   ] |
| 11 | Route AI test exposée en prod | 1 | [   ] |
| 12 | Coaching daily (anti-doctrine Headspace) | 4 | [   ] |
| 13 | Retombées V1 (vanity metrics hors V1 §8) | 6 | [   ] |
| 14 | Jalons fondations (méthode pédagogique 4 mois dégagée §14) | 3 | [   ] |
| 15 | DemarrerCard (onboarding visible en home, anti-pilier 8) | 1 | [   ] |
| 16 | OnboardingFlow legacy + ConseillerIntro | 2 | [   ] |
| 17 | Compte > ma-marque sous-arbre obsolète (§4 doctrine) | 3 | [   ] |
| 18 | Route demo dev split-brief (anti-pilier 6 Polish) | 3 | [   ] |
| 19 | Documentation utilisateur conseiller | 1 | [   ] |

**Total fichiers proposés : 92**
**Total fichiers validés Lead : à remplir après validation**

---

## Annexe A — Refactors automatiques associés (hors validation Lead, exécutés Étape 2B)

Pour mémoire : selon amendement §5.3, les **refactors automatiques décrits dans les 11 audits Phase 1** sont exécutés Étape 2B sans validation Lead individuelle. Synthèse :

1. **Retrait imports orphelins** dans les pages consommatrices :
   - `app/(aujourd-hui)/aujourd-hui/page.tsx` : retirer `DemarrerCard`, `JalonHero`, `checkJalonStatus`.
   - `app/(programme)/programme/page.tsx` : retirer `ConseillerAccess`, `NewPlanPedagogyOverlay`, `maxDuration = 90` si lié.
   - `components/outils/OutilsCatalog.tsx` : retirer items Conseiller / Bibliothèque (top-level) / Messages, retirer section "À venir" + badges "Bientôt", retirer mention "(héros)".
   - `components/outils/ToolMockup.tsx` : retirer branche `ConseillerMockup`.
   - `components/library/LibraryView.tsx` : retirer tab `'conversation'`.
   - `lib/library/types.ts` : retirer label/type `'conversation'`.
   - Autres imports orphelins identifiés à la compilation.

2. **Retrait halos `bg-halo-N` hors Aujourd'hui** :
   - `app/(outils)/outils/page.tsx` (5 halos).
   - `app/(outils)/outils/bibliotheque/page.tsx` (5 halos).
   - `app/(outils)/outils/messages/page.tsx` (3 halos) — moot point, page supprimée Bloc 10.

3. **Modification de breadcrumb** :
   - `app/(outils)/outils/bibliotheque/page.tsx` : `["Aujourd'hui", "Bibliothèque"]` (retirer "Outils").

4. **Marquage `@deprecated`** dans commentaires d'en-tête :
   - `components/layouts/SplitBrief.tsx`.
   - `components/split-brief/SplitBrief.tsx` (à investiguer doublon).
   - `components/programme/ProgrammeDashboard.tsx`.
   - `components/ma-marque/MaMarqueDashboard.tsx`.
   - `components/ma-marque/BarreFondations.tsx` (amendement §3).
   - `components/ma-marque/EtatMarque.tsx` (amendement §3).
   - `app/_actions/ask-mini-chat.ts`.
   - `app/_actions/catch-up-overdue-posts.ts` (sous réserve audit fond Sprint 41).
   - `app/(compte)/compte/mon-compte/page.tsx` (retirer mention "stub Sprint 34").

5. **Création de `archive/v1-leftovers/` et sous-dossiers** :
   - `archive/v1-leftovers/conseiller/lib-core/`
   - `archive/v1-leftovers/conseiller/scenarios/`
   - `archive/v1-leftovers/conseiller/wizard-immersif/`
   - `archive/v1-leftovers/conseiller/components-ui/`
   - `archive/v1-leftovers/conseiller/components-outils/`
   - `archive/v1-leftovers/conseiller/actions/`
   - `archive/v1-leftovers/conseiller/route/`
   - `archive/v1-leftovers/conseiller/programme-entries/`
   - `archive/v1-leftovers/conseiller/mockup/`
   - `archive/v1-leftovers/outils-messages-placeholder/`
   - `archive/v1-leftovers/api-test/`
   - `archive/v1-leftovers/coaching/`
   - `archive/v1-leftovers/retombees/`
   - `archive/v1-leftovers/jalons/`
   - `archive/v1-leftovers/today/`
   - `archive/v1-leftovers/onboarding-legacy/`
   - `archive/v1-leftovers/compte-ma-marque/`
   - `archive/v1-leftovers/dev/`
   - `archive/v1-leftovers/docs/`

6. **Tag + suppression branche `cf-conceptuel-0`** (brief §6.5) :
   ```bash
   git tag archive/cf-conceptuel-0-2026-05 cf-conceptuel-0
   git push origin archive/cf-conceptuel-0-2026-05
   git push origin --delete cf-conceptuel-0
   git branch -D cf-conceptuel-0
   ```

7. **Auto-évaluation finale** : production de `audits/sprint-40/zz-auto-evaluation.md` (brief §9.4).

---

## Annexe B — Ordre suggéré des suppressions Étape 2B

Pour minimiser les imports orphelins en cascade et garantir `npm run build` à chaque étape :

```
Étape 2B.0  Création archive/v1-leftovers/ + sous-dossiers (refactor auto)
Étape 2B.1  Refactors automatiques de retrait d'imports dans les pages consommatrices (refactor auto)
            ↳ aujourd-hui/page.tsx, programme/page.tsx, OutilsCatalog.tsx, ToolMockup.tsx, LibraryView.tsx, lib/library/types.ts
            ↳ Marquage @deprecated dans BarreFondations, EtatMarque, SplitBrief, Dashboards, ask-mini-chat, catch-up-overdue-posts
            ↳ Retrait halos hors Aujourd'hui
            ↳ Modification breadcrumb Bibliothèque
            ↳ commit refactor(sprint-40-phase-2b): refactors automatiques pré-suppression
Étape 2B.2  Bloc 19 - docs/user/conseiller.md (commit chore)
Étape 2B.3  Bloc 18 - dev split-brief (commit chore)
Étape 2B.4  Bloc 17 - Compte ma-marque sous-arbre (commit chore)
Étape 2B.5  Bloc 16 - OnboardingFlow legacy + ConseillerIntro (commit chore)
Étape 2B.6  Bloc 15 - DemarrerCard (commit chore)
Étape 2B.7  Bloc 14 - Jalons (commit chore)
Étape 2B.8  Bloc 13 - Retombées V1 (commit chore)
Étape 2B.9  Bloc 12 - Coaching daily (commit chore)
Étape 2B.10 Bloc 11 - Route AI test (commit chore)
Étape 2B.11 Bloc 10 - Placeholder /outils/messages (commit chore)
Étape 2B.12 Bloc 9 - Mockup ConseillerIPhone (commit chore)
Étape 2B.13 Bloc 8 - Entrées Conseiller dans Programme (commit chore)
Étape 2B.14 Bloc 7 - Route /outils/conseiller (commit chore)
Étape 2B.15 Bloc 5 - Composants UI outils Conseiller (commit chore)
Étape 2B.16 Bloc 4 - Composants UI conversation Conseiller (commit chore)
Étape 2B.17 Bloc 3 - Wizard immersif A1 (commit chore)
Étape 2B.18 Bloc 6 - Server actions Conseiller (commit chore)
Étape 2B.19 Bloc 2 - Scénarios A/B/C/D/E (commit chore)
Étape 2B.20 Bloc 1 - Prompt système + types core Conseiller (commit chore)
Étape 2B.21 Tag + suppression branche cf-conceptuel-0 (commit chore)
Étape 2B.22 Production de audits/sprint-40/zz-auto-evaluation.md (commit docs)
Étape 2B.23 Push final + STOP
```

Justification de l'ordre :
- **2B.0-2B.1** : préparent le terrain (backup + retrait imports orphelins).
- **2B.2-2B.7** : modules indépendants (docs, dev, compte sous-arbre, onboarding, today, jalons) — suppression sans cascade.
- **2B.8-2B.11** : Retombées / Coaching / Test / Placeholder — modules autonomes.
- **2B.12-2B.20** : Conseiller V1 en cascade inverse de la dépendance. On supprime du moins critique (mockup, route, entrées Programme) vers le plus critique (prompt système + types core).
- **2B.21** : Branche `cf-conceptuel-0` en toute fin (purge complète puis archivage).
- **2B.22-2B.23** : Auto-évaluation + push.

Entre chaque étape : `npx tsc --noEmit` pour valider 0 erreur. Si erreur, arrêt et investigation.

---

## Annexe C — Notes opérationnelles à l'attention du Lead

### C.1 Blocs à risque moyen

Trois blocs portent un risque "moyen" (cascade de dépendances) :
- **Bloc 1** (types core Conseiller) — supprimé en dernier, après les consommateurs.
- **Bloc 6** (server actions Conseiller) — supprimé après les composants qui les appellent.
- **Bloc 8** (entrées Programme) — supprimé en parallèle avec refactor automatique de `programme/page.tsx`.
- **Bloc 13** (Retombées) — supprimé après retrait imports dans `PostEditor`/`PostDetailSheet`.
- **Bloc 14** (Jalons) — supprimé après retrait imports dans `aujourd-hui/page.tsx`.

L'ordre Annexe B garantit la cohérence.

### C.2 Cas spécial Bloc 17 — sous-arbre Compte ma-marque

La suppression du dossier `app/(compte)/compte/ma-marque/` n'a pas de cascade code (pages = pas d'import), mais le menu utilisateur (`UserMenuBubble.tsx`) peut pointer vers `/compte/ma-marque/brand-book` ou `/compte/ma-marque/business-calendar`. Vérification + correction des liens à l'Étape 2B (refactor automatique).

### C.3 Cas spécial Bloc 6 — wizard-session.ts

`app/_actions/wizard-session.ts` est importé par :
- `components/conseiller/WizardImmersiveSheet.tsx` (Bloc 3, supprimé)
- `app/_actions/generate-plan-from-wizard.ts` (verdict À refactorer, **conservé**)

Avant la suppression du Bloc 6, vérifier que `generate-plan-from-wizard.ts` n'a plus besoin de `wizard-session.ts` une fois `WizardImmersiveSheet` dégagé. Si dépendance persistante, Bloc 6 ne touche pas `wizard-session.ts` et le laisse pour Sprint 41 dédié refactor.

### C.4 Cas spécial `app/api/ai/chat/route.ts`

Cette route a été notée "À investiguer (probable Recalé)" en Phase 1 (`05-messages.md`). Elle **n'est pas** dans la liste des 19 blocs car son périmètre fonctionnel précis n'a pas été établi avec certitude (utilisé par Conseiller V1 ou aussi par d'autres composants ?).

**Recommandation Lead :** ajouter un Bloc 20 si grep confirme utilisation Conseiller V1 uniquement, sinon laisser pour Sprint 41.

### C.5 Cas spécial composants `components/onboarding/` non legacy

`OnboardingChoiceStep.tsx`, `OnboardingFlow.tsx`, `OnboardingProgress.tsx`, `OnboardingStep.tsx` sont **conservés** (verdict À refactorer Sprint 41+ pour renommage "onboarding" → "premiers pas" en route URL). Pas dans la purge.

### C.6 Migrations SQL — explicitement hors scope

Aucune migration `supabase/migrations/*.sql` n'est créée, modifiée ou rétractée Phase 2. Brief §7 + amendement §5.3. Drop `daily_coaching`, repurpose `conversations`, audit `brand_metrics`, drop colonnes retombées `posts` → tous laissés à un Sprint 41 dédié schéma.

---

## Annexe D — Vérifications à effectuer Lead avant validation

Pour aider le Lead à valider efficacement :

| Bloc | Question à vérifier | Comment |
|---|---|---|
| 1-9 | Le legacy Conseiller V1 est-il intégralement dégagé en V2.0 ? | Lire `00-CONCEPT.md §14` + `01-ARCHITECTURE.md §1` (Messages remplace Conseiller). |
| 10 | "Reporté V2" est-il bien anti-pilier 6 ? | `00-CONCEPT.md §6 pilier 6`. |
| 11 | Route `/api/ai/test` est-elle exposée en prod ? | Test manuel ou grep. |
| 12 | Coaching daily est-il vraiment dégagé doctrine ? | `00-CONCEPT.md §3 anti-référence`. |
| 13 | Retombées V1 sont-elles hors V1 ? | `00-CONCEPT.md §8 V1 — "Pas d'analyse de performance"`. |
| 14 | Méthode pédagogique 4 mois est-elle dégagée ? | `00-CONCEPT.md §14`. |
| 15 | Onboarding visible en home est-il anti-pilier 8 ? | `00-CONCEPT.md §6 pilier 8`. |
| 16 | OnboardingFlow legacy + ConseillerIntro = vraiment caducs ? | Nommage explicite `.legacy-sprint34` + `00-CONCEPT.md §14`. |
| 17 | Compte ≠ Ma Marque doctrinal ? | `01-ARCHITECTURE.md §4`. |
| 18 | Route dev en prod = anti-pilier 6 ? | `00-CONCEPT.md §6 pilier 6`. |
| 19 | Doc conseiller trompeuse pour Floriane ? | `00-CONCEPT.md §14`. |

---

*Fichier produit en Étape 2A, Sprint 40 Phase 2, le 21 mai 2026. Aucune modification de code n'a été effectuée à cette étape. STOP après commit + push, en attente de validation Lead intermédiaire (amendement §5.2).*
