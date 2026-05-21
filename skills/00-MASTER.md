# Creative Fair v60 — Skill Master v2.0

> Bienvenue Claude Code. Avant de toucher au moindre fichier, lis ces documents dans l'ordre.
> Mis à jour le 21 mai 2026 (Sprint 39).

---

## Ordre de lecture obligatoire

1. **`skills/00-CONCEPT.md`** — Positionnement, persona, doctrine, vocabulaire, piliers Apple.
2. **`skills/01-ARCHITECTURE.md`** — Navigation, pages, stack technique, workflow, anti-patterns.
3. **`skills/02-EXPERTS.md`** — Hélène M., 12 Experts, modèle de conversation, LLM par rôle.
4. **`skills/03-VOICE_SHEET.md`** — Règles éditoriales et pointeur vers `lib/ai/prompts/system.ts`.
5. **`skills/04-MULTI_TENANT.md`** — RLS Supabase, helpers, patterns sécurité.
6. **`skills/10-SACRED.md`** — Règles non-négociables, synthèse condensée.

Puis selon le sprint en cours, lis :

- L'éventuelle skill spécifique du module touché (`skills/20-DESIGN-*.md` quand ils existeront).
- Le brief Lead du sprint dans `audits/sprint-X/brief.md` s'il existe.

---

## Règles absolues qui ne changent jamais

**1. Un seul codebase.** Pas de fork par client. La personnalisation passe par les données, jamais par le code.

**2. TypeScript strict.** Toutes les fonctions sont typées. Pas de `any`. `noUncheckedIndexedAccess` activé.

**3. Server Components par défaut.** `"use client"` uniquement quand l'interactivité l'exige.

**4. RLS Supabase toujours active.** Aucune table n'a RLS désactivée. Le pattern `createAdmin() + .eq("id", ...)` sans check `tenant_id` est interdit.

**5. Anthropic API via Edge Functions ou Server Actions.** La clé API n'apparaît jamais côté client.

**6. Prompt caching activé.** Tous les system prompts utilisent `cache_control: { type: 'ephemeral' }`. Modifier un system prompt sacré casse le cache à 90% — voir `02-EXPERTS.md` et `03-VOICE_SHEET.md`.

**7. Next.js 16 = `proxy.ts`.** Jamais `middleware.ts`. Pas d'exception.

**8. Branches sprint-X jamais poussées directement sur main.** Validation Lead, audit, tag, puis merge.

---

## Avant chaque commit

```bash
npx tsc --noEmit      # 0 erreur TypeScript
npm run lint          # 0 warning
npm run build         # build complet OK
```

Si l'un échoue : pas de commit. Fix d'abord.

Commit message clair :

```
feat(scope): courte description
fix(scope): courte description
refactor(scope): courte description
docs(scope): courte description
```

`scope` peut être `sprint-39`, `auth`, `messages`, `experts`, etc.

---

## Avant chaque tag de version

- Build local OK
- Test fonctionnel manuel des 10 pages principales OK
- Aucun bug P0/P1 connu
- Audit Apple Grade ≥ 60/80
- Validation Lead explicite (Ulysse tagge, pas Claude Code)

---

## Si tu doutes

**Arrête-toi.** Documente le doute dans `audits/sprint-X/abort-log.md`. Ulysse tranchera.

Le doute est un signal légitime, pas un échec. Mieux vaut s'arrêter sur un doute que de continuer à produire du code qui contredira la doctrine.

---

## Anti-patterns à éviter

- Modifier un system prompt sacré sans concertation (casse cache 90%, explosion facture)
- Push sans `npm run build` local OK
- Tag de version avant validation fonctionnelle Lead
- Hardcoder une couleur hex dans un composant (toujours `var(--color-*)`)
- Utiliser `middleware.ts` au lieu de `proxy.ts`
- `createAdmin()` côté user (bypass RLS = trou de sécurité multi-tenant)
- Ajouter une 5e destination de navigation top-level sans amendement de `00-CONCEPT.md`
- Ajouter un emoji ou un point d'exclamation dans une copie UI
- Réintroduire un mot du vocabulaire interdit (cf. `00-CONCEPT.md` §9)
- Produire un document de plus de 200 lignes hors `audits/` sans validation Lead explicite préalable
- Ajouter un Expert nommé qui n'est pas dans la liste des 12 + Hélène
- Utiliser Haiku 4.5 pour un Expert (Haiku réservé aux tâches utilitaires invisibles)

---

*Document v2.0 du 21 mai 2026.*
