# Sprint 11 — Visibilité brand book pilote

## Principe

Rendre visible que l'IA s'appuie réellement sur le brand book et le
calendrier business du tenant. Transparence radicale.

## Test 1 — Badge Adapté sur la card coaching

1. `/aujourdhui` avec un coaching généré et un événement business proche
2. La card coaching doit afficher en bas :
   `Adapté à ton calendrier · <nom de l'événement>`
3. Si aucun événement dans la fenêtre 14 jours : pas de badge

## Test 2 — Indicateur de crédits dans le header

1. Sur n'importe quelle page de `/aujourdhui`, `/calendrier`, etc.
2. Le header affiche à gauche du Conseiller : `X crédits ce mois`
3. Cliquer dessus → popover avec détail :
   - Coaching : N
   - Génération : N
   - Brief : N
   - Brand book : N
   - Conseiller : N
4. Cliquer en dehors → popover se ferme

## Test 3 — Compteur correct par mois calendaire

```sql
select feature, count(*)
from credits_usage
where created_at >= date_trunc('month', now())
group by feature;
```

Comparer avec le popover. Doit matcher exactement.

## Test 4 — Composant AdaptedBadge réutilisable

`components/ui/AdaptedBadge.tsx` accepte `context` + `type`.
Sera réutilisé sur les cards de post (Sprints 15-17) avec
`type="post"` → préfixe `Adapté à ta voix`.

## Test 5 — Multi-tenant

1. Tenant A a 5 crédits ce mois (1 coaching + 4 conseiller)
2. Tenant B a 0 crédits
3. Login A → header affiche "5 crédits ce mois"
4. Login B → header affiche "0 crédits ce mois"
