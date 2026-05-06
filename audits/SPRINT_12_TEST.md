# Sprint 12 — Test du calendrier

## Principe

`/calendrier` affiche les publications planifiées et les événements
business. Vue semaine par défaut, toggle vers vue mois.

## Test 1 — Vue semaine par défaut

1. Aller sur `/calendrier`
2. La vue semaine s'affiche : 7 colonnes lun→dim
3. Le header indique la plage de dates ("6 mai → 12 mai")
4. La colonne d'aujourd'hui a une bordure accent

## Test 2 — Navigation

1. Cliquer sur la flèche droite → semaine suivante
2. Cliquer sur "Aujourd'hui" → revient à la semaine courante
3. Toggle "Mois" → grille 7 colonnes × 5-6 lignes
4. En vue mois, les jours hors du mois courant sont grisés (opacity 0.45)

## Test 3 — Posts dans le calendrier

1. Avec un post en `draft` planifié dans 3 jours :
   - Card affichée avec `Anecdote · Brouillon` + extrait du hook (60 chars)
   - Bordure grise
2. Avec un post en `scheduled` :
   - Bordure verte + background vert léger
3. Avec un post en `published` :
   - Card grisée à opacité 0.6
4. Cliquer sur une card → navigue vers `/calendrier/[postId]` (Sprint 14)

## Test 4 — Événements business

1. Avec un upcomingLaunch dans 5 jours :
   - Pill couleur accent en haut de la colonne du jour
   - Texte tronqué à 20 caractères avec tooltip complet
2. Recurring + industry events s'affichent aussi

## Test 5 — Empty state

1. Sans aucun post planifié :
   - Card sous le calendrier : "Aucune publication planifiée..."
   - Lien vers `/ma-marque/business-calendar`

## Test 6 — Bouton créer publication

1. Bouton dashed "+ Publication" dans chaque case
2. Pour Sprint 12 : pas d'action (Sprint 14 wirera le modal)
3. Le hover doit fonctionner

## Test 7 — Multi-tenant

1. Tenant A a 3 posts ce mois
2. Tenant B a 0 post
3. Login A → 3 cards visibles
4. Login B → empty state visible

## Note Sprint 14

Le bouton "+" sera connecté au `NewPostModal` au Sprint 14 et la
navigation `/calendrier/[postId]` créée.
