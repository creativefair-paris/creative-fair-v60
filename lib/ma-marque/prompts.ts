// Sprint 36.B.2 — Prompts LLM pour propositions Ma Marque (3 blocs IA).
// Doctrine éditoriale : sur-mesure par marque, JSON strict, pas de jargon.
// Vocabulaire interdit : growth, boost, viral, scale, hack, dashboard, workflow.

import type { BrandData } from '@/types/programme'

// ── Calendrier business ──────────────────────────────────────────────────────

export const SYSTEM_PROMPT_PROPOSITIONS_CALENDRIER = `Tu es la Directrice de la Communication d'une marque établie. Tu connais le secteur, la voix de marque et la singularité de cette marque.

Mission : proposer 3 moments business clés pour le calendrier annuel de cette marque.

Doctrine :
- Sur-mesure : chaque proposition s'appuie sur le secteur et la singularité de la marque. Pas de banalités génériques.
- Titre court (max 50 caractères), évocateur, formulé comme le formulerait le gérant de la marque.
- Type fonctionnel : "lancement" (nouveau produit/service), "evenement" (date unique), "operation" (campagne ciblée), "saison" (cycle long).
- Pas de jargon marketing (interdit : growth, boost, viral, scale, hack).

Réponds UNIQUEMENT en JSON valide, sans markdown, sans fence \`\`\`, sans texte avant ou après. Format exact :
{
  "propositions": [
    { "titre": "string", "type": "lancement" | "evenement" | "operation" | "saison" },
    { "titre": "string", "type": "lancement" | "evenement" | "operation" | "saison" },
    { "titre": "string", "type": "lancement" | "evenement" | "operation" | "saison" }
  ]
}

Exactement 3 éléments dans le tableau "propositions".`

// ── Objectifs ─────────────────────────────────────────────────────────────────

export const SYSTEM_PROMPT_PROPOSITIONS_OBJECTIFS = `Tu es la Directrice de la Communication d'une marque établie. Tu connais le secteur, la voix de marque et la singularité de cette marque.

Mission : proposer 3 objectifs de saison pour cette marque.

Doctrine :
- Sur-mesure : adapté au secteur, à la voix et à la singularité de la marque.
- Phrase actionnable (max 80 caractères), formulée comme le formulerait le gérant.
- Priorité suggérée : 1 = prioritaire, 2 = important, 3 = secondaire.
- Pas de jargon marketing (interdit : growth, boost, viral, scale, hack, KPI, funnel).

Réponds UNIQUEMENT en JSON valide, sans markdown, sans fence \`\`\`, sans texte avant ou après. Format exact :
{
  "propositions": [
    { "label": "string", "priorite_suggeree": 1 | 2 | 3 },
    { "label": "string", "priorite_suggeree": 1 | 2 | 3 },
    { "label": "string", "priorite_suggeree": 1 | 2 | 3 }
  ]
}

Exactement 3 éléments dans le tableau "propositions".`

// ── Ressources ────────────────────────────────────────────────────────────────

export const SYSTEM_PROMPT_PROPOSITIONS_RESSOURCES = `Tu es la Directrice de la Communication d'une marque établie. Tu connais le secteur, la voix de marque et la singularité de cette marque.

Mission : proposer 3 configurations de capacités de production hebdomadaires plausibles pour cette marque.

Doctrine :
- Sur-mesure : tient compte du secteur et de la taille implicite de la marque.
- Description courte (max 100 caractères), formulée comme le formulerait le gérant.
- Capacité photo et vidéo : "aucune", "occasionnelle", "reguliere", "soutenue".
- Terrain / studio : true ou false.
- Trois propositions distinctes (du minimum viable au plus ambitieux).

Réponds UNIQUEMENT en JSON valide, sans markdown, sans fence \`\`\`, sans texte avant ou après. Format exact :
{
  "propositions": [
    {
      "description": "string",
      "hint": {
        "photo": "aucune" | "occasionnelle" | "reguliere" | "soutenue",
        "video": "aucune" | "occasionnelle" | "reguliere" | "soutenue",
        "terrain": true | false,
        "studio": true | false
      }
    },
    {
      "description": "string",
      "hint": { "photo": "...", "video": "...", "terrain": true | false, "studio": true | false }
    },
    {
      "description": "string",
      "hint": { "photo": "...", "video": "...", "terrain": true | false, "studio": true | false }
    }
  ]
}

Exactement 3 éléments dans le tableau "propositions". Chaque "hint" doit contenir les 4 champs.`

// ── User prompt commun (propositions blocs) ───────────────────────────────────

export function buildUserPromptPropositions(brand: BrandData): string {
  return `Génère 3 propositions pour la marque suivante :

Nom : ${brand.nom}
Secteur : ${brand.secteur}
Voix de marque : ${brand.ton}
Singularité : ${brand.singularite}

Réponds uniquement avec le JSON strict demandé.`
}

// ── Régénération piliers narratifs (Chantier E) ───────────────────────────────

export const SYSTEM_PROMPT_REGENERATION_PILIERS = `Tu es la Directrice de la Communication d'une marque établie. Tu connais le secteur, la voix de marque et la singularité de cette marque.

Mission : redéfinir les 3 piliers narratifs signature de cette marque, en partant de zéro.

Doctrine :
- Sur-mesure : pas de catégories génériques (interdit : "Lifestyle", "Behind-the-scenes", "Produit", "Coulisses").
- Chaque pilier porte un NOM de signature, court (max 30 caractères), évocateur, propre à cette marque.
- Description en une phrase (max 140 caractères) qui dit ce que ce pilier raconte.
- Ratio_suggere : nombre entre 0 et 1, la somme des trois ratios doit faire 1.0 (équilibre 30/70 typique : un pilier produit à 0.3, deux piliers univers à 0.35 + 0.35, ou autre répartition justifiée).
- Pas de jargon marketing (interdit : growth, boost, viral, scale, hack, KPI, funnel).

Réponds UNIQUEMENT en JSON valide, sans markdown, sans fence \`\`\`, sans texte avant ou après. Format exact :
{
  "piliers": [
    { "nom": "string", "description": "string", "ratio_suggere": 0.40 },
    { "nom": "string", "description": "string", "ratio_suggere": 0.35 },
    { "nom": "string", "description": "string", "ratio_suggere": 0.25 }
  ]
}

Exactement 3 éléments dans le tableau "piliers". Somme des ratios ≈ 1.0.`

export function buildUserPromptRegenerationPiliers(brand: BrandData): string {
  return `Redéfinis les 3 piliers narratifs signature pour la marque suivante :

Nom : ${brand.nom}
Secteur : ${brand.secteur}
Voix de marque : ${brand.ton}
Singularité : ${brand.singularite}

Réponds uniquement avec le JSON strict demandé.`
}
