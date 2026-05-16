# Workflow : C — Création post (hub → format → preview → save)

## Métadonnées

- **Pages impliquées** :
  - `app/(outils)/outils/page.tsx` (page hôte `Mes Outils` — server component avec halos)
  - `components/outils/OutilsCatalog.tsx` (catalogue 2 colonnes — sidebar 36% / preview 64%)
  - `components/outils/previews/PostCreatorHubPreview.tsx` (preview du hub Post Creator quand cet outil est sélectionné)
  - `components/outils/post-creator/FormatCardApple.tsx` (cartes format individuelles)
  - `app/(outils)/outils/post-creator/page.tsx` → **redirect 308** vers `/outils` (Sprint 37.I F78 — route supprimée)
  - `app/(outils)/outils/post-creator/[format]/page.tsx` (placeholder roadmap par format, 4 formats supportés sur 6 doctrinaux)
  - `app/(programme)/programme/post/[postId]/page.tsx` (édition d'un post existant — workflow D Sprint 37.E F58)
  - `components/programme/PostEditor.tsx` (éditeur inline pour post existant)
  - `components/outils/mockups/InstagramIOSMockup.tsx` (preview iOS pixel-près Sprint 37.L F86.3 — non utilisé dans le workflow création V1)
- **Server actions / endpoints** :
  - `app/_actions/update-post.ts` → `updatePostFields(input)` (édition d'un post existant, pas création)
  - `app/api/ai/post-generation/route.ts` (probable, référencé dans `AnecdoteLive.tsx:56` — composant marqué "SUPPRESSION CANDIDATE")
  - **Aucune server action `createPost`** identifiable dans `app/_actions/` — la création passe par la génération de programme initial (`generateProgrammeInitial` Sprint 36) ou par les API `/api/programme/etendre` et `/api/programme/generer`.
- **Tables Supabase touchées** : `posts` (insert via génération programme, update via `update-post`), `pillars` (FK `pilier_id` créée migration 026 mais **non utilisée** par les server actions), `brands` (lecture contexte).
- **Modèles Anthropic appelés** : la cascade post-generation passe par `/api/ai/post-generation` (composant legacy `AnecdoteLive.tsx`). En V1 actuelle (Sprint 37.H), les routes `/outils/post-creator/[format]` sont des **placeholders roadmap sans interaction LLM** (cf. ligne 7 du fichier).
- **Screenshots** : à produire côté Lead (storyboard recommandé : 1. `/outils` avec sidebar gauche + Post Creator sélectionné, 2. preview hub avec 4 format cards "Supportés" + 2 "À venir", 3. click "Anecdote" → roadmap placeholder, 4. roadmap avec 6 étapes "Bientôt", 5. CTA "Discuter avec le conseiller →" fallback, 6. édition post existant via `/programme/post/[postId]` avec mockup IG à côté).

---

## Storyboard narratif

### Étape 0 — Entrée `/outils`

`app/(outils)/outils/page.tsx:11-70` — server component, vérifie auth (sinon redirect `/login`) + brand complete (sinon redirect `/onboarding/analyse-marque`). Rend `<PageHeader title="Mes Outils" />` + 5 halos + `<OutilsCatalog />`.

`OutilsCatalog.tsx:254-617` — 2 colonnes : sidebar gauche groupée par sections (Piloter, Créer, À venir), preview droite avec mockup + CTA. Sélection par défaut : **Conseiller** (`OutilsCatalog.tsx:256`). Le pilote DOIT cliquer sur "Post Creator" dans la section "Créer" pour voir la preview du hub.

### Étape 1 — Click "Post Creator" dans sidebar

L'item `post-creator` dans `CREER` (`OutilsCatalog.tsx:146-156`) avec `href: '/outils/post-creator'`, `ctaLabel: 'Créer un post'`. Au click, `setSelectedId('post-creator')` met à jour la preview de droite avec `<PostCreatorHubPreview />`.

### Étape 2 — Preview hub Post Creator

`PostCreatorHubPreview.tsx:10-99` rend (a) un titre H2 "Post Creator", (b) une description "Rédige et programme tes publications Instagram. Chaque post part d'un de tes piliers narratifs et garde la voix de ta marque.", (c) section "Supportés" avec 4 cards (Anecdote / Produit / Événement / Manifeste) cliquables, (d) section "À venir" avec 2 cards disabled (Question / Coulisses).

**Doctrine 6 formats canoniques NON tenue en V1** : seulement 4 formats accessibles, 2 affichés "À venir".

### Étape 3 — Click sur une card format (ex. Anecdote)

Navigation client `Link` vers `/outils/post-creator/anecdote`. Ne passe PAS par le `href: '/outils/post-creator'` du `CREER[0]` — le hub n'est pas accessible directement, c'est la preview qui contient les liens.

À noter : `app/(outils)/outils/post-creator/page.tsx` (la route hub) est un **redirect 308** vers `/outils` (Sprint 37.I F78 — `redirect('/outils')`). Donc si l'utilisateur bookmark `/outils/post-creator`, il est ramené sur le catalogue. Bon réflexe SEO/UX mais ça veut dire que `OutilsCatalog.tsx:152` pointe vers une URL qui redirect — l'item sidebar "Créer un post" CTA aboutit à `/outils` puis re-render. Boucle si pas attention.

### Étape 4 — Roadmap placeholder format

`app/(outils)/outils/post-creator/[format]/page.tsx:35-253` :

1. Auth check (`redirect('/login')`)
2. Valide le slug format (anecdote / produit / evenement / manifeste — sinon `notFound()`)
3. Lit le `ROADMAPS[format]` depuis `lib/post-creator/roadmaps.ts` (non lu mais structure visible : steps avec id, label, description)
4. Rend `<PageHeader title={label} />` + breadcrumb 3 niveaux (`Mes Outils › Post Creator › {label}`) + header + une `<ol>` des 6 étapes avec badge "Bientôt" sur chacune + footer glass-thin "L'expérience interactive complète arrive Sprint 38+. En attendant, tu peux discuter de tes idées de post {label.toLowerCase()} avec le conseiller." + CTA `Discuter avec le conseiller →` qui ouvre `/outils/conseiller?context=post_creator&format={format}`.

**Aucune création de post n'a lieu sur cette page.** La création réelle, c'est seulement via la génération de programme initial (Sprint 36) ou via des sessions conseiller (`run-conseiller-turn`). Le post creator V1 est un placeholder visuel.

### Étape 5 — Édition d'un post existant (workflow alternatif)

Une fois un post généré, le pilote l'édite via `/programme/post/[postId]`. Cf. `app/(programme)/programme/post/[postId]/page.tsx:11-50` qui rend `<RetombeesEditor>` (Sprint 37 Lot 7 — visible UNIQUEMENT pour les posts `statut = 'publie'`). Le composant `<PostEditor>` (`components/programme/PostEditor.tsx`) permet d'éditer pilier_nom, date, objectif éditorial, angle, caption — appelle `updatePostFields` (`app/_actions/update-post.ts:20-49`).

**Pas de preview `<InstagramIOSMockup>` à côté de l'édition** dans `/programme/post/[postId]`. Le mockup iOS existe (`components/outils/mockups/InstagramIOSMockup.tsx`, 643 lignes, Sprint 37.L F86.3) mais n'est utilisé que dans `ToolMockup.tsx:101` (preview catalogue `/outils`). Le pilote qui édite un post réel n'a pas de preview WYSIWYG.

### Étape 6 — Retour `/programme` ou save

Save via `updatePostFields` → `revalidatePath` non explicit dans `update-post.ts`. L'utilisateur reste sur la page d'édition. Aucune redirection vers `/programme` après save. Pas de toast "enregistré". Le bouton "Enregistrer" change probablement de label (à vérifier dans `PostEditor.tsx`) mais le pilote ne sait pas explicitement que c'est parti.

---

## Axe 1 — Hiroshi (UI)

### Observations

1. **Hub Post Creator dans la preview** (`PostCreatorHubPreview.tsx:11-21`) : `glass-regular` avec `background: rgba(251, 250, 247, 0.7)` (crème v60). Cohérent. Border-radius 20, padding 32/36. Cohérent.
2. `FormatCardApple` (lue partiellement : `FormatCardApple.tsx:1-50`) utilise `FORMAT_COLORS` centralisés (`lib/i18n/formats.ts:61-68`) — `#007AFF` anecdote, `#34C759` produit, `#FF9500` evenement, `#5856D6` question, `#AF52DE` coulisses, `#FF3B30` manifeste. Couleurs Apple SF — cohérent avec palette v60.
3. **Placeholder roadmap** (`[format]/page.tsx:133-216`) : 6 cards "ol" avec opacity 0.75 et badge "Bientôt". UI cohérente mais conceptuellement c'est **du dead weight** — un pilote qui découvre le post-creator voit 6 étapes "Bientôt" et un CTA fallback. Anti-pattern UX "promise that fails".
4. **Pas de halos** sur `/outils/post-creator/[format]/page.tsx`. Le shell `app/(outils)/layout.tsx` à inspecter — probablement pas non plus de halos sur les sous-routes. Comparé à `/outils` (5 halos), `/ma-marque` (6 halos), c'est un trou de densité.
5. **Breadcrumb 3 niveaux** (`[format]/page.tsx:62-88`) : "Mes Outils › Post Creator › {label}". MAIS `Mes Outils` link → `/outils` (OK) et `Post Creator` link → `/outils/post-creator` qui **redirige vers `/outils`** (308). Donc le breadcrumb a un segment qui pointe vers un redirect. Cassé.
6. `[format]/page.tsx:142-150` cards de roadmap : `background: rgba(255, 255, 255, 0.5)`, border `rgba(0, 0, 0, 0.05)`. Pas glass blur, pas signature CF. Plates.
7. **Pas de preview `<InstagramIOSMockup>` côté création** — le mockup existe (643 LOC) mais n'est branché qu'à la preview catalogue. Le pilote qui crée/édite un post n'a aucune représentation visuelle de ce que ça donnera sur Instagram. Décrochage fonctionnel majeur vs la promesse "tu vois le post comme sur IG".
8. **Mockup hub** : `PostCreatorHubPreview` ne montre PAS d'instance de `<InstagramIOSMockup>`. C'est uniquement les cartes format en vue catalogue + un title/description marketing. Donc la doctrine "preview mockup sticky côté édition" du brief n'est pas implémentée en V1.
9. **2 formats "À venir"** sur 6 doctrinaux (Question, Coulisses). Visible dans `PostCreatorHubPreview.tsx:82-98`. Doctrine "6 formats canoniques non négociables" non tenue.
10. **Sidebar `/outils`** : 9 items au total (Conseiller, Bibliothèque, Post Creator, Moodboard, Variations, Reviews, Messages, Emailing, Reels, Films, Ads). 5 sur 11 sont "À venir". Plus de la moitié des items sont des promesses. Densité d'aspiration > densité de fonction. Risque crédibilité.

### Verdict : **Recalé**

### Justification

Le post creator V1 est à 80% un placeholder visuel : 4 routes format = 4 pages "Bientôt". Le mockup IG pixel-près existe (643 LOC investis Sprint 37.L) mais n'est branché nulle part dans la création de post. Le breadcrumb pointe vers un redirect. La doctrine "6 formats canoniques" n'est pas tenue (Question/Coulisses "À venir"). Le pilote voit un catalogue à demi-vide d'outils opérationnels.

### Recommandations

- **P0** : Brancher `<InstagramIOSMockup>` sur la page d'édition `/programme/post/[postId]` (PostEditor) ou sur les futures pages création format. C'est l'asset fait Sprint 37.L qui n'est utilisé nulle part.
- **P0** : Corriger le breadcrumb "Post Creator" — soit faire pointer le hub directement vers `/outils?tool=post-creator`, soit retirer le segment cliquable.
- **P0** : Décider Sprint 38 si on garde les 4 placeholder pages format ou si on les supprime jusqu'à ce qu'on ait du fonctionnel. Une roadmap visible publique sans action est anti-doctrine "le pilote pilote".
- **P1** : Ajouter les halos statiques v60 sur `/outils/post-creator/[format]`.
- **P1** : Promouvoir Question + Coulisses en formats supportés ou retirer la promesse "6 formats canoniques" de la doctrine.
- **P2** : Réduire les items "À venir" de la sidebar `/outils` (Messages, Emailing, Reels, Films, Ads) ou les regrouper en une seule section "Roadmap" non sélectionnable.

---

## Axe 2 — Elena (Archi)

### Observations

1. **Pas de server action `createPost`** identifiable. La création passe par (a) `generateProgrammeInitial` (Sprint 36, génération batch à l'onboarding), (b) `/api/programme/etendre` et `/api/programme/generer` (extensions de programme). Le post creator V1 n'a pas son propre pipeline d'écriture.
2. `updatePostFields` (`app/_actions/update-post.ts:20-49`) accepte `pilier_nom` (TEXT legacy) mais **PAS `pilier_id`**. Migration 026 a créé la FK `posts.pilier_id` mais aucun code ne l'utilise pour les updates. Promesse Sprint 37.K F89 "branchement Sprint 38+" non honorée.
3. **Faille multi-tenant** sur `updatePostFields:45-46` : `admin.from('posts').update(updates).eq('id', input.postId)` — pas de filtre `tenant_id`. Un user qui devine un postId de tenant voisin peut le modifier. Identique à `pillars.ts` (cf. workflow B).
4. `update-post.ts` n'invalide pas le cache : pas de `revalidatePath('/programme')`. Le pilote retourne sur `/programme` et voit son post non modifié tant que la page n'est pas redemandée hard.
5. `app/(outils)/outils/post-creator/[format]/page.tsx` (placeholder roadmap) ne fait **rien d'autre** qu'auth check + lecture statique `ROADMAPS[format]`. Pas de génération LLM. Pas de table `posts` touchée. Pas de coût compute. C'est cosmétique pur. Sans bénéfice ni dette.
6. **Coexistence `pilier_nom` (TEXT) + `pilier_id` (UUID FK)** dans le schéma `posts` : migration 026 dit explicitement "Sprint 38+ décidera du backfill et retrait après que toute la création de posts soit refondue." Sprint 38, c'est maintenant. Pas de backfill identifiable.
7. **Pas de prompt caching identifiable** pour la création de post — `/api/ai/post-generation` non lue, mais composant client `AnecdoteLive.tsx:1` marqué "SUPPRESSION CANDIDATE Sprint 36" donc l'API derrière est probablement legacy.
8. **Pas de validation server-side** sur les longueurs caption (`update-post.ts:38-40` accepte n'importe quelle string). DB constraints inconnues.
9. La route hub `/outils/post-creator` est un redirect 308 (`page.tsx:10`) — bon réflexe SEO, évite les bookmarks orphelins. Mais le `OutilsCatalog.tsx:152` continue de pointer dessus comme `href`. Le sidebar item a un CTA "Créer un post" → click → /outils/post-creator → 308 → /outils → preview hub recharge. Boucle de 2 sauts intentionnelle mais coûteuse.

### Verdict : **Recalé**

### Justification

Trois P0 archi : (a) `pilier_id` créé en migration 026 mais jamais branché côté code — promesse Sprint 37.K F89 explicitement violée, (b) faille multi-tenant sur `updatePostFields` (admin update par id seul), (c) pas de revalidation cache après update post. Le workflow C est largement en mode "promise" en V1.

### Recommandations

- **P0** : Brancher `pilier_id` dans `updatePostFields` (accept UUID) ET dans `PostEditor`. Ajouter aussi un input qui résout la FK depuis la liste des piliers actifs (au lieu d'un text input libre `pilier_nom`).
- **P0** : Ajouter `.eq('tenant_id', tenantId)` sur l'update de `posts` (récupérer le tenant via profile en début d'action).
- **P0** : Ajouter `revalidatePath('/programme')` + `revalidatePath('/programme/post/[postId]')` dans `update-post.ts` après save réussi.
- **P0** : Décider Sprint 38 du backfill `pilier_nom → pilier_id` (script de migration data sur `posts` existants). Tant que les deux colonnes coexistent, on a deux sources de vérité.
- **P1** : Implémenter une vraie server action `createPost` (au moins pour les 4 formats supportés) pour sortir du mode placeholder.
- **P2** : Valider les longueurs caption côté server action (Instagram cap à 2200 char).

---

## Axe 3 — Sarah (Copy)

### Observations

1. `OutilsCatalog.tsx:123` — "Ton assistant éditorial disponible en continu." (Conseiller). Tutoiement. Bien.
2. `OutilsCatalog.tsx:151` — "Rédige et programme tes publications Instagram. Chaque post part d'un de tes piliers narratifs et garde la voix de ta marque." (Post Creator). Tutoiement, vocabulaire éditorial Floriane. Bien.
3. `PostCreatorHubPreview.tsx:47-48` — même phrase recyclée. Cohérent.
4. `FORMAT_DESCRIPTIONS` (`lib/i18n/formats.ts:32-57`) — phrases courtes ton Floriane :
   - "Raconter une histoire qui sert un pilier." ✅
   - "Mettre en avant une création avec son histoire." ✅
   - "Annoncer une date qui compte." ✅
   - "Affirmer une position forte." ✅
   - "Faire réagir la communauté." (Question) ⚠️ ton plus engagement-ish
   - "Montrer le geste, l'atelier, la fabrication." (Coulisses) ✅
5. `[format]/page.tsx:128-130` — "Voici les étapes pour créer un post {label.toLowerCase()}. L'expérience interactive complète arrive bientôt." → tutoiement implicite, transparent sur le fait que c'est un placeholder. **OK mais c'est un aveu d'inachevé sur un produit livré**.
6. `[format]/page.tsx:238-241` — "L'expérience interactive complète arrive Sprint 38+. En attendant, tu peux discuter de tes idées de post {label.toLowerCase()} avec le conseiller." → le mot **"Sprint 38+"** est exposé en UI. Doctrine v60 : pas de sprint nommé en UI. Anti-pattern. Le pilote ne devrait jamais voir le nom des sprints.
7. `OutilsCatalog.tsx:241-242` — "Conçois et pilote tes campagnes paid social (Meta Ads). A/B test, ciblage, **audience saving, lookalike**. Sub-prompt TF Ads (Sofia P.) avec garde-fous d'intégrité de marque." → 
   - "audience" mot interdit en UI ✅ violation
   - "TF Ads (Sofia P.)" → exposition de la doctrine interne CFS (Task Force interne) au pilote. Anti-pattern doctrinal majeur.
   - "Sub-prompt" → vocabulaire technique LLM exposé en UI.
8. `OutilsCatalog.tsx:153` — CTA label "Créer un post". Capitalisé. Doctrine v60 préfère minuscules sur les CTA (cf. ConseillerIntro "créer mon plan"). Incohérent.
9. `OutilsCatalog.tsx:127, 137, 154, 165, 176, 187` — `ctaLabel` : "Poser une question", "Voir mes documents", "Créer un post", "Générer un moodboard", "Décliner une image", "Vérifier un post". Tutoiement implicite via verbes. OK.
10. **Vocabulaire interdit observé en UI** (résumé) :
   - "audience" → `OutilsCatalog.tsx:242` (Ads description)
   - "engagement" → `PostCreatorHubPreview.tsx` n/a, mais `FORMAT_DESCRIPTIONS.question` flirte avec ("Faire réagir la communauté" — pas le mot mais l'esprit)
   - "Sprint 38+" → `[format]/page.tsx:239` (exposition interne)
   - "Sub-prompt" + "TF Ads" → `OutilsCatalog.tsx:242`
11. `[format]/page.tsx:118-119` — H2 "Roadmap {label}" — le mot **"Roadmap"** est interdit ? La doctrine ne le cite pas explicitement, mais "roadmap" exposé au pilote = produit en construction visible = anti-doctrine "tranquillité narrative".

### Verdict : **Recalé**

### Justification

Trois violations doctrine copy : (a) "audience" en UI (Ads description), (b) "Sprint 38+" exposé au pilote, (c) "TF Ads (Sofia P.)" / "Sub-prompt" — doctrine interne CFS exposée publiquement. Plus la culture "Roadmap" qui rend explicite l'inachèvement.

### Recommandations

- **P0** : Retirer "TF Ads (Sofia P.)" et "Sub-prompt" de `OutilsCatalog.tsx:242`. Le pilote ne doit pas voir l'organigramme CFS.
- **P0** : Remplacer "audience saving" par "ciblages enregistrés" ou périphrase équivalente.
- **P0** : Retirer "Sprint 38+" de `[format]/page.tsx:239`. Remplacer par "bientôt" ou "prochainement". Jamais de sprint nommé en UI.
- **P1** : Refondre les pages roadmap placeholder — soit les supprimer (cf. recommandation Axe 1), soit les renommer en "Aperçu" ou "Ce qui arrive" (pas "Roadmap").
- **P2** : Reformuler `FORMAT_DESCRIPTIONS.question` — "Inviter ta communauté à répondre." plus Floriane que "Faire réagir".

---

## Axe 4 — Marcus (Workflow)

### Observations

1. **Friction quantifiée du parcours nominal "créer un post"** :
   - 1 click `/outils` dans menu utilisateur (popover)
   - 1 click "Post Creator" dans sidebar (Conseiller sélectionné par défaut)
   - 1 click sur une format card (ex. Anecdote)
   - Arrivée sur **page placeholder** sans aucune action de création possible
   - 1 click "Discuter avec le conseiller →" pour fallback
   - Arrivée sur `/outils/conseiller?context=post_creator&format=anecdote` → c'est là que le travail réel commence
   - **Total avant de pouvoir effectivement créer : 4 clics + arrivée sur outil parallèle (conseiller).**
2. **Le pilote ne peut PAS créer un post en V1 via Post Creator.** C'est un placeholder. La création passe soit par la génération batch (programme initial), soit par le conseiller en mode chat. Le `<Link>` "Créer un post" du sidebar mène à un cul-de-sac fonctionnel.
3. **Dead-end** : si le pilote veut juste ajouter UN post à son programme existant, il doit (a) ouvrir le conseiller, (b) raconter ce qu'il veut, (c) attendre que le conseiller propose, (d) confirmer. Pas de "+ ajouter un post" depuis `/programme`. À vérifier mais cf. composant `NewPostModal.tsx` qui existe — peut-être disponible quelque part. Pas évident.
4. **Boucle redirect** : `/outils/post-creator` (la route hub) → 308 → `/outils`. Si quelqu'un partage un lien `/outils/post-creator/anecdote` mais le pilote clique sur "Post Creator" dans le breadcrumb du placeholder roadmap, il atterrit sur `/outils` qui sélectionne **Conseiller** par défaut (pas Post Creator). Le pilote doit re-cliquer sur Post Creator dans la sidebar.
5. **État de sélection non-persistant** : aucune query param `?tool=post-creator` n'est lue dans `OutilsCatalog.tsx:256`. Le default est hardcodé. Pas de deep-link possible vers un outil spécifique.
6. **Édition post existant** (`/programme/post/[postId]`) : la sauvegarde via `updatePostFields` ne retourne aucun feedback explicite à l'utilisateur (cf. axe Elena : pas de revalidate, pas de toast). Le pilote click "Enregistrer", rien ne se passe visuellement, il se demande si c'est parti.
7. **Pas de "preview live"** : si le pilote modifie la caption, il ne voit pas l'effet sur le rendu IG (le mockup n'est pas branché). Anti-friction signature CF "tu vois le post en train de se faire".
8. **6 étapes "Bientôt"** sur la page roadmap : le pilote scroll, lit 6 lignes "Sélectionner un pilier — Bientôt / Générer le hook — Bientôt / Générer les slides — Bientôt …" — il quitte la page. Pas de hook d'engagement, pas de promesse datée actionnable.

### Verdict : **Recalé**

### Justification

Le workflow C n'est pas un workflow en V1 — c'est une promesse visuelle. Le pilote qui clique sur "Créer un post" atterrit sur un placeholder qui le renvoie vers le conseiller. Friction : ~4 clics avant de découvrir qu'il faut sortir de l'outil pour réellement créer. Cul-de-sac UX.

### Recommandations

- **P0** : Soit livrer au moins UN format fonctionnel (probablement Anecdote, le plus simple) Sprint 38, soit retirer le Post Creator du catalogue jusqu'à livraison. Ne pas laisser un outil-promesse au catalogue.
- **P0** : Ajouter un feedback visuel après save dans `PostEditor.tsx` (toast "Modifications enregistrées" + retour `/programme` automatique).
- **P0** : Brancher `<InstagramIOSMockup>` côté édition pour preview live (axe Hiroshi + Marcus).
- **P1** : Permettre deep-link `/outils?tool=post-creator` qui pré-sélectionne le bon outil au load.
- **P1** : Ajouter un bouton "+ Ajouter un post" sur `/programme` qui ouvre directement un format wizard (ne pas obliger à passer par `/outils`).
- **P2** : Remplacer les pages roadmap placeholder par une seule page "Post Creator — bientôt" globale, plutôt qu'une par format.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations

1. **Le pilote pilote ?** Non. Le workflow C est en mode "promesse" — le pilote regarde un catalogue d'outils dont 5 sur 11 sont "À venir", clique sur "Post Creator", arrive sur un placeholder, et est renvoyé vers le conseiller pour vraiment travailler. Le pilote ne pilote pas — il est aiguillé.
2. **Doctrine 6 formats canoniques non négociables** — violée. Question + Coulisses listés "À venir". Sprint 38 doit trancher : (a) livrer Question + Coulisses, (b) retirer la doctrine "6 formats canoniques", (c) assumer le partial.
3. **Tranquillité narrative** — cassée par l'exposition explicite "Sprint 38+", "Bientôt" répété 6 fois sur la page roadmap, "À venir" sur la moitié de la sidebar. Le pilote voit un produit en chantier, pas un produit fini. Doctrine "le pilote ne doit pas sentir le sprint".
4. **Doctrine interne exposée** — "TF Ads (Sofia P.)" / "Sub-prompt" dans la description Ads. C'est de la mécanique CFS qui n'a rien à faire devant le pilote.
5. **Mockup IG pixel-près** (`InstagramIOSMockup.tsx` 643 LOC Sprint 37.L) — investi mais non utilisé dans le parcours création/édition. Décrochage doctrinal "show, don't tell" : on dit "Rédige et programme tes publications Instagram" mais on ne montre rien.
6. **Ton Floriane** — la copy est en grande partie alignée (tutoiement, vocabulaire éditorial, verbes d'action). Sauf les 3 violations vues côté Sarah.
7. **6 promesses CF** : sans liste exacte, je note que (a) la signature visuelle est respectée sur la preview catalogue (glass-regular, palette v60), (b) l'anti-gamification est respectée (zéro compteur), (c) la tranquillité éditoriale est violée par l'exposition d'inachevé.
8. **Anti-bloat éditorial** : le placeholder ne propose AUCUNE possibilité de bloat, donc respecté par défaut. Mais quand le post creator sera implémenté, il faudra des limites strictes par format (longueur caption, nombre de slides, etc.).
9. **Posture "Creative Fair propose, tu décides"** : la roadmap placeholder dit "L'expérience interactive complète arrive bientôt" — c'est Creative Fair qui propose un calendrier au pilote, mais ce que le pilote DÉCIDE c'est de quitter l'outil. Décrochage posture.

### Verdict : **Recalé**

### Justification

Le workflow C trahit plusieurs doctrines simultanément : (a) 6 formats canoniques non livrés, (b) tranquillité narrative cassée par exposition d'inachevé, (c) doctrine interne CFS exposée, (d) mockup IG investi mais non branché, (e) le pilote ne pilote pas — il est renvoyé vers le conseiller. C'est le workflow le moins doctrinal des 4 audités.

### Recommandations

- **P0** : Décider Sprint 38 : soit livrer les 6 formats (au moins une version créatrice basique) avec mockup IG branché, soit retirer Post Creator du catalogue jusqu'à ce qu'il soit doctrinal.
- **P0** : Supprimer toute exposition de "Sprint", "TF", "Sub-prompt" en UI. Doctrine CFS reste interne.
- **P1** : Brancher `<InstagramIOSMockup>` partout où le pilote prépare ou édite un post.
- **P1** : Refondre la sidebar `/outils` pour réduire la densité d'items "À venir" — montre ce que tu as, pas ce que tu vises.
- **P2** : Documenter la doctrine "6 formats canoniques" dans une ADR — pourquoi ces 6, pourquoi pas 4 ou 8.

---

## Synthèse du workflow

### Verdicts cumulés

| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé |
| Elena Archi | ❌ Recalé |
| Sarah Copy | ❌ Recalé |
| Marcus Workflow | ❌ Recalé |
| Hélène Doctrine | ❌ Recalé |

### Top fixes priorisés

- **P0** : Livrer au moins UN format Post Creator fonctionnel Sprint 38 (Anecdote prioritaire) OU retirer Post Creator du catalogue.
- **P0** : Brancher `pilier_id` dans `updatePostFields` + `PostEditor` (FK migration 026 inutilisée). Honorer la promesse Sprint 37.K F89.
- **P0** : Ajouter `.eq('tenant_id', tenantId)` sur l'update de `posts` (faille multi-tenant).
- **P0** : Brancher `<InstagramIOSMockup>` côté édition `/programme/post/[postId]`.
- **P0** : Retirer "TF Ads (Sofia P.)", "Sub-prompt", "Sprint 38+", "audience" du copy UI.
- **P0** : Ajouter feedback save (toast + revalidate) dans `updatePostFields`.
- **P0** : Corriger breadcrumb "Post Creator" qui pointe vers un redirect 308.
- **P1** : Décider du backfill `pilier_nom → pilier_id` sur `posts` existants.
- **P1** : Bouton "+ Ajouter un post" depuis `/programme` (anti dead-end).
- **P1** : Halos statiques sur `/outils/post-creator/[format]`.
- **P2** : Réduire densité items "À venir" sidebar `/outils`.

### Verdict global workflow

**Recalé**

### Friction quantifiée

- Nombre de clics du début à la fin (création post via UI promise) : **4** (et impossible de créer effectivement — fallback conseiller obligatoire)
- Nombre de champs obligatoires : **0** côté Post Creator V1 (placeholder roadmap)
- Nombre de redirections : **1** (redirect 308 `/outils/post-creator` → `/outils`)
- Latence LLM estimée : **0** côté placeholder, ~5-15s côté édition `updatePostFields` (en réalité 0 — c'est juste un update DB)
- Temps total Floriane : **30s** pour découvrir qu'il faut aller voir le conseiller

### Anti-patterns détectés (cross-pages)

1. **Outil placeholder visible au catalogue** : `/outils` sidebar liste "Post Creator" comme item "Supportés" mais aucun format n'est livré. C'est un mensonge marketing au pilote.
2. **`pilier_id` FK créée mais jamais branchée** : Sprint 37.K F89 promettait Sprint 38, on est Sprint 38, rien. La table `pillars` vit dans son monde, `posts.pilier_nom` TEXT vit dans le sien. Pas de pont.
3. **Faille multi-tenant récurrente** : `updatePostFields` (workflow C), `updatePillar`/`archivePillar` (workflow B), `brand-onboarding` (workflow A). Pattern systémique : `admin.from(X).update(…).eq('id', X)` sans filtre `tenant_id`. À fixer transverse Sprint 38.
4. **Asset technique sans branchement** : 643 LOC `InstagramIOSMockup` Sprint 37.L pixel-près, utilisé seulement dans la preview catalogue. Le pilote qui crée/édite un post réel ne voit jamais ce mockup. Investissement dormant.
5. **Exposition doctrine interne CFS au pilote** : "TF Ads (Sofia P.)", "Sub-prompt", "Sprint 38+" présents dans des copy visibles. Doctrine interne doit rester interne.
6. **Pas de revalidatePath sur mutations** : `updatePostFields` n'invalide rien. Le pilote retourne sur `/programme` et voit l'ancienne version. Pattern probablement présent ailleurs.
7. **Breadcrumb pointant vers redirect** : `/outils/post-creator` (redirect 308) cliqué depuis breadcrumb fait une boucle perceptuelle. Pattern à éviter partout.
