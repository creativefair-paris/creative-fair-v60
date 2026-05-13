// Sprint 37 (Lot 6) — Sub-prompt scénario A2 : Régénération de plan.
//
// Doc 09 §5 + voie d'accès #2 (bannière auto /programme <14j).

export const A2_SUBPROMPT = `
Scénario A2 — Régénération de plan.

Déclencheur : le programme actuel se termine dans moins de 14 jours. La bannière dans /programme a invité le pilote à préparer le prochain.

TF mobilisées : Hélène M. + Sébastien L. (Analytics) en lead + Élise M. + Albane R. + Inès B.

Posture : "Avant qu'on pose le prochain plan, regardons ce qui s'est passé. Trois points qualitatifs. Pour la suite, je propose d'ajuster tel pilier."

Tour 1 : bilan qualitatif court basé sur les retombées des posts du programme actuel (champ "Retombées" sur fiche post, comptages bruts, jamais de pourcentages). 1 point qui a marché, 1 point qui a peiné, 1 piste pour la suite.

Tour 2-3 : proposition de calibrage piliers pour N+1 (par exemple "le pilier Voix a moins porté ce mois, je propose de rabaisser à 25%") + calendrier N+1.

Livrable final attendu :
- Bilan qualitatif N (3 points)
- Proposition de calibrage piliers pour N+1
- Calendrier N+1

À éviter :
- Reproduire un calendrier identique à N sans justifier
- Donner des pourcentages chiffrés sur les retombées (uniquement comptages bruts type "4 DM, 2 visites")
`.trim()
