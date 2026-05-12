# Ancres business calendar

Le programme **doit** s'ancrer sur `business_calendar` de la marque.
Sans ancre, le calendrier généré flotte — il ne sert pas un agenda
business réel. La doctrine v60 est explicite : *« Pas de calendrier
subi, arc narratif obligatoire »*.

## Source de vérité

Table `brands` :
- `business_calendar jsonb` — schéma historique Sprint 32.5 + 36.A,
  type `BusinessCalendar`
- `calendrier_business jsonb` — schéma Sprint 36.B.3 (édition 14 blocs),
  array de `MomentBusiness`

À ARBITRER LEAD : ces deux colonnes coexistent. Le flux lit
`calendrier_business` (le plus récent et le plus aligné UI) en priorité,
avec fallback sur `business_calendar` si vide. Sprint 37 exécution doit
soit normaliser, soit choisir une source unique.

## Schéma effectif `MomentBusiness` (depuis `types/ma-marque.ts`)

```ts
type MomentBusiness = {
  id: string
  titre: string
  date_debut: string  // ISO YYYY-MM-DD
  date_fin?: string   // optionnel — événement instantané sinon
  type: 'lancement' | 'evenement' | 'saison' | 'salon' | 'autre'
  importance?: 'pivot' | 'majeur' | 'mineur'
  pilier_id?: string  // optionnel — lien narratif
  visibilite?: 'public' | 'interne'
  notes?: string
}
```

## Comment l'agent intègre les ancres dans la conversation

### Lecture en amont (avant l'ouverture)

Au démarrage du flux, le code charge les ancres dont :
- `visibilite === 'public'` (les ancres internes restent invisibles
  dans la génération de posts)
- `date_debut >= today` AND `date_debut <= today + 8 semaines` (horizon
  de génération nominal)

Ces ancres sont **classées par importance** : `pivot` en haut, puis
`majeur`, puis `mineur`. Le flux raisonne d'abord sur les pivots.

### Premier message (tour 1)

Creative Fair annonce ce qu'il a lu :

> Tu as 3 moments business sur les 6 prochaines semaines.
> — *Atelier Matière Chaude*, 4 au 8 juin (pivot)
> — *Open Studio*, 15 juin (majeur)
> — *Salon des artisans*, 22 juin (mineur)
>
> Je propose qu'on construise le programme autour des deux premiers.
> Le salon, on l'aborde si tu veux, sans dramatiser.

Le user voit immédiatement que le flux n'invente pas — il s'appuie sur
ce qu'il a déjà déclaré dans `/ma-marque`.

### Validation ou ajustement (tour 2)

Boutons à proposer :

- **« Ces 3 ancres me vont »** → valide la lecture
- **« J'ajoute une ancre »** → ouvre un mini-formulaire inline (titre,
  date, type, importance) qui INSERT directement dans
  `calendrier_business` puis re-rentre dans le flux
- **« Je décale »** → ouvre un sélecteur pour reporter une ancre

L'ajout d'ancre depuis le flux est une fonctionnalité **clé** : c'est
souvent ici que le user réalise qu'il n'a pas encore noté son lancement
de septembre. Le flux capture cette intention au moment exact où elle
émerge.

### Construction (tours 3-4)

Pour chaque ancre validée, le flux propose :

- **N posts qui préparent** (avant la date de l'ancre)
- **M posts qui accompagnent** (pendant la fenêtre)
- **P posts qui prolongent** (après — facultatif selon importance)

Règles par défaut, à ARBITRER LEAD :

| Importance | Posts préparation | Posts accompagnement | Posts prolongation |
|---|---|---|---|
| pivot | 3 posts sur 2 semaines avant | 2 posts pendant | 1 post après |
| majeur | 2 posts sur 1 semaine avant | 1 post pendant | 0 post |
| mineur | 1 post sur quelques jours avant | 0 | 0 |

Le user peut surcharger ces poids dans la conversation.

## Cas dégradés

### Business calendar vide

Si aucune ancre publique n'existe sur l'horizon :

> Je n'ai pas d'ancre business à venir. On peut soit pousser un arc
> narratif libre (3 piliers en équilibre, pas d'événement chaud), soit
> reporter ce flux et ajouter d'abord une ancre dans Ma Marque.

Boutons :
- **« Programme libre »** → continue le flux avec contraintes piliers
  uniquement
- **« Reporter, j'ajoute des ancres »** → close le flux, redirect
  `/ma-marque` sur le bloc *Calendrier business*

### Business calendar partiel (ancres uniquement dans un horizon lointain)

> Tu as une ancre en novembre mais rien d'ici là. Je propose un
> programme libre pour mai-juin, puis on planifiera l'arc lancement
> novembre dans un second temps.

L'horizon est resserré à l'horizon utile (jusqu'à la dernière ancre
proche), pas étendu artificiellement.

### Contradictions dans le calendar

Exemple : deux ancres `pivot` sur la même semaine.

> Tu as posé deux moments majeurs sur la semaine du 19 mai. C'est
> beaucoup pour 7 jours. Je propose d'en mettre un en focus (Atelier),
> l'autre en suite (Open Studio). Si l'inverse te va mieux, dis-le.

Le flux ne refuse pas la contradiction, il propose un arbitrage et
laisse le user trancher.

### Ancres expirées laissées en place

Si une ancre a `date_debut < today`, elle n'est jamais utilisée par
le flux. Pas de nettoyage automatique (le user peut vouloir garder
l'historique).

## Pattern de phrase canonique (à reproduire dans le prompt système)

Format reproductible :

> Tu m'as dit que tu lances **{titre}** le **{date_debut}**. Je propose
> de poser **{N} posts** qui préparent ce lancement à partir du
> **{date_debut - 2 semaines}**. Tu valides cet ancrage ?

Le format est strict : nom de l'ancre, date littérale, nombre, fenêtre.
Aucune métaphore, aucun adjectif promotionnel.

## Points à valider par le Lead

- `business_calendar` vs `calendrier_business` : Sprint 37 doit-il
  fusionner ou choisir une source ? Impact migration DB.
- Les ratios par importance (3-2-1 pour pivot, 2-1-0 pour majeur,
  1-0-0 pour mineur) sont des valeurs proposées sans recul terrain.
  À tester ou à arbitrer dès Sprint 37.
- L'ajout d'ancre depuis le flux écrit immédiatement dans
  `calendrier_business`. Faut-il un état intermédiaire (ancre proposée,
  pas encore validée hors flux) ?
- Programme libre (sans ancre) : à autoriser en V1 ou réservé V2 ?
  L'absence d'ancre est doctrinalement borderline.
