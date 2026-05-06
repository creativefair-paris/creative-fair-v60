# Sprint 18 — Brief externe

## Objectif
Permettre la génération d'un brief Markdown structuré pour un prestataire (Reels, format éphémère, newsletter), copiable en un clic.

## Fichiers créés
- `lib/ai/prompts/brief.ts` — `BRIEF_GENERATION_RULES` : structure imposée du brief en markdown.
- `app/api/ai/brief/route.ts` — POST, Sonnet 4.6, max_tokens 1500. Met à jour `posts.content.brief` + `briefFormat`, statut `ready`, et `posts.type` selon le format.
- `audits/SPRINT_18_TEST.md`.

## Fichier mis à jour
- `components/post-creator/BriefExterne.tsx` — passe du stub à un composant fonctionnel : sélecteur de format (3 cartes), textarea d'intention, bouton générer, affichage du brief en `<pre>` avec bouton "Copier" (clipboard API).

## Comportement attendu
1. L'utilisateur choisit un format, écrit son intention (min 10 char), clique "Générer".
2. Sonnet 4.6 renvoie un markdown structuré (## Objectif / ## Format / ## Cible / ## Ton de marque / ## Message clé / ## Plan détaillé / ## Éléments à fournir / ## À éviter).
3. Le brief s'affiche, bouton "Copier" écrit dans le presse-papier ; feedback visuel "Copié" 1.8s.
4. Les générations suivantes remplacent le brief existant ("Régénérer le brief").

## Sécurité / multi-tenant
- Vérification `post.tenant_id === ctx.tenantId`.
- `logCreditsUsage` feature='brief', model='claude-sonnet-4-6'.

## À vérifier hors sandbox
- Comportement clipboard sur Safari iOS (peut nécessiter une interaction directe).
- Que la génération d'un brief sur un post déjà avancé en mode anecdote n'écrase pas accidentellement les autres champs (le route fait `{ ...post.content, brief, briefFormat }` — préserve hook/slides/etc.).

## Limites assumées
- Aucun aperçu structuré du brief (rendu markdown brut). Acceptable pour un copier-coller.
- Pas d'historique des briefs précédents.
