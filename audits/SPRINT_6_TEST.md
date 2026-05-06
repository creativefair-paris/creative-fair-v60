# Sprint 6 — Test du brand book V1

## Principe

Page `/ma-marque` affiche les sections de navigation du module marque.
Page `/ma-marque/brand-book` affiche le brand book stocké dans
`brands.brand_book` (jsonb), en consultation seule. État vide élégant
si `brand_book` est null.

## Test 1 — État vide

1. Se connecter avec un user dont la brand a `brand_book = null`
2. Aller sur `/ma-marque/brand-book`
3. Vérifier qu'on voit "Génère ton brand book pour commencer."
4. Le bouton "Démarrer" mène vers `/ma-marque/onboarding`

## Test 2 — Navigation /ma-marque

1. `/ma-marque` montre 3 sections : Brand book, Calendrier business, Paramètres
2. Si brand_book_status = 'incomplete' : CTA d'invitation
3. Le clic sur "Brand book" mène vers `/ma-marque/brand-book`

## Test 3 — Affichage brand book complet

Pré-requis : insérer un brand_book de test dans Supabase
(via Sprint 8 ou manuellement).

```sql
update brands
set brand_book = '{ "identity": { "name": "Test", ... }, ... }'::jsonb,
    brand_book_status = 'complete'
where tenant_id = '<id>';
```

1. Aller sur `/ma-marque/brand-book`
2. Vérifier l'affichage des 7 sections en prose (pas en listes à puces)
3. Vérifier que les territoires sont listés avec exemples
4. Vérifier que les couleurs/polices/références sont présentes

## Test 4 — Helper getBrandByTenantId

```ts
import { getBrandByTenantId } from '@/lib/supabase/brands'
const brand = await getBrandByTenantId(supabase, tenantId)
// brand est typé Brand | null
```

## Verdict

- [ ] /ma-marque navigation fonctionnelle
- [ ] /ma-marque/brand-book vide → état élégant
- [ ] /ma-marque/brand-book complet → 7 sections en prose
- [ ] Helpers Supabase typés
- [ ] Aucune couleur hard-codée
