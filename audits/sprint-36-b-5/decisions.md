# Sprint 36.B.5 — Patches visuels post-validation 36.B.4

Branche `sprint-36-b-5` (basée sur `sprint-36-b-4` HEAD `1ecbfb7`).
1 commit. Build OK, tsc OK, lint OK. Pas de push, pas de tag.
Migration 010 écrite mais **non appliquée** (procédure Lead 30 s dans
`migrations.md`). Aucune nouvelle page.

## Cadre doctrinal respecté

- Aucun `#1F4937` introduit (`git diff sprint-36-b-4 | grep #1F4937`
  → AUCUN).
- Aucun pourcentage chiffré global. La `BarreFondations` n'écrit aucun
  chiffre dans la barre, ne s'anime pas au mount, pas de couleur saturée.
- Tutoiement partout. Aucune exclamation. Aucun emoji introduit.
- Liquid Glass 3 niveaux respectés.
- Pas de `window.confirm()` — la modale waitlist est un dialog custom
  avec sa propre escape + click-outside.
- Aucune mention "IA" — uniquement "Creative Fair".

## Patch 1 — Canaux activés : Instagram + waiting list

**Fichiers livrés** :

- `supabase/migrations/010_channel_waitlist.sql` — table `channel_waitlist`
  (id, tenant_id, brand_id, channel, email, created_at) + indexes + 3
  policies RLS via `public.user_tenant_id()`. **Non appliquée** — procédure
  dans `audits/sprint-36-b-5/migrations.md`.
- `app/api/brand/waitlist/route.ts` — GET / POST / DELETE. Traduit
  l'erreur Postgres "relation does not exist" en 503
  `migration_pending` propre quand la migration n'est pas appliquée.
- `components/icons/PlatformIcons.tsx` — 9 composants SVG monochrome
  inline (Instagram, LinkedIn, Newsletter, Globe, GoogleMyBusiness,
  TikTok, X, YouTube, Facebook). `currentColor`, taille 24×24 par
  défaut, accepte `size` et `style`. **Aucune librairie tierce**.
- `components/ma-marque/canaux/WaitlistModal.tsx` — dialog custom
  (pas de `window.confirm`). Email pré-rempli si dispo. Cas
  "déjà inscrit" : bouton "Me retirer" en variante destructive.
  Cas erreur 503 (migration_pending) : message d'erreur sobre,
  pas de crash, pas de toast intrusif.
- `components/ma-marque/canaux/SheetCanaux.tsx` — refonte complète
  en 3 blocs (Canal principal, Extensions V1, Bientôt).

### Architecture canaux

`types/ma-marque.ts` étendu :
- Nouveau `CanalId` = `'instagram' | 'linkedin' | 'newsletter' | 'site' | 'gmb'`.
- Nouveau type `CanalBientotId` = `'tiktok' | 'x' | 'youtube' | 'facebook'`.
- `CANAUX_VIDES.instagram = { actif: true, url: '' }` (canal principal
  toujours actif).
- `canauxNormaliser` rétro-compatible : si une brand legacy n'a pas
  `instagram` dans son JSONB, on le crée avec `{ actif: true, url: '' }`.
- `canauxActifs` exclut Instagram tant que son URL est vide (sinon
  Instagram s'affichait toujours dans la preview sans handle).

`/api/brand/update` mis à jour :
- `CANAUX_IDS` inclut `instagram`.
- `validateCanaux` accepte les payloads qui omettent `instagram` (compat
  ascendante) et le complète automatiquement.

### UI

**Canal principal** (Instagram) :
- Pas de toggle (toujours actif). Mention "Actif par défaut" en summary.
- Logo Instagram couleur normale (noir Apple).
- Input URL/handle modifiable, placeholder `@ta-marque`.

**Extensions V1** (LinkedIn / Newsletter / Site / GMB) :
- Liste en card unique Liquid Glass niveau 2, rangs séparés par
  hairlines.
- Toggle iOS 26 vert `#34C759`. URL apparaît en sous-ligne quand actif.

**Bientôt** (TikTok / X / YouTube / Facebook) :
- Logos `opacity: 0.4`. Labels couleur `rgba(0,0,0,0.6)`.
- Click sur "Notifier moi" (cfs-btn-secondaire compact) → WaitlistModal.
- Si déjà inscrit : pastille vert doux `rgba(52,199,89,0.12)` "Tu es
  sur la liste" → cliquable pour ouvrir la modale en mode retrait.
- Plus de bandeau "non couverts par Creative Fair V1" — remplacé par
  le bloc fonctionnel.

**Preview** :
- "Canal principal" mentionné en label uppercase 11 px à droite
  d'Instagram pour expliciter sa position.
- Mention en bas "Bientôt : TikTok, X, YouTube, Facebook" + ligne
  "Tu es sur la liste pour : <liste>" si l'utilisateur a des inscriptions.

## Patch 2 — Ma Marque : BarreFondations

**Fichiers livrés** :

- `components/ma-marque/BarreFondations.tsx` — barre 6 px, radius 3 px,
  background `rgba(0,0,0,0.06)`. 2 segments superposés : complets
  `#1C1C1E` plein, partiels `rgba(28,28,30,0.4)`. Pas d'animation au
  mount. Pas de chiffre dans la barre.
- `lib/ma-marque/completude.ts` étendu : nouveau `calculerAggregat`
  retourne `{ total, complets, partiels, prioritaires }` en un seul
  passage sur les 14 blocs.
- `components/ma-marque/EtatMarque.tsx` — refactorisé pour wrapper
  la phrase + la barre dans un container colonne. Calcul de l'aggregat
  via `calculerAggregat(snapshot)`.

### Doctrine anti-gamification

- Aucun pourcentage écrit. La phrase contextuelle dit "8 fondations
  sur 14" → c'est lisible, pas une jauge.
- La prop `prioritaires` est calculée et passée mais **non utilisée
  visuellement** pour ne pas tomber dans la gamification. Le point
  lilas sur les rangs prioritaires suffit. Documenté dans le commentaire
  du composant.
- Aucune animation au mount (anti fill spectaculaire).
- Couleurs sobres : noir Apple + gris transparent.
- Respect `prefers-reduced-motion` : pas d'animation, donc nothing
  to disable.
- `role="img"` + `aria-label="N blocs sur 14 en cours"` pour
  l'accessibilité.

## Patch 3 — PageHeader unifié

**Fichiers livrés** :

- `components/layout/PageHeader.tsx` — server component qui :
  - Récupère user/profile/brand via le même pattern que NavigationBar
    (factorisation différée — fonction `loadUserMeta` dupliquée pour
    éviter de modifier NavigationBar qui est listé "stable" en dette).
  - Rend `<Breadcrumb />` puis une ligne flex justify-between avec
    H1 à gauche et UserMenuTrigger (avatar bulle) à droite.
- CSS dans `app/globals.css` : `.cfs-page-header` (max-width 1200,
  padding 24, layout flex), `.cfs-page-header-row` (flex space-between,
  margin-top 4 entre breadcrumb et ligne H1+avatar), responsive < 768 px
  (padding 16, H1 24 px).

### Pages migrées

| Page | Avant | Après |
|---|---|---|
| `/programme` | `<NavigationBar title="" />` + breadcrumb+H1 dans ProgrammeHero | `<PageHeader title="Mon Programme" />` (le Hero démarre à l'intro contextuelle) |
| `/ma-marque` | `<NavigationBar title="" />` + breadcrumb+H1 dans MaMarqueDashboard | `<PageHeader title="Ma Marque" />` (le dashboard démarre à `EtatMarque`) |
| `/outils` | `<NavigationBar title="" />` + breadcrumb+H1 inline | `<PageHeader title="Mes Outils" />` |
| `/outils/conseiller` | breadcrumb+H1 inline | `<PageHeader title="Conseiller" />` |
| `/compte/mon-compte` | breadcrumb+H1 inline | `<PageHeader title="Mon compte" />` |

### Cas spécifique /programme (Split Brief 40/60)

PageHeader reste **hors du Split Brief**, en pleine largeur du
container 1200. Le Split Brief commence en dessous. Ligne H1 + avatar
visible avant la grille 40/60.

### Cas spécifique sheets

Les sheets (PiliersSheet, SheetCanaux, etc.) gardent leur header
interne dans SheetMaMarque (breadcrumb "Ma Marque › <bloc>" + titre
H1 + croix). PageHeader ne s'applique qu'aux pages mères. **Pas
de modification de SheetMaMarque** (consigne abort A5 respectée).

## Gate — vérifications

| # | Vérification | Résultat |
|---|---|---|
| 1 | `tsc --noEmit` | 0 erreur |
| 2 | `eslint --quiet` | 0 erreur |
| 3 | `next build` | succès, `/api/brand/waitlist` route visible |
| 4 | Anti-régression `#1F4937` | 0 ajout vs sprint-36-b-4 |
| 5 | Vocabulaire interdit | 0 hit dans le diff sprint |
| 6 | Emoji nouveau | 0 (le `✓` hérité Sprint 36.B.2 reste connu) |
| 7 | Working tree | clean après commit |
| 8 | Push / tag | aucun |
| 9 | Migration 010 sur prod | **non appliquée**, procédure Lead prête |
| 10 | Skill files | non touchés |
| 11 | SheetMaMarque / MarquePreview / MarqueRow | non modifiés (abort A5) |
| 12 | Liquid Glass canonique | non touché |

## Dette technique

- `loadUserMeta` dupliqué entre NavigationBar et PageHeader. À
  factoriser dans `lib/auth/loadUserMeta.ts` au prochain sprint
  (hors scope ce sprint, NavigationBar reste stable).
- NavigationBar peut maintenant être retirée de toutes les pages
  mères qui utilisent PageHeader — c'est déjà le cas dans ce sprint.
  À nettoyer si NavigationBar reste sans usage : déjà non importée
  dans les 5 pages migrées, mais reste utilisée par d'autres routes
  legacy (post-creator, moodboard, etc.). Pas de suppression
  prématurée.
- Le `✓` unicode dans `RessourcesPreview` (sprint 36-b-2) reste en dette.
- Composants legacy ma-marque (sprint 36-b-3) toujours en tree.

## Action Lead à l'arrivée

1. Valider visuellement les 3 patches en local ou preview Vercel.
2. Appliquer migration 010 (procédure 30 s dans `migrations.md`).
3. Si OK : push de `sprint-36-b-5` → merge sur main → tag `v1.6.0`.

Filet de sécurité : `git checkout main` revient à v1.5.0 en < 1 s.
La migration 010 est compatible avec le code de main (table inutilisée
par l'ancien code) — pas de rollback nécessaire si abandon.
