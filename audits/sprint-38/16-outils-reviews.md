# Page : /outils/reviews

## Métadonnées
- Route : `/outils/reviews`
- Fichier source : `app/(outils)/outils/reviews/page.tsx` (64 lignes)
- Composants principaux :
  - `components/reviews/ReviewsHistory.tsx` (208 lignes, `'use client'`)
  - `components/reviews/ReviewPreview.tsx` (254 lignes, `'use client'`)
  - `components/reviews/ReviewSheet.tsx` (345 lignes, `'use client'`)
  - `components/layouts/SplitBrief` (40/60)
  - `components/layout/PageHeader`
- Server Actions :
  - `app/_actions/create-review.ts`
  - `app/_actions/run-review-check.ts`
  - `app/_actions/upload-review-visual.ts`
- Queries : `lib/reviews/queries.ts` (`listReviews`)
- Types : `lib/reviews/types.ts`
- Server / Client : Page Server (auth + data fetch), `<ReviewsHistory>` Client orchestre la liste + preview + sheet.
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise)

## Lecture rapide
Reviews V1 : fact-check texte + crédit visuel d'un post avant publication. Split brief 40/60 : historique reviews à gauche, preview de la review sélectionnée à droite (3 sections : fact-check + crédit visuel + ready-to-paste). Sheet de création avec textarea + upload visuel (PNG/JPG/JPEG/WEBP) ou URL, invoque la chaîne Server Actions `createReview → uploadReviewVisual → runReviewCheck`. Outil structurellement aligné avec la TF Éditorial Magazine (Albane R.) et Archives & Mémoire (Élise M.).

---

## Axe 1 — Hiroshi (UI)

### Observations
1. `app/(outils)/outils/reviews/page.tsx:27` — `background: var(--color-background)` ✅.
2. `app/(outils)/outils/reviews/page.tsx:29-33` — 5 halos statiques. ✅
3. `app/(outils)/outils/reviews/page.tsx:46-48` — PageHeader avec subtitle "Fact-check texte et crédits visuel avant publication" et breadcrumb 3 niveaux.
4. `components/reviews/ReviewsHistory.tsx:80` — bouton `.btn-primary` "Vérifier un post". OK.
5. `components/reviews/ReviewsHistory.tsx:120-138` — row : `glass-thin` quand sélectionnée, padding 12×14, border-radius 10, transition background-color 200 ms. Cohérent avec LibraryView.
6. `components/reviews/ReviewsHistory.tsx:170-175` — `@media (prefers-reduced-motion: reduce)`. ✅
7. `components/reviews/ReviewsHistory.tsx:184-197` — empty state preview : `glass-thin` velvet, texte sobre. Pattern unifié.
8. `components/reviews/ReviewPreview.tsx:70-82` — état PENDING : "Reviews est en train de vérifier ce post…" dans `glass-thin`. Sobre.
9. `components/reviews/ReviewPreview.tsx:84-94` — article principal : `glass-thin` + flex column gap 24. OK.
10. `components/reviews/ReviewPreview.tsx:115-119` — fact-check items : `padding 12px 14px`, `border-radius 12`, `background rgba(0, 0, 0, 0.02)` (hardcoded, pas de token `--color-fill-tertiary`).
11. `components/reviews/ReviewPreview.tsx:188-200` — ready-to-paste : `padding 12px 14px`, `border-radius 12`, `background rgba(0, 0, 0, 0.04)` (hardcoded).
12. `components/reviews/ReviewPreview.tsx:199-211` — `<code>` avec `font-family var(--font-mono, ui-monospace, monospace)`, `font-size 13`, `word-break break-word`. Lisible.
13. `components/reviews/ReviewPreview.tsx:213-216` — bouton "Copier" / "Copié" : `.btn-choice btn-choice-sm`. Classes tokens globales.
14. `components/reviews/ReviewSheet.tsx:138-145` — modal centré, padding 24, pas de glassmorphism sur le wrapper externe (juste backdrop transparent).
15. `components/reviews/ReviewSheet.tsx:153` — backdrop `background: rgba(0, 0, 0, 0.18)`. Cohérent avec LibraryUploadSheet.
16. `components/reviews/ReviewSheet.tsx:170` — sheet `background: rgba(251, 250, 247, 0.96)` crème CF ✅.
17. `components/reviews/ReviewSheet.tsx:171` — `boxShadow: '0 24px 60px rgba(0, 0, 0, 0.12)'`. Élevation contrôlée.
18. `components/reviews/ReviewSheet.tsx:226` — `className="segmented-control"` pour le mode visuel. Token global. ✅
19. `components/reviews/ReviewSheet.tsx:280` — couleur erreur `#C0392B` hardcodée (idem drift palette que Bibliothèque, pas de token `--color-systemRed`).
20. `components/reviews/ReviewSheet.tsx:245-260` — input file natif non stylé (idem défaut LibraryUploadSheet).
21. `components/reviews/ReviewSheet.tsx:296-313` — bouton "Annuler" : `padding 10px 18px`. Touch target ~38 px. **< 44 px.**
22. `components/reviews/ReviewSheet.tsx:335-345` — `inputStyle` : `padding 10px 12px`, `border-radius 10`, `background rgba(255, 255, 255, 0.6)`, font tokens. ✅
23. `components/reviews/ReviewPreview.tsx:255-264` — badge `#34C759` (vert SF "sourçable") visible dans le mockup catalogue (ToolMockup ligne 257). Palette SF stricte.
24. Aucune trace de `#1F4937`. ✅
25. Aucune animation hors transitions 200 ms.

### Verdict : **Recalé partiel**

### Justification
La structure Liquid Glass, les halos, la segmented-control, la palette SF (vert sourçable, badges status) sont conformes. Trois fautes répétées (cf. Bibliothèque) : (1) couleur erreur `#C0392B` non tokenisée, (2) input file natif non stylé, (3) bouton "Annuler" sous 44 px. Plus le pattern hardcodé `rgba(0,0,0,0.02|0.04)` au lieu de tokens fill.

### Recommandations
- **P0** : Augmenter padding du bouton "Annuler" pour atteindre 44 px (`ReviewSheet.tsx:298-313`).
- **P1** : Remplacer `#C0392B` par `#FF3B30` ou `var(--color-systemRed)` (`ReviewSheet.tsx:280`).
- **P1** : Custom file input avec label/input hidden (`ReviewSheet.tsx:245-251`).
- **P2** : Remplacer `rgba(0, 0, 0, 0.02|0.04)` hardcodés par tokens `var(--color-fill-tertiary|quaternary)`.
- **P2** : Documenter `.btn-choice.btn-choice-sm` global pour le bouton Copier.

---

## Axe 2 — Elena (Architecture)

### Observations
1. `app/(outils)/outils/reviews/page.tsx:13` — `export const dynamic = 'force-dynamic'` ✅ (auth + data user-specific).
2. `app/(outils)/outils/reviews/page.tsx:16-20` — auth check + redirect /login. ✅
3. `app/(outils)/outils/reviews/page.tsx:22` — `listReviews(supabase)` côté Server. Bonne séparation.
4. `components/reviews/ReviewsHistory.tsx:6` — `'use client'` justifié (useState, useMemo).
5. `components/reviews/ReviewSheet.tsx:13` — `'use client'` justifié.
6. `components/reviews/ReviewPreview.tsx:8` — `'use client'` justifié (clipboard + state copied).
7. `components/reviews/ReviewSheet.tsx:17-19` — 3 Server Actions importées explicitement. Pattern propre.
8. `components/reviews/ReviewSheet.tsx:62-128` — `handleSubmit` orchestré : upload → create → run check → refresh + onCreated. Workflow séquentiel correct, gestion d'erreur à chaque étape.
9. `components/reviews/ReviewSheet.tsx:73` — `uploadReviewVisual(fd)` → si `!up.ok` early return + setError. Bonne pratique.
10. `components/reviews/ReviewSheet.tsx:99` — `runReviewCheck({ reviewId })` peut être long (5-30s selon Anthropic commenté). Aucun feedback de progression à part le bouton "Vérification…" disabled. UX dégradée si l'IA prend 30s sans signal de vie.
11. `components/reviews/ReviewPreview.tsx:48-54` — cast type `as FactCheckItem[]` et `as VisualCredit` depuis un payload générique. Type unsafe mais documenté par le check `Array.isArray` et `typeof === 'object'`. Acceptable mais pourrait utiliser un parser zod pour robustesse.
12. `components/reviews/ReviewPreview.tsx:56-65` — `handleCopy` avec try/catch silencieux. OK.
13. `components/reviews/ReviewSheet.tsx:107` — `router.refresh()` après succès. ✅
14. `components/reviews/ReviewsHistory.tsx:56-58` — `selectedId` initialisé à `reviews[0]?.id`. Même bug que Library : si une review est archivée/supprimée, `selectedId` peut pointer vers un item invisible. Pas critique car la liste reviews n'a pas de filtre.
15. `components/reviews/ReviewsHistory.tsx:61-64` — `useMemo` pour `selected`. ✅
16. `lib/reviews/queries.ts` (non lu intégralement) — à vérifier RLS `tenant_id`, type-safety du payload.
17. Aucun hook React dans le Server. ✅
18. `components/reviews/ReviewSheet.tsx:38` — `fileInputRef` `useRef<HTMLInputElement | null>(null)`. Typage correct.
19. `components/reviews/ReviewSheet.tsx:46-54` — `reset()` réinitialise tout l'état + clear file input ref. Bonne hygiène.
20. `components/reviews/ReviewSheet.tsx:39` — `accept="image/png,image/jpeg,image/jpg,image/webp"` — mime types explicites. Pas de PDF (logique : on vérifie un visuel, pas un doc).
21. Aucune validation taille côté client. Round-trip Server Action si > 10 MB. Idem défaut Bibliothèque.

### Verdict : **Recalé partiel**

### Justification
Architecture solide : Server/Client correctement séparé, Server Actions chaînées avec gestion d'erreur à chaque step, type-safety préservée. Faute principale : pas de feedback temps réel pendant le `runReviewCheck` (5-30s d'attente avec un bouton disabled). Faute secondaire : type-cast `as FactCheckItem[]` sans validation runtime (zod recommandé).

### Recommandations
- **P0** : Ajouter un feedback temps réel pendant `runReviewCheck` — soit un toast "Reviews vérifie ton post…", soit un progress steps ("Upload OK → Création OK → Vérification en cours…"), soit un streaming SSE.
- **P1** : Wrapper le cast `as FactCheckItem[]` (`ReviewPreview.tsx:49`) avec un schéma zod pour parser-valider le payload runtime.
- **P1** : Validation taille fichier côté client avant upload (idem défaut Bibliothèque).
- **P2** : Documenter le contrat des Server Actions (input/output types) dans un fichier de specs.

---

## Axe 3 — Sarah (Copy)

### Observations
1. `app/(outils)/outils/reviews/page.tsx:46` — titre "Reviews" : anglicisme mais nom propre du produit. Acceptable. À documenter.
2. `app/(outils)/outils/reviews/page.tsx:47` — subtitle "Fact-check texte et crédits visuel avant publication". Direct, descriptif. Note : "crédits visuel" devrait être "crédits visuels" (accord pluriel).
3. `components/reviews/ReviewsHistory.tsx:81` — bouton "Vérifier un post" ✅ tutoiement implicite.
4. `components/reviews/ReviewsHistory.tsx:99` — empty state : "Aucune review pour l'instant. Démarre avec le bouton « Vérifier un post »." Tutoiement direct ✅.
5. `components/reviews/ReviewsHistory.tsx:30-40` — `stateLabel` : "en cours" / "vérifié" / "archivé". Sobre.
6. `components/reviews/ReviewsHistory.tsx:148` — fallback titre : `r.title ?? 'Review sans titre'`. Anglicisme dans le fallback.
7. `components/reviews/ReviewsHistory.tsx:194-195` — empty preview : "Sélectionne une review ou démarre-en une nouvelle avec le bouton « Vérifier un post »." Tutoiement ✅. Mot "review" anglicisme.
8. `components/reviews/ReviewPreview.tsx:79` — état PENDING : "Reviews est en train de vérifier ce post…" Personnification de l'outil (Reviews = sujet) cohérente avec la doctrine "le conseiller te répond". Note : le mot "Reviews" sujet de phrase est étrange en français — on dirait plutôt "Reviews vérifie ce post…" (présent au lieu de "est en train de").
9. `components/reviews/ReviewPreview.tsx:106` — `review.title ?? 'Review sans titre'` ✅.
10. `components/reviews/ReviewPreview.tsx:111` — "Fact-check texte" : anglicisme accepté en doctrine éditoriale.
11. `components/reviews/ReviewPreview.tsx:113` — "Pas d'affirmation à vérifier dans ce post." Voix Floriane ✅.
12. `components/reviews/ReviewPreview.tsx:128-130` — `statusLabel` : "sourçable" / "à vérifier" / "non sourçable". Minuscule conforme Floriane ✅.
13. `components/reviews/ReviewPreview.tsx:151-153` — "Source : {item.suggested_source}" : préfixe label clair.
14. `components/reviews/ReviewPreview.tsx:162` — "Crédit visuel" ✅.
15. `components/reviews/ReviewPreview.tsx:165-177` — dl/dt/dd : "Auteur", "Archive", "Année", "Licence", "Alternative". Vocabulaire archive/éditorial ✅.
16. `components/reviews/ReviewPreview.tsx:181` — "Pas de visuel à créditer." Sobre ✅.
17. `components/reviews/ReviewPreview.tsx:187` — "Crédit prêt à coller" ✅.
18. `components/reviews/ReviewPreview.tsx:216` — "Copié" / "Copier" ✅.
19. `components/reviews/ReviewSheet.tsx:187` — "Vérifier un post" titre sheet ✅.
20. `components/reviews/ReviewSheet.tsx:196-198` — "Reviews fact-check ton texte et identifie les crédits du visuel." Tutoiement ✅ + personnification "Reviews" sujet.
21. `components/reviews/ReviewSheet.tsx:202` — "Titre (optionnel)" ✅.
22. `components/reviews/ReviewSheet.tsx:207` — "Auto-rempli depuis le texte du post" : impersonnel. Préférer "Si tu n'en mets pas, on prend le début du texte."
23. `components/reviews/ReviewSheet.tsx:214` — "Texte du post" ✅.
24. `components/reviews/ReviewSheet.tsx:219` — "Colle ici le texte que tu prépares à publier." Tutoiement ✅.
25. `components/reviews/ReviewSheet.tsx:225` — "Visuel" ✅.
26. `components/reviews/ReviewSheet.tsx:232,239` — "Uploader" / "URL". "Uploader" est un anglicisme adopté. Acceptable.
27. `components/reviews/ReviewSheet.tsx:270` — "PNG / JPG / JPEG / WEBP. 10 MB maximum." Technique mais nécessaire.
28. `components/reviews/ReviewSheet.tsx:312` — "Annuler" ✅.
29. `components/reviews/ReviewSheet.tsx:320` — "Vérification…" / "Vérifier" ✅.
30. Vocabulaire interdit : aucune occurrence de "users", "audience", "dashboard", "workflow", "viral", "boost", "engagement", "métrique", "KPI", "stats", "analytics", "performance" dans `components/reviews/*`.
31. `app/(outils)/outils/reviews/page.tsx:47` — breadcrumb `{ label: 'Outils', href: '/outils' }`. **Pas de possessif "Mes Outils"**. Incohérence nav (même défaut que Bibliothèque).

### Verdict : **Recalé partiel**

### Justification
Voix Floriane bien tenue, personnification "Reviews" cohérente avec le pattern "Conseiller". Fautes : (1) breadcrumb sans "Mes Outils", (2) "Auto-rempli" impersonnel, (3) "crédits visuel" accord pluriel, (4) "Review sans titre" anglicisme dans le fallback, (5) "est en train de vérifier" → "vérifie" plus naturel.

### Recommandations
- **P0** : Remplacer `{ label: 'Outils' }` par `{ label: 'Mes Outils' }` dans `app/(outils)/outils/reviews/page.tsx:47`.
- **P1** : Corriger "crédits visuel" → "crédits visuels" dans `app/(outils)/outils/reviews/page.tsx:47`.
- **P1** : Remplacer "Auto-rempli depuis le texte du post" par "Si tu n'en mets pas, on prend le début du texte" (`ReviewSheet.tsx:207`).
- **P2** : "Review sans titre" → "Vérification sans titre" (fallback francisé) dans `ReviewsHistory.tsx:148` et `ReviewPreview.tsx:106`.
- **P2** : "Reviews est en train de vérifier ce post…" → "Reviews vérifie ce post…" (`ReviewPreview.tsx:79`).

---

## Axe 4 — Marcus (Workflow)

### Observations
1. `components/reviews/ReviewsHistory.tsx:89-100` — empty state liste : message sobre + pointe le bouton "Vérifier un post". ✅
2. `components/reviews/ReviewsHistory.tsx:115-167` — row reviews avec status badge + date relative. Lisible.
3. `components/reviews/ReviewSheet.tsx:40-44` — `canSubmit` : si pas pending ET (postText OU url OU file). Bonne logique de validation côté client minimum.
4. `components/reviews/ReviewSheet.tsx:319` — bouton submit disabled si `!canSubmit`. Loading text "Vérification…". ✅
5. `components/reviews/ReviewSheet.tsx:67-115` — orchestration upload → create → check avec setError à chaque étape. UX feedback à chaque step.
6. `components/reviews/ReviewSheet.tsx:111` — message d'erreur catch global avec message fallback "Erreur inconnue". OK.
7. `components/reviews/ReviewSheet.tsx:274-286` — affichage erreur dans la sheet, `role="alert"` ✅.
8. `components/reviews/ReviewSheet.tsx:56-60` — `handleClose` désactivé si pending. ✅
9. `components/reviews/ReviewSheet.tsx:148-155` — backdrop cliquable pour close. Pattern modal Apple.
10. `components/reviews/ReviewPreview.tsx:67-82` — état PENDING géré (preview montre "Reviews est en train de vérifier…"). Bon feedback temps réel COURT TERME.
11. **PROBLÈME MAJEUR** : pendant le `runReviewCheck` (5-30s), l'utilisateur voit le bouton "Vérification…" disabled mais aucun signal de progression. Sur 30 secondes c'est anxiogène. Pas de timeout, pas de fallback si l'IA crash.
12. `components/reviews/ReviewPreview.tsx:56-65` — clipboard copy avec feedback "Copié" 1.8s. ✅
13. Touch target bouton "Annuler" ~38 px (cf. Hiroshi observation 21). **< 44 px.**
14. Touch target row review : ~58 px ✅.
15. Aucune confirmation destructrice (V1 = création + lecture seule, pas de suppression visible).
16. Aucune pagination sur les reviews. À surveiller > 50.
17. `components/reviews/ReviewSheet.tsx:249` — bouton file natif idem défaut Bibliothèque.
18. Navigation prévisible : breadcrumb 3 niveaux + retour `/outils`.
19. `components/reviews/ReviewSheet.tsx:108-110` — après succès : refresh + onCreated callback + reset + onClose. Bonne séquence.

### Verdict : **Recalé partiel**

### Justification
La sheet de création est très bien orchestrée (validation, états, erreurs, cleanup). Le point dur est le silence pendant `runReviewCheck` : 5-30s sans feedback de progression dans une UI Apple velvet, c'est inacceptable. Le bouton "Annuler" sous 44 px se répète sur toutes les sheets.

### Recommandations
- **P0** : Feedback temps réel pendant `runReviewCheck` — toast persistant ou état de progression dans la sheet ("Texte vérifié → Crédit visuel en cours…"). Sinon afficher au moins un spinner Apple animé (statique sinon — halos statiques only, donc tooltip texte).
- **P0** : Augmenter padding bouton "Annuler" à 44 px (`ReviewSheet.tsx:298-313`).
- **P1** : Custom file input (idem défaut Bibliothèque).
- **P1** : Validation taille fichier côté client.
- **P2** : Pagination si > 50 reviews (différable).

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. **Reviews incarne deux skills sœurs** :
   - `cfs-editorial-magazine-task-force` (Albane R., Olivia C.) — fact-check rigoureux, croisement de sources, autorité éditoriale.
   - `cfs-archives-memoire-skill` (Élise M.) — refus absolu de l'invention, "si l'archive ne dit rien, Élise dit rien".
2. `components/reviews/ReviewPreview.tsx:128-145` — 3 status `sourçable / à vérifier / non sourçable` = grammaire Albane R. ✅
3. `components/reviews/ReviewPreview.tsx:151-153` — "Source : {item.suggested_source}" : sourcing explicite ✅.
4. `components/reviews/ReviewPreview.tsx:165-177` — Auteur / Archive / Année / Licence / Alternative : champ "Alternative" = doctrine "si non sourçable, propose une alternative". Albane + Élise.
5. `components/reviews/ReviewPreview.tsx:185-220` — "Crédit prêt à coller" = doctrine éditoriale : on ne publie pas un visuel sans crédit propre.
6. **Phase 1 / Phase 2** : Reviews est transverse Phase 1 et Phase 2 — chaque post (anecdote ou programme) doit être fact-checked avant publication. Cohérent.
7. **Trilogie Organique/Outreach/Libre** : Reviews opère en amont de toutes les publications. Cohérent.
8. **Citation anchor "tableau de bord simple et efficace, contrôle, pilote"** — Reviews est précisément un outil de contrôle ("avant de publier, je vérifie"). Doctrine incarnée. ✅
9. **Tranquillité narrative** : aucun nudge, aucune sollicitation, aucune notification. ✅
10. **Anti-gamification** : aucun mécanisme de "tu as vérifié 10 posts !" ✅
11. **6 promesses CF** : "Tu publies seulement ce qui est vrai et bien crédité." Promesse tenue par Reviews.
12. Aucune trace de `#1F4937`. ✅
13. **Doctrine "ne JAMAIS répondre à chaud"** (crise) : Reviews force le ralentissement avant publication. Cohérent.
14. `components/reviews/ReviewSheet.tsx:197` — "Reviews fact-check ton texte et identifie les crédits du visuel." : posture éditoriale claire.
15. `components/reviews/ReviewPreview.tsx:113` — "Pas d'affirmation à vérifier dans ce post." : Élise refuse d'inventer. ✅
16. **Cohérence doctrine** : Reviews est l'incarnation produit la plus stricte des skills éditoriales. C'est probablement l'outil le plus doctrinalement aligné de toute l'app après Conseiller.
17. **Lien avec Archives & Mémoire** : Reviews pourrait/devrait croiser le payload `library_documents` du tenant pour proposer des sources locales avant de chercher en open web. Non implémenté à date (le Server Action `run-review-check.ts` est hors scope ici).

### Verdict : **Validé**

### Justification
Reviews est doctrinalement impeccable. Grammaire éditoriale Albane R. (sourçable/à vérifier/non sourçable), champs Auteur/Archive/Année/Licence/Alternative, refus de l'invention (Élise M.), tranquillité narrative, citation anchor "contrôle, pilote" incarnée. Aucune gamification, aucune trace de forest green. C'est la doctrine en code.

### Recommandations
- **P1** : Croiser le payload `library_documents` du tenant dans `run-review-check.ts` avant de chercher en open web — incarner la doctrine "mémoire totale de la marque" (Élise M.) dans le pipeline fact-check.
- **P2** : Documenter dans un commentaire d'en-tête que Reviews est l'incarnation produit conjointe des skills `cfs-editorial-magazine-task-force` + `cfs-archives-memoire-skill`.
- **P2** : Lier visuellement la review d'un post au post dans la Bibliothèque (cross-référencement).

---

## Synthèse de la page

### Verdicts cumulés
| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé partiel |
| Elena Archi | ❌ Recalé partiel |
| Sarah Copy | ❌ Recalé partiel |
| Marcus Workflow | ❌ Recalé partiel |
| Hélène Doctrine | ✅ Validé |

### Top fixes priorisés

- **P0** :
  1. Feedback temps réel pendant `runReviewCheck` 5-30s — sortir du silence anxiogène (`ReviewSheet.tsx:99`).
  2. Augmenter padding bouton "Annuler" à 44 px (`ReviewSheet.tsx:298-313`).
  3. Remplacer `{ label: 'Outils' }` par `{ label: 'Mes Outils' }` dans breadcrumb (`page.tsx:47`).

- **P1** :
  1. Remplacer `#C0392B` par `#FF3B30` ou `var(--color-systemRed)` (`ReviewSheet.tsx:280`).
  2. Custom file input (label/input hidden + drop zone) (`ReviewSheet.tsx:245-251`).
  3. Validation taille fichier côté client avant upload.
  4. Wrapper le cast `as FactCheckItem[]` avec un parser zod (`ReviewPreview.tsx:49`).
  5. Corriger "crédits visuel" → "crédits visuels" (`page.tsx:47`).
  6. Tutoiement "Si tu n'en mets pas, on prend le début du texte" (`ReviewSheet.tsx:207`).
  7. Croiser `library_documents` dans `run-review-check.ts` pour incarner la skill Archives & Mémoire.

- **P2** :
  1. Tokens `var(--color-fill-*)` pour les `rgba(0, 0, 0, 0.02|0.04)` hardcodés.
  2. "Review sans titre" → "Vérification sans titre".
  3. "Reviews est en train de vérifier ce post…" → "Reviews vérifie ce post…".
  4. Documenter contrats Server Actions.
  5. Pagination si > 50 reviews.
  6. Cross-référencement review ↔ post dans Bibliothèque.

### Verdict global page
**Recalé partiel** — La doctrine est impeccable, l'architecture est solide. Le silence 5-30s de `runReviewCheck` est le seul bug UX bloquant. Les autres fautes sont les défauts répétés des sheets (file input natif, bouton Annuler sous 44 px, couleur erreur hardcodée). À corriger en bloc sur toutes les sheets du repo.
