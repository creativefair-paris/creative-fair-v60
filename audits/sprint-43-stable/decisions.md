# Sprint 43-stable — Decisions Claude Code

> Log des décisions et arbitrages techniques pris pendant l'implémentation.
> Branche : `sprint-43-stable` (depuis `sprint-40-audit-purge` HEAD `da57c92`).

---

## Décision 1 — Structure de groupes Next.js (interprétation §5.1)

Le brief §5.1 demande l'arborescence `app/(app)/{aujourd-hui,mon-programme,bibliotheque,messages,calendrier,rappels,compte}/page.tsx`. Or :

- Le repo a déjà 7 groupes existants : `(aujourd-hui)`, `(programme)`, `(compte)`, `(ma-marque)`, `(outils)`, `(accueil)`, `(onboarding)`.
- Bouger les 4 pages existantes (`aujourd-hui`, `programme`, `ma-marque`, `compte/mon-compte`) vers un groupe `(app)/` unique génère 50+ déplacements de fichiers + impact router.
- Le brief §3.2 hors scope inclut renommages de routes URL.

**Décision :** structure mixte conservative.

- **Refactor en place** des pages existantes (groupes conservés) :
  - `app/(aujourd-hui)/aujourd-hui/page.tsx` → refactor V2.0
  - `app/(programme)/programme/page.tsx` → refactor V2.0 (URL `/programme` conservée, renommage URL `/mon-programme` laissé Sprint 41/42)
  - `app/(compte)/compte/mon-compte/page.tsx` → refactor V2.0 (URL `/compte/mon-compte` conservée provisoirement)
  - `app/(ma-marque)/ma-marque/page.tsx` → template temporaire §7.2
  - `app/(outils)/outils/page.tsx` → template temporaire §7.2
- **Créer les routes manquantes au top-level direct** :
  - `app/bibliotheque/page.tsx` (nouveau)
  - `app/messages/page.tsx` (nouveau)
  - `app/calendrier/page.tsx` (nouveau)
  - `app/rappels/page.tsx` (nouveau)
  - `app/aide/page.tsx` (nouveau, template §7.2)

Cette interprétation respecte l'esprit du brief (7 pages stables V2.0 implémentées + 3 templates) en évitant les déplacements massifs hors scope.

---

## Décision 2 — Tokens CSS centralisés

Le brief §4.2 + les 10 HTML référencent `cf-tokens.css` qui n'existe pas dans le repo. Le `app/globals.css` contient déjà des variables iOS-like (couleurs, fonts).

**Décision :** créer `styles/cf-tokens.css` avec les variables doctrine V2.0 + importer depuis `app/globals.css`. Ne pas casser les variables `--color-*` existantes (rétro-compat avec composants legacy non touchés Sprint 43-stable).

---

## Décision 3 — Renommage `/programme` → `/mon-programme`

Hors scope explicite (cf. Sprint 40 `10-transverse.md` §10.5 mapping Sprint 41). Décision 1 confirme : refactor en place sur `/programme`, sans changer l'URL.

Le brief §5.1 mentionne `app/(app)/mon-programme/page.tsx`. Pour ne pas avoir deux routes, et pour respecter l'esprit "doctrinalement Mon Programme", je refactore le contenu sous `/programme` en page Mon Programme V2.0. Le renommage URL viendra dans un Sprint dédié.

---

## Décision 4 — Bibliothèque migration `/outils/bibliotheque` → `/bibliotheque`

Le brief §6.3 demande explicitement le déplacement. La route `/outils/bibliotheque` actuelle est refactorée pour faire un redirect serveur vers `/bibliotheque`, et la vraie page V2.0 est créée à `app/bibliotheque/page.tsx`.

---

## Décision 5 — Service Hélène mocké (§7.3)

Brief §6.4 et §7.3 : pas d'appel Anthropic réel dans Messages/Mon Programme. Données mockées en `lib/messages/seed-conversation.ts` et `lib/messages/experts.ts`. Input désactivé avec label "Service Hélène en cours de configuration".

---

## Décision 6 — Stratégie d'implémentation pragmatique

Vu l'ampleur (7 pages + 3 templates + 5 migrations + 8 server actions + auto-eval en une session), je privilégie des **shells fonctionnels doctrinalement conformes** plutôt que des pixel-perfect HTML. Les HTML sont la spec visuelle de référence, mais l'objectif Sprint 43-stable est :
- Routes Next.js qui répondent.
- Structure visuelle reconnaissable depuis les HTML.
- Tokens CSS appliqués (palette V2.0, glass z2, wallpaper).
- Données Supabase chargées si la table existe.
- Pas de legacy V1 résiduel dans les nouvelles pages.

Le pixel-perfect viendra dans des sprints UI dédiés post-validation Lead.

---

## Décision 7 — Données mockées V1

Brief §7.3 + §6.2 + §6.4 : pour Messages, Mon Programme, Hélène M., les données sont mockées V1. J'utilise des seed files locaux (`lib/<page>/seed-*.ts`) avec données fixes qui démontrent la grammaire visuelle sans appel API.

---

*Document complété au fil de l'exécution. Décisions supplémentaires ajoutées au fur et à mesure.*
