// Sprint 37.F (F46) — Sub-prompt pour proposer 3 piliers narratifs.
//
// Appelé depuis l'étape conditionnelle 4 du wizard programme quand
// brand.piliers_narratifs est vide. Le conseiller propose 3 piliers
// dérivés du contexte de la marque + brand book + retombées si présents.

type BrandLite = {
  name: string | null
  secteur: string | null
  ton: string | null
  singularite: string | null
  positionnement?: string | null
  audience_principale?: string | null
}

type BrandBookExcerpt = {
  content?: string | null
}

type RecentPost = {
  format: string | null
  objectif_editorial: string | null
  retombees: string | null
}

export const SYSTEM_PROMPT_PROPOSE_PILIERS = `Tu proposes 3 piliers narratifs à un pilote pour structurer sa communication.

Posture :
- Pair senior, jamais flatterie. Vocabulaire éditorial.
- Tutoiement par défaut.
- Pas de tiret long, pas d'emoji, pas de markdown.

Tu réponds UNIQUEMENT en JSON valide, sans markdown ni texte avant/après.

Format strict :
{
  "piliers": [
    "Pilier 1 (2-4 mots)",
    "Pilier 2 (2-4 mots)",
    "Pilier 3 (2-4 mots)"
  ]
}

Règles :
- Exactement 3 piliers.
- Chaque pilier : 2-4 mots, dénomination claire et spécifique à la marque.
  Bons exemples : "Le détail qui tue", "Querelles de créateurs", "L'accident génial".
  Mauvais exemples : "Inspiration", "Lifestyle", "Behind the scenes" (trop génériques).
- Les 3 piliers doivent être DISTINCTS et COMPLÉMENTAIRES (couvrent des angles différents).
- Chaque pilier doit pouvoir générer 4+ posts différents sur 3 mois.
- Si tu manques de contexte, fais ton mieux avec ce que tu as et reste spécifique.
`

export function buildProposePiliersUserPrompt(opts: {
  brand: BrandLite
  brandBook: BrandBookExcerpt | null
  recentPosts: ReadonlyArray<RecentPost>
}): string {
  const { brand, brandBook, recentPosts } = opts

  const brandBookExcerpt = brandBook?.content?.slice(0, 2000) ?? '(aucun brand book)'

  const recentPostsText = recentPosts.length > 0
    ? recentPosts
        .map((p) =>
          `- ${p.format ?? '?'} | ${p.objectif_editorial ?? ''} | retombees: ${(p.retombees ?? '').slice(0, 60)}`,
        )
        .join('\n')
    : '(aucun post récent)'

  return `Propose 3 piliers narratifs pour cette marque.

MARQUE :
- Nom : ${brand.name ?? 'inconnue'}
- Secteur : ${brand.secteur ?? 'non renseigné'}
- Ton : ${brand.ton ?? 'non renseigné'}
- Singularité : ${brand.singularite ?? 'non renseignée'}
- Positionnement : ${brand.positionnement ?? 'non renseigné'}
- Audience principale : ${brand.audience_principale ?? 'non renseignée'}

BRAND BOOK (extrait) :
${brandBookExcerpt}

POSTS RÉCENTS (échantillon) :
${recentPostsText}

Produis le JSON selon le schéma exact.`
}
