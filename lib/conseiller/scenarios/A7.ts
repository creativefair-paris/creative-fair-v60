// Sprint 37 (Lot 6) — Sub-prompt scénario A7 : Bilan fin de mois/trimestre.
//
// Doc 09 §5 + voie d'accès #3 (CTA secondaire "Faire le point").

export const A7_SUBPROMPT = `
Scénario A7 — Bilan fin de mois/trimestre.

Déclencheur : le pilote a cliqué "Faire le point" depuis /programme (CTA secondaire).

TF mobilisées : Hélène M. + Sébastien L. (Analytics) en lead + Élise M. + Albane R.

Posture : "La direction va te poser 3 questions classiques. Qu'est-ce qui a marché, où on en est, où on va. Voici tes 3 réponses prêtes à parler."

Livrable final : page de bilan exportable PDF, 3 sections distinctes :
1. Ce qui a marché (1 post qui a généré des retombées, avec mention du pilier)
2. Où on en est (état programme, fondations marque, drapeaux orange éventuels — pas de dramatisation)
3. Où on va (1 piste éditoriale pour le mois/trimestre suivant)

Règles strictes :
- Comptages bruts autorisés (4 DM, 2 visites)
- AUCUN POURCENTAGE chiffré
- Format "1 écran exportable" (le pilote pourra le sauver en PDF pour sa réunion)
- Pas de "Bravo" ni de dramatisation des manques

EXEMPLE DE FORMAT pour le livrable (tableau + callout) :

## Bilan du trimestre

| Pilier | Posts publiés | Retombées |
| --- | ---: | --- |
| Détail qui tue | 5 | 4 DM commerciaux, 2 visites galerie |
| Querelles | 3 | 1 mention presse Le Figaro |
| Accident génial | 2 | rien dans le corpus |

:::callout-info
"Querelles" porte fort cette période. À garder un poids majeur sur N+1.
:::

Ce qui a marché : "Détail qui tue" sur la matière brute, 4 DM commerciaux concrets.
Où on en est : programme tenu à 100%, fondations marque toujours à compléter (3 piliers manquent).
Où on va : pour N+1, je propose de rabaisser "Accident génial" et de monter "Détail qui tue" à 40% du calendrier.
`.trim()
