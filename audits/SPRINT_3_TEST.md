# Sprint 3 — Test du theming par tenant

## Principe

Le layout `app/(app)/layout.tsx` lit `tenants.theme` depuis Supabase et applique les
CSS variables via un `style` prop inline. Ce style prop override les valeurs `:root`
de `globals.css` pour toutes les pages sous `/(app)/*`.

## Test 1 — Vérifier le thème par défaut (vert forêt)

1. Se connecter avec le user du tenant `angelina`
2. Aller sur `/aujourdhui`
3. Ouvrir les DevTools → inspecter le div racine du layout
4. Vérifier que `--color-accent` vaut `#A8324E` (rouge Angelina, pas le vert forêt)

Si `--color-accent` vaut `#1F4937` → le thème du tenant n'est pas chargé.

## Test 2 — Changer le thème en temps réel

Dans Supabase SQL Editor, forcer une couleur très visible pour confirmer
que le changement se propage :

```sql
-- Mettre une couleur test (rouge vif)
update tenants
set theme = jsonb_set(theme, '{colors,accent}', '"#FF0000"')
where slug = 'angelina';
```

Recharger `/aujourdhui` → l'accent (boutons, labels de marque) doit être rouge vif.

Puis remettre la vraie valeur :

```sql
update tenants
set theme = jsonb_set(theme, '{colors,accent}', '"#A8324E"')
where slug = 'angelina';
```

Recharger → retour au rouge bordeaux Angelina.

## Test 3 — Isolation des thèmes entre tenants

1. Ouvrir deux navigateurs (ou profils) différents
2. Se connecter avec user Angelina dans l'un, user Comptoir dans l'autre
3. Vérifier que chaque browser affiche sa propre palette (pas celle de l'autre)

Attendu :
- Angelina : `--color-accent: #A8324E` (rouge bordeaux)
- Comptoir : `--color-accent: #C26841` (terracotta)

## Test 4 — Aucune couleur hard-codée dans les composants

```bash
grep -rn "#[0-9a-fA-F]\{3,6\}" app/
```

Attendu : 0 résultat (aucun hex direct dans les composants).

## Résultat obtenu

```
[à remplir après exécution des tests]
```

## Verdict

- [ ] Thème tenant chargé et appliqué → Sprint 4 peut commencer
- [ ] Isolé entre tenants → multi-tenant theming OK
- [ ] 0 couleur hard-codée dans les composants
