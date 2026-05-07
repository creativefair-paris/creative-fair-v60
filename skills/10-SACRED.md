# 10 — SACRED — Règles non-négociables

> **Si tu lis ce fichier et que tu envisages de modifier
> quelque chose qu'il interdit : STOP. Demande Apple Board.**

============================================================
## Code

### VOICE_SHEET_RULES est SACRÉ

Fichier : `/lib/ai/prompts/system.ts`

Modifier ce fichier casse le prompt cache Anthropic à 90%.
Coût : explosion de la facture + perte de cohérence de voix
+ régression qualité immédiate sur tous les outputs IA.

**Toute modification doit passer par Apple Board.**

### Tables Supabase

Schema défini, RLS appliquée partout.
Aucune table ne doit être ajoutée sans :
- Validation Apple Board
- Migration SQL versionnée
- Politique RLS écrite
- Test isolation à 5/5

### `proxy.ts` (Next.js 16)

Pas `middleware.ts`. Pas d'exception.

============================================================
## Produit

### Navigation 4 destinations

```
1. Aujourd'hui
2. Calendrier
3. Ma Marque
4. Conseiller
```

**Jamais 5 destinations. Jamais.**

Ajout d'une destination = passage en Apple Board obligatoire.

### Émotion centrale : tranquillité

Toute proposition qui crée du bruit visuel, de l'urgence,
de la pression, de la culpabilité → recalée.

### Vocabulaire interdit

```
users         audience        dashboard
workflow      pipeline        tokens
radar         viral           boost
growth hack   bientôt         à venir
```

Si quelqu'un (humain ou IA) écrit l'un de ces mots dans
une copie utilisateur : recalé immédiatement.

### Pas d'emoji, pas d'exclamation

Dans aucune copie utilisateur. Aucun cas d'exception.

============================================================
## Design

### Vert forêt unique accent

```
#1F4937
```

Aucune autre couleur primaire ne doit apparaître.
Pas de bleu, rouge, jaune, sauf erreurs critiques
via `var(--color-error)`.

### Pas de couleur hex hardcodée

Dans aucun composant. Toujours `var(--color-*)`.

Exception : `#FFFFFF` pour destructive CTAs.

### Animations

- Duration 250-600ms
- Ease-out toujours
- Jamais bounce, jamais spring

============================================================
## Workflow

### Avant push

```
☐ npx tsc --noEmit  → 0 erreur
☐ npm run lint      → 0 warning
☐ npm run build     → succès
```

Si un seul échoue : pas de push.

### Avant tag de version

```
☐ Build local OK
☐ Test fonctionnel manuel OK
☐ Score Apple Grade ≥ 60/80
☐ Aucun P0/P1 ouvert
```

### Email Git canonique

```
creativefair@1922.studio
```

Jamais l'email par défaut Mac (`*.local`).

============================================================
## Décisions abandonnées (NE PAS PROPOSER)

Ces décisions ont été prises et tranchées.
Toute proposition de retour en arrière passe par Apple Board.

```
✗ Méthode 4 mois pédagogique
✗ Module "Mon Programme" dédié
✗ Couleur cuivre #C77D3A
✗ Bulle flottante Conseiller
✗ Onboarding 10 questions
✗ Plans b2c_solo / b2c_pro / b2c_studio en V1
```

============================================================
## La règle absolue

**Quand on hésite : on enlève.**

La soustraction précède toujours l'addition.
Si tu es sur le point d'ajouter quelque chose :
demande-toi ce que tu peux retirer à la place.
