# ABORT — Gate intermédiaire bloqué sur architecture des routes

**Date** : 2026-05-09
**Sprint** : 32.5 — Gate intermédiaire (vérification 3/6 : `npm run build`)
**Branche** : `sprint-32-5-and-33`
**Commit en cause** : `817f96d` (feat: Sprint 32.5 — refonte architecturale)

## Vérifications passées avant blocker

1. ✅ `npx tsc --noEmit` → 0 erreur
2. ✅ `npm run lint` → 0 erreur (11 warnings sur args `_var` intentionnellement préfixés, conformes ESLint convention)

## Vérification 3 — `npm run build` : **ÉCHEC**

```
Error: Turbopack build failed with 2 errors:
./app/(outils)
You cannot have two parallel pages that resolve to the same path. Please check /(accueil) and /(outils).

./app/(programme)
You cannot have two parallel pages that resolve to the same path. Please check /(outils) and /(programme).
```

## Cause profonde

Le cahier §15.2 décrit l'arborescence cible suivante :

```
app/
├── (accueil)/
│   └── page.tsx                # bifurcation Mode 1 / Mode 2
├── (programme)/
│   ├── page.tsx                # Mon Programme
│   └── post/[postId]/page.tsx
├── (outils)/
│   ├── page.tsx                # catalogue Mes Outils
│   ├── post-creator/page.tsx
│   ├── moodboard/page.tsx
│   ├── variations/page.tsx
│   ├── reviews/page.tsx
│   └── conseiller/page.tsx
```

Or, dans Next.js App Router, **un route group `(name)` n'apparaît jamais dans l'URL**. En conséquence :

- `app/(accueil)/page.tsx` résout vers `/`
- `app/(programme)/page.tsx` résout aussi vers `/`
- `app/(outils)/page.tsx` résout aussi vers `/`

Trois fichiers `page.tsx` qui visent la même URL `/` : Next.js refuse explicitement (parallel pages collision).

De même, les pages enfants entrent en collision :
- `app/(programme)/post/[postId]/page.tsx` → `/post/[postId]`
- `app/(outils)/post-creator/page.tsx` → `/post-creator`
- `app/(outils)/moodboard/page.tsx` → `/moodboard`
- etc.

Toutes ces URLs sont à la racine, alors que la structure produit attendue serait `/programme`, `/programme/post/[postId]`, `/outils`, `/outils/post-creator`, etc.

## Pourquoi pas de fix créatif

Deux interprétations possibles, indistinguables sans le Lead :

**Option A — Le cahier est littéral.** Toutes les pages cibles résident à la racine ; les route groups ne servent qu'à isoler les layouts. Cela impose UN SEUL `page.tsx` à la racine (probablement celui d'`(accueil)`), et déplace les autres pages dans des sous-arbres explicites comme `(programme)/programme/page.tsx`, `(outils)/outils/page.tsx`. **Mais alors l'arborescence du cahier est fautive** — les pages écrites comme `(programme)/page.tsx` doivent en réalité être `(programme)/programme/page.tsx`.

**Option B — La structure produit est différente.** Peut-être qu'`(accueil)` n'est PAS à `/` mais à `/accueil`, et que la racine `/` redirige. Ou peut-être qu'un seul des groups occupe `/` et les autres sont sous-pathés explicitement.

**Option C — Réécriture des URLs via proxy.ts.** Théoriquement possible mais pas évoqué dans le cahier et étend significativement la surface.

Je ne peux trancher entre A et B sans consulter le Lead. Le protocole interdit les fix créatifs. **ABORT.**

## État de la mission

- Branche `sprint-32-5-and-33` à HEAD `817f96d`
- Working tree propre
- Aucun tag posé
- Sprint 33 non démarré

## Action requise par le Lead

1. Trancher l'architecture : quelle URL pour chaque page ?
2. Mettre à jour le cahier §15.2 si nécessaire
3. Indiquer la convention à appliquer (probablement : déplacer chaque `page.tsx` racine du group vers un sous-dossier portant le nom du group, sauf `(accueil)/page.tsx` qui occupe `/`)
4. Relancer la mission depuis Chantier B (route groups + stubs) ou m'autoriser à appliquer la convention sur la branche existante

## Recommandation soustraction (à valider par le Lead avant exécution)

L'arrangement le plus probablement intentionné, vu le contexte produit :

```
app/(accueil)/page.tsx                          → /
app/(programme)/programme/page.tsx              → /programme
app/(programme)/programme/post/[postId]/page.tsx → /programme/post/[postId]
app/(outils)/outils/page.tsx                    → /outils
app/(outils)/outils/post-creator/page.tsx       → /outils/post-creator
app/(outils)/outils/moodboard/page.tsx          → /outils/moodboard
app/(outils)/outils/variations/page.tsx         → /outils/variations
app/(outils)/outils/reviews/page.tsx            → /outils/reviews
app/(outils)/outils/conseiller/page.tsx         → /outils/conseiller
app/(compte)/ma-marque/page.tsx                 → /ma-marque  (déjà conforme)
app/(compte)/mon-compte/page.tsx                → /mon-compte (déjà conforme)
app/(compte)/parametres/page.tsx                → /parametres (déjà conforme)
app/(onboarding)/analyse-marque/page.tsx        → /analyse-marque (déjà conforme)
```

Soit 5 fichiers à déplacer (`mv`), aucun nouveau fichier à créer. Le proxy.ts a déjà les bons paths protégés (`/onboarding`, `/programme`, `/outils`, `/compte`, `/admin`) — sauf que `/onboarding` ne correspond à rien (la seule page sous (onboarding) est `/analyse-marque`). À revoir aussi.

Si le Lead valide ce plan : opération mécanique de 5 minutes, Gate intermédiaire repassé, tag v1.1.5, Sprint 33 enchaîne.
