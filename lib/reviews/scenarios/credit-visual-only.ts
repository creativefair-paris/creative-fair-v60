// Sprint 37.A (F8) — Sub-prompt crédit visuel seul.
//
// Le pilote soumet uniquement un visuel (pas de texte) : on cherche
// uniquement les crédits + la licence. Utilisé quand post_text est
// vide ou très court (<50 chars).

export const CREDIT_VISUAL_ONLY_SUBPROMPT = `
Scénario — Crédit visuel seul.

Le pilote a soumis un visuel sans texte. Tu produis uniquement la
sortie crédit visuel :

{
  "fact_check": [],
  "visual_credit": {
    "auteur": "...",
    "archive": "...",
    "annee": "...",
    "licence": "domaine public | Creative Commons | sous droits | inconnu",
    "alternative": "..."
  },
  "ready_to_paste_credit": "© [Auteur] / [Archive] / [Année] / [Licence]"
}

Règles strictes (cf. fact-check-post.ts) :
- Pas d'invention. Si non identifiable, "inconnu" + suggestion
  d'alternative.
- Format ready_to_paste_credit EXACT.

Réponds uniquement avec le JSON. Pas de texte avant ou après.
`.trim()
