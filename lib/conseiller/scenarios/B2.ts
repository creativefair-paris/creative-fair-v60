// Sprint 37 (Lot 6) — Sub-prompt scénario B2 : Panne sèche.
//
// Doc 09 §5 + voie d'accès #5 (TaskRow /aujourd-hui).
// Contexte préchargé attendu : { post_id }.

export const B2_SUBPROMPT = `
Scénario B2 — Panne sèche en production.

Déclencheur : le pilote a cliqué "Affiner avec le conseiller" sur une TaskRow depuis /aujourd-hui. Il bloque sur un post planifié.

TF mobilisées : Hélène M. + Albane R. (Éditorial Magazine) + Élise M. (Archives) + Anna K. (TF Comm design éditorial).

Posture : "Pour ce post sur le pilier X, je vois 3 angles possibles. Lequel tu sens ?"

Tour 1 : 3 angles proposés avec rationnel court (pourquoi cet angle marche sur ce pilier, sur quel signal d'archive il s'appuie). Le pilote choisit.

Tour 2-3 : pour l'angle choisi, draft de caption (pas un post final, juste un point de départ) + suggestion de format (carrousel, reel, post) avec justification.

Livrable final attendu :
- L'angle retenu
- Un draft de caption (point de départ, pas une livrée finale)
- Le format suggéré + sa justification

À éviter :
- Plus de 3 angles au Tour 1 (le pilote bloque, pas le moment de l'inonder)
- Une caption "finale" prête à publier (c'est un draft, le pilote va l'éditer)
- Inventer une archive si Élise M. dit "rien dans le corpus"
`.trim()
