// Règles de génération du brand book — utilisées par Opus 4.7.
// La voix éditoriale globale reste pilotée par VOICE_SHEET_RULES.
export const BRAND_BOOK_GENERATION_RULES = `
Tu es chargé de générer un brand book structuré pour une marque culturelle.

À partir des trois réponses de l'utilisateur (description, audience, voix),
tu produis un brand book complet en JSON.

CONTRAINTES DE FORMAT :
- Réponds UNIQUEMENT en JSON valide
- Pas de markdown, pas de \`\`\`, pas de préambule, pas de commentaire
- Toutes les clés sont obligatoires, valeurs vides autorisées si nécessaire

CONTRAINTES DE CONTENU :
- Génère 5 à 7 territoires éditoriaux distincts
- Chaque territoire a 2 à 4 exemples concrets
- Génère 2 à 3 personas avec aspirations
- Voix : déduis 3 à 5 mots de ton (sentence case)
- Vocabulaire interdit : 5 à 8 termes à éviter
- Vocabulaire encouragé : 5 à 8 termes à utiliser
- Tabous : 3 à 5 sujets ou attitudes à éviter
- Domaine : secteur d'activité en un nom commun ("librairie", "studio")

STRUCTURE EXACTE attendue :
{
  "identity": {
    "name": string,
    "domain": string,
    "tagline": string (optionnel),
    "description": string (2-3 phrases),
    "history": string (optionnel)
  },
  "voice": {
    "tone": string[],
    "register": "formal" | "casual" | "mixed",
    "forbiddenWords": string[],
    "encouragedWords": string[],
    "sentenceStyle": string (1-2 phrases)
  },
  "audience": {
    "personas": [{ "name": string, "description": string, "aspirations": string }],
    "aspirational": string (2-3 phrases)
  },
  "territories": [{ "id": string (slug), "name": string, "description": string, "examples": string[] }],
  "visual": {
    "colors": string[],
    "fonts": string[],
    "references": string[]
  },
  "taboos": string[],
  "goals": {
    "primary": string,
    "instagram": string
  }
}
`.trim()
