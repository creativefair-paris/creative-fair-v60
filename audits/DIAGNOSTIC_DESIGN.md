# Diagnostic — Design Liquid Glass + vert forêt absent en local

> Sprint hors cycle — diagnostic uniquement, aucun fix appliqué.
> Cible : pourquoi `http://localhost:3001` ne montre pas la signature
> visuelle attendue (cf. `skills/00-CONCEPT.md` § Signature visuelle).

============================================================
## 1. Causes identifiées

### 1.1 — Cause confirmée · Theme tenant local n'est pas CFS

`supabase/migrations/003_seed_tenants.sql` insère 3 tenants client
B2B avec accents non-verts :

| Tenant | Accent | Background |
|---|---|---|
| `angelina` | `#A8324E` (rose) | `#FFF8F3` |
| `tousentete` | `#3B7A99` (bleu) | `#F5F9FB` |
| `comptoir` | `#C26841` (cuivre) | `#FAF4ED` |

Mécanisme : `app/(app)/layout.tsx:65-74` lit `tenants.theme` puis
`buildThemeVars(theme)` injecte les variables en `style` inline
sur le `<div>` wrapper (ligne 90-93). **Si l'utilisateur de test
local appartient à un de ces 3 tenants, son accent ne sera jamais
`#1F4937`** — par construction.

C'est conforme à l'architecture multi-tenant, mais incompatible
avec « valider la signature CFS sur localhost ».

### 1.2 — Cause confirmée · Glass classes peu diffusées

`grep glass-z1|glass-z2|glass-z3|glass-bar|glass-control` →
**7 fichiers** seulement :

```
✓ components/layout/Header.tsx          (glass-bar)
✓ components/layout/Sidebar.tsx         (glass-bar)
✓ components/layout/BottomNav.tsx       (glass-bar)
✓ components/aujourdhui/CoachingCard.tsx        (glass-z2)
✓ components/aujourdhui/CoachingGenerator.tsx   (glass-z2)
✓ components/conseiller/ConseillerChat.tsx      (glass-z2)
✓ components/ui/EmptyStateBrand.tsx             (glass-z2)
```

**Manquants notables** (et donc invisibles en glass) :
- Calendrier (`components/calendar/*`)
- Post Creator (`components/post-creator/*`)
- Ma Marque (`components/ma-marque/*`)
- Mon Compte (`app/(app)/mon-compte/*`)
- Cards / Modales / Inputs UI génériques (`components/ui/*`)

Sur la majorité des écrans, l'utilisateur voit donc des surfaces
plates (`bg-white` ou `var(--color-surface)` sans `backdrop-filter`).
La promesse « Liquid Glass partout » de `skills/00-CONCEPT.md` n'est
pas tenue.

### 1.3 — Cause possible · Mode sombre macOS

`styles/liquid-glass.css:46-51` :

```css
@media (prefers-color-scheme: dark) {
  :root {
    --glass-tint-rgb: 30, 32, 35;   /* devient sombre */
    --glass-shadow-rgb: 0, 0, 0;
  }
}
```

Si macOS est en dark mode, les surfaces glass deviennent gris-sombre
au lieu de blanc translucide → impression visuelle de « pas de glass ».
Le reste du theme (`--color-background: #FBFAF7` etc.) reste clair car
défini dans `:root` sans media query → **incohérence visuelle** :
fond crème + glass sombre.

### 1.4 — Cause possible · `prefers-reduced-transparency`

`liquid-glass.css:168-178` désactive entièrement `backdrop-filter`
si l'utilisateur a activé « Réduire la transparence » dans les
réglages d'accessibilité macOS. À vérifier côté OS de test.

### 1.5 — Suspect · Port 3001 (architecture annonce 3000)

`skills/01-ARCHITECTURE.md:204` annonce `http://localhost:3000`.
L'utilisateur teste sur 3001 → un autre process Next dev tourne
sur 3000 (probable v55/v54). Vérifier que c'est bien `creative-fair-v60`
qui sert sur 3001 et pas une ancienne build.

### 1.6 — Non-bug confirmé

| Phase | Vérif | Résultat |
|---|---|---|
| 1 | `liquid-glass.css` importé ? | ✅ via `app/globals.css:2` |
| 2 | Variables `--glass-*` définies ? | ✅ `liquid-glass.css:15-44` |
| 2 | Variables `--color-*` injectées ? | ✅ `:root` globals.css + override `(app)/layout.tsx:90-93` |
| 5 | Header utilise glass ? | ✅ `Header.tsx:51` `glass-bar` |
| 5 | Sidebar utilise glass ? | ✅ `Sidebar.tsx:19` `glass-bar` |

============================================================
## 2. Fichiers à modifier

### Pour récupérer le vert forêt en local
- `supabase/migrations/003_seed_tenants.sql` — ne corrige pas
  rétroactivement la DB. Solution : créer un tenant local de
  démo CFS (theme `{}` → fallback `defaultTheme`) ou patcher
  un tenant existant en SQL :
  ```sql
  update tenants set theme = '{}'::jsonb where slug = 'cfs-demo';
  ```
- `scripts/configure-tenant.ts` — vérifier qu'il n'écrase pas
  un theme vide avec un theme client.

### Pour étendre Liquid Glass
- `components/ui/Card.tsx` (si existe) → appliquer `glass-z2`
  comme classe par défaut.
- `components/calendar/*` → wrapper de jour/post en `glass-z1`.
- `components/post-creator/*` → panneau principal `glass-z2`,
  modales `glass-z3`.
- `components/ma-marque/*` → cards sections `glass-z2`.
- Modales globales (si existantes) → `glass-z3 glass-pop-in`.

### Pour neutraliser le dark mode
- `styles/liquid-glass.css:46-51` → soit supprimer le bloc
  (CFS V1 = light only, cohérent avec `--color-background: #FBFAF7`
  hardcodé dans `:root`), soit définir une vraie palette dark
  cohérente. Le mix actuel (theme clair + glass sombre) est un bug.

============================================================
## 3. Plan de correction (3-5 étapes)

1. **Neutraliser le mismatch dark mode** — supprimer le bloc
   `prefers-color-scheme: dark` de `liquid-glass.css` (V1 = light
   only, validé par `00-CONCEPT.md`). 5 min.
2. **Garantir un tenant CFS local** — script ou seed qui crée
   un tenant `cfs-demo` avec `theme = '{}'::jsonb` (→ fallback
   vert forêt par `defaultTheme`). Documenter la procédure
   « se connecter en local en tant que tenant CFS ». 20 min.
3. **Étendre glass aux écrans manquants** — passe systématique
   sur `components/calendar/*`, `components/post-creator/*`,
   `components/ma-marque/*`, `components/ui/*`. Substituer
   `bg-white` / `bg-surface` par `glass-z2` (cards) ou `glass-z1`
   (sub-blocks). 90 min.
4. **Audit visuel manuel page par page** — ouvrir les 4
   destinations en local, valider que Header + Sidebar +
   Cards principales montrent bien le blur + le vert forêt.
   30 min.
5. **Régression : vérifier `prefers-reduced-motion` et
   `prefers-reduced-transparency`** — confirmer que les
   fallbacks fonctionnent côté accessibilité avant push. 15 min.

============================================================
## 4. Estimation totale

**~2 h 40** (un sprint court de demi-journée).

Aucune migration DB destructive. Aucun changement de schema.
Pas de touche à `VOICE_SHEET_RULES` (sacré).

============================================================
## 5. Risques & garde-fous

- **Ne pas modifier `lib/ai/prompts/system.ts`** (cache 90%).
- **Ne pas hardcoder `#1F4937`** dans les composants étendus
  → toujours `var(--color-accent)`.
- **Tester en mode sombre OS et en mode clair OS** après suppression
  du bloc dark mode CSS.
- **Vérifier le port 3001 vs 3000** : tuer les anciens process
  Next avant de tester.
- **Ne rien déployer en prod** tant que les 4 écrans clients
  (angelina/tousentete/comptoir) n'ont pas été validés visuellement
  avec leur theme respectif (le glass doit rester translucide
  par-dessus leur background propre).
