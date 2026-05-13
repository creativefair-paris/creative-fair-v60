# Restitution du livrable

À la fin du flux, le user voit son programme. Cette étape est aussi
importante que la conversation elle-même : c'est ici qu'il **prend
possession** du programme proposé.

## Vue de restitution — wireframe textuel

Page dédiée, route proposée `/programme/generation/{session_id}` :

```
PageHeader : "Voici ton programme"
Breadcrumb : Aujourd'hui › Programme › Proposition

[Hero court]
"6 semaines, 11 posts. Tu valides tout d'un coup ou tu retravailles
poste par poste."

[Liste — une carte par semaine, hairlines entre semaines]

  SEMAINE DU 19 MAI · 3 posts
    ┌──────────────────────────────────────────────────┐
    │ Lundi 19 · 10h                                   │
    │ photo                                            │
    │ « Atelier en cours »                             │
    │ Tu nous montres le bain de teinture du matin.    │
    │ Pilier : Procédé · Ancre : Atelier Matière Chaude│
    │ [Modifier] [Rejeter] [Demander un remplacement]  │
    └──────────────────────────────────────────────────┘
    ┌──────────────────────────────────────────────────┐
    │ Mercredi 21 · 18h                                │
    │ carrousel                                        │
    │ ...                                              │
    └──────────────────────────────────────────────────┘
  ...

  SEMAINE DU 26 MAI · 2 posts
  ...

[Sticky footer en bas, glass thin]
  [Bouton secondaire] Tout reprendre depuis zéro
  [Bouton primaire]   Tout valider — 11 posts
```

## Actions par carte

### Modifier

Click → ouvre `/post-creator?draft_id={id}` en plein écran. Le module
Post Creator existant est réutilisé tel quel ; il lit le draft et
fournit l'édition standard (titre, teaser, type, visuel généré).
Au save, `drafts.status='modifie'` et l'utilisateur revient à la
restitution avec la carte mise à jour.

À ARBITRER LEAD : faut-il marquer un draft modifié visuellement (badge
*« édité »*) ou laisser la modif invisible ? Le badge alourdit l'UI
mais peut servir d'audit.

### Rejeter

Click → confirmation rapide inline (pas de modale lourde) :

> Tu retires ce post de la proposition. La case calendrier reste vide.

Boutons : *Confirmer* / *Annuler*. Confirmé → `drafts.status='rejete'`,
la carte se grise puis disparaît au prochain rendu. La semaine garde
ses autres posts.

### Demander un remplacement

Click → mini-formulaire inline :

> Qu'est-ce qui ne va pas dans ce post ?
> [bouton] Pas le bon pilier
> [bouton] Pas la bonne ancre
> [bouton] Pas le bon ton
> [bouton] Trop publicitaire
> [textarea] Autre raison...

Submit → appel API `/api/programme/generation/regenerate-draft` avec
`draft_id` + `motif`. Le serveur :
1. Construit un mini-prompt Claude avec contexte session + motif
2. Génère un nouveau draft (1 seul, pas tout le programme)
3. Remplace `drafts.{id}` par le nouveau (status reset à `propose`)
4. Retourne le nouveau draft → UI met à jour la carte

Limite anti-abus : **max 3 régénérations par draft**. Au-delà, le user
doit éditer manuellement via *Modifier*.

## Action globale : « Tout valider »

C'est l'acte qui transforme les propositions en plan officiel.

Avant le clic :
- Tous les drafts en status `propose` ou `modifie` deviennent des posts
- Les drafts `rejete` sont supprimés (CASCADE depuis session)
- La session passe en `etat = 'termine'`

Algorithme côté serveur :

```sql
-- Transaction
begin;

insert into posts (
  programme_id, tenant_id, brand_id, pilier_nom, jour, date_prevue,
  heure_prevue, titre, angle, type_contenu, statut, contenu_genere
)
select
  null,  -- pas de programme parent en V1, à arbitrer
  d.tenant_id, d.brand_id, d.pilier_nom,
  to_char(d.date_prevue, 'TMDay'),
  d.date_prevue, d.heure_prevue,
  d.titre_court, d.teaser, d.type_contenu, 'planifie', null
from drafts d
where d.programme_session_id = $session_id
  and d.status in ('propose', 'modifie');

update drafts
  set status = 'consumed', updated_at = now()
where programme_session_id = $session_id
  and status in ('propose', 'modifie');

update programme_generation_sessions
  set etat = 'termine', terminated_at = now()
where id = $session_id;

commit;
```

À ARBITRER LEAD : faut-il créer un row dans la table `programmes`
existante (qui contient `arc_narratif`) au moment du Tout valider ? Le
flux génère un programme conceptuel mais pas forcément un
`arc_narratif` rédigé. Décision conditionne le schéma.

Redirect post-validation : `/programme` (la vue calendrier officielle).
Le user voit ses nouveaux posts apparaître. Toast discret (ou hero
temporaire) :

> 11 posts ajoutés à ton calendrier sur 6 semaines.

Aucune célébration, pas de confetti, pas de *« Bravo »*.

## Action globale : « Tout reprendre depuis zéro »

Click → confirmation modale légère :

> Tu effaces la proposition actuelle et tu repars d'un nouveau dialogue.

Boutons : *Confirmer* / *Annuler*. Confirmé →
- Tous les drafts de la session sont supprimés
- Session passe `etat = 'abandonne'`
- Redirect vers la porte d'entrée (`/aujourd-hui` ou `/programme` selon
  origine) avec CTA *Poser le rythme* à nouveau visible.

## Reprise asynchrone

Si le user quitte la page avant validation :
- Drafts restent en DB avec `status = 'propose'`
- Session reste `etat = 'restitution'`
- Apparait dans `/aujourd-hui` section *Brouillons* (encore stub V1
  Sprint 36.C — à activer Sprint 37) comme :

  > Programme proposé : 11 posts prêts à valider.
  > [bouton] Voir la proposition

Click → retour direct à la vue restitution avec l'état exact.

## Pattern Apple : prévisualisation avant programmation

Important : tant que *« Tout valider »* n'a pas été cliqué, le
calendrier officiel `/programme` n'affiche **rien de cette session**.
Les drafts vivent dans un état intermédiaire, invisible du calendrier.

C'est intentionnel : le user voit son programme avant qu'il existe,
peut le retravailler, et **prend acte** au moment où il valide. Évite
le sentiment *« le système a décidé pour moi »*.

## Cas où le programme proposé est jugé inutilisable

Si Claude génère un programme manifestement faible (le user clique
*« Tout reprendre »* immédiatement), on devrait apprendre. À ARBITRER
LEAD : faut-il logger ces *« reprises brutales »* (timestamp ouverture
→ timestamp abandon < 30 secondes) pour analyse offline ? Sans
gamifier le user, on instrumente le système.

## Points à valider par le Lead

- Faut-il une étape *« Aperçu calendrier »* avant *« Tout valider »*
  où le user voit le programme posé sur la grille calendrier en mode
  preview ? Ou la liste par semaine suffit ?
- Le bouton *Demander un remplacement* avec motif structuré (4 boutons
  + textarea) est-il trop guidé ? Alternative : textarea libre uniquement.
- Création automatique d'un `programmes.arc_narratif` au Tout valider :
  oui (cohérent avec table existante) ou non (V1 reste simple, drafts
  → posts directement) ?
- La limite max 3 régénérations par draft est arbitraire — laisser
  infini en V1 et instrumenter, ou imposer cette limite dès le départ ?
