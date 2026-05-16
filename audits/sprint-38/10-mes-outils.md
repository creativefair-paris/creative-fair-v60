# Page : /outils (label nav "Mes Outils")

## Métadonnées
- Route : `/outils`
- Fichier source : `app/(outils)/outils/page.tsx`
- Composants principaux :
  - `<PageHeader>` (`components/layout/PageHeader.tsx`) — titre "Mes Outils"
  - `<OutilsCatalog>` (`components/outils/OutilsCatalog.tsx`) — orchestrateur catalogue 2 colonnes
  - `<ToolMockup>` (`components/outils/ToolMockup.tsx`) — mockups par outil (Sprint 37.D F28)
  - `<ConseillerIPhoneMockup>` (`components/outils/mockups/ConseillerIPhoneMockup.tsx`, Sprint 37.K F88)
  - `<InstagramIOSMockup>` (`components/outils/mockups/InstagramIOSMockup.tsx`)
  - `<InstagramStoryRing>` (`components/outils/mockups/InstagramStoryRing.tsx`)
  - `<PostCreatorHubPreview>` (`components/outils/previews/PostCreatorHubPreview.tsx`) — hub Post Creator inline (Sprint 37.I F78)
- Sous-routes : `/outils/conseiller`, `/outils/bibliotheque`, `/outils/post-creator`, `/outils/moodboard`, `/outils/variations`, `/outils/reviews`, `/outils/messages` (à venir).
- Server / Client : Page = Server Component minimal (auth + brand gate). `<OutilsCatalog>` = `'use client'` avec `useState` pour outil sélectionné.
- Screenshot : à produire côté Lead via `_capture.mjs` (auth requise).

## Lecture rapide
Catalogue des outils CF rendu en 2 colonnes : sidebar gauche (3 sections "Piloter" / "Créer" / "À venir"), preview droite toujours visible avec mockup spécifique par outil. Au chargement, Conseiller sélectionné par défaut comme "héros". Items "À venir" (Messages, Emailing, Reels, Films, Ads) sont disabled avec badge "Bientôt". Le Post Creator a un cas spécial : rendu inline en hub `<PostCreatorHubPreview>` au lieu d'un mockup statique.

---

## Axe 1 — Hiroshi (UI)

### Observations
1. Palette v60 respectée : `background: 'var(--color-background)'` (`app/(outils)/outils/page.tsx:35`).
2. Halos statiques 1-5 (`page.tsx:37-41`) — conforme.
3. Aucune occurrence `#1F4937` dans `components/outils/` (grep). Bon.
4. Grille catalogue : `grid-template-columns: 36% 64%` (`OutilsCatalog.tsx:295`). Variante de Split Brief (40/60 canonique), légèrement différente. À documenter pourquoi 36/64 ici.
5. Preview `position: sticky; top: 24px` (`OutilsCatalog.tsx:306`) — UX d'exploration confortable. Bon.
6. Mobile breakpoint `@media (max-width: 900px)` (`OutilsCatalog.tsx:308`) — single column. Bon.
7. Icônes SVG inline (10 icônes maison `PencilIcon`, `ImageStackIcon`, `GridIcon`, `StarIcon`, `BubbleIcon`, `BookIcon`, `MailIcon`, `PlayIcon`, `FilmIcon`, `MegaphoneIcon`) — `OutilsCatalog.tsx:24-103`. Stroke 1.6, rounded line cap. Apple-style. Bon.
8. Bleu `#007AFF` réservé à l'item sélectionné (sidebar `is-selected`) + bouton CTA primary (`OutilsCatalog.tsx:412, 423, 452`). Cohérent.
9. Hover sidebar : `rgba(0, 0, 0, 0.03)` (`OutilsCatalog.tsx:449`). OK.
10. **Hero `<CatalogRow>` Conseiller** : `background: linear-gradient(135deg, rgba(0, 122, 255, 0.06), rgba(88, 86, 214, 0.04))` (`OutilsCatalog.tsx:455`) — gradient bleu→indigo. Apple subtle, bon mais c'est le seul élément à utiliser un gradient → unicité visuelle, conforme doctrine "le héros se voit".
11. Tokens utilisés : `var(--color-tertiary-label)`, `var(--color-secondary-label)`, `var(--color-label)` partout (lignes 344, 412, 423, 547). Bon respect des tokens.
12. `prefers-reduced-motion` respecté (`OutilsCatalog.tsx:463-465`). Bon a11y.
13. Touch target `<CatalogRow>` : `padding: '14px 16px'` (`OutilsCatalog.tsx:391`) ≈ 48px. ≥ 44px iOS. Bon.
14. Touch target bouton "Bientôt" badge : `padding: '2px 6px'`, font 10px — décoratif, non interactif. OK.
15. Touch target CTA primaire preview : utilise classe globale `btn-primary` (`OutilsCatalog.tsx:537`) — à valider dans `globals.css`.
16. Liquid Glass preview : `background: 'rgba(251, 250, 247, 0.7)'` + `border-radius: 20` + `box-shadow: '0 8px 32px rgba(0, 0, 0, 0.04)'` (`OutilsCatalog.tsx:478-483`). Pas de `backdrop-filter` ici (la couleur de fond est déjà translucide sur halos). Conforme.
17. `aria-current` correctement utilisé sur l'item sélectionné (`OutilsCatalog.tsx:384`). Bon a11y.
18. `aria-live="polite"` sur la zone preview (`OutilsCatalog.tsx:282`) — annonce le changement à screen reader. Excellent.
19. `aria-label="Catalogue des outils"` sur la sidebar (`OutilsCatalog.tsx:261`) — bon.
20. Icône preview : 44×44px (`OutilsCatalog.tsx:493-494`), color `#007AFF` background `rgba(0, 122, 255, 0.08)`. Bon.
21. Espacements : `gap: 32`, `padding 32px 36px`, `gap: 24`, `gap: 16`, `gap: 12`, `gap: 8`, `gap: 6`, `gap: 4`, `gap: 2` — grille canonique respectée.
22. `disabled` style item "À venir" : `opacity: 0.4`, `cursor: 'not-allowed'` (`OutilsCatalog.tsx:394, 461`). Clair.
23. Badge "Bientôt" `rgba(0, 0, 0, 0.05)` background — discret, OK.
24. **Couleur en dur `#007AFF`** : 7 occurrences dans `OutilsCatalog.tsx` (412, 423, 452, 499, 500, etc.). Devrait passer par token `var(--color-system-blue)` (défini `globals.css:20`).

### Verdict : **Validé**

### Justification
Palette propre, halos statiques, icônes Apple-style cohérentes, hover discret, a11y soignée (aria-current, aria-live, prefers-reduced-motion), tokens largement utilisés, Liquid Glass implicite via translucide. Le hero Conseiller est subtil et bien dosé. Grille 36/64 est une variante consciente du 40/60. Touch targets ≥ 44px sur les rangées sidebar.

### Recommandations
- **P1** : Remplacer les 7 occurrences de `#007AFF` en dur par `var(--color-system-blue)` pour cohérence.
- **P2** : Documenter pourquoi 36/64 ici alors que 40/60 canonique ailleurs (ou aligner).

---

## Axe 2 — Elena (Archi)

### Observations
1. Server Component minimal : `page.tsx` ne fait que l'auth + brand gate + `<OutilsCatalog>` (`page.tsx:11-69`). Bonne séparation.
2. Pas de fetch dynamique pour le catalogue — données statiques hardcodées dans `OutilsCatalog.tsx:119-248`. Choix légitime : le catalogue ne dépend pas du pilote. Bon.
3. RLS : aucun appel Supabase dans `<OutilsCatalog>` — pas de risque. La page lit `profiles` et `brand` uniquement pour la gate (`page.tsx:18-30`).
4. Client Component avec `useState<string>('conseiller')` (`OutilsCatalog.tsx:256`) — state minimaliste pour outil sélectionné. Pas de localStorage (acceptable : Conseiller par défaut au mount, pas de persistence inter-session).
5. Pas de Server Action sur cette page. La page est lecture-seule.
6. Le composant `<OutilsCatalog>` est gros : 618 lignes, contient 10 icônes inline + 3 sous-composants (`CatalogSection`, `CatalogRow`, `OutilPreview`) + helper `outilToMockupType` + types `Outil`. Pourrait être éclaté pour lisibilité.
7. Mapping `outilToMockupType` (`OutilsCatalog.tsx:596-617`) duplique la liste des ids — risque de drift si on ajoute un nouvel outil sans MAJ ce mapping. Recalé maintenabilité.
8. Données statiques `PILOTER`, `CREER`, `A_VENIR` sont `ReadonlyArray` — bon pour immutabilité TS.
9. `ALL_OUTILS = [...PILOTER, ...CREER, ...A_VENIR]` (`OutilsCatalog.tsx:250`) — concat statique, OK.
10. `ALL_OUTILS.find(...) ?? PILOTER[0]!` fallback (`OutilsCatalog.tsx:257`) — robust en cas d'ID inconnu.
11. La sous-route `/outils/post-creator` est désactivée et remplacée par `PostCreatorHubPreview` inline (commentaire `OutilsCatalog.tsx:283-284`). Mais le `href: '/outils/post-creator'` (`OutilsCatalog.tsx:152`) est toujours dans les données — le bouton CTA "Créer un post" pointe vers cette route. Cohérence à vérifier. Si la route existe encore (`ls outils/` → `post-creator` directory existe), elle peut être un hub aussi.
12. Pas de loading.tsx / error.tsx dans `app/(outils)/` (`ls` → seulement `layout.tsx` + `outils/`). Friction.

### Verdict : **Validé**

### Justification
Architecture saine : Server Component minimal pour la gate, Client Component léger pour le state d'UI, données statiques pour le catalogue. Pas d'appel Supabase superflu. Bonne séparation. Les bémols sont mineurs : duplication ID dans `outilToMockupType` et fichier `<OutilsCatalog>` un peu long.

### Recommandations
- **P1** : Éclater `OutilsCatalog.tsx` (618 lignes) en sous-fichiers : `outils-data.ts` (PILOTER/CREER/A_VENIR), `OutilsCatalogRow.tsx`, `OutilsCatalogPreview.tsx`, `OutilsIcons.tsx`.
- **P1** : Centraliser la liste d'ids dans un seul tableau pour éliminer la duplication `outilToMockupType` (par ex. `MOCKUP_TYPES` derived).
- **P2** : Créer `app/(outils)/loading.tsx` (squelette catalogue 2 colonnes).
- **P2** : Créer `app/(outils)/error.tsx`.
- **P2** : Auditer si `/outils/post-creator` doit rester une route ou être supprimée (cohérence avec hub inline).

---

## Axe 3 — Sarah (Copy)

### Observations
1. Tutoiement systématique : "Ton assistant éditorial disponible en continu." (`OutilsCatalog.tsx:123`), "Tout ce que tu as, en un seul endroit." (ligne 135), "Rédige et programme tes publications." (ligne 149), "Décline une image en 6 angles." (ligne 171). Floriane.
2. Possessif : "Mes Outils" titre header (`page.tsx:53`). Bon.
3. **"Conseiller" majuscule** : `title: 'Conseiller'` (`OutilsCatalog.tsx:122`) — c'est le label affiché dans la sidebar ET en preview header (`OutilsCatalog.tsx:518` rend `{outil.title}`). **Recalé doctrine** : la spec demande "conseiller" minuscule en UI.
4. "Conseiller (héros)" dans commentaire (`OutilsCatalog.tsx:8`) — code, pas UI. OK.
5. Description courte Conseiller : "Ton assistant éditorial disponible en continu." (ligne 123) — bien.
6. Description longue : "Pour affiner un pilier, recadrer un post, trancher une opportunité, ou préparer ta réunion." (ligne 125) — verbes d'action concrets, Floriane.
7. CTA primaire Conseiller : "Poser une question" (`OutilsCatalog.tsx:127`) — infinitif net.
8. Bibliothèque : "Brand book, posts publiés, conversations conseiller, reviews, programmes" (ligne 137) — "conseiller" minuscule. Bon. Mais "Brand book" anglicisme déjà signalé (audit 09).
9. Post Creator : "Rédige et programme tes publications Instagram. Chaque post part d'un de tes piliers narratifs et garde la voix de ta marque." (ligne 151) — Floriane, mention "piliers narratifs" et "voix de ta marque" ancrage doctrine.
10. Moodboard : "Génère des images d'ambiance qui collent à l'univers visuel de ta marque, pour cadrer un photographe ou poser une direction artistique." (ligne 162) — Floriane, professionnel.
11. Reviews : "Fact-check du texte (TF Éditorial Magazine) et identification des crédits du visuel (TF Archives & Mémoire)." (ligne 184) — bonne référence aux Task Forces internes.
12. **Vocabulaire interdit** :
    - "**performance**" dans la shortDescription Ads : "Campagnes paid social et performance." (`OutilsCatalog.tsx:240`). Recalé doctrine Sarah.
    - "**performance**" dans la longDescription Ads (sub-ligne 242) — implicite "pilote tes campagnes paid social". Le terme "paid social" est jargon. Acceptable si Ads section TF.
    - "A/B test, ciblage, audience saving, lookalike" (ligne 242) → jargon Meta Ads. Acceptable car interne Ads.
13. "Bientôt" badge (`OutilsCatalog.tsx:442`) — sobre, OK.
14. "Bientôt disponible dans Creative Fair." (`OutilsCatalog.tsx:551`) — neutre, OK.
15. "Décliner une image" (`OutilsCatalog.tsx:175`), "Vérifier un post" (ligne 186) — infinitif net.
16. Section labels sidebar : "Piloter" / "Créer" / "À venir" — verbe d'action + verbe d'attente. Bon.

### Verdict : **Recalé partiel**

### Justification
Tutoiement et ton Floriane bien tenus, ancrage doctrinaire (piliers, voix, Task Forces) dans les descriptions. **MAIS** (a) "Conseiller" majuscule dans le titre UI viole la règle "conseiller minuscule" ; (b) "performance" dans Ads shortDescription contrevient au vocabulaire interdit ; (c) "Brand book" anglicisme déjà signalé.

### Recommandations
- **P0** : `title: 'Conseiller'` → `title: 'conseiller'` (`OutilsCatalog.tsx:122`). Cascade dans le label sidebar + le H2 preview.
- **P0** : "Campagnes paid social et performance." (`OutilsCatalog.tsx:240`) → reformuler sans "performance". Ex : "Campagnes Meta Ads pour amplifier ta signature."
- **P2** : Audit Sarah cross-files pour "conseiller" minuscule + "performance"/"métrique"/"KPI" résiduels.

---

## Axe 4 — Marcus (Workflow)

### Observations
1. Pas de `loading.tsx` ni `error.tsx` dans `app/(outils)/`. Friction.
2. Conseiller sélectionné par défaut au mount (`OutilsCatalog.tsx:256`) — bon onboarding implicite.
3. Items "À venir" disabled avec badge "Bientôt" (`OutilsCatalog.tsx:429-444`) — pas de fausse promesse. Bon.
4. `disabled={!isActive}` (`OutilsCatalog.tsx:383`) — non-cliquable. Bon.
5. `aria-current` sur item sélectionné, `aria-live` sur preview (`OutilsCatalog.tsx:384, 282`) — bonne a11y dynamique.
6. Preview en `position: sticky` (`OutilsCatalog.tsx:306`) — UX d'exploration : le pilote scroll la sidebar tout en gardant la preview visible. Excellent.
7. CTA primaire vise la sous-route de l'outil (`OutilsCatalog.tsx:535-540`) — navigation prévisible.
8. Mobile : single column, preview en position static (`OutilsCatalog.tsx:308-315`). Bon adaptive.
9. Hover sidebar : `rgba(0, 0, 0, 0.03)` (`OutilsCatalog.tsx:449`) — feedback subtil.
10. Hover hero (Conseiller non sélectionné) : intensifie le gradient (`OutilsCatalog.tsx:457-459`). Apple subtle.
11. **`<CatalogRow>` est un `<button>`** — clavier OK (Tab + Enter/Space natif).
12. Pas de focus-visible défini dans `cfs-catalog-row` — repose sur l'outline natif navigateur. Acceptable.
13. Mockups statiques : pas de loading state, pas d'animation. Bon (anti-distraction).
14. `<PostCreatorHubPreview>` rendu inline pour le Post Creator (`OutilsCatalog.tsx:285-286`) — pas de navigation supplémentaire pour explorer ce hub. Bon UX d'éclatement progressif.
15. Pas de confirmation destructrice (page lecture-seule). NA.
16. Touch target rangées : `padding: '14px 16px'` ≈ 48px. Bon.
17. Conseiller au click sidebar → MAJ preview ; CTA "Poser une question" → navigue vers `/outils/conseiller`. Distinction explore/commit propre.

### Verdict : **Validé**

### Justification
Workflow propre : Conseiller héros sélectionné par défaut, preview sticky pour exploration, items disabled clair, navigation prévisible. Bonne a11y. Le seul manque est `loading.tsx` / `error.tsx`.

### Recommandations
- **P2** : Créer `app/(outils)/loading.tsx` et `app/(outils)/error.tsx`.
- **P2** : Définir un `:focus-visible` explicite sur `cfs-catalog-row` pour a11y clavier homogène avec les autres pages.

---

## Axe 5 — Hélène M. (Doctrine)

### Observations
1. La page est une **incarnation directe** de la doctrine "Mes Outils" : Conseiller héros, Bibliothèque, Créer (Post Creator + Moodboard + Variations + Reviews), À venir. Conforme architecture v60.
2. Conseiller en héros (`hero: true`, `OutilsCatalog.tsx:129`) — alignement doctrine "le conseiller est le compagnon principal".
3. Sections sidebar : "Piloter" / "Créer" / "À venir" — taxonomie cohérente avec la doctrine CF (piloter = utiliser, créer = produire, à venir = roadmap honnête).
4. Mention explicite des Task Forces dans Reviews : "Fact-check du texte (TF Éditorial Magazine) et identification des crédits du visuel (TF Archives & Mémoire)." (`OutilsCatalog.tsx:184`) — la doctrine TF est exposée au pilote. Excellent.
5. **6 formats canoniques côté Post Creator** : pas mentionnés sur cette page (la mention "Anecdote / Produit / Événement / Coulisses / Manifeste / Question" arriverait dans `/outils/post-creator`). OK : la page `/outils` reste catalogue.
6. Le hub `<PostCreatorHubPreview>` (`PostCreatorHubPreview.tsx`) — à auditer plus en détail mais probablement où les 6 formats vivent.
7. Pas de jauge, pas de pourcentage, pas de streak. Conforme anti-gamification.
8. La section "À venir" liste Messages / Emailing / Reels / Films / Ads — feuille de route honnête, conforme doctrine "ne pas survendre".
9. Ads en "À venir" : cohérent avec "Sub-prompt TF Ads (Sofia P.) avec garde-fous d'intégrité de marque." (ligne 242) — la doctrine TF Ads est dans le descriptif. Bon.
10. **Drift doctrine cross-cutting** : `skills/00-CONCEPT.md`, `skills/10-SACRED.md`, `skills/01-ARCHITECTURE.md` — P0 synthèse.
11. Le commentaire `OutilsCatalog.tsx:7-13` "Sections (F23 reclassification) : Piloter / Créer / À venir" — bon ancrage Sprint.
12. Aucune trace de "engagement", "viral", "boost" en UI dans `components/outils/`. Conforme.
13. "Performance" dans Ads (`OutilsCatalog.tsx:240`) contredit la doctrine vocabulaire interdit, mais le contexte Ads est l'unique territoire où le langage business est partiellement toléré (cf. doctrine TF Ads "territoire souple"). À arbitrer.

### Verdict : **Validé**

### Justification
Page exemplaire du catalogue v60 : Conseiller héros, Task Forces visibles dans Reviews, taxonomie cohérente, roadmap honnête. Conforme doctrine. La seule réserve est "performance" en Ads — à arbitrer comme tolérance Ads (territoire souple) ou à reformuler.

### Recommandations
- **P1** : Arbitrer "performance" dans Ads (`OutilsCatalog.tsx:240`) : tolérance Ads territoire souple OU reformulation Floriane. Hélène à trancher.
- **P2** : Conserver la mention TF dans les descriptions (Reviews, Ads) — c'est une force pédagogique.

---

## Synthèse de la page

### Verdicts cumulés
| Axe | Verdict |
|---|---|
| Hiroshi UI | ✅ Validé |
| Elena Archi | ✅ Validé |
| Sarah Copy | ❌ Recalé partiel |
| Marcus Workflow | ✅ Validé |
| Hélène Doctrine | ✅ Validé |

### Top fixes priorisés
- **P0** :
  1. `title: 'Conseiller'` → `title: 'conseiller'` (`OutilsCatalog.tsx:122`).
  2. Reformuler "Campagnes paid social et performance." sans "performance" (`OutilsCatalog.tsx:240`).
- **P1** :
  1. Éclater `OutilsCatalog.tsx` (618 lignes) en sous-fichiers (data, row, preview, icons).
  2. Centraliser la liste d'ids pour éliminer duplication dans `outilToMockupType`.
  3. Remplacer `#007AFF` en dur (7 occurrences) par `var(--color-system-blue)`.
  4. Arbitrer "performance" Ads — territoire souple ou reformulation (Hélène).
- **P2** :
  1. Créer `app/(outils)/loading.tsx` et `error.tsx`.
  2. Documenter pourquoi grille 36/64 et non 40/60 canonique.
  3. Auditer si `/outils/post-creator` reste route séparée.
  4. `:focus-visible` explicite sur `cfs-catalog-row`.
  5. Audit Sarah cross-files pour "conseiller" + vocabulaire interdit.
  6. Arbitrer "Brand book" vs "Livre de marque" (cross-page).

### Verdict global page
**Recalé partiel** — Page bien architecturée, bien designée, bien orchestrée. Seuls 2 fix P0 copy (Conseiller capitalisation + performance Ads) à régler pour être référence.
