# CAHIER DES CHARGES v2.0 FINAL — Creative Fair Suite

**Version :** 2.0 final définitive (annule et remplace toutes les versions antérieures)
**Date :** 7 mai 2026, 15h00
**Statut :** Source de vérité unique, figée. Aucun ajout possible sans rédaction d'une v2.1.

---

## 1. Thèse produit

Creative Fair est une **creative suite Apple-grade** pour dirigeants de marques établies qui veulent reprendre le contrôle de leur communication digitale sans agence. Le produit s'inspire d'iWork dans son architecture (suite cohérente d'outils unifiés) et d'iOS 26 dans sa direction artistique. Standard de finition : Apple. Verbe central : Publier.

### 1.1 Promesse

*La creative suite des dirigeants de marque.*

### 1.2 Concurrent réel

Une agence de communication payée 2-5K€/mois pour un calendrier éditorial et des contenus prêts à poster.

### 1.3 Modèle de référence

**iWork** pour l'architecture (Pages/Numbers/Keynote dans une coque). **iOS 26** pour la DA visuelle.

---

## 2. Architecture en 2 modes

### 2.1 Bifurcation initiale au login

Après authentification (et après onboarding initial complet pour un nouvel utilisateur), atterrissage sur un **écran d'accueil cérémoniel** avec deux choix :

```
        Que veux-tu faire aujourd'hui ?

   ┌──────────────────┐  ┌──────────────────┐
   │                  │  │                  │
   │    Programme     │  │     Outils       │
   │                  │  │                  │
   │  Suivre mon      │  │  Ouvrir un       │
   │  parcours guidé  │  │  outil ponctuel  │
   │                  │  │                  │
   └──────────────────┘  └──────────────────┘
```

Cet écran est revu à chaque ouverture de l'app. Cérémonial mais court (1 tap).

### 2.2 Toggle persistant

Une fois dans un mode, **toggle pill en haut de la sidebar gauche** permet de basculer entre Programme / Outils sans repasser par l'accueil.

```
[ ◉ Programme ]  [ Outils ]
```

Style : pill segmented control iOS standard, glass-thin, hauteur 32px, font 13px.

### 2.3 Mode 1 — Programme

L'utilisateur suit un parcours guidé : analyse de marque, programme personnalisé sur 4 semaines, calendrier matérialisé, conseiller intégré, création post par post.

Architecture interne du Mode 1 :

- **Mon Programme** (destination unique combinant programme + calendrier en une seule page, avec vue calendrier dedans)
- **Workflow Publier** (entré depuis une carte de post du calendrier)
- **Conseiller intégré** (présent contextuellement dans le programme et la création, sans être un FAB)

### 2.4 Mode 2 — Outils

Catalogue d'outils accessibles directement, sans parcours guidé. Pour utilisateur expert qui sait ce qu'il veut.

Outils v2.0.0 :

1. **Post Creator** (Anecdote Live, Anecdote Custom)
2. **Moodboard**
3. **Variations**
4. **Reviews**
5. **Conseiller** (chat libre sans contexte de programme)

### 2.5 Plug-to-post — pattern transversal

Tous les outils peuvent se brancher sur une carte de post en cours. Pattern Share Sheet iOS standard.

Quand un outil produit un livrable (image, texte corrigé, variantes), un sheet glass-thick s'ouvre proposant : *"Utiliser dans : [Post du 9 mai] [Nouveau post] [Annuler]"*. Tap sur post cible → livrable inséré dans le post → retour au post avec modification appliquée.

---

## 3. Onboarding initial obligatoire

Premier login → parcours d'onboarding obligatoire avant le premier accès à la bifurcation.

### 3.1 Questions onboarding (ordre strict)

**Bloc 1 — Identité (3 questions)**

1. Comment s'appelle ta marque et qu'est-ce qu'elle fait ?
2. À qui s'adresse-t-elle ?
3. Comment décrirais-tu sa voix ?

**Bloc 2 — Calendrier business (4 questions)**

4. Quels sont tes événements récurrents (lancements, ventes, saisonnalité) ?
5. Sur combien de mois veux-tu planifier ?
6. À quelle fréquence publies-tu (3/sem, 5/sem, quotidien) ?
7. Quels jours et heures fonctionnent le mieux pour ton audience ?

**Bloc 3 — Objectifs (3 questions)**

8. Quel est ton objectif principal pour les 3 prochains mois ?
9. Quelles sont tes 3 priorités de contenu (notoriété, vente, communauté…) ?
10. Quel ton dominant pour cette période (intime, expert, festif…) ?

### 3.2 Génération initiale

À la fin des 10 questions, l'IA génère :

- Le **brand book** (à partir du Bloc 1)
- Le **calendrier business** (à partir du Bloc 2)
- Le **programme initial sur 1 mois** (à partir du Bloc 3 + brand book + calendrier business)

Génération en 8-15 secondes. Animation théâtrale Apple-grade pendant l'attente (voir §10.2 Moment Wow).

À l'issue : atterrissage sur la bifurcation Programme / Outils. Première fois dans Mode 1, l'utilisateur voit son programme déjà rempli.

---

## 4. Mode 1 — Programme

### 4.1 Mon Programme — destination unique

Architecture en sections empilées verticalement :

**Section 1 — Hero "Cette semaine"**

- Large title (34px) "Semaine du 5 au 11 mai"
- 3-5 cartes de post horizontales scrollables (style App Store carousel)
- Chaque carte : preview compact, jour, heure, statut (à composer / brouillon / programmé / publié)

**Section 2 — Vue calendrier**

- Calendar grid 4 semaines visibles
- Chaque jour montre dot(s) coloré(s) si post programmé
- Tap sur un jour → sheet glass-thick avec posts du jour ou bouton "Composer pour ce jour"

**Section 3 — Programme narratif**

- Vue arc narratif des 4 semaines à venir
- Semaine 1 : titre + thème ("Présentation de la collection printemps")
- Semaine 2-3-4 : idem
- Tap sur une semaine → expand avec détail des posts

**Section 4 — Bouton "Étendre mon programme"**

- CTA primary : *Créer ma semaine / mon mois / mon trimestre*
- Tap → sheet de génération (voir §4.2)

### 4.2 Sheet "Étendre mon programme"

Sheet glass-thick plein écran. 2-3 questions rapides sur le contexte :

- *"Quelle période veux-tu programmer ?"* → segmented control [Semaine / Mois / Trimestre]
- *"Quel est l'événement marquant de cette période ?"* → input texte ou "Aucun en particulier"
- *"Tonalité dominante ?"* → 3 chips à choisir [Standard / Festif / Sobre]

CTA primary : *"Générer mon programme"*

L'IA génère 5-20 cartes de post (selon période) qui s'insèrent dans le calendrier avec animation cascade Apple-style. Moment Wow §10.2 adapté.

### 4.3 Modification dynamique du programme

Toute carte de post est modifiable de deux manières :

**Modification directe** : tap sur la carte → édition inline (date, heure, angle).

**Modification conversationnelle** : Conseiller intégré qu'on invoque via bouton "Discuter" en haut de la page Mon Programme. Ouverture sheet glass-thick avec chat. L'utilisateur dit *"Décale les posts du week-end à mardi"* ou *"Remplace le post du 9 par une anecdote sur l'atelier"*. L'IA modifie en direct, l'utilisateur voit le programme se réorganiser sous ses yeux.

### 4.4 Workflow Publier (depuis une carte)

Tap sur une carte de post du calendrier → entrée dans le **workflow Publier** détaillé en §10.

---

## 5. Mode 2 — Outils

### 5.1 Page "Mes Outils" (catalogue)

Grid de 5 cards d'outils, layout 2 colonnes desktop / 1 colonne mobile.

Chaque card :

- Hauteur 160px
- Background glass-regular
- Icône SF Symbol 28px en --color-system-blue
- Title : nom de l'outil (Title 2 / 22px)
- Subtitle : description courte (Footnote / 13px / secondary-label)
- Tap → entrée dans l'outil

Catalogue v2.0.0 :

| Outil | Icône SF | Description |
|---|---|---|
| Post Creator | `square.and.pencil` | Composer un post unique |
| Moodboard | `photo.stack` | Adapter un produit à un univers visuel |
| Variations | `square.grid.3x3` | Décliner une image en 6 angles |
| Reviews | `text.magnifyingglass` | Faire relire et ajuster un texte |
| Conseiller | `sparkles` | Discuter avec ton Directeur Comms IA |

### 5.2 Post Creator (outil)

Identique au Post Creator dans le workflow Publier du Mode 1, mais sans contexte de carte de calendrier. L'utilisateur produit un post libre, peut ensuite le programmer ou l'enregistrer en brouillon.

Sous-modules tabs en top :

- Anecdote Live
- Anecdote Custom

### 5.3 Moodboard (outil)

Génération de 3 images conditionnées sur 2 références.

UI :

- Hero : large title "Moodboard"
- Step 1 : *"Choisis ton image DA"* → upload ou sélection bibliothèque
- Step 2 : *"Choisis ton produit"* → upload ou sélection
- CTA primary : *"Générer 3 propositions"*
- Loading state : skeleton de 3 tuiles avec shimmer
- Résultats : 3 images générées, ratio 1:1, gap 12px
- Tap sur une image → sheet plug-to-post (§2.5)

Implémentation : Replicate API + Flux Dev + ControlNet style transfer.

### 5.4 Variations (outil)

Génération de 6 images sous différents angles à partir d'une image source. Conserve grain, couleur, profondeur, texture, contexte.

UI :

- Hero : large title "Variations"
- Step 1 : *"Image source"* → upload
- CTA primary : *"Générer 6 variations"*
- Loading : skeleton 6 tuiles
- Résultats : grid 2×3, ratio 1:1, gap 12px
- Tap sur une image → sheet plug-to-post

Implémentation : Replicate API + Flux Dev + ControlNet pose/depth.

### 5.5 Reviews (outil)

Analyse et modification dynamique d'un texte directement dans le post cible. Vérification factuelle obligatoire.

UI :

- Hero : large title "Reviews"
- Step 1 : sélection de la carte de post à reviewer (sheet plug-source : *"Reviewer le post de [date]"*)
- Vue Review : texte du post avec annotations inline IA
  - Surlignages couleur sur les passages problématiques (clarté, ton, factualité)
  - Bulles glass-regular en marge avec suggestion de réécriture + bouton "Accepter" / "Refuser"
  - Suggestions classées par priorité (factualité d'abord, ton ensuite, clarté enfin)
- CTA primary : *"Tout accepter"* (applique toutes les suggestions) / Bouton secondary *"Voir les sources"* (popover avec liens factuels vérifiés)

Implémentation : Claude Opus 4.7 + web search activé pour factualité + system prompt brand voice.

### 5.6 Conseiller (outil — chat libre)

Chat IA avec Directeur Comms + Task Force d'experts.

UI :

- Hero : large title "Conseiller"
- Sous-titre : *"Ton Directeur Comms et son équipe"*
- Avatar du Directeur Comms IA (cercle, accent, SF Symbol "person.fill")
- Liste des experts disponibles en chips horizontaux scroll : Designer / Stratège éditorial / Copywriter / Brand strategist
- Zone de chat plein écran style iMessage Apple
  - Bulles utilisateur : glass-thin avec accent blue background
  - Bulles assistant : surface elevated avec avatar + nom expert au-dessus
  - Input bar : glass-thin fixed bottom, padding 16, send button circular accent

Quand l'utilisateur invoque un expert : *"Ce sera mieux avec Sarah, mon copywriter"* → l'expert prend la main, son avatar et nom apparaissent.

---

## 6. Conseiller intégré au Mode 1

Pas un FAB. Pas un outil. Une **présence contextuelle** dans le Mode 1 qui se déclenche à des moments précis :

- À l'ouverture de Mon Programme : message d'accueil court ("Cette semaine, tu as 5 posts. On commence par lequel ?")
- Lors de la modification d'une carte : suggestions inline ("Cette date est un samedi, tu veux maintenir ?")
- Lors de la génération d'un programme : récapitulatif final ("J'ai construit 12 posts sur 4 semaines. Tu veux que je t'explique l'arc narratif ?")
- Bouton persistant *"Discuter"* en haut de Mon Programme, qui ouvre un chat dédié avec contexte du programme

Ce Conseiller-intégré et le Conseiller-outil partagent le même backend IA mais des system prompts différents. L'intégré reçoit toujours le contexte programme en plus.

---

## 7. Direction artistique — 100% Apple iOS 26

Section figée. Aucune dérive personnelle.

### 7.1 Référence visuelle absolue

iOS 26 / iPadOS 26. Sources : Notes, Reminders, Music, Photos, Wallet, Mail, Calendar.

Toute décision se justifie par "Apple le fait dans [app native]". Sinon, on ne fait pas.

### 7.2 Palette stricte (couleurs Apple iOS uniquement)

| Token | Mode clair | Usage |
|---|---|---|
| `--color-background` | `#F2F2F7` (System Gray 6) | Fond global |
| `--color-surface-elevated` | `#FFFFFF` | Cards, surfaces solides |
| `--color-surface-grouped` | `#FFFFFF` | Sections de liste |
| `--color-label` | `#000000` | Texte primaire |
| `--color-secondary-label` | `rgba(60,60,67,0.6)` | Texte secondaire |
| `--color-tertiary-label` | `rgba(60,60,67,0.3)` | Texte tertiaire, placeholders |
| `--color-separator` | `rgba(60,60,67,0.29)` | Borders, dividers |
| `--color-system-blue` | `#007AFF` | CTA primaire, liens, états actifs |
| `--color-system-blue-pressed` | `#0051D5` | États pressed |
| `--color-system-red` | `#FF3B30` | Actions destructives |
| `--color-system-green` | `#34C759` | États validés, succès |
| `--color-system-orange` | `#FF9500` | Avertissements |

**Bleu Apple (`#007AFF`) partout pour les CTAs et l'interactivité.** Le vert forêt est définitivement retiré du système d'interface.

### 7.3 Typographie — SF Pro stricte

`-apple-system, system-ui, sans-serif`. Aucun import Google Fonts. Aucun serif.

Échelle iOS HIG stricte (11 tailles) :

| Token | Taille | Weight | Tracking |
|---|---|---|---|
| `--text-caption-2` | 11px | 400 | 0.066 |
| `--text-caption-1` | 12px | 400 | 0 |
| `--text-footnote` | 13px | 400 | -0.08 |
| `--text-subheadline` | 15px | 400 | -0.24 |
| `--text-callout` | 16px | 400 | -0.32 |
| `--text-body` | 17px | 400 | -0.43 |
| `--text-headline` | 17px | 600 | -0.43 |
| `--text-title-3` | 20px | 400 | 0.38 |
| `--text-title-2` | 22px | 400 | 0.35 |
| `--text-title-1` | 28px | 400 | 0.36 |
| `--text-large-title` | 34px | 400 | 0.37 |

Aucune autre taille autorisée.

### 7.4 Espacement — 8pt grid

Échelle stricte : `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`

### 7.5 Radius — squircles iOS

| Token | Valeur | Usage |
|---|---|---|
| `--radius-small` | 6px | Tags, pills petits |
| `--radius-medium` | 10px | Inputs, boutons |
| `--radius-large` | 14px | Cards |
| `--radius-xlarge` | 20px | Sheets, modals top corners |
| `--radius-continuous` | 18px | Squircle iOS (grands éléments) |

### 7.6 Liquid Glass iOS 26 — doctrine stricte

**Le Liquid Glass est utilisé seulement pour les éléments qui se superposent au contenu.** Pas de glass partout.

| Niveau | Background | Blur | Usage |
|---|---|---|---|
| `glass-thin` | `rgba(255,255,255,0.72)` | 20px saturate(180%) | Navigation bars, tab bars, toggle |
| `glass-regular` | `rgba(255,255,255,0.82)` | 30px saturate(180%) | Sheets en standby, popovers |
| `glass-thick` | `rgba(255,255,255,0.92)` | 50px saturate(180%) | Modals, sheets ouverts, plug-to-post |

**Surfaces de contenu = solides.** Cards = `--color-surface-elevated` avec `--shadow-1`. Pas translucides.

**Aucun halo coloré, aucun mesh gradient, aucun blob animé.** Le Liquid Glass iOS 26 fonctionne par contraste avec contenu riche dessous (photos, listes denses, texte). On enrichit le contenu, pas le fond.

### 7.7 Ombres — 3 niveaux

| Token | Valeur |
|---|---|
| `--shadow-1` | `0 1px 3px rgba(0,0,0,0.04)` |
| `--shadow-2` | `0 4px 12px rgba(0,0,0,0.08)` |
| `--shadow-3` | `0 16px 48px rgba(0,0,0,0.16)` |

### 7.8 Animations

**Curves**

- `--ease-out-quart` : `cubic-bezier(0.25, 1, 0.5, 1)` — entrée standard
- `--ease-in-out-quart` : `cubic-bezier(0.76, 0, 0.24, 1)` — bidirectionnel
- `--ease-spring` : `cubic-bezier(0.32, 0.72, 0, 1)` — sheets, modals (approximation spring iOS)

**Durées**

- `--duration-fast` : 200ms (feedback tactile)
- `--duration-medium` : 350ms (transitions standard)
- `--duration-slow` : 500ms (sheets, modals, narratif)

Aucune animation > 500ms. Aucun bounce.

### 7.9 Photographie héro

Sur l'écran d'accueil bifurcation Mode 1 / Mode 2 et sur l'état vide du Programme : **photographie héro pleine largeur**, pas un mockup illustré, pas un dégradé décoratif.

Sources : visuels de la marque, ou fallback stock haute qualité (atelier d'artiste flou, lumière naturelle, palette neutre).

---

## 8. Composants signatures

### 8.1 Bouton primaire

```css
hauteur: 50px
padding: 0 24px
background: --color-system-blue
color: white
font: SF Pro Text 17px weight 600
tracking: -0.43
radius: 14px (continuous)
pressed: background --color-system-blue-pressed, scale 0.97, 150ms ease-out
```

### 8.2 Bouton secondaire

```css
background: transparent
color: --color-system-blue
font: SF Pro Text 17px weight 600
pressed: opacity 0.5, 150ms
```

### 8.3 Card de contenu

```css
background: --color-surface-elevated
radius: 14px continuous
shadow: --shadow-1
padding: 20px
hover: --shadow-2, translateY(-2px), 350ms ease-out-quart
```

### 8.4 Carte de post (programme/calendrier)

Spécifique au programme. Carte plus complexe.

```css
background: --color-surface-elevated
radius: 14px continuous
padding: 16px
hauteur: 120px (compact) ou 240px (expanded avec preview)
contenu:
  - status pill en haut (à composer / brouillon / programmé / publié)
  - jour + heure en title-3
  - extrait texte en body 2 lignes max
  - icône type post en bottom-right (anecdote, événement, etc.)
shadow: --shadow-1
hover: --shadow-2, translateY(-2px)
```

### 8.5 List-style cell (sheet avatar, paramètres)

Pattern iOS Settings strict. Voir cahier précédent §5.4 — inchangé.

### 8.6 Sheet glass-thick

Pattern iOS sheet standard. Voir cahier précédent §5.6 — inchangé.

### 8.7 Toggle segmented control (bascule Programme/Outils)

```css
background: glass-thin
hauteur: 32px
padding: 4px
radius: pill
items: 2 segments égaux
segment actif: background white, shadow-1, color label
segment inactif: transparent, color secondary-label
animation: slide 200ms ease-out-quart
```

### 8.8 Plug-to-post sheet

Sheet glass-thick qui apparaît quand un outil produit un livrable.

```
Title 2: "Utiliser dans :"
Liste-cells:
  - [Post du 9 mai 11h] (avec preview thumbnail)
  - [Post du 12 mai 14h]
  - [Nouveau post]
CTA bas: "Annuler" en ghost
```

---

## 9. Workflow Publier détaillé

### 9.1 Entrée

Tap sur une carte de post du calendrier en Mode 1, ou tap sur "Composer un post" en Mode 2 Post Creator.

Animation : push navigation iOS standard.

### 9.2 Étape Angle (si pas déjà défini)

Si carte issue du calendrier : angle déjà pré-rempli, on saute à l'étape Composition.

Sinon (Post Creator depuis Mode 2) : 3 cards solides verticales pour choisir l'angle.

### 9.3 Étape Composition

Layout :

- **Top** : NavigationBar large title "Composer" + Cancel + Suivant
- **Center** : Card preview du post (visuel + texte)
- **Toolbar inline** : Régénérer / Modifier le ton / Ouvrir Moodboard / Ouvrir Variations / Ouvrir Reviews

Coaching IA dans la card : bulles glass-regular qui apparaissent contextuellement.

### 9.4 Étape Programmation

Sheet glass-thick monte du bas, 70% hauteur.

DatePicker iOS wheel mobile, calendar grid desktop. TimePicker iOS wheel.

CTA primary plein-largeur : "Programmer pour [date] [heure]"

### 9.5 Moment Wow (à voir §10.2)

---

## 10. Moments Wow

### 10.1 Onboarding initial — génération de programme

Après les 10 questions, l'IA génère brand book + calendrier business + programme initial.

Animation pendant les 8-15 secondes :

1. Sheet plein écran avec hero "Construction de ton programme"
2. Phases textuelles séquentielles, fade-in 350ms ease-out-quart :
   - "J'analyse ta voix..."
   - "J'identifie tes territoires..."
   - "Je construis ton calendrier business..."
   - "Je dessine ton arc narratif..."
   - "J'écris tes 12 premiers posts..."
3. Check SF Symbol final, scale 0→1, --color-system-green
4. Title-1 : "Ton programme est prêt"
5. CTA primary : "Découvrir mon programme"

Tap sur CTA → atterrissage Mode 1 avec programme pré-rempli, animation cascade des cartes.

### 10.2 Programmation d'un post unique

Voir cahier précédent §6.6 — inchangé.

### 10.3 Génération d'extension de programme

Tap "Étendre mon programme" → sheet 2-3 questions → CTA "Générer".

Animation :

1. Sheet descend
2. Calendar grid devient visible
3. Cartes de post apparaissent en cascade dans le calendrier, stagger 80ms par carte
4. À la fin : tooltip glass-regular au-dessus de la première nouvelle carte : "12 posts ajoutés. Tu peux ajuster en discutant avec moi."

---

## 11. Périmètre v2.0.0 figé

### 11.1 Inclus

**Modes** : Mode 1 (Programme) + Mode 2 (Outils) + bifurcation au login + toggle persistant

**Onboarding** : 10 questions générant brand book + calendrier business + programme initial 1 mois

**Mon Programme** : page unique avec hero semaine + calendar grid + arc narratif + bouton étendre

**Outils Mode 2** :

- Post Creator (Anecdote Live + Anecdote Custom)
- Moodboard (génération 3 images via Replicate Flux + ControlNet)
- Variations (génération 6 images via Replicate Flux + ControlNet)
- Reviews (Claude Opus + web search factualité + édition inline)
- Conseiller (chat libre Directeur Comms + Task Force)

**Conseiller intégré au Mode 1** (présence contextuelle, bouton "Discuter")

**Plug-to-post** sur tous les outils livrant un artefact

**Workflow Publier** depuis carte de calendrier ou depuis Post Creator

**3 Moments Wow** détaillés en §10

**DA 100% Apple iOS 26** sans dérive

### 11.2 Exclu de v2.0.0 (renvoyé en v2.1+)

- Dark mode
- Brainstorm space (mentionné en passant, pas designé)
- Tablette dédiée (responsive web suffit)
- Notifications push (email seulement)
- Mode hors-ligne
- Halos colorés, mesh gradients, blobs (anti-Apple)
- Vert forêt comme couleur d'interface (anti-Apple)
- Serifs (anti-Apple)
- Sidebar 4 destinations (architecture obsolète)
- BottomNav 4 items (architecture obsolète)
- Page "Mes Outils" comme nav primaire (caché derrière toggle ou avatar)
- Personnalisation thème par tenant (gel jusqu'à V2.1)

---

## 12. Critères d'acceptation 9/10 Apple

Conditions cumulatives. Aucune dérogation.

1. **Toute décision visuelle est justifiable par "Apple le fait dans [app native]"**. Sinon recalée.
2. **Toute couleur est dans la palette §7.2.** Aucune autre.
3. **Toute typographie est SF Pro avec une taille de l'échelle §7.3.** Aucune autre.
4. **Tout glass se justifie par "ça flotte au-dessus de quelque chose".** Si rien dessous, retiré.
5. **60 FPS sur toutes les transitions.** Mesuré DevTools Performance.
6. **Time-to-first-publish ≤ 180 secondes** depuis l'onboarding initial (10 questions + génération + Mode 1 + clic carte + workflow + programmation + Moment Wow). Plus long que single-flow parce qu'il y a l'onboarding profond, mais reste sous 3 minutes.
7. **Les 3 Moments Wow §10 sont pixel-perfect.**
8. **Accessibilité WCAG AA passe.** Contrastes 4.5:1, prefers-reduced-motion respecté, prefers-reduced-transparency respecté.

---

## 13. Découpage en 5 sprints

### Sprint 33 — Foundations Apple-strict (10h)

- Rollback complet du Background animé Chantier 1 (git checkout v1.1.1)
- Suppression Sidebar 4 destinations du DOM
- Suppression BottomNav 4 items
- Suppression toutes couleurs vert forêt de l'interface
- Système typo SF Pro 11 tailles iOS strict (§7.3)
- Système couleurs Apple System Blue strict (§7.2)
- Système glass 3 niveaux Apple (thin/regular/thick) (§7.6)
- Système ombres 3 niveaux (§7.7)
- Composants : Button (primary/secondary), Card, Sheet, NavigationBar, ListCell, ToggleSegmented (§8.1-8.7)
- Tag : v1.2.0

### Sprint 34 — Architecture en 2 modes (10h)

- Écran d'accueil bifurcation Mode 1 / Mode 2
- Toggle persistant Programme / Outils
- Onboarding 10 questions refondu (3 blocs séquentiels)
- Génération initiale brand book + calendrier business + programme 1 mois
- Moment Wow §10.1 (onboarding generation)
- Sheet avatar avec sections (Profil / Ma Marque / Compte)
- Tag : v1.3.0

### Sprint 35 — Mode 1 Programme (12h)

- Page Mon Programme : hero semaine, calendar grid, arc narratif
- Carte de post (composant signature §8.4)
- Sheet "Étendre mon programme" + Moment Wow §10.3
- Conseiller intégré (présence contextuelle + bouton Discuter)
- Workflow Publier depuis carte
- Moment Wow §10.2 (programmation)
- Tag : v1.4.0

### Sprint 36 — Mode 2 Outils (14h)

- Page catalogue Mes Outils
- Post Creator refondu (tabs Anecdote Live / Custom)
- Moodboard (UI + intégration Replicate Flux + ControlNet)
- Variations (UI + intégration Replicate)
- Reviews (UI + intégration Claude Opus + web search + édition inline)
- Conseiller chat libre (chat iMessage-style + Task Force experts)
- Pattern Plug-to-post universel (§2.5, §8.8)
- Tag : v1.5.0

### Sprint 37 — Polish Apple-grade (6h)

- Audit complet typo (toutes tailles strictement §7.3)
- Audit complet couleurs (palette §7.2 uniquement)
- Audit 60 FPS sur toutes transitions
- Audit accessibilité WCAG AA
- Audit copywriting
- Audit responsive
- Tag : v2.0.0

**Total : 52 heures.** 4 sprints exécution + 1 sprint polish.

---

## 14. Validation

Document validé pour exécution. Toute déviation pendant les sprints doit être validée par retour à ce cahier — pas par décision en cours de sprint.

Si un point manque pendant un sprint, stopper le sprint, ouvrir un addendum daté, valider l'addendum, reprendre.

---

## 15. Architecture frontend + nouveaux backends outils

### 15.1 Périmètre de la refonte

Inclus : structure des dossiers `app/`, organisation des routes Next.js, découpage des composants, hooks, state management côté client. Ajout des nouveaux backends pour Moodboard, Variations, Reviews, Programme.

Non touché : schema Supabase existant (`tenants`, `profiles`, `brands`, `posts`, `conversations`, etc.), routes API IA existantes (`/api/ai/coaching`, `/api/ai/chat`, `/api/ai/brand-book`, `/api/ai/post-generation`, `/api/ai/brief`), middlewares auth, RLS, helpers Supabase.

### 15.2 Route groups Next.js par mode produit

L'organisation des routes reflète l'architecture produit en 2 modes. Les route groups isolent les layouts (toggle persistant en Mode 1 et Mode 2, pas de toggle en onboarding et accueil).

```
app/
├── (auth)/
│   └── login/                       # existant, conservé
├── (onboarding)/                    # NOUVEAU
│   ├── layout.tsx                   # layout immersif sans nav
│   └── analyse-marque/
│       └── page.tsx                 # 10 questions en 3 blocs
├── (accueil)/                       # NOUVEAU
│   ├── layout.tsx                   # layout cérémoniel sans toggle
│   └── page.tsx                     # bifurcation Mode 1 / Mode 2
├── (programme)/                     # NOUVEAU — Mode 1
│   ├── layout.tsx                   # toggle persistant Programme/Outils
│   ├── page.tsx                     # Mon Programme
│   └── post/
│       └── [postId]/
│           └── page.tsx             # workflow Publier depuis carte
├── (outils)/                        # NOUVEAU — Mode 2
│   ├── layout.tsx                   # toggle persistant Programme/Outils
│   ├── page.tsx                     # catalogue Mes Outils
│   ├── post-creator/
│   │   └── page.tsx
│   ├── moodboard/
│   │   └── page.tsx
│   ├── variations/
│   │   └── page.tsx
│   ├── reviews/
│   │   └── page.tsx
│   └── conseiller/
│       └── page.tsx
├── (compte)/                        # NOUVEAU
│   ├── layout.tsx                   # layout sheet-style
│   ├── ma-marque/
│   │   ├── page.tsx
│   │   ├── brand-book/
│   │   └── business-calendar/
│   ├── mon-compte/
│   │   └── page.tsx
│   └── parametres/
│       └── page.tsx
└── api/
    ├── ai/                          # existant, conservé
    │   ├── coaching/
    │   ├── chat/
    │   ├── brand-book/
    │   ├── post-generation/
    │   └── brief/
    ├── programme/                   # NOUVEAU
    │   ├── generer/
    │   │   └── route.ts             # génération programme initial 1 mois
    │   └── etendre/
    │       └── route.ts             # extension semaine/mois/trimestre
    └── outils/                      # NOUVEAU
        ├── moodboard/
        │   └── route.ts             # Replicate Flux + ControlNet style
        ├── variations/
        │   └── route.ts             # Replicate Flux + ControlNet pose/depth
        └── reviews/
            └── route.ts             # Claude Opus + web search + suggestions
```

### 15.3 Migration progressive des routes existantes

Les routes existantes en `app/(app)/aujourdhui`, `app/(app)/calendrier`, `app/(app)/ma-marque`, `app/(app)/conseiller`, `app/(app)/post-creator`, `app/(app)/mon-compte` sont progressivement remplacées :

- `(app)/aujourdhui` → supprimé (remplacé par `(accueil)/page.tsx` + `(programme)/page.tsx`)
- `(app)/calendrier` → supprimé (intégré dans `(programme)/page.tsx` comme section)
- `(app)/ma-marque/*` → migré vers `(compte)/ma-marque/*`
- `(app)/conseiller` → migré vers `(outils)/conseiller`
- `(app)/post-creator/[postId]` → migré vers `(programme)/post/[postId]`
- `(app)/mon-compte` → migré vers `(compte)/mon-compte`

Le route group `(app)` est entièrement vidé puis supprimé en fin de Sprint 32.5.

### 15.4 Composants par feature

Réorganisation des composants par fonctionnalité plutôt que par type. Plus lisible quand le produit grossit.

```
components/
├── layout/                          # composants traversaux
│   ├── Toggle.tsx                   # NOUVEAU — toggle Programme/Outils
│   ├── NavigationBar.tsx            # iOS-style nav avec large title
│   ├── Sheet.tsx                    # iOS-style sheet glass-thick
│   └── PlugToPost.tsx               # NOUVEAU — sheet plug universel
├── ui/                              # primitives Apple-strict
│   ├── Button.tsx                   # variants: primary | secondary
│   ├── Card.tsx                     # variants: elevated | grouped
│   ├── ListCell.tsx                 # iOS Settings style
│   ├── DatePicker.tsx               # iOS wheel picker
│   ├── TimePicker.tsx               # iOS wheel picker
│   └── SegmentedControl.tsx         # iOS segmented
├── programme/                       # Mode 1 spécifique
│   ├── HeroSemaine.tsx              # carrousel cartes semaine
│   ├── CalendarGrid.tsx             # grid 4 semaines
│   ├── ArcNarratif.tsx              # vue arc narratif 4 semaines
│   ├── PostCard.tsx                 # carte de post (statut + jour + extrait)
│   ├── ExtendreSheet.tsx            # sheet "Étendre mon programme"
│   └── ConseillerIntegre.tsx        # présence contextuelle Conseiller
├── outils/                          # Mode 2 spécifique
│   ├── catalogue/
│   │   ├── ToolCard.tsx             # card outil dans catalogue
│   │   └── ToolGrid.tsx             # grid 5 outils
│   ├── post-creator/                # composants Post Creator
│   ├── moodboard/                   # composants Moodboard
│   │   ├── ImageUploader.tsx
│   │   ├── ResultGrid.tsx
│   │   └── LoadingShimmer.tsx
│   ├── variations/                  # composants Variations
│   ├── reviews/                     # composants Reviews
│   │   ├── PostSelector.tsx
│   │   ├── InlineReview.tsx         # texte avec annotations
│   │   └── SuggestionBubble.tsx
│   └── conseiller/                  # composants Conseiller chat
│       ├── ChatBubble.tsx
│       ├── ExpertAvatar.tsx
│       └── ExpertChips.tsx
├── workflow/                        # Workflow Publier
│   ├── EtapeAngle.tsx
│   ├── EtapeComposition.tsx
│   └── EtapeProgrammation.tsx
├── onboarding/                      # Onboarding 10 questions
│   ├── BlocIdentite.tsx
│   ├── BlocCalendrier.tsx
│   ├── BlocObjectifs.tsx
│   └── ProgressIndicator.tsx
├── moments/                         # Moments Wow
│   ├── GenerationProgramme.tsx
│   ├── ProgrammationPost.tsx
│   └── ExtensionProgramme.tsx
└── accueil/                         # Bifurcation
    └── ModeBifurcation.tsx
```

### 15.5 Lib/ étendu

```
lib/
├── ai/                              # existant
│   ├── client.ts
│   ├── caching.ts
│   ├── credits.ts
│   ├── brand-context.ts
│   └── prompts/
├── supabase/                        # existant
├── theme/                           # existant (mais palette refondue Apple)
├── replicate/                       # NOUVEAU
│   ├── client.ts                    # client Replicate
│   ├── flux.ts                      # wrapper Flux Dev
│   └── controlnet.ts                # wrapper ControlNet style/pose/depth
├── posts/                           # existant
│   └── actions.ts
├── programme/                       # NOUVEAU
│   ├── generation.ts                # logique arc narratif
│   ├── extension.ts                 # logique extension semaine/mois/trimestre
│   └── prompts.ts                   # prompts génération programme
└── modes/                           # NOUVEAU
    └── store.ts                     # zustand ou context — state Mode 1/2
```

### 15.6 Types/

```
types/
├── tenant.ts                        # existant
├── post.ts                          # NOUVEAU — types Post étendus
├── programme.ts                     # NOUVEAU — types Programme + Arc narratif
├── outils.ts                        # NOUVEAU — types par outil (Moodboard, Variations, Reviews)
├── conseiller.ts                    # NOUVEAU — types chat + experts
└── modes.ts                         # NOUVEAU — types Mode 1/2 + toggle
```

### 15.7 Variables d'environnement à ajouter

```
REPLICATE_API_TOKEN=
REPLICATE_FLUX_MODEL_VERSION=
REPLICATE_CONTROLNET_MODEL_VERSION=
```

### 15.8 Schema Supabase — additions minimales

Aucune table existante n'est modifiée. Ajout d'une table pour stocker les programmes générés :

```sql
create table programmes (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  periode text not null check (periode in ('semaine', 'mois', 'trimestre')),
  arc_narratif jsonb not null,                    -- {semaines: [{theme, posts: [...]}]}
  context_generation jsonb not null,              -- réponses aux questions de génération
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table programmes enable row level security;

create policy "tenant isolation programmes select"
  on programmes for select
  using (tenant_id = public.user_tenant_id());

create policy "tenant isolation programmes insert"
  on programmes for insert
  with check (tenant_id = public.user_tenant_id());

create policy "tenant isolation programmes update"
  on programmes for update
  using (tenant_id = public.user_tenant_id());

create policy "tenant isolation programmes delete"
  on programmes for delete
  using (tenant_id = public.user_tenant_id());
```

### 15.9 Critères d'acceptation Sprint 32.5

- Toute route existante en `(app)/*` est migrée et `(app)` est supprimé
- Tous les composants existants sont déplacés selon §15.4 ou supprimés s'ils ne servent plus
- Les routes API existantes ne sont pas touchées
- `npm run dev` lance l'app sans erreur sur la nouvelle structure
- `npx tsc --noEmit` passe à zéro erreur
- `npm run lint` passe à zéro erreur
- Les pages atterrissent sur des stubs vides (titres + "page en construction") — l'UI est livrée en Sprints 33-36
- La table `programmes` est créée en migration 005
- Les variables d'environnement Replicate sont ajoutées en `.env.example`
- Tag : `v1.1.5`
