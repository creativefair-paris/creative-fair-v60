// Sprint 37.D (F34) — Sub-prompt de génération du plan depuis le wizard A1.
//
// Le wizard livre 7 réponses (Période, Ancres business, Sujets sensibles,
// Piliers à mobiliser, Curseur de risque, Objectifs éditoriaux, Formats
// dominants). Le sub-prompt instruit le modèle à retourner UN SEUL bloc
// JSON contenant `plan: [post...]` avec les 6 formats canoniques.
//
// Sortie attendue STRICTE — JSON valide, pas de markdown, pas de
// ::: blocs, pas de texte hors JSON. Le pilote ne voit jamais ce prompt.

import type { WizardResponses } from '@/lib/programme-creation/types'

export const SYSTEM_PROMPT_WIZARD_PLAN = `Tu es la Directrice de la Communication d'une marque établie. Tu génères un plan éditorial à partir des réponses du pilote au wizard de création de plan.

Doctrine éditoriale Creative Fair :
- Tranquillité narrative. Pas de hype, pas d'urgence artificielle.
- Authenticité de marque. Chaque post sert un pilier narratif.
- Qualité sur quantité. Le rythme dépend de la fréquence du pilote.
- Vocabulaire interdit : stats, analytics, dashboard, performance, growth, KPI.
- Tutoiement par défaut.

Tu disposes de 6 FORMATS CANONIQUES (et de 6 SEULEMENT) :

1. "anecdote"   — Raconter une histoire qui sert un pilier (souvent sourcée, documentée).
2. "produit"    — Mettre en avant une création avec son histoire.
3. "evenement"  — Annoncer une date qui compte (vernissage, lancement, salon).
4. "coulisses"  — Montrer le geste, l'atelier, la fabrication.
5. "manifeste"  — Affirmer une position forte sur un sujet de la marque.
6. "question"   — Faire réagir la communauté sans tomber dans l'engagement-bait.

Tu disposes de 3 TYPES STRUCTURELS (et de 3 SEULEMENT) :
- "carrousel" (multi-slide)
- "photo" (single image)
- "reel" (vidéo verticale courte)

Règles strictes de répartition :
- "anecdote" + "coulisses" en majorité (60 à 70% du plan) — ils servent le mieux les piliers premium.
- "produit", "evenement", "manifeste", "question" en complément (30 à 40%).
- Jamais 2 posts du même format en 2 jours consécutifs.
- Répartition des piliers : équilibrée par défaut, ajustée selon le curseur de risque demandé.
- Nombre de posts adapté à la durée de la période et à la fréquence implicite (entre 1 et 7 posts par semaine).

Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaire, sans texte avant ni après.

Schéma JSON exact attendu :

{
  "arc_narratif": "string — 1 phrase synthétisant le fil rouge éditorial de la période",
  "plan": [
    {
      "date": "YYYY-MM-DD",
      "week_number": 1,
      "format": "anecdote" | "produit" | "evenement" | "coulisses" | "manifeste" | "question",
      "structure_type": "carrousel" | "photo" | "reel",
      "pilier": "nom exact du pilier (doit matcher un pilier listé en input)",
      "objectif": "string — 1 phrase courte, max 80 caractères",
      "description": "string — 1 ou 2 phrases brèves, max 250 caractères. PAS de caption complète. Juste l'idée éditoriale concrète."
    }
  ]
}

Règle critique pour "description" :
- Du concret. "Anecdote sur le tissu non-traité de la collection 1984. Carrousel 5 slides : titre + 4 photos brutes."
- PAS de filler. JAMAIS "Post engageant" / "Carrousel inspirant" / "Contenu authentique".
`

type PilierLite = { id: string; nom: string }

export function buildWizardPlanUserPrompt(opts: {
  brandName: string
  brandSecteur: string | null
  brandTon: string | null
  brandSingularite: string | null
  pillarsCatalog: ReadonlyArray<PilierLite>
  responses: WizardResponses
  publicationFrequency: 'discret' | 'equilibre' | 'dense' | null
}): string {
  // Sprint 37.E — Nouvelle structure 9 étapes.
  const r = opts.responses
  const period = r['0']
  const mixMode = r['1']?.mix_mode ?? 'full_cf'
  const anchors = r['2']?.business_anchors ?? []
  const sensitive = r['3']?.sensitive_topics ?? ''
  const cadence = r['5']?.cadence
  const engagement = r['5']?.engagement ?? 'pose'
  const objEdito = r['6']?.objectif_editorial
  const objBiz = r['6']?.objectif_business

  const formatsRaw = r['7']
  const canonicalFormats: ReadonlyArray<string> =
    formatsRaw && 'formats' in formatsRaw && Array.isArray(formatsRaw.formats)
      ? formatsRaw.formats
      : []
  const formatsLine = canonicalFormats.length > 0
    ? `Formats canoniques à privilégier (1-3) : ${canonicalFormats.join(', ')}.`
    : ''

  const pillarsLines = opts.pillarsCatalog.map((p) => `- ${p.nom}`).join('\n')

  const objectifsLines = [
    objEdito ? `- Éditorial : ${objEdito.value}` : null,
    objBiz ? `- Business : ${objBiz.value}` : null,
  ].filter(Boolean).join('\n') || 'Aucun objectif explicite, laisse le conseiller proposer.'

  const anchorsLines = anchors.length > 0
    ? anchors.map((a) => `- ${a}`).join('\n')
    : 'Aucun événement business à signaler sur la période.'

  return `Génère le plan éditorial complet pour cette marque, basé sur les réponses du wizard.

MARQUE :
- Nom : ${opts.brandName}
- Secteur : ${opts.brandSecteur ?? 'non renseigné'}
- Ton : ${opts.brandTon ?? 'non renseigné'}
- Singularité : ${opts.brandSingularite ?? 'non renseignée'}

PÉRIODE :
- Du ${period?.period_start ?? '?'} au ${period?.period_end ?? '?'}

ANCRES BUSINESS :
${anchorsLines}

SUJETS SENSIBLES À ÉVITER :
${sensitive.trim() || 'Aucun.'}

MODE DE CONSTRUCTION : ${mixMode === 'full_cf' ? '100% Creative Fair (génère tout le plan)' : 'Mix avec contenu externe (laisse de la place au contenu off-app du pilote)'}

PILIERS DE LA MARQUE :
${pillarsLines || 'Aucun pilier explicite, déduis depuis le contexte de la marque.'}

NIVEAU D'ENGAGEMENT ÉDITORIAL : ${engagement} (prudent=évite les clivages / pose=prend position calmement / engage=assume les prises fortes)

OBJECTIFS :
${objectifsLines}

${formatsLine}

CADENCE : ${cadence ?? opts.publicationFrequency ?? 'balanced'}
- discreet : 1 à 2 posts par semaine
- balanced : 2 à 4 posts par semaine
- dense    : 5 à 7 posts par semaine

Produis le JSON selon le schéma exact.`
}
