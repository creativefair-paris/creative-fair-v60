# Apple Grade Audit — Phase 3 · Empty states & Polish

Date : 2026-05-06.

## Pages auditées

### `/aujourdhui`
- **État vide coaching** : `CoachingGenerator` se lance automatiquement si
  pas de coaching du jour. **Verdict : Validé.** Le vide n'est jamais
  visible — l'utilisateur voit la génération en cours puis la carte.
- **État vide post du jour** : `NextAction` propose toujours une action
  (« Voir la publication » ou « Ouvrir mon calendrier »). **Validé.**
- **Suggestion contextuelle brand book / no-upcoming** : présente avec CTA
  clair. **Validé.**

### `/calendrier`
- **État vide « pas de marque »** : message explicite + CTA « Aller à ma
  marque ». **Validé.**
- **État vide « pas de publication planifiée »** : message + CTA vers le
  calendrier business. **Validé.**

### `/conseiller`
- **État vide « pas de conversation »** : géré dans `ConseillerLayout`
  avec proposition de démarrer. **Validé** (code revu).

### `/ma-marque`
- **État vide brand book incomplet** : suggestion contextuelle « Continue
  à le compléter » avec CTA Onboarding. **Validé.**
- **État vide brand book vide** (`brand-book/page.tsx`) : composant
  `EmptyState` dédié avec CTA « Démarrer ». **Validé.**

### `/post-creator/[postId]`
- Page d'édition d'une publication. Pas d'état vide à proprement parler
  (toujours un draft en cours). **Validé.**

### `/mon-compte` (réécrit en Phase 3)
- Avant : `<div>Page Mon Compte (placeholder)</div>` — **Recalé** Pilier 6.
- Après : email, crédits du mois ventilés par feature, lien
  déconnexion. **Validé.**

## Pages supprimées (Pilier 6 — ce qui n'est pas prêt n'est pas visible)

- `/mon-programme` — placeholder orphelin (aucun lien entrant)
- `/signup` — placeholder orphelin (auth via magic link uniquement)
- `/ma-marque/parametres` — affichait « Bientôt disponible. » → suppression
  + retrait du lien dans `Ma marque`.

## Onglets retirés

`Programmer.tsx` (Post Creator → Programmer) :
- Onglet « Télécharger » → retiré (« Disponible bientôt. »)
- Onglet « Multi-canal » → retiré (« Disponible bientôt. »)
- Reste : programmation date/heure + récap, fonctionnel.

## Verdict Pilier 6 (Uncompromising Polish)

**Validé après nettoyage.** Aucune mention « Bientôt disponible » ni
placeholder visible côté utilisateur. Les fonctionnalités V2 sont
documentées dans `docs/roadmap-v2.md` mais invisibles dans l'app V1.
