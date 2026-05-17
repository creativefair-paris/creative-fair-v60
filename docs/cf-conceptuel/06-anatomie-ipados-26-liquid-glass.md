# 06-ANATOMIE-IPADOS-26-LIQUID-GLASS — Référence design system

**Date** : 17 mai 2026  
**Objet** : Référence technique sur le design system iPadOS 26 Liquid Glass, à appliquer dans toute la phase B mockups + implémentation Sprint 39+.  
**Source** : Apple Newsroom WWDC 2025, Apple HIG, Apple Design Resources, MacRumors, MacStories, AppleInsider, 9to5Mac.

---

## 1. Philosophie du matériau Liquid Glass

### Les 3 piliers conceptuels

**A. Réfraction + Réflexion physiques**  
Liquid Glass = **glassmorphism augmenté**. Pas seulement transparence + blur, mais aussi :
- **Réfraction** : le contenu derrière apparaît subtilement distordu aux bords courbés (comme du vrai verre)
- **Réflexion** : des specular highlights apparaissent aux bords selon l'angle de la lumière virtuelle
- **Chromatic aberration** : légère séparation des couleurs aux bords (effet prisme)

**B. Adaptation contextuelle en temps réel**  
Le matériau lit 3 contextes simultanément :
- **Background** (wallpaper, photos, vidéos derrière)
- **User behavior** (vitesse de scroll, gestes, navigation)
- **Environnement** (light/dark mode, time of day, orientation device)

**C. Content priority absolute**  
Les chrome UI (toolbars, tab bars, sidebars) **shrink au scroll** pour libérer l'espace au contenu. Au scroll back, ils ré-expandent. C'est **la règle d'or** d'iPadOS 26.

---

## 2. Implémentation Liquid Glass en CSS (V1.5 CF)

### Choix architectural CF
**`backdrop-filter: blur()` poussé** — pas refraction physique vraie (WebGL/SVG filters trop coûteux V1.5).

### 3 niveaux Liquid Glass canoniques

```css
/* Niveau z1 — Surfaces ambient (sidebars, widgets passifs) */
.glass-z1 {
  background: rgba(251, 250, 247, 0.55);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.6);
}

/* Niveau z2 — Surfaces interactives (cards, widgets actifs) */
.glass-z2 {
  background: rgba(251, 250, 247, 0.72);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 0.5px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Niveau z3 — Contrôles flottants (popovers, sheets, modals) */
.glass-z3 {
  background: rgba(251, 250, 247, 0.94);
  backdrop-filter: blur(60px) saturate(200%);
  -webkit-backdrop-filter: blur(60px) saturate(200%);
  border: 0.5px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.95);
}
```

### Highlight simulé (specular fake)

```css
.glass-with-highlight::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.18), transparent);
  pointer-events: none;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}
```

### Edge animation (light glint au hover/tilt)

```css
@keyframes liquid-glint {
  0%   { transform: translateX(-100%) rotate(0deg); opacity: 0; }
  50%  { opacity: 0.4; }
  100% { transform: translateX(100%) rotate(0deg); opacity: 0; }
}

.glass-glint::after {
  content: "";
  position: absolute;
  top: 0; left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: liquid-glint 3s ease-in-out infinite;
  pointer-events: none;
}
```

---

## 3. Wallpaper — Le composant fondamental

### Pourquoi c'est critique
Dans iPadOS 26, le wallpaper **n'est pas décoratif**. Il teinte dynamiquement :
- Les icônes d'apps (subtle color bleed)
- Les folders (frosted glass prend la teinte)
- Le dock (transparent, blends into wallpaper)
- Les sidebars Liquid Glass (refractent le wallpaper)
- Les widgets (clear mode = traverse le wallpaper)

### Wallpaper CF — 3 templates V1.5

**A. Crème CF Default** (toutes les nouvelles marques)
```css
.wallpaper-cream-cf {
  background:
    radial-gradient(ellipse 55% 45% at 8% 5%, rgba(255, 235, 200, 0.7), transparent 65%),
    radial-gradient(ellipse 45% 40% at 45% 8%, rgba(180, 205, 245, 0.45), transparent 70%),
    radial-gradient(ellipse 50% 50% at 92% 25%, rgba(220, 200, 245, 0.55), transparent 70%),
    radial-gradient(ellipse 60% 55% at 25% 50%, rgba(255, 215, 200, 0.45), transparent 70%),
    radial-gradient(ellipse 50% 45% at 75% 60%, rgba(200, 230, 220, 0.4), transparent 70%),
    radial-gradient(ellipse 70% 50% at 60% 95%, rgba(255, 215, 180, 0.55), transparent 70%),
    radial-gradient(ellipse 40% 40% at 5% 90%, rgba(195, 205, 240, 0.45), transparent 70%),
    linear-gradient(135deg, #FAF6EE 0%, #F2EADD 50%, #ECE2D0 100%);
}
```

**B. Photo brand uploadée** (V1.5 admin Ma Marque)
- Le tenant uploade une photo (max 3840×2160)
- Le système applique un blur léger + overlay crème 30% pour garantir lisibilité
- Le wallpaper teinte la sidebar et le dock

**C. Gradient custom** (V2)
- Color picker pour 3 couleurs hero
- Mesh gradient auto-généré

### Grain texture (anti-banding)
```css
.wallpaper::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  opacity: 0.5;
  mix-blend-mode: multiply;
  pointer-events: none;
}
```

---

## 4. Status bar iPadOS 26

```html
<div class="statusbar">
  <span class="statusbar-time">14:32</span>
  <div class="statusbar-right">
    <!-- Signal cellulaire -->
    <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
      <path d="M0 7.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-1zm6-2.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5zm6-3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V2z" opacity="0.85"/>
    </svg>
    <!-- Wifi -->
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" stroke="currentColor" stroke-width="1.4">
      <path d="M2 5.5a8 8 0 0 1 12 0M4.5 7.5a5 5 0 0 1 7 0M7 9.5a2.5 2.5 0 0 1 2 0"/>
    </svg>
    <!-- Battery -->
    <svg width="25" height="11" viewBox="0 0 25 11" fill="none">
      <rect x="0.5" y="0.5" width="21" height="10" rx="2.5" stroke="currentColor" stroke-opacity="0.7" stroke-width="1"/>
      <rect x="22.5" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor" fill-opacity="0.4"/>
      <rect x="2" y="2" width="14" height="7" rx="1.5" fill="currentColor" fill-opacity="0.85"/>
    </svg>
  </div>
</div>
```

```css
.statusbar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 32px 0;
  color: rgba(28, 28, 30, 0.85);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.statusbar-time { font-variant-numeric: tabular-nums; }
.statusbar-right { display: flex; align-items: center; gap: 7px; }
```

---

## 5. Grille iPad — Spécifications

### Grille standard iPad 12.9"
- **6 colonnes** en mode Default
- **4 colonnes** en mode Larger Text
- **Spacing entre items** : 16pt
- **Margins écran** : 16pt
- **Hauteur d'un slot** : ~92px (Default), ~120px (Larger)

### Tailles widgets (V1.5 CF)

| Taille | Grid cells | Use case CF |
|---|---|---|
| **Small** | 2×2 | Widget Doctrine du jour (compact) |
| **Medium** | 4×2 | Widget Messages (Hélène pinned + preview) |
| **Large** | 4×4 | Widget Calendrier (semaine) ou Rappels (5 items) |
| **Extra Large** | 4×8 | Widget Mon Programme (4 indicateurs vitaux) — V2 |
| **Extra Large Portrait** | 8×4 | iPad portrait — V2 |

### Règles widgets
- **Margins** 16pt depuis bords du widget (11pt pour layouts graphiques)
- **Small** : single tap target seulement
- **Medium/Large/XL** : multi tap targets (deep-link sections)
- **Placeholder SwiftUI** auto si data pas chargée
- **No technical jargon** : pas de "Last updated X ago"

---

## 6. App icons — Liquid Glass layers

### Spécifications Apple

- Canvas **1024×1024 px PNG fully opaque**
- Pas de transparence dans le master
- Le système applique :
  - Corner radius (continuous, ~22.37% du côté = ~229px sur 1024)
  - Highlights et specular
  - Bevel
- **Safe zone** : éléments essentiels au centre, éviter edges

### 4 modes d'affichage
1. **Default** : couleurs normales
2. **Light Tint** : couleurs claires teintées
3. **Dark Tint** : monochrome sombre teinté
4. **Clear** : transparence totale (le wallpaper traverse)

### Implémentation CF (CSS — pour mockups)

```css
.app-icon {
  width: 76px;
  height: 76px;
  border-radius: 20px; /* ~26% — approximation continuous */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  position: relative;
  overflow: hidden;
}
.app-icon::after {
  /* Highlight top — simulate specular */
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.18), transparent);
  pointer-events: none;
}

/* Gradients par app — angle 165deg pour glossy iPad-style */
.app-icon.programme { background: linear-gradient(165deg, #4DA2FF 0%, #0066D9 100%); }
.app-icon.bibliotheque { background: linear-gradient(165deg, #FFB061 0%, #E07A14 100%); }
.app-icon.marque { background: linear-gradient(165deg, #7B7FF3 0%, #4F46E5 100%); }
.app-icon.compte { background: linear-gradient(165deg, #3D3D40 0%, #1C1C1E 100%); }
.app-icon.calendar { background: linear-gradient(165deg, #FFFFFF 0%, #E5E5E7 100%); /* blanc Apple Calendar */ }
.app-icon.reminders { background: linear-gradient(165deg, #FFFFFF 0%, #F2F2F4 100%); }
.app-icon.messages { background: linear-gradient(165deg, #4FD89E 0%, #10B981 100%); /* vert iMessage */ }
.app-icon.health { background: linear-gradient(165deg, #FFFFFF 0%, #FAFAFA 100%); /* fond blanc + glyphe cœur rouge */ }
```

### Glyph sur fond blanc (Apple Calendar/Reminders/Health style)
Pour les icônes système iPadOS qui ont un fond blanc avec un glyph coloré au centre :
- Background blanc/gris très clair
- Glyph centré (date number, check, cœur) en couleur identitaire
- Calendar : "VEN 16" en rouge
- Reminders : icône Reminders bleue
- Health : cœur rouge

---

## 7. Animations canoniques

### A. Tab bar shrink-on-scroll
```css
.tab-bar {
  transition: transform 0.3s ease, padding 0.3s ease;
}
.tab-bar.scrolled {
  padding: 8px 12px;
  /* transform: scale(0.85); — optional */
}
```

JS pour détecter le scroll :
```js
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > lastScroll && currentScroll > 50) {
    tabBar.classList.add('scrolled');
  } else {
    tabBar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});
```

### B. Modal/Sheet morphing
```css
.sheet {
  transform-origin: var(--origin-x, 50%) var(--origin-y, 50%);
  animation: morph-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes morph-in {
  from { transform: scale(0.05); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
```

JS pour capturer l'origin :
```js
button.addEventListener('click', (e) => {
  const rect = e.target.getBoundingClientRect();
  sheet.style.setProperty('--origin-x', `${rect.left + rect.width/2}px`);
  sheet.style.setProperty('--origin-y', `${rect.top + rect.height/2}px`);
});
```

### C. App icon tap (zoom + fade)
```css
.app-tile { transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); }
.app-tile:hover { transform: translateY(-3px); }
.app-tile:active { transform: scale(0.95); }
```

### D. Light reflection on tilt (V2 — gyroscope iPad)
JavaScript avec DeviceOrientation API — non implémenté V1.5.

### E. Photo cell zoom plein écran (Bibliothèque)
```css
.photo-cell.expanded {
  position: fixed;
  inset: 0;
  z-index: 100;
  animation: photo-zoom 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes photo-zoom {
  from { transform: scale(var(--start-scale, 0.2)); }
  to   { transform: scale(1); }
}
```

### F. Typing indicator (Messages)
```css
.typing-dot {
  width: 6px;
  height: 6px;
  background: var(--text-tertiary);
  border-radius: 50%;
  animation: typing 1.2s ease-in-out infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}
```

### G. Checkbox tap (Rappels)
```css
.reminder-check {
  transition: all 0.2s ease;
}
.reminder-check.done {
  background: var(--orange);
  border-color: var(--orange);
  position: relative;
}
.reminder-check.done::after {
  content: "";
  position: absolute;
  top: 3px; left: 5px;
  width: 4px; height: 8px;
  border: solid white;
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
  animation: check-pop 0.25s cubic-bezier(0.4, 1.6, 0.5, 1);
}
@keyframes check-pop {
  from { transform: rotate(45deg) scale(0); }
  to   { transform: rotate(45deg) scale(1); }
}
```

---

## 8. Typographie SF Pro

### Stack système
```css
:root {
  --font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
  --font-text: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
  --font-mono: ui-monospace, "SF Mono", "Menlo", monospace;
}
```

Sur macOS/iOS → rendu SF Pro natif. Sur Linux/Windows → fallback Helvetica Neue puis sans-serif.

### Hiérarchie (Apple HIG iPadOS 26)

| Token | Size | Weight | Use |
|---|---|---|---|
| `--t-title-xxl` | 52px | 700 | Hero page title (Bonjour Floriane) |
| `--t-title-xl` | 38px | 700 | App title (Ma Marque, Bibliothèque) |
| `--t-title-lg` | 28px | 700 | Section title (L'identité de Carlo) |
| `--t-title-md` | 22px | 600 | Sub-section (Mai 2026, Pinned) |
| `--t-title-sm` | 17px | 600 | Card title |
| `--t-body` | 15px | 400 | Body standard |
| `--t-body-md` | 14px | 400 | Cells, items |
| `--t-caption` | 13px | 500 | Meta, time |
| `--t-micro` | 11px | 600 | Eyebrows, labels uppercase |

### Letter-spacing
- Titles : `-0.02em` à `-0.03em` (negative tracking pour serré)
- Body : `-0.005em` à `0`
- Eyebrows uppercase : `+0.08em` à `+0.1em`

### Numérique tabulaire
Toujours utiliser `font-variant-numeric: tabular-nums` pour :
- Heures (status bar, calendrier)
- Counts (badges, stats)
- Dates numériques
- Indicators (87/100, 3.2×)

---

## 9. Palette de couleurs CF v60 (validée)

```css
:root {
  /* Base — crème nuancée */
  --cream:         #FBFAF7;
  --cream-deeper:  #F5F0EA;
  --cream-deepest: #EEE8DF;
  
  /* Accent primaire — bleu CF (cohérent iOS) */
  --blue-cf:       #007AFF;
  --blue-cf-soft:  #E6F2FF;
  
  /* Secondaires — pastels iPadOS */
  --lilac:         #A78BFA;
  --lilac-soft:    #F0EBFE;
  --indigo:        #6366F1;
  --indigo-soft:   #E8EAFD;
  --orange:        #FB923C;
  --orange-soft:   #FEF1E6;
  --rose:          #F472B6;
  --rose-soft:     #FEEDF6;
  --mint:          #10B981;
  --mint-soft:     #D1FAE5;
  --red:           #FF3B30; /* Apple system red */
  
  /* Texte */
  --text-primary:    #1C1C1E;
  --text-secondary:  #737373;
  --text-tertiary:   #A0A0A0;
  --text-quaternary: #C7C7CC;
  
  /* Bordures */
  --border-faint:    #F0F0F0;
  --border-subtle:   #DBDBDB;
  --border-strong:   #C0C0C0;
}
```

### Couleurs sémantiques CF

| Flux | Couleur | Use |
|---|---|---|
| **Publications** | 🔵 Bleu CF | Posts, action primaire |
| **Business** | 🟣 Lilas | RDV, réunions, équipe |
| **Échéances** | 🟠 Orange | Deadlines, urgents |
| **Validations** | 🟢 Mint | Approved, published |
| **Doyens IA** | 🟣 Lilas/Indigo | Hélène + Task Forces |
| **Crise/Alerte** | 🔴 Red | Bad buzz, échec critique |

### Couleurs sémantiques apps Apple-référentes

| App CF | Couleur identité icône | Cohérence Apple |
|---|---|---|
| Mon Programme (Santé) | Cœur 🔴 sur fond blanc | ✅ Cohérent |
| Calendrier | Date "VEN 16" 🔴 sur fond blanc | ✅ Cohérent |
| Rappels | Icône bleue sur fond blanc | ✅ Cohérent |
| Messages | Bulle blanche sur fond 🟢 vert | ✅ Cohérent |
| Compte (Settings) | Engrenage sur fond gris | ✅ Cohérent |
| Bibliothèque (Photos) | Fleur multicolore | ✅ Cohérent |
| Ma Marque (Settings ★) | Engrenage 🟣 indigo | Variation CF |

---

## 10. Border radius — Système continu

```css
:root {
  --r-xs: 4px;   /* Tags, pills micro */
  --r-sm: 6px;   /* Badges, small buttons */
  --r-md: 10px;  /* Cards small, cells */
  --r-lg: 14px;  /* Cards medium */
  --r-xl: 20px;  /* App icons, cards larges */
  --r-2xl: 24px; /* Widgets, sheets */
  --r-3xl: 32px; /* Hero cards */
  --r-pill: 999px; /* Pills, FAB */
}
```

**Règle Apple HIG iPadOS 26** : les corners doivent être **concentriques** avec le hardware. App icons utilisent un **continuous corner radius** (squircle, pas un simple rounded rectangle).

Pour mockups web : approximation acceptable avec `border-radius: 20px` (vs vrai squircle qui nécessite SVG path).

---

## 11. Shadows — Système iOS 26

```css
:root {
  --shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm:  0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md:  0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg:  0 12px 40px rgba(0, 0, 0, 0.12);
  --shadow-xl:  0 24px 64px rgba(0, 0, 0, 0.16);
  
  /* Shadow inset pour Liquid Glass */
  --shadow-glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
```

App icons utilisent toujours `--shadow-sm` au repos + `--shadow-md` au hover.  
Sheets/Modals utilisent `--shadow-xl`.  
Widgets utilisent `--shadow-sm` + `--shadow-glass-inset`.

---

## 12. Espacement — Système 4

```css
:root {
  --s-1: 4px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 20px;
  --s-6: 24px;
  --s-8: 32px;
  --s-10: 40px;
  --s-12: 48px;
  --s-16: 64px;
  --s-20: 80px;
}
```

**Règle Apple** : tout doit être multiple de 4px. Padding standard cells = 12-16px. Spacing sections = 24-32px. Margins hero = 40-64px.

---

## 13. Dock — Spécifications iPadOS 26

```css
.dock {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(251, 250, 247, 0.45);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 0.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 50;
}

.dock-app {
  width: 60px;
  height: 60px;
  border-radius: 14px;
}
```

**Comportement** :
- Le dock est **fixe en bas centre** sur la page d'accueil
- Sur les autres apps (Calendrier, Messages, etc.) → le dock disparaît (l'app prend toute la viewport)
- Tap sur une app du dock → ouvre l'app correspondante

---

## 14. Accessibilité & contrast

### Issue connue Liquid Glass
Apple a ajouté en **iOS 26.1** un toggle "Tinted" vs "Clear" dans Settings > Display & Brightness pour donner plus d'opacité aux UI elements (problèmes de lisibilité signalés en bêta).

### Application pour CF
- **Mode "Tinted" par défaut** en V1.5 (plus d'opacité, meilleur contrast)
- **Mode "Clear" en option** (V2)
- Toujours **tester en light + dark mode**
- **Contrast minimum WCAG AA** sur text : ratio 4.5:1 pour body, 3:1 pour large text

### Patterns à éviter
- Text en gris très clair sur wallpaper (Liquid Glass blur peut être insuffisant)
- Boutons critiques en Liquid Glass z1 (préférer z2 ou z3 pour contrast)
- Multiple Liquid Glass z3 imbriqués (composite jitter sub-pixel)

---

## 15. Performance — Limites à connaître

### Coût GPU du Liquid Glass
Chaque `backdrop-filter: blur()` force le GPU à :
1. Copier le current screen buffer
2. Appliquer un kernel blur
3. Le recoller

**Limites recommandées** :
- **Max 3 panneaux Liquid Glass actifs simultanément** sur viewport
- Éviter `backdrop-filter` nested
- Préférer `blur(20-32px)` à `blur(60px+)` quand possible
- Tester sur iPad Air baseline (pas seulement iPad Pro M-series)

### Optimisations CF
```css
.glass-z1, .glass-z2, .glass-z3 {
  transform: translateZ(0); /* Hardware promotion */
  will-change: backdrop-filter; /* Hint browser */
}
```

⚠️ N'utiliser `will-change` que si vraiment animé. Sinon overhead inutile.

---

## 16. Cohérence cross-platform

Liquid Glass est unifié sur :
- iOS 26
- iPadOS 26
- macOS Tahoe 26
- watchOS 26
- tvOS 26

Mais avec **adaptations** :
- iOS : compact, tab bar bottom, gestures-first
- iPadOS : sidebars, three-pane possible, keyboard shortcuts, **windowing system** (Stage Manager + resize fluide)
- macOS : menu bar, deep keyboard, multi-windows

Pour CF V1.5, **focus iPadOS** (Floriane utilise iPad). Adaptation iPhone = compact responsive, adaptation Mac = desktop responsive (sidebars + larger panes).

---

**FIN DOCUMENT 06-ANATOMIE-IPADOS-26-LIQUID-GLASS.md**
