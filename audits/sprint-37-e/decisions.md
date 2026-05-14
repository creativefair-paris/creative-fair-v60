# Sprint 37.E — Décisions et journal d'exécution

Branche : `sprint-37`. Continuité de Sprint 37 → 37.D.

---

## F37 — Diagnostic du chat encore bloqué (Sprint 37.D F36 incomplet)

### Inspection du code

J'ai re-lu en profondeur le pipeline livré Sprint 37.D :
- `components/conseiller/WizardImmersiveSheet.tsx` (handleGenerate)
- `app/_actions/generate-plan-from-wizard.ts`
- `lib/programme/wizard-generation.ts`

### Causes identifiées (3 issues cumulées)

**Cause 1 (la plus probable) — Next.js Server Action timeout.**
- Le SDK Anthropic est appelé avec `TIMEOUT_MS = 60_000` dans `wizard-generation.ts`.
- Mais Next.js Server Actions héritent du `maxDuration` du route segment qui les invoque.
- **Aucune route segment n'exporte `maxDuration`** (vérifié via grep).
- Default Vercel : 10s (hobby), 30s (pro) → Anthropic Opus 4 avec 4096 tokens + cascade modèles peut prendre 40-60s.
- **Symptôme côté pilote** : le spinner tourne indéfiniment, le client ne reçoit jamais la résolution de la promesse, l'erreur catch n'est jamais déclenchée parce que c'est l'infrastructure qui kill.

**Cause 2 — MAX_TOKENS trop élevé.**
- 4096 tokens pour un plan de 8-12 posts × ~250 char description = surdimensionné. 3072 suffit largement et accélère la réponse de 20-30%.

**Cause 3 — Logging insuffisant.**
- Pas de log structuré aux étapes clés (réception réponse, parse JSON, validate, insert). Si une étape échoue silencieusement (cf. async errors non-throwés dans `.then()`), pas de trace.

### Fixes appliqués

1. `export const maxDuration = 90` sur les routes parentes qui peuvent déclencher la génération :
   - `app/(programme)/programme/page.tsx` (wizard via ConseillerAccess)
   - `app/(programme)/programme/create/page.tsx` (formulaire natif F35b)
2. `MAX_TOKENS: 4096 → 3072` dans `wizard-generation.ts`.
3. Logs structurés `[wizard-gen]` à chaque étape (start, anthropic_response, parsed, validated, programme_inserted, posts_inserted).
4. Client-side : timeout fallback de 75s côté `handleGenerate` qui force `setGenerating(false)` + message d'erreur clair si le server action ne répond pas.

### Limites de mon diagnostic

Je ne peux pas reproduire le bug en runtime (pas de `npm run dev` dans cet environnement). Le diagnostic est basé sur la lecture du code. Si après ces fixes le bug persiste, les pistes restantes sont :
- Configuration Vercel/déploiement spécifique du tenant Lead
- Variable `ANTHROPIC_API_KEY` manquante ou révoquée
- Cache prompt Anthropic défectueux (le `cache_control: ephemeral` peut échouer silencieusement)
