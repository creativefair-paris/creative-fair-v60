// Sprint 37.H (F73 — Section 3) — Sub-prompt résultats anticipés.
//
// Doctrine : TOUJOURS fourchettes (min/max), JAMAIS chiffre unique.
// Warning ⚠️ "Estimations indicatives" OBLIGATOIRE.
// Champ "limites" OBLIGATOIRE — le conseiller dit honnêtement ce qu'il
// ne peut pas prédire.

type BrandLite = {
  name: string | null
}

type ProgrammeLite = {
  date_debut: string | null
  date_fin: string | null
  posts_count: number
}

type MetricLite = {
  metric_type: string
  value: number
  recorded_at: string
}

type RetombeeLite = {
  date_prevue: string | null
  retombees: string | null
}

export const SYSTEM_PROMPT_STRATEGIE_ESTIMATIONS = `Tu estimes l'évolution des chiffres marque sur la période du programme à venir.

Posture :
- Pair senior. Estimations CONSERVATRICES. Ne pas surpromettre.
- Tutoiement par défaut.
- Vocabulaire interdit : KPI, performance, analytics, growth, dashboard, métrique.
- Vocabulaire à utiliser : indicateurs éditoriaux, retombées, chiffres, fourchettes, estimations indicatives.
- "Conseiller" en minuscule. Pas de tiret long, pas d'emoji, pas de markdown.

Tu réponds UNIQUEMENT en JSON valide, sans markdown ni texte avant/après.

Format strict :
{
  "estimations": [
    {
      "metric_type": "followers_count",
      "label": "Followers",
      "avant": 14000,
      "apres_min": 14400,
      "apres_max": 15200,
      "evolution_pct_min": 3,
      "evolution_pct_max": 9
    }
  ],
  "warning": "Ces estimations sont indicatives, basées sur le contenu généré et les programmes passés similaires.",
  "limites": "1-2 phrases sur ce que le conseiller ne peut PAS prédire (ex: actualités externes, virality imprévue, changements algorithme)."
}

RÈGLES STRICTES :
- TOUJOURS donner une FOURCHETTE (apres_min < apres_max), JAMAIS un chiffre unique.
- Estimations CONSERVATRICES. Pas de % > 20% en V1.
- 4-6 estimations max (followers, engagement, DM, mentions presse, demandes collab, commentaires).
- Le champ "warning" est OBLIGATOIRE et contient le mot "indicatives".
- Le champ "limites" est OBLIGATOIRE et liste ce que tu ne peux pas prédire.
- Si pas assez de données historiques pour estimer un metric, l'omettre.
`

export function buildStrategieEstimationsUserPrompt(opts: {
  brand: BrandLite
  programme: ProgrammeLite
  metrics: ReadonlyArray<MetricLite>
  retombees: ReadonlyArray<RetombeeLite>
}): string {
  const { brand, programme, metrics, retombees } = opts

  const metricsListed =
    metrics.length > 0
      ? metrics.map((m) => `- ${m.metric_type} : ${m.value} (relevé le ${m.recorded_at.slice(0, 10)})`).join('\n')
      : '(aucun chiffre marque renseigné)'

  const retombeesListed =
    retombees.length > 0
      ? retombees
          .filter((r) => r.retombees && r.retombees.trim().length > 0)
          .slice(0, 8)
          .map((r) => `- ${r.date_prevue ?? '?'} : ${(r.retombees ?? '').slice(0, 100)}`)
          .join('\n')
      : '(aucune retombée renseignée)'

  return `Estime l'évolution des chiffres marque sur la période à venir.

MARQUE : ${brand.name ?? 'inconnue'}

PROGRAMME :
- Période : ${programme.date_debut ?? '?'} au ${programme.date_fin ?? '?'}
- Nombre de posts générés : ${programme.posts_count}

CHIFFRES MARQUE ACTUELS :
${metricsListed}

RETOMBÉES RÉCENTES (échantillon) :
${retombeesListed}

Produis le JSON selon le schéma exact. RAPPEL : toujours fourchettes, jamais chiffre unique. Warning obligatoire. Limites obligatoires.`
}
