# Workflow : A — Onboarding complet (Signup → /aujourd-hui avec marque)

## Métadonnées

- **Pages impliquées** :
  - `app/(auth)/login/page.tsx` (point d'entrée — magic link Supabase)
  - `app/(onboarding)/onboarding/analyse-marque/page.tsx` (shell page)
  - `components/onboarding/OnboardingFlow.tsx` (état multi-step orchestrateur)
  - `components/onboarding/OnboardingStep.tsx` + `OnboardingChoiceStep.tsx` + `OnboardingProgress.tsx`
  - `components/onboarding/ConseillerIntro.tsx` (post-submit, 3 écrans skippables)
  - `app/(aujourd-hui)/aujourd-hui/page.tsx` (point d'arrivée final)
  - `app/(ma-marque)/ma-marque/page.tsx` (point d'arrivée alternatif si pilote relance le wizard guidé Sprint 37.C F18)
- **Server actions / endpoints** :
  - `app/(auth)/login/actions.ts` → `sendMagicLink` (Supabase auth.signInWithOtp)
  - `app/api/onboarding/complete/route.ts` (POST — création brand + génération programme initial)
  - `app/_actions/ensure-profile.ts` (provisioning profile/tenant si trigger PG `handle_new_user` n'a pas tourné)
  - `app/_actions/brand-onboarding.ts` (wizard 14 étapes Sprint 37.C F18 — chemin alternatif facultatif)
- **Tables Supabase touchées** : `auth.users` (Supabase Auth), `profiles`, `tenants`, `brands`, `programmes`, `posts`, `brand_onboarding_sessions` (chemin wizard alternatif uniquement).
- **Modèles Anthropic appelés** : la génération du programme initial passe par `lib/programme/generation.ts` (vu importé dans la route `complete`) — probablement Sonnet/Opus selon cascade interne.
- **Screenshots** : à produire côté Lead (storyboard recommandé : 1. `/login`, 2. `/login?sent=1`, 3. `/onboarding/analyse-marque` étape 1, 4. étape 4 (singularité), 5. étape choix persona, 6. étape choix fréquence, 7. écran "submitting" Nous préparons ton programme, 8. ConseillerIntro screen 3, 9. `/aujourd-hui` à l'arrivée).

---

## Storyboard narratif

### Étape 0 — Magic link (`/login`)

`app/(auth)/login/page.tsx:1-99` — formulaire 1 champ email, copy "Recevoir mon lien de connexion". L'utilisateur reçoit un mail Supabase Auth, clique, la session est posée. **Aucune route `/signup`** : la doctrine 12 mai 2026 mentionne un signup distinct mais le repo n'expose qu'un magic link (auth passwordless). Le pilote n'a aucun champ "Quel est ton prénom ?", "Tu pilotes quelle marque ?", etc. à ce stade.

### Étape 1 — Atterrissage post-magic-link

Après callback `app/auth/callback/route.ts` (non audité ici), l'utilisateur est en théorie redirigé sur `/aujourd-hui`. Sur cette page, `loadAujourdhuiData()` (cf. `app/(aujourd-hui)/aujourd-hui/page.tsx:35-38`) déclenche un redirect serveur, probablement vers `/onboarding/analyse-marque` si pas de brand. Le détail de cette logique vit dans `lib/aujourd-hui/load-data.ts` (non lu — hors scope onboarding).

### Étape 2 — Wizard onboarding inversé Marcus

`app/(onboarding)/onboarding/analyse-marque/page.tsx:4-31` — shell ultra-mince qui rend uniquement `<OnboardingFlow />` centré. Pas de PageHeader (donc pas d'avatar/menu cross-pages). 5 halos statiques en fond.

`components/onboarding/OnboardingFlow.tsx:43-127` définit **6 questions** au total :

1. **Nom** (text, 80 char) — `Quel est le nom de ta marque ?`
2. **Secteur** (text, 120 char) — `Dans quel secteur évolue ta marque ?`
3. **Ton** (textarea, 280 char, 3 lignes) — `Comment ta marque s'exprime-t-elle ?`
4. **Singularité** (textarea, 400 char, 4 lignes) — `Qu'est-ce qui rend ta marque unique ?`
5. **Persona pilote** (choice 2) — `Tu pilotes une marque (responsable comm, freelance) ou c'est la tienne (fondateur·rice) ?`
6. **Fréquence publication** (choice 3) — `À quel rythme tu publies ?` (Discret / Équilibré / Dense).

Une `OnboardingProgress` (cf. `components/onboarding/OnboardingProgress.tsx`) affiche le step courant (1/6 → 6/6). Boutons "retour" (disabled à step 0) / "suivant" jusqu'à step 5, puis "terminer" à step 6.

Le copy doctrine prompt dit "onboarding 4 steps" — **divergence** : il y a 6 étapes (4 marque + 2 doctrinales Sprint 37 Lot 1).

### Étape 3 — Submit & génération programme initial

`OnboardingFlow.tsx:185-206` : POST `/api/onboarding/complete` avec le payload des 6 réponses. La route (`app/api/onboarding/complete/route.ts`) :

1. Valide l'auth (sinon 401)
2. Valide le body (validateBody:57-96 — string lengths + enums)
3. Provisionne profile + tenant via `ensureProfile()` (filet, le trigger PG `handle_new_user` doit normalement s'en charger)
4. Upsert `brands` avec `brand_book_status = 'complete'`
5. Update `profiles.pilot_role` + `profiles.publication_frequency` (échec silencieux acceptable)
6. Appelle `generateProgrammeInitial(brand, admin)` (lib/programme/generation.ts) → insère un programme + posts initiaux dans la BDD

Pendant ce temps, `OnboardingFlow.tsx:212-242` affiche un écran de transition avec halo pulsant : `Nous préparons ton programme.` / `Creative Fair structure ta semaine éditoriale.`

En cas d'erreur de génération : `502` + message brut affiché dans `<p style={{ color: 'system-red' }}>`. Aucun fallback "réessayer".

### Étape 4 — Mini-onboarding du conseiller

À succès, `OnboardingFlow.tsx:201` bascule `status = 'intro'` qui rend `<ConseillerIntro />` (3 écrans skippables). Chaque écran (Voici ton conseiller / Il propose, tu décides / Prêt à poser ton premier plan ?) avec une illustration sobre fabriquée en CSS pur (cf. `ConseillerIntro.tsx:50-151`).

Boutons par écran :

- Écrans 1-2 : `suivant` + `passer` (push `/aujourd-hui`)
- Écran 3 : `créer mon plan` (push `/programme?action=create-plan`) + `plus tard` (push `/aujourd-hui`)

### Étape 5 — Atterrissage `/aujourd-hui`

`app/(aujourd-hui)/aujourd-hui/page.tsx:35-186` — recharge le `loadAujourdhuiData()`. Désormais le pilote a un programme actif (généré à l'étape 3), il voit :

- `<PageHeader title="Aujourd'hui" subtitle="Semaine du …" />` + halos + avatar
- Bloc Critical Banner si alertes
- `<JalonHero>` si `current !== 'production'` (cas attendu en post-onboarding : jalon "programme" ou "marque" probablement déjà à 'production' grâce à la génération)
- `<SplitBrief>` 40/60 avec Prochaine action, État Ma Marque (si fondations < 14)
- `<DemarrerCard>` (visible 7 premiers jours, anti-friction Apple : pas de bouton ignorer)

Le pilote est désormais "à la maison" — c'est le point d'ancrage tranquille du produit.

### Étape 6 — Chemin alternatif : wizard guidé /ma-marque (Sprint 37.C F18)

Indépendamment du flux onboarding initial décrit ci-dessus, le pilote peut depuis `/ma-marque` lancer un **deuxième wizard 14 étapes** (`app/_actions/brand-onboarding.ts`, table `brand_onboarding_sessions`, sheet pilotée par `<BrandOnboardingTrigger>` / `<BrandOnboardingHeaderCta>`). Ce wizard est UN chemin parmi d'autres, pas LE chemin nominal. Il crée une session reprise-able, persiste les réponses dans `brand_onboarding_sessions.responses` JSONB, et à completion **mappe seulement 3 colonnes** vers `brands` (`brand-onboarding.ts:197-220` : nom, piliers_narratifs, ton). Audience/cible/etc. restent stockées dans le JSONB session sans backfill — c'est une promesse non tenue de Sprint 37.E F59.

---

## Axe 1 — Hiroshi (UI)

### Observations

1. `/login` (`app/(auth)/login/page.tsx:1-99`) n'utilise PAS la palette v60. Aucun halo, fond plat `var(--color-background)`, pas de glass, copy froide ("Connexion" en H1, "Adresse email" en label). Comparé au reste de l'app (halos partout, glass-regular sur les blocs, accent `#007AFF`), c'est un trou stylistique fort à l'entrée.
2. `/onboarding/analyse-marque` (`app/(onboarding)/onboarding/analyse-marque/page.tsx:6-30`) rend 5 halos (`bg-halo-1` à `bg-halo-5`) — `/aujourd-hui` (`page.tsx:192-197`) en rend 6 (`bg-halo-1` à `bg-halo-6`). Densité incohérente d'une étape à l'autre.
3. `ConseillerIntro.tsx:143` utilise littéralement `rgba(31, 73, 55, 0.45)` (forest green déprécié 6 mai 2026) pour l'illustration "plan" écran 3. Le commentaire en haut du fichier mentionne "palette crème" mais l'implé tape le vieux vert directement.
4. `ConseillerIntro.tsx:79` et `:99` utilisent l'accent `#007AFF` en dur (au lieu de `var(--color-accent)`) — couleur juste, mais hardcoded, pas tokenisé.
5. Le `<PageHeader>` (avatar UserMenu + breadcrumb) est **absent** de l'onboarding et de la ConseillerIntro. Le pilote ne peut pas accéder à son menu (Mon Programme, Ma Marque, Mes Outils) pendant les 5-7 min d'onboarding. C'est volontaire (focus) mais à l'arrivée `/aujourd-hui`, le PageHeader réapparaît brusquement avec son avatar/breadcrumb : pas de continuité visuelle.
6. Les boutons "retour"/"suivant"/"terminer" (`OnboardingFlow.tsx:296-300`) sont en minuscules — cohérent avec doctrine "Conseiller minuscule" élargie aux CTA. Bien.
7. La largeur 560px de la colonne onboarding (`OnboardingFlow.tsx:251`) ne correspond pas au `cfs-page-container` 1200px de `/aujourd-hui` — saut visuel à l'arrivée.
8. L'écran "Nous préparons ton programme" (`OnboardingFlow.tsx:212-242`) utilise un halo `bg-halo-pulse` qui n'apparaît pas dans la liste des halos statiques v60. Si la doctrine dit "Halos statiques", ce halo pulsé est un anti-pattern doctrinal.

### Verdict : **Recalé**

### Justification

Cinq divergences UI sur un parcours qui doit être un crescendo : (a) `/login` non aligné palette v60, (b) forest green déprécié dans ConseillerIntro, (c) halo pulsant en contradiction avec "halos statiques", (d) densité halos variable (5 / 6), (e) saut visuel 560 → 1200px container à l'arrivée. Un pilote qui découvre Creative Fair pour la première fois traverse au moins trois esthétiques différentes en 5 minutes.

### Recommandations

- **P0** : Supprimer `rgba(31, 73, 55, …)` de `ConseillerIntro.tsx:143` et remplacer par un tint accent ou un gris neutre (séparateur déjà utilisé sur les autres cellules).
- **P0** : Remplacer le halo `bg-halo-pulse` dans `OnboardingFlow.tsx:227` par un halo statique (`bg-halo-1`) ou un état purement typographique. Aligner la doctrine.
- **P1** : Réécrire `/login` avec la palette v60 — halos en fond, glass-regular sur le card, font-system, accent `#007AFF`. C'est la première impression Floriane.
- **P1** : Unifier le nombre de halos (probablement 6 partout) et tokeniser leur densité.
- **P2** : Tokeniser les `#007AFF` hardcodés de `ConseillerIntro.tsx` en `var(--color-accent)`.

---

## Axe 2 — Elena (Archi)

### Observations

1. **Auth via magic link uniquement** (`app/(auth)/login/actions.ts` non lu, mais inféré du shape Supabase Auth standard). Pas de signup distinct — l'utilisateur arrive directement loggué. Élégant côté techno, mais demande un OTP relay mail qui peut prendre 30s+ et la doctrine ne mentionne pas la latence Supabase Auth.
2. La route `POST /api/onboarding/complete` (`app/api/onboarding/complete/route.ts:98-263`) fait **plus que de valider** — elle orchestre 4 étapes critiques (auth check + ensureProfile + upsert brand + génération programme). C'est un endpoint REST faisant office de saga sans transaction. Un échec sur la génération laisse une `brand` créée + un `profile` provisionné mais pas de programme : l'utilisateur revient à `/aujourd-hui`, voit son brand_book_status complete, ne voit aucun programme actif. Pas d'atomicité.
3. La route mélange `createClient()` (RLS user) et `createAdmin()` (bypass RLS) — chaque update brand passe par admin alors que l'auth user est déjà identifié. Aucune raison documentée d'utiliser admin pour `update brands where id = X`. Le commentaire ligne 130 dit "bypass RLS pour init brand_book_status" mais brand_book_status devrait être writeable par owner.
4. Le typage est volontairement "lâche" via casts (`adminBrands = admin as unknown as { … }` ligne 133). Indispensable parce que `types/database.ts` est minimaliste, mais c'est de la dette technique cachée.
5. **Pas de prompt caching** identifiable côté `generateProgrammeInitial` (non lu mais important — la route doit invoquer Sonnet/Opus). À vérifier dans `lib/programme/generation.ts`.
6. La cascade redirect après auth : `/login` → callback Supabase → `/aujourd-hui` (qui redirect → `/onboarding/analyse-marque` si pas de brand) → POST → `/aujourd-hui` (qui ne redirect plus). C'est **3 sauts** dans le pire cas (`/aujourd-hui` → onboarding → `/aujourd-hui`). Frôle la limite "pas de cascade > 2 sauts" sans la violer si on ne compte que les redirects HTTP (pas les transitions client).
7. RLS multi-tenant : l'`ensureProfile()` est appelé proactivement (`route.ts:121-127`), donc le tenant est garanti existant avant l'upsert `brands`. Bien. Pas de fuite cross-tenant identifiée à ce stade.
8. `app/_actions/brand-onboarding.ts` (wizard alternatif) utilise systématiquement `createAdmin()` pour lire/écrire `brand_onboarding_sessions` (lignes 86, 113, 142, 186, 240). RLS contourné en lecture — la fonction valide manuellement `tenant_id` (cf. `.eq('tenant_id', ctx.tenantId)` ligne 119). C'est correct fonctionnellement mais fragile : si quelqu'un oublie le filtre, fuite cross-tenant immédiate. Préférer le client RLS-aware partout sauf cas démontré.
9. La table `brand_onboarding_sessions` stocke les réponses dans JSONB sans backfill complet vers `brands` à la completion (`brand-onboarding.ts:197-220` ne mappe que 3 colonnes — nom, piliers, ton). Audience / cible / canaux / objectifs / etc. restent prisonniers du JSONB session. Promesse non tenue.

### Verdict : **Recalé**

### Justification

L'orchestration "saga sans transaction" sur `/api/onboarding/complete` peut laisser le pilote dans un état zombi (brand créée, pas de programme). L'usage systématique de `admin` au lieu du client RLS n'est pas justifié et masque un défaut potentiel de policies. Le wizard `brand_onboarding` ne backfile pas les colonnes promises Sprint 37.E F59.

### Recommandations

- **P0** : Wrapper l'upsert brand + génération programme dans une transaction PG (ou un rollback explicite — supprimer la brand si la génération échoue). Sinon afficher un état "ton brand est posée, mais la génération a échoué, [Réessayer]" plutôt qu'un toast d'erreur générique.
- **P0** : Vérifier que `generateProgrammeInitial` applique le prompt caching (`cache_control: { type: 'ephemeral' }` sur le system prompt). Sans cache, chaque onboarding coûte plein pot.
- **P1** : Compléter le mapping wizard 14 étapes → colonnes `brands` (`completeBrandOnboarding`) — audience, canaux, objectifs au minimum.
- **P1** : Remplacer `createAdmin()` par `createClient()` partout où le user est déjà identifié, avec RLS.
- **P2** : Documenter dans une ADR pourquoi `auth.users` est créé via magic link (pas de signup distinct) — c'est un choix doctrinal Floriane qui mérite trace.

---

## Axe 3 — Sarah (Copy)

### Observations

1. `/login` (`app/(auth)/login/page.tsx:33-40`) — **vouvoiement** : "Lien envoyé. Vérifiez votre boîte mail." / "Le lien expire dans 1 heure. Pensez à vérifier vos spams." Tutoiement absent. Doctrine V60 explicite : tutoiement systématique. **Violation directe.**
2. `/login:50-52` — message d'erreur "Votre compte n'est pas encore activé. Contactez votre administrateur." → vouvoiement + "votre compte" + ton corporate. À refondre.
3. `/login:62` — label "Adresse email" en français correct, mais ailleurs dans l'app on dit "ton mail". Incohérent.
4. `/login:92` — bouton "Recevoir mon lien de connexion" — capitalisée. Le reste de l'app utilise des CTA minuscules.
5. `OnboardingFlow.tsx:47-78` — tutoiement présent, ton Floriane juste, placeholders bien tournés ("Joaillerie contemporaine, café de spécialité, hôtellerie haut de gamme…"). Bien.
6. `OnboardingFlow.tsx:87-88` — "Tu pilotes une marque (responsable comm, freelance) ou c'est la tienne (fondateur·rice) ?" → tutoiement + précis. Bien.
7. `ConseillerIntro.tsx:31` — "Voici ton conseiller." → minuscule respectée. Bien.
8. `ConseillerIntro.tsx:159, 173` — push `/aujourd-hui`. Le pilote arrive sur un écran qui dit "Aujourd'hui" en H1 — la chute narrative est cohérente.
9. `OnboardingFlow.tsx:232` "Nous préparons ton programme." → pluriel collectif "Nous". Doctrine Floriane préférerait "Creative Fair prépare ton programme" ou "On prépare ton programme" — débatable.
10. `/aujourd-hui:282` "Préparer le post de {heure}" → tutoiement implicite via "Préparer" (impératif neutre). OK.
11. `BrandOnboardingHeaderCta.tsx:43` — "Lancer un onboarding guidé →" — **le mot "onboarding" en UI est interdit**. Doctrine 12 mai 2026 explicite. Violation.
12. `OnboardingFlow.tsx:155` — variable `pilot_role` dans le payload. Pas visible UI, mais "pilot_role" / "pilots" / "owns" en valeur. OK côté wire.

### Verdict : **Recalé**

### Justification

`/login` est globalement en vouvoiement + ton corporate, en rupture totale avec le tutoiement Floriane du reste de l'app. Le mot "onboarding" apparaît littéralement dans `BrandOnboardingHeaderCta` (label CTA visible sur `/ma-marque`). Deux violations P0 sur la copy.

### Recommandations

- **P0** : Refondre `/login` en tutoiement. "Lien envoyé. Vérifie ta boîte mail. Il expire dans 1 heure — pense aux spams." / "Ton compte n'est pas encore activé. Demande l'accès à ton admin." / "Reçois ton lien".
- **P0** : Renommer le CTA `BrandOnboardingHeaderCta` — "Reprendre l'analyse de ma marque →" / "Affiner ma marque avec le conseiller →". Bannir "onboarding" en UI.
- **P1** : Remplacer "Nous préparons ton programme" par "Creative Fair prépare ton programme." (ou simplement "Ton programme arrive.").
- **P2** : Uniformiser les CTA en minuscules sur `/login` ("reçois mon lien").

---

## Axe 4 — Marcus (Workflow)

### Observations

1. **Friction quantifiée du parcours nominal** :
   - 1 champ email + 1 clic CTA sur `/login`
   - 1 ouverture de mail + 1 clic magic link
   - 6 étapes onboarding × ~2 saisies = 6 inputs + 6 clics "suivant"
   - 1 attente génération (probablement 10-30s)
   - 3 écrans ConseillerIntro × 1 clic = 3 clics (ou 1 si skip immédiat)
   - **Total : ~14 clics, 6 inputs textuels, 2 choix radio, 1 attente longue.**
2. Le **skip** est disponible dès écran 1 de ConseillerIntro (`ConseillerIntro.tsx:243-260`), pas seulement à la fin. Bien — anti-friction.
3. Aucune barre de progression sur la génération du programme — juste une string statique "Nous préparons ton programme." Le pilote ne sait pas si ça prend 5s ou 60s. Pas de fallback si timeout.
4. Pas de "retour" possible une fois `submit()` lancé (`OnboardingFlow.tsx:185-206`). Le statut bascule en `submitting` puis `intro` ou `error` — la state machine ne ramène jamais sur les questions. En cas d'erreur, le pilote voit le message rouge SOUS les questions, peut cliquer "terminer" pour réessayer (`status` revient à `editing` implicitement ? non, il reste à `error`). À vérifier : le code n'a pas de reset explicite de `status` quand l'utilisateur modifie une réponse. **Dead-end potentiel** si l'erreur est non-récupérable.
5. `OnboardingFlow.tsx:172-183` : la `goBack` ne réinitialise pas `error`. Si le pilote voit une erreur 502, clique "retour", l'erreur reste affichée. Anti-pattern.
6. Le chemin alternatif `BrandOnboardingHeaderCta` propose un **second wizard 14 étapes** sur `/ma-marque`. Si le pilote vient de finir le wizard onboarding 6 étapes, il atterrit sur `/aujourd-hui`, voit `JalonHero` ou la `DemarrerCard` qui le pousse vers `/ma-marque`, où il découvre encore un bouton "Lancer un onboarding guidé". **Boucle cognitive** : "je viens de répondre à 6 questions, qu'est-ce qu'on me redemande ?" — Marcus se gratte la tête.
7. `OnboardingFlow.tsx:159-162` : `canContinue` empêche d'avancer sans réponse. Bien. Mais aucun message explique pourquoi le bouton "suivant" est disabled — c'est juste opaque.
8. Pas de "résumé" final avant submit. Le pilote ne revoit pas ses 6 réponses, ne peut pas relire/corriger d'un seul écran. Anti-pattern wizard standard (genre Apple Health onboarding récap).
9. ConseillerIntro propose en écran 3 deux destinations : `/programme?action=create-plan` (créer le plan tout de suite) ou `/aujourd-hui` (plus tard). Le pilote vient de générer un programme initial à l'étape 3 — pourquoi lui proposer de créer un autre plan ? Confusion entre "programme initial auto-généré" et "plan éditorial 3 mois manuel".

### Verdict : **Recalé partiel**

### Justification

Friction acceptable sur le parcours nominal (14 clics, ~5 min — Floriane peut le faire en pause café). Mais 3 problèmes UX réels : (a) dead-end potentiel sur erreur 502, (b) confusion "programme initial auto" vs "plan à créer" à l'écran 3 de ConseillerIntro, (c) chemin alternatif `/ma-marque` qui propose un second wizard sans expliquer la relation avec le premier.

### Recommandations

- **P0** : Réinitialiser `error = null` dans `goBack` et dans `updateText`/`updateChoice` (`OnboardingFlow.tsx`). Toute action utilisateur doit clear l'erreur précédente.
- **P0** : Ajouter un état de récupération sur l'erreur 502 : "Erreur de génération. [Réessayer]" avec relancement de `submit()`.
- **P1** : Reformuler le screen 3 de ConseillerIntro pour distinguer "voir le programme que Creative Fair t'a préparé" vs "créer un plan éditorial 3 mois". Sinon le pilote ne comprend pas qu'il a déjà un programme.
- **P1** : Désambiguïser le second wizard `/ma-marque` — soit le supprimer (le wizard 6 questions est l'onboarding canonique), soit le renommer "Compléter ta marque" pour signaler la différence.
- **P2** : Ajouter un écran récap (étape 7) qui montre les 6 réponses avant submit, avec bouton "Modifier" sur chaque ligne.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations

1. **Persona Floriane** : "tableau de bord simple et efficace, contrôle, pilote". Le parcours actuel ne contredit pas — 6 questions claires, copy au tutoiement (sauf `/login`), pas de surcharge cognitive. Mais **`/login` parle à un user corporate vouvoyé**, pas à Floriane. Première impression hors persona.
2. **Le pilote pilote-t-il ?** À la sortie du wizard, le programme initial est généré sans qu'il ait pu en voir la composition. Le pilote a répondu à 6 questions et a reçu un programme tout fait. C'est l'inverse de "pilote" — c'est "client à qui on livre". Tension doctrinale.
3. **6 promesses CF** : sans la liste exacte sous les yeux, je note que le parcours respecte au moins (a) la tranquillité (pas de gamification, pas de "5 étapes restantes !"), (b) la signature visuelle (sauf forest green/halo pulse), (c) le tutoiement (sauf `/login` + "onboarding" UI). À pondérer.
4. **Anti-gamification** : zéro compteur, zéro "streak", zéro "level up". Bien respecté. La `OnboardingProgress` (1/6 → 6/6) est un compteur fonctionnel, pas gamifié.
5. **"Onboarding" en UI** : le mot apparaît dans `BrandOnboardingHeaderCta` (label cliquable) et dans le code de chemin `/onboarding/analyse-marque` (URL visible). L'URL est moins critique (la doctrine n'interdit pas le slug), mais le label cliquable est une violation directe.
6. **Cascade des chemins de saisie** : 6 questions initiales (`OnboardingFlow`) + 14 étapes wizard alternatif (`brand-onboarding`) + édition page native `/ma-marque`. Trois chemins parallèles pour saisir la même information. Doctrine "il y a UN bon chemin" non respectée.
7. La copy "Nous préparons ton programme" est dans la voix Creative Fair, pas Floriane. Cohérent avec le ton "Creative Fair propose, tu décides" de ConseillerIntro screen 2.
8. **Continuité narrative** : `/login` (corporate) → onboarding (Floriane tutoyée) → ConseillerIntro (Floriane tutoyée) → `/aujourd-hui` (Floriane tutoyée). Le premier maillon brise la continuité.

### Verdict : **Recalé partiel**

### Justification

Le cœur du parcours (étapes 2-5) respecte la doctrine Floriane et la tranquillité narrative. Mais trois failles : (a) `/login` parle corporate, pas Floriane, (b) le pilote ne pilote pas vraiment — il reçoit un programme tout fait, (c) trois chemins parallèles de saisie de la marque (wizard 6Q, wizard 14Q, édition native) sans hiérarchie claire.

### Recommandations

- **P0** : Tutoyer `/login` (cf. axe Sarah).
- **P1** : Ajouter un écran "Voici ton programme" entre la génération et `/aujourd-hui`, montrant les 12 premiers posts générés. Le pilote VOIT ce qu'on lui a préparé avant d'arriver à `/aujourd-hui`. Sinon il découvre son programme par hasard via `/programme`.
- **P1** : Décider du chemin canonique de saisie marque (probablement le wizard 6Q + édition `/ma-marque`), et supprimer ou réorienter le wizard 14Q `brand-onboarding` (Sprint 37.C F18 — peut-être plus utile que doctrinal).
- **P2** : Documenter la doctrine onboarding dans une ADR — pourquoi 6 questions, pourquoi pas 4, pourquoi pas 14.

---

## Synthèse du workflow

### Verdicts cumulés

| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé |
| Elena Archi | ❌ Recalé |
| Sarah Copy | ❌ Recalé |
| Marcus Workflow | ⚠️ Recalé partiel |
| Hélène Doctrine | ⚠️ Recalé partiel |

### Top fixes priorisés

- **P0** : Tutoyer `/login` (axes Sarah + Hélène) — première impression Floriane.
- **P0** : Renommer le CTA `BrandOnboardingHeaderCta` pour bannir le mot "onboarding" en UI.
- **P0** : Supprimer le forest green `rgba(31, 73, 55, …)` de `ConseillerIntro.tsx:143`.
- **P0** : Wrapper l'upsert brand + génération programme dans une transaction (ou rollback explicite).
- **P0** : Réinitialiser l'état d'erreur sur toute interaction utilisateur (`OnboardingFlow.tsx`).
- **P1** : Refondre `/login` en palette v60 (halos, glass, accent).
- **P1** : Décider du chemin canonique de saisie marque, supprimer ou réorienter les chemins parallèles.
- **P1** : Ajouter un écran "Voici ton programme" entre génération et `/aujourd-hui`.
- **P2** : Écran récap avant submit (les 6 réponses relisibles).
- **P2** : Tokeniser les `#007AFF` hardcodés en `var(--color-accent)`.

### Verdict global workflow

**Recalé**

### Friction quantifiée

- Nombre de clics du début à la fin : **~14** (1 login + 6 suivants + 3 clics ConseillerIntro skippables + 4 clics de transition)
- Nombre de champs obligatoires : **6** (nom, secteur, ton, singularité, persona, fréquence)
- Nombre de redirections : **3** (login → callback → /aujourd-hui → /onboarding/analyse-marque, puis /aujourd-hui via ConseillerIntro)
- Latence LLM estimée : **10-30s** sur `generateProgrammeInitial` (Sonnet ou Opus + génération de 6-12 posts probablement)
- Temps total estimé Floriane : **4-6 minutes** (sans relire les magic links, avec ConseillerIntro non skippé)

### Anti-patterns détectés (cross-pages)

1. **Saga sans transaction** : `/api/onboarding/complete` orchestre 4 étapes critiques (provisioning + brand + génération) sans rollback. État zombi possible.
2. **Trois chemins parallèles** pour saisir la marque (wizard 6Q canonique, wizard 14Q alternatif, édition native `/ma-marque`). Doctrine "un seul bon chemin" violée.
3. **Trou stylistique sur `/login`** : palette/voix/ton totalement différents du reste de l'app. Première impression hors-marque.
4. **Dead-end potentiel sur erreur 502** : pas de réessai, pas de reset d'état.
5. **Forest green déprécié** présent dans la production (`ConseillerIntro.tsx:143`, plus 3 occurrences dans `app/globals.css`). Le commentaire dit "remplacé" mais les rgba(31,73,55) n'ont jamais été supprimés.
6. **Sauts de container width** : 560px (onboarding) → 1200px (`/aujourd-hui`) à l'arrivée. Saut visuel à l'écran final du parcours.
7. **Programme livré, pas montré** : la génération produit un programme que le pilote ne voit qu'en visitant `/programme`. Aucun "voici ce que je t'ai préparé" entre étapes 3 et 5.
