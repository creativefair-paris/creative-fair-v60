// Sprint 37.H (F73 — Section 1) — Sub-prompt strategie events intention.
//
// Cette section ne liste PAS les posts liés à chaque event. Elle montre
// le RAISONNEMENT du conseiller : pourquoi couvrir, facteurs pris en
// compte, comment c'est couvert (référence calendrier, pas détail).
//
// Cohérent avec la doctrine "pédagogie post-génération" F47+F53.

type BrandLite = {
  name: string | null
  piliers: ReadonlyArray<string>
}

type ProgrammeLite = {
  date_debut: string | null
  date_fin: string | null
}

type EventLite = {
  name: string
  date: string
  type?: string | null
}

type WizardResponsesLite = {
  engagement?: string | null
  cadence?: string | null
  objectif_editorial?: string | null
  objectif_business?: string | null
}

export const SYSTEM_PROMPT_STRATEGIE_EVENTS = `Tu expliques au pilote ton raisonnement sur la couverture éditoriale des events business durant la période du programme.

Posture :
- Pair senior, jamais flatterie. Vocabulaire éditorial concret.
- Tutoiement par défaut.
- Pas de tiret long, pas d'emoji, pas de markdown.
- Vocabulaire interdit : stats, analytics, performance, KPI, growth, métrique, dashboard.
- "Conseiller" en minuscule.

Tu réponds UNIQUEMENT en JSON valide, sans markdown ni texte avant/après.

Format strict :
{
  "events": [
    {
      "event_name": "Nom de l'event",
      "event_date": "YYYY-MM-DD",
      "pourquoi_couvrir": "1-2 phrases courtes, ancrage business concret. Pas de blabla.",
      "facteurs": [
        "Facteur 1 — Pilier mobilisé et raison (1 phrase)",
        "Facteur 2 — Niveau d'engagement et conséquence (1 phrase)",
        "Facteur 3 — Cadence et conséquence (1 phrase)"
      ],
      "comment_couvert": "1 phrase de référence au calendrier, SANS détailler les posts. Ex : '3 posts entre le 18 et 23 juin (voir Calendrier)'."
    }
  ]
}

RÈGLES STRICTES :
- L'idée centrale = montrer le RAISONNEMENT du conseiller, PAS l'output (titres de posts).
- NE PAS lister les titres des posts individuels.
- 3-5 facteurs maximum par event.
- Si un facteur ne se justifie pas pour cet event, l'omettre.
- Si le programme ne couvre PAS l'event (pas de posts dans la fenêtre temporelle), expliquer brièvement pourquoi dans "comment_couvert".
`

export function buildStrategieEventsUserPrompt(opts: {
  brand: BrandLite
  programme: ProgrammeLite
  events: ReadonlyArray<EventLite>
  wizardResponses: WizardResponsesLite | null
}): string {
  const { brand, programme, events, wizardResponses } = opts

  const eventsListed = events
    .map((e) => `- ${e.name} le ${e.date}${e.type ? ` (${e.type})` : ''}`)
    .join('\n')

  return `Explique ton raisonnement sur la couverture des events business.

MARQUE :
- Nom : ${brand.name ?? 'inconnue'}
- Piliers : ${brand.piliers.join(', ') || '(non posés)'}

PROGRAMME :
- Du ${programme.date_debut ?? '?'} au ${programme.date_fin ?? '?'}

CHOIX DU PILOTE (extraits wizard) :
- Niveau d'engagement : ${wizardResponses?.engagement ?? 'pose'}
- Cadence : ${wizardResponses?.cadence ?? 'equilibre'}
- Objectif éditorial : ${wizardResponses?.objectif_editorial ?? 'non défini'}
- Objectif business : ${wizardResponses?.objectif_business ?? 'non défini'}

EVENTS BUSINESS À COMMENTER :
${eventsListed}

Produis le JSON selon le schéma exact.`
}
