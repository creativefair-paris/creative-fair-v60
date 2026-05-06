# Sprint 4 — Test du layout principal et navigation

## Principe

Le layout `app/(app)/layout.tsx` inclut maintenant :
- `Header` — logo texte + icône Conseiller + avatar dropdown
- `Sidebar` — 4 destinations, desktop uniquement (≥768px)
- `BottomNav` — 4 icônes, mobile uniquement (<768px)

## Test 1 — Navigation desktop (≥768px)

1. Se connecter et aller sur `/aujourdhui`
2. Redimensionner la fenêtre à ≥768px
3. Vérifier que la sidebar est visible à gauche (220px)
4. Vérifier que la BottomNav est masquée
5. Cliquer sur chaque lien de la sidebar → vérification de l'item actif (fond `--color-accent`)

## Test 2 — Navigation mobile (<768px)

1. Redimensionner la fenêtre à <768px
2. Vérifier que la sidebar est masquée
3. Vérifier que la BottomNav est visible en bas (64px, fixed)
4. Cliquer sur chaque icône → navigation fonctionnelle

## Test 3 — Header

1. Vérifier que le logo "Creative Fair" est visible à gauche
2. Cliquer sur l'icône MessageCircle → redirige vers `/conseiller`
3. Cliquer sur l'avatar (initiales) → dropdown s'ouvre avec "Mon compte" + "Se déconnecter"
4. Cliquer en dehors → dropdown se ferme
5. Cliquer "Mon compte" → navigue vers `/mon-compte`
6. Cliquer "Se déconnecter" → logout fonctionnel

## Test 4 — Thème tenant dans le layout

1. Vérifier que l'avatar a la couleur `--color-accent` du tenant (pas le vert forêt par défaut)
2. Vérifier que les items actifs de la sidebar ont la bonne couleur tenant

## Résultat obtenu

```
[à remplir après exécution des tests]
```

## Verdict

- [ ] Header fonctionnel (logo, MessageCircle, dropdown avatar)
- [ ] Sidebar desktop active state correct
- [ ] BottomNav mobile visible et fonctionnelle
- [ ] Thème tenant appliqué dans les composants de navigation
