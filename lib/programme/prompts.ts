// Sprint 36.A — Prompts LLM pour génération programme initial (flux inversé Marcus)
// Doctrine éditoriale : tranquillité narrative, ratio 30/70, piliers signature sur-mesure.

import type { BrandData } from '@/types/programme'

// Prompt système — cible Anthropic prompt caching (ephemeral)
export const SYSTEM_PROMPT_INITIAL = `Tu es la Directrice de la Communication d'une marque établie. Tu raisonnes comme une équipe de communication interne expérimentée.

Doctrine éditoriale :
- Tranquillité narrative : pas de hype, pas d'urgence artificielle
- Authenticité de marque : chaque post sert l'arc narratif
- Qualité sur quantité : 2 à 3 posts pour une première semaine
- Diversité de formats : équilibre photo / carousel / video / texte
- Ratio 30/70 : 30% produit, 70% univers (heritage, lifestyle, savoir-faire)

Méthode obligatoire avant de produire le JSON final :

ÉTAPE 1 — Compréhension
  Reformule en 2 phrases l'ADN de la marque tel que tu le perçois à partir des inputs reçus.

ÉTAPE 2 — Définition des piliers signature
  Définis 3 piliers narratifs SUR-MESURE pour cette marque.
  Pas de catégories génériques (style "Lifestyle", "Behind-the-scenes").
  Des piliers spécifiques avec un nom de signature.
  Exemple : "Le geste du matin" pour un café de spécialité.

ÉTAPE 3 — Scénarisation
  Distribue 3 posts sur la semaine (lundi à dimanche).
  Chaque post appartient à un pilier défini.
  Ratio cible : au moins 2 posts univers, 1 post peut être produit.
  Alterne les formats.

ÉTAPE 4 — Arc narratif
  Définis le thème fédérateur de la semaine en 1 phrase.

ÉTAPE 5 — Format JSON final
  Produis le JSON selon le schéma exact.

Réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaire, sans explication avant ou après. Format exact requis.`

export function buildUserPromptInitial(brand: BrandData): string {
  return `Génère un programme éditorial pour la PREMIÈRE semaine pour cette marque :

Nom : ${brand.nom}
Secteur : ${brand.secteur}
Voix de marque : ${brand.ton}
Singularité : ${brand.singularite}

Format JSON exact attendu :
{
  "comprehension": "string — 2 phrases reformulant l'ADN perçu",
  "piliers": [
    { "nom": "string court signature", "description": "string 1 phrase", "ratio_suggere": "number 0-1" }
  ],
  "arc_narratif": "string — thème fédérateur de la semaine en 1 phrase",
  "posts": [
    {
      "pilier_nom": "string (doit matcher un nom de pilier ci-dessus)",
      "jour": "lundi"|"mardi"|"mercredi"|"jeudi"|"vendredi"|"samedi"|"dimanche",
      "date_relative": "+N où N est le décalage en jours depuis aujourd'hui (0-6)",
      "titre": "string court (max 60 caractères)",
      "angle": "string — approche narrative en 1-2 phrases",
      "type": "photo"|"carousel"|"video"|"texte",
      "heure_suggeree": "HH:MM"
    }
  ]
}

Le tableau "piliers" doit contenir exactement 3 éléments.
Le tableau "posts" doit contenir exactement 3 éléments.`
}

// ── Legacy Sprint 32.5 — préservés pour signature ────────────────────────────
// Conservés pour ne pas casser les imports type. Non utilisés en Sprint 36.A.

export type PromptInputs = {
  brand: { name: string; positioning?: string }
  contextAnswers: Record<string, unknown>
  periode: 'semaine' | 'mois' | 'trimestre'
}

export function promptArcNarratif(_inputs: PromptInputs): string {
  throw new Error('promptArcNarratif: legacy, non implémenté Sprint 36.A')
}

export function promptPostFromArc(_inputs: PromptInputs & { semaineTheme: string }): string {
  throw new Error('promptPostFromArc: legacy, non implémenté Sprint 36.A')
}
