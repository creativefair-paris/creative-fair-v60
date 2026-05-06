# Sprint 7 — Test du calendrier business

## Principe

Page `/ma-marque/business-calendar` permet d'éditer le calendrier
business (4 sections). Sauvegarde via Server Actions Next.js dans
`brands.business_calendar` (jsonb).

## Test 1 — État vide

1. User dont la brand a `business_calendar = null`
2. Aller sur `/ma-marque/business-calendar`
3. Vérifier l'onboarding doux : "Renseigne tes événements business…"

## Test 2 — Ajout événement récurrent

1. Saisir "Newsletter mensuelle", fréquence "Mensuel", description courte
2. Cliquer "Ajouter"
3. La page se revalidate → l'événement apparaît dans la liste
4. Vérifier en DB que `business_calendar.recurringEvents` contient un objet
   avec `id`, `name`, `frequency: "monthly"`, `description`

## Test 3 — Ajout lancement

1. Saisir nom, date (ex. 2026-09-15), type "Produit", description
2. Vérifier l'apparition triée par date
3. Vérifier en DB

## Test 4 — Saisonnalité

1. Sélectionner "Intense" pour Été, thèmes "festivals, été, terrasses"
2. Cliquer "Enregistrer"
3. Recharger → la valeur est persistée

## Test 5 — Temps forts sectoriels

1. Saisir "Salon du livre", date, pertinence "Cœur"
2. Vérifier l'apparition triée par date

## Test 6 — Suppression

1. Cliquer l'icône poubelle sur un item existant
2. L'item disparaît immédiatement après revalidation

## Test 7 — Multi-tenant

1. Vérifier que les Server Actions n'écrivent QUE sur la brand du tenant courant
2. Tenant B ne voit pas les événements du tenant A

## Verdict

- [ ] 4 sections fonctionnelles
- [ ] Server Actions sauvegardent dans `business_calendar`
- [ ] Suppression fonctionne (revalidatePath)
- [ ] Tri par date pour lancements et industry events
- [ ] État vide élégant
- [ ] Aucune couleur hard-codée
