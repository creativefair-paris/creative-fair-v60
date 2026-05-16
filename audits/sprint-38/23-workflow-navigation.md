# Workflow : D — Navigation cross-pages (Nav 5 + Header + Breadcrumb + Retours)

## Métadonnées

- **Pages impliquées** (toutes routes auth) :
  - `app/(aujourd-hui)/aujourd-hui/page.tsx` (point d'ancrage)
  - `app/(programme)/programme/page.tsx` + sous-routes (`/strategie`, `/retombees`, `/create`, `/posts/[postId]`, `/post/[postId]`, `/bienvenue`)
  - `app/(ma-marque)/ma-marque/page.tsx`
  - `app/(outils)/outils/page.tsx` + sous-routes (`/conseiller`, `/bibliotheque`, `/messages`, `/post-creator/[format]`, `/reviews`, `/moodboard`, `/variations`)
  - `app/(compte)/compte/mon-compte/page.tsx` + `/ma-marque`, `/parametres`, `/ma-marque/brand-book`, `/ma-marque/business-calendar`
- **Composants navigation** :
  - `components/layout/PageHeader.tsx` (Server, header unifié H1 + breadcrumb + avatar trailing)
  - `components/layout/NavigationBar.tsx` (Server, header iOS large title — usage limité, peut-être obsolète)
  - `components/layout/UserMenuTrigger.tsx` (Client, avatar bouton 44×44)
  - `components/layout/UserMenuBubble.tsx` (Client, popover 3 destinations + Mon compte + Déconnexion)
  - `components/ui/Breadcrumb.tsx` (Server, fil d'Ariane "Aujourd'hui › X")
  - `components/layout/BackButton.tsx` (Client, chevron 44×44 — non rendu sur routes racines)
  - `components/programme/ProgrammeSplitShell.tsx` (Shell sidebar gauche `/programme/*`)
  - `components/programme/ProgrammeSidebar.tsx` (250 LOC — items secondaires programme)
  - `components/outils/OutilsCatalog.tsx` (Sidebar 2 colonnes `/outils`)
  - `components/onboarding-marque/BrandOnboardingHeaderCta.tsx` (CTA spécifique `/ma-marque`)
- **Server actions** : aucune côté navigation pure. Le logout passe par `supabase.auth.signOut()` côté client (`UserMenuTrigger.tsx:62`).
- **Tables Supabase touchées** : aucune côté nav. Le `PageHeader` lit `profiles` + `brands` pour afficher avatar + nom marque (`PageHeader.tsx:50-110`).
- **Screenshots** : à produire côté Lead (storyboard recommandé : 1. `/aujourd-hui` avec PageHeader + halos 6, 2. popover UserMenuBubble ouvert, 3. `/programme` (split shell), 4. `/ma-marque` avec BrandOnboardingHeaderCta + halos 6, 5. `/outils` avec sidebar catalogue, 6. `/outils/conseiller` breadcrumb 3 niveaux, 7. `/programme/post/[postId]` breadcrumb depuis programme, 8. `/login` sans header, 9. Cas mobile <900px split-shell collapse).

---

## Storyboard narratif

### Étape 0 — Le point d'ancrage : `/aujourd-hui`

C'est la "home" depuis Sprint 36.C (cf. `components/ui/Breadcrumb.tsx:10` — `HOME_HREF = '/aujourd-hui'`). Toutes les pages mères affichent un breadcrumb `Aujourd'hui › X` qui pointe vers cette destination.

Le pilote arrive ici post-login ou post-onboarding (cf. workflow A). Le `PageHeader` rend `<PageHeader title="Aujourd'hui" subtitle={semaineLabel} hideBreadcrumb />` (`page.tsx:209`) — la breadcrumb est explicitement masquée car le segment "Aujourd'hui" serait redondant avec le H1.

### Étape 1 — Découvrir la nav

La doctrine 12 mai 2026 dit "Nav 5 (Aujourd'hui, Mon Programme, Ma Marque, Mes Outils, Conseiller)". Dans la pratique :

- **Pas de barre de navigation bottom/sidebar persistante.**
- L'accès aux autres destinations se fait via le bouton **avatar** en haut à droite (`PageHeader.tsx:119-125` → `UserMenuTrigger`).
- Click avatar → popover `UserMenuBubble` qui contient **3 destinations** : Mon Programme (`/programme`), Ma Marque (`/ma-marque`), Mes Outils (`/outils`).
- **Aujourd'hui n'est PAS dans le popover** — c'est la racine, accessible via le breadcrumb des autres pages.
- **Conseiller n'est PAS dans le popover** — c'est une sous-page de `/outils/conseiller`.

Donc la "Nav 5" doctrine = en réalité **3 destinations dans le popover** + 1 ancre breadcrumb (`/aujourd-hui`) + 1 destination cachée 2 niveaux profond (`/outils/conseiller`). Décrochage doctrine majeur.

### Étape 2 — Raccourcis clavier

`UserMenuTrigger.tsx:31-51` écoute `keydown` globalement et bind :

- `⌘1` / `Ctrl+1` → `/programme`
- `⌘2` / `Ctrl+2` → `/ma-marque`
- `⌘3` / `Ctrl+3` → `/outils`
- `⌘,` / `Ctrl+,` → `/compte`

Pas de `⌘0` ou `⌘4` pour `/aujourd-hui` ou conseiller. Cohérent avec le popover mais incomplet vs Nav 5 promise.

### Étape 3 — Breadcrumb

Sur chaque page mère sauf `/aujourd-hui` (hideBreadcrumb) et `/login` (pas de PageHeader), un breadcrumb apparaît au-dessus du H1, format "Aujourd'hui › X" (cf. `Breadcrumb.tsx:30-89`). Le premier segment est cliquable → `/aujourd-hui`.

Pour les sous-routes `/outils/*`, le breadcrumb est étendu à 3 niveaux : "Aujourd'hui › Outils › X" (`app/(outils)/outils/conseiller/page.tsx:139`). Le segment "Outils" est cliquable via la syntaxe `{ label: 'Outils', href: '/outils' }`.

Pour `/programme/*`, le `ProgrammeSplitShell` impose un PageHeader fixe `title="Mon Programme"` (`ProgrammeSplitShell.tsx:38`) — donc la sidebar gauche change selon `activeItem` mais le header reste "Mon Programme". Pas de breadcrumb 3 niveaux pour `/programme/strategie` ou `/programme/post/[postId]`.

### Étape 4 — Sidebar `/programme/*`

`ProgrammeSidebar.tsx` (251 LOC, non lu en détail) — sidebar persistante sticky 280px sur `/programme/*` (`ProgrammeSplitShell.tsx:47-52`). Activée selon `activeItem` (calendrier / strategie / retombees / etc.). Pattern différent de `/outils` (catalogue 2 colonnes inline) et différent de `/ma-marque` (single column).

Sur mobile <900px (`ProgrammeSplitShell.tsx:68-76`), la grid `280px 1fr` collapse en `1fr` et la sidebar perd sa stickyness. Pas de comportement défini pour les autres pages en responsive.

### Étape 5 — Retours vers `/aujourd-hui`

Plusieurs chemins de retour :

- **Breadcrumb** : click sur "Aujourd'hui" en haut.
- **Avatar** : popover → pas d'item "Aujourd'hui" — le pilote DOIT cliquer ailleurs (logo ? il n'y en a pas).
- **`BackButton`** : créé `Sprint 36.B.1` mais commentaire dit "Non rendu sur destinations racines pour respecter Apple HIG" et **pas utilisé sur les sous-routes non plus** (grep ne trouve aucun usage actif). Composant orphelin.
- **Aucun lien "Creative Fair" cliquable en haut à gauche** vers la home — pattern web courant absent.

Donc le seul chemin systématique vers `/aujourd-hui` est le breadcrumb. Le popover ne le propose pas explicitement. Friction perceptuelle.

### Étape 6 — Logout

`UserMenuTrigger.tsx:93-118` : click "Déconnexion" dans le popover ouvre une `<Sheet>` de confirmation avec copy "Tu veux te déconnecter de Creative Fair ?" + boutons "Annuler" / "Déconnexion" (glass-thin). Tutoiement OK. Pattern Apple iOS sheet de confirmation. Bien.

---

## Axe 1 — Hiroshi (UI)

### Observations

1. **Densité halos incohérente** entre pages (counts grep dans le code) :
   - `/aujourd-hui` → 6 halos
   - `/ma-marque` → 6 halos
   - `/outils` → 5 halos
   - `/outils/conseiller` → 5 halos
   - `/outils/post-creator/[format]` → **0 halo** (placeholder roadmap)
   - `/programme` → **3 halos** seulement (via `ProgrammeSplitShell.tsx:25-27`)
   - `/onboarding/analyse-marque` → 5 halos
   - `/login` → 0 halo
   
   Quatre densités différentes (0 / 3 / 5 / 6). La signature visuelle CF se dilue selon la page. Anti-pattern doctrine.

2. **PageHeader vs NavigationBar duplication** : deux composants Server quasi-identiques (`PageHeader.tsx` 148 LOC + `NavigationBar.tsx` 136 LOC) qui chargent tous deux user/brand et rendent un header. `PageHeader` est utilisé sur les pages mères (Sprint 36.B.5), `NavigationBar` était pour les flows iOS large title (Sprint 33) — la transition n'est pas finie. Dette technique.
3. **Pas de logo Creative Fair persistant** dans le header. Le H1 contient le nom de la section ("Aujourd'hui", "Ma Marque", etc.). Le pilote ne voit jamais un repère visuel "tu es dans Creative Fair". Anti-pattern de marque.
4. **`/login`** (`app/(auth)/login/page.tsx:1-99`) n'a NI PageHeader NI NavigationBar — c'est une page mère sans header. Cohérent (pas d'avatar à afficher) mais le décrochage avec le reste de l'app est total (cf. workflow A).
5. **`BrandOnboardingHeaderCta`** (`ma-marque/page.tsx:200-205`) — CTA secondaire spécifique à `/ma-marque`, aligné à droite sous le PageHeader (marginTop: -8). Le seul cas dans l'app d'un CTA injecté SOUS le header. Si demain `/outils` veut un CTA similaire, le pattern n'est pas généralisé.
6. **Sidebar `/programme/*` 280px sticky** (`ProgrammeSplitShell.tsx:47-66`) — pattern différent du catalogue `/outils` (2 colonnes 36/64) et de `/ma-marque` (single column 1200px). Trois layouts différents pour trois pages mères. Doctrine v60 ne semble pas avoir tranché un pattern unique.
7. **Breadcrumb couleurs** (`Breadcrumb.tsx:42, 56, 66, 79`) — couleurs hardcoded `rgba(0,0,0,0.4)`, `rgba(0,0,0,0.55)`, `rgba(0,0,0,0.25)`. Pas tokenisé (devrait être `var(--color-tertiary-label)` / `var(--color-secondary-label)`).
8. **Avatar 44×44** (`UserMenuTrigger.tsx:80`) au-dessus de la pagination breadcrumb (12px). Le pivot visuel principal (avatar) côtoie un élément à très faible poids visuel (breadcrumb 12px). Pas de hiérarchie claire en haut de page.
9. **UserMenuBubble** (`UserMenuBubble.tsx:1-139`) — beau popover Apple, dividers entre sections, raccourcis affichés à droite. Cohérent avec le pattern macOS menu utilisateur. Bien isolé.
10. **Mobile responsive** : seul `ProgrammeSplitShell` (`ProgrammeSplitShell.tsx:68-76`) déclare un breakpoint `@media (max-width: 900px)`. Les autres pages n'ont pas de stratégie responsive identifiable. Le `PageHeader` n'a pas de comportement mobile défini dans la portion lue.

### Verdict : **Recalé**

### Justification

Densité halos en désordre (0/3/5/6 selon page), pas de logo CF persistant, deux composants header redondants (`PageHeader` + `NavigationBar`), trois patterns de sidebar/layout différents sur les pages mères. La signature visuelle CF se dilue progressivement quand le pilote navigue d'une page à l'autre.

### Recommandations

- **P0** : Normaliser la densité halos. Soit toutes les pages mères en 6, soit fixer un nombre par "zone" (programme=3 ? outils=5 ? aujourd'hui=6 ?) avec une raison documentée.
- **P0** : Ajouter un logo "Creative Fair" cliquable en haut à gauche (route → `/aujourd-hui`). Repère de marque + chemin de retour systématique.
- **P0** : Trancher `PageHeader` vs `NavigationBar`. L'un des deux disparaît Sprint 38. Probablement `NavigationBar` (le pattern Sprint 33 n'a plus de raison d'être).
- **P1** : Tokeniser les couleurs hardcoded de `Breadcrumb.tsx`.
- **P1** : Unifier les patterns layout (`ProgrammeSplitShell`, `OutilsCatalog`, `/ma-marque`) — choisir UN pattern principal "sidebar gauche + content droit" et le décliner.
- **P2** : Documenter le breakpoint mobile (900px ? 768px ?) une fois pour toutes dans `globals.css`.

---

## Axe 2 — Elena (Archi)

### Observations

1. **`PageHeader` Server Component** (`PageHeader.tsx:112-147`) — charge user + brand via Supabase à CHAQUE render. Sur des sous-routes fréquemment visitées (`/programme/post/[postId]`), c'est 1 SELECT profiles + 1 SELECT brands par page load. Pas de cache. Cas typique pour `unstable_cache` keyé par userId.
2. **`NavigationBar` Server Component** (`NavigationBar.tsx:101-136`) — duplique exactement la même logique de fetch user/brand. Si on garde les deux, on a 2× la même requête sur les pages qui rendraient les deux. À vérifier mais probablement aucune page ne rend les deux.
3. **Multi-tenant** : `PageHeader` filtre `brands.eq('tenant_id', tenantId)` (`PageHeader.tsx:95`). RLS-aware. Bien.
4. **Raccourcis clavier** (`UserMenuTrigger.tsx:31-51`) — listener globaux `keydown` ajouté à chaque render du UserMenuTrigger. Le effect cleanup retire bien le listener. Pas de fuite. Mais le listener vit sur CHAQUE page mère où UserMenuTrigger est monté (probablement toutes), donc le keypress est intercepté partout. Acceptable.
5. **Logout client** (`UserMenuTrigger.tsx:58-68`) — `supabase.auth.signOut()` côté client, suivi de `router.push('/login')`. Pas de revalidation, pas de purge cookies serveur explicite. Si le push fail, l'utilisateur reste "déconnecté côté client mais session serveur traînante". Edge case.
6. **Cascade redirect** :
   - `/aujourd-hui` redirige vers `/onboarding/analyse-marque` ou `/login` selon état (`page.tsx:35-39`) → max 1 saut
   - `/ma-marque`, `/outils`, `/programme` : tous redirigent vers `/login` si pas auth, vers `/onboarding/analyse-marque` si pas brand → max 1 saut chacun
   - `/outils/post-creator` → 308 vers `/outils` → 1 saut
   - **Pas de cascade > 2 sauts identifiable.** Respect doctrine.
7. **Le `cfs-page-container` 1200px** est partagé via CSS class globale (`app/globals.css:429`). Bien. Mais certaines pages le redéfinissent inline (`/aujourd-hui:212-219` ajoute `flex:1, paddingBottom`), ce qui dilue le pattern.
8. **Pas de prefetch Next** identifiable sur les `<Link>` du popover UserMenuBubble (`UserMenuBubble.tsx:90-103`). Next 14+ a auto-prefetch par défaut sur les `<Link>` viewport mais le popover n'est dans le viewport qu'au click avatar. Le pilote clique avatar → voit popover → clique Mon Programme → fetch /programme. Cache miss probable.
9. **`BackButton` orphelin** (`components/layout/BackButton.tsx:1-49`) — composant existe mais 0 usage actif (grep n'a rien trouvé hors définition). Code mort.
10. **Header CTA `BrandOnboardingHeaderCta`** (`components/onboarding-marque/BrandOnboardingHeaderCta.tsx:14-50`) — dispatch un `CustomEvent('cfs-open-brand-onboarding')` ET pousse l'URL (`?onboarding=true`). Double trigger pour robustesse (commentaire ligne 17-19). Pattern fragile : si un autre listener écoute le même event mais sur une autre page, comportement imprévisible.

### Verdict : **Recalé partiel**

### Justification

Pas de cascade > 2 sauts (respect doctrine), RLS multi-tenant OK sur PageHeader. Mais (a) duplication PageHeader/NavigationBar, (b) re-fetch user/brand à chaque render sans cache, (c) BackButton mort, (d) custom event dispatching fragile pour BrandOnboardingHeaderCta.

### Recommandations

- **P1** : `unstable_cache` ou `React.cache` sur `loadUserMeta` (PageHeader + NavigationBar) keyé par cookie session.
- **P1** : Décider du retrait de `BackButton` ou de son branchement (cf. axe Hiroshi : pas de retour explicite vers `/aujourd-hui` autre que breadcrumb).
- **P1** : Décider du retrait de `NavigationBar` (cf. axe Hiroshi).
- **P2** : Documenter le pattern CustomEvent de BrandOnboardingHeaderCta (ou le retirer si l'URL push suffit).
- **P2** : Ajouter explicit `prefetch={true}` sur les Link du popover si on veut prefetch agressif.

---

## Axe 3 — Sarah (Copy)

### Observations

1. **Labels nav** : "Mon Programme", "Ma Marque", "Mes Outils" — possessifs respectés. Bien (doctrine ✅).
2. **"Mon compte"** dans le popover (`UserMenuBubble.tsx:118`) — possessif aussi. Cohérent.
3. **"Déconnexion"** dans le popover (`UserMenuBubble.tsx:134`) — nominal, neutre. OK.
4. **Sheet confirmation logout** : "Tu veux te déconnecter de Creative Fair ?" (`UserMenuTrigger.tsx:99`) — tutoiement, ton Floriane. Bien.
5. **Breadcrumb "Aujourd'hui"** : possessif implicite (sous-entendu "Mon Aujourd'hui"). Cohérent.
6. **PageHeader title** : "Aujourd'hui", "Ma Marque", "Mes Outils", "Mon Programme", "Conseiller". Tous en français, tutoiement implicite. Bien.
7. **`/outils/post-creator/[format]` breadcrumb** : `Mes Outils › Post Creator › {label}` (cf. workflow C). "Post Creator" en anglais — c'est le nom du produit (acceptable). Mais on l'écrit aussi parfois "post-creator" en URL et "Post Creator" en label. Cohérent.
8. **Logout button label "Déconnexion"** alterne avec "Déconnexion…" pendant logging out (`UserMenuTrigger.tsx:116`). Pas de tutoiement ici car nominal. OK.
9. **Avatar `aria-label`** : "Menu utilisateur" (`UserMenuTrigger.tsx:75`) — neutre, accessible. Mais "user" en filigrane (même via "utilisateur" français). Doctrine v60 dit "users" interdit en UI — accessibility text est-il "UI" ? Limite. Probablement OK.
10. **Raccourcis affichés** : "⌘1", "⌘2", "⌘3", "⌘," (`UserMenuBubble.tsx:99-101`). Cohérent avec macOS. Mais pas d'équivalent Mac vs Windows expliqué visuellement — le `SHORTCUT_KEY` détecte la plateforme (`UserMenuBubble.tsx:25`). Bien fait.
11. **`/ma-marque` : "Reprendre l'onboarding guidé →"** (`BrandOnboardingHeaderCta.tsx:43`) — déjà signalé workflow A : **violation doctrine** "onboarding" en UI.
12. **Hover label sur breadcrumb** : aucun `title=` HTML sur les segments. Si le pilote hover "Aujourd'hui" il ne voit pas "Retour à Aujourd'hui". Manque d'aide contextuelle.
13. **Pas de label "Aujourd'hui"** dans le popover UserMenuBubble. Le pilote qui ne connaît pas le breadcrumb pourrait croire que `/aujourd-hui` est dans le popover. Friction lexicale.
14. **`Avatar.tsx`** (non lu) — affiche probablement le prénom capitalisé en fallback. À vérifier que c'est tutoyé.

### Verdict : **Validé**

### Justification

Les labels nav respectent les possessifs doctrinaux, le tutoiement est partout (sauf "onboarding" déjà flagué workflow A), la sheet de logout est en tutoiement, les raccourcis clavier sont localisés Mac/Windows. La copy de navigation est l'une des plus alignées du produit.

### Recommandations

- **P1** : Ajouter "Aujourd'hui" dans le popover UserMenuBubble — soit en première destination (avant Mon Programme), soit en lien discret "Retour à Aujourd'hui" en bas.
- **P2** : Ajouter `title=` HTML sur les segments breadcrumb pour aide hover.
- **P2** : Vérifier `Avatar.tsx` que le prénom fallback est tutoyé ("Toi" déjà présent dans `PageHeader.tsx:104` — bien).

---

## Axe 4 — Marcus (Workflow)

### Observations

1. **Friction quantifiée pour passer d'une page mère à une autre** :
   - Click avatar (1) → popover s'ouvre
   - Click destination dans popover (1) → fetch page
   - **2 clics minimum** pour changer de page mère.
   - Alternative raccourci clavier : 1 combo (⌘1/2/3). Plus rapide mais demande de connaître le raccourci.
2. **Pas de raccourci `/aujourd-hui`** — le seul moyen rapide d'y retourner est de cliquer le segment breadcrumb. 1 clic mais petit target (12px). Friction.
3. **Sidebar `/programme`** : items secondaires non identifiés en détail. Mais le shell sticky 280px occupe de la place permanente. Si le pilote vient juste pour voir un post, il a 280px sticky en plus du contenu.
4. **`/outils` catalogue 2 colonnes** : sidebar persistante 36%, preview droite 64%. Le pilote ne peut pas voir 2 outils simultanément — chaque sélection remplace la preview. Pattern WYSIWYG mais friction si on compare 2 outils.
5. **Popover NOT keyboard-accessible from main flow** : le bouton avatar ouvre le popover via click (`UserMenuTrigger.tsx:74`). Pas de focus management explicite après ouverture (`UserMenuBubble.tsx` n'a pas de `autoFocus`). Le pilote au clavier doit Tab depuis l'avatar vers le popover.
6. **Popover close** sur Escape ✅ et click outside ✅ (`UserMenuBubble.tsx:36-54`). Bien.
7. **Pas de "vous étiez ici" indicator** dans le popover. L'item actif a `.is-active` class (`UserMenuBubble.tsx:93`) mais c'est un styling subtil, pas un "indicator dot" macOS-style.
8. **Navigation arrière** : pas de bouton "retour" visible (BackButton orphelin). Sur `/programme/post/[postId]` le pilote doit utiliser breadcrumb ou nav popover. Pas de browser back tip visible.
9. **Aucun deep-link state preserved** : si le pilote navigue `/programme/post/abc` → popover → `/ma-marque` → popover → `/programme`, il atterrit sur `/programme` racine, pas sur `/programme/post/abc`. Pas de "Reprendre où tu étais". Acceptable mais friction sur usage récurrent.
10. **Mobile** : sur écran <900px, `ProgrammeSplitShell` collapse correctement, mais le popover UserMenuBubble (44px avatar trigger) reste touchable. À vérifier que le popover ne dépasse pas du viewport en portrait.

### Verdict : **Recalé partiel**

### Justification

Friction acceptable (2 clics pour changer de page mère), raccourcis clavier corrects sur 3 destinations. Mais (a) pas de retour rapide `/aujourd-hui` autre que breadcrumb 12px, (b) pas d'indicator visuel page active dans popover, (c) state non préservé sur navigation arrière, (d) BackButton non utilisé alors qu'il aiderait sur sous-routes.

### Recommandations

- **P1** : Brancher `BackButton` sur les sous-routes (`/programme/post/[postId]`, `/outils/post-creator/[format]`, `/compte/parametres`, etc.). Apple HIG dit "back là où il y a un parent" — la majorité des sous-routes en ont un.
- **P1** : Ajouter un raccourci `⌘0` ou `⌘.` vers `/aujourd-hui` dans `UserMenuTrigger.tsx`.
- **P2** : Ajouter un dot indicator visuel à côté de l'item actif dans le popover (au-delà du `.is-active` styling).
- **P2** : Mémoriser l'état sous-route (`sessionStorage`) pour proposer "Reprendre là où tu étais" au retour sur une page mère.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations

1. **Nav 5 doctrine ≠ implémentation**. La doctrine spec 12 mai 2026 dit "Nav 5 (Aujourd'hui, Mon Programme, Ma Marque, Mes Outils, Conseiller)". L'implé est :
   - Aujourd'hui = home implicite via breadcrumb (pas dans popover)
   - Mon Programme, Ma Marque, Mes Outils = dans popover ✅
   - Conseiller = sous-route `/outils/conseiller` (pas dans popover, pas dans nav explicite)
   
   Doctrine partiellement violée : 3 destinations dans popover au lieu de 5.

2. **Le pilote pilote ?** À l'échelle nav, oui — le popover est sobre, prévisible, raccourcis clavier disponibles. Pas de mega menu, pas de notification badge, pas de promo. Tranquillité respectée.

3. **Tranquillité narrative** : la nav ne crie pas. Pas de "New !" badge, pas de "10 unread", pas de notification counter. Doctrine anti-bruit respectée.

4. **Possessifs systématiques** : "Mon Programme", "Ma Marque", "Mes Outils", "Mon compte". Doctrine respectée bout-en-bout. Bien.

5. **Breadcrumb "Aujourd'hui ›"** : pattern Apple Finder. Cohérent avec la posture macOS du produit.

6. **Absence de logo CF** : le pilote ne voit jamais "Creative Fair" écrit en haut. Doctrine "tranquille" peut le justifier (pas de surcharge visuelle), mais "Tous en Tête / Le Comptoir Général / Angelina Paris" et autres marques clientes — l'identifiant produit s'efface trop. Apple Settings n'écrit pas "Apple" non plus, mais Apple a un identifiant fort par défaut.

7. **`/programme` sidebar persistante** : la sidebar offre des sous-destinations (Calendrier, Stratégie, Retombées…) qui n'existent pas pour `/ma-marque` ou `/outils` au même niveau de profondeur. Asymétrie de profondeur narrative. `/programme` est-il plus "important" doctrinalement ? Probablement oui (c'est là que vit le plan éditorial), mais l'asymétrie n'est pas explicitée.

8. **Aucune persona switcher** : pas de bouton "passer en mode fondateur·rice" vs "responsable comm". Le `pilot_role` saisi à l'onboarding (workflow A étape 5) est stocké dans `profiles.pilot_role` mais aucune UI ne l'expose après. Doctrine "tu pilotes" mentionnée mais non actée.

9. **`/login`** sans header/avatar — incohérence narrative avec le reste de l'app. Le pilote ne sent pas qu'il "entre" dans Creative Fair, il atterrit dans un formulaire.

10. **6 promesses CF** : (a) tranquillité ✅ pas de bruit nav, (b) signature visuelle ⚠️ densité halos cassée, (c) possessifs ✅, (d) tutoiement ✅, (e) pilote pilote ✅ raccourcis clavier, (f) anti-gamification ✅ pas de badges/counters.

### Verdict : **Recalé partiel**

### Justification

La nav respecte la posture tranquille de Floriane (popover sobre, possessifs, raccourcis), mais (a) Nav 5 doctrine n'est implémentée qu'à 3/5, (b) Conseiller invisible dans la nav alors que la doctrine 12 mai 2026 le promeut au même niveau, (c) absence de logo CF dilue l'identité produit, (d) `pilot_role` saisi mais jamais réutilisé.

### Recommandations

- **P0** : Décider si "Conseiller" mérite une entrée nav dédiée (cf. doctrine Nav 5). Si oui, ajouter dans le popover (`UserMenuBubble.tsx:61-65`). Si non, mettre à jour la doctrine.
- **P0** : Ajouter "Aujourd'hui" en première entrée du popover (cohérence Nav 5).
- **P1** : Ajouter un logo "Creative Fair" cliquable en haut à gauche du PageHeader (cf. axe Hiroshi).
- **P2** : Documenter pourquoi `/programme` a une sidebar profonde que les autres pages n'ont pas — ADR sur l'architecture narrative.
- **P2** : Utiliser `profiles.pilot_role` pour personnaliser la copy ailleurs ("Ton équipe vient de…" si pilots vs "Tu viens de…" si owns).

---

## Synthèse du workflow

### Verdicts cumulés

| Axe | Verdict |
|---|---|
| Hiroshi UI | ❌ Recalé |
| Elena Archi | ⚠️ Recalé partiel |
| Sarah Copy | ✅ Validé |
| Marcus Workflow | ⚠️ Recalé partiel |
| Hélène Doctrine | ⚠️ Recalé partiel |

### Top fixes priorisés

- **P0** : Normaliser densité halos (0/3/5/6 → un seul nombre cohérent par zone).
- **P0** : Ajouter logo Creative Fair cliquable en haut à gauche (retour home + identifiant marque).
- **P0** : Décider Nav 5 doctrine — soit ajouter "Aujourd'hui" et "Conseiller" au popover, soit mettre à jour la doctrine à 3 destinations.
- **P0** : Trancher `PageHeader` vs `NavigationBar` (un seul header server component).
- **P1** : Brancher `BackButton` sur les sous-routes ou le retirer (code mort).
- **P1** : Cache `loadUserMeta` (PageHeader) — re-fetch sur chaque render trop coûteux.
- **P1** : Ajouter raccourci `⌘0` vers `/aujourd-hui`.
- **P1** : Tokeniser les couleurs hardcoded `Breadcrumb.tsx`.
- **P1** : Unifier les patterns layout (sidebar persistante `/programme` vs catalogue `/outils` vs single column `/ma-marque`).
- **P2** : `prefetch={true}` sur les Link du popover.
- **P2** : Documenter le pattern CustomEvent BrandOnboardingHeaderCta.

### Verdict global workflow

**Recalé partiel** — la nav est sobre, prévisible et bien doctrinale côté copy (possessifs, tutoiement, anti-bruit). Mais la signature visuelle est diluée (halos 0/3/5/6), la doctrine "Nav 5" n'est tenue qu'à 3/5, et plusieurs composants sont en dette technique (BackButton orphelin, NavigationBar redondant, BrandOnboardingHeaderCta avec custom event fragile).

### Friction quantifiée

- Nombre de clics pour changer de page mère : **2** (click avatar + click destination) ou **1 raccourci clavier** (⌘1/2/3)
- Nombre de clics pour revenir à `/aujourd-hui` depuis une sous-route : **1** (breadcrumb 12px) — pas de raccourci clavier
- Nombre de raccourcis clavier : **4** (⌘1, ⌘2, ⌘3, ⌘,) — manque ⌘0 (Aujourd'hui) et ⌘4 (Conseiller)
- Nombre de destinations dans le popover : **3** (Mon Programme, Ma Marque, Mes Outils) + Mon compte + Déconnexion. Doctrine demande 5.
- Profondeur breadcrumb maximale identifiée : **3 niveaux** (Aujourd'hui › Outils › Conseiller). Acceptable Apple HIG.
- Latence LLM nav : **0** (nav purement client)
- Temps total Floriane pour explorer toutes les pages mères : **~30-45 secondes** (3 destinations + retour breadcrumb)

### Anti-patterns détectés (cross-pages)

1. **Densité halos en désordre** : 0/3/5/6 selon page mère ou sous-route. Pas de règle documentée. Signature CF se dilue.
2. **Double Server Component header** : `PageHeader.tsx` (148 LOC) + `NavigationBar.tsx` (136 LOC) avec logique fetch user/brand quasi-identique. À consolider.
3. **Pas de logo Creative Fair persistant** : la marque produit s'efface derrière les noms de section. Anti-pattern web (Apple Settings n'a pas de logo mais Apple a un identifiant ambiant fort).
4. **Doctrine Nav 5 ≠ implémentation à 3** : promesse non tenue. Aujourd'hui caché dans le breadcrumb, Conseiller enfoui 2 niveaux profond.
5. **BackButton orphelin** : composant créé Sprint 36.B.1 "pour usage futur", 0 usage actif. Code mort.
6. **NavigationBar Sprint 33 / PageHeader Sprint 36.B.5 cohabitent** : la transition entre les deux n'est pas finie. Dette de refactor.
7. **CustomEvent dispatching** pour `BrandOnboardingHeaderCta` : pattern fragile, hard to debug, à documenter ou simplifier.
8. **`pilot_role` saisi mais jamais relu** : la persona du pilote (fondateur·rice vs responsable comm) influence la copy potentielle mais aucune branche le consomme post-onboarding.
9. **Trois patterns layout différents** : `/programme` (sidebar 280px sticky), `/outils` (2 colonnes 36/64), `/ma-marque` (single column 1200px). Pas de hiérarchie narrative qui justifie l'asymétrie.
10. **Mobile breakpoint isolé** : seul `ProgrammeSplitShell` déclare `@media (max-width: 900px)`. Les autres pages mères n'ont pas de stratégie responsive identifiable.
