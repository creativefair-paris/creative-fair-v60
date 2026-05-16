# Page : /aujourd-hui

## Métadonnées
- Route : `/aujourd-hui`
- Fichier source : `app/(aujourd-hui)/aujourd-hui/page.tsx`
- Composants principaux :
  - `<PageHeader>` (`components/layout/PageHeader.tsx`) — H1 + sous-titre
  - `<CriticalBanner>` (`components/today/CriticalBanner.tsx`) — Zone Critique full-width
  - `<SplitBrief>` (`components/layouts/SplitBrief.tsx`) — layout 40/60
  - `<DemarrerCard>` (`components/today/DemarrerCard.tsx`) — onboarding J0-J7
  - `<TaskRow>` (`components/today/TaskRow.tsx`) — ligne de post type Things 3
  - `<BlocCetteSemaine>` (`components/today/BlocCetteSemaine.tsx`) — section pliable
  - `<AFaireCetteSemaine>` (`components/today/AFaireCetteSemaine.tsx`) — suggestions dynamiques
  - `<JalonHero>` (`components/jalons/JalonHero.tsx`) — hero conditionnel
- Loader serveur : `lib/aujourd-hui/load-data.ts` + `lib/aujourd-hui/suggestions.ts` + `lib/aujourd-hui/dates-fr.ts`
- Server / Client : Page = Server Component (`export const dynamic = 'force-dynamic'`). `<TaskRow>`, `<BlocCetteSemaine>` = `'use client'`. Pas d'appel API client direct — toute la donnée est chargée serveur-side.
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise).

## Lecture rapide
Page d'atterrissage du pilote, conçue Sprint 36.G sous doctrine "Tranquillité du pilote". Header full-width, zone Critique conditionnelle, puis Split Brief 40/60 : à gauche le contexte (Prochaine action, État programme, État marque, Calendrier business), à droite l'exécution (Aujourd'hui, Cette semaine, À faire cette semaine). Pas de compteur gamifié, pas de jauge, pas de "il te reste N gestes". Si jalon < production, un `<JalonHero>` remplace le Split Brief.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. Palette v60 respectée : `background: 'var(--color-background)'` (qui résout `#FBFAF7` cf. `app/globals.css:13`) — `app/(aujourd-hui)/aujourd-hui/page.tsx:190`.
2. Aucune occurrence de `#1F4937` dans la page ni ses composants ; cohérent avec dépréciation 6 mai 2026.
3. Halos statiques (six div `bg-halo bg-halo-1..6`, `aria-hidden="true"`) — `app/(aujourd-hui)/aujourd-hui/page.tsx:192-197`. Conforme à la règle "halos statiques uniquement". Aucune animation détectée.
4. Liquid Glass à 2 niveaux comme prévu : `glass-regular` (Bloc Prochaine action, ligne 248) ; `glass-thin` (Programme, Ma Marque, Calendrier Business, lignes 346/398/451). Bonne hiérarchie z1/z2.
5. Espacements respectent la grille 4/8/12/16/24 : `gap: 20`, `gap: 24`, `gap: 28`, `gap: 8`, `padding '20px 22px'`, `padding '14px 18px'`. Le `gap: 28` colonne droite (ligne 505) sort légèrement de la grille canonique 4/8/12/16/24/32 — soit 28 est tolérable mais non doctrinaire.
6. Police SF Pro via `var(--font-system)` partout — pas de fallback dur. Bon.
7. Bleu `#007AFF` réservé aux 3 CTA canoniques (Voir Mon Programme, Compléter Ma Marque, Compléter mon Calendrier, lignes 385, 436, 493). Le bouton "Affiner avec le Conseiller" en `TaskRow.tsx:168` est aussi `#007AFF` — quatrième occurrence, à vérifier vs la limite "3 CTA canoniques" évoquée Sprint 36.H Finding 9e (`components/today/BlocCetteSemaine.tsx:161-163`).
8. Couleurs en dur : `#1C1C1E` (label), `rgba(0,0,0,0.55)` (secondary), `#FFFFFF` (bouton) — répétés dans la page (ex. lignes 277, 289, 316). Devraient passer par `var(--color-label)` / `var(--color-secondary-label)` qui existent (`app/globals.css:16-17`). `<DemarrerCard>` utilise correctement les tokens (`components/today/DemarrerCard.tsx:102, 112`) — bonne référence. Le reste de la page mélange `#1C1C1E` et tokens.
9. Pas de gamification visuelle : aucune barre de progression, aucun pourcentage, aucun "x/14" coloré. Le compteur "14 fondations · N posées" (ligne 428) est en typographie sobre, conforme.
10. Touch target du bouton "Reprendre/Voir/Commencer" : padding `10px 20px`, fontSize 14, soit ~38px de hauteur (`page.tsx:313`). En dessous des 44px iOS HIG. Recalé.
11. Touch target du lien latent "Affiner avec le Conseiller" : padding `4px 6px` (`components/today/TaskRow.tsx:170`). Très en dessous de 44px. Opacity 0.4 au repos → faible affordance + faible accessibilité.
12. Empty state Bloc A bien unifié : phrase narrative `todayEmptyMessage` ("Pas de post aujourd'hui. Ton premier post arrive vendredi.") — ligne 76-78. Bon.
13. `aria-hidden`/`aria-label`/`aria-expanded` correctement utilisés (PageHeader, halos, button collapsible) — `components/today/BlocCetteSemaine.tsx:68-69`.
14. Card "À faire cette semaine" : `backdrop-filter: blur(10px) saturate(160%)` — `components/today/AFaireCetteSemaine.tsx:68-69`. OK Liquid Glass.
15. `<CriticalBanner>` utilise `#D70015` / `#FF9500` — alertes système iOS standards, OK.
16. PageHeader montre l'avatar à droite (commentaire ligne 12) — comportement à valider via screenshot, code non lu en détail.

### Verdict : **Recalé partiel**

### Justification
Palette respectée, halos statiques OK, Liquid Glass propre, zéro forest green. Mais trois écarts UI : (a) mélange `#1C1C1E`/tokens là où `var(--color-label)` existe et est utilisé par `<DemarrerCard>` ; (b) touch targets sous 44px sur le bouton "Reprendre" et sur le lien "Affiner avec le Conseiller" ; (c) `gap: 28` hors grille 4/8/12/16/24/32.

### Recommandations
- **P0** : Porter le bouton "Reprendre/Voir/Commencer" à `padding: '12px 24px'` minimum (44px touch target iOS HIG) — `app/(aujourd-hui)/aujourd-hui/page.tsx:313`.
- **P1** : Remplacer `#1C1C1E` par `var(--color-label)` et `rgba(0,0,0,0.55)` par `var(--color-secondary-label)` dans toute la page et `TaskRow.tsx`, `BlocCetteSemaine.tsx`, `CriticalBanner.tsx`.
- **P1** : Augmenter `padding` du lien "Affiner avec le Conseiller" à `8px 12px` minimum + opacité 0.6 au repos pour assurer affordance et touch target — `components/today/TaskRow.tsx:170-172`.
- **P2** : Aligner `gap: 28` colonne droite sur `24` ou `32` (grille canonique) — `page.tsx:505`.
- **P2** : Auditer si le bleu `#007AFF` du lien "Affiner avec le Conseiller" est cohérent avec la règle Sprint 36.H Finding 9e "bleu accent réservé aux 3 CTA canoniques" (cf. `BlocCetteSemaine.tsx:161-163` qui passe son CTA en gris pour cette raison).

---

## Axe 2 — Elena (Archi)

### Observations
1. Séparation Server/Client propre : `page.tsx` = Server Component asynchrone (`export default async function`, ligne 35) ; les composants interactifs (`TaskRow`, `BlocCetteSemaine`) sont marqués `'use client'`.
2. Pas de Server Action mutante sur cette page — c'est de la lecture pure. `catchUpOverduePosts()` (`lib/aujourd-hui/load-data.ts:83`) est appelé en amont du SELECT — mutation idempotente, OK.
3. RLS `tenant_id` : `loadAujourdhuiData` filtre par `brand.id` issu du tenant (`load-data.ts:74`), donc dépend de la RLS. Mais sur les requêtes Supabase de `page.tsx` (lignes 86-149) : `profiles`, `programmes`, `brands`, `tenants` sont requêtés sans filtre `tenant_id` explicite — repose entièrement sur la RLS. Acceptable si RLS bien configurée, à vérifier côté schéma.
4. Doublon de schéma probable : la page utilise `brand.business_calendar` (JSONB sur `brands`) ligne 113-117. À mettre en regard de la table `calendrier_business` (à vérifier dans le schéma). Si les deux coexistent → drift architectural.
5. Hooks dans Server : aucun `useState`/`useEffect` dans `page.tsx`. Bon.
6. La page enchaîne 5 requêtes Supabase séquentielles dans le rendu (`load-data` + `profiles`/`programmes`/`brands`/`tenants` + `checkJalonStatus`). Pas de `Promise.all`. Latence cumulée probable. Pas bloquant pour un MVP mais P2 perf.
7. Typage : casts manuels `as { tenant_id?: string | null } | null` (lignes 90, 105, 117, 148) — symptôme du typage Supabase faible. Acceptable mais à terme via types générés.
8. Le redirect `if (!data.authenticated)` (ligne 37) → guard côté serveur, OK.
9. Garde TS double : `if (!('postsToday' in data))` ligne 39 — pattern peu lisible mais fonctionnel.
10. `lib/aujourd-hui/load-data.ts:62-72` : filet `ensureProfile` post-création de compte — robustesse OK.
11. La gestion des dates utilise `new Date(data.todayISO)` (ligne 42), `now.getHours()` etc. → dépendant du fuseau du serveur. Risque sur Vercel UTC vs Paris CET/CEST. Devrait être ancré sur Europe/Paris explicitement.
12. `computeSuggestions` (lib/aujourd-hui/suggestions.ts) est pur et testable, bonne séparation.

### Verdict : **Recalé partiel**

### Justification
Séparation Server/Client propre, Server Component bien architecturé. Mais 5 requêtes Supabase sérialisées dans le rendu (perf), pas de `Promise.all`, dépendance au fuseau du serveur pour le calcul lundi-matin/vendredi-soir, et un doublon probable `brand.business_calendar` JSONB vs table dédiée à confirmer.

### Recommandations
- **P0** : Forcer Europe/Paris dans le calcul `dayOfWeek`/`hour` (lignes 42-46) via `Intl.DateTimeFormat` ou `date-fns-tz` — sinon comportement "Lundi avant midi" cassé sur Vercel.
- **P1** : Paralléliser les 5 requêtes Supabase via `Promise.all` (profiles, programmes, brands, tenants, jalons) — gain de latence direct.
- **P1** : Trancher entre `brand.business_calendar` (JSONB) et une table dédiée. Si table existe : migrer. Si pas : documenter pourquoi JSONB.
- **P2** : Générer les types Supabase pour éliminer les casts manuels `as { … } | null`.
- **P2** : Extraire les 4 sous-requêtes Supabase (jalons, programme actif, calendar, tenant créé) dans `lib/aujourd-hui/load-data.ts` pour ne garder dans `page.tsx` que la composition.

---

## Axe 3 — Sarah (Copy)

### Observations
1. Tutoiement systématique : "Ton premier post arrive vendredi" (`page.tsx:77`), "Compléter Ma Marque" (ligne 441), "Ton plan actuel se termine dans N jours" (`lib/aujourd-hui/suggestions.ts:53`). OK.
2. Possessifs nav respectés : "Mon Programme" (lignes 380, 391), "Ma Marque" (lignes 418, 441), "Mon Calendrier" (ligne 499). Bon.
3. "Conseiller" minuscule en UI : "Affiner avec le Conseiller" → MAJUSCULE en `TaskRow.tsx:176`. **Recalé doctrine** : la spec demande minuscule. Idem dans `<DemarrerCard>` : "Pose une question au conseiller" (`page.tsx:181`) → minuscule OK.
4. Vocabulaire interdit : aucun "users", "dashboard", "tableau de bord", "workflow", "viral", "boost", "engagement", "streak", "level up", "métrique", "KPI", "stats", "analytics" trouvé via grep.
5. Le mot "fondations" (lignes 165, 428) est doctrinalement chargé positivement (CF parle de "14 fondations") — OK.
6. "Préparer le post de 9h" / "Prêt à publier · 11h" / "Publié à 14h" (`components/today/TaskRow.tsx:38-44`) : ton sec et descriptif, conforme. Pas de "🚀 C'est parti !".
7. "Rien à préparer aujourd'hui." (`page.tsx:78`) — empty state Floriane, ton calme, OK.
8. "Préparer ton prochain plan" / "Compléter Ma Marque" / "Préparer le week-end" (`lib/aujourd-hui/suggestions.ts:51-83`) — titres en infinitif neutre, OK.
9. "Démarrer cette semaine" (`DemarrerCard.tsx:48`) — neutre, OK.
10. "À faire cette semaine" (`AFaireCetteSemaine.tsx:44`) — copy validée Sarah salve 4 selon le commentaire L3.
11. "Publication échouée · Action requise" (`TaskRow.tsx:133`) — clinique, OK.
12. "Reporté de N jours" (label italique, `TaskRow.tsx:146`) — neutre OK.
13. `CriticalBanner` : "N autre signal" / "N autres signaux actifs" (ligne 77) — vocabulaire CF (signaux) parfaitement aligné Sprint 36.G.

### Verdict : **Recalé partiel**

### Justification
Tutoiement et possessifs nav OK, vocabulaire interdit absent, ton Floriane bien tenu. Mais "Affiner avec le Conseiller" en majuscule contredit la règle "conseiller minuscule en UI" — incohérent avec "Pose une question au conseiller" minuscule juste à côté.

### Recommandations
- **P0** : "Affiner avec le Conseiller" → "Affiner avec le conseiller" — `components/today/TaskRow.tsx:176` + `aria-label` ligne 163.
- **P2** : Harmoniser "Conseiller" minuscule partout dans l'app (audit cross-files à mener par Sarah).

---

## Axe 4 — Marcus (Workflow)

### Observations
1. Loading state : page = Server Component, donc Next.js `loading.tsx` au niveau du segment. Pas vérifié ici, à confirmer côté `app/(aujourd-hui)/loading.tsx` (absent du listing — `ls` ne montre que `page.tsx`). **Pas de `loading.tsx` détecté** → spinner par défaut, friction.
2. Error state : pas de `error.tsx` non plus dans le segment listé. Si Supabase tombe → erreur Next opaque.
3. Navigation prévisible : tous les liens utilisent `<Link>` (`page.tsx:307`, 379, 430, 487, etc.) — OK SPA navigation.
4. Friction minimale : pas de modale d'introduction (DemarrerCard disparaît auto au J8, pas de bouton "Ignorer", commentaire ligne 142). Bon.
5. Confirmations destructrices : page lecture-seule, pas applicable.
6. Feedback visuel : hover sur `TaskRow` (background-color 200ms ease-out, ligne 84) ; hover card "À faire" (`AFaireCetteSemaine.tsx:104` background + translateY) ; hover lien démarrer (`DemarrerCard.tsx:125`). OK.
7. États Things 3 sur les cartes posts : `<StateCircle state={state}>` — code dans `components/ui/state-circles/StateCircle.tsx` (non lu mais référencé `TaskRow.tsx:98`). Mapping `mapStatutToState` → `todo` / `ready` / `published` / `alert` (cf. `TaskRow.tsx:38-44`). Cycle Things 3 (circle / strikethrough / checkmark) probablement OK, à confirmer côté `StateCircle.tsx`.
8. Le `<TaskRow>` entier est cliquable (`onClick router.push`, ligne 86) — bon UX. Le lien "Affiner avec le Conseiller" interne fait `stopPropagation` (ligne 161) — bonne séparation.
9. `BlocCetteSemaine` collapsible piloté `useState` (ligne 58), `initialOpen` calculé serveur — déterministe, pas de flash de contenu côté client.
10. `prefers-reduced-motion` respecté sur `<DemarrerCard>` (lignes 128-130) et `<AFaireCetteSemaine>` (lignes 108-110). Bon a11y.
11. Sur le bouton collapsible `<button>` (`BlocCetteSemaine.tsx:65`) : pas de focus visible défini (`all: 'unset'`, ligne 72) → **Recalé a11y** : `:focus` invisible.
12. Le redirect serveur si pas de tenant → `redirect('/login')` ou `/onboarding/analyse-marque` (page.tsx:37-38) — workflow d'onboarding propre.
13. Empty state Bloc B "Rien d'autre cette semaine." (`BlocCetteSemaine.tsx:149`) — OK.
14. Le JalonHero remplace le Split Brief pendant la phase d'onboarding (ligne 228-230) — bonne séparation Phase 1/Phase 2.

### Verdict : **Recalé partiel**

### Justification
Workflow tranquille, navigation propre, états Things 3, anti-friction respecté. Mais absence de `loading.tsx` et `error.tsx` au niveau du segment `(aujourd-hui)` → friction réelle dès qu'un appel Supabase est lent ou tombe. Et bouton collapsible sans focus visible → a11y dégradée.

### Recommandations
- **P0** : Créer `app/(aujourd-hui)/loading.tsx` (squelette Split Brief 40/60 avec halos) — sinon écran blanc + spinner Next sur première visite.
- **P0** : Créer `app/(aujourd-hui)/error.tsx` avec bouton "Réessayer" et lien "Retour à l'accueil".
- **P1** : Ajouter `:focus-visible` sur le `<button>` du collapsible `BlocCetteSemaine.tsx:65` (outline `2px solid #007AFF` + border-radius).
- **P2** : Vérifier que `StateCircle` couvre bien les 3 états Things 3 (cercle / strikethrough / checkmark) avec les bonnes couleurs `--status-pending` (`#007AFF`, défini `globals.css:1589`).

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. Alignement Floriane : le commentaire de tête (lignes 1-12) cite explicitement la doctrine "Tranquillité du pilote" et inscrit la page dans Sprint 36.G. Excellent ancrage.
2. Citation anchor "tableau de bord simple et efficace, contrôle, pilote" : pas de texte UI utilisant "tableau de bord" → OK règle vocabulaire interdit.
3. 6 promesses CF : la page incarne la promesse "pilote", "tranquillité", "contrôle" via le Split Brief (gauche = contexte, droite = faire). Conforme.
4. Anti-gamification : conforme. Aucun streak, aucun badge, aucun pourcentage, aucune jauge. Le "14 fondations · N posées" est un compteur informatif sobre, pas une gauge gamifiée.
5. Tranquillité : pas de pop-up, pas de notification intrusive, halos statiques, pas d'animation tonitruante. OK.
6. Phase 1 (anecdotique) / Phase 2 (programme) : le JalonHero gère la transition (`page.tsx:228`). Phase 1 = pas de programme, Phase 2 = programme actif. OK.
7. Trilogie Organique/Outreach/Libre : pas visible directement sur cette page (logique programme), n'est pas le scope.
8. Mais : **Drift doctrine connue cross-cutting** — `skills/00-CONCEPT.md`, `skills/10-SACRED.md`, `skills/01-ARCHITECTURE.md` décrivent encore l'ancien produit (forest green, nav 4 dont `/calendrier`, sans `/programme` ni `/outils`). À traiter en P0 synthèse.
9. Le bloc "Démarrer cette semaine" (lignes 161-185) est un onboarding doux Phase 1 — il pose les 3 actes fondateurs : "Vérifier ta marque", "Créer ton premier plan", "Pose une question au conseiller". Conforme à la doctrine d'amorçage CF.
10. Le commentaire ligne 10 "Pas de copy 'il te reste N gestes'. Pas de '5/14 FONDATIONS POSÉES'." témoigne d'une discipline doctrinaire rigoureuse contre la gamification.
11. Empty state narratif "Pas de post aujourd'hui. Ton premier post arrive vendredi." = posture Floriane tendre, pas de gronde.
12. Présence systématique du nom propre des objets CF ("Mon Programme", "Ma Marque", "Calendrier Business") en CTA → bonne pédagogie noms canoniques.

### Verdict : **Validé**

### Justification
La page est l'un des artefacts les plus alignés sur la doctrine "Tranquillité du pilote". Aucune gamification, vocabulaire CF, Split Brief, ton Floriane. Le seul drift doctrine repéré est cross-cutting (`skills/00-CONCEPT.md` etc.) et sera traité en synthèse — il ne pèse pas sur cette page.

### Recommandations
- **P1** : Conserver le commentaire de tête (lignes 1-12) comme référence — c'est un modèle de "doctrine en source".
- **P2** : Documenter en `CLAUDE.md` ou équivalent que cette page est la référence Apple-Cupertino de la doctrine v60.

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
  1. Créer `app/(aujourd-hui)/loading.tsx` (squelette Split Brief).
  2. Créer `app/(aujourd-hui)/error.tsx` (Réessayer + retour).
  3. Touch target bouton "Reprendre/Voir/Commencer" → `padding: '12px 24px'` minimum (`page.tsx:313`).
  4. Forcer Europe/Paris dans `dayOfWeek`/`hour` (`page.tsx:43-46`).
  5. "Affiner avec le Conseiller" → "Affiner avec le conseiller" (`TaskRow.tsx:163, 176`).
- **P1** :
  1. Remplacer `#1C1C1E`/`rgba(0,0,0,0.55)` par `var(--color-label)`/`var(--color-secondary-label)` dans toute la page et composants today.
  2. Augmenter touch target lien "Affiner" à `padding 8px 12px`, opacité 0.6 (`TaskRow.tsx:170-172`).
  3. Paralléliser les 5 requêtes Supabase du `page.tsx` via `Promise.all`.
  4. Trancher `brand.business_calendar` JSONB vs table dédiée.
  5. Ajouter `:focus-visible` sur le `<button>` collapsible (`BlocCetteSemaine.tsx:65`).
- **P2** :
  1. Aligner `gap: 28` colonne droite sur 24 ou 32 (`page.tsx:505`).
  2. Auditer cohérence du bleu `#007AFF` pour le lien Conseiller vs règle "3 CTA canoniques".
  3. Générer types Supabase pour éliminer les casts `as { … } | null`.
  4. Extraire les 4 sous-requêtes (jalons, programme, calendar, tenant) dans `lib/aujourd-hui/load-data.ts`.
  5. Vérifier StateCircle couvre bien les 3 états Things 3.
  6. Documenter `/aujourd-hui` comme référence v60 dans `CLAUDE.md`.

### Verdict global page
**Recalé partiel** — page exemplaire côté doctrine, mais 5 fix P0 (loading/error, touch target, fuseau, copy Conseiller) à régler avant d'être référence absolue.
