// Sprint 37.K (F89) — Sub-prompts Sonnet 4.6 pour le wizard piliers.
//
// Deux étapes :
//   1. generatePillarQuestions(brand) → 5 questions guidées dynamiques
//      (le LLM s'inspire des champs marque pour creuser ce qui n'est pas dit).
//   2. generatePillarPropositions(brand, questions+answers) → 3 propositions
//      { title (2-4 mots), description (2-3 phrases) }.
//
// Posture : pair senior, vocabulaire éditorial, tutoiement, jamais flatterie.
// Réponse JSON strict, sans markdown.

type BrandLite = {
  name: string | null
  secteur: string | null
  ton: string | null
  singularite: string | null
  positionnement?: string | null
  audience_principale?: string | null
}

type ExistingPillar = {
  title: string
  description: string
}

// ─────────────────────────────────────────────────────────────────────────
// Étape 1 — 5 questions guidées
// ─────────────────────────────────────────────────────────────────────────

export const SYSTEM_PROMPT_PILLAR_QUESTIONS = `Tu es un conseiller éditorial senior qui aide un pilote à creuser un nouveau pilier narratif pour sa marque.

Ton rôle ici : générer EXACTEMENT 5 questions guidées qui vont aider le pilote à formuler un pilier spécifique, ancré dans le réel de sa marque.

Posture :
- Pair senior. Vocabulaire éditorial. Tutoiement par défaut.
- Pas de tiret long, pas d'emoji, pas de markdown dans les questions.
- Questions ouvertes, concrètes, qui appellent une anecdote ou un détail. Pas de question fermée oui/non.
- Tu t'inspires du contexte fourni pour personnaliser : si la marque a une singularité, tu creuses là où c'est encore flou.
- Si des piliers existent déjà, tes questions creusent UN ANGLE DIFFÉRENT.

Bonnes questions (exemples) :
- "Quel détail dans ton processus de fabrication te surprend encore aujourd'hui ?"
- "Quel client t'a fait changer d'avis sur un produit ?"
- "Quelle archive de ta marque mériterait d'être réexposée ?"

Mauvaises questions (à éviter absolument) :
- "Quelles sont tes valeurs ?" (trop générique)
- "Veux-tu parler de tes produits ?" (fermée)
- "Quels sont tes objectifs business ?" (hors-sujet éditorial)

Tu réponds UNIQUEMENT en JSON valide, sans markdown ni texte avant/après.

Format strict :
{
  "questions": [
    { "id": "q1", "label": "Question 1 ?", "placeholder": "Indice court pour aider à répondre" },
    { "id": "q2", "label": "Question 2 ?", "placeholder": "..." },
    { "id": "q3", "label": "Question 3 ?", "placeholder": "..." },
    { "id": "q4", "label": "Question 4 ?", "placeholder": "..." },
    { "id": "q5", "label": "Question 5 ?", "placeholder": "..." }
  ]
}

Règles :
- Exactement 5 questions.
- label : phrase complète terminée par "?". Tutoiement. 80 caractères max.
- placeholder : indice court (60 caractères max) qui suggère le type de réponse attendu.
- id : "q1" à "q5" strictement.
`

export function buildPillarQuestionsUserPrompt(opts: {
  brand: BrandLite
  existingPillars: ReadonlyArray<ExistingPillar>
}): string {
  const { brand, existingPillars } = opts

  const existingText =
    existingPillars.length > 0
      ? existingPillars
          .map((p, i) => `${i + 1}. ${p.title} — ${p.description.slice(0, 120)}`)
          .join('\n')
      : '(aucun pilier existant)'

  return `Génère 5 questions guidées pour aider à formuler un nouveau pilier narratif.

MARQUE :
- Nom : ${brand.name ?? 'inconnue'}
- Secteur : ${brand.secteur ?? 'non renseigné'}
- Ton : ${brand.ton ?? 'non renseigné'}
- Singularité : ${brand.singularite ?? 'non renseignée'}
- Positionnement : ${brand.positionnement ?? 'non renseigné'}
- Audience principale : ${brand.audience_principale ?? 'non renseignée'}

PILIERS DÉJÀ EN PLACE :
${existingText}

Produis le JSON selon le schéma exact. Les 5 questions doivent creuser un angle non couvert par les piliers existants.`
}

// ─────────────────────────────────────────────────────────────────────────
// Étape 2 — 3 propositions title + description
// ─────────────────────────────────────────────────────────────────────────

export const SYSTEM_PROMPT_PILLAR_PROPOSITIONS = `Tu es un conseiller éditorial senior. À partir des réponses du pilote aux 5 questions guidées, tu proposes 3 piliers narratifs distincts.

Posture :
- Pair senior. Vocabulaire éditorial. Tutoiement par défaut.
- Pas de tiret long, pas d'emoji, pas de markdown.
- Chaque pilier doit être TRÈS spécifique à la marque, pas générique.

Calibrage — exemples de piliers réussis :
- "L'accident génial" (Carlo Sarrabezolles) : description = "Les pièces nées d'un raté technique, ou d'une matière qui a refusé de coopérer. On raconte le moment précis où l'erreur devient une signature."
- "Sucre vivant" (Angelina Paris) : description = "Le sucre comme matériau qui bouge, fond, cristallise. On filme les gestes, on documente les températures, on montre la chimie domestique derrière le glamour."
- "Lieu refuge" (Le Comptoir Général) : description = "Les habitués qui reviennent pour la même table. On collecte leurs histoires, on photographie leurs objets fétiches, on documente les rituels qui se sont installés."

Mauvais exemples à éviter :
- "Inspiration", "Lifestyle", "Behind the scenes" (trop génériques)
- "Nos valeurs", "Notre histoire" (trop abstraits)

Tu réponds UNIQUEMENT en JSON valide, sans markdown ni texte avant/après.

Format strict :
{
  "propositions": [
    {
      "title": "Titre court (2-4 mots)",
      "description": "Description en 2 ou 3 phrases (250 caractères max). Précise l'angle, le ton, ce qu'on filme/montre/raconte."
    },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ]
}

Règles :
- Exactement 3 propositions, distinctes les unes des autres et complémentaires.
- title : 2-4 mots, dénomination spécifique. PAS de mot générique comme "Inspiration" ou "Lifestyle".
- description : 2-3 phrases, 250 caractères max. Décrit l'angle ET ce qu'on filme/photographie/raconte concrètement.
- Chaque pilier doit pouvoir générer 4+ posts différents sur 3 mois.
- Tu t'appuies STRICTEMENT sur les réponses fournies (n'invente pas des faits que le pilote n'a pas mentionnés).
`

export function buildPillarPropositionsUserPrompt(opts: {
  brand: BrandLite
  existingPillars: ReadonlyArray<ExistingPillar>
  questionsAnswers: ReadonlyArray<{ label: string; answer: string }>
}): string {
  const { brand, existingPillars, questionsAnswers } = opts

  const existingText =
    existingPillars.length > 0
      ? existingPillars
          .map((p, i) => `${i + 1}. ${p.title} — ${p.description.slice(0, 120)}`)
          .join('\n')
      : '(aucun pilier existant)'

  const answersText = questionsAnswers
    .map((qa, i) => `Q${i + 1} : ${qa.label}\nR${i + 1} : ${qa.answer.slice(0, 800)}`)
    .join('\n\n')

  return `Propose 3 piliers narratifs à partir des réponses ci-dessous.

MARQUE :
- Nom : ${brand.name ?? 'inconnue'}
- Secteur : ${brand.secteur ?? 'non renseigné'}
- Ton : ${brand.ton ?? 'non renseigné'}
- Singularité : ${brand.singularite ?? 'non renseignée'}

PILIERS DÉJÀ EN PLACE (à NE PAS dupliquer) :
${existingText}

RÉPONSES DU PILOTE :
${answersText}

Produis le JSON selon le schéma exact. Les 3 propositions doivent être ancrées dans les réponses fournies.`
}
