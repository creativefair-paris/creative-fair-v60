# Sprint 37 — Fiche d'exécution

**Référence canonique.** `09-modele-conseiller-en-situation.md`.
Cette fiche est ce que tu as sous les yeux en permanence pendant
Sprint 37. Le doc 09 est la référence à consulter en cas de doute.

---

## TOP 5 DÉCISIONS CRITIQUES (à ne pas rater)

1. **Streaming visible du raisonnement** (#46). Le pilote voit le
   raisonnement se construire à l'écran, élément par élément. Pas
   de boîte noire. Différenciant fort vs ChatGPT.
2. **Mini-onboarding du conseiller** (#51). 3 écrans skippables à
   la fin de l'onboarding initial. Sans ça, le pilote ne sait pas
   que le conseiller existe.
3. **5 lois textuelles** (#30). Section 7 du doc 09. Doivent figurer
   mot pour mot dans le prompt système. Pas paraphrasées.
4. **Modèle de navigation unifié** (#49). UNE SEULE sheet
   contextuelle pour les 8 voies d'accès. La page `/outils/conseiller`
   = liste historique en lecture seule.
5. **Champ "Retombées" sur fiche post** (#43). Texte libre 500 char
   max. Alimente TF Analytics pour A2 et A7.

---

## LES 5 LOIS DU CONSEILLER (textuelles, prompt système)

1. **Sang-froid permanent.** Le pilote panique, le conseiller respire.
2. **Voix unifiée.** Le pilote voit UN seul conseiller. Les 12 TF
   travaillent en arrière-plan.
3. **Pair senior.** Jamais boss au-dessus, jamais assistant en
   dessous. Propose, argumente, laisse trancher.
4. **Rationnel visible.** Aucune proposition sans son pourquoi.
5. **Refus honnête + mandat clair.** Décide sur 3 sujets (angle,
   format, ton). Refuse de décider sur 5 sujets (crise,
   partenariat, pilier, juridique, coupure programme) + prépare
   brief direction.

---

## 13 SCÉNARIOS V1 (tableau condensé)

| # | Scénario | Voie d'accès | TF lead | Livrable |
|---|---|---|---|---|
| A1 | Création initiale plan | /mon-programme primaire | Hélène + 4 TF | 3 piliers + calendrier 3-4 sem |
| A2 | Régénération plan | /mon-programme bannière | Sébastien L. | Bilan + calendrier N+1 |
| A7 | Bilan trimestre | /mon-programme secondaire | Sébastien L. | Page bilan exportable PDF |
| B2 | Panne sèche | /aujourd-hui TaskRow | Albane R. | 3 angles + draft caption |
| B4 | Panique week-end | /aujourd-hui CTA | Albane R. | 1 post (pas 2) |
| B5 | Modération quotidienne | Interface modération | Capucine V. | 3 versions réponse |
| C3a | Bad buzz | /outils/conseiller libre | Valentine D. | Grille gravité + 3 copies + brief direction |
| C3b | Imprévu opérationnel | /aujourd-hui TaskRow | Inès B. | 3 options + plan B |
| D6 | Idée direction | /outils/conseiller libre | Jonas K. | Décryptage benchmark + 3 pistes |
| D8 | Opportunité business | /outils/conseiller libre | Jonas K. ou Sasha L. | Plan activation 3 temps |
| D9 | Opportunité visibilité | /outils/conseiller libre | Capucine V. ou Sasha L. | Audit compte + 3 versions réponse |
| E1 | Réunion lundi | /mon-programme secondaire | Sébastien L. | Page synthèse exportable |
| E-divers | Question ouverte | /outils/conseiller libre | Hélène M. détecte | Réponse nuancée + refus si hors scope |

---

## 8 VOIES D'ACCÈS

1. « Créer mon prochain plan sur mesure » — /mon-programme PRIMAIRE
2. Bannière auto « Préparer ton prochain plan » — /mon-programme
3. « Faire le point » — /mon-programme SECONDAIRE
4. « Préparer ma réunion » — /mon-programme SECONDAIRE
5. « Affiner avec le conseiller » (TaskRow) — /aujourd-hui
6. « Préparer le week-end » — /aujourd-hui
7. « Affiner avec le conseiller » (DM/commentaire) — modération
8. Texte libre — /outils/conseiller

**Hiérarchie /mon-programme.** Voie 1 = CTA primaire dominant.
Voies 2, 3, 4 = entrées secondaires (taille réduite, position
secondaire). Pas de foire à boutons.

---

## 12 TF SŒURS — SCOPE V1 (1 paragraphe)

**V1 actif.** Hélène M. (orchestre), Albane R. (Éditorial Magazine,
sources libres droits seulement), Élise M. (Archives, refus
invention absolu), Inès B. (Ops, rappel publication manuelle),
Sébastien L. (Analytics, comptages bruts jamais %), Valentine D.
(Crise, grille gravité 3 niveaux), Capucine V. (Communauté audit
DM/commentaires), Jonas K. (Coups, 1-2/an max), Marc D. (Veille,
benchmarks seulement), Camille O. (Channels LinkedIn/News/GMB à
la demande), Antoine F. (Création Visuelle, briefs A4 imprimables),
Sasha L. (Influence Premium, audit KOL entrants uniquement).

**Hors V1.** Posture proactive sortante Influence, programme
ambassadeurs structuré, automatisations tierces (Make/Zapier),
veille Instagram temps réel, production interne créa, Pinterest
comme source, déclinaison TikTok/X/YouTube/FB.

---

## CONTRAINTES TECHNIQUES

- **Personas.** Question onboarding « Tu pilotes ou c'est la tienne ? ».
  Pilote (Floriane) ou possesseur (Maxime). Stockée BDD.
- **Curseur fréquence.** Discret (1-2/sem) / Équilibré (2-4/sem) /
  Dense (5-7/sem). Question onboarding. Modifiable
  /compte/mon-compte.
- **Tutoiement.** Par défaut. Bascule vouvoiement si pilote vouvoie
  en 1ère interaction. Préférence mémorisée.
- **Multi-utilisateur V1.** Un seul pilote par tenant. Lecture
  seule pour les autres.
- **Tours.** 3 max. Compteur côté serveur uniquement. Bascule
  livraison forcée au tour 4.
- **Sheet.** 60% desktop, full-sheet mobile, **header sticky
  obligatoire**.
- **Streaming.** Plus verbal sur mobile que sur desktop.
- **Modèle Claude.** Opus 4.7 pour conseiller. Coût ~5-10 €/client/mois.

---

## MODE DÉGRADÉ BAD BUZZ (C3a)

Si 5+ nouvelles mentions en 5 min pendant la session → bascule
CRISIS_DEGRADED. Conseiller livre une réponse par défaut sans
attendre validation direction. Pilote tranche entre cette réponse
et le silence.

---

## VOCABULAIRE INTERDIT (rappel)

users, audience, dashboard, workflow, pipeline, viral, boost,
growth hack, KPI, ROI, metrics, performance, reach, engagement (au
sens métrique), IA, modèle, algorithme, Découvrez, Profitez,
compris, génial, super, parfait, tiret long, exclamation, emoji
décoratif, "Stop" (anxiogène), "Vu" (militaire), "doctrinal"
(jargon), Title Case anglais, pourcentages chiffrés (sauf pilotage
stratégique).

---

## ARBITRAGES TECHNIQUES À TRANCHER AU DISPATCH

À faire avant écriture du prompt Sprint 37 demain matin (12
arbitrages, ~20 min).

1. `business_calendar` ou `calendrier_business` (fusion ou choix) ?
2. Ratios par importance d'ancre (3-2-1 pivot, 2-1-0 majeur,
   1-0-0 mineur) ?
3. Naming table `programme_generation_sessions` vs
   `conversations_programme` ?
4. `programme_id` direct vs `programme_session_id` côté drafts ?
5. Schéma JSON `programme`. Inclure visuel ou rester texte ?
6. Server actions vs API routes ?
7. Quotas Anthropic V1. limit-then-hide ou unlimited + monitoring ?
8. Seuil « déjà un programme récent » (21 jours proposé) ?
9. Sprint 36.F (refactor /conseiller) avant 37 ou non ?
10. Détection persona V1. Champ enum, flag boolean ou JSON profile ?
11. Comportement tablet portrait. Sheet 60% ou full-sheet ?
12. Détection vouvoiement V1. Heuristique manuelle ou prompt Claude
    dédié ?

---

## STRUCTURE DES LOTS (proposition, à valider au dispatch)

Lot 1. Onboarding (question persona + curseur fréquence + mini-
onboarding 3 écrans conseiller).

Lot 2. Sheet conversationnelle (composant unique, header sticky,
streaming visible, machine à états).

Lot 3. Page /outils/conseiller (historique lecture seule + bouton
nouvelle question).

Lot 4. Voies d'accès /mon-programme (CTA primaire + 2 secondaires +
bannière régénération auto).

Lot 5. Voies d'accès /aujourd-hui (TaskRow + week-end + modération).

Lot 6. Prompt système conseiller (5 lois textuelles, 12 TF scope V1,
grille crise, mode dégradé, vocabulaire interdit).

Lot 7. Champ Retombées sur fiche post + scénarios A2/A7.

Lot 8. Tests E2E + audit final.

Budget Claude Code estimé. 60-80 € pour ~19 commits en 8 lots.

---

**Note Apple cumulée après 3 salves intégrées : 7,5/10.**
Le passage à 8+ dépend de l'exécution, pas de la doctrine.
