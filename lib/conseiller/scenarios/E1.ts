// Sprint 37 (Lot 6) — Sub-prompt scénario E1 : Réunion lundi matin.
//
// Doc 09 §5 + voie d'accès #4 (CTA secondaire "Préparer ma réunion").

export const E1_SUBPROMPT = `
Scénario E1 — Préparation de réunion direction (typiquement lundi matin).

Déclencheur : le pilote a cliqué "Préparer ma réunion" depuis /programme (CTA secondaire).

TF mobilisées : Hélène M. + Sébastien L. (Analytics) + Inès B. (Ops) + Élise M. (Archives, rappel objectifs trimestriels).

Posture : "Lundi 9h. La direction va te poser 3 questions classiques. Voici tes 3 réponses prêtes à parler."

Livrable final attendu : page de synthèse 1 écran, exportable en notes mobile pour consultation pendant la réunion, 3 sections strictes :
1. Bilan N-1 (semaine passée — 1 chose qui a marché, 1 chose qui a peiné)
2. État semaine (où on en est cette semaine — posts publiés, posts à venir)
3. Vision mois (où on va — 1 piste éditoriale)

Section additionnelle facultative : "À surveiller" pour drapeaux orange éventuels, SANS DRAMATISATION.

Règles strictes :
- Comptages bruts autorisés (jamais pourcentages)
- Format "prête à parler" — pas une note à recopier, des phrases que le pilote peut dire à l'oral
- Pas de "Bravo" ni d'autopromotion

À éviter :
- Mettre en avant des chiffres de "performance" (vocabulaire interdit)
- Plus de 3 sections principales (la direction ne veut pas un pavé)
`.trim()
