# Sprint 41 — Plan de remédiation

> **Combler les angles morts + Polish P2**
>
> 1 semaine. ~30 items P2 + 9 pages skipped Sprint 38.
> Critère ABORT : aucun.

---

## Objectif global

Le Sprint 38 a audité 21 pages + 4 workflows. **9 routes ont été
explicitement skippées** ou marquées comme angle mort. Sprint 41 les
audite et les corrige dans le même sprint (audit + fix groupés vu que
ces pages sont moins centrales).

En parallèle, Sprint 41 traite les ~30 items P2 cosmétiques restants
identifiés Sprint 38 mais non traités Sprint 40.

---

## Périmètre 1 — Audit + fix des 9 pages skippées

### Pages skippées (récapitulatif Sprint 38)

| # | Route | Fichier source | Pourquoi skippée S38 |
|---|---|---|---|
| 1 | `/` | `app/(accueil)/page.tsx` | Page accueil publique — hors nav 5 |
| 2 | `/compte/mon-compte` | `app/(compte)/compte/mon-compte/page.tsx` | Profil utilisateur — pas dans périmètre nav 5 |
| 3 | `/compte/parametres` | `app/(compte)/compte/parametres/page.tsx` | Idem |
| 4 | `/compte/ma-marque` | `app/(compte)/compte/ma-marque/page.tsx` | Page legacy probable (ma-marque V2 est `/ma-marque`) |
| 5 | `/compte/ma-marque/brand-book` | `app/(compte)/compte/ma-marque/brand-book/page.tsx` | Sous-route compte |
| 6 | `/compte/ma-marque/business-calendar` | `app/(compte)/compte/ma-marque/business-calendar/page.tsx` | Idem |
| 7 | `/programme/strategie` | `app/(programme)/programme/strategie/page.tsx` | Sous-route programme |
| 8 | `/programme/retombees` | `app/(programme)/programme/retombees/page.tsx` | Sous-route programme |
| 9 | `/programme/bienvenue` | `app/(programme)/programme/bienvenue/page.tsx` | Sous-route programme |

Plus, à creuser :
- `/programme/post/[postId]` (vue détail post)
- `/programme/posts/[postId]` (doublon ? legacy ?)
- `/programme/create` (création programme)
- `/outils/post-creator/[format]` (vue par format — 6 instances)

### S41.AUDIT.1 — Audit page accueil `/`

Fichier `app/(accueil)/page.tsx`. Probablement landing publique ou
redirect vers `/login` / `/aujourd-hui`.

Audit 5 axes complet, fichier `audits/sprint-41/01-accueil.md`.

**Attention spécifique** : si c'est une landing publique, vérifier la
copie marketing (ne pas y voir `users`, `audience`, etc.).

### S41.AUDIT.2 — Audit `/compte/mon-compte`

Profil utilisateur. Champs visibles : email, crédits, plan (12K€ setup
+ 15K€/an mentionné dans `00-CONCEPT.md:60`).

**Doctrine** : afficher "crédits" pas "tokens".

### S41.AUDIT.3 — Audit `/compte/parametres`

Paramètres globaux. À découvrir Sprint 41.

### S41.AUDIT.4 — Audit `/compte/ma-marque` (legacy probable)

Probablement la version "compte" de ma-marque, antérieure au `/ma-marque`
V2. Décision Sprint 41 : retirer la route legacy si effectivement
dupliquée, ou clarifier l'intention.

### S41.AUDIT.5-6 — Audit `/compte/ma-marque/brand-book` + `business-calendar`

Sous-routes du compte legacy. Si la route parent est retirée, ces
sous-routes le sont aussi. Sinon, audit séparé.

### S41.AUDIT.7 — Audit `/programme/strategie`

Page stratégie. Possiblement vues globales du programme : indicateurs,
objectifs, calibration.

**Vocabulaire** : "indicateurs éditoriaux" (cf. `components/strategie/IndicateursEditorialsList.tsx`)
— vérifier qu'on n'y voit pas `stats`, `metrics`, `KPI`, `performance`.

### S41.AUDIT.8 — Audit `/programme/retombees`

Retombées (résultats publication). Vocabulaire sensible — la doctrine
v60 interdit `engagement`, `growth`, `viral`. Pattern attendu :
`retombée` reste la dénomination canonique, pas remplacée par
`engagement`.

### S41.AUDIT.9 — Audit `/programme/bienvenue`

Probablement la page d'arrivée post-création programme.

### S41.AUDIT.10 — Audit `/outils/post-creator/[format]` (6 instances)

Une page dynamic route pour chaque format canonique. Audit profond
recommandé sur 1 format (Anecdote, le plus utilisé) puis spot-check
sur les 5 autres.

---

## Périmètre 2 — P2 cosmétiques restants

Les 30 items P2 du `90-priorisation-p0-p1-p2.md`. Sélection des plus
impactants pour le polish final :

### S41.P2.U.1 — Animations `glass-fade-in` / `glass-pop-in` cohérentes

Vérifier que toutes les apparitions de sheets/modales utilisent les
classes utilitaires définies dans `liquid-glass.css:66-69`.

### S41.P2.U.2 — Border-radius système

Tous les composants utilisent `var(--radius-sm)` / `--radius-md` /
`--radius-lg`. Grep `border-radius:` cross-files et migrer les valeurs
hardcodées (6px, 8px, 12px ad-hoc).

### S41.P2.U.3 — Halos cross-pages densité homogène

Sprint 40 a uniformisé densité 6 halos. Sprint 41 vérifie en captures
Playwright que les positions ne se chevauchent pas et créent une
"signature" reconnaissable.

### S41.P2.U.4 — Backdrop-filter fallback `@supports`

Audit cross-files :
```bash
grep -rEn "backdrop-filter" --include="*.tsx" --include="*.css"
```

Chaque usage doit avoir un fallback (cf. `liquid-glass.css:72-74`
`@supports not (backdrop-filter: blur(1px))`).

### S41.P2.U.5 — Z-index hiérarchie documentée

Créer `lib/ui/z-index.ts` ou commentaire dans `liquid-glass.css` :
```
--z-base: 1
--z-header: 10
--z-bottom-nav: 20
--z-sheet-backdrop: 50
--z-sheet: 51
--z-modal: 60
--z-toast: 70
--z-popover: 80
--z-tooltip: 90
```

### S41.P2.U.6 — Margins/paddings système

Grep ad-hoc `padding: 13px` etc. — migrer vers tokens espacement
système.

### S41.P2.U.7 — Icônes Lucide vs SVG custom

Décision : Lucide pour 99% des icônes, SVG custom uniquement pour
mockups (Instagram halos, etc.). Audit + nettoyage des SVG custom
inutiles.

### S41.P2.U.8 — Compteurs FR partout

Étendre helper `formatCount()` (Sprint 40 P1.U.16) à tous les
emplacements affichant des nombres > 1000.

### S41.P2.U.9 — Avatar `<DefaultBrandAvatar>` réutilisable

Sortir le composant interne de `InstagramIOSMockup.tsx` vers
`components/ui/Avatar.tsx` pour réutilisation ailleurs (header user,
sheet brand).

### S41.P2.U.10 — Skeleton unifié `<Skeleton>`

Créer un composant générique skeleton glass-z1 (cf. patterns Apple).

### S41.P2.U.11 — Boutons unifiés

`<PrimaryButton>`, `<SecondaryButton>`, `<DestructiveButton>` —
déjà esquissés dans `<PillarWizardSheet>`, à extraire en lib `ui/`.

### S41.P2.U.12 — Inputs unifiés

`<Input>`, `<Textarea>`, `<Select>` avec focus/error state cohérents.

### S41.P2.U.13 — Toast unifié (déjà Sprint 40 P1.W.4 — finition)

Polish de l'animation, finalisation des variants (success, error, info).

### S41.P2.U.14 — Spinner CF dégradé

Remplacer le spinner gris générique par un spinner gradient
`#007AFF → #A78BFA → #FB923C` (palette CF). Décoratif mais identitaire.

### S41.P2.U.15 — Empty state illustrations

Sortir des illustrations simples (1 SVG par empty state) au lieu de
texte plat + icône.

### S41.P2.C.1 — Audit voix Floriane sur system prompts LLM

Lire tous les system prompts dans :
- `lib/ai/prompts/system.ts`
- `lib/brand/*-prompt.ts`
- `lib/pillars/prompts.ts`
- `lib/ma-marque/prompts*.ts`

Vérifier cohérence ton : "pair senior", "tutoiement", "vocabulaire
éditorial", "pas de tiret long, pas d'emoji, pas de markdown".

### S41.P2.C.2 — Placeholders inputs

Audit : `vous@exemple.com` → `ton@email.com` ? Décision : "vous@exemple.com"
peut rester pour login (formel acceptable) mais "ton@email.com" si
on est ailleurs dans le flow.

### S41.P2.C.3 — Microcopie boutons cohérente

Convention :
- "Enregistrer" (vs "Sauvegarder") partout
- "Annuler" (vs "Retour") sur sheets
- "Continuer" (vs "Suivant" / "Valider") sur stepper
- "Démarrer" sur premier CTA

### S41.P2.C.4 — Tooltips explicatifs

Sur features peu intuitives : icône `?` discrète avec tooltip iOS-style.

Pages cibles :
- `/outils/post-creator` : tooltip sur chaque format ?
- `/programme/strategie` : tooltip sur indicateurs ?

### S41.P2.C.5 — Aide contextuelle

Sur sheets complexes (wizard piliers) : lien "Pourquoi cette question ?"
en bas qui ouvre un mini-sheet explicatif.

### S41.P2.C.6 — "Le conseiller réfléchit…"

Standard messages d'attente LLM. Sprint 41 audit que tous les états
loading LLM affichent ce pattern de phrase (vs spinner muet).

### S41.P2.C.7 — Page 404

Créer `app/not-found.tsx` Floriane-friendly :
> "Cette page n'existe pas. Retour à Aujourd'hui ?"

### S41.P2.C.8 — Page 500

`app/error.tsx` global Floriane-friendly :
> "Quelque chose s'est mis en travers. On peut réessayer ?"

### S41.P2.C.9 — Confirmation email login

Améliorer le message post-magic-link :
> "Lien envoyé. Vérifiez votre boîte mail."
→
> "Lien parti vers ta boîte. Pense à vérifier les spams si tu ne le
> vois pas dans 2 minutes."

(Note doctrine : "vous" → "tu" en passant.)

### S41.P2.C.10 — Citation anchor visible

Décision optionnelle : afficher la citation anchor "tableau de bord
simple et efficace, contrôle, pilote" dans une page About ou en
empty state de l'accueil public.

### S41.P2.A.1 — Typage strict server actions

Audit retours TypeScript des server actions :
- Toutes doivent retourner un discriminated union
  `{ ok: true; ... } | { ok: false; reason: string }`
- Aucun `any`, aucun `unknown` non guardé

### S41.P2.A.3 — Tree-shaking bundle audit

```bash
npm run build
ls -la .next/static/chunks/ | head -20
```

Identifier les chunks > 100KB et investiguer.

### S41.P2.A.4 — Dependency audit

```bash
npm audit
```

Régler les vulnérabilités High/Critical.

### S41.P2.A.5 — Schema types généré

```bash
npx supabase gen types typescript --project-id ugfnokdxdqaqapylafeq > types/supabase.ts
```

Migrer les types manuels `PillarRow`, `PostRow`, etc. vers types
auto-générés.

---

## Effort total Sprint 41

| Catégorie | Items | Effort |
|---|---|---|
| Audit 9 pages skipped + 6 formats | 14 audits | 3 jours |
| Fix issues found dans audits (estimé) | ~15 issues | 2 jours |
| P2 UI (15) | 15 | 2.5 jours |
| P2 Copy (10) | 10 | 1 jour |
| P2 Archi (5) | 5 | 1.5 jour |
| **Total** | **~45 items** | **~10 jours-homme** |

Pour 1 dev senior : Sprint 41 = 5 jours. Tight mais faisable car
beaucoup de P2 sont XS (15-30 min chacun).

---

## Critères de succès Sprint 41 (Validé/Recalé)

### Hard requirements

- ✅ Les 9 pages skipped Sprint 38 ont un audit dédié dans
  `audits/sprint-41/`
- ✅ Page 404 + page 500 globales en place
- ✅ Tous les empty states ont une illustration ou icône (pas texte
  plat)
- ✅ Toast iOS pattern utilisé partout (vs console.info)
- ✅ Types Supabase auto-générés
- ✅ npm audit 0 High/Critical
- ✅ Bundle size par route < 200KB (gzip)

### Soft requirements

- ✅ Tooltips explicatifs ajoutés sur features peu intuitives
- ✅ Lighthouse 95+ sur les 5 nav (vs 90+ Sprint 40)
- ✅ Spinner CF dégradé en place
- ✅ Composants `<PrimaryButton>` / `<Input>` / `<Skeleton>` extraits
- ✅ Citation anchor visible quelque part (décoratif)

---

## Risques + plans B

### Risque 1 — Pages skipped contiennent leurs propres P0

Probabilité : moyenne (page legacy `/compte/ma-marque` est suspecte).

Plan B :
- Si Sprint 41 audit révèle 5+ P0 sur les pages skipped → bumper
  Sprint 42 pour les traiter
- Idéalement Sprint 41 traite les P0 trouvés dans le même sprint
  (audit + fix groupés)

### Risque 2 — Types Supabase auto-générés cassent le code existant

Probabilité : élevée.

Plan B :
- Migration incrémentale : types auto-générés disponibles mais code
  utilise les types manuels en attendant
- Audit + fix au compile-time strict, étalé sur Sprint 41-42

### Risque 3 — Bundle size élevé après migrations (lazy imports manquants)

Probabilité : faible si Sprint 40 a bien fait son boulot.

Plan B : code-splitting agressif sur les sheets et wizards complexes
(`<PillarWizardSheet>`, `<BrandOnboardingStep>`, sheets ma-marque).

---

## Post-Sprint 41 — État attendu

- 0 P0/P1/P2 majeur ouvert
- Audit cross-repo complet (pages + workflows + sous-routes)
- UI polish bout-en-bout (illustrations, spinner CF, toasts)
- Doctrine documentation à jour
- Types stricts auto-générés
- Performance + Accessibility excellents

Le Sprint 41 livre le produit V1.5 — **prêt pour scale-up B2C V2 si
décision Apple Board** ou pour onboarding de 5-10 clients B2B
supplémentaires sans dette technique.

---

## Stratégie Sprint 42+

À l'issue de Sprint 41, le repo est en état "production-ready V1.5".
Décisions à prendre en Apple Board pour Sprint 42-44 :

1. **Self-service B2C 49€/mois** : ouvrir `/signup` public ? Repose
   sur des questions doctrine (anti-gamification, voice sheet,
   onboarding 4 → 7-10 questions guidées étendues)
2. **Auto-publication Instagram** : actuellement les posts sont
   manuellement publiés. V2 pourrait offrir la publication directe
   via Meta Graph API
3. **Multi-marque par tenant** : actuellement 1 tenant = 1 brand.
   V2 pourrait permettre à un dirigeant de gérer plusieurs marques
   (sa marque perso + sa boîte) sous le même login
4. **Analytics tenant-side privacy-friendly** : doctrine v60 interdit
   "engagement" et "analytics" — V2 pourrait introduire un module
   "Retombées étendues" qui montre l'évolution sans utiliser ces
   mots (vocabulaire à inventer)

Ces 4 chantiers V2 dépendent de la validation du V1.5 par les 3
clients pilotes. Sprint 41 doit servir de **livrable pivot** pour
décider Apple Board.
