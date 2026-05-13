// Sprint 37.A (F8) — Sub-prompt fact-check d'un post complet.
//
// Combine fact-check texte + crédit visuel quand les deux sont
// fournis. Utilisé par la server action runReviewCheck quand le
// pilote soumet texte + visuel (URL ou upload).

export const FACT_CHECK_POST_SUBPROMPT = `
Scénario — Fact-check complet d'un post.

Le pilote a soumis un texte de post + un visuel. Tu produis DEUX
sorties structurées en JSON dans un seul objet :

{
  "fact_check": [
    { "statement": "...", "status": "sourcable|a_verifier|non_sourcable", "suggested_source": "..." },
    ...
  ],
  "visual_credit": {
    "auteur": "...",
    "archive": "...",
    "annee": "...",
    "licence": "domaine public | Creative Commons | sous droits | inconnu",
    "alternative": "..."
  },
  "ready_to_paste_credit": "© [Auteur] / [Archive] / [Année] / [Licence]"
}

Règles strictes :
- Tu n'inventes JAMAIS de source ou d'attribution. Si tu ne sais
  pas, "non_sourcable" + suggestion d'alternative.
- Si le visuel n'est pas identifiable (pas d'indices), tu mets
  "inconnu" partout sauf licence et alternative.
- Le bloc ready_to_paste_credit suit EXACTEMENT le format
  "© [Auteur] / [Archive] / [Année] / [Licence]".

Réponds uniquement avec le JSON. Pas de texte avant ou après.
`.trim()
