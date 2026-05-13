# Edge cases et erreurs

Cas non-nominaux à couvrir explicitement Sprint 37 exécution.

## 1. Le user arrête en plein flux

### Symptôme
User ferme l'onglet, navigue ailleurs, perd internet, etc., au milieu
d'un tour.

### Traitement
- La session reste en DB avec son `etat` courant et `updated_at`
  mis à jour à chaque tour.
- Aucune notification, aucun email de relance.
- Au retour user (n'importe quand sur les 7 prochains jours),
  `/aujourd-hui` propose la reprise (cf. doc 02 et doc 06).
- Après 7 jours sans activité : passage à `etat = 'abandonne'` par
  cron (à mettre en place Sprint 38 ou plus tard).

### Détail UI reprise
Ligne discrète dans `/aujourd-hui` *Cette semaine* :

> Tu as commencé à poser ton programme. Tu peux reprendre.

Click → route `/programme/generation/{session_id}` qui rend l'état
exact : si on était en `proposition`, on retombe sur la proposition ;
si on était en `restitution`, sur la restitution.

## 2. Anthropic API down

### Symptômes
- Timeout (>30s) sur un appel
- 5xx Anthropic
- 401 / 403 (key invalide ou révoquée)
- 429 (rate limit Anthropic)
- 503 surcharge

### Traitement par tour

**Pendant les tours de conversation (1-3)** :
Cascade modèle (Opus-4-5 → Opus-4-1 → Sonnet-4-5) tente automatiquement
le fallback. Si la cascade entière échoue :

> J'ai un souci de connexion en ce moment. Tu peux réessayer dans une
> minute, ou je peux te proposer un programme par défaut sans tes
> ancres spécifiques. Tu préfères quoi ?

Boutons :
- *Réessayer* → relance l'appel sur le tour courant
- *Programme par défaut* → bypass Claude, génère un programme template
  basé uniquement sur :
  - les 3 piliers en équilibre 35/35/30
  - le rythme 2 posts/semaine sur 4 semaines
  - aucune ancre business intégrée
  - types de contenu rotation photo/carrousel/reel

**Pendant la génération finale (tour 4)** :
Plus critique. Si la cascade échoue, on n'a pas de programme. Message :

> Je n'arrive pas à finaliser le programme là, maintenant. Ta session
> est sauvegardée. Tu peux reprendre dans quelques minutes.

Session reste en `etat = 'ancrage'`, le user retrouve son contexte.

### Pas de retry agressif côté serveur
1 essai par modèle dans la cascade, pas de retry exponentiel. Mieux
informer le user honnêtement que de masquer les pannes.

## 3. Brand_book incomplet

### Définition
On considère `brand_book` incomplet si :
- `brands.brand_book_status !== 'complete'`, OU
- `brands.piliers_narratifs` n'a pas 3 piliers validés, OU
- `brands.ton` est vide, OU
- `brands.singularite` est vide

### Traitement
Le flux **refuse de démarrer** :

Route `/programme/generation` (server component, server-side check)
redirect vers `/ma-marque?bloc=piliers` (ou bloc manquant le plus
prioritaire) avec un message hero :

> Pour poser un programme cohérent, j'ai besoin que tes 3 piliers
> narratifs soient validés.

Le user complète, puis retourne sur `/aujourd-hui` et relance le flux.

À ARBITRER LEAD : faut-il afficher le CTA *« Poser le rythme »* sur
`/aujourd-hui` même quand brand incomplete (avec disabled + tooltip
explicatif), ou cacher le CTA totalement ? Tooltip plus informatif,
caché plus minimal.

## 4. Calendrier business vide

### Traitement
Cf. doc 03 — branche dégradée *programme libre* avec choix explicite
du user (continuer libre OU reporter pour ajouter ancre).

Pas de blocage, pas de redirect forcé. Le programme libre est
acceptable en V1 (à reconsidérer V2 si la qualité éditoriale chute).

## 5. Un programme a déjà été généré ce mois

### Symptôme
User a fait *Tout valider* sur une session il y a 12 jours, lance
une nouvelle session.

### Détection
Server-side, au démarrage du flux :

```sql
select count(*)
from programme_generation_sessions
where brand_id = $brand_id
  and etat = 'termine'
  and terminated_at > now() - interval '21 days';
```

Si count > 0 : afficher confirmation explicite :

> Tu as posé un programme il y a moins de 3 semaines. Si tu en poses
> un nouveau maintenant, il s'ajoutera au calendrier existant. Tu
> peux aussi modifier l'ancien depuis `/programme`.

Boutons :
- *Continuer quand même* → lance le flux normalement
- *Voir le programme actuel* → redirect `/programme`

À ARBITRER LEAD : le seuil (3 semaines) est arbitraire. Doit-il
correspondre au rythme nominal (trimestre = 12 semaines) ou rester
plus court pour autoriser des ajustements ?

## 6. Quotas Anthropic / crédits

### Doctrine
**Aucune mention de crédits/tokens/quotas dans l'UI utilisateur.** Le
user ne doit pas se demander *« est-ce que j'ai assez de tokens ? »*.
C'est l'inverse de la doctrine anti-gamification : on ne transforme
pas la valeur produit en jauge.

### Côté serveur

- Compteur usage interne (par tenant, par mois) dans une table
  `usage_anthropic` (à créer Sprint 38, hors scope 37).
- Si un tenant dépasse un seuil pré-défini (admin-only, pas exposé) :
  les nouvelles sessions échouent avec message générique
  *« Service temporairement indisponible »*, et un email admin part.
- Pas de hard-block visible côté user.

À ARBITRER LEAD : le modèle économique V1 prévoit-il déjà un cap par
tenant ? Si oui : quel seuil ? Si non : on instrumente sans bloquer en
V1 et on revisitera quand le volume sera mesuré.

## 7. Ancres business expirées entre la génération et le validation

### Symptôme
User démarre le flux le 1er juin. Une ancre business *Open Studio*
est posée au 5 juin. User abandonne, revient le 10 juin pour valider.
L'ancre est expirée.

### Traitement
À la reprise de la session, le serveur vérifie chaque ancre dans
`session.ancres_validees` :
- Si une ancre `date_debut < today` → la session devient invalide
  pour validation finale

Message hero sur la vue restitution :

> Le programme a été conçu autour de moments business qui sont
> aujourd'hui passés. Tu peux régénérer la proposition à partir de
> ce que tu as devant toi.

Boutons :
- *Régénérer* → retour `ancrage`, conversation rejoue à partir du
  contexte actuel
- *Abandonner* → session passe `abandonne`

Les drafts déjà posés ne sont pas envoyés dans `posts` automatiquement.

## 8. Conflit avec un programme manuel pré-existant

### Symptôme
User a, sur la même fenêtre temporelle, des posts manuels
(`statut='planifie'`) déjà programmés. Le flux propose 3 posts par
semaine, dont certains tombent sur des dates où l'user a déjà mis des
posts manuels.

### Traitement
Côté Claude (couche 2 du prompt système) : on injecte les posts déjà
programmés sur l'horizon → le modèle évite les collisions de date.

Si collision résiduelle (Claude ne respecte pas la consigne, edge
case) : à la validation, l'INSERT dans `posts` ne dédoublonne pas
automatiquement (les posts manuels et générés cohabitent). À ARBITRER
LEAD : tolérer le double-post sur la même date ou imposer une règle
de précédence ?

## 9. Génération JSON malformée par Claude

### Cf. doc 04 section validation server-side
Max 2 retries avec note correctrice. Si toujours invalide après 2
retries : fallback dégradé identique au cas *Anthropic down* → proposer
réessayer ou programme par défaut.

## 10. User dont la session expire (cookie auth) pendant le flux

### Traitement
Tous les appels serveur sont gated par `createClient().auth.getUser()`.
Si user devient null, l'API retourne 401. Côté client, intercepter :

> Ta session a expiré. Reconnecte-toi pour reprendre.

Bouton → `/login`, retour automatique sur `/programme/generation/{id}`
après auth réussie (paramètre `redirect_to` dans le magic link).

## Points à valider par le Lead

- Seuil 21 jours pour *« déjà un programme récent »* — arbitraire.
- Programme par défaut (fallback Claude down) doit-il vraiment être
  proposé ou simplement *« reviens plus tard »* ? Le programme par
  défaut est doctrinalement faible (pas d'ancre business).
- Stratégie quotas Anthropic : V1 limit-then-hide ou V1 unlimited +
  monitoring ?
- Conflit date avec posts manuels : tolérer ou bloquer ?
- Ancres expirées : régénération automatique côté serveur sans
  redemander au user, ou bien laisser le user décider à chaque
  reprise ?
