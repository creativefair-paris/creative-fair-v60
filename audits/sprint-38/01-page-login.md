# Page : /login

## Métadonnées
- Route : `/login`
- Fichier source : `app/(auth)/login/page.tsx` (99 lignes), `app/(auth)/login/actions.ts` (23 lignes)
- Composants principaux : Server Component direct (pas de wrapper), formulaire HTML natif, Server Action `sendMagicLink`
- Server / Client : **Server Component pur** (aucun hook React), Server Action via `action={sendMagicLink}`
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise — paradoxalement, `/login` ne l'est PAS mais reste hors capture automatisée car la page redirige post-magic-link)
- Source upstream : `app/auth/callback/route.ts` (55 lignes) consomme le code PKCE et oriente vers `/onboarding/analyse-marque` ou `/aujourd-hui`

## Lecture rapide
Page de connexion minimaliste à un seul champ email + bouton "Recevoir mon lien de connexion". Inscription implicite par magic link Supabase OTP : si le profil n'est pas pré-provisionné côté admin, l'utilisateur reçoit l'erreur `no_access`. Architecture Server Component / Server Action propre, sans état client. Le composant fait son job avec sobriété mais traîne quelques détails de copy SaaS et un manque d'identité visuelle Creative Fair (pas de halos, pas de signature).

---

## Axe 1 — Hiroshi (UI)

### Observations
1. `app/(auth)/login/page.tsx:13` — `backgroundColor: 'var(--color-background)'` : token v60 respecté, aucun hex hardcodé sur le fond.
2. `app/(auth)/login/page.tsx:19` — eyebrow "Creative Fair" : `color: 'var(--color-primary)'`, `fontFamily: 'var(--font-body)'`. Bonne tokenisation. Cependant l'utilisation de `--color-primary` sur un eyebrow (et plus bas sur le CTA `--color-primary` ligne 86) n'est pas alignée sur la palette v60 où l'accent est `#007AFF` via `--color-accent`. À vérifier dans `globals.css` : si `--color-primary === #007AFF` c'est bon, sinon drift.
3. `app/(auth)/login/page.tsx:23-29` — H1 "Connexion" en `var(--font-display)` à `text-2xl font-semibold`. Tokens OK mais l'écriture du titre est commerciale-administrative (cf. Sarah).
4. `app/(auth)/login/page.tsx:71-79` — input email : `border: '1px solid var(--color-border)'`, fond `var(--color-surface)`, radius `var(--radius)`. Tokens respectés, **AUCUN forest green détecté**.
5. `app/(auth)/login/page.tsx:84-93` — CTA : `backgroundColor: 'var(--color-primary)'`, `color: 'var(--color-primary-fg)'`, `transition-opacity hover:opacity-90`. Hover en opacity (pas de transform-scale), conforme à la grammaire Hiroshi.
6. **Aucun halo signature** sur la page. Les halos crème+lilas+rose+indigo+orange (signature v60 Sprint 37.J vue ailleurs dans `BrandOnboardingSheet`) sont absents de `/login`. La page est plate.
7. **Aucun élément Liquid Glass** (pas de `glass-regular`, pas de `backdrop-filter`). L'écran est plat.
8. Espacements : `space-y-8` (32px), `space-y-4` (16px), `space-y-1` (4px), `py-2.5` (10px), `px-3` (12px). Respect des multiples de 4. Conforme grille Hiroshi.
9. Touch target CTA : `py-2.5 px-3` + texte → hauteur ~40px. **Sous la barre 44px** stricte du touch-target minimum (Marcus Axe 4 aussi).
10. Police du bouton : `text-sm font-medium`. Le poids 500 sur un CTA primaire crème+accent est un peu mou — Hiroshi pousserait `font-semibold` (600) sur le CTA principal de connexion.
11. Tracking eyebrow `text-xs tracking-widest uppercase` : conforme au pattern eyebrow Hiroshi (`0.06em+` letter-spacing en majuscule).
12. Aucune animation de rotation/pulse, halos statiques absents. Pas de gamification visuelle. RAS.
13. Pas de logo Creative Fair. L'eyebrow texte fait office d'identité — minimaliste, mais cohérent avec un produit B2B premium 12K€ setup.

### Verdict : **Recalé**

### Justification
La page est techniquement propre (tokens partout, zero hex hardcodé), mais **elle ne signe pas Creative Fair**. Absence totale de la signature visuelle v60 : pas de halos, pas de Liquid Glass, pas de présence chromatique. Un visiteur arrive sur cette page après avoir cliqué un email de magic-link expiré ou erroné — c'est probablement la deuxième page la plus vue de l'app après `/aujourd-hui`, et c'est la première impression d'un brand manager Floriane qui revient sur l'app. Une page totalement plate sur un produit qui promet "design Hiroshi/Jony Ive niveau Apple" est un Recalé. Touch target CTA sous 44px confirme.

### Recommandations
- **P0** : Injecter au moins 2 halos signature (`.bg-halo-1`, `.bg-halo-2`) en fond statique pour habiller l'écran sans tomber dans la décoration gratuite. Pattern : cf. `app/(onboarding)/onboarding/analyse-marque/page.tsx:10-14`.
- **P0** : Passer le CTA à `py-3` (12px) minimum pour atteindre touch target 44px, ou ajouter `min-height: 44px`.
- **P1** : Envelopper le `<form>` dans un container `glass-regular` léger (radius `var(--radius-large)`, padding 24-32px) pour matérialiser la zone de connexion comme une carte Liquid Glass.
- **P1** : `font-medium` → `font-semibold` sur le CTA pour cohérence avec le poids des CTAs primaires v60 ailleurs dans l'app (cf. `Button` component).
- **P2** : Ajouter un visuel discret (mini illustration sheet/calendrier comme dans `ConseillerIntro` `Illustration kind="sheet"`) au-dessus du H1 pour signer Creative Fair sans bruit.
- **P2** : Vérifier que `var(--color-primary)` côté `globals.css` mappe bien sur `#007AFF` (accent v60). Si c'est une couleur historique forest-green-dérivée, c'est un P0 caché.

---

## Axe 2 — Elena (Archi)

### Observations
1. `app/(auth)/login/page.tsx:7` — `LoginPage` est `async`, signature Server Component Next 15 avec `searchParams: Promise<...>`. Conforme.
2. `app/(auth)/login/page.tsx:8` — `await searchParams` : pattern Next 15 correct (params devenus async).
3. `app/(auth)/login/page.tsx:44` — `<form action={sendMagicLink}>` : Server Action attachée au form natif. **Pattern idéal Next.js App Router** — pas de `useState`, pas de `fetch` côté client, pas de gestion de loading manuelle. La redirection se fait via `redirect()` côté action.
4. `app/(auth)/login/actions.ts:1` — `'use server'` en tête de fichier : tout le module est marqué Server Actions. Conforme.
5. `app/(auth)/login/actions.ts:7-22` — `sendMagicLink` : validation typeof string + non-vide, appel `supabase.auth.signInWithOtp`, redirect sur erreur ou succès. Logique linéaire et lisible.
6. `app/(auth)/login/actions.ts:12` — `origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''` : fallback en cascade propre, mais le fallback final `''` produirait un `emailRedirectTo` invalide. Petite faille edge case.
7. `app/auth/callback/route.ts:31-43` — vérification profil `tenant_id` après échange du code PKCE. Pas de `tenant_id` → `/login?error=no_access`. Comportement attendu pour le mode B2B custom.
8. `app/auth/callback/route.ts:46-50` — si profil existe sans brand provisionnée → redirect vers `/onboarding/analyse-marque`. Logique propre.
9. **Pas de RLS visible côté login** : normal, l'utilisateur n'est pas encore authentifié au moment du POST. Le profil est lu côté callback avec session auth posée — RLS classique.
10. Aucun hook React (`useState`, `useEffect`) dans le Server Component. **Conforme à Elena.**
11. **Pas de doublon de schéma** : un seul fichier `page.tsx`, un seul fichier `actions.ts`.
12. Imports propres : 3 imports nommés en haut de `actions.ts`, 1 import en haut de `page.tsx`. Pas de circular.
13. **Pas de cacheable prompt Anthropic** ici (login n'appelle pas Claude API). N/A.
14. La validation côté action ne loggue rien : si Supabase échoue (rate-limit OTP, email invalide DNS), on perd la cause. Pas de `Sentry.captureException`, pas de `console.error`.

### Verdict : **Validé**

### Justification
L'architecture est exemplaire pour un Server Component + Server Action Next 15. Séparation Server/Client nette, pas d'état client redondant, redirection côté serveur. Le callback `/auth/callback` complète le flux proprement avec vérification profile + brand. La seule vraie réserve est le manque d'observabilité côté erreur (toute erreur est aplanie en `?error=true`), mais ça reste un détail acceptable pour V1.

### Recommandations
- **P0** : Aucun.
- **P1** : Logger l'erreur Supabase côté `actions.ts:21` avant `redirect('/login?error=true')`. Sinon on est aveugle sur les rate-limits OTP et les domaines email bloqués.
- **P1** : Différencier les erreurs : `?error=invalid_email`, `?error=rate_limit`, `?error=true` (fallback). Sinon Floriane voit toujours le même message générique.
- **P2** : Le fallback `?? ''` ligne 12 devrait être `?? throw new Error('NEXT_PUBLIC_APP_URL non défini')` au build, ou au minimum un log warn. Un origin vide produirait un `emailRedirectTo: '/auth/callback'` (path relatif) que Supabase rejette.
- **P2** : Ajouter un schéma Zod pour la validation de l'email (regex robuste, pas seulement `typeof string`). Le champ HTML `type="email" required` filtre côté navigateur mais pas côté action si la requête est forgée.

---

## Axe 3 — Sarah (Copy)

### Observations
1. `app/(auth)/login/page.tsx:21` — eyebrow "Creative Fair" : pas de problème, c'est le nom de marque.
2. `app/(auth)/login/page.tsx:27` — H1 "Connexion" : **vouvoiement-neutre / impersonnel**. La doctrine v60 impose le tutoiement systématique. "Connexion" est un nom-titre, donc techniquement pas de pronom — mais une page d'accueil de connexion en mode Floriane tranquillité dirait "Te reconnecter" ou "Bon retour" (cf. Apple Music "Welcome back").
3. `app/(auth)/login/page.tsx:34` — "Lien envoyé. Vérifiez votre boîte mail." : **VOUVOIEMENT explicite**. `Vérifiez` au lieu de `Vérifie`. Recalé.
4. `app/(auth)/login/page.tsx:40` — "Le lien expire dans 1 heure. Pensez à vérifier vos spams." : **DEUX vouvoiements** (`Pensez`, `vos spams`). Recalé.
5. `app/(auth)/login/page.tsx:51` — "Votre compte n'est pas encore activé. Contactez votre administrateur." : **DEUX vouvoiements** (`Votre`, `Contactez`, `votre`). Recalé. De plus le terme "administrateur" est techniquement correct mais froid — un brand manager B2B premium ne parle pas à un "administrateur", elle parle à Creative Fair (l'équipe). Cf. Sarah doctrine.
6. `app/(auth)/login/page.tsx:52` — "Une erreur est survenue. Réessayez." : `Réessayez` (vouvoiement). Recalé. Tutoiement = "Réessaie."
7. `app/(auth)/login/page.tsx:62` — "Adresse email" : label propre. RAS.
8. `app/(auth)/login/page.tsx:70` — placeholder "vous@exemple.com" : **VOUVOIEMENT** dans un placeholder. Tutoiement = "toi@exemple.com" ou "ton.email@exemple.com".
9. `app/(auth)/login/page.tsx:92` — CTA "Recevoir mon lien de connexion" : tutoiement implicite via `mon`. Conforme. Cependant, comparé au style "tranquillité Floriane", "Recevoir mon lien de connexion" est légèrement transactionnel. Une variante "M'envoyer le lien" serait plus directe.
10. Aucun vocabulaire interdit détecté : pas de "dashboard", "workflow", "engagement", "growth hack". RAS.
11. Aucun anglicisme inutile. "Magic link" n'est pas exposé à l'UI (bon point). RAS.
12. Aucune mention "onboarding" en UI utilisateur. RAS pour `/login`. ATTENTION : sur les écrans onboarding eux-mêmes, le mot apparaît côté `BrandOnboardingTrigger` mais c'est commentaire/code — vérifié dans fichiers 03-06.
13. Pas de gamification verbale (pas de "Bienvenue parmi les pros !"). Ton sobre.
14. Le `?error=no_access` est correctement intercepté UI ligne 50-52, mais le message ne propose **aucun canal de contact concret**. Pas d'email, pas de lien "écris-nous". Floriane est bloquée et ne sait pas quoi faire.

### Verdict : **Recalé**

### Justification
4 occurrences de vouvoiement explicite dans une seule page (lignes 34, 40, 51, 52) — c'est un Recalé doctrinal Sarah strict. Le tutoiement systématique est non-négociable dans la v60. De plus, le message `no_access` laisse l'utilisateur en cul-de-sac sans canal de contact. Sur une page aussi sensible que la connexion (point d'entrée + point de blocage potentiel), c'est une dette grave.

### Recommandations
- **P0** : Repasser tous les messages au tutoiement.
  - L. 34 : `Lien envoyé. Vérifie ta boîte mail.`
  - L. 40 : `Le lien expire dans 1 heure. Pense à vérifier tes spams.`
  - L. 51 : `Ton compte n'est pas encore activé. Écris-nous à hello@creativefair.paris.` (ou équivalent — voir Hélène)
  - L. 52 : `Une erreur est survenue. Réessaie.`
- **P0** : Sur `no_access`, donner un canal de contact concret (email, lien mailto, ou bouton "nous contacter"). Floriane bloquée sans action possible = Recalé Marcus aussi.
- **P1** : Placeholder ligne 70 : `vous@exemple.com` → `toi@exemple.com` ou `ton.email@exemple.com` ou simplement vide avec un `aria-label` clair.
- **P2** : "Recevoir mon lien de connexion" → tester variante "M'envoyer le lien de connexion" ou "Recevoir mon lien". Plus direct, plus Floriane.
- **P2** : H1 "Connexion" → envisager "Bon retour" ou "Te reconnecter" pour réchauffer (cohérence avec la posture "tranquillité narrative"). Optionnel.

---

## Axe 4 — Marcus (Workflow)

### Observations
1. Flow nominal : email → submit form (Server Action) → redirect `/login?sent=true` → l'utilisateur clique le lien dans son email → `/auth/callback?code=...` → exchangeCodeForSession → check profile → soit `/onboarding/analyse-marque` soit `/aujourd-hui`. **Pas de cascade redirect > 2** côté navigateur. Conforme.
2. `app/(auth)/login/page.tsx:69` — `autoComplete="email"` : autofill navigateur OK. Conforme.
3. `app/(auth)/login/page.tsx:68` — `required` : validation HTML5 côté client. Bon.
4. **Pas d'autofocus** sur l'input email. Page d'entrée monochamp : le curseur devrait sauter dans le champ au chargement. Recalé léger.
5. **Loading state pendant submit : ABSENT**. Pas de `disabled` sur le bouton pendant la soumission, pas d'indicateur "Envoi en cours…". L'utilisateur peut double-cliquer et déclencher 2 magic links → 2 emails → confusion. Recalé.
6. **Error state : présent mais minimal** (ligne 45-54). Pas d'icône, pas de hiérarchie visuelle, juste un `<p>` en `--color-error`. Acceptable mais sec.
7. **Success state : présent** (ligne 31-42) avec H+1 "Lien envoyé" et explication TTL 1h + spams. Bon réflexe Marcus de prévenir sur les spams.
8. **Pas de re-essayer depuis l'état "sent"** : une fois l'écran "Lien envoyé" affiché, aucun bouton "Renvoyer le lien" ou "Modifier l'email". L'utilisateur doit forcer `/login` dans la barre d'adresse. Recalé léger (cas typique : faute de frappe dans l'email).
9. `?error=no_access` : message clair mais **pas de CTA**. Pas de "Écris-nous", pas de mailto. Cul-de-sac UX. Recalé.
10. Touch target CTA : ~40px hauteur. **Sous 44px**. Recalé.
11. `app/auth/callback/route.ts:42` → redirect `/login?error=no_access` : l'utilisateur authentifié-mais-pas-provisionné repasse par login. **Mais** : sa session Supabase auth est posée (échange code réussi ligne 17), seul son profil métier manque. Si l'admin le provisionne ensuite, devra-t-il refaire un magic link ? Probablement oui car la session expire. Acceptable mais aurait pu être un screen dédié `/access-denied` avec contact.
12. **Pas de gestion mobile spécifique** : `min-h-screen flex items-center justify-center px-6` — responsive par défaut, le `max-w-sm` (384px) tient bien. Conforme.
13. **Pas de feedback haptique / visuel** au clic du CTA (mais c'est un form natif, donc OK pour web).

### Verdict : **Recalé**

### Justification
3 défauts Marcus cumulés : pas d'autofocus, pas de loading state pendant submit, et cul-de-sac UX sur `no_access`. Le touch target sous 44px ajoute un cran. La page fonctionne mais ne tient pas la barre "friction minimale" doctrine. Sur un point d'entrée, ces frictions se paient au triple.

### Recommandations
- **P0** : Ajouter loading state. Solution simple : `useFormStatus` Next.js sur un bouton "submit" client (composant `<SubmitButton>` minuscule en `'use client'`), affichant "Envoi…" et `disabled` pendant `pending`. Sinon double-submit garanti.
- **P0** : Mailto ou bouton de contact sur `?error=no_access`. Sans ça, Floriane est bloquée.
- **P1** : Autofocus sur l'input email au mount. `autoFocus` HTML est OK pour une page d'entrée single-field.
- **P1** : Touch target 44px sur le CTA (cf. Hiroshi).
- **P1** : Sur l'état "sent", ajouter un bouton "Renvoyer le lien" et "Modifier l'email" (qui re-monte le form). Sinon faute de frappe = bouclage manuel.
- **P2** : Considérer un screen `/access-denied` dédié au lieu de réinjecter `?error=no_access` sur `/login`. Permet un meilleur copy + un meilleur tracking analytics.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. **Cible Floriane (28 ans, brand manager, 1 marque)** : la page de connexion ne contredit pas Floriane. Elle est sobre. Cependant elle ne **signe** rien — Floriane qui revient sur l'app après une nuit voit une page neutre qui pourrait être celle de n'importe quel SaaS. Pas de citation anchor "tableau de bord simple et efficace, contrôle, pilote" ni de tonalité tranquille rappelée.
2. **Modèle B2B custom 12K€ setup, 3 clients pilotes** : l'absence de page d'inscription publique (`/signup` n'existe pas) **est conforme** à la doctrine V1. L'inscription se fait par provisioning admin, le magic-link sans whitelist visible (juste check profil post-auth) est suffisant.
3. **Tranquillité narrative** : la copie "Une erreur est survenue. Réessayez." est sèche, non-empathique. Pas d'agressivité commerciale (bon point), mais pas non plus de chaleur. Floriane qui se trompe d'email est traitée comme un système.
4. **Vouvoiement** doctrine — Recalé déjà signalé Axe 3. Mais c'est aussi un signal Hélène : la voix de marque Creative Fair est tutoiement systématique. Vouvoiement = on n'est plus à Creative Fair, on est dans un produit SaaS générique.
5. **Pas de gamification** : RAS. Pas de "Bienvenue parmi les héros du contenu !" ni de jauges. Doctrine respectée.
6. **Pas de jargon SaaS** : pas de "dashboard", "workflow", "feature". RAS.
7. **Cohérence avec Angelina Paris / Le Comptoir Général / Tous en Tête** : la page est neutre, donc cohérente avec toute marque. RAS.
8. **Drift doctrine code ↔ skills/** : `skills/00-CONCEPT.md`, `skills/01-ARCHITECTURE.md`, `skills/10-SACRED.md` décrivent encore l'ancien produit (forest green, nav 4 destinations, routes `/aujourdhui` sans tiret). Le code `/login` lui-même n'est pas concerné directement (pas de palette forest), mais le callback `app/auth/callback/route.ts:54` redirige vers `/aujourd-hui` (avec tiret, conforme spec v60) — **alignement code ↔ spec, désalignement code ↔ skills/**. À signaler.
9. **6 promesses CF** : pas testables sur `/login` (la page ne porte pas la promesse, elle est gate).
10. **Signature v60** : absente visuellement (cf. Hiroshi). C'est aussi un signal Hélène : Creative Fair n'est pas seulement un produit fonctionnel, c'est un produit signé. La page de connexion devrait minimalement signer.
11. **Anti-agressivité commerciale** : aucun emoji, aucune exclamation, aucun call-to-buy. Sobre. Conforme.
12. **Phase 1/Phase 2 et trilogie Organique/Outreach/Libre** : N/A sur cette page.

### Verdict : **Recalé**

### Justification
La page respecte la doctrine sur les points fondamentaux (B2B custom, pas de gamification, pas de jargon, sobre), mais elle échoue sur deux points doctrinaux Hélène : (a) vouvoiement multiple = la voix Creative Fair n'est pas là, (b) signature v60 absente = la page ne porte pas l'identité. Pour un point d'entrée d'un produit premium 12K€ setup, c'est sous le niveau attendu.

### Recommandations
- **P0** : Repasser au tutoiement (déjà signalé Axe 3, mais c'est doctrine Hélène en premier).
- **P0** : Injecter signature visuelle v60 (halos minimaux) pour que Floriane reconnaisse Creative Fair dès la page de connexion.
- **P1** : Adoucir les messages d'erreur ("Réessayez" → "Réessaie, ça arrive."). Tranquillité narrative.
- **P2** : Considérer une ligne d'eyebrow ou de subtitle qui rappelle l'identité Creative Fair sans bruit (ex : "Le programme éditorial de ta marque, prêt à reprendre."). Optionnel.
- **P2** : **Drift skills/** — Mettre à jour les skills `00-CONCEPT.md`, `01-ARCHITECTURE.md`, `10-SACRED.md` pour aligner sur la spec v60 (palette, routes, nav). C'est cross-cutting, à traiter en synthèse Sprint 38.

---

## Synthèse de la page

### Verdicts cumulés
| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé |
| Elena Archi | ✅ Validé |
| Sarah Copy | ❌ Recalé |
| Marcus Workflow | ❌ Recalé |
| Hélène Doctrine | ❌ Recalé |

### Top fixes priorisés
- **P0** :
  1. Passer 4 messages de vouvoiement → tutoiement (page.tsx:34, 40, 51, 52).
  2. Donner un canal de contact sur `?error=no_access` (mailto ou lien).
  3. Ajouter loading state + `disabled` sur le CTA pendant submit (`useFormStatus`).
  4. Injecter 2 halos signature v60 en fond de page.
  5. Touch target CTA ≥ 44px.
- **P1** :
  1. Autofocus sur l'input email au mount.
  2. Container `glass-regular` autour du formulaire (Liquid Glass v60).
  3. CTA `font-medium` → `font-semibold`.
  4. Placeholder `vous@exemple.com` → `toi@exemple.com`.
  5. Sur l'écran "sent", boutons "Renvoyer" et "Modifier l'email".
  6. Logger les erreurs Supabase côté action (observabilité).
  7. Différencier les codes erreur (`invalid_email`, `rate_limit`, etc).
  8. Adoucir copy erreur ("Réessaie, ça arrive.").
- **P2** :
  1. Vérifier que `var(--color-primary) === #007AFF` côté `globals.css`.
  2. Schéma Zod pour la validation email côté action.
  3. Considérer screen dédié `/access-denied` au lieu de réinjecter sur `/login`.
  4. Eyebrow ou subtitle qui rappelle l'identité Creative Fair.
  5. Mettre à jour skills/ (cross-cutting).
  6. H1 "Connexion" → tester "Bon retour" / "Te reconnecter".
  7. Illustration discrète au-dessus du H1.

### Verdict global page
**Recalé partiel** (1 axe Validé sur 5)

La page est architecturalement excellente (Elena ✅) mais perd la doctrine v60 sur les 4 autres axes. Le travail à faire est concentré et ciblé : copy tutoiement + signature visuelle + loading state + contact `no_access`. Aucun refactoring lourd nécessaire. Tous les fixes P0 tiennent en moins d'une journée.

---

## Note drift skills/ (Axe 5 cross-cutting)

Observé sur cette page : alignement code ↔ spec v60 OK (palette, routes), mais `skills/00-CONCEPT.md`, `skills/01-ARCHITECTURE.md`, `skills/10-SACRED.md` décrivent encore l'ancien produit (forest green, 4 destinations nav, routes sans tiret). Le code source de `/login` ne contient lui-même aucun forest green ni vieille route, donc le drift est purement documentaire. À traiter en synthèse Sprint 38 (P0 cross-cutting).
