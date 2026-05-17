# 07-APPS-APPLE-REFERENTES — Analyse détaillée

**Date** : 17 mai 2026  
**Objet** : Référence opérationnelle sur les 7 apps Apple iPadOS 26 utilisées comme socle UI/UX/workflow pour les apps CF.  
**Méthode** : pour chaque app, 5 dimensions (Workflow / Structure UI / Blocs canoniques / Animations / Adaptation CF).

---

## TABLE DE MAPPING APP CF → APP APPLE

| App CF | App Apple référente | Doc section |
|---|---|---|
| Mon Programme | Apple Santé | §1 |
| Calendrier (dock) | Apple Calendar | §2 |
| Rappels (dock) | Apple Reminders | §3 |
| Messages (dock) | iMessage + Contacts (fusionnés) | §4 |
| Compte (dock) | Apple Settings (général) | §5 |
| Bibliothèque | Apple Photos | §6 |
| Ma Marque | Apple Settings (avancé) | §5 (variante) |
| Brief (sous-section) | Apple Notes (pinned note) | §7 |

---

## §1. 🩺 Apple Santé → Mon Programme

### Workflow user
1. Floriane ouvre Santé → arrive sur **Aperçu** (page d'accueil)
2. Voit ses 3-5 cartes **Épinglés** (indicateurs prioritaires)
3. Scrolle pour voir les **Tendances** (insights narratifs)
4. Section **Parcourir** pour explorer toutes les catégories
5. Tap sur une carte → vue détaillée avec graphique temporel + recommandation

### Structure UI iPad
- **3 panes sur iPad** : sidebar gauche (catégories) + middle pane (résumé) + right pane (détail indicateur)
- **Header sticky** : "Aperçu" + date + avatar profil top-right
- **Tab bar bottom** : Aperçu / Partage / Parcourir (shrinks au scroll)

### Blocs canoniques

| Bloc | Specs |
|---|---|
| **Hero header** | Padding 24px, titre 28px bold, sous-titre date 13px gris |
| **Section "Épinglés"** | Eyebrow uppercase 11px + grille cards 2 cols |
| **Indicator card** | Padding 20px, bg Liquid Glass z2, border-radius 22px, hauteur ~140px. Contient : icône colorée 24px, label, valeur (32px bold), tendance ▲▼ avec couleur, sparkline mini 60×24px |
| **Section "Tendances"** | Eyebrow + paragraphe narratif 15px + bouton "Voir plus" |
| **Section "Parcourir"** | Liste de catégories en rows avec icône carrée colorée 28px + label + chevron `›` |
| **Vue détaillée** | Graphique timeline plein largeur + segmented control période + insights AI bullets |
| **Highlight card** | Card avec gradient subtil + titre + valeur + description événement notable |

### Animations
- **Sparklines animées** au chargement (path draw progressive `stroke-dasharray`)
- **Cards Épinglés** : light reflection au hover (specular fake)
- **Tab bar shrink** au scroll → 3 petits ronds Liquid Glass
- **Toggle périodes** (Jour/Semaine/Mois/An) : segmented control thumb glide
- **Transition vers détail** : card zoom plein écran avec spring origin = card position

### Adaptation CF Mon Programme

**Section "Épinglés"** = grille 2×2 avec les 4 indicateurs vitaux validés :

```
┌─────────────┐ ┌─────────────┐
│ Cohérence   │ │ Équilibre   │
│ éditoriale  │ │ piliers     │
│ 87/100  ▲   │ │ ●●●●○       │
│ ▁▃▅▆▇▆▅     │ │ Anec sous   │
└─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐
│ Densité     │ │ Matière     │
│ Régulière   │ │ 3.2×        │
│ ▁▂▃▃▂▃▃     │ │ ▲ +0.4      │
└─────────────┘ └─────────────┘
```

**Section "Tendances"** = audit narratif du jour généré par Hélène M. + recommandations actionables ("Demander à Hélène" / "Ajouter aux Rappels").

**Section "Parcourir"** = catégories d'exploration :
- ▸ Stratégie éditoriale
- ▸ Plan éditorial 90 jours
- ▸ Performance par pilier
- ▸ Cohérence de marque
- ▸ Recommandations stratégiques
- ▸ Audits archivés

---

## §2. 📅 Apple Calendar → Calendrier (dock)

### Workflow user
1. Floriane ouvre Calendar → vue **Semaine** par défaut sur iPad
2. Sidebar gauche montre la liste des calendriers avec couleurs (Publications, Business, Échéances, calendriers tiers)
3. Toggle calendriers ON/OFF pour filtrer la vue
4. Tap sur un événement → popover détail avec edit/delete
5. Tap "+" → nouvel événement avec smart suggestions Apple Intelligence
6. Apple Intelligence détecte event dans Mail/Messages/Screenshots → propose ajout direct

### Structure UI iPad
- **2 panes** : sidebar calendriers (gauche ~240px) + grille principale (droite)
- **Toolbar haute** : Day / Week / Month / Year segmented + flèches nav + "Aujourd'hui" + "+" + recherche
- **Grille week view** : 60px colonne heures gauche + 7 colonnes jours

### Blocs canoniques

| Bloc | Specs |
|---|---|
| **Sidebar calendriers** | Items avec checkbox circulaire colorée 18×18px + nom + count (parfois) |
| **Segmented control vues** | Pills Liquid Glass z2, thumb actif avec shadow |
| **Cell heure** | Height 64px, border-bottom 0.5px |
| **Event block** | Rectangle arrondi 6px, color tint = calendrier, padding 6-8px, title font-weight 600, time 9-10px |
| **Today indicator** | Day number en bleu CF + point dessous |
| **Hour cursor live** | Ligne fine rouge 1.5px horizontale qui indique l'heure actuelle |
| **Event detail popover** | Liquid Glass z3 avec tous les champs |

### Animations
- **Switch vue** Day→Week→Month : morphing fluide entre layouts (durée ~0.4s)
- **Drag event** : pickup scale 1.05 + shadow lift + drop snap à la grille
- **Edge swipe** : navigation jour/semaine précédent/suivant
- **Hour cursor** : update toutes les minutes (animation imperceptible)
- **Popover open** : scale-in depuis event position avec spring

### Adaptation CF Calendrier (dock)

**Sidebar — 3 calendriers internes CF** :
- 🔵 **Publications** (bleu CF) — table `posts`
- 🟣 **Business** (lilas) — table `events` type 'business'
- 🟠 **Échéances** (orange) — table `events` type 'deadline'

**Calendriers tiers connectables** (V2) :
- Google Calendar (Floriane perso ou pro)
- Outlook (équipe)
- iCal subscription URL

**Spécificité events "Publications"** :
- Mini-thumbnail du post Instagram en preview dans le block
- Badge state (`scheduled` / `publishing` / `published` / `failed_manual`)
- Tap → ouvre détail avec preview Instagram + bouton "Modifier" qui ouvre Post Creator

---

## §3. ✓ Apple Reminders → Rappels (dock)

### Workflow user
1. Floriane ouvre Rappels → arrive sur **Aujourd'hui** par défaut
2. Voit ses tâches du jour, peut cocher direct
3. Sidebar gauche montre **Smart Lists** colorées + **Mes Listes** + **Tags**
4. Tap "+" → nouvelle tâche avec quick fields (date, lieu, priorité, tag)
5. Apple Intelligence suggère des reminders depuis Mail/Messages
6. **Columns view** (kanban) optionnel pour les listes

### Structure UI iPad
- **2 panes** : sidebar (~280px) + content principal
- **Sidebar header** : search bar + grid de Smart Lists colorées
- **Smart Lists cards** : icône + label + gros count à droite
- **Sections "Mes Listes"** : items avec icône colorée + nom + count
- **Section "Tags"** : pills cliquables en bas de sidebar
- **Content main** : liste de tâches groupées par sections

### Blocs canoniques

| Bloc | Specs |
|---|---|
| **Smart list card** | Card colorée 2 col grid, icône 22px + label + gros count (28px) |
| **Reminder row** | Checkbox circulaire 22px + texte + meta sous-texte (date/lieu/source list) + chevron détail |
| **Section header** | Texte uppercase 11px letterspacing + ligne séparatrice |
| **New reminder input** | Champ inline avec quick fields buttons (📅 🚩 📍 #️⃣ ⚡) |
| **Detail editor** | Sheet z3 avec : titre, notes, date+heure, lieu, URL, sous-tâches, drapeau, priorité, tag, image |
| **Column view (Kanban)** | Vue alternative : colonnes verticales scrollables horizontalement |

### Animations
- **Tap checkbox** : remplissage cercle avec scale-in du check + fade-out de la tâche (durée ~0.35s)
- **Swipe gauche** : reveal actions (drapeau, suppr) avec rebond élastique
- **New reminder** : input slide-in depuis le bas avec keyboard
- **Section collapse/expand** : chevron rotate + content fold
- **Drag tâche entre sections/colonnes** : pickup scale + drop snap

### Adaptation CF Rappels (dock)

**Smart Lists CF (sidebar)** :
- 🔴 **Aujourd'hui** — tâches du jour
- 🔵 **Programmé** — avec dates
- ⚫ **Tout** — vue complète
- 🟠 **Drapeau** — urgent (manuel)
- 🟣 **Validation requise** — pour Owner seulement (si `review_mode_enabled`)

**Mes Listes CF** :
- 📝 **Publications** — tâches liées à des posts (FK `source_post_id`)
- 📋 **Briefs** — actions sur briefs externes (photographe, designer)
- ✅ **Validation** — drafts à valider
- 💡 **Idées en réserve** — tâches sans date

**Tags CF** :
- #pilierAnecdote, #pilierManifeste, #pilierProduit, #pilierÉvénement
- #urgent, #cette-semaine, #en-attente
- #Carlo, #AngelinaParis, #ComptoirGénéral (si multi-marques V2)

**Source du rappel** :
Sous chaque rappel, badge `Suggéré par Mon Programme` ou `Depuis conv Hélène` (deep-link).

---

## §4. 💬 Apple Messages + Contacts → Messages (dock)

### Workflow user — Messages
1. Floriane ouvre Messages → liste conversations à gauche, conversation active à droite (iPad split)
2. **Pinned conversations** en haut (cercles avatars avec indicateurs)
3. Liste sous les pinned : conversations triées par récence
4. Tap conversation → thread de bulles + composer en bas
5. Tap nom en haut conversation → fiche contact / settings conversation (background, mute, etc.)

### Workflow user — Contacts (sub-app intégrée)
1. Tap "Tous les contacts" dans sidebar Messages → ouvre vue Contacts
2. **3 panes** : sidebar listes + middle contacts alphabétiques + right fiche détail
3. Listes : Doyens IA / Mon Équipe humaine / Collaborateurs externes
4. Tap contact → fiche détail (photo, titre, bio, spécialités, boutons action)
5. Bouton "Message" sur fiche → revient à Messages avec conv ouverte

### Structure UI Messages (iPad)
- **2 panes** : sidebar conversations (~340px) + thread principal
- **Sidebar haut** : titre "Messages" + bouton new + recherche
- **Section Pinned** : grille de cercles avatars 60px (max 9)
- **Section Conversations** : liste avec avatar 44px + nom + preview + timestamp
- **Thread header** : avatar 38px + nom + status (typing/online) + boutons FaceTime/Info
- **Bulles** : bleu sortantes (right), gris/blanc entrantes (left)
- **Composer bottom** : input arrondi + "+" (apps inline) + send circulaire bleu

### Structure UI Contacts (sub-app, 3 panes)
- **Sidebar listes** (~220px) : Tous, Listes (Doyens IA / Mon Équipe / Externes), groupes
- **Middle pane** (~280px) : Liste alphabétique des contacts avec section letters
- **Right pane** : Fiche détail du contact

### Blocs canoniques Messages

| Bloc | Specs |
|---|---|
| **Pinned avatar grid** | Cercles 60px (max 9), indicateur unread bleu, recent reply bubble flotte |
| **Conversation row** | Avatar 44px + name (bold si unread) + preview 13px + time + unread dot |
| **Bulle me** | bg `#007AFF`, color white, border-radius 18px, border-bottom-right-radius 6px, max-width 70% |
| **Bulle them** | bg white avec border 0.5px subtle, color black, mirror radius |
| **Day separator** | Texte centré gris uppercase letterspacing |
| **Typing indicator** | 3 dots animés dans bulle blanche |
| **Quick reactions** | Long-press bulle → row Heart/Like/Dislike/Laugh/Emphasize/Question |
| **Conversation background** | Image/gradient custom appliqué derrière les bulles (perso/marque) |

### Blocs canoniques Contacts

| Bloc | Specs |
|---|---|
| **Contact row** | Photo cercle 44px + nom + subtitle (titre, société) |
| **Section letters** | Headers alphabétiques A, B, C en sidebar middle |
| **Contact detail header** | Photo grande 120px circulaire + nom 28px + titre + boutons Message/Phone/FaceTime/Email |
| **Detail field** | Label uppercase gris + valeur + chevron action |
| **Sections grouped** | Cards arrondies (Phones, Emails, Addresses, Notes, Birthdate) |

### Animations
- **Bulle envoyée** : scale-in depuis composer avec bounce (spring)
- **Bulle reçue** : slide-in depuis le bas avec fade
- **Typing dots** : animation séquentielle bounce
- **Pin/Unpin** : conversation slide vers/depuis la grille pinned avec morphing
- **Long press bulle** : Liquid Glass blur du background + reactions row pop-in
- **Background switch** : crossfade du wallpaper de conversation

### Adaptation CF Messages

**Pinned système (non détachable)** :
- 📌 **Hélène M.** — Directrice de la Communication (avatar gradient lilas→indigo)

**Pinned suggérés (Floriane peut détacher)** :
- Les doyens les plus consultés (apprentissage système)
- Max total : 9 conversations pinned

**Sections sidebar** :
- 📌 Épinglés (Hélène + autres user-pinned)
- 💬 Conversations (récentes)
- 👥 Groupes (multi-doyens, équipes)
- 🗂️ Tous les contacts → ouvre Contacts sub-app

### Adaptation CF Contacts

**Listes** :

| Liste | Contenu |
|---|---|
| **Tous** | Vue complète |
| **Doyens IA** | 12 doyens Task Force (Hélène M. en tête) |
| **Mon Équipe** | Membres humains du tenant (Owner + Editors + Viewers) |
| **Collaborateurs externes** | Photographes, designers, KOL signés, partenaires |

**Fiche détail d'un doyen** (exemple Hélène M.) :
```
┌────────────────────────────────────────┐
│           ┌──────────────┐             │
│           │   Avatar      │             │
│           │   gradient    │             │
│           │   lilas       │             │
│           └──────────────┘             │
│                                        │
│         Hélène Maréchal                │
│   Directrice de la Communication       │
│                                        │
│ [Message]  [Demander un avis]          │
│                                        │
│ ─── SPÉCIALITÉS ────────────────────   │
│ #stratégie  #éditorial  #doctrine      │
│ #curseur-risque  #cohérence            │
│                                        │
│ ─── BIO ──────────────────────────     │
│ Hélène orchestre toutes les décisions  │
│ de communication. Elle tranche en      │
│ dernier ressort sur ce qui vit sur     │
│ le feed organique de la marque.        │
│                                        │
│ ─── À SOLLICITER QUAND ─────────       │
│ • Tu hésites entre 2 angles            │
│ • Tu veux valider la cohérence d'un    │
│   post avec la doctrine                │
│ • Tu reçois un input externe et veux   │
│   savoir s'il s'aligne                 │
│                                        │
│ ─── CONVERSATIONS RÉCENTES ──────      │
│ ▸ Capsule SS25 — 14:32                 │
│ ▸ Pilier Manifeste stratégie — Hier    │
│ ▸ Brief épinglé v2 — 12 mai            │
└────────────────────────────────────────┘
```

**Fiche détail d'un humain (équipe)** :
- Photo + nom + rôle CF (Owner/Editor/Viewer) + titre métier
- Boutons Message + Email
- Section "Permissions" (ce qu'il/elle peut faire)
- Section "Activité récente" (derniers posts publiés, validations en attente)

**Quick replies suggérées** (sous chaque message doyen) :
- 2-3 pills cliquables auto-générées par Claude
- Ex: "Développer cette piste", "Voir des références", "Autres options"

---

## §5. ⚙️ Apple Settings → Compte (dock) + Ma Marque (grille)

### Workflow user Settings
1. Floriane ouvre Réglages → sidebar gauche avec sections + content pane droite
2. **Recherche** en haut de sidebar pour aller direct à un setting
3. **Apple ID card** en tête (avatar + nom)
4. Tap section → content pane affiche détails avec cells
5. Tap cell → soit toggle direct, soit drill-down

### Structure UI iPad
- **2 panes** : sidebar (~280px) + content pane
- **Apple ID card** en tête de sidebar (gradient bg subtil + avatar + nom + subtitle)
- **Search bar** sous la card
- **Groupes** séparés par espaces vides
- **Section nav items** : icône carrée colorée 28px + label + chevron
- **Content pane** : titre grande page + sections grouped cells

### Blocs canoniques

| Bloc | Specs |
|---|---|
| **Hero card** | bg dégradé subtil, avatar 60px, nom + subtitle, tappable, border-radius 14px, padding 16px |
| **Search bar** | Liquid Glass z2, magnifying glass + placeholder, height 36px |
| **Section nav item** | Icône carrée colorée 28-32px + label 14px + value 14px gris + chevron `›`, padding vertical 12px |
| **Grouped cells** | Cards arrondies regroupant 3-8 cells, séparées par border-top 0.5px |
| **Cell standard** | Label gauche + value gris droite + chevron OU toggle |
| **Cell avec subtitle** | Label + subtitle 12px gris en dessous, plus de breathing |
| **Toggle iOS** | Switch vert/gris arrondi 44×26px, animation slide |
| **Slider** | Track Liquid Glass + thumb circulaire 22px |
| **Stepper** | -/+ avec valeur central tappable |

### Animations
- **Drill-down** : sidebar reste, content pane slide-in depuis la droite (durée ~0.3s)
- **Back navigation** : content slide vers la droite avec fade
- **Toggle** : thumb slide + bg color transition (durée ~0.2s)
- **Cell tap** : highlight gris léger avec fade
- **Search expand** : sidebar shrinks pour résultats

### Adaptation CF Compte (dock)

**Hero card** : Avatar Floriane + "Floriane Martin · Brand Manager"

**Sections** :

| Section | Cells |
|---|---|
| 🆔 **Profil** | Nom, photo, email, langue, fuseau horaire |
| 👥 **Équipe** | Liste membres du tenant + rôles + invitations |
| 💳 **Facturation** | Plan actuel, factures, mode de paiement |
| 🔔 **Notifications** | Proactives doyens (on/off par doyen), push, mails |
| 🔐 **Sécurité** | 2FA, sessions actives, password change |
| 🌐 **Confidentialité** | Export données, suppression compte, RGPD |
| 🎨 **Préférences app** | Thème, animations, sons, wallpaper personnel |
| ❓ **Aide et support** | Docs, contact, raccourcis clavier |

### Adaptation CF Ma Marque (grille)

**Hero card** : Logo/avatar marque + "Carlo Sarrabezolles · Marque pilote"

**Sections** :

| Section | Cells |
|---|---|
| 🆔 **Identité** | Nom, secteur, taille, baseline, positionnement, année création |
| 🔊 **Voix** | Ton, vocabulaire autorisé, vocabulaire interdit, exemples |
| 🎨 **Visuel** | Palette couleurs (color picker), typo, références visuelles |
| ▣ **Piliers** | Cartes piliers narratifs + wizard édition (Sonnet 4.6) |
| 📝 **Brief** | Note épinglée (style Apple Notes) — la doctrine |
| 🎯 **Audiences** | Cibles, segments, personas |
| 🏢 **Concurrents** | Cartographie sectorielle, veille |
| 🤝 **Partenaires** | Collaborateurs, fournisseurs, KOL signés |
| 🔗 **Liens** | Site web, réseaux sociaux, drive, archive |
| 🌅 **Wallpaper marque** | Upload photo, choix gradient, default crème CF |

---

## §6. 📚 Apple Photos → Bibliothèque

### Workflow user
1. Floriane ouvre Photos → arrive sur **Library** par défaut (grille chronologique)
2. Sidebar gauche : **Library** / **Collections** / **Albums** auto/manuels / **Utilities**
3. Tap photo → vue détail plein écran avec zoom/swipe
4. Tap **Collections** → vue albums groupés (Personnes, Lieux, Souvenirs, Memories)
5. Recherche sémantique (objets, lieux, dates, contexte)
6. **Memories** : cartes carrousel animées avec photos curated

### Structure UI iPad
- **Sidebar 240px** (figée selon décision CF)
- **Top toolbar** : Years/Months/All toggle + grid size + filter + share + favorite + search
- **Library grid** : photos carrées tightly packed (gap minimal)
- **Collections** : cards plus larges avec preview + label
- **Bottom tab bar** Liquid Glass blob : Library / Collections + Search isolé à droite

### Blocs canoniques

| Bloc | Specs |
|---|---|
| **Photo grid cell** | Square aspect ratio, border-radius 0 (tightly) ou 12-14px (loose), badge status optionnel |
| **Memory card** | Card large 2:1 ou 16:9, overlay gradient bottom, titre cinématique blanc 22-28px |
| **Album card** | Cover photo + nom + count |
| **Sidebar item** | Icône colorée 22px + nom + count droite |
| **Search field** | Bottom-anchored Liquid Glass blob, expandable |
| **Photo detail viewer** | Full screen, swipe L/R, pinch zoom, toolbar bottom |
| **Years/Months/All** | Segmented pill Liquid Glass top center |

### Animations
- **Open photo** : photo cell zoom plein écran avec spring (origin = position grille)
- **Close photo** : reverse zoom back to grid
- **Years zoom** : photo représentative année grande, scroll vers Months puis All (effet zoom in)
- **Grid resize** : pinch out → 1 col, pinch in → 3-4 cols (fluid)
- **Memories** : photos curated zoom/pan en autoplay (Ken Burns effect)
- **Tab bar shrink** : "Library / Collections" devient 2 blobs au scroll

### Adaptation CF Bibliothèque

**Sidebar** :
- 📚 **Bibliothèque** (vue complète)
- 📂 **Collections** :
  - Publications (par mois/année)
  - Inspirations (références externes uploadées)
  - Archives (historique)
  - Souvenirs (memories CF auto-générés)
- 🎯 **Par pilier** : Anecdote / Produit / Manifeste / Événement (avec couleur de pilier)
- 📁 **Albums manuels** : Capsule SS25, Atelier 1922, etc.
- 🗓️ **Souvenirs** : Il y a 1 an, Il y a 3 ans, Same week last year

**Items dans la grille (types polymorphes)** :
- **Photos publiées** (badge "Publié" + stats inline)
- **Photos brouillon** (badge "Brouillon")
- **Photos inspirations** (badge "Inspi" + source)
- **Documents** (PDF, MD, TXT — affichés avec icône type + preview)
- **Voice notes** (V2 — affichées avec waveform mini)
- **Vidéos** (badge "Vidéo" + durée)

**Search sémantique** :
- "Atelier" → toutes les photos de l'atelier (détection objet/lieu)
- "Carrousels janvier" → posts type carrousel mois janvier
- "Pilier Anecdote" → tout ce qui touche ce pilier

**Memories CF auto-générés** :
- "Il y a 1 an dans ta marque — printemps 2025"
- "Same week last year — semaine 20"
- "Ton meilleur post de mai" (basé sur cohérence + engagement qualitatif)

---

## §7. 📝 Apple Notes → Brief (sous-section Ma Marque)

### Workflow user
1. Floriane ouvre Notes → 3 panes sur iPad (folders / notes list / note content)
2. **Pinned notes** apparaissent en haut de la list
3. Tap note → s'ouvre dans le pane droit
4. Toolbar contextuelle haute pour formatting
5. Markdown import/export iOS 26
6. Sidebar folders avec smart folders et tags

### Adaptation CF — pas de 3 panes
Le Brief CF est **une seule note pinned système** dans Ma Marque > Brief. Pas de sidebar de notes multiples — il y a UNE doctrine par marque.

### Structure UI CF Brief
- Layout single pane (la note remplit le content pane de Ma Marque)
- Header : "📌 Brief épinglé · Carlo Sarrabezolles" + "Modifié le 12 mai 2026"
- Bouton "Modifier" top-right
- Body markdown rendu inline (titres bold, listes, citations)

### Blocs canoniques

| Bloc | Specs |
|---|---|
| **Note header** | Titre éditable inline + meta (date modified) |
| **Floating toolbar** | Pills Liquid Glass z2 avec icônes formatting (titles, lists, checkboxes, image) |
| **Heading 1** | 28px bold |
| **Heading 2** | 20px semibold |
| **Heading 3** | 16px semibold |
| **Body** | 15px regular |
| **Inline checklist** | Cercles checkable + texte (strike-through si done) |
| **Citation anchor** | Blockquote stylé avec border-left épais + italique |
| **Quick search bar** | Bottom-anchored iOS 26 |

### Animations
- **Markdown render** : caractères markdown disparaissent à mesure qu'on tape (auto-format)
- **Toolbar morph** : pills morphent selon contexte (text seul / list / drawing)

### Layout Brief CF (exemple)

```
┌─────────────────────────────────────────────────────────┐
│ Ma Marque > Brief                       [Modifier] CS   │
│                                                         │
│ 📌 Brief épinglé · Carlo Sarrabezolles                  │
│ Modifié le 12 mai 2026 · 1 247 mots                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ # Doctrine éditoriale Carlo Sarrabezolles               │
│                                                         │
│ ## Positionnement                                       │
│ Maison de maroquinerie française premium, héritage      │
│ atelier 1922, contemporanéité affirmée.                 │
│                                                         │
│ ## Promesse                                             │
│ « L'élégance précise du métier français »               │
│                                                         │
│ ## Ton de voix                                          │
│ - Lent, sobre, descriptif                               │
│ - Pas d'exclamations, pas d'urgence                     │
│ - Vocabulaire artisanal, technique parfois              │
│ - Évite "iconique", "exceptionnel", "unique"            │
│                                                         │
│ ## Piliers narratifs                                    │
│ 1. **Anecdote** — détails du métier, geste oublié       │
│ 2. **Produit** — pièces, matériaux, choix techniques    │
│ 3. **Manifeste** — pourquoi le métier compte aujourd'hui│
│ 4. **Événement** — capsules, vernissages, partenariats  │
│                                                         │
│ ## Citation anchor                                      │
│ > « Raconter avec la lenteur du métier et la précision  │
│ > du dessin. »                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Citation anchor** est mise en évidence visuellement car c'est elle qui apparaît dans le bandeau Doctrine de l'écran d'accueil.

---

## SYNTHÈSE — Les 12 patterns à reprendre absolument

1. **Status bar iPadOS top** (heure + signal + wifi + battery)
2. **Wallpaper qui teinte tout** (icônes, folders, dock, sidebars)
3. **Sidebar Liquid Glass figée** avec hero card en tête (Apple ID style)
4. **3 panes layout** sur iPad pour Contacts uniquement
5. **Tab bar shrink-on-scroll** (devient Liquid Glass blob) — pattern unifié toutes apps
6. **Pinned section en tête** de liste avec visual hierarchy (avatars larger items)
7. **Smart Lists / Smart Folders** colorées en cards en haut de sidebar
8. **Hero header + Épinglés + Tendances + Parcourir** (pattern Health/Notes)
9. **Cells iOS** avec icône colorée carrée + label + value + chevron
10. **Toggles iOS** verts/gris arrondis
11. **Floating action button** Liquid Glass pill pour actions principales
12. **Detail popover scale-in** depuis origin pour vue détaillée
13. **Bottom search bar** Liquid Glass dans Bibliothèque + Messages + Rappels

---

**FIN DOCUMENT 07-APPS-APPLE-REFERENTES.md**
