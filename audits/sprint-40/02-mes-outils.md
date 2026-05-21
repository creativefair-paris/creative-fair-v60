# Audit Sprint 40 — Page Mes Outils

> Verdict global : **À refactorer** (avec un sous-arbre Recalé massif côté Conseiller)
> Doctrine de référence : `00-CONCEPT.md` §5 promesse 5 "Tu crées sans bricoler. Mes Outils centralise la création éditoriale (Post Creator, Moodboard, Variations, Reviews, et plus tard Emailing, Reels, Films, Ads, Rapport)." · `01-ARCHITECTURE.md` §1 "Mes Outils · Catalogue des outils de création éditoriale" · §3.2 layout sub-sidebar 260px.

---

## 1. Périmètre audité

### 1.1 Route principale et catalogue

- `app/(outils)/layout.tsx` — layout du groupe.
- `app/(outils)/outils/page.tsx` — catalogue Mes Outils. Sprint 37.C, Split Brief sidebar 36% + preview 64% avec Conseiller sélectionné par défaut.
- `components/outils/OutilsCatalog.tsx` — composant catalogue principal (2 colonnes 36/64).
- `components/outils/ToolMockup.tsx` — délégateur de previews mockup.
- `components/outils/previews/PostCreatorHubPreview.tsx` — preview Post Creator dans le hub.
- `components/outils/mockups/InstagramIOSMockup.tsx` — mockup iOS Instagram (Sprint 37.K-N).
- `components/outils/mockups/InstagramStoryRing.tsx` — story ring conique 5 couleurs.
- `components/outils/mockups/ConseillerIPhoneMockup.tsx` — mockup Messages iOS style.
- `components/outils/mockups/icons/MetaVerifiedBadge.tsx`
- `components/outils/mockups/icons/InstagramRepost.tsx`

### 1.2 Outils enfants — Post Creator (conforme)

- `app/(outils)/outils/post-creator/page.tsx` + `[format]/page.tsx` — hub Post Creator + page dynamique par format (anecdote-live, anecdote-custom, brief-externe, etc.).
- `components/outils/post-creator/AnecdoteCustom.tsx`
- `components/outils/post-creator/AnecdoteLive.tsx`
- `components/outils/post-creator/BriefExterne.tsx`
- `components/outils/post-creator/ContextColumn.tsx`
- `components/outils/post-creator/FormatCard.tsx`
- `components/outils/post-creator/FormatCardApple.tsx`
- `components/outils/post-creator/PostCreatorLayout.tsx`
- `components/outils/post-creator/PreviewIOS.tsx`
- `components/outils/post-creator/Programmer.tsx`

### 1.3 Outils enfants — Moodboard, Variations, Reviews (conformes)

- `app/(outils)/outils/moodboard/page.tsx`
- `app/(outils)/outils/variations/page.tsx`
- `app/(outils)/outils/reviews/page.tsx`
- `components/reviews/ReviewPreview.tsx`
- `components/reviews/ReviewSheet.tsx`
- `components/reviews/ReviewsHistory.tsx`

### 1.4 Sous-arbre Conseiller — entièrement Recalé

- `app/(outils)/outils/conseiller/page.tsx` — page Conseiller en mode historique.
- `components/outils/conseiller/ConseillerChat.tsx` — déjà marqué "SUPPRESSION CANDIDATE Sprint 36" en commentaire d'en-tête.
- `components/outils/conseiller/ConseillerLayout.tsx`
- `components/outils/conseiller/ConversationsList.tsx` — idem "SUPPRESSION CANDIDATE Sprint 36".

### 1.5 Sous-arbre Messages — placeholder Sprint 37.A

- `app/(outils)/outils/messages/page.tsx` — placeholder qui dit "Reporté V2 avec intégration API Meta".

### 1.6 Sous-arbre Bibliothèque — sous Outils (à promouvoir top-level)

- `app/(outils)/outils/bibliotheque/page.tsx`
- `components/library/LibraryPreview.tsx`
- `components/library/LibraryUploadSheet.tsx`
- `components/library/LibraryView.tsx`
- `lib/library/queries.ts`
- `lib/library/types.ts`

Note : traité en détail dans `06-bibliotheque.md`. Ici on note simplement que **Bibliothèque doit sortir du sous-arbre Outils** car en V2.0 c'est une destination top-level de la section Travail.

### 1.7 Server actions Outils

- `app/_actions/create-library-document.ts`
- `app/_actions/create-review.ts`
- `app/_actions/run-review-check.ts`
- `app/_actions/upload-review-visual.ts`
- `app/api/outils/moodboard/route.ts`
- `app/api/outils/reviews/route.ts`
- `app/api/outils/variations/route.ts`

### 1.8 Conseiller V1 — module entier (à dégager)

L'écosystème Conseiller historique débordant largement Mes Outils :

- `lib/conseiller/system-prompt.ts` — prompt Conseiller, distinct de VOICE_SHEET_RULES SACRED.
- `lib/conseiller/types.ts`
- `lib/conseiller/queries.ts`
- `lib/conseiller/markdown-parser.ts`
- `lib/conseiller/parse-metrics-block.ts`
- `lib/conseiller/scenario-palette.ts`
- `lib/conseiller/waiting-states.ts`
- `lib/conseiller/onboarding-types.ts`
- `lib/conseiller/scenarios/index.ts` + 13 sub-prompts (A1, A2, A7, A8, B2, B4, B5, C3a, C3b, D6, D8, D9, E1, E-divers, A1-pedagogy-prompt).
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
- `app/_actions/run-conseiller-turn.ts`
- `app/_actions/mark-conseiller-timeout.ts`
- `app/_actions/find-resumable-session.ts` (en partie — sessions wizard Conseiller)
- `app/_actions/ask-mini-chat.ts`
- `app/_actions/generate-pedagogy.ts`
- `app/_actions/wizard-session.ts`

Total Conseiller V1 : **~45 fichiers** à éradiquer en Phase 2.

---

## 2. Confrontation à la doctrine

### `app/(outils)/outils/page.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §5 promesse 5 (liste outils). `01-ARCHITECTURE.md` §1 (chemin attendu `/mes-outils` en doctrine, mais le repo actuel est sur `/outils`).
- **Constat factuel :** Catalogue Split Brief 36/64. Sprint 37.C. "Conseiller (héros)" est l'item par défaut sélectionné.
- **Écart constaté :**
  1. Section "Piloter : Conseiller (héros), Bibliothèque" → Conseiller à dégager (fusionné dans Messages selon doctrine V2.0), Bibliothèque à promouvoir top-level.
  2. Section "Créer : Post Creator, Moodboard, Variations, Reviews" → conforme.
  3. Section "À venir : Messages, Emailing, Reels, Films" → contredit pilier Apple #6 Uncompromising Polish "Zéro 'bientôt', zéro 'à venir'" (`00-CONCEPT.md` §6) + vocabulaire interdit `00-CONCEPT.md` §9 "bientôt, à venir, coming soon".
  4. Le mot "Mes Outils" canonique en V2.0 (`01-ARCHITECTURE.md` §1) → la route actuelle est `/outils`, à renommer en `/mes-outils` ou à conserver tel quel (à trancher Sprint 41).
  5. 5 `<div className="bg-halo bg-halo-1">` … `bg-halo-5` ≠ doctrine §3.4 "Wallpaper saturated réservé à Aujourd'hui uniquement".
- **Action proposée Phase 2 :**
  - Retirer la section "À venir" entièrement (Messages placeholder, Emailing/Reels/Films stubs).
  - Retirer "Conseiller" de la sidebar gauche → renvoyer le user vers Messages (à créer Sprint 43).
  - Retirer Bibliothèque de la sidebar Outils (promotion top-level).
  - Retirer les 5 `bg-halo` (wallpaper saturated hors scope Aujourd'hui).
  - Retirer "(héros)" comme libellé.

### `app/(outils)/layout.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.2 layout pages métier = sub-sidebar 260px + content.
- **Constat factuel :** Shell.
- **Écart constaté :** À auditer pour vérifier qu'il ne pose pas de Split Brief 40/60 obsolète.
- **Action proposée Phase 2 :** Vérification + ajustement éventuel.

### `components/outils/OutilsCatalog.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `01-ARCHITECTURE.md` §3.2. `00-CONCEPT.md` §11 "Lucide React stroke 1.6, viewBox 24, taille rendue 20px. Phosphor n'est pas installé en V1." `10-SACRED.md` "Pas d'emoji ni d'exclamation".
- **Constat factuel :** 10 icônes SVG inline custom (stroke 1.6, viewBox 24, 20×20) dans le composant — cohérent doctrine.
- **Écart constaté :**
  1. Section "À venir" porte plusieurs items disabled avec badge "Bientôt" — vocabulaire interdit absolu.
  2. Item Conseiller marqué "(héros)" → suprématie visuelle d'un module Recalé.
  3. Cohabite "Conseiller", "Bibliothèque", "Messages" qui en V2.0 sortent toutes du sous-arbre Outils.
- **Action proposée Phase 2 :**
  - Retirer items "Bientôt".
  - Retirer Conseiller / Bibliothèque / Messages du catalogue.
  - Catalogue cible Sprint 40 : Post Creator, Moodboard, Variations, Reviews. Quatre items. Point.

### `components/outils/ToolMockup.tsx`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §6 pilier 7 Native Synergy (patterns iOS 26).
- **Constat factuel :** Délégateur de previews — `PostCreatorMockup` → `InstagramIOSMockup`, `ConseillerMockup` → `ConseillerIPhoneMockup`.
- **Écart constaté :** La preview Conseiller n'a plus de sens en V2.0 (Conseiller dégagé).
- **Action proposée Phase 2 :** Retirer la branche `ConseillerMockup`. Garder uniquement PostCreatorMockup.

### `components/outils/previews/PostCreatorHubPreview.tsx`
- **Statut doctrinal :** Validé
- **Référence doctrine :** `00-CONCEPT.md` §5 promesse 5.
- **Constat factuel :** Layout sticky vertical avec mockup Instagram iOS.
- **Écart constaté :** Aucun majeur.
- **Action proposée Phase 2 :** Aucune.

### `components/outils/mockups/InstagramIOSMockup.tsx`
- **Statut doctrinal :** Validé (sous réserve audit visuel Lead pixel-près)
- **Référence doctrine :** Sprint 37.K-N livraisons.
- **Constat factuel :** Réplique iOS mai 2026 pixel-près (story ring, meta verified, action row, carousel, caption truncate "… plus"). Sprint 37.N adoucissement validé.
- **Écart constaté :** Aucun.
- **Action proposée Phase 2 :** Aucune.

### `components/outils/mockups/InstagramStoryRing.tsx`
- **Statut doctrinal :** Validé
- **Référence doctrine :** Sprint 37.N validé.
- **Action proposée Phase 2 :** Aucune.

### `components/outils/mockups/ConseillerIPhoneMockup.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 "Conseiller comme page séparée (fusionné dans Messages)". Le mockup d'un Conseiller standalone n'a plus d'objet.
- **Constat factuel :** Mockup iPhone iOS Messages avec bulles fictives Conseiller.
- **Écart constaté :** Concept obsolète. Si un mockup Messages est utile au Sprint 43+, il portera la conversation Hélène M. (pas "Conseiller").
- **Action proposée Phase 2 :** Supprimer. Backup `archive/v1-leftovers/mockups/ConseillerIPhoneMockup.tsx`.

### `components/outils/mockups/icons/MetaVerifiedBadge.tsx`
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Aucune.

### `components/outils/mockups/icons/InstagramRepost.tsx`
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Aucune.

### Post Creator — sous-arbre entier
- **Statut doctrinal :** Validé (avec petits refactors de vocabulaire éventuels)
- **Référence doctrine :** `00-CONCEPT.md` §5 promesse 5 (Post Creator est cité). `02-EXPERTS.md` §6.2 "Post Creator > Anecdote : Albane R. génère un post".
- **Constat factuel :** 9 composants + 2 routes (hub + dynamique format). Architecture par format (anecdote-live, anecdote-custom, brief-externe).
- **Écart constaté :** Audit copies Sprint 41 (vocabulaire), mais structure validée.
- **Action proposée Phase 2 :** Aucune action structurelle. Audit copies dans `10-transverse.md` §4.

### Moodboard
- **Statut doctrinal :** Validé
- **Référence doctrine :** `00-CONCEPT.md` §5 (cité).
- **Action proposée Phase 2 :** Aucune action structurelle.

### Variations
- **Statut doctrinal :** Validé
- **Action proposée Phase 2 :** Aucune action structurelle.

### Reviews (composants + route)
- **Statut doctrinal :** Validé
- **Référence doctrine :** `00-CONCEPT.md` §5 (cité).
- **Action proposée Phase 2 :** Aucune action structurelle.

### `lib/reviews/system-prompt.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md` §9 voix singulières des Experts. `03-VOICE_SHEET.md` §5.
- **Constat factuel :** Prompt système Reviews indépendant. Contient une liste de vocabulaire interdit.
- **Écart constaté :** Probablement plus aligné sur "Reviews" V1 isolé que sur la voix d'un Expert nommé (Antoine F. ou Albane R.).
- **Action proposée Phase 2 :** Audit Sprint 41 (refactor pour signer l'Expert pertinent, cf. `lib/ai/prompts/experts/` à créer).

### `lib/reviews/scenarios/*` (credit-visual-only, fact-check-post)
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** idem.
- **Constat factuel :** Sub-prompts par scénario Review.
- **Écart constaté :** Architecture sub-prompt cohérente, mais pas alignée sur le système Experts cible.
- **Action proposée Phase 2 :** À aligner Sprint 43+ (refactor d'attribution Expert).

### `app/(outils)/outils/conseiller/page.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 "Conseiller comme page séparée (fusionné dans Messages avec Hélène M. pinned)". `10-SACRED.md` "L'ancienne nav 4 destinations (Aujourd'hui / Calendrier / Ma Marque / Conseiller) est caduque depuis le 20 mai 2026."
- **Constat factuel :** Page historique des conversations Conseiller + auto-ouverture sheet via query params.
- **Écart constaté :** Route et concept entiers Recalés.
- **Action proposée Phase 2 :** Supprimer la route. Backup `archive/v1-leftovers/conseiller-route/page.tsx`. Côté UX, redirect propre vers `/outils` (ou vers `/messages` quand créée).

### `app/(outils)/outils/messages/page.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §6 pilier 6 "Zéro 'bientôt', zéro 'à venir'". `10-SACRED.md` (idem).
- **Constat factuel :** Page placeholder Sprint 37.A "Reporté V2 avec API Meta".
- **Écart constaté :** Une route placeholder en prod = anti-doctrine Apple Polish.
- **Action proposée Phase 2 :** Supprimer la route. La vraie page `/messages` (top-level) sera créée Sprint 43+ avec Hélène + Experts.

### `components/outils/conseiller/ConseillerChat.tsx`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** idem. Le commentaire d'en-tête lui-même indique "SUPPRESSION CANDIDATE Sprint 36".
- **Constat factuel :** Chat Conseiller streaming legacy.
- **Écart constaté :** Le code lui-même se signale candidat à suppression depuis 5 sprints.
- **Action proposée Phase 2 :** Supprimer. Backup `archive/v1-leftovers/outils-conseiller/`.

### `components/outils/conseiller/ConversationsList.tsx`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer. Backup.

### `components/outils/conseiller/ConseillerLayout.tsx`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer. Backup.

### `lib/conseiller/system-prompt.ts`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `10-SACRED.md` "Les system prompts des Experts sont SACRÉS" mais ce prompt est celui du Conseiller historique, hors système Experts.
- **Constat factuel :** Prompt Conseiller cumulatif avec 5 lois + vocabulaire interdit + scope V1 TF + doctrine fondatrice. Distinct de `lib/ai/prompts/system.ts` (VOICE_SHEET_RULES SACRED).
- **Écart constaté :** Concept Conseiller entier dégagé en V2.0. Le contenu (les "5 lois", la liste vocabulaire interdit) pourra être réutilisé pour réécrire les prompts Experts Sprint 43+.
- **Action proposée Phase 2 :** Supprimer le fichier de son emplacement actif (`lib/conseiller/`). **Backup obligatoire** dans `archive/v1-leftovers/conseiller/system-prompt.ts` car contient de la doctrine éditoriale potentiellement réutilisable.

### Tout `lib/conseiller/scenarios/*` (13 sub-prompts + index + A1-pedagogy-prompt)
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `02-EXPERTS.md` §10 "Le Post Creator… n'est pas un Expert" + §6.2 "génération automatique de contenu — le LLM utilisé est toujours celui de l'Expert correspondant". Les scénarios A/B/C/D/E sont une autre architecture, non doctrine V2.0.
- **Constat factuel :** 14 sub-prompts (A1, A2, A7, A8, B2, B4, B5, C3a, C3b, D6, D8, D9, E1, E-divers) + A1-pedagogy-prompt + index.
- **Écart constaté :** Architecture par scénario Conseiller en conflit total avec l'architecture par Expert nommé (Hélène + 12 Experts). Aucun scénario actuel ne correspond à un Expert nommé.
- **Action proposée Phase 2 :** Supprimer tous les fichiers `lib/conseiller/scenarios/*`. **Backup obligatoire en bloc** dans `archive/v1-leftovers/conseiller-scenarios/` (richesse éditoriale réutilisable).

### `lib/conseiller/queries.ts`, `lib/conseiller/markdown-parser.ts`, `lib/conseiller/parse-metrics-block.ts`, `lib/conseiller/scenario-palette.ts`, `lib/conseiller/types.ts`, `lib/conseiller/waiting-states.ts`, `lib/conseiller/onboarding-types.ts`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer (backup `archive/v1-leftovers/conseiller/lib/`).

### `components/conseiller/*` (20 composants) + `components/conseiller/wizard-steps/*` (13 steps)
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14, `10-SACRED.md`.
- **Constat factuel :** ~33 composants Conseiller V1.
- **Écart constaté :** Concept entier dégagé.
- **Action proposée Phase 2 :** Supprimer. Backup `archive/v1-leftovers/conseiller-components/`.

### `app/_actions/run-conseiller-turn.ts`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer. Backup.

### `app/_actions/mark-conseiller-timeout.ts`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer.

### `app/_actions/find-resumable-session.ts`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** Action liée au wizard Conseiller.
- **Action proposée Phase 2 :** Supprimer.

### `app/_actions/ask-mini-chat.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md` §1 "Floriane parle à Hélène en français naturel".
- **Constat factuel :** Mini-chat (probablement utilisé dans `PostMiniChat`).
- **Écart constaté :** Architecturé sans nommage Expert.
- **Action proposée Phase 2 :** À aligner Sprint 43+. Pour Sprint 40, conserver mais marquer `@deprecated`.

### `app/_actions/generate-pedagogy.ts`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §14 "Méthode pédagogique 4 mois (V60-pre)" abandonnée.
- **Constat factuel :** Génère le contenu pédagogique du wizard A1 Conseiller.
- **Écart constaté :** Méthode pédagogique 4 mois dégagée.
- **Action proposée Phase 2 :** Supprimer.

### `app/_actions/wizard-session.ts`
- **Statut doctrinal :** Recalé
- **Action proposée Phase 2 :** Supprimer (session wizard Conseiller).

### `app/api/ai/chat/route.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md` (architecture Experts).
- **Constat factuel :** Endpoint chat Conseiller historique.
- **Écart constaté :** Probable cible Recalée. À investiguer Phase 2.
- **Action proposée Phase 2 :** Investiguer. Si utilisé uniquement par Conseiller V1 → supprimer. Sinon refactor pour cibler Hélène + Experts (Sprint 43+).

### `app/api/ai/coaching/route.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `00-CONCEPT.md` §3 anti-référence "Pas de métriques inventées qui simulent un contrôle".
- **Constat factuel :** Route de génération coaching quotidien.
- **Écart constaté :** Concept "coaching" en daily contredit la doctrine "tranquillité du pilote en cockpit" (cf. lecture erronée à éviter).
- **Action proposée Phase 2 :** Investiguer. Probable Recalé.

### `app/api/ai/post-generation/route.ts`
- **Statut doctrinal :** Validé
- **Référence doctrine :** `02-EXPERTS.md` §6.2.
- **Constat factuel :** Génération de posts via IA.
- **Écart constaté :** Aucun structurel.
- **Action proposée Phase 2 :** Audit Sprint 41 (vérifier prompt système signé Expert).

### `app/api/ai/brand-book/route.ts`
- **Statut doctrinal :** Validé (sous réserve audit prompt)
- **Action proposée Phase 2 :** Aucune action structurelle.

### `app/api/ai/brief/route.ts`
- **Statut doctrinal :** À refactorer
- **Référence doctrine :** `02-EXPERTS.md` §6.2 brief externe = Sonnet 4.6.
- **Constat factuel :** Endpoint génération brief.
- **Action proposée Phase 2 :** Audit Sprint 43+ pour alignement Experts.

### `app/api/ai/business-suggest/route.ts`
- **Statut doctrinal :** À refactorer
- **Action proposée Phase 2 :** Audit Sprint 43+.

### `app/api/ai/test/route.ts`
- **Statut doctrinal :** Recalé
- **Référence doctrine :** `00-CONCEPT.md` §6 pilier 6 Uncompromising Polish.
- **Constat factuel :** Route de test exposée en prod.
- **Écart constaté :** Route de test active en prod.
- **Action proposée Phase 2 :** Supprimer. Backup.

---

## 3. Confrontation à la spec HTML

**[doctrine silencieuse sur le détail visuel de Mes Outils v2]** — les 10 HTML Claude Design ne sont pas dans le repo.

Ce que la doctrine couvre :
- `01-ARCHITECTURE.md` §3.2 layout sub-sidebar 260px + content. Le code actuel a Split Brief 36/64 — à refactorer Sprint 43+.
- `00-CONCEPT.md` §5 promesse 5 liste les 4 outils V1 (Post Creator, Moodboard, Variations, Reviews) + futurs V2+ (Emailing, Reels, Films, Ads, Rapport). La cible V1 = 4 outils.
- `00-CONCEPT.md` §6 pilier 6 "Si ce n'est pas prêt, ce n'est pas montré." → la section "À venir" Sprint 37.C est l'inverse de cette doctrine.

---

## 4. Résumé chiffré

| Verdict | Nombre |
|---|---|
| Validés | 12 |
| À refactorer | 17 |
| Recalés | ~52 (sous-arbre Conseiller + Conseiller-routes + tests + scenarios) |
| Total fichiers Mes Outils audités | ~81 |

Recalés détail synthétique :
- `app/(outils)/outils/conseiller/page.tsx`
- `app/(outils)/outils/messages/page.tsx`
- `components/outils/conseiller/*` (3 fichiers)
- `components/outils/mockups/ConseillerIPhoneMockup.tsx`
- `lib/conseiller/*` (incl. scenarios) — ~22 fichiers
- `components/conseiller/*` + wizard-steps — ~33 fichiers
- `app/_actions/run-conseiller-turn.ts`
- `app/_actions/mark-conseiller-timeout.ts`
- `app/_actions/find-resumable-session.ts`
- `app/_actions/generate-pedagogy.ts`
- `app/_actions/wizard-session.ts`
- `app/api/ai/test/route.ts`

---

## 5. Recommandation pour Phase 2

Mes Outils est la page la plus contaminée par le legacy V1. Trois lots d'actions :

### 5.1 Purge Conseiller massive (à valider en bloc dans `proposed-deletions.md`)

Suppression du **module Conseiller entier** soit ~60 fichiers. Pour limiter les rounds, regrouper en blocs :

**Bloc A — Routes** :
- `app/(outils)/outils/conseiller/` (page.tsx + sous-fichiers)
- `app/(outils)/outils/messages/page.tsx`

**Bloc B — Components Conseiller V1** :
- `components/conseiller/*` (20 fichiers)
- `components/conseiller/wizard-steps/*` (13 fichiers)
- `components/outils/conseiller/*` (3 fichiers)
- `components/outils/mockups/ConseillerIPhoneMockup.tsx`

**Bloc C — lib Conseiller** :
- `lib/conseiller/*` (~10 fichiers)
- `lib/conseiller/scenarios/*` (15 fichiers)

**Bloc D — Server actions Conseiller** :
- `app/_actions/run-conseiller-turn.ts`
- `app/_actions/mark-conseiller-timeout.ts`
- `app/_actions/find-resumable-session.ts`
- `app/_actions/generate-pedagogy.ts`
- `app/_actions/wizard-session.ts`

**Bloc E — Routes API/Test** :
- `app/api/ai/test/route.ts`
- `app/api/ai/chat/route.ts` (à investiguer avant suppression)

### 5.2 Refactor automatique du catalogue

Sur `components/outils/OutilsCatalog.tsx` et `app/(outils)/outils/page.tsx` :
- Retirer les sections "À venir" + "Bientôt".
- Retirer items Conseiller / Bibliothèque / Messages.
- Retirer halos `bg-halo-1..5` (wallpaper saturated hors scope).
- Retirer mention "(héros)".
- Catalogue cible : 4 items Post Creator · Moodboard · Variations · Reviews.

### 5.3 Hors scope Sprint 40

- Création d'une vraie page `/messages` top-level avec Hélène + Experts.
- Création de `lib/ai/prompts/helene.ts` + `lib/ai/prompts/experts/*.ts` (Sprint 43+).
- Renommage `/outils` → `/mes-outils` (à trancher Sprint 41).
- Refactor Reviews/Post Creator pour aligner sur signature Expert.
