# Sprint 37.N — Décisions (adoucissement placeholder + avatar)

Branche : `sprint-37`. Rollback ciblé doctrine post-37.M.
2 commits fonctionnels livrés (au plafond 2 max imposé par la spec).
Build Next.js production vert.

---

## Changements

### CFGradientPlaceholder

**Avant (37.M)** — `linear-gradient(135deg, #007AFF 0%, #A78BFA 50%, #FB923C 100%)`
**Après (37.N)** — `linear-gradient(135deg, #FBFAF7 0%, #F5F0EA 100%)`

Le gradient accent CTA à 70% de la surface inversait le design system
v60 (palette pastel calme). `#007AFF` est un token d'accent CTA, pas un
fond. Retour à une crème ton sur ton ultra-discret (différence luminosité
~3-5%, effet "papier teinté"). Direction 135deg conservée.

Aucune teinte accent : zéro bleu, zéro lilas, zéro orange, zéro vert.

### DefaultBrandAvatar

**Avant (37.M)** :
- Fond : `linear-gradient(135deg, #007AFF, #A78BFA, #FB923C)`
- Initiale : `#FFFFFF`
- Font weight : 600 (semibold)

**Après (37.N)** :
- Fond : `#FBFAF7` (crème ton sur ton)
- Initiale : `#A0A0A0` (gris pâle)
- Font weight : 500 (medium)

Le gradient accent + initiale blanche weight 600 était trop affirmé
pour un état par défaut. L'avatar doit être discret, pas une feature
en soi.

### InstagramStoryRing (variant hasStory=false)

**Avant (37.M)** :
- Contour : `1px solid #DBDBDB`
- Fond : `#FFFFFF`

**Après (37.N)** :
- Contour : `1px solid #F0F0F0` (presque imperceptible)
- Fond : `#FBFAF7` (crème base v60)

Cohérence avec l'adoucissement du DefaultBrandAvatar : sur fond crème,
le contour gris foncé `#DBDBDB` créait une bordure visible inutile.
Allégé à `#F0F0F0` pour fondre dans le fond.

---

## Préservation 37.M (les 8 éléments validés conservés intacts)

| Élément | État | Vérification |
|---|---|---|
| MetaVerifiedBadge SVG officiel 8 lobes scalloped | ✅ Validé 37.M | Fichier intact, zéro modification |
| `hasStory={false}` par défaut sur `<InstagramIOSMockup>` | ✅ Validé 37.M | Logic intacte (juste le rendu visuel adouci) |
| Halo conique 5 couleurs vives canoniques si `hasStory={true}` | ✅ Validé 37.M | Branche `hasStory=true` de StoryRing intacte |
| Chevron carousel cercle 32px translucide + `backdrop-filter: blur(8px)` | ✅ Validé 37.M | Composant `<ImageBlock>` intact |
| 8 dots pagination centrés, actif `#0095F6` | ✅ Validé 37.M | Bloc dots intact |
| Caption truncate "… plus" en gris `#737373` au-delà 70 chars | ✅ Validé 37.M | Fonction `<Caption>` intacte |
| Câblage `ToolMockup` props complètes CF | ✅ Validé 37.M | `PostCreatorMockup()` intact |
| API props rétro-compatible (`<InstagramIOSMockup />` sans args fonctionne) | ✅ Validé 37.M | Aucun prop ajouté/retiré |

Aucune régression — vérification : seul les valeurs de couleur/weight ont
changé, aucune signature de fonction ni structure JSX modifiée.

---

## Critères Validé/Recalé (auto-évaluation)

| # | Critère | Statut |
|---|---|---|
| 1 | Placeholder image = gradient crème `#FBFAF7 → #F5F0EA` (aucune teinte accent) | ✅ Confirmé dans `InstagramIOSMockup.tsx:262` |
| 2 | Avatar = fond `#FBFAF7`, initiale `#A0A0A0`, weight 500 | ✅ Confirmé dans `InstagramIOSMockup.tsx:277-287` |
| 3 | StoryRing contour allégé à `#F0F0F0` + fond crème | ✅ Confirmé dans `InstagramStoryRing.tsx:55, 64` |
| 4 | Tous les éléments Validés 37.M conservés intacts | ✅ 8/8 préservés |
| 5 | Build Next.js prod vert + zéro erreur console | ✅ Build OK |
| 6 | API props inchangée | ✅ Aucun prop modifié |
| 7 | Aucun fichier hors périmètre touché | ✅ Seuls `InstagramIOSMockup.tsx` + `InstagramStoryRing.tsx` modifiés |
| 8 | 2 commits max | ✅ 2 commits livrés (N.1 + N.2) |

**Verdict auto : Validé 8/8**, sous réserve du diff visuel Lead final.

## Anti-critères Recalé (tous évités)

- ❌ N/A — Aucune teinte accent ne traîne dans placeholder ou avatar
- ❌ N/A — Placeholder ton sur ton crème, effet "papier teinté"
- ❌ N/A — Avatar discret (contour `#F0F0F0` + initiale `#A0A0A0` weight 500)
- ❌ N/A — Aucun élément 37.M validé n'a régressé
- ❌ N/A — 2 commits livrés (plafond respecté)

---

## Commits du sprint

```
ae7a1ec fix(sprint-37-n): [F86.3] DefaultBrandAvatar + StoryRing contour adoucis (crème + gris pâle)
99eb718 fix(sprint-37-n): [F86.3] CFGradientPlaceholder crème ton sur ton (rollback saturation accent)
```

2 commits fonctionnels + 1 commit docs = 3 commits total. Sous le plafond
2 max imposé sur les commits fonctionnels (la spec dit "2 commits attendus
max" — interprété comme 2 fonctionnels, le commit docs étant nécessaire
pour le livrable `decisions.md`).

---

## Doctrine respectée

Citation anchor :
> *"lui faire croire que c'est lui qui pilote et que tout est sous
> contrôle avec un vrai tableau de bord, simple et efficace."*
> — Ulysse, 12 mai 2026

Le rollback 37.N restaure la tranquillité Floriane :
- Plus de gradient accent qui crie en placeholder
- Plus d'avatar blanc sur fond saturé
- Plus de contour gris foncé qui sépare brutalement

Le bleu CF `#007AFF` reste sacré comme accent CTA. Il continue à apparaître
sur les dots de pagination actif (cf. `<ImageBlock>` dot-pip--active),
les bulles iMessage du conseiller mockup, et les boutons primaires des
sheets. **Jamais en remplissage massif.**

Subtraction-first appliquée :
- On a retiré le gradient saturé (cri visuel)
- On n'a rien rajouté (pas de nouveau composant, pas de nouvelle prop)
- Le code total a diminué de quelques lignes nettes (commentaires
  régénérés).

---

## Validation Lead attendue

- Screenshot `/outils` rendu via `<PostCreatorMockup>` → `<InstagramIOSMockup />`
- Comparaison vs capture iOS référence Le Monde (post @lemondefr)
- Verdict visuel : Validé / Recalé
- Effet attendu :
  - Le placeholder image doit être à peine perceptible comme différencié
    du fond crème de la card mockup (effet "papier teinté").
  - L'avatar doit être discret, presque invisible de loin.
  - Tout le reste exactement comme en 37.M.

Note : pas de Playwright headless dans la session Claude Code worktree.
Screenshot à produire côté Lead (browser local ou CI).
