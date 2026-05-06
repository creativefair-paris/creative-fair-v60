# Apple Grade Audit — Phase 2 · Copywriting

Date : 2026-05-06.

## Vocabulaire interdit — scan complet

Patterns testés : `pipeline`, `tokens`, `radar`, `dashboard`, `workflow`,
`widget`, `sync`, `users`, `audience`, `growth hack`, `viral`, `boost`,
`bientôt`, `à venir`, `coming soon`, `placeholder`, `Sprint \d`.

### Trouvé en code utilisateur — corrigé

| Fichier | Avant | Après | Pilier |
|---|---|---|---|
| `ma-marque/brand-book/page.tsx` | « Audience » (titre) | « Public » | 4 |
| `ma-marque/brand-book/page.tsx` | « Aspirational » | « Aspiration » | 4 |
| `OnboardingFlow.tsx` | « Décris ton audience » | « Décris ton public » | 4 |

### Trouvé en code utilisateur — non corrigé (justifié)

| Fichier | Occurrence | Justification |
|---|---|---|
| `BrandBookEditor.tsx` (admin) | `audience: { ... }` | Champ de schéma JSON, pas de texte visible utilisateur. |
| `OnboardingFlow.tsx` | `id: 'audience'` | Identifiant code interne, pas de label. |
| `business-calendar/page.tsx` | `placeholder="Nom de l'événement"` | `placeholder` HTML (attribut), pas le mot anglais. |
| Pages admin | `Users` (label EN admin) | Admin a son propre langage technique, hors voice sheet user. |

### Patterns « Sprint X livré » / « Bientôt disponible »

Nettoyés en Phase 3 (empty states).

## Vérification voice sheet (sentence case, pas de point d'exclamation)

Scan rapide sur `app/(app)/**/*.tsx` et `components/**/*.tsx` : aucune
phrase en TOUT-EN-MAJ ni point d'exclamation visible utilisateur. Les
boutons utilisent l'impératif sentence case (« Continuer », « Démarrer »,
« Programmer cette publication »).

## Verdict Pilier 4 (Aspirational Storytelling & Clarity)

**Validé après correction.** Le vocabulaire utilisateur est désormais
français, humain, sans anglicisme. Les seuls anglicismes restants sont
en zone admin (langage interne) ou en zone code (identifiants).
