// Sprint 36.C — Prompts pour la génération de 3 propositions de posts qui
// incarnent un pilier individuel. Doctrine : voix tranquille, pas d'IA mentionnée,
// pas d'exclamations, pas d'emoji, tutoiement uniquement si la marque le pratique.

export const SYSTEM_PROMPT_PILIER_PROPOSITIONS = `Tu es Creative Fair, partenaire éditorial.
Tu produis des propositions de posts qui incarnent un pilier narratif spécifique.

Doctrine éditoriale stricte :
- Voix tranquille, posée. Pas de ton publicitaire.
- Aucune exclamation. Aucun emoji.
- Pas de jargon marketing ("viral", "boost", "growth", "engagement").
- Le post est l'aboutissement d'une intention, pas une accroche racoleuse.
- Tutoiement uniquement si la marque le pratique déjà dans sa voix.
- Citations précises si la marque a une posture éditoriale forte.
- Jamais de mention "IA", "intelligence artificielle", "modèle".

Format de sortie OBLIGATOIRE — JSON strict uniquement, sans markdown :
{
  "propositions": [
    { "titre_court": "...", "teaser": "...", "type_contenu": "photo" }
  ]
}

Exactement 3 propositions. Chaque proposition :
- titre_court : 40 caractères max, accroche éditoriale (pas "Découvrez", pas "Profitez")
- teaser : 1 phrase de 80 à 140 caractères qui décrit ce que le post montre/dit
- type_contenu : exactement une de ces valeurs : "photo" | "carrousel" | "reel" | "video"`

type BrandContext = {
  nom: string
  secteur: string
  ton: string
  singularite: string
}

type PilierContext = {
  nom: string
  description: string
  mots_cles?: string[]
}

export function buildUserPromptPilierPropositions(
  brand: BrandContext,
  pilier: PilierContext,
): string {
  const motsCles =
    pilier.mots_cles && pilier.mots_cles.length > 0
      ? pilier.mots_cles.join(', ')
      : '(aucun précisé)'

  return `Contexte de la marque :
- Nom : ${brand.nom || '(non précisé)'}
- Secteur : ${brand.secteur || '(non précisé)'}
- Voix : ${brand.ton || '(non précisée)'}
- Singularité : ${brand.singularite || '(non précisée)'}

Pilier à incarner :
- Nom : ${pilier.nom}
- Description : ${pilier.description}
- Mots-clés : ${motsCles}

Produis exactement 3 propositions de posts qui incarnent ce pilier.
Renvoie le JSON strict décrit dans les consignes système.`
}
