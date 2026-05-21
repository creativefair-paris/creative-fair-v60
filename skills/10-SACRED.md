# Creative Fair — SACRED v2.0

> **Règles non-négociables.**
> Si tu envisages de modifier l'une de ces règles : STOP. Demande validation Lead explicite.
> Mis à jour le 21 mai 2026 (Sprint 39).

---

## Code

### `lib/ai/prompts/system.ts` est SACRÉ

Contient les `VOICE_SHEET_RULES` injectées avec `cache_control: ephemeral` dans tous les system prompts.

**Modifier ce fichier casse le prompt cache Anthropic à 90%.** Coût : explosion de la facture + perte de cohérence de voix + régression qualité immédiate sur tous les outputs IA.

**Toute modification doit passer par un Sprint dédié et une validation Lead.**

### Les system prompts des Experts sont SACRÉS

`lib/ai/prompts/helene.ts` et `lib/ai/prompts/experts/*.ts` contiennent les voix singulières d'Hélène et des douze Experts. Mêmes contraintes que `system.ts`.

### Next.js 16 = `proxy.ts`

Pas `middleware.ts`. Pas d'exception.

### TypeScript strict

`noUncheckedIndexedAccess`, `noImplicitReturns`, pas de `any`. Server Components par défaut.

### `createAdmin()` jamais côté user

Pattern interdit : `createAdmin()` + `.eq("id", ...)` sans check `tenant_id`. C'est la faille multi-tenant du Sprint 38.

Voir `04-MULTI_TENANT.md` pour les cas légitimes de `createAdmin()`.

### Tables Supabase

Aucune table ne doit être ajoutée sans :
- Validation Lead
- Migration SQL versionnée dans `supabase/migrations/`
- Politique RLS écrite (SELECT/INSERT/UPDATE/DELETE)
- Test isolation à 5/5 via `scripts/test-multi-tenant.ts`

---

## Produit

### Navigation 8 destinations + 2 icônes système

Sidebar globale visible uniquement dans Aujourd'hui :

```
TRAVAIL
  Calendrier · Rappels · Bibliothèque · Messages

ÉDITORIAL
  Mon Programme · Ma Marque · Mes Outils

SYSTÈME (icônes seules en bas)
  Compte · Aide
```

**Toute proposition de modification (ajout/retrait de destination, fusion, reclassement) passe par un amendement de `00-CONCEPT.md` et `01-ARCHITECTURE.md`.**

L'ancienne nav 4 destinations (Aujourd'hui / Calendrier / Ma Marque / Conseiller) est **caduque** depuis le 20 mai 2026.

### Émotion centrale : tranquillité du pilote

Toute proposition qui crée :
- du bruit visuel
- de l'urgence
- de la pression
- de la culpabilité
- une métrique inventée qui simule un contrôle

est **recalée**.

### Vocabulaire interdit (en UI visible)

```
users           audience          dashboard
workflow        pipeline          tokens
radar           viral             boost
growth hack     bientôt           à venir
coming soon     KPI               ROI
onboarding (en UI)
gamification    streaks           badges           XP
```

Si quelqu'un (humain ou IA) écrit l'un de ces mots dans une copie utilisateur : **recalé immédiatement**.

Liste complète et nuances dans `00-CONCEPT.md` §9.

### Pas d'emoji, pas d'exclamation

Dans aucune copie utilisateur. Aucun cas d'exception.

### Pas de gamification, jamais

Pas de streaks. Pas de badges. Pas de XP. Pas de quêtes. Pas de niveaux. Pas de leaderboard.

---

## Hélène et les Experts

### 13 personnages canoniques, pas un de plus

Hélène M. + 12 Experts nommés (Sofia P., Léa Z., Capucine V., Jonas K., Albane R., Marc D., Inès B., Sébastien L., Valentine D., Antoine F., Camille O., Élise M.).

**Aucun Expert ajouté sans amendement de `02-EXPERTS.md`.**

### LLM par rôle (jamais Haiku pour un Expert)

- Hélène M. : **Opus 4.7**, sans exception.
- Experts conversationnels : **Opus 4.7 ou Sonnet 4.6** selon le rôle (voir `02-EXPERTS.md` §3).
- Tâches utilitaires invisibles (titres, résumés, extractions) : Haiku 4.5.

**Haiku 4.5 n'est jamais utilisé pour générer un livrable signé d'un Expert.**

### Hélène écoute toujours (mention visible)

Dans toute conversation directe avec un Expert, mention « Hélène suit cette conversation » visible.

Mode « Discussion confidentielle » disponible pour les usages exceptionnels où Floriane ne souhaite pas que Hélène ait accès au contexte.

---

## Design

### Palette canonique

- Fond : crème `#FBFAF7`
- Accent primaire : bleu CF `#007AFF`
- Pastels secondaires : lilas, indigo, orange, rose, mint
- Rouge `#FF3B30` : urgence et destructif uniquement

**Vert forêt `#1F4937` est DÉPRÉCIÉ.** Toute trace dans le code est à supprimer.

### Pas de couleur hex hardcodée

Dans aucun composant. Toujours `var(--color-*)` ou classe Tailwind tokenisée.

Exception : `#FFFFFF` pour destructive CTAs.

### Liquid Glass — 3 niveaux

z1 (ambient), z2 (standard), z3 (elevated). Pas d'imbrication z3 dans z3.

Toujours `prefers-reduced-motion` et `prefers-reduced-transparency` respectés.

### Animations

- Duration 250-600ms
- Easing `ease-out` toujours
- Jamais bounce, jamais spring

### Icônes

Lucide React stroke `1.6`, viewBox `24`, taille rendue `20px`.

Phosphor n'est pas installé en V1.

---

## Workflow

### Avant push

```
☐ npx tsc --noEmit  → 0 erreur
☐ npm run lint      → 0 warning
☐ npm run build     → succès
```

Si un seul échoue : **pas de push**.

### Avant tag de version

```
☐ Build local OK
☐ Test fonctionnel manuel des 10 pages principales OK
☐ Score Apple Grade ≥ 60/80
☐ Aucun P0/P1 ouvert
☐ Validation Lead explicite (Ulysse tagge, pas Claude Code)
```

### Branches

- `main` : prod, jamais touchée directement, tags `v*.*.*` uniquement.
- `sprint-X` : branche de travail du sprint en cours.
- `cf-conceptuel-0` : exploration V2/V3, en quarantaine, jamais mergée.

### Email Git canonique

```
creativefair@1922.studio
```

Jamais l'email par défaut Mac (`*.local`).

### Validation Lead obligatoire

Aucune décision conceptuelle, doctrinale ou architecturale ne se prend en autonomie par Claude Code. Les exécutions techniques peuvent être autonomes, les pivots de sens ne le sont jamais.

**Claude Code n'a pas le droit de produire un document de plus de 200 lignes hors `audits/` sans validation Lead explicite préalable.**

---

## Décisions abandonnées — ne pas réintégrer

Liste complète maintenue dans `00-CONCEPT.md` §14.

Synthèse des principales :

- Vert forêt `#1F4937` (déprécié 6 mai 2026)
- Nav 4 destinations top-level (remplacée le 20 mai 2026)
- OS de marque iPadOS 26 avec dock 4 apps (exploration cf-conceptuel-0, jamais validée)
- Apple Santé avec 4 indicateurs vitaux dans Mon Programme (exploration jamais validée)
- Métriques de performance des publications passées en V1
- Conseiller comme page séparée (fusionné dans Messages)
- Contacts comme page séparée (fusionné dans Messages)
- Méthode pédagogique 4 mois
- Bulle flottante Conseiller
- Plans b2c en V1

---

## La règle absolue

**Quand on hésite : on enlève.**

La soustraction précède toujours l'addition. Apple n'ajoute pas — Apple retire.

Si tu es sur le point d'ajouter quelque chose : demande-toi d'abord ce que tu peux retirer à la place.

---

*Document v2.0 du 21 mai 2026. Toute proposition de modification passe par un Sprint dédié, jamais en passant.*
