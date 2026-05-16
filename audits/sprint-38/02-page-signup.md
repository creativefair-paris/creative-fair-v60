# Page : /signup

## Métadonnées
- Route : `/signup` — **inexistante** dans le repo
- Fichier source : **N/A** — aucun fichier `app/signup/page.tsx`, `app/(auth)/signup/page.tsx`, ni `app/(auth)/register/page.tsx`
- Composants principaux : **N/A**
- Server / Client : **N/A**
- Screenshot : **N/A** — la route renvoie un 404 Next.js (404 non personnalisé sauf si `app/not-found.tsx` est customisé — à vérifier mais hors scope direct ici)
- Routes adjacentes vérifiées : `app/(auth)/login/page.tsx` (existe), `app/(auth)/logout/` (existe), `app/auth/callback/route.ts` (existe). Aucune entrée `signup`/`register` côté `app/`.

## Lecture rapide
Il n'existe **aucune page d'inscription publique** dans Creative Fair v60. L'inscription est implicite : un magic-link envoyé depuis `/login` à un email **dont le profil est pré-provisionné côté admin** authentifie l'utilisateur. Toute tentative de magic-link avec un email non-provisionné aboutit à `?error=no_access` sur `/login` (cf. `app/auth/callback/route.ts:42`). La route `/signup` elle-même renvoie un 404. Cet audit traite l'**absence** sous l'angle des 5 axes : conformité à la doctrine V1 (B2B custom 12K€ setup, 3 clients pilotes) versus expérience utilisateur (Floriane qui tape `/signup` par réflexe).

---

## Axe 1 — Hiroshi (UI)

### Observations
1. **Aucune page à auditer visuellement**. La route `/signup` retourne un 404 Next.js.
2. Si Next utilise son 404 par défaut (pas de `app/not-found.tsx` customisé Creative Fair), Floriane voit un écran noir-sur-blanc "This page could not be found" en police par défaut. **Aucune signature v60**.
3. Recherche `app/not-found.tsx` : à vérifier côté Lead. Si absent ou non-customisé, c'est une fuite visuelle de la marque sur une route prédictible.
4. Aucun halo, aucun Liquid Glass, aucun token v60 ne peut être appliqué à une page inexistante. Hiroshi n'a rien à valider, mais le 404 par défaut Next est **anti-Hiroshi** : police système non SF Pro, fond blanc pur (pas crème `#FBFAF7`), aucun radius, aucune Liquid Glass.

### Verdict : **Recalé**

### Justification
L'absence de page n'est pas en soi un problème de design — le problème est que le 404 Next.js par défaut sur une route prédictible (`/signup` est tapé par réflexe par toute Floriane qui débarque) **expose une UX non-signée Creative Fair**. C'est un trou visuel. Recalé léger, pas catastrophique, mais doit être bouché soit par un redirect serveur soit par un 404 personnalisé Creative Fair.

### Recommandations
- **P0** : Vérifier l'existence de `app/not-found.tsx` ou `app/(marketing)/not-found.tsx` personnalisé. Si absent, en créer un avec halos signature v60 + message tutoyé + CTA vers `/login`.
- **P1** : Considérer un redirect serveur Next côté `middleware.ts` : `/signup` → `/login` (302) avec un query param informatif `?info=signup_unavailable` qu'on affiche en bannière sur `/login`.

---

## Axe 2 — Elena (Archi)

### Observations
1. **Absence de route `/signup`** : architecturalement, c'est un choix assumé. L'inscription publique aurait nécessité (a) une table `signup_requests`, (b) une logique de whitelist email/domain, (c) un flow d'approbation admin, (d) une UI marketing.
2. Le pattern actuel (magic-link Supabase OTP + check profile post-callback) est **techniquement minimal et propre** :
   - `app/(auth)/login/actions.ts:14-19` envoie un OTP même si l'email n'est pas connu de Supabase Auth (Supabase crée alors automatiquement un `auth.users` row).
   - `app/auth/callback/route.ts:31-43` vérifie ensuite si un `profiles` row existe avec ce `user.id`. Si non → `no_access`.
3. **Conséquence architecturale** : tout utilisateur peut techniquement créer un `auth.users` row Supabase en demandant un magic-link, mais sans profil métier il ne peut accéder à rien. Cela polue légèrement `auth.users` (rows orphelines) mais n'expose aucune donnée business.
4. **Pas de RLS leak** : sans `tenant_id` dans `profiles`, aucune table RLS ne renvoie de ligne. Conforme doctrine multi-tenant.
5. **Pas de doublon de schéma** : N/A (rien à dupliquer).
6. **Pas de cacheable prompt Anthropic** : N/A.
7. **Server vs Client Components** : N/A.
8. **Effet de bord à signaler** : un admin Creative Fair (humain ou script) doit créer manuellement `profiles` + `tenants` + `brands` pour chaque nouveau client. Ce process est-il documenté ? À vérifier sur les 3 clients pilotes (Angelina, Comptoir, Tous en Tête).
9. **Pas de page d'admin** visible dans `app/` (vérification rapide : `find app -name "admin*"`) — si elle existe, le provisioning est UI, sinon il est SQL/script. Cf. synthèse Sprint 38.

### Verdict : **Validé**

### Justification
L'absence de `/signup` est un choix architectural cohérent avec le modèle B2B custom V1. Le mécanisme magic-link + check profile post-callback est minimal, sans dette technique, sans leak RLS. Aucune table superflue, aucune feature à maintenir. Pour 3 clients pilotes, le provisioning manuel est tenable. Elena valide.

### Recommandations
- **P0** : Aucun.
- **P1** : Documenter formellement le process de provisioning (SQL ou UI admin) dans un runbook accessible à l'équipe Creative Fair.
- **P2** : Prévoir un cleanup périodique des `auth.users` rows orphelines (sans `profiles` associé) > 30 jours. Sinon Supabase Auth se remplit lentement de tentatives ratées.
- **P2** : Quand V2 arrivera (passage de 3 → N clients), prévoir une page admin `/admin/tenants` avec création guidée tenant + profil + brand. Hors V1.

---

## Axe 3 — Sarah (Copy)

### Observations
1. **Aucune copie à auditer** sur `/signup`. La page n'existe pas.
2. **Cependant**, la copie observée sur `/login?error=no_access` (cf. fichier 01) constitue le seul message Creative Fair qui s'adresse à un visiteur qui voulait s'inscrire : "Votre compte n'est pas encore activé. Contactez votre administrateur." Cette phrase est :
   - **Vouvoyée** (`Votre`, `Contactez`, `votre`) — Recalé Sarah strict.
   - **Froide** ("administrateur" — Floriane ne parle pas à un "administrateur", elle écrit à Creative Fair).
   - **Sans canal de contact** — Floriane ne sait pas quoi faire concrètement.
3. **Si** la route `/signup` était redirigée vers `/login?info=signup_unavailable`, un message dédié pourrait dire : "Creative Fair est en accès sur invitation. Écris-nous à hello@creativefair.paris pour discuter de ta marque." Tutoiement + canal + cadrage doctrine B2B premium. Cette copie n'existe nulle part aujourd'hui.
4. **404 Next par défaut** : "This page could not be found" — anglais, vouvoiement implicite, hors marque. Recalé doctrine.
5. Aucun vocabulaire interdit n'est exposé (puisqu'il n'y a pas de copie).

### Verdict : **Recalé**

### Justification
L'absence de page est compréhensible, mais le fallback est silencieux et anti-marque. Une Floriane qui tape `/signup` par réflexe atterrit sur un 404 Next anglais. Et si elle teste un magic-link, elle reçoit un message vouvoyé sec sans contact. La doctrine Sarah impose une voix tutoyée + chaleureuse partout — y compris sur les chemins de cul-de-sac.

### Recommandations
- **P0** : Si l'option retenue est redirect `/signup` → `/login?info=signup_unavailable`, écrire un message dédié tutoyé avec contact :
  > "Creative Fair est en accès sur invitation. Pour discuter de ta marque, écris-nous à hello@creativefair.paris."
- **P0** : Si l'option retenue est `app/not-found.tsx` personnalisé, même copie tutoyée avec contact + CTA vers `/login`.
- **P1** : Refondre aussi la copie `?error=no_access` sur `/login` (cf. fichier 01).
- **P2** : Réfléchir au cadrage commercial de la phrase. "Accès sur invitation" peut sonner snob — alternative : "Creative Fair accompagne aujourd'hui un nombre limité de marques. Pour échanger, écris-nous à hello@creativefair.paris." À tester avec Hélène.

---

## Axe 4 — Marcus (Workflow)

### Observations
1. **Le 404 Next par défaut est un cul-de-sac UX**. Aucun CTA vers `/login`, aucune navigation, aucun fallback. Floriane est obligée d'éditer manuellement l'URL ou de revenir en arrière.
2. **Aucun feedback sur la nature de l'erreur** : la Floriane ne sait pas si `/signup` est temporairement down, supprimé, ou jamais existé. Pour un produit B2B premium, c'est un signal de "broken" alors que c'est un signal "by design".
3. **Le flow d'inscription réel** (magic-link + admin provisioning) est invisible côté visiteur. Si Floriane veut devenir cliente, elle doit deviner qu'elle doit écrire à Creative Fair via un autre canal (LinkedIn ? Email trouvé sur le site marketing ?). **Friction maximale**.
4. **Pas de mailto, pas de formulaire de contact**, pas de lien WhatsApp/Calendly. Aucun pont entre "visiteur intéressé" et "client provisionné".
5. **Touch target** : N/A (pas d'éléments interactifs).
6. **Loading + error states** : N/A.
7. Le rôle d'une page `/signup`-redirect serait précisément de combler ce trou : transformer un cul-de-sac en pont commercial sobre.

### Verdict : **Recalé**

### Justification
Du point de vue workflow utilisateur, l'absence de `/signup` + 404 par défaut = cul-de-sac total. Pour V1 (3 clients pilotes), Marcus tolère que l'acquisition se fasse hors-app (réseau Ulysse, prospection directe). Mais le moment où un prospect tape `/signup` est un signal d'intérêt à NE PAS gâcher. Recalé sur le fait qu'aucun pont n'existe.

### Recommandations
- **P0** : Mettre en place un fallback `/signup` → contact (redirect ou not-found personnalisé) avec CTA vers `hello@creativefair.paris` (ou Calendly Ulysse).
- **P1** : Au cas par cas selon stratégie commerciale d'Ulysse : prévoir un mini-formulaire "intéressé par Creative Fair" plutôt qu'un mailto sec (capture email + champ "ta marque" + envoi côté admin). Mais ça reste V2 si non-urgent.
- **P2** : Tracker côté analytics les hits sur `/signup` (et `/register`, `/inscription`) pour mesurer l'intérêt entrant. Donne un signal d'acquisition organique potentielle.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. **Conformité doctrine V1** : Creative Fair est positionné en **B2B custom 12K€ setup, 3 clients pilotes**. L'absence de page d'inscription publique est cohérente. La doctrine n'impose pas un funnel d'acquisition automatisé — au contraire, elle suppose un onboarding humain "haut de main" (cf. notes Apple, doctrine Hélène, doc 09).
2. **Floriane (28 ans, brand manager, 1 marque)** : Floriane n'arrive PAS sur `/signup`. Elle arrive sur `/login` avec un email d'invitation. Donc l'absence de `/signup` ne casse pas Floriane.
3. **Cas "prospect" non-Floriane** : un prospect qui découvre Creative Fair (via LinkedIn, bouche-à-oreille, presse) tape probablement `creativefair.com` puis cherche un bouton "S'inscrire" ou tape `/signup`. **Là, la doctrine actuelle est silencieuse**. Le site marketing (s'il existe) devrait gérer l'acquisition, pas l'app. Mais l'app expose une route 404 brute.
4. **Tranquillité narrative** : un 404 brut est une rupture de tranquillité. Doctrine Hélène pousse à fermer chaque chemin avec calme et clarté.
5. **Anti-agressivité commerciale** : la doctrine interdit "S'inscrire maintenant !", "Essai gratuit !", "Croissez x10 !". Un fallback `/signup` doit respecter cette sobriété — pas de "Booste ta marque dès maintenant !".
6. **Cohérence Angelina Paris / Le Comptoir Général / Tous en Tête** : les 3 marques pilotes ont été signées en relationnel direct, pas via funnel. La doctrine peut explicitement assumer ce modèle — "Creative Fair ne se vend pas en self-service. Creative Fair se signe en main."
7. **Drift skills/ code↔skills** : N/A direct sur `/signup` (skills ne parlent pas de `/signup` non plus, à vérifier). Mais la doctrine V1 elle-même (modèle B2B custom) devrait être codifiée quelque part — si elle ne l'est pas, drift implicite.
8. **6 promesses CF** : N/A direct.
9. **Signature v60** : N/A direct (page inexistante).
10. **Phase 1/Phase 2, trilogie Organique/Outreach/Libre** : N/A.

### Verdict : **Validé** (conformité doctrine V1 sur le fond) **+ Recalé léger** (sur le fallback)

Décision binaire : **Recalé** — parce que la doctrine impose tranquillité narrative + sobriété sur TOUS les chemins, y compris les chemins fermés. Le 404 brut est une fuite doctrine même si l'absence de la page elle-même est doctrinalement correcte.

### Justification
La doctrine B2B custom V1 valide l'absence de funnel automatisé. Mais elle n'autorise pas un 404 brut sur une route prédictible. Hélène recale le fallback, valide l'architecture.

### Recommandations
- **P0** : Custom `app/not-found.tsx` Creative Fair OU redirect `/signup` → `/login?info=signup_unavailable` avec copie doctrine Hélène (sobre, tutoyée, contact concret).
- **P1** : Documenter explicitement dans `skills/00-CONCEPT.md` ou équivalent que Creative Fair V1 est B2B custom sans inscription publique. Évite que de futurs devs ajoutent par réflexe une page `/signup`.
- **P2** : Quand V2 (auto-onboarding) sera décidé par Hélène + Ulysse, prévoir une refonte cadrée plutôt qu'un patch.

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
  1. Custom `app/not-found.tsx` OU redirect `/signup` → `/login?info=signup_unavailable`.
  2. Copie tutoyée doctrine Hélène + contact concret (`hello@creativefair.paris` ou Calendly).
  3. Signature visuelle v60 sur le fallback (halos, fond crème, typo SF Pro).
- **P1** :
  1. Refondre la copie `?error=no_access` sur `/login` (cf. fichier 01).
  2. Documenter le process de provisioning manuel.
  3. Documenter dans `skills/` que V1 est B2B custom sans `/signup`.
  4. Considérer un mini-formulaire "intéressé par Creative Fair" capture email.
- **P2** :
  1. Cleanup périodique `auth.users` orphelines > 30j.
  2. Tracker analytics les hits sur `/signup`, `/register`, `/inscription`.
  3. Tester la copie commerciale ("accès sur invitation" peut sonner snob).
  4. Anticiper V2 (auto-onboarding) en cadrage doctrine plutôt qu'en patch.

### Verdict global page
**Recalé partiel** (1 axe Validé sur 5)

La décision **architecturale** de ne pas avoir `/signup` est validée (conformité doctrine B2B custom V1). Le **fallback** sur cette absence est Recalé : 404 Next brut, anglais, sans contact, sans signature. C'est un trou doctrine + UX + copy + visuel. Bouchage simple : un not-found personnalisé ou un redirect avec copie tutoyée et contact concret. Moins d'une demi-journée de travail.

---

## Note drift skills/ (Axe 5 cross-cutting)

Le cas `/signup` lui-même n'expose pas de drift code ↔ skills/ (les skills ne mentionnent pas la route). Cependant, **le modèle B2B custom V1 n'est codifié nulle part formellement** — c'est une décision verbale d'Ulysse / d'Hélène qui flotte. Risque : un futur dev ou un futur agent ajoute par réflexe `/signup` parce qu'il "manque" architecturalement. À codifier dans `skills/00-CONCEPT.md` ou dans une décision Apple permanente. Drift documentaire latent, P1 cross-cutting.

---

## Note méthodologique sur l'audit d'une absence

Auditer une page absente est plus délicat qu'auditer une page existante :
- Pas de code à pointer (`fichier:ligne`).
- Pas de capture visuelle possible.
- Pas de comportement à tester.

Mais l'absence n'est pas neutre : elle produit un comportement (404 ou redirect), elle expose une voix (404 anglais ou copy Creative Fair), elle exprime une posture commerciale (open self-service ou closed invitation-only). Auditer ces effets de bord est tout aussi rigoureux qu'auditer le rendu d'une page. Le critère reste binaire : Validé si la doctrine + UX + copie sont assumées sur tous les chemins, Recalé sinon. Ici, Recalé sur le fallback.
