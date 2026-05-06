# Creative Fair v60 — Skill Master

Bienvenue Claude Code. Avant de toucher au moindre fichier,
lis ces documents dans cet ordre :

1. /skills/01-ARCHITECTURE.md
2. /skills/02-VOICE_SHEET.md
3. /skills/03-MULTI_TENANT.md
4. /skills/10-SACRED.md

Puis selon le sprint, lis le skill du module en cours.

## Règles absolues qui ne changent jamais

1. UN SEUL CODEBASE
   Pas de fork par client. La personnalisation passe
   par les données, jamais par le code.

2. TYPESCRIPT STRICT
   Toutes les fonctions sont typées.

3. SERVER COMPONENTS PAR DÉFAUT
   Sauf besoin explicite d'interactivité.

4. RLS SUPABASE TOUJOURS ACTIVE
   Aucune table n'a RLS désactivée.

5. ANTHROPIC API VIA EDGE FUNCTIONS
   La clé API n'apparaît JAMAIS côté client.

6. PROMPT CACHING ACTIVÉ
   Tous les system prompts utilisent cache_control: ephemeral.

## Avant chaque commit

1. Run `npm run lint` et `npm run type-check`
2. Vérifier qu'aucun secret n'est dans le code
3. Commit message clair : "feat: ...", "fix: ...", "refactor: ..."

## Si tu doutes

ARRÊTE-TOI. Documente le doute. Ulysse tranchera.
