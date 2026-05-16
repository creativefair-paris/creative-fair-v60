# Page : /outils/post-creator (+ /outils/post-creator/[format])

## Métadonnées
- Route principale : `/outils/post-creator` (redirige 308 vers `/outils`)
- Route paramétrée : `/outils/post-creator/[format]` (auth requise, 4 formats supportés)
- Fichier source HUB : `app/(outils)/outils/post-creator/page.tsx` (redirect-only, 12 lignes)
- Fichier source FORMAT : `app/(outils)/outils/post-creator/[format]/page.tsx` (253 lignes)
- Composant Hub (rendu dans `/outils`) : `components/outils/previews/PostCreatorHubPreview.tsx`
- Composants liés :
  - `components/outils/post-creator/FormatCardApple.tsx`
  - `components/outils/ToolMockup.tsx` (case `post-creator`)
  - `components/outils/mockups/InstagramIOSMockup.tsx`
  - `components/outils/mockups/InstagramStoryRing.tsx`
  - `components/outils/mockups/icons/MetaVerifiedBadge.tsx`
  - `components/outils/mockups/icons/InstagramRepost.tsx`
- Constantes formats : `lib/i18n/formats.ts` (6 slugs) ET `lib/post-creator/roadmaps.ts` (4 slugs — duplication)
- Server / Client : Hub redirect Server. `[format]/page.tsx` Server (auth + roadmap statique). `<PostCreatorHubPreview>` rendu en Server depuis `OutilsCatalog`. `<InstagramIOSMockup>` est Server-safe (aucun hook). `<FormatCardApple>` Server-safe.
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise)

## Lecture rapide
Le hub Post Creator n'est plus une route mais une preview rendue dans `/outils` via `<PostCreatorHubPreview>`. Les sous-pages `/outils/post-creator/[format]` ne sont que des roadmaps statiques décoratives (états "Bientôt") avec fallback CTA vers le conseiller. Le mockup Instagram iOS (Sprint 37.K/L/M) est techniquement solide et conforme à la spec mai 2026, mais le système de formats canoniques souffre d'un drift majeur : 6 formats déclarés en i18n (Anecdote, Produit, Événement, Coulisses, Manifeste, Question) mais seulement 4 routes actives (`Coulisses` et `Question` étiquetées "À venir"). Aucune création de post n'est effectivement possible — V1 = roadmap visible, pas de pipeline rédactionnel.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. `components/outils/previews/PostCreatorHubPreview.tsx:19` — fond `rgba(251, 250, 247, 0.7)` (crème transparent) + `border 1px solid rgba(0, 0, 0, 0.05)` + `box-shadow 0 8px 32px rgba(0, 0, 0, 0.04)`. Aligné v60.
2. `components/outils/previews/PostCreatorHubPreview.tsx:13` — `className="glass-regular"`. Niveau Liquid Glass correct pour une carte preview surfacée.
3. `components/outils/post-creator/FormatCardApple.tsx:98-101` — `background: rgba(255, 255, 255, 0.7) + backdrop-filter: blur(20px) saturate(1.4)`. Pattern Liquid Glass thin valide.
4. `components/outils/post-creator/FormatCardApple.tsx:103-105` — transition `cubic-bezier(0.32, 0.72, 0, 1)` 200 ms : courbe iOS standard, conforme.
5. `components/outils/post-creator/FormatCardApple.tsx:173-175` — `@media (prefers-reduced-motion: reduce)` désactivé. Bon réflexe a11y.
6. `lib/i18n/formats.ts:61-68` — palette formats : `#007AFF`, `#34C759`, `#FF9500`, `#FF3B30`, `#5856D6`, `#AF52DE`. Palette SF Apple stricte, aucune trace de forest green `#1F4937`. ✅
7. `components/outils/post-creator/FormatCardApple.tsx:51` — `background: ${color}26` (15 % opacité hex). Couleur de format en accent uniquement, pas dominante. Doctrine F82 "subtraction over addition" respectée.
8. `app/(outils)/outils/post-creator/[format]/page.tsx:102` — pastille format `background: color` (couleur pleine) avec `color: #FFFFFF`. Le rouge `#FF3B30` (Manifeste) avec texte blanc en `font-weight 600` est ratio AA OK mais reste un bloc rouge plein qui crie au lieu de chuchoter. Décalage avec le ton velouté du reste de l'app.
9. `app/(outils)/outils/post-creator/[format]/page.tsx:151` — `background: rgba(255, 255, 255, 0.5)` + `border 1px solid rgba(0, 0, 0, 0.05)` + `opacity: 0.75` pour les étapes roadmap : l'opacité 0.75 sur le card entier rend le texte secondaire à 0.75 × 0.55 ≈ 0.41 sur fond clair, sous le seuil AA effectif. À vérifier.
10. `components/outils/mockups/InstagramIOSMockup.tsx:432-441` — `.ig-ios-mockup` : `max-width 320px`, `background #FFFFFF`, `border-radius 14`, `box-shadow 0 8px 24px rgba(0, 0, 0, 0.08)`. Carte mockup correctement isolée.
11. `components/outils/mockups/InstagramIOSMockup.tsx:531` — `.ig-ios-mockup__image` `background #FBFAF7` (crème CF) comme fallback de pré-image. Cohérent.
12. `components/outils/mockups/InstagramIOSMockup.tsx:255-264` — `CFGradientPlaceholder` : gradient diagonal `#007AFF → #A78BFA → #FB923C`. Spec F86.3 strictement respectée.
13. `components/outils/mockups/InstagramIOSMockup.tsx:438` — police `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display"`. SF Pro stack. ✅
14. `components/outils/post-creator/FormatCardApple.tsx:134` — police répétée inline `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui` au lieu d'utiliser le token `var(--font-system)`. Incohérence avec le reste de la page hub.
15. `components/outils/post-creator/FormatCardApple.tsx:138` — `color: rgba(0, 0, 0, 0.88)` au lieu de `var(--color-label)`. Hardcoded, pas tokenisé.
16. `components/outils/post-creator/FormatCardApple.tsx:146,153,159` — `color: rgba(0, 0, 0, 0.55)`, `0.3`, `0.4`, `0.04` hardcodés. Pas de tokens `--color-secondary-label`, `--color-tertiary-label`. Drift token.
17. `components/outils/previews/PostCreatorHubPreview.tsx:118-122` — grid template `1fr 320px` : à 900 px breakpoint, switch single-column. Mockup sticky alignement OK.
18. Touch targets : `<FormatCardApple>` mesure ~64-72 px de haut (padding 14 px + body 36 px). ≥ 44 px ✅.
19. `components/outils/mockups/InstagramIOSMockup.tsx:504-516` — bouton "..." `width 32 height 32`, `cursor: default`. Bouton décoratif mais touch target sous 44 px : acceptable car `aria-hidden + tabIndex=-1` (le mockup est entièrement décoratif).
20. Pas de halos animés dans le mockup, halos de page (`bg-halo-*`) gérés par les pages parentes, pas par le hub.

### Verdict : **Recalé partiel**

### Justification
Le mockup Instagram iOS et la carte d'article Hub sont impeccables. Le composant `FormatCardApple` introduit des couleurs hardcodées (`rgba(0,0,0,0.55)`, `0.3`, `0.4`) qui contournent les tokens `var(--color-*-label)` du design system. La pastille rouge plein `#FF3B30` du sous-page Manifeste rompt avec la doctrine "subtraction over addition" déjà appliquée aux cartes Hub. L'opacité globale 0.75 des étapes de roadmap rend le texte secondaire borderline AA.

### Recommandations
- **P0** : Remplacer les `rgba(0, 0, 0, 0.55|0.3|0.4|0.04)` de `FormatCardApple.tsx:146,153,159,167` par `var(--color-secondary-label)`, `var(--color-tertiary-label)`, `var(--color-quaternary-label)`, `var(--color-fill-secondary)`. Aligner sur les autres composants tokenisés du repo.
- **P0** : Remplacer la police hardcodée `-apple-system, BlinkMacSystemFont, ...` de `FormatCardApple.tsx:134,142` par `var(--font-system)`.
- **P1** : Atténuer la pastille format en `[format]/page.tsx:92-106` — utiliser `${color}26` (15 % opacity) + `color: color` comme dans les cartes hub, plutôt qu'un bloc plein qui contredit la doctrine velouté.
- **P1** : Remplacer `opacity: 0.75` global de `[format]/page.tsx:154` par des couleurs texte ad hoc (`var(--color-tertiary-label)`) pour préserver la lisibilité AA sans toucher le contraste de tout l'élément.
- **P2** : Documenter explicitement que `<InstagramIOSMockup>` n'utilise jamais d'animation (deux passes de revue confirmées) et figer ce contrat par un test snapshot statique pour bloquer toute régression future.

---

## Axe 2 — Elena (Architecture)

### Observations
1. `app/(outils)/outils/post-creator/page.tsx:8-12` — redirect 308 sans `permanent: true` paramétrisé (Next gère). Pattern propre pour vider une route morte tout en préservant les bookmarks.
2. `app/(outils)/outils/post-creator/[format]/page.tsx:20` — `export const dynamic = 'force-dynamic'`. Justifié car la page lit `supabase.auth.getUser()` ; le rendre statique casserait l'auth.
3. `app/(outils)/outils/post-creator/[format]/page.tsx:22` — `params: Promise<{ format: string }>` + `await params`. Next 15 async params correctement géré.
4. `app/(outils)/outils/post-creator/[format]/page.tsx:24-29` — `SUPPORTED: ReadonlySet<RoadmapFormat>` (`anecdote | produit | evenement | manifeste`) — type-safe et fail-fast via `notFound()`.
5. `app/(outils)/outils/post-creator/[format]/page.tsx:39-43` — Vérification user → redirect login. Pas de fuite tenant_id (la roadmap ne lit aucune donnée user-specific côté DB). ✅
6. `lib/post-creator/roadmaps.ts:12` — `RoadmapFormat` ne déclare que 4 slugs.
7. `lib/i18n/formats.ts:12-19` — `FormatSlug` déclare 6 slugs.
8. **DUPLICATION SCHÉMA** : `lib/post-creator/roadmaps.ts:130-142` redéfinit `FORMAT_LABELS` et `FORMAT_COLORS` qui existent déjà dans `lib/i18n/formats.ts:22-30,61-68`. Deux sources de vérité pour les mêmes données → drift garanti à terme. Élena Recalé.
9. `components/outils/post-creator/FormatCardApple.tsx:14-18` — import depuis `@/lib/i18n/formats` (source 1).
10. `app/(outils)/outils/post-creator/[format]/page.tsx:13-18` — import depuis `@/lib/post-creator/roadmaps` (source 2). Confirme la divergence.
11. `components/outils/mockups/InstagramIOSMockup.tsx:71-90` — props 100 % optionnelles avec defaults, 100 % rétro-compatible. API design Apple-grade.
12. `components/outils/mockups/InstagramIOSMockup.tsx:18` — `import type { CSSProperties, ReactNode }` : import type, pas runtime. Tree-shaking OK.
13. `components/outils/previews/PostCreatorHubPreview.tsx` — Server Component pur (pas de `'use client'`, pas de hook), rendu dans `OutilsCatalog` qui dispatche sur `outil.id`. Séparation Server/Client respectée.
14. `components/outils/ToolMockup.tsx:22-39` — Switch déclaratif simple. Bon pattern.
15. `components/outils/ToolMockup.tsx:99-117` — `<PostCreatorMockup>` câble manuellement des props : `username="creativefair.paris"`, `slidesCount={8}`, caption hardcoded > 70 chars pour déclencher la troncature. Hardcoded = OK pour un mockup décoratif statique, mais devrait piocher dans la marque réelle si on veut un vrai aperçu.
16. Aucun Server Action exposé par le Post Creator V1 (les routes `[format]` n'écrivent rien). Cohérent avec "roadmap visible" mais signifie qu'à l'horizon Sprint 38+ il faudra créer `app/_actions/create-post-draft.ts`, `update-post-draft.ts`, `schedule-post.ts`. Aucun stub dans le repo.
17. **Drift `pilier_nom` TEXT vs `pilier_id` UUID FK** : non observable depuis ces fichiers car aucune table `posts` n'est encore touchée. À surveiller dès qu'une Server Action de création de post arrivera.
18. `components/outils/post-creator/PostCreatorLayout.tsx`, `AnecdoteLive.tsx`, `AnecdoteCustom.tsx`, `BriefExterne.tsx`, `ContextColumn.tsx`, `Programmer.tsx`, `PreviewIOS.tsx`, `FormatCard.tsx` — composants présents mais non référencés depuis les pages `/outils/post-creator/*`. Code mort ou en attente d'un éditeur interactif Sprint 38+. À auditer séparément (hors scope ici).

### Verdict : **Recalé partiel**

### Justification
La séparation Server/Client est propre, l'auth est respectée, le mockup est techniquement sans faute. Le point bloquant est la coexistence de deux dictionnaires de formats (`lib/i18n/formats.ts` 6 slugs vs `lib/post-creator/roadmaps.ts` 4 slugs) qui exposent une dette de refactor immédiate. Par ailleurs, un volume notable de composants `components/outils/post-creator/*` (8 fichiers) ne sont consommés nulle part dans les routes actuelles — ils suggèrent un éditeur en chantier mais sans aucune Server Action associée, ce qui en fait du code mort exécutoire à date.

### Recommandations
- **P0** : Supprimer `FORMAT_LABELS` et `FORMAT_COLORS` locaux de `lib/post-creator/roadmaps.ts:130-142` et importer depuis `lib/i18n/formats.ts`. Étendre `RoadmapFormat` à `FormatSlug` (6 slugs) avec roadmaps `coulisses` et `question` (même si elles restent vides initialement, le contrat de type est unifié).
- **P1** : Auditer `components/outils/post-creator/*` (les 8 composants orphelins) : soit ils sont câblés dans Sprint 38, soit ils sont supprimés (subtraction over addition).
- **P1** : Préparer un répertoire `app/_actions/post-creator/` avec stubs `create-post-draft.ts` + RLS check `tenant_id` documentée. Anticipe la dette de Sprint 38.
- **P2** : Ajouter un test e2e qui vérifie que `/outils/post-creator/<unsupported>` renvoie 404, et que `/outils/post-creator` renvoie 308 vers `/outils`.

---

## Axe 3 — Sarah (Copy)

### Observations
1. `components/outils/previews/PostCreatorHubPreview.tsx:48` — "Rédige et programme tes publications Instagram. Chaque post part d'un de tes piliers narratifs et garde la voix de ta marque." Tutoiement direct ("tes", "ta"). ✅
2. `components/outils/previews/PostCreatorHubPreview.tsx:53` — "Supportés". Mot lapidaire correct.
3. `components/outils/previews/PostCreatorHubPreview.tsx:83` — "À venir". Bon, sobre.
4. `components/outils/previews/PostCreatorHubPreview.tsx:60,65,71,77,89,95` — descriptions de format : "Raconter une histoire qui sert un pilier", "Mettre en avant une création avec son histoire", "Annoncer une date qui compte", "Affirmer une position forte", "Faire réagir la communauté", "Montrer le geste, l'atelier, la fabrication". Voix Floriane ✅.
5. `app/(outils)/outils/post-creator/[format]/page.tsx:77` — breadcrumb "Mes Outils". Possessif nav respecté. ✅
6. `app/(outils)/outils/post-creator/[format]/page.tsx:118` — "Roadmap {label}". Le mot "Roadmap" est un anglicisme tech assumé ; pas dans la liste noire stricte mais incohérent avec Floriane. Une marque française dirait "Étapes" ou "Démarche".
7. `app/(outils)/outils/post-creator/[format]/page.tsx:128-130` — "Voici les étapes pour créer un post {label.toLowerCase()}. L'expérience interactive complète arrive bientôt." Tutoiement absent ici → texte impersonnel ("Voici", "L'expérience"). Manque de chaleur Floriane.
8. `app/(outils)/outils/post-creator/[format]/page.tsx:212` — "Bientôt". OK.
9. `app/(outils)/outils/post-creator/[format]/page.tsx:240` — "L'expérience interactive complète arrive Sprint 38+. En attendant, tu peux discuter de tes idées de post {label.toLowerCase()} avec le conseiller." Mention sprint interne ("Sprint 38+") dans une UI utilisateur final. PRODUIT INTERNE LEAKÉ DANS LA UI.
10. `app/(outils)/outils/post-creator/[format]/page.tsx:247` — "Discuter avec le conseiller →". Bouton clair, tutoiement implicite, "conseiller" minuscule ✅.
11. `lib/post-creator/roadmaps.ts:18,22,26,29,38,42` — descriptions roadmap : "Quel pilier mobiliser ? Quel angle ?", "Vérifier les faits, croiser les archives", "5-7 slides, narration en arc", "Cohérence avec la signature de la marque". Voix Floriane impeccable.
12. `lib/post-creator/roadmaps.ts:67` — "Présenter sans vendre" : punchline anti-jargon SaaS Floriane. ✅
13. `lib/post-creator/roadmaps.ts:108` — "Court, lapidaire, sans nuance excessive" : style Manifeste cohérent avec la grammaire de la marque. ✅
14. `lib/post-creator/roadmaps.ts:125` — "Pas le vendredi soir. Pas le lundi matin." Ton très Floriane (silence, refus, posture). ✅
15. `components/outils/mockups/InstagramIOSMockup.tsx:85` — caption par défaut "L'histoire derrière ta création préférée…" : tutoiement direct, voix marque ✅.
16. `components/outils/mockups/InstagramIOSMockup.tsx:72` — username `creativefair.paris` ✅ (spec mai 2026).
17. Aucune occurrence dans cette zone du vocab interdit : pas de "users", "audience", "dashboard", "workflow", "viral", "boost", "growth", "feature", "engagement", "métrique", "KPI", "stats", "analytics".
18. `components/outils/post-creator/FormatCardApple.tsx:60` — "BIENTÔT" en uppercase. Ton acceptable mais l'uppercase est rare dans la doctrine Apple velvet. Préférer la pastille texte normal "Bientôt" comme dans la page format.
19. `app/(outils)/outils/post-creator/[format]/page.tsx:84` — "Post Creator" : nom propre du produit en anglais. Inévitable mais incohérent avec une UI 100 % FR. À documenter dans le glossaire doctrine.

### Verdict : **Recalé partiel**

### Justification
La voix Floriane est globalement très bien tenue : tutoiement systématique, formules sobres, refus du SaaS-isme. Trois fautes : (1) "Sprint 38+" est un terme interne projet qui ne devrait jamais apparaître dans une UI utilisateur, (2) le mot "Roadmap" anglicise un écran tout français, (3) "BIENTÔT" en majuscules détonne avec l'esthétique velvet. Aucune trace de vocabulaire interdit, possessifs nav corrects, username Instagram conforme.

### Recommandations
- **P0** : Remplacer "L'expérience interactive complète arrive Sprint 38+" par "Cet outil arrive bientôt" dans `[format]/page.tsx:239-241`. Aucune référence à un sprint interne en UI utilisateur.
- **P1** : Remplacer "Roadmap {label}" par "Étapes pour ton post {label.toLowerCase()}" dans `[format]/page.tsx:118`. Tutoiement + français.
- **P1** : Remplacer "Voici les étapes pour créer un post {label.toLowerCase()}" par "Voilà comment tu crées ton post {label.toLowerCase()}" dans `[format]/page.tsx:128-129`. Tutoiement.
- **P2** : Remplacer "BIENTÔT" uppercase par "Bientôt" mixed-case dans `FormatCardApple.tsx:60`. Cohérence avec la pastille de `[format]/page.tsx:212`.
- **P2** : Ajouter le mot "Roadmap" et "Sprint" à la liste noire du linter copy de Sarah.

---

## Axe 4 — Marcus (Workflow)

### Observations
1. `app/(outils)/outils/post-creator/page.tsx:11` — redirect 308 instantané vers `/outils`. Aucune friction pour un bookmark obsolète.
2. `app/(outils)/outils/post-creator/[format]/page.tsx:42` — redirect login si pas user. Pattern correct.
3. `app/(outils)/outils/post-creator/[format]/page.tsx:37` — `notFound()` si format non supporté. UX correcte (page 404 plutôt que page blanche).
4. `components/outils/post-creator/FormatCardApple.tsx:67-79` — cartes disabled rendues sans `<Link>`, juste une `<div aria-disabled="true">`. Click silencieux mais pas de feedback visuel "pourquoi". Le tag "BIENTÔT" devrait suffire.
5. `components/outils/post-creator/FormatCardApple.tsx:113-116` — `.fcc.is-disabled { opacity: 0.5, cursor: not-allowed }`. Feedback visuel hover/cursor OK.
6. Aucun loading state, aucun skeleton sur la page Hub : tout est statique côté Server, pas nécessaire.
7. Aucun loading state sur `[format]/page.tsx` : statique aussi, pas nécessaire.
8. `app/(outils)/outils/post-creator/[format]/page.tsx:243-248` — CTA "Discuter avec le conseiller →" pointe vers `/outils/conseiller?context=post_creator&format=${format}`. Bon : préserve le contexte au transit. Encore faut-il que le conseiller LISE ces query params — à vérifier hors scope.
9. Pas de confirmation destructrice à gérer (V1 = lecture seule).
10. Touch targets : `<FormatCardApple>` ≥ 64 px de haut. Bouton "Discuter avec le conseiller" `.btn-primary` (probablement 44 px+). À confirmer côté Hiroshi sur la classe `.btn-primary` globale.
11. État vide : pas applicable (la roadmap a toujours du contenu).
12. État d'erreur : pas applicable côté V1 (aucune Server Action).
13. `app/(outils)/outils/post-creator/[format]/page.tsx:63-88` — breadcrumb 3 niveaux : "Mes Outils > Post Creator > {label}". Navigation prévisible. ✅
14. Le lien breadcrumb `/outils/post-creator` (ligne 81) pointe vers une route qui 308-redirige vers `/outils`. Cliquer "Post Creator" dans le fil d'Ariane renvoie au hub — fonctionnel, mais "Post Creator" n'a pas d'URL propre, ce qui est trompeur. Le breadcrumb 3 niveaux suggère une hiérarchie qui n'existe pas réellement.
15. `components/outils/post-creator/FormatCardApple.tsx:103-105` — hover `translateY(-1px) + box-shadow`. Feedback visuel iOS-like.
16. `components/outils/post-creator/FormatCardApple.tsx:157-160` — flèche `→` translateX 3px au hover : micro-feedback Apple.
17. `components/outils/mockups/InstagramIOSMockup.tsx:182` — bouton `...` avec `cursor: default + tabIndex=-1 + aria-hidden`. Confirme l'intention décorative.
18. Aucun mécanisme de "back" custom : repose sur la navigation native (browser back + breadcrumb). OK car SPA Next standard.

### Verdict : **Recalé partiel**

### Justification
La navigation est prévisible, les états vides/erreur sont gérés par absence (aucun pipeline interactif). Le breadcrumb 3 niveaux affiche un lien "Post Creator" qui pointe vers une route 308-redirigée → l'utilisateur clique sur un breadcrumb et atterrit ailleurs que ce qu'il croit (sur `/outils`). C'est une dette UX qu'il faut soit assumer (laisser le breadcrumb à 2 niveaux) soit corriger (faire pointer "Post Creator" vers `/outils#post-creator`).

### Recommandations
- **P1** : Soit retirer le segment "Post Creator" du breadcrumb dans `[format]/page.tsx:80-85` (passer à 2 niveaux : Mes Outils > {label}), soit pointer ce segment vers un ancre `/outils#post-creator` dans la grille `/outils`.
- **P2** : Ajouter un focus-visible CSS explicite sur `<FormatCardApple>` pour la navigation clavier (actuellement repose sur le default Next/browser).
- **P2** : Pour les cartes "À venir" (disabled), envisager un message tooltip "Cet outil arrive bientôt" au survol — actuellement, le tag "BIENTÔT" est passif, l'utilisateur ne sait pas quand ni pourquoi.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. **6 formats canoniques NON NÉGOCIABLES** : la doctrine impose Anecdote / Produit / Événement / Coulisses / Manifeste / Question. `lib/i18n/formats.ts:12-19` les déclare tous les 6. `lib/post-creator/roadmaps.ts:12` n'en supporte que 4. Conséquence : `Coulisses` et `Question` sont étiquetés "À venir" dans le hub (`PostCreatorHubPreview.tsx:83-97`). C'est cohérent en termes de produit (incomplet) mais ce n'est pas une faute doctrine — c'est un V1 partiel honnête, pas un format inventé.
2. Aucun format hors-doctrine n'est introduit (pas de "Témoignage", pas de "Tutoriel", pas de "Tip"). ✅ Doctrine respectée à ce titre.
3. `components/outils/post-creator/FormatCardApple.tsx:22-29` — icônes Lucide par format : `BookOpen` (anecdote), `Package` (produit), `Calendar` (evenement), `Megaphone` (manifeste), `MessageCircle` (question), `Camera` (coulisses). Choix sobres, lisibles. Cohérent doctrine "tranquillité du pilote".
4. `lib/i18n/formats.ts:32-57` — descriptions de formats : pas de gamification, pas de promesse de viralité. "Faire réagir la communauté" pour Question est le plus proche d'une mesure d'engagement, mais reste descriptif et neutre (pas "boost", pas "engagement rate").
5. `lib/post-creator/roadmaps.ts:125` — "Pas le vendredi soir. Pas le lundi matin." : grammaire Floriane / Hélène (silence, refus de l'évidence SaaS "publie quand l'algo veut"). ✅
6. `lib/post-creator/roadmaps.ts:42` — "Court, sans punchline forcée" : anti-gamification verbale ✅.
7. `lib/post-creator/roadmaps.ts:67` — "Présenter sans vendre" : doctrine commerce qui chuchote ✅.
8. `lib/post-creator/roadmaps.ts:20` — "Vérifier les faits, croiser les archives" : citation implicite TF Éditorial Magazine (Albane R.) + Archives & Mémoire (Élise M.). Cohérent avec la fabrique de pépites.
9. **Phase 1 anecdotique** (Hélène) : la doctrine prescrit que Anecdote est le format central de Phase 1. `lib/post-creator/roadmaps.ts:13` place `anecdote` en premier et lui attribue 6 étapes (le plus détaillé). `lib/i18n/formats.ts:23,33` lui donne aussi la première position et la description la plus "fondatrice". Doctrine respectée.
10. **Citation anchor "tableau de bord simple et efficace, contrôle, pilote"** : non explicitement citée dans ces fichiers, mais la doctrine "subtraction over addition" (FormatCardApple.tsx commentaire ligne 1-9) traduit l'intention.
11. **Anti-gamification** : aucun mécanisme de progression visible (pas de barre de complétion, pas de "Tu as débloqué X", pas de "streak", pas de "level"). ✅
12. **Tranquillité narrative** : la page format `[format]/page.tsx` affiche une roadmap décorative + un CTA conseiller. Aucune sollicitation, aucune notification, aucun nudge. ✅
13. **Trilogie Organique/Outreach/Libre** : le Post Creator est Organique (vit sur le feed). Cohérent avec sa place dans l'écosystème.
14. `components/outils/mockups/InstagramIOSMockup.tsx:72` — username `creativefair.paris` (compte démo brand). Conforme doctrine.
15. `components/outils/mockups/InstagramIOSMockup.tsx:82-84` — likes 330, comments 2, reposts 11 : valeurs sobres, pas de chiffres growth-hack. Pas de "10k likes", pas de "viral". ✅
16. **Drift doctrine connue** : `skills/00-CONCEPT.md`, `skills/10-SACRED.md`, `skills/01-ARCHITECTURE.md` mentionnent encore forest green `#1F4937` (déprécié 6 mai 2026) et une nav 4 sans `/outils` distinct. Cette zone d'audit (post-creator) ne contient AUCUNE référence à `#1F4937`. ✅ Le code est en avance sur les skills/.
17. **Doctrine Phase 2 programme 3 mois** : le Post Creator est l'outil d'exécution post-Phase 2 (rédaction du programme). La V1 ne permet pas encore d'écrire un post. C'est une dette produit, pas une dette doctrine.

### Verdict : **Validé**

### Justification
Aucun format hors-doctrine n'est introduit. Aucun vocabulaire interdit. Aucun mécanisme de gamification. Le username Instagram est conforme. La grammaire Floriane est solide dans les roadmaps statiques. Que `Coulisses` et `Question` soient "à venir" est un état produit V1 partiel honnête — pas une faute doctrine. Le post-creator se conforme à la lettre à la spec mai 2026.

### Recommandations
- **P1** : Câbler la roadmap pour `Coulisses` et `Question` dans `lib/post-creator/roadmaps.ts` (même si elles restent étiquetées "À venir" dans `PostCreatorHubPreview.tsx`). Un format canonique doit avoir sa structure documentaire complète, même si l'éditeur n'est pas livré.
- **P1** : Documenter dans un en-tête de `lib/i18n/formats.ts` le statut "ordre de présentation Phase 1 = Anecdote en premier" pour bloquer toute future réorganisation alphabétique qui contredirait la doctrine Hélène.
- **P2** : Synchroniser `skills/00-CONCEPT.md`, `skills/10-SACRED.md`, `skills/01-ARCHITECTURE.md` avec la spec 12 mai 2026 — mais ce travail est hors scope post-creator et concerne le repo `skills/`.

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
  1. Supprimer la duplication `FORMAT_LABELS`/`FORMAT_COLORS` dans `lib/post-creator/roadmaps.ts:130-142`, étendre `RoadmapFormat = FormatSlug` (6 slugs), importer depuis `lib/i18n/formats.ts`.
  2. Remplacer "Sprint 38+" par "bientôt" dans `[format]/page.tsx:239-241` (jargon interne leaké en UI).
  3. Remplacer les couleurs hardcodées `rgba(0,0,0,0.55|0.3|0.4|0.04)` de `FormatCardApple.tsx:146,153,159,167` par les tokens `var(--color-*-label)` et `var(--color-fill-secondary)`.
  4. Remplacer la police hardcodée de `FormatCardApple.tsx:134,142` par `var(--font-system)`.

- **P1** :
  1. Remplacer "Roadmap {label}" par "Étapes pour ton post {label.toLowerCase()}" + tutoiement systématique dans `[format]/page.tsx:118,128-129`.
  2. Soit retirer le segment "Post Creator" du breadcrumb (route 308), soit pointer vers `/outils#post-creator` (`[format]/page.tsx:80-85`).
  3. Atténuer la pastille format pleine couleur (`[format]/page.tsx:92-106`) — appliquer le pattern `${color}26` + color: color comme dans le hub.
  4. Atténuer ou retirer `opacity: 0.75` global des étapes roadmap (`[format]/page.tsx:154`) → utiliser des couleurs texte dédiées pour préserver l'AA.
  5. Auditer puis supprimer/câbler les 8 composants orphelins `components/outils/post-creator/*` (AnecdoteLive, AnecdoteCustom, BriefExterne, ContextColumn, FormatCard, PostCreatorLayout, PreviewIOS, Programmer).
  6. Préparer `app/_actions/post-creator/create-post-draft.ts` stub avec RLS `tenant_id` documenté.
  7. Câbler roadmaps Coulisses + Question dans `lib/post-creator/roadmaps.ts` (structure même si non livrée).

- **P2** :
  1. Remplacer "BIENTÔT" uppercase par "Bientôt" mixed-case (`FormatCardApple.tsx:60`).
  2. Tooltip explicite "Cet outil arrive bientôt" sur les cartes disabled.
  3. Focus-visible CSS sur `<FormatCardApple>`.
  4. Test e2e routes 404/308 pour `/outils/post-creator/*`.
  5. Documenter dans l'en-tête de `lib/i18n/formats.ts` que Anecdote = première position = doctrine Phase 1.
  6. Test snapshot statique du mockup Instagram pour figer le contrat "zéro animation".
  7. Ajouter "Roadmap" et "Sprint" à la liste noire du linter copy.

### Verdict global page
**Recalé partiel** — Le mockup Instagram iOS est exemplaire, la doctrine est respectée, mais la duplication des dictionnaires de formats, les couleurs hardcodées de `FormatCardApple`, et la leak "Sprint 38+" dans la UI sont des dettes immédiates à régler avant tout enrichissement Sprint 38+ de l'expérience interactive.
