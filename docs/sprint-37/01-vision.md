# Vision — Flux conversationnel de génération du programme

## Ce que c'est

Une conversation guidée, courte, qui aboutit à un **programme éditorial
proposé** pour les semaines à venir : 8 à 14 posts répartis sur 4 à 6
semaines, ancrés sur le `business_calendar` de la marque, équilibrés
sur les 3 piliers narratifs validés.

Le flux n'est ni un chat ouvert (cf. `/conseiller`), ni la génération
d'un post unique (cf. `/post-creator`). C'est un **acte stratégique**
qui se produit rarement — une fois par trimestre dans le rythme nominal,
exceptionnellement à mi-trimestre si l'arc narratif est obsolète.

## Différences avec les modules existants

| Module | Granularité | Durée user | Livrable |
|---|---|---|---|
| `/conseiller` | 1 échange = 1 question stratégique | 2 à 10 minutes | Une réponse rédigée, mémorable, à ré-utiliser |
| `/post-creator` | 1 session = 1 post final | 5 à 20 minutes | Un post prêt à programmer ou publier |
| **Flux génération programme** | 1 session = 8 à 14 posts | 8 à 15 minutes | Un calendrier rempli, validable post par post |

`/conseiller` répond à *« Comment je devrais aborder ce sujet ? »*.
`/post-creator` répond à *« Aide-moi à finir ce post-là »*.
Le flux programme répond à *« Pose-moi le rythme des prochaines semaines »*.

## Quand le flux se déclenche

Trois portes d'entrée, par ordre de fréquence attendu :

### 1. CTA explicite dans `/aujourd-hui` (porte principale)

Section *Cette semaine* ou *Ta marque prend forme* : un bouton discret
**« Poser le rythme des prochaines semaines »** apparaît si :
- aucun programme actif n'existe pour la période en cours, OU
- le programme actif arrive à 1 semaine de sa fin

Pas de notification intrusive, pas de chiffre rouge. La proposition se
fait visible quand elle est pertinente, invisible sinon.

### 2. Suggestion contextuelle dans `/conseiller`

Si la conversation `/conseiller` détecte une intention proche
(*« Comment je m'organise pour septembre ? »*, *« Mon trimestre est
vide »*), Creative Fair propose en fin de réponse :

> Si tu veux, on peut poser ensemble le programme des 6 prochaines
> semaines. Ça prend une dizaine de minutes.

Bouton qui transfère vers le flux dédié, conservant le contexte
conversationnel comme amorce.

### 3. Lien direct depuis `/programme` (réservé V2)

Sur la vue Calendrier, un bouton **« Régénérer ce trimestre »** à
ARBITRER LEAD pour V1 — dangereux de proposer la régénération à un
clic si le user a déjà travaillé manuellement ses posts. Probablement
caché derrière une étape de confirmation.

## Livrable final côté user

À la fin du flux, le user voit **une vue de proposition** :

```
Voici ton programme pour les 6 prochaines semaines.

  Semaine du 19 mai  ●  3 posts
    Lundi 19  · Photo — « Atelier en cours »
    Mercredi 21 · Carrousel — « 3 gestes qui me définissent »
    Vendredi 23 · Reel — « Backstage tournage »

  Semaine du 26 mai  ●  2 posts
    ...

  [bouton] Tout valider     [lien] Modifier un post   [lien] Repartir
```

Chaque post est un **draft** (table `drafts`, à créer Sprint 37) lié
au programme proposé. Le user peut :
- Tout valider → les drafts passent en `posts.statut = 'planifie'`
- Cliquer un post → ouvre l'éditeur (réutilise `/post-creator`)
- Supprimer un post → le retire de la proposition (pas du calendar)
- Demander un remplacement → re-génère ce seul post avec contraintes

Tant que le user n'a pas tout validé, **rien n'apparaît dans le
calendrier officiel**. Les drafts vivent dans un état intermédiaire
visible uniquement depuis cette vue de restitution et la section
*Brouillons* de `/aujourd-hui` (déjà stub V1 dans Sprint 36.C).

## Ce que le flux ne fait pas

- **Pas de génération en arrière-plan** : le user voit Creative Fair
  raisonner pendant la conversation, jamais de surprise calendrier
  inattendue.
- **Pas de publication automatique** : les posts générés sont des
  *propositions de contenu pré-écrit*, pas des publications planifiées
  Meta/Instagram. La publication V1 reste manuelle (copier-coller du
  draft vers le canal).
- **Pas de comparaison entre tenants** : aucun *« d'autres marques font
  3 posts/semaine »*. Aucune métrique publique, aucun benchmark.
- **Pas de coaching de performance** : le flux ne dit pas *« la dernière
  fois tu as fait mieux »*. Pattern Apple Health : chiffres bruts dans
  `/aujourd-hui` (déjà livré 36.C), le flux n'y revient pas.

## Points à valider par le Lead

- Le timing par trimestre est-il le bon rythme nominal ? Mensuel
  serait plus réactif mais plus intrusif. Bi-trimestriel rate les
  saisons.
- Le bouton **« Régénérer ce trimestre »** depuis `/programme` (porte 3)
  doit-il exister en V1 ou être reporté V2 ?
- Le livrable est-il bien *« drafts à valider »* et non *« publications
  programmées »* ? La distinction conditionne 50% du Sprint 37 exécution.
- L'intention détectée dans `/conseiller` (porte 2) demande de
  l'intelligence côté agent : à ARBITRER LEAD si Sprint 37 doit
  l'inclure ou si on se contente de la porte 1 en V1.
