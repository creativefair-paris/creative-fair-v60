# Creative Fair v60 — Design System

Sprint 26 a installé le langage **Liquid Glass** (inspiré iOS 26).
Trois niveaux de profondeur, surfaces translucides, animations souples,
accessibilité de premier plan.

## Tokens visuels

Source : `styles/liquid-glass.css`. Variables CSS organisées par
famille.

### Couleurs

Les couleurs sont toutes pilotées par tenant via `--color-*` injectées
sur `<body>` (ou `<div>` racine app) :

- `--color-background` — fond global
- `--color-surface` — surface opaque (fallback si glass non supporté)
- `--color-text` / `--color-text-muted`
- `--color-border`
- `--color-accent` / `--color-accent-fg`
- `--color-error` (rouge constant)

Aucune valeur hexadécimale ne doit être codée en dur dans un
composant. Tout passe par les variables. Le seul cas autorisé est
l'admin (`/admin/*`) qui a son propre thème sombre fixe (#13171B).

### Profondeur Liquid Glass

Trois niveaux. Choisir selon la hiérarchie d'information :

| Niveau | Classe | Usage |
|---|---|---|
| z1 | `.glass-z1` | Chips, sous-cartes, contrôles légers |
| z2 | `.glass-z2` | Cartes principales, sections, sidebars |
| z3 | `.glass-z3` | Modals, popovers, sheets flottantes |

Plus la profondeur monte, plus le blur, l'opacité et l'ombre
augmentent. Ne jamais imbriquer un z3 dans un z3.

### Surfaces dédiées

- `.glass-bar` — header, footer, BottomNav, top bars sticky.
- `.glass-control` — bouton ou élément interactif translucide. Inclut
  une transition hover/active.

### Rayons

`--radius-sm` (6px), `--radius-md` (12px), `--radius-lg` (20px). Les
classes glass-z1/z2 utilisent `radius-md`, glass-z3 utilise
`radius-lg`.

### Animations

Curves :
- `--ease-out-soft` : `cubic-bezier(0.22, 0.61, 0.36, 1)` — entrées
  par défaut, micro-interactions.
- `--ease-in-out-soft` : `cubic-bezier(0.45, 0, 0.2, 1)` — transitions
  bidirectionnelles (toggle).

Durées :
- `--duration-fast` 160ms — feedback immédiat (hover, click).
- `--duration-medium` 280ms — apparitions, modals.
- `--duration-slow` 420ms — transitions structurelles.

Classes utilitaires :
- `.glass-fade-in` — apparition douce (translation 4px + opacity).
- `.glass-pop-in` — apparition pop (scale 0.96 → 1).

## Accessibilité

Trois fallbacks automatiques dans `liquid-glass.css` :

1. **`@supports not backdrop-filter`** — fallback solide
   `var(--color-surface)`. Couvre les anciens navigateurs et certaines
   versions Edge mobiles.
2. **`prefers-reduced-motion: reduce`** — désactive les animations.
3. **`prefers-reduced-transparency: reduce`** — désactive le blur,
   bascule sur surface opaque. Respect de la préférence utilisateur
   iOS/macOS.

Contraste : viser **WCAG AA** (4.5:1 pour le texte, 3:1 pour les
non-textes). Tester chaque thème de tenant. Les couleurs `text` et
`text-muted` sont calibrées pour passer sur `background` ET sur
`surface` translucide.

## Règles d'usage

1. **Ne pas mélanger les niveaux**. Une carte en z2 contient des
   éléments en z1, jamais l'inverse.
2. **Pas de `backdrop-filter` libre** ailleurs. Toujours via les
   classes du système.
3. **Pas de couleurs RGB hardcodées** dans les composants. Sauf
   l'admin qui a son thème dédié.
4. **Animations subtiles**. Préférer 160-280ms à 500ms. Le
   « confiant » est plus calme que le « impressionnant ».
5. **Toujours fournir un fallback** quand on bricole une nouvelle
   surface translucide.

## Composants typiques

### Carte de section

```tsx
<section className="glass-z2 p-6">
  <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
    Aujourd'hui
  </h2>
  …
</section>
```

### Bouton accent

```tsx
<button
  className="glass-control px-4 py-2 text-sm font-medium"
  style={{
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-accent-fg)',
  }}
>
  Continuer
</button>
```

### Modal

```tsx
<div className="fixed inset-0 z-40 flex items-center justify-center p-6">
  <div className="absolute inset-0 bg-black/30" onClick={onClose} />
  <div className="glass-z3 glass-pop-in relative max-w-md w-full p-6">
    …
  </div>
</div>
```

## Limites V1

- Le système n'a pas été appliqué à 100% des composants existants. Les
  pages héritées des sprints 9-21 utilisent encore des `style={{
  backgroundColor: 'var(--color-surface)' }}` parfois en lieu et place
  de `.glass-z2`. Ce n'est pas un bug visible — le rendu reste cohérent
  avec le tenant — mais le polissage progressif est attendu en V2.
- Les animations sont volontairement minimalistes en V1. Une couche
  d'animation choreographiée (Framer Motion) est prévue V2 sur les
  flux Post Creator.
