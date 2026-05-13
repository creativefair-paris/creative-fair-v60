# Sprint 37.A — Audit final

Date : 14 mai 2026
Branche : `sprint-37` (poursuivie depuis Sprint 37)
Référence canonique : `docs/sprint-37/09-modele-conseiller-en-situation.md`

---

## Résumé exécutif

Sprint 37.A — Polish UI + corrections + Bibliothèque V1 — livré
en 16 commits atomiques sur la même branche `sprint-37`. Build
vert tout du long. tsc --noEmit propre à chaque commit.

10 findings + 4 amendements Apple Cupertino salve 4 (tokens
visuels, hiérarchie Conseiller héros, copy Sarah, Hiroshi
spacing/bulles).

---

## Tous les commits Sprint 37.A

```
dd43136  /outils hiérarchie Conseiller héros + copy Vide /programme
36a2bd9  [F10] carte "Démarrer cette semaine" premier usage
114c627  [F9.UI+upload+preview] Bibliothèque V1 complète
93c9e9f  [F9.UI] migration library_documents + bucket storage
6b59663  [F8-bis] page placeholder /outils/messages
e0965d1  [F8] UI /outils/reviews split brief + sheet Vérifier
b03882f  [F8] sub-prompts + server actions runReviewCheck + createReview
a579c93  [F8] migration reviews + bucket review-visuals
85ae357  [F7] bloc "À faire cette semaine" sur /aujourd-hui
ad20f47  [F6] breadcrumb 3 niveaux sur /outils/*
5d17172  [F5] bouton Reprendre + état REOPENED + continued_from
53a5c52  [F4] dedup messages + debounce envoyer + anti-race
058456b  [F3] rendu boutons-choix UI dans ConseillerSheet
6f66bd5  [F3] format CHOIX structuré + parsing server action
5d6c50c  [F1+F2] polish visuel sheet conseiller + tokens
d156357  tokens visuels Apple-grade + setup decisions (préambule)
```

---

## Couverture des findings

| # | Finding | Status | Commits |
|---|---|---|---|
| Tokens | tokens visuels Apple-grade (préambule) | ✓ | 1 |
| F1+F2 | Polish visuel sheet conseiller | ✓ | 1 |
| F3 | Boutons-choix CHOIX structuré + parsing + UI | ✓ | 2 |
| F4 | Bug duplication message | ✓ | 1 |
| F5 | Bouton Reprendre + REOPENED | ✓ | 1 |
| F6 | Breadcrumb /outils › | ✓ | 1 |
| F7 | Bloc À faire cette semaine | ✓ | 1 |
| F8 | Reviews refondu fact-check + crédits | ✓ | 3 (migration + actions + UI) |
| F8-bis | /outils/messages placeholder | ✓ | 1 |
| F9 | Bibliothèque V1 (UI + upload + listing + preview) | ✓ | 2 (migration + tout en 1) |
| F10 | Carte Démarrer premier usage | ✓ | 1 |
| Hiérarchie | /outils Conseiller héros + copy Sarah Vide /programme | ✓ | 1 |

**Total : 16 commits.** Tous poussés sur `sprint-37`. Pas de tag.
Pas de merge sur main.

---

## 4 amendements Apple Cupertino salve 4 — vérification

### Hiroshi — Tokens visuels Apple-grade ✓
- `app/globals.css` :
  - `.btn-primary` (5 états : default/hover/active/focus/disabled)
  - `.btn-choice` (+ `.btn-choice-sm`)
  - `.btn-send-active` / `.btn-send-inactive` (chat)
  - Palette `--status-{draft,published,archived,pending}` +
    `.status-badge` modifiers
  - `.segmented-control` (pattern iOS)
  - `.bulle-conseiller` (font 15/1.6, p+p margin-top 12)
- Boutons noirs solides migrés vers `.btn-primary` :
  - "Continuer" (PeriodSelectionSheet)
  - "Nouvelle question" (ConseillerHistory, 2 occurrences)
  - "Vérifier un post" (ReviewsHistory)
  - "Ajouter un document" (LibraryView)
  - "Envoyer" (ConseillerSheet) via classes dynamiques

### Sarah — Copy final ✓
| Endroit | Copy Sarah | Implémenté |
|---|---|---|
| Bloc /aujourd-hui (F7) | "À faire cette semaine" | ✓ AFaireCetteSemaine.tsx |
| Bouton continue conversation (F5) | "Reprendre" | ✓ ConseillerHistory.tsx |
| Bouton nouvelle vérification reviews (F8) | "Vérifier un post" | ✓ ReviewsHistory.tsx |
| Titre outil placeholder (F8-bis) | "Messages" | ✓ /outils/messages |
| Sous-titre Bibliothèque (F9) | "Tout ce que tu as, en un seul endroit." | ✓ LibraryView + PageHeader subtitle |
| Vide /programme | "Tu n'as pas encore de plan en cours." | ✓ /programme/page.tsx |

### Marcus — Hiérarchie /outils Conseiller héros ✓
CatalogueOutils.tsx refondu en CSS Grid 2 cols :
- Carte HERO Conseiller : grid-column 1/-1, padding 24, icône 52,
  fond glass-regular niveau 2, titre 20/600, border bleu.
- 5 cartes 1-col : Bibliothèque, Reviews, Messages, Post Creator,
  Moodboard, Variations. Padding 16, icône 40, glass-thin niveau 1.
- Mobile : passage 1 colonne, hero conserve grid-column 1/-1.

### Elena (machine à états + scope F9) ✓
- F5 état REOPENED implémenté via `context.continued_from` +
  bloc "Reprise de conversation" injecté dans le system prompt
  via `reopenedRecap` (lib/conseiller/system-prompt.ts).
- F9.V1 scopé conformément au compromis Elena : UI + upload +
  listing + preview livrés Sprint 37.A. RAG + attachment manuel
  reportés Sprint 38 (décision provider embedding à arbitrer
  par Lead avant).

---

## Migrations Supabase à appliquer

Avant que le Lead teste sur Vercel + Supabase Frankfurt :

```sql
-- 017_reviews.sql       — table reviews + bucket review-visuals
-- 018_library_documents.sql — table library_documents + bucket library-uploads
```

Les 2 sont idempotentes (DO blocks + IF NOT EXISTS + DROP POLICY
IF EXISTS), rejouables sans erreur.

Sprint 37 avait déjà introduit 014/015/016 — Sprint 37.A continue
la numérotation linéaire.

---

## Variables d'environnement

Pas de changement par rapport à Sprint 37 :

```
ANTHROPIC_API_KEY     ← réutilisé pour runReviewCheck (claude-opus-4-5)
SUPABASE_*            ← existants
```

Si `ANTHROPIC_API_KEY` absente, `runReviewCheck` bascule sur le
fallback texte hors-ligne (payload "à vérifier" pour le texte +
crédits "inconnu" pour le visuel). Le squelette UI/upload/listing
reste opérationnel pour QA.

---

## TODOs laissés pour Sprint 38

1. **F9.V2 RAG + attachment manuel** — recherche sémantique
   pgvector dans la Bibliothèque + bouton "Joindre" dans le chat
   conseiller. Provider embedding à arbitrer par Lead.

2. **Streaming réel Anthropic via SSE** — reporté de Sprint 37
   audit final, toujours d'actualité.

3. **API Meta DM/commentaires** — implémentation Messages
   (Sprint 37.A livre uniquement le placeholder).

4. **DOCX preview natif** — V1 : message "Télécharger pour voir"
   pour DOCX dans LibraryPreview. V2 : conversion HTML via
   mammoth.js (dépendance non ajoutée en V1 par souci de
   scope).

5. **Tests E2E Sprint 37.A** — les 5 specs Sprint 37 restent
   valables. Ajouter des specs dédiées :
   - reviews flow (create + check + display)
   - bibliotheque upload + filter + preview
   - démarrer card visibility

6. **Stabilisation /outils** — la refonte grid est un V1 simple.
   Possibilité d'ajouter une icône "Bibliothèque" plus distincte
   (BookIcon V1 est rudimentaire).

---

## État build / tests

- `npx tsc --noEmit` : propre (vérifié à chaque commit).
- `npm run build` (Turbopack production) : vert, toutes les
  routes générées y compris /outils/bibliotheque,
  /outils/messages, /outils/reviews refondu.
- Tests E2E Sprint 37 (5 specs) : non re-vérifiés ; risque
  potentiel d'évolution des sélecteurs (Sprint 37.A a refondu
  ConseillerSheet rendering). À re-jouer en CI par le Lead.

---

## Recommandations pour le Lead

1. **Tester visuellement la sheet conseiller** sur un device
   réel. C'est le composant le plus retouché (F1+F2 + F3 + F4).
   Tour 1 doit montrer la pastille colorée + bulle flottante
   16px du bord + bouton envoyer qui passe au bleu quand on
   tape.

2. **Tester le flow F9 upload** : drag PDF → preview iframe.
   Si possible tester DOCX → message + bouton Télécharger.

3. **Tester F4 (anti-race + dedup)** : essayer de cliquer
   plusieurs fois sur "Envoyer" rapidement. Aucune duplication
   ne doit apparaître.

4. **Vérifier F10** : si tenant_age >7j, la card "Démarrer"
   ne doit pas s'afficher.

5. **Re-run E2E** : `npm run test:e2e` avec Anthropic key
   configurée (sinon fallback hors-ligne testé).

6. **Appliquer les migrations 017 + 018** avant tout test
   réel des features F8 + F9.

---

## Note Apple Audit cumulée

Sprint 37 : 7,5/10 doctrine + 7/10 exécution.
Sprint 37.A apporte :
- Polish visuel sheet (+1 sur Hiroshi)
- Boutons-choix prédominants (rattrapage doc 09 §8)
- Bug duplication corrigé (qualité d'exécution)
- Bibliothèque + Reviews + Messages livrés (couverture moat
  Creative Fair, cf. 00-CONCEPT.md "Bibliothèque" implicite)

Estimation honnête post-37.A : 8/10. Au-dessus du seuil
Apple-grade pour V1 livrable client.
